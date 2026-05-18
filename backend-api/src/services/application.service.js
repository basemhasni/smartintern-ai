const prisma = require('../config/prisma');

const APPLICATION_STATUSES = ['SENT', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateOptionalMessage = (message) => {
  if (message === undefined) {
    return undefined;
  }

  if (message !== null && typeof message !== 'string') {
    throw createHttpError(400, 'message must be a string or null');
  }

  return message;
};

const validateApplicationStatus = (status) => {
  if (!APPLICATION_STATUSES.includes(status)) {
    throw createHttpError(400, 'status must be SENT, PENDING, ACCEPTED, REJECTED, or CANCELLED');
  }
};

const getStudentByUserId = async (userId) => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw createHttpError(404, 'Student profile not found');
  }

  return student;
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

const submitApplication = async (userId, offerId, payload) => {
  const message = validateOptionalMessage(payload.message);
  const student = await getStudentByUserId(userId);

  const offer = await prisma.internshipOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  if (offer.status !== 'PUBLISHED') {
    throw createHttpError(400, 'Students can only apply to published offers');
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      studentId_offerId: {
        studentId: student.id,
        offerId,
      },
    },
  });

  if (existingApplication) {
    throw createHttpError(409, 'Student has already applied to this offer');
  }

  return prisma.application.create({
    data: {
      studentId: student.id,
      offerId,
      status: 'SENT',
      message,
    },
  });
};

const getStudentApplications = async (userId) => {
  const student = await getStudentByUserId(userId);

  return prisma.application.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      appliedAt: 'desc',
    },
    include: {
      offer: {
        select: {
          id: true,
          title: true,
          location: true,
          duration: true,
          status: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      },
    },
  });
};

const getCompanyOfferApplications = async (userId, offerId) => {
  const company = await getCompanyByUserId(userId);

  const offer = await prisma.internshipOffer.findFirst({
    where: {
      id: offerId,
      companyId: company.id,
    },
  });

  if (!offer) {
    throw createHttpError(404, 'Offer not found');
  }

  return prisma.application.findMany({
    where: {
      offerId,
    },
    orderBy: {
      appliedAt: 'desc',
    },
    include: {
      student: {
        select: {
          id: true,
          phone: true,
          location: true,
          educationLevel: true,
          targetJob: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const updateApplicationStatus = async (userId, applicationId, status) => {
  if (!status) {
    throw createHttpError(400, 'status is required');
  }

  validateApplicationStatus(status);

  const company = await getCompanyByUserId(userId);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      offer: true,
    },
  });

  if (!application) {
    throw createHttpError(404, 'Application not found');
  }

  if (application.offer.companyId !== company.id) {
    throw createHttpError(403, 'Application does not belong to this company');
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: {
      offer: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      student: {
        select: {
          id: true,
          phone: true,
          location: true,
          educationLevel: true,
          targetJob: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

module.exports = {
  submitApplication,
  getStudentApplications,
  getCompanyOfferApplications,
  updateApplicationStatus,
};

