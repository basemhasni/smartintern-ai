const path = require('path');

const normalizeFileNameAsText = (fileName) => {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');

  return nameWithoutExtension
    .replace(/^\d+-/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractTextFromCV = async (filePath, fileType) => {
  const fileName = path.basename(filePath);
  const readableName = normalizeFileNameAsText(fileName);

  return [
    `Temporary CV text extraction from ${fileName}.`,
    readableName ? `Detected file name content: ${readableName}.` : '',
    `File type: ${fileType}.`,
  ]
    .filter(Boolean)
    .join(' ');
};

module.exports = {
  extractTextFromCV,
};
