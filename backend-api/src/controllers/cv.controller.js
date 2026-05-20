const cvService = require('../services/cv.service');

const uploadCV = async (req, res, next) => {
  try {
    const { cv, analysisFailed } = await cvService.createCV(req.user.id, req.file);

    res.status(201).json({
      message: analysisFailed
        ? 'CV uploaded successfully, but AI analysis failed'
        : 'CV uploaded successfully',
      cv,
    });
  } catch (error) {
    next(error);
  }
};

const getCVs = async (req, res, next) => {
  try {
    const cvs = await cvService.getStudentCVs(req.user.id);

    res.status(200).json({
      cvs,
    });
  } catch (error) {
    next(error);
  }
};

const getCVById = async (req, res, next) => {
  try {
    const cv = await cvService.getStudentCVById(req.user.id, req.params.id);

    res.status(200).json({
      cv,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCV = async (req, res, next) => {
  try {
    await cvService.deleteStudentCV(req.user.id, req.params.id);

    res.status(200).json({
      message: 'CV deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCV,
  getCVs,
  getCVById,
  deleteCV,
};

