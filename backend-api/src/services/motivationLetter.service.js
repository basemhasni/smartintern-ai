const prisma = require('../config/prisma');
const { generateMotivationLetter, matchCandidateWithOffer } = require('./ai.service');
const { indexMotivationLetter, searchVectorDocuments } = require('./rag.service');

const TONES = ['PROFESSIONAL', 'DYNAMIC', 'SIMPLE'];

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

const normalizeTone = (tone) => {
  const normalizedTone = tone || 'PROFESSIONAL';

  if (!TONES.includes(normalizedTone)) {
    throw createHttpError(400, 'tone must be PROFESSIONAL, DYNAMIC, or SIMPLE');
  }

  return normalizedTone;
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

const getOwnedApplication = async (studentId, applicationId) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      offer: {
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              sector: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw createHttpError(404, 'Application not found');
  }

  if (application.studentId !== studentId) {
    throw createHttpError(403, 'Application does not belong to this student');
  }

  return application;
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

const buildMatchingPayload = (matchingResult) => {
  if (!matchingResult) {
    return null;
  }

  return {
    score: matchingResult.score,
    matchedSkills: toArray(matchingResult.matchedSkillsJson),
    missingSkills: toArray(matchingResult.missingSkillsJson),
    optionalMatchedSkills: toArray(matchingResult.optionalMatchedSkillsJson),
    explanation: matchingResult.explanation || null,
    confidence: 'LOW',
    decisionLabel: 'INSUFFICIENT_DATA',
    v3: {},
    explainability: {},
  };
};

const MAX_LETTER_LENGTH = 10_000;
const LETTER_RELATIONS = {
  offer: {
    select: {
      id: true,
      title: true,
      location: true,
      status: true,
      company: {
        select: {
          id: true,
          companyName: true,
          sector: true,
        },
      },
    },
  },
  application: {
    select: {
      id: true,
      status: true,
      appliedAt: true,
      updatedAt: true,
    },
  },
};

const formatLetter = (letter, generationDetails = null) => ({
  id: letter.id,
  applicationId: letter.applicationId,
  studentId: letter.studentId,
  offerId: letter.offerId,
  tone: letter.tone,
  content: letter.content,
  generatedByAI: letter.generatedByAI,
  createdAt: letter.createdAt,
  updatedAt: letter.updatedAt,
  ...(letter.offer ? {
    offer: {
      id: letter.offer.id,
      title: letter.offer.title,
      location: letter.offer.location,
      status: letter.offer.status,
      company: letter.offer.company,
    },
  } : {}),
  ...(letter.application ? { application: letter.application } : {}),
  ...(generationDetails ? { v2: generationDetails } : {}),
});

const listLettersForStudent = async (userId) => {
  const student = await getStudentByUserId(userId);
  const letters = await prisma.motivationLetter.findMany({
    where: { studentId: student.id },
    include: LETTER_RELATIONS,
    orderBy: { updatedAt: 'desc' },
  });

  return letters.map((letter) => formatLetter(letter));
};

const buildLetterRagContext = async (application, missingSkills, userId) => {
  try {
    const query = [
      `Lettre de motivation pour ${application.offer.title}.`,
      application.offer.company.companyName,
      missingSkills.length ? `Competences a traiter prudemment: ${missingSkills.join(', ')}.` : null,
    ].filter(Boolean).join(' ');
    const documents = await searchVectorDocuments(query, { topK: 3, accessContext: { id: userId, role: 'STUDENT' } });
    return documents.filter((document) => document.score > 0).map((document) => ({
      id: document.id,
      ownerType: document.ownerType,
      title: document.title,
      score: document.score,
      contentPreview: document.contentPreview,
      metadata: document.metadata,
    }));
  } catch (error) {
    console.error('Motivation letter RAG search failed:', error.message);
    return [];
  }
};

const generateLetterForApplication = async (userId, applicationId, payload = {}) => {
  const tone = normalizeTone(payload.tone);
  const student = await getStudentByUserId(userId);
  const application = await getOwnedApplication(student.id, applicationId);
  const cv = await getLatestAnalyzedCV(student.id);
  const candidateSkills = toArray(cv.analysisJson.detectedSkills).length
    ? toArray(cv.analysisJson.detectedSkills)
    : toArray(cv.analysisJson.skills);
  const requiredSkills = toArray(application.offer.requiredSkillsJson);
  const optionalSkills = toArray(application.offer.optionalSkillsJson);

  const matchingResult = await prisma.matchingResult.findUnique({
    where: {
      studentId_offerId: {
        studentId: student.id,
        offerId: application.offerId,
      },
    },
  });

  const legacyMatching = buildMatchingPayload(matchingResult);
  const refreshedMatching = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
    candidateAnalysis: cv.analysisJson || {},
    offerAnalysis: {
      title: application.offer.title,
      description: application.offer.description,
      requiredSkills,
      optionalSkills,
    },
    candidateText: cv.parsedText || null,
    offerText: `${application.offer.title}. ${application.offer.description || ''}`,
    debug: true,
  });
  const matchingContext = refreshedMatching.success ? refreshedMatching.data : legacyMatching;
  const ragContextDocuments = await buildLetterRagContext(
    application,
    matchingContext?.v3?.missingRequiredSkills || matchingContext?.missingSkills || [],
    userId,
  );

  const aiResult = await generateMotivationLetter({
    student: {
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      educationLevel: student.educationLevel,
      targetJob: student.targetJob,
      bio: student.bio,
      location: student.location,
    },
    candidateSkills,
    cvAnalysis: cv.analysisJson || {},
    offer: {
      title: application.offer.title,
      description: application.offer.description,
      location: application.offer.location,
      duration: application.offer.duration,
      requiredSkills,
      optionalSkills,
    },
    offerAnalysis: {
      title: application.offer.title,
      description: application.offer.description,
      requiredSkills,
      optionalSkills,
    },
    company: {
      companyName: application.offer.company.companyName,
      sector: application.offer.company.sector,
    },
    matching: legacyMatching,
    matchingResult: matchingContext || {},
    applicationMessage: application.message || null,
    ragContextDocuments,
    tone,
  });

  if (!aiResult.success || !aiResult.data?.content) {
    throw createHttpError(500, 'Motivation letter generation failed. Please make sure ai-service is running.');
  }

  const letter = await prisma.motivationLetter.upsert({
    where: {
      applicationId,
    },
    update: {
      tone,
      content: aiResult.data.content,
      generatedByAI: true,
    },
    create: {
      applicationId,
      studentId: student.id,
      offerId: application.offerId,
      tone,
      content: aiResult.data.content,
      generatedByAI: true,
    },
    include: LETTER_RELATIONS,
  });

  try {
    await indexMotivationLetter(letter, { ...application, student });
  } catch (error) {
    console.error('Motivation letter RAG indexing failed:', error.message);
  }

  return formatLetter(letter, aiResult.data.v2 || null);
};

