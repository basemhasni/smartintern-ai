# SmartIntern AI - AI Quality Evaluation Report

Date: `2026-08-15`

## 1. Scope

This iteration improves the precision, consistency and explainability of the
existing deterministic AI pipeline. It does not replace the architecture and
does not change `backend-api`, `frontend-web` or `mobile-app`.

Audited flow:

1. CV and offer analysis.
2. Skill normalization and evidence extraction.
3. Matching V3, score, confidence, decision label and Decision Trace.
4. Career Signal Map and Skill Gap Simulator.
5. Career Assistant and Motivation Letter V2.
6. RAG retrieval, citations and Orchestrator V2.
7. Existing unit and evaluation suites.

## 2. Baseline Findings

The original baseline was technically green (`72/72` unit tests and `77/77`
evaluation cases), but targeted probes exposed quality gaps not covered by the
suite:

| Probe | Previous behavior | Risk |
| --- | --- | --- |
| Angular -> React | `RELATED`, coverage `0.55` | Framework transfer presented too strongly |
| Docker -> Kubernetes | `RELATED`, coverage `0.55` | Tool proximity overvalued |
| SQL -> PostgreSQL | `RELATED`, coverage `0.55` | Generic SQL treated too close to a DBMS |
| Skill name without evidence | coverage up to `0.92` | Keyword stuffing could look like mastery |
| Concise concrete CV | score capped at `60`, confidence `LOW` | False negative caused by text length |
| Low-relevance RAG context | accepted from score `0.08` | Weak grounding and noisy citations |
| Skill Gap simulation | separate approximate formula | Potential drift from Matching V3 |

The first run of the new strict consistency suite passed only `8/13` cases,
with a critical false-positive rate of `60%`.

## 3. Corrections

### Skill semantics

- Added directional relations: `EXACT`, `ALIAS`, `RELATED`, `TRANSFERABLE`
  and `DIFFERENT`.
- Added explicit protection for React/Angular, Java/JavaScript,
  Docker/Kubernetes, SQL/PostgreSQL, Git/GitLab CI, Jenkins/CI/CD,
  FastAPI/Flask, Node.js/Express.js, Spring/Spring Boot and React/React Native.
- Added canonical entries for Flask, GitLab CI and Spring Framework.
- Kept fuzzy and semantic signals below direct mastery thresholds.

### Evidence quality

- Evidence hierarchy now includes project, experience, certification,
  education, skill list, summary and unknown context.
- A skill list alone is `WEAK` and no longer enters `matchedSkills`.
- Weak wording reduces evidence confidence.
- Negations before or after a skill are ignored by extraction.
- Project or experience context can continue across short action sentences.
- Concise CVs with several concrete, attributable skills are no longer marked
  low quality only because of their length.

### Matching consistency

- Related or transferable technologies are resolved before semantic matching,
  preventing embedding similarity from overriding taxonomy safeguards.
- Missing critical requirements cap both score interpretation and decision
  label.
- `LOW` confidence produces `INSUFFICIENT_DATA` instead of a positive label.
- Score breakdown evidence credit is proportional to coverage and proof.
- Matching V3 exposes a compact `scoringContext` used by simulations; it does
  not expose CV text or sensitive data.

### Downstream modules

- Skill Gap Simulator recalculates scenarios with the Matching V3 formula.
- Modes use explicit assumptions: weak (`CONSERVATIVE`), medium
  (`REALISTIC`) and strong (`OPTIMISTIC`).
- Career Assistant ignores low-relevance RAG documents.
- Motivation Letter V2 no longer falls back to unrelated CV skills and only
  uses sufficiently relevant RAG metadata.
- RAG retrieval includes skill metadata and raises the grounding threshold
  from `0.08` to `0.18` for answers and citations.

## 4. Controlled Dataset

The file
`ai-service/evaluation/cases/ai_quality_consistency_cases.json` contains seven
versioned profiles (`PROFILE-01` to `PROFILE-07`) and seven offers (`OFFER-01`
to `OFFER-07`). These are evaluation fixtures only and are not application
data.

