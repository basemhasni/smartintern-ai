const ragService = require('../services/rag.service');

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
  getDocuments,
  getDocumentById,
};
