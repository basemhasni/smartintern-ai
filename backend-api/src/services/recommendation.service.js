const path = require('path');

const prisma = require('../config/prisma');
const { analyzeCV, matchCandidateWithOffer, toAiHttpError } = require('./ai.service');
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
      return toArray(JSON.parse(value));
    } catch (error) {
      return [];
    }
  }

  return [];
};

const parseLimit = (value) => {
  if (value === undefined) {
    return 10;
  }

  const limit = Number.parseInt(value, 10);

  if (Number.isNaN(limit) || limit <= 0) {
    throw createHttpError(400, 'limit must be a positive number');
  }

  return Math.min(limit, 50);
};

const parseMinScore = (value) => {
  if (value === undefined) {
    return 0;
  }

  const minScore = Number.parseInt(value, 10);

  if (Number.isNaN(minScore) || minScore < 0 || minScore > 100) {
    throw createHttpError(400, 'minScore must be a number between 0 and 100');
  }

  return minScore;
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
    return candidateSkills;
  }

  const relativeFilePath = cv.fileUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '../../', relativeFilePath);
  const parsedText = await extractTextFromCV(filePath, cv.fileType);
  const analysisResult = await analyzeCV(parsedText);

  if (!analysisResult.success) {
    throw toAiHttpError(analysisResult);
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

  return toArray(updatedCV.analysisJson.skills);
};

const saveMatchingResult = async (studentId, offerId, matching) => {
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
};

const buildFallbackMatching = (explanation) => ({
  score: 0,
  matchedSkills: [],
  missingSkills: [],
  optionalMatchedSkills: [],
  explanation,
});

const buildRecommendation = async (studentId, candidateSkills, offer) => {
  const requiredSkills = toArray(offer.requiredSkillsJson);
  const optionalSkills = toArray(offer.optionalSkillsJson);

  if (requiredSkills.length === 0) {
    const matching = buildFallbackMatching('No required skills found for this offer.');
    await saveMatchingResult(studentId, offer.id, matching);
    return {
      recommendation: {
        offer: {
          id: offer.id,
          title: offer.title,
          location: offer.location,
          duration: offer.duration,
          company: offer.company,
        },
        matching,
      },
      aiFailed: false,
    };
  }

  const matchingResult = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
  });

  if (!matchingResult.success) {
    return {
      recommendation: {
        offer: {
          id: offer.id,
          title: offer.title,
          location: offer.location,
          duration: offer.duration,
          company: offer.company,
        },
        matching: buildFallbackMatching('This offer could not be matched automatically.'),
      },
      aiFailed: true,
      aiError: matchingResult,
    };
  }

  const matching = {
    score: matchingResult.data.score,
    matchedSkills: matchingResult.data.matchedSkills || [],
    missingSkills: matchingResult.data.missingSkills || [],
    optionalMatchedSkills: matchingResult.data.optionalMatchedSkills || [],
    explanation: matchingResult.data.explanation || null,
    confidence: matchingResult.data.confidence || 'LOW',
    decisionLabel: matchingResult.data.decisionLabel || 'INSUFFICIENT_DATA',
    v3: matchingResult.data.v3 || {},
    explainability: matchingResult.data.explainability || {},
  };

  await saveMatchingResult(studentId, offer.id, matching);

  return {
    recommendation: {
      offer: {
        id: offer.id,
        title: offer.title,
        location: offer.location,
        duration: offer.duration,
        company: offer.company,
      },
      matching,
    },
    aiFailed: false,
  };
};

const getStudentRecommendations = async (userId, query) => {
  const limit = parseLimit(query.limit);
  const minScore = parseMinScore(query.minScore);
  const student = await getStudentByUserId(userId);
  const cv = await getLatestAnalyzedCV(student.id);
  const candidateSkills = await refreshCVAnalysisIfNeeded(cv);

  if (candidateSkills.length === 0) {
    throw createHttpError(400, 'No candidate skills found in the analyzed CV.');
  }

  const offers = await prisma.internshipOffer.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          sector: true,
        },
      },
    },
  });

  const results = await Promise.all(
    offers.map((offer) => buildRecommendation(student.id, candidateSkills, offer))
  );
  const successfulMatches = results.filter((result) => !result.aiFailed).length;

  if (offers.length > 0 && successfulMatches === 0) {
    throw toAiHttpError(results.find((result) => result.aiError)?.aiError);
  }

  const recommendations = results
    .map((result) => result.recommendation)
    .filter((recommendation) => recommendation.matching.score >= minScore)
    .sort((first, second) => second.matching.score - first.matching.score)
    .slice(0, limit);

  return recommendations;
};

module.exports = {
  getStudentRecommendations,
};
