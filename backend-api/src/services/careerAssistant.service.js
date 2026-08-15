const prisma = require('../config/prisma');
const { generateCareerAdvice, matchCandidateWithOffer, toAiHttpError } = require('./ai.service');
const { indexCareerAdvice, searchVectorDocuments } = require('./rag.service');

const DEFAULT_QUESTION = "Analyse mon profil et propose un plan d'amélioration pour cette offre.";

const MAX_QUESTION_LENGTH = 500;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }

  if (typeof value === 'string') {
    try {
      return toArray(JSON.parse(value));
    } catch (error) {
      return [];
    }
  }

  return [];
};

const getStudentByUserId = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!student) {
    throw createHttpError(404, 'Student profile not found');
  }

  return student;
};

const getLatestAnalyzedCV = async (studentId) => {
  const cvs = await prisma.cV.findMany({
    where: { studentId },
    orderBy: {
      uploadedAt: 'desc',
    },
  });
  const cv = cvs.find((studentCV) => studentCV.analysisJson);

  if (!cv || !cv.analysisJson) {
    throw createHttpError(400, 'No analyzed CV found. Please upload a CV first.');
  }

  return cv;
};

const getPublishedOffer = async (offerId) => {
  if (!offerId) {
    throw createHttpError(400, 'offerId is required');
  }

  const normalizedOfferId = String(offerId);

  const offer = await prisma.internshipOffer.findFirst({
    where: {
      id: normalizedOfferId,
      status: 'PUBLISHED',
    },
    include: {
      company: {
        select: {
          companyName: true,
          sector: true,
        },
      },
    },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  return offer;
};

const getOrCreateMatching = async ({
  studentId,
  offer,
  cv,
  candidateSkills,
  requiredSkills,
  optionalSkills,
}) => {
  const existingMatching = await prisma.matchingResult.findUnique({
    where: {
      studentId_offerId: {
        studentId,
        offerId: offer.id,
      },
    },
  });

  const matchingResult = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
    candidateAnalysis: cv.analysisJson || {},
    offerAnalysis: {
      title: offer.title,
      description: offer.description,
      requiredSkills,
      optionalSkills,
    },
    candidateText: cv.parsedText || null,
    offerText: `${offer.title}. ${offer.description || ''}`,
    debug: true,
  });

  if (!matchingResult.success) {
    if (existingMatching) {
      return {
        score: existingMatching.score,
        matchedSkills: toArray(existingMatching.matchedSkillsJson),
        missingSkills: toArray(existingMatching.missingSkillsJson),
        optionalMatchedSkills: toArray(existingMatching.optionalMatchedSkillsJson),
        explanation: existingMatching.explanation,
        confidence: 'LOW',
        decisionLabel: 'INSUFFICIENT_DATA',
        v3: {},
        explainability: {},
      };
    }
    throw toAiHttpError(matchingResult);
  }

  const matching = matchingResult.data;

  await prisma.matchingResult.upsert({
    where: {
      studentId_offerId: {
        studentId,
        offerId: offer.id,
      },
    },
    update: {
      score: matching.score,
      matchedSkillsJson: matching.matchedSkills,
      missingSkillsJson: matching.missingSkills,
      optionalMatchedSkillsJson: matching.optionalMatchedSkills,
      explanation: matching.explanation,
    },
    create: {
      studentId,
      offerId: offer.id,
      score: matching.score,
      matchedSkillsJson: matching.matchedSkills,
      missingSkillsJson: matching.missingSkills,
      optionalMatchedSkillsJson: matching.optionalMatchedSkills,
      explanation: matching.explanation,
    },
  });

  return matching;
};

const buildRagQuery = (offer, requiredSkills, missingSkills) => [
  `Conseils pour ameliorer un profil etudiant pour l'offre ${offer.title}.`,
  requiredSkills.length > 0 ? `Competences requises : ${requiredSkills.join(', ')}.` : null,
  missingSkills.length > 0 ? `Competences manquantes : ${missingSkills.join(', ')}.` : null,
].filter(Boolean).join(' ');