const getLetterForApplication = async (userId, applicationId) => {
  const student = await getStudentByUserId(userId);
  const application = await getOwnedApplication(student.id, applicationId);

  const letter = await prisma.motivationLetter.findUnique({
    where: {
      applicationId,
    },
    include: LETTER_RELATIONS,
  });

  if (!letter) {
    throw createHttpError(404, 'No motivation letter found for this application.');
  }

  return formatLetter(letter);
};

const updateLetterForApplication = async (userId, applicationId, payload) => {
  if (!payload.content || typeof payload.content !== 'string' || payload.content.trim().length === 0) {
    throw createHttpError(400, 'content is required');
  }

  if (payload.content.length > MAX_LETTER_LENGTH) {
    throw createHttpError(413, `content must not exceed ${MAX_LETTER_LENGTH} characters`);
  }

  const student = await getStudentByUserId(userId);
  const application = await getOwnedApplication(student.id, applicationId);

  const existingLetter = await prisma.motivationLetter.findUnique({
    where: {
      applicationId,
    },
  });

  if (!existingLetter) {
    throw createHttpError(404, 'No motivation letter found for this application.');
  }

  const letter = await prisma.motivationLetter.update({
    where: {
      applicationId,
    },
    data: {
      content: payload.content.trim(),
      generatedByAI: false,
    },
    include: LETTER_RELATIONS,
  });

  try {
    await indexMotivationLetter(letter, { ...application, student });
  } catch (error) {
    console.error('Motivation letter RAG indexing failed:', error.message);
  }

  return formatLetter(letter);
};

module.exports = {
  listLettersForStudent,
  generateLetterForApplication,
  getLetterForApplication,
  updateLetterForApplication,
};
