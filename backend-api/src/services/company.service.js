const prisma = require('../config/prisma');

const ALLOWED_PROFILE_FIELDS = ['companyName', 'sector', 'description', 'website', 'address'];
const BLOCKED_FIELDS = ['id', 'userId', 'role', 'status', 'user', 'passwordHash', 'createdAt', 'updatedAt'];

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const hasOwn = (object, field) => Object.prototype.hasOwnProperty.call(object, field);

const getCompanyProfile = async (userId) => {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  if (!company) {
    throw createHttpError(404, 'Company profile not found');
  }

  return company;
};

const validateNullableString = (field, value) => {
  if (value !== null && typeof value !== 'string') {
    throw createHttpError(400, `${field} must be a string or null`);
  }
};

const validateCompanyName = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createHttpError(400, 'companyName must be a non-empty string');
  }
};

const validateProfilePayload = (payload) => {
  const blockedField = BLOCKED_FIELDS.find((field) => hasOwn(payload, field));

  if (blockedField) {
    throw createHttpError(400, `${blockedField} cannot be updated from this endpoint`);
  }

  const invalidField = Object.keys(payload).find((field) => !ALLOWED_PROFILE_FIELDS.includes(field));

  if (invalidField) {
    throw createHttpError(400, `${invalidField} is not allowed`);
  }

  const data = {};

  if (hasOwn(payload, 'companyName')) {
    validateCompanyName(payload.companyName);
    data.companyName = payload.companyName.trim();
  }

  ['sector', 'description', 'website', 'address'].forEach((field) => {
    if (hasOwn(payload, field)) {
      validateNullableString(field, payload[field]);
      data[field] = payload[field];
    }
  });

  return data;
};

const updateCompanyProfile = async (userId, payload) => {
  const data = validateProfilePayload(payload);

  await getCompanyProfile(userId);

  return prisma.company.update({
    where: { userId },
    data,
    include: {
      user: {
        select: userSelect,
      },
    },
  });
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};

