const prisma = require('../config/prisma');
const indexing = require('./ragIndexing.service');
const { requestAi } = require('./aiClient');

const createHttpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });
const parseJsonValue = (value) => { if (!value || typeof value !== 'string') return value || null; try { return JSON.parse(value); } catch (error) { return null; } };
const toStringArray = (value) => { const parsed = parseJsonValue(value); return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item.trim()) : []; };
const parseEmbedding = (value) => { const parsed = parseJsonValue(value); if (!Array.isArray(parsed)) return null; const result = parsed.map(Number); return result.every(Number.isFinite) ? result : null; };
const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length || !a.length) return 0;
  let dot = 0; let normA = 0; let normB = 0;
  for (let index = 0; index < a.length; index += 1) { dot += a[index] * b[index]; normA += a[index] ** 2; normB += b[index] ** 2; }
  return normA && normB ? Math.max(0, Math.min(1, dot / (Math.sqrt(normA) * Math.sqrt(normB)))) : 0;
};
const normalizeText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ').trim();
const lexicalSimilarity = (query, text) => {
  const terms = [...new Set(normalizeText(query).split(' ').filter(Boolean))];
  const haystack = new Set(normalizeText(text).split(' ').filter(Boolean));
  if (!terms.length) return 0;
  return Math.min(1, terms.filter((term) => haystack.has(term)).length / terms.length + (normalizeText(text).includes(normalizeText(query)) ? 0.15 : 0));
};
const generateEmbedding = async (text) => {
  if (!String(text || '').trim()) return null;
  try {
    const response = await requestAi({ path: '/ai/rag/v2/embed', data: { text }, workflow: 'rag', allowRetry: true, validate: (value) => Array.isArray(value?.embedding) });
    return response.embedding;
  } catch (error) { console.error('RAG embedding generation failed:', error.code || 'AI_SERVICE_UNAVAILABLE'); return null; }
};
const createVectorDocument = ({ ownerType, ownerId, title, content, embedding, metadata }) => prisma.vectorDocument.create({ data: { ownerType, ownerId: String(ownerId), title: title || null, content, embeddingJson: embedding, metadataJson: metadata || null } });

const resolveAccess = async (context) => {
  if (!context?.id || !context?.role) return null;
  if (context.role === 'ADMIN') return { role: 'ADMIN' };
  if (context.role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId: context.id }, select: { id: true } });
    return student ? { role: 'STUDENT', studentId: student.id } : null;
  }
  if (context.role === 'COMPANY') {
    const company = await prisma.company.findUnique({ where: { userId: context.id }, select: { id: true, offers: { select: { id: true, applications: { select: { studentId: true } } } } } });
    if (!company) return null;
    return { role: 'COMPANY', companyId: company.id, offerIds: new Set(company.offers.map((offer) => offer.id)), studentIds: new Set(company.offers.flatMap((offer) => offer.applications.map((application) => application.studentId))) };
  }
  return null;
};
const isAuthorized = (document, access) => {
  if (!access) return false;
  if (access.role === 'ADMIN') return true;
  const metadata = document.metadataJson || {};
  if (access.role === 'STUDENT') return document.ownerType === 'OFFER'
    ? metadata.status === 'PUBLISHED' || metadata.accessScope === 'PUBLIC'
    : String(metadata.studentId) === String(access.studentId);
  if (document.ownerType === 'OFFER') return String(metadata.companyId) === String(access.companyId);
  if (document.ownerType === 'CAREER_ADVICE') return false;
  return String(metadata.companyId) === String(access.companyId)
    || access.offerIds.has(String(metadata.offerId))
    || (document.ownerType === 'CV' && access.studentIds.has(String(metadata.studentId)));
};
const matchesFilters = (document, filters) => {
  const metadata = document.metadataJson || {};
  const owners = filters.ownerTypes || filters.includeOwnerTypes || (filters.ownerType ? [filters.ownerType] : []);
  return (!owners.length || owners.includes(document.ownerType))
    && ['studentId', 'companyId', 'offerId', 'applicationId'].every((field) => filters[field] == null || String(metadata[field]) === String(filters[field]));
};
const preview = (content) => { const value = String(content || '').replace(/\s+/g, ' ').trim(); return value.length > 300 ? `${value.slice(0, 300)}...` : value; };