Representative results:

| Case | Result |
| --- | --- |
| Angular vs React | `51`, `MEDIUM`, `PARTIAL_MATCH`, React transferable and missing |
| Java vs JavaScript | `10`, `MEDIUM`, `VERY_LOW_MATCH`, JavaScript missing |
| Docker/Jenkins vs Kubernetes/CI-CD | `53`, `MEDIUM`, `PARTIAL_MATCH` |
| SQL vs PostgreSQL | `35`, `LOW`, `INSUFFICIENT_DATA`, PostgreSQL transferable |
| Git vs GitLab CI | `23`, `MEDIUM`, `VERY_LOW_MATCH`, GitLab CI missing |
| Flask vs FastAPI | `36`, `MEDIUM`, `LOW_MATCH`, FastAPI missing |
| Strong React/TypeScript proof | `88`, `MEDIUM`, `STRONG_MATCH` |

## 5. Evaluation Results

| Metric | Before | After |
| --- | ---: | ---: |
| Unit tests | 72/72 | 96/96 |
| Global evaluation cases | 77/77 | 90/90 |
| Strict consistency cases | 8/13 on first strict run | 13/13 |
| Critical false-positive rate | 60% on first strict run | 0% |
| Critical false-negative rate | 0% | 0% |
| Repeatability | Not measured | 100% on controlled repeats |

All nine evaluation suites pass without warnings:

- Matching V3: `15/15`.
- Career Assistant V2: `8/8`.
- Motivation Letter V2: `10/10`.
- RAG V2: `8/8`.
- Orchestrator V2: `10/10`.
- Explainability: `8/8`.
- Skill Gap Simulator: `8/8`.
- Offer Quality Analyzer: `10/10`.
- AI Quality Consistency: `13/13`.

## 6. Metamorphic And Stability Checks

- Adding relevant concrete evidence does not lower the score.
- Adding an unrelated skill changes the score by at most two points.
- `Postgres` and `PostgreSQL` remain within two points.
- Three identical runs produce the same score, confidence, label and matched
  skills.
- All scores remain between 0 and 100.
- Conservative, realistic and optimistic simulation outputs are ordered.
- Low-relevance RAG context produces no citation or generated fact.
- Motivation letters do not claim a missing or unrelated skill.

## 7. Local Performance

Measured locally with `python scripts/benchmark_ai_quality.py --runs 10`.
Times are milliseconds and include deterministic service logic only.

| Workflow | Min | Average | Max |
| --- | ---: | ---: | ---: |
| Matching with explainability | 127.77 | 153.39 | 200.39 |
| Skill Gap Simulator | 1.55 | 1.75 | 1.91 |
| Career Assistant | 3.20 | 4.05 | 4.71 |
| Motivation Letter | 66.49 | 69.76 | 71.43 |
| RAG retrieval and answer | 3.64 | 4.82 | 5.99 |
| Orchestrator career advice | 33.09 | 39.37 | 46.29 |

These numbers are a local regression baseline, not a production SLA. External
model calls, database access, HTTP latency and a production vector store are
not included.

## 8. Commands

```bash
cd ai-service
python -m unittest discover -s tests -p "test_*.py"
python scripts/evaluate_ai_quality_consistency.py
python scripts/evaluate_ai_suite.py --no-report
python scripts/benchmark_ai_quality.py --runs 10
python -m compileall app evaluation scripts tests
```

## 9. Remaining Limits

- The taxonomy is finite and must be extended when new technologies enter the
  product domain.
- Semantic matching for unknown skills remains deliberately conservative.
- Score calibration is a product heuristic, not a prediction of recruitment
  outcome.
- Live RAG integration quality still depends on indexed document quality,
  metadata and access-control filtering in the backend.
- The current letter generator is deterministic and French-first.
- Production performance must be measured with real HTTP, database and model
  dependencies.

No automatic commit was created for this work.
