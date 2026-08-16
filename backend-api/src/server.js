require('dotenv').config();

const { validateEnvironment } = require('./config/env');
const prisma = require('./config/prisma');
const app = require('./app');

const PORT = process.env.PORT || 5000;

validateEnvironment();

const server = app.listen(PORT, () => {
  console.log(`SmartIntern AI backend is running on port ${PORT}`);
});

let isShuttingDown = false;

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down.`);

  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  server.close(async (serverError) => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Failed to close the database connection cleanly.');
      process.exit(1);
    }

    if (serverError) {
      console.error('Failed to close the HTTP server cleanly.');
      process.exit(1);
    }

    process.exit(0);
  });
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

