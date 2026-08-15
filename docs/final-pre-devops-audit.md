# Final Pre-DevOps Audit

Audit executed on branch `chore/final-pre-devops-audit` on 2026-08-15. The
scope was stabilization only: no business feature and no DevOps stack were
introduced.

## Repository

The inventory covered 754 Git-tracked entries and 741 currently searchable
workspace files before this report was added.

| Area | Runtime / framework | Package manager | Validation entry points |
| --- | --- | --- | --- |
| `frontend-web` | React 18, Vite 5 | npm | `npm test`, `npm run build` |
| `backend-api` | Node.js, Express 5, Prisma 6 | npm | `npm test`, `npm run dev`, Prisma commands |
| `ai-service` | Python, FastAPI, Pydantic, LangGraph | pip | `compileall`, unittest discovery, evaluation scripts |
| `mobile-app` | React Native 0.86, Expo 57, TypeScript | npm | lint, typecheck, Expo Doctor, Expo Web, student smoke |
| `database` | PostgreSQL through Prisma | npm / Prisma | generate, validate, connection check |
| `docs` | Markdown | n/a | manual contract and setup review |
| `devops` | preparatory README only | n/a | audited, intentionally not implemented |

Git was clean at audit start. Generated folders, caches, `.env`, Expo state,
Python caches, builds and logs are ignored. No committed private key, credential,
API token or live secret was found by the tracked-file scan. The local backend
`.env` is ignored and its values were never copied into this report.

## Frontend Web

- All route pages and layouts are lazy-loaded behind one `Suspense` fallback.
- The initial production JavaScript chunk decreased from 645.7 kB to 234.0 kB
  (78.86 kB gzip); the previous Vite chunk-size warning is gone.
- Three notification buttons with no implemented behavior were removed.
- Eight unreferenced placeholder pages were removed after route, import,
  documentation and dynamic-reference searches.
- BrowserRouter future flags remove the React Router migration warnings.
- The centralized Axios, cookie and CSRF flow remains unchanged.
- Student, company and admin browser journeys were exercised without console
  errors. No production screen was found presenting a hard-coded AI score,
  offer, application or letter as real data.

There are no `lint` or `typecheck` scripts in this package; these checks are
reported as not applicable rather than claimed as passing.

## Backend API

- Route/controller/service/middleware ownership was traced for auth, profiles,
  CVs, offers, applications, matching, recommendations and letters.
- CV files are no longer exposed through a public `/uploads` static route.
  Authenticated owner-checked CV endpoints remain the supported access path.
- Production startup now requires explicit frontend/CORS origins and rejects
  weak, example or shorter-than-32-character JWT secrets.
- Web auth keeps its HttpOnly cookie and CSRF behavior. Mobile register/login
  returns a Bearer token but no auth cookie; `/me` accepts the Bearer fallback.
- Axios, Multer and Nodemailer were updated to audited supported releases.
- AI failures are normalized and do not expose upstream bodies or traces.
- Application uniqueness is enforced by the existing `(studentId, offerId)`
  compound constraint; ownership checks remain server-side.

The in-memory rate limiter is appropriate for local execution but must be
replaced by shared storage when multiple backend replicas are introduced.

## AI Service

- Matching V3 remains the reference workflow. Older vocabulary, fallbacks and
  evaluation cases were retained where they are still imported or exercised.
- Top-level Python requirements are pinned to the versions validated by this
  audit. Optional semantic-model dependencies remain optional; deterministic
  fallbacks were tested.
- Matching, explainability, skill gap, career assistant and motivation-letter
  suites passed. Structured responses remain Pydantic-validated.
- `pip check` found no broken requirement. `pip-audit` and `pytest` are not
  installed/configured; the repository's actual tests use `unittest`.

## Mobile

- Expo packages were aligned to Expo 57 and React Native 0.86.2; obsolete app
  schema fields were removed.
- Node.js `>=20.19.4` is enforced because the previously available 20.12.2
  runtime reproduced an Expo `styleText` startup crash.
- The complete student API smoke passes 40/40. Its generated CV fixture was
  changed from a fragile hand-written PDF to a valid in-memory DOCX, so text
  extraction and AI matching are genuinely exercised.
- Lint, TypeScript, Expo Doctor (21/21), Expo Web and browser rendering pass.
- No Firebase, FCM, `expo-notifications`, PushDevice, NotificationCenter,
  Flutter application, Dart source, Android project or iOS project exists.
  Occurrences of Flutter in AI taxonomy/evaluation data describe a candidate
  skill and are not abandoned mobile implementation code.

