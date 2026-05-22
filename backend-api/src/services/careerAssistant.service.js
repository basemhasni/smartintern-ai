const prisma = require('../config/prisma');
const { generateCareerAdvice, matchCandidateWithOffer } = require('./ai.service');

const DEFAULT_QUESTION = "Analyse mon profil et propose un plan d'amélioration pour cette offre.";

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

const getOrCreateMatching = async (studentId, offerId, candidateSkills, requiredSkills, optionalSkills) => {
  const existingMatching = await prisma.matchingResult.findUnique({
    where: {
      studentId_offerId: {
        studentId,
        offerId,
      },
    },
  });

  if (existingMatching) {
    return {
      score: existingMatching.score,
      matchedSkills: toArray(existingMatching.matchedSkillsJson),
      missingSkills: toArray(existingMatching.missingSkillsJson),
    };
  }

  const matchingResult = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
  });

  if (!matchingResult.success) {
    throw createHttpError(503, 'AI service is currently unavailable.');
  }

  const matching = {
    score: matchingResult.data.score,
    matchedSkills: matchingResult.data.matchedSkills || [],
    missingSkills: matchingResult.data.missingSkills || [],
    optionalMatchedSkills: matchingResult.data.optionalMatchedSkills || [],
    explanation: matchingResult.data.explanation || null,
  };

  await prisma.matchingResult.upsert({
    where: {
      studentId_offerId: {
        studentId,
        offerId,
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
      offerId,
      score: matching.score,
      matchedSkillsJson: matching.matchedSkills,
      missingSkillsJson: matching.missingSkills,
      optionalMatchedSkillsJson: matching.optionalMatchedSkills,
      explanation: matching.explanation,
    },
  });

  return matching;
};

const generateAdvice = async (userId, payload) => {
  if (!payload.offerId) {
    throw createHttpError(400, 'offerId is required');
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

  const matching = await getOrCreateMatching(
    student.id,
    offer.id,
    candidateSkills,
    requiredSkills,
    optionalSkills
  );

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
    },
    question,
  });

  if (!adviceResult.success) {
    throw createHttpError(503, 'AI service is currently unavailable.');
  }

  return adviceResult.data;
};

module.exports = {
  generateAdvice,
};
