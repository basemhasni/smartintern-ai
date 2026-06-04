const axios = require('axios');

const prisma = require('../config/prisma');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_DOCUMENT_LIMIT = 50;
const MAX_DOCUMENT_LIMIT = 100;
const DEFAULT_SEARCH_TOP_K = 5;
const MAX_SEARCH_TOP_K = 20;
const MAX_ASK_TOP_K = 10;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseJsonValue = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const toStringArray = (value) => {
  const parsedValue = parseJsonValue(value);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((item) => typeof item === 'string' && item.trim().length > 0);
};

const parseEmbedding = (value) => {
  const parsedValue = parseJsonValue(value);

  if (!Array.isArray(parsedValue)) {
    return null;
  }

  const embedding = parsedValue.map((item) => Number(item));

  if (embedding.some((item) => Number.isNaN(item))) {
    return null;
  }

  return embedding;
};

const cosineSimilarity = (vectorA, vectorB) => {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
    return 0;
  }

  if (vectorA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    const a = Number(vectorA[index]);
    const b = Number(vectorB[index]);

    if (Number.isNaN(a) || Number.isNaN(b)) {
      return 0;
    }

    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))));
};

const normalizeOwnerId = (ownerId) => String(ownerId);

const generateEmbedding = async (text) => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return null;
  }

  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/rag/embed`,
      { text },
      { timeout: 5000 },
    );

    if (!Array.isArray(response.data?.embedding)) {
      return null;
    }

    return response.data.embedding;
  } catch (error) {
    console.error('RAG embedding generation failed:', error.message);
    return null;
  }
};

const createVectorDocument = async ({ ownerType, ownerId, title, content, embedding, metadata }) => {
  if (!ownerType || !ownerId || typeof content !== 'string' || content.trim().length === 0) {
    return null;
  }

  if (!Array.isArray(embedding)) {
    return null;
  }

  const normalizedOwnerId = normalizeOwnerId(ownerId);
  const existingDocument = await prisma.vectorDocument.findFirst({
    where: {
      ownerType,
      ownerId: normalizedOwnerId,
    },
  });

  const data = {
    ownerType,
    ownerId: normalizedOwnerId,
    title: title || null,
    content,
    embeddingJson: embedding,
    metadataJson: metadata || null,
  };

  if (existingDocument) {
    return prisma.vectorDocument.update({
      where: {
        id: existingDocument.id,
      },
      data,
    });
  }

  return prisma.vectorDocument.create({
    data,
  });
};

const indexCVDocument = async (cv, student) => {
  const analysis = parseJsonValue(cv.analysisJson) || {};
  const skills = toStringArray(analysis.skills);
  const studentName = [student.user?.firstName, student.user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const title = studentName ? `CV - ${studentName}` : `CV etudiant ${student.id}`;
  const contentParts = [
    cv.parsedText || cv.fileName,
    skills.length > 0 ? `Competences: ${skills.join(', ')}` : null,
  ].filter(Boolean);
  const content = contentParts.join('\n\n');
  const embedding = await generateEmbedding(content);

  if (!embedding) {
    return false;
  }

  await createVectorDocument({
    ownerType: 'CV',
    ownerId: cv.id,
    title,
    content,
    embedding,
    metadata: {
      studentId: student.id,
      cvId: cv.id,
      fileName: cv.fileName,
      fileType: cv.fileType,
      skills,
    },
  });

  return true;
};

const indexOfferDocument = async (offer, company) => {
  const requiredSkills = toStringArray(offer.requiredSkillsJson || offer.requiredSkills);
  const optionalSkills = toStringArray(offer.optionalSkillsJson || offer.optionalSkills);
  const title = `Offre - ${offer.title}`;
  const content = [
    offer.title,
    offer.description,
    offer.location ? `Lieu: ${offer.location}` : null,
    offer.duration ? `Duree: ${offer.duration}` : null,
    requiredSkills.length > 0 ? `Competences requises: ${requiredSkills.join(', ')}` : null,
    optionalSkills.length > 0 ? `Competences optionnelles: ${optionalSkills.join(', ')}` : null,
    company?.companyName ? `Entreprise: ${company.companyName}` : null,
    company?.sector ? `Secteur: ${company.sector}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');
  const embedding = await generateEmbedding(content);

  if (!embedding) {
    return false;
  }

  await createVectorDocument({
    ownerType: 'OFFER',
    ownerId: offer.id,
    title,
    content,
    embedding,
    metadata: {
      offerId: offer.id,
      companyId: company?.id || offer.companyId,
      companyName: company?.companyName || null,
      requiredSkills,
      optionalSkills,
      status: offer.status,
    },
  });

  return true;
};