## Database

- `npx prisma generate`: passed with Prisma Client 6.19.3.
- `npx prisma validate`: passed.
- `npm run db:check`: passed against PostgreSQL.
- Schema relations, ownership links, cascades and application uniqueness were
  inspected. No destructive migration or schema edit was needed.
- Reserved E2E users, offers, applications, CVs, letters and vector documents
  were deleted after testing.

## Security

- Authentication, role checks, ownership, CSRF, CORS, JWT expiry, uploads and
  API error redaction were reviewed.
- Manual auth retest: mobile register `201`, Bearer present, auth cookie absent;
  web login `200`, Bearer absent from JSON, HttpOnly auth cookie present.
- Invalid MIME upload returns `415`; cross-resource access remains protected;
  duplicate applications return `409`.
- Secret scan: zero tracked live secrets found. A real secret discovered later
  would still require immediate removal and rotation.
- `npm audit --omit=dev`: backend 0; frontend 2 moderate; mobile 18 (7 moderate,
  11 high), all remaining mobile findings are transitive Expo/Metro build-tool
  paths. npm's proposed forced remediation downgrades Expo/React Native and was
  rejected because it breaks the validated stack.

## Configuration

| Variable group | Service | Required | Secret | Documented source |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | backend | yes | yes | `backend-api/.env.example` |
| JWT/cookie/CSRF settings | backend | production-dependent | JWT yes | backend example and auth docs |
| `FRONTEND_URL`, `CORS_ORIGIN` | backend | yes in production | no | backend example |
| `AI_SERVICE_URL` and AI timeouts | backend | yes | no | backend example / local setup |
| SMTP settings | backend | production-dependent | password yes | backend example |
| `EXPO_PUBLIC_API_URL` | mobile | physical device / override | no | `mobile-app/.env.example` |
| sentence/RAG model download flags | AI | optional | no | `ai-service/.env.example` |

Local ports were verified as frontend `5173`, backend `5000`, AI `8000`, Expo
Web `8090` during audit, and PostgreSQL through `DATABASE_URL`.

## Dependencies

- Backend: Axios 1.19.0, Multer 2.2.0, Nodemailer 9.0.5.
- Frontend: Axios 1.19.0, React Router 6.30.4, Vite 5.4.21; the Vite React plugin
  is correctly classified as a development dependency.
- Mobile: Expo 57-compatible dependency set.
- AI: exact top-level requirement pins.
- No dependency was removed: every declared package had an active runtime,
  build, framework or test role. No notification dependency was present.

## Dead Code

Eight orphan placeholder pages, three inert notification controls and their
three icon imports were removed. No API route, backend function, Python class or
package was removed without proof. See `docs/dead-code-cleanup-report.md`.

## Tests

| Validation | Result |
| --- | --- |
| Frontend tests | PASS, 5/5 |
| Frontend production build | PASS, 1,880 modules; initial JS 234.00 kB |
| Frontend lint / typecheck | NOT_APPLICABLE, scripts absent |
| Backend tests | PASS, 8/8 |
| Backend startup and `/health` | PASS, HTTP 200 |
| Backend without AI | PASS: auth/register/profile/offers/applications available; AI health 503 |
| Prisma generate / validate / DB check | PASS / PASS / PASS |
| AI `compileall` | PASS |
| AI unittest discovery | PASS, 96/96 |
| AI evaluation | PASS, 90/90 across 9 suites |
| pytest | NOT_APPLICABLE, not installed/configured |
| Mobile lint / TypeScript | PASS / PASS |
| Expo Doctor | PASS, 21/21 |
| Expo Web | PASS, HTTP 200 and clean browser console |
| Mobile API smoke | PASS, 40/40 |
| Student web E2E | PASS: auth through CV/profile/application/AI flows |
| Company web E2E | PASS: create/edit/publish offer, candidate and status flow |
| Admin web E2E | PASS: implemented dashboard, users and companies views |

The AI service interruption observed after a desktop connection loss was
reproduced as process termination, not a code failure. After both services were
restarted, direct health, proxy health and the 40-step smoke all passed.

## Performance

- Frontend route splitting removed the measured oversized initial chunk.
- Offer/application lists already use bounded/paginated API paths and mobile
  FlatLists; no matching request is issued per render.
- AI calls are centralized in the backend client with timeout/error mapping.
- Remaining scale concern: in-memory backend rate limiting is process-local.

