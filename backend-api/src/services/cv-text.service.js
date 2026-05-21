const path = require('path');
const fs = require('fs/promises');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

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
  let extractedText = '';

  try {
    if (fileType === 'application/pdf') {
      const fileBuffer = await fs.readFile(filePath);
      const result = await pdfParse(fileBuffer);
      extractedText = result.text || '';
    }

    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value || '';
    }
  } catch (error) {
    extractedText = '';
  }

  return [
    extractedText.trim(),
    readableName ? `Detected file name content: ${readableName}.` : '',
    `File type: ${fileType}.`,
  ]
    .filter(Boolean)
    .join(' ');
};

module.exports = {
  extractTextFromCV,
};
