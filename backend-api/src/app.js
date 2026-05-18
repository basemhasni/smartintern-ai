const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const companyRoutes = require('./routes/company.routes');
const healthRoutes = require('./routes/health.routes');
const { companyOfferRouter, publicOfferRouter } = require('./routes/offer.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/companies/offers', companyOfferRouter);
app.use('/api/companies', companyRoutes);
app.use('/api/offers', publicOfferRouter);

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

