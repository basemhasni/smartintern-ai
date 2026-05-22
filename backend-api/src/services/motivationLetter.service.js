const prisma = require('../config/prisma');
const { generateMotivationLetter } = require('./ai.service');

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
  };
};

const formatLetter = (letter) => ({
  id: letter.id,
  applicationId: letter.applicationId,
  tone: letter.tone,
  content: letter.content,
  generatedByAI: letter.generatedByAI,
  createdAt: letter.createdAt,
  updatedAt: letter.updatedAt,
});

const generateLetterForApplication = async (userId, applicationId, payload = {}) => {
  const tone = normalizeTone(payload.tone);
  const student = await getStudentByUserId(userId);
  const application = await getOwnedApplication(student.id, applicationId);
  const cv = await getLatestAnalyzedCV(student.id);
  const candidateSkills = toArray(cv.analysisJson.skills);

  const matchingResult = await prisma.matchingResult.findUnique({
    where: {
      studentId_offerId: {
        studentId: student.id,
        offerId: application.offerId,
      },
    },
  });

  const aiResult = await generateMotivationLetter({
    student: {
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      educationLevel: student.educationLevel,
      targetJob: student.targetJob,
      bio: student.bio,
    },
    candidateSkills,
    offer: {
      title: application.offer.title,
      description: application.offer.description,
      location: application.offer.location,
      duration: application.offer.duration,
      requiredSkills: toArray(application.offer.requiredSkillsJson),
    },
    company: {
      companyName: application.offer.company.companyName,
      sector: application.offer.company.sector,
    },
    matching: buildMatchingPayload(matchingResult),
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
  });

  return formatLetter(letter);
};

const getLetterForApplication = async (userId, applicationId) => {
  const student = await getStudentByUserId(userId);
  await getOwnedApplication(student.id, applicationId);

  const letter = await prisma.motivationLetter.findUnique({
    where: {
      applicationId,
    },
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

  const student = await getStudentByUserId(userId);
  await getOwnedApplication(student.id, applicationId);

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
    },
  });

  return formatLetter(letter);
};

module.exports = {
  generateLetterForApplication,
  getLetterForApplication,
  updateLetterForApplication,
};
