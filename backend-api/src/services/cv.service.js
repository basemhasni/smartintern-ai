const fs = require('fs/promises');
const path = require('path');

const prisma = require('../config/prisma');
const { analyzeCV } = require('./ai.service');
const { extractTextFromCV } = require('./cv-text.service');
const { deleteDocumentChunks, indexCVDocument } = require('./rag.service');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getStudentByUserId = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!student) {
    throw createHttpError(404, 'Student profile not found');
  }

  return student;
};

const createCV = async (userId, file) => {
  if (!file) {
    throw createHttpError(400, 'CV file is required');
  }

  const student = await getStudentByUserId(userId);
  const filePath = file.path || path.join(__dirname, '../../uploads/cvs', file.filename);
  let parsedText = null;
  let analysisJson = null;
  let analysisFailed = false;

  try {
    parsedText = await extractTextFromCV(filePath, file.mimetype);
    const analysisResult = await analyzeCV(parsedText);

    if (analysisResult.success) {
      analysisJson = analysisResult.data;
    } else {
      analysisFailed = true;
      analysisJson = {
        error: analysisResult.error,
        details: analysisResult.details || null,
      };
    }
  } catch (error) {
    analysisFailed = true;
    analysisJson = {
      error: 'AI analysis failed',
      details: error.message,
    };
  }

  const cv = await prisma.cV.create({
    data: {
      studentId: student.id,
      fileName: file.filename,
      fileUrl: `/uploads/cvs/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      parsedText,
      analysisJson,
    },
  });

  let ragIndexed = false;

  try {
    ragIndexed = await indexCVDocument(cv, student);
  } catch (error) {
    console.error('CV RAG indexing failed:', error.message);
  }

  return {
    cv,
    analysisFailed,
    ragIndexed,
  };
};

const getStudentCVs = async (userId) => {
  const student = await getStudentByUserId(userId);

  return prisma.cV.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });
};

const getStudentCVById = async (userId, cvId) => {
  const student = await getStudentByUserId(userId);

  const cv = await prisma.cV.findFirst({
    where: {
      id: cvId,
      studentId: student.id,
    },
  });

  if (!cv) {
    throw createHttpError(404, 'CV not found');
  }

  return cv;
};

const deleteStudentCV = async (userId, cvId) => {
  const cv = await getStudentCVById(userId, cvId);
  const relativeFilePath = cv.fileUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, '../../', relativeFilePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw createHttpError(500, 'Failed to delete CV file');
    }
  }

  await prisma.cV.delete({
    where: {
      id: cv.id,
    },
  });

  try {
    await deleteDocumentChunks('CV', cv.id);
  } catch (error) {
    console.error('CV RAG cleanup failed:', error.message);
  }
};

module.exports = {
  createCV,
  getStudentCVs,
  getStudentCVById,
  deleteStudentCV,
};
