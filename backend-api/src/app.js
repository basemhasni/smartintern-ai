const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const cvRoutes = require('./routes/cv.routes');
const healthRoutes = require('./routes/health.routes');
const matchingRoutes = require('./routes/matching.routes');
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

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/test', testProtectedRoutes);
app.use('/api/students/cv', cvRoutes);
app.use('/api/students/applications', studentApplicationRouter);
app.use('/api/students', studentRoutes);
app.use('/api/companies/offers', companyOfferApplicationRouter);
app.use('/api/companies/offers', companyOfferRouter);
app.use('/api/companies', companyRoutes);
app.use('/api/offers', offerApplicationRouter);
app.use('/api/offers', matchingRoutes);
app.use('/api/offers', publicOfferRouter);
app.use('/api/applications', applicationStatusRouter);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