const parseDocumentLimit = (limit) => {
  const parsedLimit = Number.parseInt(limit, 10);

  if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
    return DEFAULT_DOCUMENT_LIMIT;
  }

  return Math.min(parsedLimit, MAX_DOCUMENT_LIMIT);
};

const parseSearchTopK = (topK) => {
  const parsedTopK = Number.parseInt(topK, 10);

  if (Number.isNaN(parsedTopK) || parsedTopK <= 0) {
    return DEFAULT_SEARCH_TOP_K;
  }

  return Math.min(parsedTopK, MAX_SEARCH_TOP_K);
};

const parseAskTopK = (topK) => {
  const parsedTopK = Number.parseInt(topK, 10);

  if (Number.isNaN(parsedTopK) || parsedTopK <= 0) {
    return DEFAULT_SEARCH_TOP_K;
  }

  return Math.min(parsedTopK, MAX_ASK_TOP_K);
};

const buildContentPreview = (content) => {
  if (typeof content !== 'string') {
    return '';
  }

  const compactContent = content.replace(/\s+/g, ' ').trim();

  if (compactContent.length <= 250) {
    return compactContent;
  }

  return `${compactContent.slice(0, 250)}...`;
};

const getRecentVectorDocuments = async (limit) => prisma.vectorDocument.findMany({
  take: parseDocumentLimit(limit),
  orderBy: {
    createdAt: 'desc',
  },
  select: {
    id: true,
    ownerType: true,
    ownerId: true,
    title: true,
    metadataJson: true,
    createdAt: true,
    updatedAt: true,
  },
});

const getVectorDocumentById = async (id) => prisma.vectorDocument.findUnique({
  where: {
    id,
  },
});

const searchVectorDocuments = async (query, options = {}) => {
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw createHttpError(400, 'query is required');
  }

  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding) {
    throw createHttpError(503, 'AI service is currently unavailable.');
  }

  const documents = await prisma.vectorDocument.findMany({
    where: options.ownerType
      ? {
        ownerType: options.ownerType,
      }
      : undefined,
    select: {
      id: true,
      ownerType: true,
      ownerId: true,
      title: true,
      content: true,
      embeddingJson: true,
      metadataJson: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const results = documents
    .map((document) => {
      const documentEmbedding = parseEmbedding(document.embeddingJson);
      const score = cosineSimilarity(queryEmbedding, documentEmbedding);

      return {
        id: document.id,
        ownerType: document.ownerType,
        ownerId: document.ownerId,
        title: document.title,
        score: Number(score.toFixed(4)),
        metadata: document.metadataJson,
        contentPreview: buildContentPreview(document.content),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    })
    .sort((firstResult, secondResult) => secondResult.score - firstResult.score)
    .slice(0, parseSearchTopK(options.topK));

  return results;
};

const generateRagAnswer = async (question, documents) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/rag/answer`,
      {
        question,
        documents,
      },
      { timeout: 5000 },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw createHttpError(400, error.response.data?.detail || 'Invalid RAG answer request');
    }

    throw createHttpError(503, 'AI service is currently unavailable.');
  }
};

const askRagQuestion = async (question, options = {}) => {
  if (typeof question !== 'string' || question.trim().length === 0) {
    throw createHttpError(400, 'question is required');
  }

  const results = await searchVectorDocuments(question, {
    topK: parseAskTopK(options.topK),
    ownerType: options.ownerType,
  });
  const contextDocuments = results.filter((document) => document.score > 0);
  const answerResult = await generateRagAnswer(question, contextDocuments);
  const usedDocumentIds = Array.isArray(answerResult.usedDocuments)
    ? answerResult.usedDocuments.map((document) => document.id)
    : [];
  const sourceDocuments = usedDocumentIds.length > 0
    ? contextDocuments.filter((document) => usedDocumentIds.includes(document.id))
    : contextDocuments;
  const sources = sourceDocuments.map((document) => ({
    id: document.id,
    ownerType: document.ownerType,
    ownerId: document.ownerId,
    title: document.title,
    score: document.score,
  }));

  return {
    answer: answerResult.answer,
    sources,
  };
};

module.exports = {
  generateEmbedding,
  generateRagAnswer,
  createVectorDocument,
  indexCVDocument,
  indexOfferDocument,
  searchVectorDocuments,
  askRagQuestion,
  cosineSimilarity,
  parseEmbedding,
  getRecentVectorDocuments,
  getVectorDocumentById,
  parseJsonValue,
  toStringArray,
};
