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
      return toArray(JSON.parse(value));
    } catch (error) {
      return [];
    }
  }

  return [];
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

const parseIncludeWithoutCV = (value) => {
  if (value === undefined) {
    return true;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw createHttpError(400, 'includeWithoutCV must be true or false');
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

const getCompanyByUserId = async (userId) => {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    throw createHttpError(404, 'Company profile not found');
  }

  return company;
};

const getCompanyOffer = async (companyId, offerId) => {
  if (!offerId || typeof offerId !== 'string' || !isUuid(offerId)) {
    throw createHttpError(400, 'offerId must be a valid UUID');
  }

  const offer = await prisma.internshipOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  if (offer.companyId !== companyId) {
    throw createHttpError(403, 'Offer does not belong to this company');
  }

  return offer;
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

  return cvs.find((cv) => cv.analysisJson) || null;
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
    return [];
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
  try {
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
  } catch (error) {
    console.error('Failed to save matching result:', error.message);
  }
};

const buildStudentPayload = (student) => ({
  id: student.id,
  firstName: student.user.firstName,
  lastName: student.user.lastName,
  email: student.user.email,
  phone: student.phone,
  location: student.location,
  educationLevel: student.educationLevel,
  targetJob: student.targetJob,
});

const buildCandidateRanking = async (application, offerSkills) => {
  const { offer, requiredSkills, optionalSkills } = offerSkills;
  const student = application.student;
  const cv = await getLatestAnalyzedCV(student.id);

  const baseCandidate = {
    rank: null,
    applicationId: application.id,
    applicationStatus: application.status,
    appliedAt: application.appliedAt,
    student: buildStudentPayload(student),
    withoutCV: false,
  };

  if (!cv) {
    return {
      ...baseCandidate,
      withoutCV: true,
      matching: {
        score: 0,
        matchedSkills: [],
        missingSkills: requiredSkills,
        optionalMatchedSkills: [],
        explanation: 'No analyzed CV found for this candidate',
      },
    };
  }

  const candidateSkills = await refreshCVAnalysisIfNeeded(cv);

  if (candidateSkills.length === 0) {
    return {
      ...baseCandidate,
      matching: {
        score: 0,
        matchedSkills: [],
        missingSkills: requiredSkills,
        optionalMatchedSkills: [],
        explanation: 'No candidate skills found in the analyzed CV',
      },
    };
  }

  if (requiredSkills.length === 0) {
    return {
      ...baseCandidate,
      matching: {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        optionalMatchedSkills: [],
        explanation: 'No required skills found for this offer',
      },
    };
  }

  const matchingResult = await matchCandidateWithOffer({
    candidateSkills,
    requiredSkills,
    optionalSkills,
  });

  if (!matchingResult.success) {
    return {
      ...baseCandidate,
      matching: {
        score: 0,
        matchedSkills: [],
        missingSkills: requiredSkills,
        optionalMatchedSkills: [],
        explanation: 'Candidate could not be matched automatically',
      },
    };
  }

  const matching = {
    score: matchingResult.data.score,
    matchedSkills: matchingResult.data.matchedSkills || [],
    missingSkills: matchingResult.data.missingSkills || [],
    optionalMatchedSkills: matchingResult.data.optionalMatchedSkills || [],
    explanation: matchingResult.data.explanation || null,
  };

  await saveMatchingResult(student.id, offer.id, matching);

  return {
    ...baseCandidate,
    matching,
  };
};

const getCandidateRanking = async (userId, offerId, query) => {
  const minScore = parseMinScore(query.minScore);
  const includeWithoutCV = parseIncludeWithoutCV(query.includeWithoutCV);
  const company = await getCompanyByUserId(userId);
  const offer = await getCompanyOffer(company.id, offerId);
  const requiredSkills = toArray(offer.requiredSkillsJson);
  const optionalSkills = toArray(offer.optionalSkillsJson);

  const applications = await prisma.application.findMany({
    where: {
      offerId: offer.id,
    },
    orderBy: {
      appliedAt: 'desc',
    },
    include: {
      student: {
        select: {
          id: true,
          phone: true,
          location: true,
          educationLevel: true,
          targetJob: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const candidates = await Promise.all(
    applications.map((application) =>
      buildCandidateRanking(application, {
        offer,
        requiredSkills,
        optionalSkills,
      })
    )
  );

  const filteredCandidates = candidates
    .filter((candidate) => includeWithoutCV || !candidate.withoutCV)
    .filter((candidate) => candidate.matching.score >= minScore)
    .sort((first, second) => second.matching.score - first.matching.score)
    .map((candidate, index) => ({
      rank: index + 1,
      applicationId: candidate.applicationId,
      applicationStatus: candidate.applicationStatus,
      appliedAt: candidate.appliedAt,
      student: candidate.student,
      matching: candidate.matching,
    }));

  return {
    offer: {
      id: offer.id,
      title: offer.title,
    },
    candidates: filteredCandidates,
  };
};

module.exports = {
  getCandidateRanking,
};