const buildRagContext = async (offer, requiredSkills, missingSkills, userId) => {
  const ragQuery = buildRagQuery(offer, requiredSkills, missingSkills);

  try {
    const documents = await searchVectorDocuments(ragQuery, {
      topK: 5,
      accessContext: { id: userId, role: 'STUDENT' },
    });
    const relevantDocuments = documents.filter((document) => document.score > 0);

    return {
      used: relevantDocuments.length > 0,
      documentsCount: relevantDocuments.length,
      documents: relevantDocuments.map((document) => ({
        id: document.id,
        ownerType: document.ownerType,
        ownerId: document.ownerId,
        title: document.title,
        score: document.score,
        contentPreview: document.contentPreview,
        metadata: document.metadata,
      })),
    };
  } catch (error) {
    console.error('Career assistant RAG search failed:', error.message);

    return {
      used: false,
      documentsCount: 0,
      documents: [],
    };
  }
};

const generateAdvice = async (userId, payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createHttpError(400, 'Request payload must be an object');
  }

  if (!payload.offerId) {
    throw createHttpError(400, 'offerId is required');
  }

  if (payload.question !== undefined && typeof payload.question !== 'string') {
    throw createHttpError(400, 'question must be a string');
  }

  if (payload.question?.trim().length > MAX_QUESTION_LENGTH) {
    throw createHttpError(413, `question must not exceed ${MAX_QUESTION_LENGTH} characters`);
  }

  const question =
    typeof payload.question === 'string' && payload.question.trim().length > 0
      ? payload.question.trim()
      : DEFAULT_QUESTION;

  const student = await getStudentByUserId(userId);
  const cv = await getLatestAnalyzedCV(student.id);
  const offer = await getPublishedOffer(payload.offerId);
  const candidateSkills = toArray(cv.analysisJson.skills);
  const requiredSkills = toArray(offer.requiredSkillsJson);
  const optionalSkills = toArray(offer.optionalSkillsJson);

  if (candidateSkills.length === 0) {
    throw createHttpError(400, 'No candidate skills found in the analyzed CV.');
  }

  const matching = await getOrCreateMatching({
    studentId: student.id,
    offer,
    cv,
    candidateSkills,
    requiredSkills,
    optionalSkills,
  });
  const ragContext = await buildRagContext(offer, requiredSkills, matching.missingSkills, userId);

  const adviceResult = await generateCareerAdvice({
    student: {
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      educationLevel: student.educationLevel,
      targetJob: student.targetJob,
      bio: student.bio,
    },
    candidateSkills,
    offer: {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      requiredSkills,
      optionalSkills,
      companyName: offer.company.companyName,
    },
    matching: {
      score: matching.score,
      matchedSkills: matching.matchedSkills,
      missingSkills: matching.missingSkills,
      optionalMatchedSkills: matching.optionalMatchedSkills || [],
      explanation: matching.explanation || null,
      confidence: matching.confidence || 'LOW',
      decisionLabel: matching.decisionLabel || 'INSUFFICIENT_DATA',
      strengths: matching.strengths || [],
      risks: matching.risks || [],
      recommendations: matching.recommendations || [],
      v3: matching.v3 || {},
      explainability: matching.explainability || {},
    },
    question,
    ragContextDocuments: ragContext.documents,
  });

  if (!adviceResult.success) {
    throw toAiHttpError(adviceResult);
  }

  try {
    await indexCareerAdvice(adviceResult.data, student, offer);
  } catch (error) {
    console.error('Career advice RAG indexing failed:', error.message);
  }

  return {
    careerAdvice: adviceResult.data,
    ragContext: {
      used: ragContext.used,
      documentsCount: ragContext.documentsCount,
      documents: ragContext.documents.map((document) => ({
        id: document.id,
        ownerType: document.ownerType,
        title: document.title,
        score: document.score,
      })),
    },
  };
};

module.exports = {
  generateAdvice,
};
