const bcrypt = require('bcrypt');

const prisma = require('../config/prisma');
const { generateToken } = require('../utils/token.util');

const VALID_ROLES = ['STUDENT', 'COMPANY', 'ADMIN'];
const PASSWORD_SALT_ROUNDS = 10;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const validateRequiredFields = (payload, fields) => {
  const missingFields = fields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing required field(s): ${missingFields.join(', ')}`);
  }
};

const register = async ({ firstName, lastName, email, password, role }) => {
  validateRequiredFields(
    { firstName, lastName, email, password, role },
    ['firstName', 'lastName', 'email', 'password', 'role']
  );

  if (!VALID_ROLES.includes(role)) {
    throw createHttpError(400, 'Role must be STUDENT, COMPANY, or ADMIN');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createHttpError(400, 'Email is already used');
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role,
      },
    });

    if (role === 'STUDENT') {
      await tx.student.create({
        data: {
          userId: createdUser.id,
        },
      });
    }

    if (role === 'COMPANY') {
      await tx.company.create({
        data: {
          userId: createdUser.id,
          companyName: `Company of ${firstName}`,
        },
      });
    }

    return createdUser;
  });

  const token = generateToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const login = async ({ email, password }) => {
  validateRequiredFields({ email, password }, ['email', 'password']);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw createHttpError(403, 'Account is disabled');
  }

  const token = generateToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const getAuthenticatedUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      student: true,
      company: true,
    },
  });

  if (!user) {
    throw createHttpError(401, 'Authenticated user not found');
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  getAuthenticatedUser,
};

