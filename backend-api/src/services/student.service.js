const prisma = require('../config/prisma');

const ALLOWED_PROFILE_FIELDS = [
  'phone',
  'location',
  'educationLevel',
  'targetJob',
  'bio',
  'availabilityDate',
];
const BLOCKED_FIELDS = ['id', 'userId', 'role', 'user', 'passwordHash', 'createdAt', 'updatedAt'];
const PROFILE_FIELD_LIMITS = {
  phone: 30,
  location: 120,
  educationLevel: 120,
  targetJob: 120,
  bio: 1000,
};

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

const getStudentProfile = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  if (!student) {
    throw createHttpError(404, 'Student profile not found');
  }

  return student;
};

const validateNullableString = (field, value) => {
  if (value !== null && typeof value !== 'string') {
    throw createHttpError(400, `${field} must be a string or null`);
  }

  if (typeof value === 'string' && value.length > PROFILE_FIELD_LIMITS[field]) {
    throw createHttpError(400, `${field} must not exceed ${PROFILE_FIELD_LIMITS[field]} characters`);
  }
};

const parseAvailabilityDate = (value) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw createHttpError(400, 'availabilityDate must be a valid date string or null');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, 'availabilityDate must be a valid date');
  }

  return date;
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

  ['phone', 'location', 'educationLevel', 'targetJob', 'bio'].forEach((field) => {
    if (hasOwn(payload, field)) {
      validateNullableString(field, payload[field]);
      data[field] = payload[field];
    }
  });

  if (hasOwn(payload, 'availabilityDate')) {
    data.availabilityDate = parseAvailabilityDate(payload.availabilityDate);
  }

  return data;
};

const updateStudentProfile = async (userId, payload) => {
  const data = validateProfilePayload(payload);

  await getStudentProfile(userId);

  return prisma.student.update({
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
  getStudentProfile,
  updateStudentProfile,
};

