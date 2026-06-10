const prisma = require('../config/prisma');

const COMPANY_STATUSES = ['PENDING', 'VALIDATED', 'REJECTED', 'SUSPENDED'];
const USER_ROLES = ['STUDENT', 'COMPANY', 'ADMIN'];

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

const parsePositiveInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const buildPagination = (query) => {
  const page = parsePositiveInteger(query.page, 1, 100000);
  const limit = parsePositiveInteger(query.limit, 20, 100);
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildPaginationResponse = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalStudents,
    totalCompanies,
    totalOffers,
    publishedOffers,
    totalApplications,
    acceptedApplications,
    pendingCompanies,
    inactiveUsers,
    recentUsers,
    recentCompanies,
    recentOffers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.company.count(),
    prisma.internshipOffer.count(),
    prisma.internshipOffer.count({ where: { status: 'PUBLISHED' } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'ACCEPTED' } }),
    prisma.company.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.internshipOffer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalStudents,
      totalCompanies,
      totalOffers,
      publishedOffers,
      totalApplications,
      acceptedApplications,
      pendingCompanies,
      inactiveUsers,
    },
    recentUsers,
    recentCompanies,
    recentOffers,
  };
};

const getAdminUsers = async (query = {}) => {
  const { page, limit, skip } = buildPagination(query);
  const where = {};
  const search = String(query.search || '').trim();

  if (query.role) {
    if (!USER_ROLES.includes(query.role)) {
      throw createHttpError(400, 'role must be STUDENT, COMPANY, or ADMIN');
    }
    where.role = query.role;
  }

  if (query.isActive !== undefined && query.isActive !== '') {
    if (!['true', 'false'].includes(String(query.isActive))) {
      throw createHttpError(400, 'isActive must be true or false');
    }
    where.isActive = String(query.isActive) === 'true';
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: buildPaginationResponse(page, limit, total),
  };
};

const updateAdminUserStatus = async (adminUserId, targetUserId, payload = {}) => {
  if (typeof payload.isActive !== 'boolean') {
    throw createHttpError(400, 'isActive boolean is required');
  }

  if (adminUserId === targetUserId && payload.isActive === false) {
    throw createHttpError(400, 'You cannot deactivate your own administrator account.');
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { isActive: payload.isActive },
  });

  return sanitizeUser(updatedUser);
};

const getAdminCompanies = async (query = {}) => {
  const { page, limit, skip } = buildPagination(query);
  const where = {};
  const search = String(query.search || '').trim();

  if (query.status) {
    if (!COMPANY_STATUSES.includes(query.status)) {
      throw createHttpError(400, 'status must be PENDING, VALIDATED, REJECTED, or SUSPENDED');
    }
    where.status = query.status;
  }

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { sector: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      {
        user: {
          is: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    pagination: buildPaginationResponse(page, limit, total),
  };
};

const updateAdminCompanyStatus = async (companyId, payload = {}) => {
  if (!COMPANY_STATUSES.includes(payload.status)) {
    throw createHttpError(400, 'status must be PENDING, VALIDATED, REJECTED, or SUSPENDED');
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw createHttpError(404, 'Company not found');
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { status: payload.status },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  console.info(`Admin company status updated: companyId=${companyId}, status=${payload.status}`);

  return updatedCompany;
};

module.exports = {
  getAdminDashboard,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminCompanies,
  updateAdminCompanyStatus,
};
