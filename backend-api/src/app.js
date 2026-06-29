const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const { getAllowedOrigins } = require('./config/env');
const { csrfProtection } = require('./middlewares/csrf.middleware');
const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const candidateRankingRoutes = require('./routes/candidateRanking.routes');
const careerAssistantRoutes = require('./routes/careerAssistant.routes');
const companyRoutes = require('./routes/company.routes');
const cvRoutes = require('./routes/cv.routes');
const healthRoutes = require('./routes/health.routes');
const matchingRoutes = require('./routes/matching.routes');
const motivationLetterRoutes = require('./routes/motivationLetter.routes');
const ragRoutes = require('./routes/rag.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const studentRoutes = require('./routes/student.routes');
const testProtectedRoutes = require('./routes/test-protected.routes');
const {
  offerApplicationRouter,
  studentApplicationRouter,
  companyOfferApplicationRouter,
  applicationStatusRouter,
} = require('./routes/application.routes');
const { companyOfferRouter, publicOfferRouter } = require('./routes/offer.routes');

const app = express();
const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error('Origin is not allowed by CORS');
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(csrfProtection);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testProtectedRoutes);
}
app.use('/api/rag', ragRoutes);
app.use('/api/students/cv', cvRoutes);
app.use('/api/students/applications', studentApplicationRouter);
app.use('/api/students', careerAssistantRoutes);
app.use('/api/students', recommendationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies/offers', companyOfferApplicationRouter);
app.use('/api/companies/offers', candidateRankingRoutes);
app.use('/api/companies/offers', companyOfferRouter);
app.use('/api/companies', companyRoutes);
app.use('/api/offers', offerApplicationRouter);
app.use('/api/offers', matchingRoutes);
app.use('/api/offers', publicOfferRouter);
app.use('/api/applications', motivationLetterRoutes);
app.use('/api/applications', applicationStatusRouter);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
  });
});

module.exports = app;

