const studentService = require('../services/student.service');

const getProfile = async (req, res, next) => {
  try {
    const student = await studentService.getStudentProfile(req.user.id);

    res.status(200).json({
      student,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const student = await studentService.updateStudentProfile(req.user.id, req.body);

    res.status(200).json({
      student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

