# Web and AI Stability Report

Date: 2026-08-13  
Branch: `fix/web-ai-stability`

## 1. Initial symptoms

- Intermittent blank screens when an AI response omitted nested fields.
- Infinite or stale loading states after a long request or a page change.
- Duplicate matching and recommendation requests in React Strict Mode.
- Different technical errors exposed by each backend-to-AI call site.
- No isolated health diagnostic for the AI dependency.
- An unavailable AI service could surface `ECONNREFUSED`, Axios details, or an unhandled render error.

## 2. Audited stack

Frontend: React 18.3.1, React Router 6.28, Vite 5.4, Axios 1.7, React Context/local hooks, HttpOnly cookie authentication and CSRF. There is no TypeScript or state-management library in `frontend-web`.

Backend: Express 5, Prisma 6, Axios, JWT cookie/Bearer authentication, CSRF, role middleware and CORS.

AI service: FastAPI, Pydantic and deterministic Matching V3, Career Assistant V2, Motivation Letter V2, Skill Gap, Explainability, RAG V2 and Orchestrator V2 workflows. No external LLM client is used by the audited paths.

## 3. Reproduced causes and fixes

| ID | Severity | Component | Cause | Correction | Retest |
| --- | --- | --- | --- | --- | --- |
| WEB-01 | High | AI render blocks | Direct `.map()` and nested property access on optional fields | Central normalization plus guarded AI components | Frontend partial-response tests pass |
| WEB-02 | High | Matching V3 | Missing score could become a misleading zero | Missing values remain `null` and render as unavailable | Score-absent test passes |
| WEB-03 | High | Offer detail | Long requests could update state after navigation | Request sequence and unmount guards | Build and navigation retest pass |
| WEB-04 | High | Matching/recommendations | Strict Mode could issue duplicate expensive calls | In-flight request deduplication by offer/parameters | Source audit and build pass |
| WEB-05 | High | Global rendering | No React Error Boundary | Global boundary with retry/dashboard actions | Production build pass |
| WEB-06 | Medium | AI panels | A malformed visualization could hide the whole page | Local AI boundary around complex AI sections | Partial-response tests pass |
| WEB-07 | Medium | Motivation letter | Clipboard rejection was not handled | Rejection is converted to a visible message | Build pass |
| WEB-08 | Medium | Applications | A 409 fallback fabricated a sent application | Refresh real applications or mark duplicate only | Source audit and build pass |
| WEB-09 | Medium | Career Assistant | Repeated submit and stale responses were possible | Submission lock and mounted/request guards | Build pass |
| API-01 | Critical | Backend to AI | Axios calls and hardcoded timeouts were scattered | One `aiClient` owns URL, headers, timeouts and mapping | Backend tests pass |
| API-02 | High | Backend errors | Raw upstream/network details had inconsistent shapes | Stable AI error codes and public messages | Timeout/503/422 tests pass |
| API-03 | High | Availability | No backend AI diagnostic | Added `GET /health/ai` using AI `GET /health` only | Active and stopped retests pass |
| API-04 | Medium | Retry | Retry behavior was implicit/inconsistent | At most one retry, only enabled for transient embedding calls | Source audit and tests pass |
| OBS-01 | Medium | Three services | No shared correlation identifier | `X-Request-ID` propagated frontend to backend to AI | HTTP smoke test pass |
| AI-01 | High | FastAPI errors | Validation routes returned multiple error shapes | Structured validation, HTTP and unhandled exception handlers | Invalid payload retest pass |
| AI-02 | High | Sensitive errors | Validation details could include submitted input | Input values removed; only safe field metadata in development | Direct invalid-payload retest pass |

## 4. Centralized timeouts

All values are configurable in `backend-api/.env` and documented in `.env.example`.

| Workflow | Variable | Default |
| --- | --- | --- |
| Generic/matching | `AI_SERVICE_TIMEOUT_MS`, `AI_MATCHING_TIMEOUT_MS` | 15000 ms |
| Health | `AI_SERVICE_HEALTH_TIMEOUT_MS` | 2500 ms |
| Skill Gap | `AI_SKILL_GAP_TIMEOUT_MS` | 20000 ms |
| Career, letter, orchestrator | `AI_GENERATION_TIMEOUT_MS` | 30000 ms |
| RAG | `AI_RAG_TIMEOUT_MS` | 15000 ms |
| Frontend API | `VITE_API_TIMEOUT_MS` | 15000 ms |

