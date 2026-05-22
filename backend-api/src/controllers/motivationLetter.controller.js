const motivationLetterService = require('../services/motivationLetter.service');

const generateLetter = async (req, res, next) => {
  try {
    const motivationLetter = await motivationLetterService.generateLetterForApplication(
      req.user.id,
      req.params.applicationId,
      req.body
    );

    res.status(200).json({
      message: 'Motivation letter generated successfully',
      motivationLetter,
    });
  } catch (error) {
    next(error);
  }
};

const getLetter = async (req, res, next) => {
  try {
    const motivationLetter = await motivationLetterService.getLetterForApplication(
      req.user.id,
      req.params.applicationId
    );

    res.status(200).json({
      motivationLetter,
    });
  } catch (error) {
    next(error);
  }
};

const updateLetter = async (req, res, next) => {
  try {
    const motivationLetter = await motivationLetterService.updateLetterForApplication(
      req.user.id,
      req.params.applicationId,
      req.body
    );

    res.status(200).json({
      message: 'Motivation letter updated successfully',
      motivationLetter,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateLetter,
  getLetter,
  updateLetter,
};
