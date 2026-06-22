const ragService = require('../services/rag.service');

const ALLOWED_OWNER_TYPES = ['CV', 'OFFER', 'CAREER_ADVICE', 'MOTIVATION_LETTER'];

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getDocuments = async (req, res, next) => {
  try {
    const documents = await ragService.getRecentVectorDocuments(req.query.limit);

    res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

const searchDocuments = async (req, res, next) => {
  try {
    const { query, topK, ownerType, filters = {}, minScore } = req.body;

    if (typeof query !== 'string' || query.trim().length === 0) {
      throw createHttpError(400, 'query is required');
    }

    if (ownerType && !ALLOWED_OWNER_TYPES.includes(ownerType)) {
      throw createHttpError(400, 'ownerType must be CV, OFFER, CAREER_ADVICE, or MOTIVATION_LETTER');
    }
    const requestedOwnerTypes = filters.ownerTypes || filters.includeOwnerTypes;
    if (requestedOwnerTypes && (!Array.isArray(requestedOwnerTypes) || requestedOwnerTypes.some((value) => !ALLOWED_OWNER_TYPES.includes(value)))) {
      throw createHttpError(400, 'filters.ownerTypes contains an invalid owner type');
    }

    const results = await ragService.searchVectorDocuments(query, {
      topK,
      ownerType,
      minScore,
      filters: { ...filters, ...(ownerType ? { ownerType } : {}) },
      accessContext: req.user,
    });

    res.status(200).json({
      message: 'RAG search completed successfully',
      query,
      count: results.length,
      results,
      queryAnalysis: { normalizedQuery: query.trim(), filters },
      retrievalMethod: 'HYBRID_RAG_V2',
      warnings: [],
    });
  } catch (error) {
    next(error);
  }
};

const askQuestion = async (req, res, next) => {
  try {
    const { question, topK, ownerType, filters = {}, mode = 'GENERAL' } = req.body;

    if (typeof question !== 'string' || question.trim().length === 0) {
      throw createHttpError(400, 'question is required');
    }

    if (ownerType && !ALLOWED_OWNER_TYPES.includes(ownerType)) {
      throw createHttpError(400, 'ownerType must be CV, OFFER, CAREER_ADVICE, or MOTIVATION_LETTER');
    }
    const requestedOwnerTypes = filters.ownerTypes || filters.includeOwnerTypes;
    if (requestedOwnerTypes && (!Array.isArray(requestedOwnerTypes) || requestedOwnerTypes.some((value) => !ALLOWED_OWNER_TYPES.includes(value)))) {
      throw createHttpError(400, 'filters.ownerTypes contains an invalid owner type');
    }

    const ragAnswer = await ragService.askRagQuestion(question, {
      topK,
      ownerType,
      filters: { ...filters, ...(ownerType ? { ownerType } : {}) },
      mode,
      accessContext: req.user,
    });

    res.status(200).json({
      message: 'RAG answer generated successfully',
      question,
      answer: ragAnswer.answer,
      citations: ragAnswer.citations || ragAnswer.sources || [],
      sources: ragAnswer.sources || ragAnswer.citations || [],
      confidence: ragAnswer.confidence || 'LOW',
      retrievedContextCount: ragAnswer.retrievedContextCount || 0,
      warnings: ragAnswer.warnings || [],
    });
  } catch (error) {
    next(error);
  }
};

const reindexAll = async (req, res, next) => {
  try {
    const summary = await ragService.reindexAllDocuments();
    res.status(200).json({ message: 'RAG reindex completed', summary });
  } catch (error) { next(error); }
};

const reindexOne = async (req, res, next) => {
  try {
    const { ownerType, ownerId } = req.params;
    if (!ALLOWED_OWNER_TYPES.includes(ownerType)) throw createHttpError(400, 'Invalid ownerType');
    const indexed = await ragService.reindexDocument(ownerType, ownerId);
    if (!indexed) throw createHttpError(404, 'Document owner not found or unsupported');
    res.status(200).json({ message: 'RAG document reindexed', ownerType, ownerId });
  } catch (error) { next(error); }
};

const getDocumentById = async (req, res, next) => {
  try {
    const document = await ragService.getVectorDocumentById(req.params.id);

    if (!document) {
      throw createHttpError(404, 'Vector document not found');
    }

    res.status(200).json({
      document,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDocuments,
  askQuestion,
  getDocuments,
  getDocumentById,
  reindexAll,
  reindexOne,
};
