const prisma = require('../config/prisma');
const { requestAi } = require('./aiClient');


const parseArray = (value) => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string' && item.trim());
  if (typeof value !== 'string') return [];
  try { return parseArray(JSON.parse(value)); } catch (error) { return []; }
};

const deleteDocumentChunks = (ownerType, ownerId) => prisma.vectorDocument.deleteMany({
  where: { ownerType, ownerId: String(ownerId) },
});

const buildDocumentPayloadForAiService = ({ text, documentType, metadata }) => ({
  text,
  documentType,
  metadata: { ...metadata, ownerType: documentType },
});

const indexDocument = async ({ ownerType, ownerId, title, content, metadata }) => {
  if (!content || !String(content).trim()) return false;
  const response = await requestAi({
    path: '/ai/rag/v2/index-document',
    data: buildDocumentPayloadForAiService({ text: content, documentType: ownerType, metadata }),
    workflow: 'rag',
    validate: (value) => Array.isArray(value?.chunks) && Array.isArray(value?.embeddings),
  });
  const chunks = Array.isArray(response?.chunks) ? response.chunks : [];
  const embeddings = Array.isArray(response?.embeddings) ? response.embeddings : [];
  if (!chunks.length || chunks.length !== embeddings.length) return false;

  const rows = chunks.map((chunk, index) => ({
    ownerType,
    ownerId: String(ownerId),
    title: title || null,
    content: chunk.text,
    embeddingJson: embeddings[index],
    metadataJson: {
      ...metadata,
      ...(chunk.metadata || {}),
      documentId: String(ownerId),
      chunkIndex: chunk.chunkIndex ?? index,
      section: chunk.section || chunk.metadata?.section || 'content',
      embeddingBackend: response.embeddingBackend,
    },
  }));

  await prisma.$transaction([
    prisma.vectorDocument.deleteMany({ where: { ownerType, ownerId: String(ownerId) } }),
    prisma.vectorDocument.createMany({ data: rows }),
  ]);
  return true;
};

const indexStudentCv = async (cv, student) => {
  const analysis = cv.analysisJson || {};
  const skills = parseArray(analysis.detectedSkills).length
    ? parseArray(analysis.detectedSkills)
    : parseArray(analysis.skills);
  const studentName = [student.user?.firstName, student.user?.lastName].filter(Boolean).join(' ');
  return indexDocument({
    ownerType: 'CV', ownerId: cv.id, title: studentName ? `CV - ${studentName}` : `CV etudiant ${student.id}`,
    content: [cv.parsedText || cv.fileName, skills.length ? `Competences: ${skills.join(', ')}` : null].filter(Boolean).join('\n\n'),
    metadata: { sourceType: 'STUDENT_CV', accessScope: 'PRIVATE', userId: student.userId, studentId: student.id, cvId: cv.id, skills },
  });
};

const indexInternshipOffer = async (offer, company) => {
  const requiredSkills = parseArray(offer.requiredSkillsJson || offer.requiredSkills);
  const optionalSkills = parseArray(offer.optionalSkillsJson || offer.optionalSkills);
  return indexDocument({
    ownerType: 'OFFER', ownerId: offer.id, title: `Offre - ${offer.title}`,
    content: [offer.title, offer.description, offer.location && `Lieu: ${offer.location}`, `Competences requises: ${requiredSkills.join(', ')}`, optionalSkills.length && `Competences optionnelles: ${optionalSkills.join(', ')}`, company?.companyName && `Entreprise: ${company.companyName}`].filter(Boolean).join('\n\n'),
    metadata: { sourceType: 'INTERNSHIP_OFFER', accessScope: offer.status === 'PUBLISHED' ? 'PUBLIC' : 'COMPANY_PRIVATE', offerId: offer.id, companyId: company?.id || offer.companyId, companyName: company?.companyName, status: offer.status, skills: [...requiredSkills, ...optionalSkills] },
  });
};

const indexMotivationLetter = async (letter, application) => indexDocument({
  ownerType: 'MOTIVATION_LETTER', ownerId: letter.id, title: `Lettre - ${application.offer.title}`,
  content: letter.content,
  metadata: { sourceType: 'APPLICATION_LETTER', accessScope: 'APPLICATION_PRIVATE', userId: application.student.userId, studentId: application.studentId, companyId: application.offer.companyId, offerId: application.offerId, applicationId: application.id, tone: letter.tone },
});

const indexCareerAdvice = async (advice, student, offer) => indexDocument({
  ownerType: 'CAREER_ADVICE', ownerId: `${student.id}:${offer.id}`, title: `Conseil carriere - ${offer.title}`,
  content: [advice.profileSummary, advice.finalAdvice, ...(advice.actionPlan || [])].filter(Boolean).map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join('\n\n'),
  metadata: { sourceType: 'CAREER_ASSISTANT_OUTPUT', accessScope: 'PRIVATE', userId: student.userId, studentId: student.id, offerId: offer.id, companyId: offer.companyId },
});

const reindexDocument = async (ownerType, ownerId) => {
  if (ownerType === 'CV') {
    const cv = await prisma.cV.findUnique({ where: { id: ownerId }, include: { student: { include: { user: true } } } });
    return cv ? indexStudentCv(cv, cv.student) : false;
  }
  if (ownerType === 'OFFER') {
    const offer = await prisma.internshipOffer.findUnique({ where: { id: ownerId }, include: { company: true } });
    return offer ? indexInternshipOffer(offer, offer.company) : false;
  }
  if (ownerType === 'MOTIVATION_LETTER') {
    const letter = await prisma.motivationLetter.findUnique({ where: { id: ownerId }, include: { application: { include: { student: true, offer: true } } } });
    return letter ? indexMotivationLetter(letter, letter.application) : false;
  }
  return false;
};

const reindexAllDocuments = async () => {
  const [cvs, offers, letters] = await Promise.all([
    prisma.cV.findMany({ include: { student: { include: { user: true } } } }),
    prisma.internshipOffer.findMany({ include: { company: true } }),
    prisma.motivationLetter.findMany({ include: { application: { include: { student: true, offer: true } } } }),
  ]);
  const summary = { processed: 0, indexed: 0, failed: 0 };
  for (const task of [
    ...cvs.map((cv) => () => indexStudentCv(cv, cv.student)),
    ...offers.map((offer) => () => indexInternshipOffer(offer, offer.company)),
    ...letters.map((letter) => () => indexMotivationLetter(letter, letter.application)),
  ]) {
    summary.processed += 1;
    try { if (await task()) summary.indexed += 1; else summary.failed += 1; }
    catch (error) { summary.failed += 1; console.error('RAG reindex item failed:', error.message); }
  }
  return summary;
};

module.exports = { indexStudentCv, indexInternshipOffer, indexMotivationLetter, indexCareerAdvice, deleteDocumentChunks, reindexDocument, reindexAllDocuments, buildDocumentPayloadForAiService };