## 5. Error contract and security

The backend returns a safe structure with `error.code`, `error.message` and `requestId`. The frontend converts HTTP/Axios failures to normalized categories such as `NETWORK_ERROR`, `TIMEOUT`, `AUTH_EXPIRED`, `VALIDATION_ERROR`, `RATE_LIMIT`, `AI_SERVICE_UNAVAILABLE`, `AI_SERVICE_TIMEOUT` and `AI_INVALID_RESPONSE`.

Cookies, `withCredentials`, CSRF acquisition/retry and the existing 401 session flow remain in the shared Axios client. No AI call bypasses this client on the web.

Backend and AI logs include request ID, workflow/path, duration, status and error code. They do not include JWTs, passwords, CV text, letters, prompts or embeddings.

## 6. AI stopped scenario

An isolated backend was launched with `AI_SERVICE_URL=http://127.0.0.1:65534`.

- `GET /health`: HTTP 200.
- `GET /api/offers`: HTTP 200, proving a non-AI route remains available.
- `GET /health/ai`: HTTP 503 with `AI_SERVICE_UNAVAILABLE`.
- Protected `POST /api/ai/skill-gap-simulator`: HTTP 503 with the same safe contract.
- No token, stack trace, Axios error or Python exception was returned.

## 7. Tests and measurements

| Validation | Result |
| --- | --- |
| Frontend stability tests | 5/5 pass |
| Backend AI client tests | 5/5 pass |
| AI unit tests | 72/72 pass |
| Python compilation | Pass |
| Frontend production build | Pass, 1878 modules |
| Prisma schema validation | Pass |
| AI evaluation suite | 77/77 pass |
| Browser public landing/login | Rendered successfully, no blank screen |

Isolated HTTP smoke measurements:

| Workflow | Result | Duration |
| --- | --- | --- |
| Invalid Matching payload | HTTP 400, `AI_VALIDATION_ERROR` | 30 ms |
| Matching V3 | HTTP 200, score 57, `PARTIAL_MATCH` | 140 ms |
| Skill Gap | HTTP 200 | 17 ms |
| Career Assistant | HTTP 200 | 22 ms |
| Motivation Letter | HTTP 200, non-empty content | 47 ms |
| Orchestrator V2 | HTTP 200, `SUCCESS` | 126 ms |

The measured workflows are local deterministic executions. Production latency must still be monitored through the new duration logs.

## 8. Evaluation results

- Matching V3: 15/15.
- Career Assistant V2: 8/8.
- Motivation Letter V2: 10/10.
- RAG V2: 8/8.
- Orchestrator V2: 10/10.
- Explainability: 8/8.
- Skill Gap Simulator: 8/8.
- Offer Quality Analyzer: 10/10.
- Global: 77/77 PASS.

## 9. Key files

- `backend-api/src/services/aiClient.js`
- `backend-api/src/core/requestContext.js`
- `backend-api/src/middlewares/requestContext.middleware.js`
- `backend-api/tests/ai-stability.test.js`
- `frontend-web/src/api/apiError.js`
- `frontend-web/src/components/common/AppErrorBoundary.jsx`
- `frontend-web/src/components/ai/AiErrorBoundary.jsx`
- `frontend-web/tests/ai-stability.test.js`
- `ai-service/scripts/smoke_http_workflows.py`

Existing backend AI, RAG, matching, career, motivation and recommendation services now use the centralized client. Existing frontend API adapters, AI normalizers, AI panels, offer detail and career pages were hardened without changing business algorithms.

## 10. Remaining open items

| ID | Severity | Item | Status |
| --- | --- | --- | --- |
| OPEN-01 | Low | Frontend bundle is 647.20 kB (166.41 kB gzip) and triggers Vite's 500 kB warning | Code splitting belongs in a separate performance change |
| OPEN-02 | Low | `frontend-web` is JavaScript and has no existing lint or typecheck configuration | Build parser and targeted tests pass; adding ESLint/TypeScript is a separate tooling task |
| OPEN-03 | Low | `prisma generate` is blocked by a Windows DLL lock while existing backend/Prisma processes are active | Schema validation passes; rerun after stopping those processes |
| OPEN-04 | Medium | Authenticated browser end-to-end paths require an existing test account | Protected behavior was covered by API tests; add a seeded E2E account in a dedicated test environment |

No secret was added. Only example environment files were changed. No automatic commit was created.
