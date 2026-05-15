require('dotenv').config();

const prisma = require('./prisma');

const checkDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

checkDatabaseConnection();

