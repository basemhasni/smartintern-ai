const fs = require('node:fs/promises');
const path = require('node:path');
const prisma = require('../src/config/prisma');

async function main() {
  const id = process.env.E2E_RUN_ID;
  if (!/^[a-f0-9]{16}$/.test(id || '')) throw new Error('A 16-character synthetic E2E_RUN_ID is required');
  const users = await prisma.user.findMany({
    where: { email: { endsWith: `-${id}@example.invalid` }, firstName: 'Test', lastName: { in: ['Step10', 'Integration'] } },
    include: { student: { include: { cvs: true } }, company: true },
  });
  const filters = users.flatMap((user) => [
    ...(user.student ? [{ metadataJson: { path: ['studentId'], equals: user.student.id } }] : []),
    ...(user.company ? [{ metadataJson: { path: ['companyId'], equals: user.company.id } }] : []),
  ]);
  if (users.length) await prisma.$transaction([
    ...(filters.length ? [prisma.vectorDocument.deleteMany({ where: { OR: filters } })] : []),
    prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } }),
  ]);
  for (const cv of users.flatMap((user) => user.student?.cvs || [])) {
    const name = path.basename(cv.fileName);
    await fs.rm(path.join(__dirname, '../uploads/cvs', name), { force: true });
  }
  console.log(`Cleaned ${users.length} synthetic E2E accounts and their related records.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
