const prisma = require('../config/prisma');
const { indexOfferDocument } = require('./rag.service');

const OFFER_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'CLOSED'];
const ALLOWED_OFFER_FIELDS = [
  'title',
  'description',
  'location',
  'duration',
  'startDate',
  'requiredSkills',
  'optionalSkills',
  'status',
];
const BLOCKED_FIELDS = [
  'id',
  'companyId',
  'requiredSkillsJson',
  'optionalSkillsJson',
  'company',
  'createdAt',
  'updatedAt',
];

const publicCompanySelect = {
  id: true,
  companyName: true,
  sector: true,
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const normalizeOffer = (offer) => {
  if (!offer) {
    return offer;
  }

  const { requiredSkillsJson, optionalSkillsJson, ...rest } = offer;

  return {
    ...rest,
    requiredSkills: requiredSkillsJson || null,
    optionalSkills: optionalSkillsJson || null,
  };
};

const validateRequiredString = (field, value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(400, `${field} is required`);
  }
};

const validateNullableString = (field, value) => {
  if (value !== null && typeof value !== 'string') {
    throw createHttpError(400, `${field} must be a string or null`);
  }
};

const parseNullableDate = (field, value) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, `${field} must be a valid date string or null`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${field} must be a valid date`);
  }

  return date;
};

const validateSkills = (field, value) => {
  if (value === null) {
    return null;
  }

  if (!Array.isArray(value) || value.some((skill) => typeof skill !== 'string')) {
    throw createHttpError(400, `${field} must be an array of strings or null`);
  }

  return value;
};

const validateStatus = (status) => {
  if (!OFFER_STATUSES.includes(status)) {
    throw createHttpError(400, 'status must be DRAFT, PUBLISHED, ARCHIVED, or CLOSED');
  }
};

const validatePayloadFields = (payload) => {
  const blockedField = BLOCKED_FIELDS.find((field) => hasOwn(payload, field));

  if (blockedField) {
    throw createHttpError(400, `${blockedField} cannot be updated from this endpoint`);
  }

  const invalidField = Object.keys(payload).find((field) => !ALLOWED_OFFER_FIELDS.includes(field));

  if (invalidField) {
    throw createHttpError(400, `${invalidField} is not allowed`);
  }
};

const getCompanyByUserId = async (userId) => {
  const company = await prisma.company.findUnique({
    where: { userId },
  });

  if (!company) {
    throw createHttpError(404, 'Company profile not found');
  }

  return company;
};

const buildCreateData = (payload) => {
  validatePayloadFields(payload);
  validateRequiredString('title', payload.title);
  validateRequiredString('description', payload.description);

  const data = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: payload.status || 'DRAFT',
  };

  validateStatus(data.status);

  ['location', 'duration'].forEach((field) => {
    if (hasOwn(payload, field)) {
      validateNullableString(field, payload[field]);
      data[field] = payload[field];
    }
  });

  if (hasOwn(payload, 'startDate')) {
    data.startDate = parseNullableDate('startDate', payload.startDate);
  }

  if (hasOwn(payload, 'requiredSkills')) {
    data.requiredSkillsJson = validateSkills('requiredSkills', payload.requiredSkills);
  }

  if (hasOwn(payload, 'optionalSkills')) {
    data.optionalSkillsJson = validateSkills('optionalSkills', payload.optionalSkills);
  }

  return data;
};

const buildUpdateData = (payload) => {
  validatePayloadFields(payload);

  const data = {};

  if (hasOwn(payload, 'title')) {
    validateRequiredString('title', payload.title);
    data.title = payload.title.trim();
  }

  if (hasOwn(payload, 'description')) {
    validateRequiredString('description', payload.description);
    data.description = payload.description.trim();
  }

  ['location', 'duration'].forEach((field) => {
    if (hasOwn(payload, field)) {
      validateNullableString(field, payload[field]);
      data[field] = payload[field];
    }
  });

  if (hasOwn(payload, 'startDate')) {
    data.startDate = parseNullableDate('startDate', payload.startDate);
  }

  if (hasOwn(payload, 'requiredSkills')) {
    data.requiredSkillsJson = validateSkills('requiredSkills', payload.requiredSkills);
  }

  if (hasOwn(payload, 'optionalSkills')) {
    data.optionalSkillsJson = validateSkills('optionalSkills', payload.optionalSkills);
  }

  if (hasOwn(payload, 'status')) {
    validateStatus(payload.status);
    data.status = payload.status;
  }

  return data;
};

const findCompanyOffer = async (companyId, offerId) => {
  const offer = await prisma.internshipOffer.findFirst({
    where: {
      id: offerId,
      companyId,
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  return offer;
};

const indexOfferBestEffort = async (offer) => {
  try {
    await indexOfferDocument(offer, offer.company);
  } catch (error) {
    console.error('Offer RAG indexing failed:', error.message);
  }
};

const createCompanyOffer = async (userId, payload) => {
  const data = buildCreateData(payload);
  const company = await getCompanyByUserId(userId);

  const offer = await prisma.internshipOffer.create({
    data: {
      ...data,
      companyId: company.id,
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  await indexOfferBestEffort(offer);

  return normalizeOffer(offer);
};

const getCompanyOffers = async (userId) => {
  const company = await getCompanyByUserId(userId);

  const offers = await prisma.internshipOffer.findMany({
    where: {
      companyId: company.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  return offers.map(normalizeOffer);
};

const getCompanyOfferById = async (userId, offerId) => {
  const company = await getCompanyByUserId(userId);
  const offer = await findCompanyOffer(company.id, offerId);

  return normalizeOffer(offer);
};

const updateCompanyOffer = async (userId, offerId, payload) => {
  const data = buildUpdateData(payload);
  const company = await getCompanyByUserId(userId);

  await findCompanyOffer(company.id, offerId);

  const offer = await prisma.internshipOffer.update({
    where: {
      id: offerId,
    },
    data,
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  await indexOfferBestEffort(offer);

  return normalizeOffer(offer);
};

const archiveCompanyOffer = async (userId, offerId) => {
  const company = await getCompanyByUserId(userId);

  await findCompanyOffer(company.id, offerId);

  const offer = await prisma.internshipOffer.update({
    where: {
      id: offerId,
    },
    data: {
      status: 'ARCHIVED',
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  await indexOfferBestEffort(offer);
};

const getPublishedOffers = async () => {
  const offers = await prisma.internshipOffer.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  return offers.map(normalizeOffer);
};

const getPublishedOfferById = async (offerId) => {
  const offer = await prisma.internshipOffer.findFirst({
    where: {
      id: offerId,
      status: 'PUBLISHED',
    },
    include: {
      company: {
        select: publicCompanySelect,
      },
    },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  return normalizeOffer(offer);
};

module.exports = {
  createCompanyOffer,
  getCompanyOffers,
  getCompanyOfferById,
  updateCompanyOffer,
  archiveCompanyOffer,
  getPublishedOffers,
  getPublishedOfferById,
};

