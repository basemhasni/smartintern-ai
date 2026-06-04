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
    const { query, topK, ownerType } = req.body;

    if (typeof query !== 'string' || query.trim().length === 0) {
      throw createHttpError(400, 'query is required');
    }

    if (ownerType && !ALLOWED_OWNER_TYPES.includes(ownerType)) {
      throw createHttpError(400, 'ownerType must be CV, OFFER, CAREER_ADVICE, or MOTIVATION_LETTER');
    }

    const results = await ragService.searchVectorDocuments(query, {
      topK,
      ownerType,
    });

    res.status(200).json({
      message: 'RAG search completed successfully',
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};

const askQuestion = async (req, res, next) => {
  try {
    const { question, topK, ownerType } = req.body;

    if (typeof question !== 'string' || question.trim().length === 0) {
      throw createHttpError(400, 'question is required');
    }

    if (ownerType && !ALLOWED_OWNER_TYPES.includes(ownerType)) {
      throw createHttpError(400, 'ownerType must be CV, OFFER, CAREER_ADVICE, or MOTIVATION_LETTER');
    }

    const ragAnswer = await ragService.askRagQuestion(question, {
      topK,
      ownerType,
    });

    res.status(200).json({
      message: 'RAG answer generated successfully',
      question,
      answer: ragAnswer.answer,
      sources: ragAnswer.sources,
    });
  } catch (error) {
    next(error);
  }
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
};
