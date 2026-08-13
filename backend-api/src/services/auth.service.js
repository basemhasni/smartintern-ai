const crypto = require('crypto');

const bcrypt = require('bcrypt');

const prisma = require('../config/prisma');
const { isSmtpConfigured, sendPasswordResetEmail } = require('./email.service');
const { generateToken } = require('../utils/token.util');

const PUBLIC_REGISTRATION_ROLES = ['STUDENT', 'COMPANY'];
const PASSWORD_SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRES_MINUTES = 30;
const FORGOT_PASSWORD_MESSAGE = 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.';

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeUser = (user) => {
  const {
    passwordHash,
    resetPasswordToken,
    resetPasswordExpires,
    ...safeUser
  } = user;
  return safeUser;
};

const hashResetToken = (token) => crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');

const buildFrontendResetLink = (token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
};

const validateEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePasswordStrength = (password) => {
  if (typeof password !== 'string' || password.length < 8) {
    throw createHttpError(400, 'Le mot de passe doit contenir au moins 8 caracteres.');
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw createHttpError(400, 'Le mot de passe doit contenir au moins une lettre et un chiffre.');
  }
};

const validateRequiredFields = (payload, fields) => {
  const missingFields = fields.filter((field) => !payload[field]);

  if (missingFields.length > 0) {
    throw createHttpError(400, `Missing required field(s): ${missingFields.join(', ')}`);
  }
};

const register = async ({ firstName, lastName, email, password, role }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  validateRequiredFields(
    { firstName, lastName, email: normalizedEmail, password, role },
    ['firstName', 'lastName', 'email', 'password', 'role']
  );

  if (!validateEmailFormat(normalizedEmail)) {
    throw createHttpError(400, 'Adresse email invalide.');
  }

  validatePasswordStrength(password);

  if (!PUBLIC_REGISTRATION_ROLES.includes(role)) {
    throw createHttpError(400, 'Public registration is only available for STUDENT and COMPANY roles.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
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
        email: normalizedEmail,
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

  return {
    token: generateToken(user),
    user: sanitizeUser(user),
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  validateRequiredFields({ email: normalizedEmail, password }, ['email', 'password']);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
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

  return {
    token: generateToken(user),
    user: sanitizeUser(user),
  };
};

const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (!normalizedEmail || !validateEmailFormat(normalizedEmail)) {
    throw createHttpError(400, 'Adresse email invalide.');
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = hashResetToken(rawToken);
  const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);
  const resetLink = buildFrontendResetLink(rawToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetPasswordExpires,
    },
  });

  let emailDelivery = { sent: false, fallback: null };

  try {
    emailDelivery = await sendPasswordResetEmail({
      to: user.email,
      resetLink,
      expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Password reset email failed in development. Reset link is available only in the API response.');
      emailDelivery = { sent: false, fallback: 'response', reason: 'SMTP_SEND_FAILED' };
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      throw createHttpError(502, "Impossible d'envoyer l'email de reinitialisation pour le moment.");
    }
  }

  const response = { message: FORGOT_PASSWORD_MESSAGE };

  if (process.env.NODE_ENV !== 'production' && (!isSmtpConfigured() || emailDelivery.fallback)) {
    response.devResetLink = resetLink;
    response.devNotice = isSmtpConfigured()
      ? "SMTP configure mais l'email n'a pas pu etre envoye. Utilisez ce lien en developpement et verifiez les identifiants SMTP."
      : 'SMTP non configure: utilisez ce lien de reinitialisation en mode developpement.';
  }

  return response;
};

const resetPassword = async ({ token, password, confirmPassword }) => {
  if (!token) {
    throw createHttpError(400, 'Lien de reinitialisation invalide ou incomplet.');
  }

  if (password !== confirmPassword) {
    throw createHttpError(400, 'Les mots de passe ne correspondent pas.');
  }

  validatePasswordStrength(password);

  const resetPasswordToken = hashResetToken(token);
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw createHttpError(400, 'Le lien de reinitialisation est invalide ou expire.');
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return {
    message: 'Votre mot de passe a ete reinitialise avec succes.',
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
  requestPasswordReset,
  resetPassword,
  getAuthenticatedUser,
};

