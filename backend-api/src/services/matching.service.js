const path = require('path');

const prisma = require('../config/prisma');
const { analyzeCV, matchCandidateWithOffer } = require('./ai.service');
const { extractTextFromCV } = require('./cv-text.service');

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
      const parsed = JSON.parse(value);
      return toArray(parsed);
    } catch (error) {
      return [];
    }
  }

  return [];
};

const getStudentByUserId = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw createHttpError(404, 'Student profile not found');
  }

  return student;
};

const getLatestAnalyzedCV = async (studentId) => {
  const cvs = await prisma.cV.findMany({
    where: {
      studentId,
    },
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

const refreshCVAnalysisIfNeeded = async (cv) => {
  let candidateSkills = toArray(cv.analysisJson.skills);

  if (candidateSkills.length > 0) {
    return {
      cv,
      candidateSkills,
    };
  }

  const relativeFilePath = cv.fileUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '../../', relativeFilePath);
  const parsedText = await extractTextFromCV(filePath, cv.fileType);
  const analysisResult = await analyzeCV(parsedText);

  if (!analysisResult.success) {
    throw createHttpError(500, 'AI service unavailable. Please make sure ai-service is running.');
  }

  const updatedCV = await prisma.cV.update({
    where: {
      id: cv.id,
    },
    data: {
      parsedText,
      analysisJson: analysisResult.data,
    },
  });

  candidateSkills = toArray(updatedCV.analysisJson.skills);

  return {
    cv: updatedCV,
    candidateSkills,
  };
};

const calculateOfferMatch = async (userId, offerId) => {
  const student = await getStudentByUserId(userId);

  const offer = await prisma.internshipOffer.findFirst({
    where: {
      id: offerId,
      status: 'PUBLISHED',
    },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  const cv = await getLatestAnalyzedCV(student.id);
  const { candidateSkills } = await refreshCVAnalysisIfNeeded(cv);
  const requiredSkills = toArray(offer.requiredSkillsJson);
  const optionalSkills = toArray(offer.optionalSkillsJson);

  if (candidateSkills.length === 0) {
    throw createHttpError(400, 'No candidate skills found in the analyzed CV.');
  }

  if (requiredSkills.length === 0) {
    throw createHttpError(400, 'No required skills found for this offer.');
  }

  const matchingResult = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
  });

  if (!matchingResult.success) {
    throw createHttpError(500, 'AI service unavailable. Please make sure ai-service is running.');
  }

  const matching = matchingResult.data;

  await prisma.matchingResult.upsert({
    where: {
      studentId_offerId: {
        studentId: student.id,
        offerId,
      },
    },
    update: {
      score: matching.score,
      matchedSkillsJson: matching.matchedSkills || [],
      missingSkillsJson: matching.missingSkills || [],
      optionalMatchedSkillsJson: matching.optionalMatchedSkills || [],
      explanation: matching.explanation || null,
    },
    create: {
      studentId: student.id,
      offerId,
      score: matching.score,
      matchedSkillsJson: matching.matchedSkills || [],
      missingSkillsJson: matching.missingSkills || [],
      optionalMatchedSkillsJson: matching.optionalMatchedSkills || [],
      explanation: matching.explanation || null,
    },
  });

  return {
    score: matching.score,
    matchedSkills: matching.matchedSkills || [],
    missingSkills: matching.missingSkills || [],
    optionalMatchedSkills: matching.optionalMatchedSkills || [],
    explanation: matching.explanation || null,
  };
};

module.exports = {
  calculateOfferMatch,
};
