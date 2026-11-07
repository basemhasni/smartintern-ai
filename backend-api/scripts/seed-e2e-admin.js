// CLI-only fixture provisioning, never an HTTP endpoint.
const bcrypt = require('bcrypt');
const prisma = require('../src/config/prisma');

async function main() {
  const id = process.env.E2E_RUN_ID;
  if (!/^[a-f0-9]{16}$/.test(id || '')) throw new Error('A 16-character synthetic E2E_RUN_ID is required');
  await prisma.user.create({ data: {
    firstName: 'Test', lastName: 'Integration', email: `admin-${id}@example.invalid`,
    role: 'ADMIN', passwordHash: await bcrypt.hash(`E2E-${id}-Password123`, 10),
  } });
  console.log('Created the temporary synthetic administrator fixture.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
