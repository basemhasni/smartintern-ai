const fs = require('fs/promises');
const path = require('path');

const backendRoot = path.resolve(__dirname, '../../backend-api');
require(path.join(backendRoot, 'node_modules/dotenv')).config({
  path: path.join(backendRoot, '.env'),
});
const prisma = require(path.join(backendRoot, 'src/config/prisma'));

const baseUrl = process.env.TEST_API_URL || 'http://localhost:5000/api';
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const email = process.env.TEST_ACCOUNT_EMAIL || `mobile-smoke-${runId}@example.test`;
const password = 'MobileTest123!';
const results = [];
let token = null;
let cvId = null;
let offerId = null;
let applicationId = null;
let letterId = null;

const isReservedTestEmail = (value) => (
  /^mobile-smoke-[a-z0-9-]+@example\.test$/.test(value)
  || value === 'mobile-ui-test@example.test'
);

if (!isReservedTestEmail(email)) {
  throw new Error('TEST_ACCOUNT_EMAIL doit utiliser le domaine et le prefixe reserves aux smoke tests.');
}

const record = (name, status, detail = '') => {
  results.push({ name, status, detail });
  process.stdout.write(`${status.padEnd(7)} ${name}${detail ? ` - ${detail}` : ''}\n`);
};

const request = async (endpoint, options = {}) => {
  const { auth = true, timeoutMs = 120_000, ...fetchOptions } = options;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...fetchOptions,
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'application/json',
      'X-Client-Type': 'mobile',
      ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
};

const test = async (name, operation, validate) => {
  try {
    const value = await operation();
    const validation = validate(value);
    if (validation === true) {
      record(name, 'PASS');
      return value;
    }
    record(name, 'FAIL', validation || 'reponse inattendue');
    return value;
  } catch (error) {
    record(name, 'FAIL', error instanceof Error ? error.message : String(error));
    return null;
  }
};

const makePdf = (lines) => {
  const escaped = lines.map((line) => line.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)'));
  const commands = ['BT', '/F1 11 Tf', '72 760 Td'];
  escaped.forEach((line, index) => {
    if (index > 0) commands.push('0 -18 Td');
    commands.push(`(${line}) Tj`);
  });
  commands.push('ET');
  const stream = `${commands.join('\n')}\n`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}endstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
};

const cleanup = async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: {
          include: {
            cvs: true,
            applications: { include: { motivationLetter: true } },
          },
        },
      },
    });
    if (!user) return;

    const student = user.student;
    if (student) {
      const cvIds = student.cvs.map((cv) => cv.id);
      const letterIds = student.applications
        .map((application) => application.motivationLetter?.id)
        .filter(Boolean);
      const careerAdvicePrefix = `${student.id}:`;
      await prisma.vectorDocument.deleteMany({
        where: {
          OR: [
            { ownerType: 'CV', ownerId: { in: cvIds } },
            { ownerType: 'MOTIVATION_LETTER', ownerId: { in: letterIds } },
            { ownerType: 'CAREER_ADVICE', ownerId: { startsWith: careerAdvicePrefix } },
          ],
        },
      });
      await Promise.all(student.cvs.map(async (cv) => {
        const relative = cv.fileUrl.replace(/^\/+/, '');
        await fs.unlink(path.join(backendRoot, relative)).catch((error) => {
          if (error.code !== 'ENOENT') throw error;
        });
      }));
    }
    await prisma.user.delete({ where: { id: user.id } });
    record('Nettoyage du compte et des artefacts', 'PASS');
  } catch (error) {
    record('Nettoyage du compte et des artefacts', 'FAIL', error instanceof Error ? error.message : String(error));
  }
};