## Documentation

Updated root status/setup, local setup, mobile setup/auth, security strategy,
environment examples and this audit. Documentation no longer describes mobile
as a future empty module, and it explicitly records the abandoned notification
scope.

## Remaining Issues

| ID | Severity | Component | Description | Cause | Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| AUD-001 | CRITICAL | Backend | Uploaded CVs were reachable from a public static route | Broad Express static mount | Remove mount and add 404 regression test | FIXED |
| AUD-002 | MAJOR | Mobile | Expo crashed on Node 20.12.2 | Runtime below Expo tool requirement | Enforce Node >=20.19.4 | FIXED |
| AUD-003 | MAJOR | Mobile | Expo/RN/Hermes package mismatch | Drifted framework versions | Align Expo 57 package set | FIXED |
| AUD-004 | MAJOR | Backend | Auditable runtime dependency findings | Old Axios/Multer/Nodemailer | Upgrade and retest | FIXED |
| AUD-005 | MAJOR | Frontend | Runtime dependency advisories | Old Axios/React Router | Upgrade non-breaking releases | FIXED |
| AUD-006 | MAJOR | Backend | Production accepted implicit origins and weak JWT examples | Development defaults leaked into production policy | Require explicit origins and strong JWT | FIXED |
| AUD-007 | MAJOR | Auth | Mobile received both Bearer and browser cookie | Shared login response path | Set cookie only for web clients | FIXED |
| AUD-008 | MINOR | Frontend | Initial bundle exceeded 500 kB | Eager page imports | Lazy-load route modules | FIXED |
| AUD-009 | MINOR | Frontend | Three inert notification buttons remained | Abandoned feature shell | Remove controls and imports | FIXED |
| AUD-010 | MINOR | Frontend | Eight orphan placeholder pages | Superseded implementations | Verify references and delete | FIXED |
| AUD-011 | MINOR | AI | Top-level Python versions were loose | Unpinned requirements | Pin validated versions | FIXED |
| AUD-012 | MINOR | Root | Flutter ignore rules remained after removal | Stale configuration | Replace with Expo ignores | FIXED |
| AUD-013 | MINOR | Config | Mobile/model environment setup was incomplete | Missing examples | Add examples and setup notes | FIXED |
| AUD-014 | MINOR | Mobile | Obsolete Expo app schema keys | Version drift | Remove obsolete keys | FIXED |
| AUD-019 | MINOR | Tests | Synthetic PDF CV produced `bad XRef entry` and false AI failures | Fragile hand-written PDF fixture | Generate a valid in-memory DOCX and rerun 40 steps | FIXED |
| AUD-015 | INFO | Frontend | Two moderate production advisories remain | React Router v6 advisory chain | Upgrade to v7 in a dedicated compatibility branch | ACCEPTED |
| AUD-016 | INFO | Mobile | 18 transitive audit findings remain | Expo/Metro build dependencies | Track upstream; do not force destructive downgrade | ACCEPTED |
| AUD-017 | INFO | AI | `pip-audit` and pytest unavailable | Tools not configured by repository | Add security/test tooling during CI design if desired | NOT_APPLICABLE |
| AUD-018 | INFO | Backend | Rate limiter is process-local | In-memory implementation | Select shared store and proxy policy during DevOps | OPEN |

Counts: 19 findings; BLOCKER 0, CRITICAL 1, MAJOR 6, MINOR 8, INFO 4.
Fifteen are fixed, two accepted, one not applicable and one remains open for
the multi-instance DevOps design.

## DevOps Readiness

| Check | State |
| --- | --- |
| Local builds and critical tests | READY |
| Environment examples and ports | READY |
| Secrets externalized | READY |
| Backend and AI health endpoints | READY |
| Prisma generation/migrations | READY |
| Frontend production build | READY |
| Backend and AI startup | READY |
| Mobile lint/typecheck/Web/smoke | READY |
| Notification/Firebase removal | READY |
| Shared rate limit / proxy policy | DEVOPS FOLLOW-UP |
| Dependency advisory monitoring | DEVOPS FOLLOW-UP |

**Decision: READY to begin the DevOps phase.** This is not a claim of production
deployment readiness. The first DevOps work should define a shared rate-limit
store and trusted-proxy policy, create reproducible CI runtimes, and monitor the
accepted frontend/mobile transitive advisories. No Docker, CI/CD, Kubernetes,
cloud, observability or infrastructure code was added in this audit.
