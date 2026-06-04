const axios = require('axios');

const prisma = require('../config/prisma');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_DOCUMENT_LIMIT = 50;
const MAX_DOCUMENT_LIMIT = 100;

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

module.exports = {
  generateEmbedding,
  createVectorDocument,
  indexCVDocument,
  indexOfferDocument,
  getRecentVectorDocuments,
  getVectorDocumentById,
  parseJsonValue,
  toStringArray,
};