const searchVectorDocuments = async (query, options = {}) => {
  if (!String(query || '').trim()) throw createHttpError(400, 'query is required');
  const access = await resolveAccess(options.accessContext);
  if (!access) throw createHttpError(403, 'RAG access scope could not be resolved.');
  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) throw createHttpError(503, 'AI service is currently unavailable.');
  const filters = options.filters || { ownerType: options.ownerType };
  const requestedOwnerTypes = filters.ownerTypes || filters.includeOwnerTypes || (filters.ownerType ? [filters.ownerType] : []);
  const documents = await prisma.vectorDocument.findMany({
    where: requestedOwnerTypes.length ? { ownerType: { in: requestedOwnerTypes } } : undefined,
    select: { id: true, ownerType: true, ownerId: true, title: true, content: true, embeddingJson: true, metadataJson: true, createdAt: true, updatedAt: true },
  });
  const topK = Math.max(1, Math.min(Number.parseInt(options.topK, 10) || 5, 20));
  const minScore = Math.max(0, Math.min(Number(options.minScore) || 0.08, 1));
  const scored = documents.filter((document) => isAuthorized(document, access) && matchesFilters(document, filters)).map((document) => {
    const vectorScore = cosineSimilarity(queryEmbedding, parseEmbedding(document.embeddingJson));
    const lexicalScore = lexicalSimilarity(query, document.content);
    const metadata = document.metadataJson || {};
    const matchedMetadata = ['studentId', 'companyId', 'offerId', 'applicationId'].filter((field) => filters[field] != null && String(metadata[field]) === String(filters[field])).length;
    const metadataBoost = Math.min(1, matchedMetadata / 2);
    const ageDays = Math.max(0, (Date.now() - new Date(document.updatedAt).getTime()) / 86400000);
    const recencyBoost = Math.max(0, 1 - ageDays / 365);
    const sectionBoost = ['skills', 'required_skills', 'projects', 'experience'].includes(metadata.section) ? 0.03 : 0;
    const score = Math.min(1, 0.6 * vectorScore + 0.25 * lexicalScore + 0.1 * metadataBoost + 0.05 * recencyBoost + sectionBoost);
    return { id: document.id, ownerType: document.ownerType, ownerId: document.ownerId, title: document.title, score: Number(score.toFixed(4)), vectorScore: Number(vectorScore.toFixed(4)), lexicalScore: Number(lexicalScore.toFixed(4)), metadataBoost: Number(metadataBoost.toFixed(4)), recencyBoost: Number(recencyBoost.toFixed(4)), rerankReason: sectionBoost ? `Important section: ${metadata.section}` : 'Hybrid similarity', matchedSignals: sectionBoost ? [`section:${metadata.section}`] : [], metadata, contentPreview: preview(document.content), createdAt: document.createdAt, updatedAt: document.updatedAt };
  }).filter((item) => item.score >= minScore && (item.vectorScore >= 0.03 || item.lexicalScore >= 0.1)).sort((a, b) => b.score - a.score);
  const counts = new Map(); const results = [];
  for (const item of scored) { const key = `${item.ownerType}:${item.ownerId}`; if ((counts.get(key) || 0) >= 2) continue; counts.set(key, (counts.get(key) || 0) + 1); results.push(item); if (results.length >= topK) break; }
  return results;
};
const generateRagAnswer = async (question, documents, mode = 'GENERAL') => {
  try {
    const contexts = documents.map((document) => ({ id: document.id, ownerType: document.ownerType, ownerId: document.ownerId, title: document.title, text: document.contentPreview, score: document.score, metadata: document.metadata }));
    return await requestAi({ path: '/ai/rag/v2/answer', data: { question, contexts, answerMode: mode }, workflow: 'rag', validate: (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value) });
  } catch (error) { throw error; }
};
const askRagQuestion = async (question, options = {}) => { const results = await searchVectorDocuments(question, options); const answer = await generateRagAnswer(question, results, options.mode); return { ...answer, sources: answer.citations || [], retrievedContextCount: answer.usedContextCount || 0 }; };
const getRecentVectorDocuments = (limit) => prisma.vectorDocument.findMany({ take: Math.max(1, Math.min(Number.parseInt(limit, 10) || 50, 100)), orderBy: { createdAt: 'desc' }, select: { id: true, ownerType: true, ownerId: true, title: true, metadataJson: true, createdAt: true, updatedAt: true } });
const getVectorDocumentById = (id) => prisma.vectorDocument.findUnique({ where: { id }, select: { id: true, ownerType: true, ownerId: true, title: true, content: true, metadataJson: true, createdAt: true, updatedAt: true } });

module.exports = { generateEmbedding, generateRagAnswer, createVectorDocument, indexCVDocument: indexing.indexStudentCv, indexOfferDocument: indexing.indexInternshipOffer, searchVectorDocuments, askRagQuestion, cosineSimilarity, parseEmbedding, getRecentVectorDocuments, getVectorDocumentById, parseJsonValue, toStringArray, ...indexing };
