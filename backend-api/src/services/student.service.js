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

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
};

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
  const blockedField = BLOCKED_FIELDS.find((field) => Object.prototype.hasOwnProperty.call(payload, field));

  if (blockedField) {
    throw createHttpError(400, `${blockedField} cannot be updated from this endpoint`);
  }

  const invalidField = Object.keys(payload).find((field) => !ALLOWED_PROFILE_FIELDS.includes(field));

  if (invalidField) {
    throw createHttpError(400, `${invalidField} is not allowed`);
  }

  const data = {};

  ['phone', 'location', 'educationLevel', 'targetJob', 'bio'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      validateNullableString(field, payload[field]);
      data[field] = payload[field];
    }
  });

  if (Object.prototype.hasOwnProperty.call(payload, 'availabilityDate')) {
    data.availabilityDate = parseAvailabilityDate(payload.availabilityDate);
  }

  return data;
};

const updateStudentProfile = async (userId, payload) => {
  const data = validateProfilePayload(payload);

  await getStudentProfile(userId);

  const student = await prisma.student.update({
    where: { userId },
    data,
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  return student;
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
};
