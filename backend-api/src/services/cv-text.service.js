const fs = require('fs/promises');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const extractTextFromCV = async (filePath, fileType) => {
  let extractedText = '';
  try {
    if (fileType === 'application/pdf') {
      extractedText = (await pdfParse(await fs.readFile(filePath))).text || '';
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = (await mammoth.extractRawText({ path: filePath })).value || '';
    }
  } catch {
    // Invalid documents must not become AI evidence derived from their filename.
  }
  if (!extractedText.trim()) {
    const error = new Error('Le CV ne contient pas de texte lisible. Importez un PDF avec du texte ou un DOCX valide.');
    error.statusCode = 400;
    error.code = 'CV_TEXT_EXTRACTION_FAILED';
    throw error;
  }
  return extractedText.trim();
};

module.exports = { extractTextFromCV };
