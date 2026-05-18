const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const healthRoutes = require('./routes/health.routes');
const {
  offerApplicationRouter,
  studentApplicationRouter,
  companyOfferApplicationRouter,
  applicationStatusRouter,
} = require('./routes/application.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/offers', offerApplicationRouter);
app.use('/api/students/applications', studentApplicationRouter);
app.use('/api/companies/offers', companyOfferApplicationRouter);
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