const main = async () => {
  if (process.env.CLEAN_ONLY === '1') return;

  await test('Backend health', () => fetch(`${baseUrl.replace(/\/api$/, '')}/health`).then((response) => response.status), (status) => status === 200 || `HTTP ${status}`);

  await test('Register invalide refuse', () => request('/auth/register', {
    method: 'POST', auth: false, body: JSON.stringify({ firstName: 'Test', lastName: 'Mobile', email, password: 'short', role: 'STUDENT' }),
  }), ({ status }) => status === 400 || `HTTP ${status}`);

  await test('Forgot password non enumerant', () => request('/auth/forgot-password', {
    method: 'POST', auth: false, body: JSON.stringify({ email: `missing-${runId}@example.test` }),
  }), ({ status, body }) => status === 200 && typeof body?.message === 'string' || `HTTP ${status}`);

  const registered = await test('Register et token mobile', () => request('/auth/register', {
    method: 'POST', auth: false, body: JSON.stringify({ firstName: 'Test', lastName: 'Mobile', email, password, role: 'STUDENT' }),
  }), ({ status, body }) => status === 201 && body?.user?.role === 'STUDENT' && typeof body?.accessToken === 'string' || `HTTP ${status}`);
  token = registered?.body?.accessToken || null;

  await test('Register doublon refuse', () => request('/auth/register', {
    method: 'POST', auth: false, body: JSON.stringify({ firstName: 'Test', lastName: 'Mobile', email, password, role: 'STUDENT' }),
  }), ({ status }) => status === 400 || `HTTP ${status}`);

  await test('Login mauvais mot de passe', () => request('/auth/login', {
    method: 'POST', auth: false, body: JSON.stringify({ email, password: 'WrongPassword123!' }),
  }), ({ status }) => status === 401 || `HTTP ${status}`);

  const login = await test('Login reel', () => request('/auth/login', {
    method: 'POST', auth: false, body: JSON.stringify({ email, password }),
  }), ({ status, body }) => status === 200 && body?.user?.email === email && typeof body?.accessToken === 'string' || `HTTP ${status}`);
  token = login?.body?.accessToken || token;

  await test('Session /me avec Bearer', () => request('/auth/me'), ({ status, body }) => status === 200 && body?.user?.email === email || `HTTP ${status}`);
  await test('Session invalide refusee', () => request('/auth/me', { headers: { Authorization: 'Bearer invalid-token' } }), ({ status }) => status === 401 || `HTTP ${status}`);

  await test('Profil etudiant charge', () => request('/students/profile'), ({ status, body }) => status === 200 && body?.student?.user?.email === email || `HTTP ${status}`);
  await test('Profil etudiant modifie', () => request('/students/profile', {
    method: 'PUT',
    body: JSON.stringify({ phone: '+216 20 000 000', location: 'Tunis', educationLevel: 'Ingenierie logicielle', targetJob: 'Developpeur mobile', bio: 'Profil temporaire du smoke test mobile.' }),
  }), ({ status, body }) => status === 200 && body?.student?.location === 'Tunis' || `HTTP ${status}`);
  await test('Champ profil interdit refuse', () => request('/students/profile', { method: 'PUT', body: JSON.stringify({ role: 'ADMIN' }) }), ({ status }) => status === 400 || `HTTP ${status}`);

  const offers = await test('Liste des offres publiees', () => request('/offers', { auth: false }), ({ status, body }) => status === 200 && Array.isArray(body?.offers) || `HTTP ${status}`);
  offerId = offers?.body?.offers?.[0]?.id || null;
  if (!offerId) {
    record('Parcours dependant d une offre', 'BLOCKED', 'aucune offre publiee disponible');
    return;
  }
  await test('Detail offre reel', () => request(`/offers/${offerId}`, { auth: false }), ({ status, body }) => status === 200 && body?.offer?.id === offerId || `HTTP ${status}`);
  await test('Offre inconnue', () => request('/offers/00000000-0000-0000-0000-000000000000', { auth: false }), ({ status }) => status === 404 || `HTTP ${status}`);
  await test('Matching bloque sans CV', () => request(`/offers/${offerId}/match`), ({ status }) => status === 400 || `HTTP ${status}`);
  await test('Recommandations bloquees sans CV', () => request('/students/recommendations?limit=3'), ({ status }) => status === 400 || `HTTP ${status}`);

  const invalidForm = new FormData();
  invalidForm.append('cv', new Blob(['not a cv'], { type: 'text/plain' }), 'invalid.txt');
  await test('Format CV invalide refuse', () => request('/students/cv/upload', { method: 'POST', body: invalidForm }), ({ status }) => status === 415 || `HTTP ${status}`);

  const pdf = makePdf([
    'Test Mobile - Software Engineering Student',
    'Skills: JavaScript, TypeScript, React Native, Node.js, Python, SQL, Git',
    'Experience: mobile application development and REST API integration',
    'Education: Software Engineering',
    'Languages: French, English',
  ]);
  const cvForm = new FormData();
  cvForm.append('cv', new Blob([pdf], { type: 'application/pdf' }), 'mobile-smoke-cv.pdf');
  const uploaded = await test('Upload et analyse CV', () => request('/students/cv/upload', { method: 'POST', body: cvForm }), ({ status, body }) => status === 201 && body?.cv?.id && body?.cv?.analysisJson && !body.cv.analysisJson.error || `HTTP ${status}${body?.cv?.analysisJson?.error ? `, ${body.cv.analysisJson.error}` : ''}`);
  cvId = uploaded?.body?.cv?.id || null;
  if (cvId && process.env.UI_FIXTURE_MODE === '1') {
    const currentAnalysis = uploaded?.body?.cv?.analysisJson || {};
    await prisma.cV.update({
      where: { id: cvId },
      data: {
        analysisJson: {
          ...currentAnalysis,
          skills: ['JavaScript', 'TypeScript', 'React Native', 'Node.js', 'Python', 'SQL', 'Git'],
          detectedSkills: ['JavaScript', 'TypeScript', 'React Native', 'Node.js', 'Python', 'SQL', 'Git'],
        },
      },
    });
  }
  await test('Liste CV actualisee', () => request('/students/cv'), ({ status, body }) => status === 200 && body?.cvs?.some((cv) => cv.id === cvId) || `HTTP ${status}`);
  if (cvId) await test('Detail CV autorise', () => request(`/students/cv/${cvId}`), ({ status, body }) => status === 200 && body?.cv?.id === cvId || `HTTP ${status}`);

  const matching = await test('Matching IA via backend', () => request(`/offers/${offerId}/match`, { timeoutMs: 180_000 }), ({ status, body }) => status === 200 && Number.isFinite(body?.matching?.score) || `HTTP ${status}`);
  await test('Matching sans studentId client', async () => matching, ({ body }) => body?.matching && !Object.prototype.hasOwnProperty.call(body.matching, 'requestedStudentId') || 'payload inattendu');
  await test('Recommandations reelles', () => request('/students/recommendations?limit=3', { timeoutMs: 240_000 }), ({ status, body }) => status === 200 && Array.isArray(body?.recommendations) || `HTTP ${status}`);
  await test('Skill Gap mode invalide refuse', () => request(`/offers/${offerId}/skill-gap-simulation`, { method: 'POST', body: JSON.stringify({ mode: 'INVALID' }) }), ({ status }) => status === 400 || `HTTP ${status}`);
  await test('Skill Gap REALISTIC', () => request(`/offers/${offerId}/skill-gap-simulation`, { method: 'POST', body: JSON.stringify({ mode: 'REALISTIC' }), timeoutMs: 240_000 }), ({ status, body }) => status === 200 && body?.simulation && typeof body.simulation === 'object' || `HTTP ${status}`);
  await test('Career Assistant initial', () => request('/students/career-assistant', { method: 'POST', body: JSON.stringify({ offerId }), timeoutMs: 180_000 }), ({ status, body }) => status === 200 && body?.careerAdvice && typeof body.careerAdvice === 'object' || `HTTP ${status}`);
  await test('Career Assistant question personnalisee', () => request('/students/career-assistant', { method: 'POST', body: JSON.stringify({ offerId, question: 'Quelles competences dois-je prioriser cette semaine ?' }), timeoutMs: 180_000 }), ({ status, body }) => status === 200 && body?.careerAdvice && typeof body.careerAdvice === 'object' || `HTTP ${status}`);
  await test('Career Assistant question trop longue', () => request('/students/career-assistant', { method: 'POST', body: JSON.stringify({ offerId, question: 'a'.repeat(501) }) }), ({ status }) => status === 413 || `HTTP ${status}`);

  const application = await test('Candidature creee', () => request(`/offers/${offerId}/apply`, { method: 'POST', body: JSON.stringify({}) }), ({ status, body }) => status === 201 && body?.application?.offerId === offerId && body?.application?.status === 'SENT' || `HTTP ${status}`);
  applicationId = application?.body?.application?.id || null;
  await test('Candidature en double bloquee', () => request(`/offers/${offerId}/apply`, { method: 'POST', body: JSON.stringify({}) }), ({ status }) => status === 409 || `HTTP ${status}`);
  await test('Liste candidatures synchronisee', () => request('/students/applications'), ({ status, body }) => status === 200 && body?.applications?.some((item) => item.id === applicationId && item.offer?.id === offerId) || `HTTP ${status}`);

  await test('Liste lettres initiale', () => request('/applications/motivation-letters'), ({ status, body }) => status === 200 && Array.isArray(body?.motivationLetters) || `HTTP ${status}`);
  if (applicationId) {
    const letter = await test('Lettre de motivation generee', () => request(`/applications/${applicationId}/generate-letter`, { method: 'POST', body: JSON.stringify({ tone: 'PROFESSIONAL' }), timeoutMs: 240_000 }), ({ status, body }) => status === 200 && body?.motivationLetter?.content?.length > 100 || `HTTP ${status}`);
    letterId = letter?.body?.motivationLetter?.id || null;
    await test('Detail lettre charge', () => request(`/applications/${applicationId}/motivation-letter`), ({ status, body }) => status === 200 && body?.motivationLetter?.id === letterId || `HTTP ${status}`);
    const editedContent = `${letter?.body?.motivationLetter?.content || 'Contenu du test.'}\n\nRevision mobile test.`;
    await test('Lettre modifiee et persistee', () => request(`/applications/${applicationId}/motivation-letter`, { method: 'PUT', body: JSON.stringify({ content: editedContent }) }), ({ status, body }) => status === 200 && body?.motivationLetter?.content?.endsWith('Revision mobile test.') && body?.motivationLetter?.generatedByAI === false || `HTTP ${status}`);
  }

  await test('Logout backend', () => request('/auth/logout', { method: 'POST', body: JSON.stringify({}) }), ({ status }) => status === 200 || `HTTP ${status}`);
  if (cvId && process.env.KEEP_TEST_DATA !== '1') {
    await test('Suppression CV', () => request(`/students/cv/${cvId}`, { method: 'DELETE' }), ({ status }) => status === 200 || `HTTP ${status}`);
    await test('CV supprime inaccessible', () => request(`/students/cv/${cvId}`), ({ status }) => status === 404 || `HTTP ${status}`);
    cvId = null;
  }
};

main()
  .catch((error) => record('Execution du smoke test', 'FAIL', error instanceof Error ? error.message : String(error)))
  .finally(async () => {
    if (process.env.KEEP_TEST_DATA === '1' && process.env.CLEAN_ONLY !== '1') {
      record('Conservation temporaire des donnees UI', 'PASS');
    } else {
      await cleanup();
    }
    await prisma.$disconnect();
    const counts = results.reduce((accumulator, result) => {
      accumulator[result.status] = (accumulator[result.status] || 0) + 1;
      return accumulator;
    }, {});
    process.stdout.write(`\nSUMMARY ${JSON.stringify(counts)}\n`);
    if (results.some((result) => result.status === 'FAIL')) process.exitCode = 1;
  });
