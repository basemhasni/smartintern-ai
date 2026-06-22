require('dotenv').config();

const prisma = require('../src/config/prisma');
const { reindexAllDocuments } = require('../src/services/ragIndexing.service');

const main = async () => {
  console.log('RAG V2 reindex started. Existing chunks are replaced owner by owner.');
  const summary = await reindexAllDocuments();
  console.log(`Processed: ${summary.processed}`);
  console.log(`Indexed: ${summary.indexed}`);
  console.log(`Failed: ${summary.failed}`);
  process.exitCode = summary.failed ? 1 : 0;
};

main()
  .catch((error) => { console.error('RAG reindex failed:', error.message); process.exitCode = 1; })
  .finally(async () => prisma.$disconnect());
