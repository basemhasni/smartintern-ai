const path = require('path');

const multer = require('multer');

const uploadDirectory = path.join(__dirname, '../../uploads/cvs');
const maxFileSize = 5 * 1024 * 1024;
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedExtensions = ['.pdf', '.docx'];

const sanitizeFileName = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path
    .basename(fileName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${Date.now()}-${baseName || 'cv'}${extension}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, sanitizeFileName(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
    const error = new Error('Invalid CV format. Only PDF and DOCX files are allowed');
    error.statusCode = 400;
    return cb(error);
  }

  return cb(null, true);
};

const uploadCV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});

const handleMulterError = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'CV file size must not exceed 5 MB',
    });
  }

  return res.status(err.statusCode || 400).json({
    status: 'error',
    message: err.message || 'CV upload failed',
  });
};

module.exports = {
  uploadCV,
  handleMulterError,
};

