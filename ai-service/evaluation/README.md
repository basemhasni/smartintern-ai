# SmartIntern AI - AI Evaluation Suite

This folder contains deterministic evaluation cases for the AI service.

## Structure

```text
evaluation/
  cases/
    matching_cases.json
    career_assistant_cases.json
    motivation_letter_cases.json
    rag_cases.json
    orchestrator_cases.json
  evaluators/
    quality_metrics.py
    matching_evaluator.py
    career_evaluator.py
    letter_evaluator.py
    rag_evaluator.py
    orchestrator_evaluator.py
    explainability_evaluator.py
  expected/
    README.md
  reports/
    .gitkeep
  run_all_evaluations.py
```

## Running

```bash
python scripts/evaluate_ai_suite.py
python scripts/evaluate_matching_v3.py
python scripts/evaluate_career_assistant_v2.py
python scripts/evaluate_motivation_letter_v2.py
python scripts/evaluate_rag_v2.py --mode mock
python scripts/evaluate_orchestrator_v2.py
python scripts/evaluate_explainability.py
python -m unittest discover -s tests -v
```

The suite writes:

- `evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.json`
- `evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.md`

## Quality Fix Triage Workflow

When working on `feature/ai-quality-fixes`, use this loop:

1. Run `python scripts/evaluate_ai_suite.py`.
2. Open the latest JSON report in `evaluation/reports`.
3. Fix only cases with `FAIL` or important `WARNING`.
4. Link each code change to a concrete failed case and root cause.
5. Re-run the targeted evaluator.
6. Re-run the full suite.

Do not weaken critical checks just to make the report green:

- missing skills must never be claimed in a motivation letter;
- required skills absence must not produce a high matching score;
- RAG scope checks must remain strict;
- optional RAG failure should produce `PARTIAL_SUCCESS`, not `FAILED`;
- raw embeddings and sensitive technical fields must not be exposed.

Current quality baseline after the first triage run:

```text
Matching V3: 15/15 PASS
Career Assistant V2: 8/8 PASS
Motivation Letter V2: 10/10 PASS
RAG V2: 8/8 PASS
Orchestrator V2: 8/8 PASS
Explainability: 8/8 PASS
Global: 57/57 PASS
Status: PASS
```

Because no `FAIL` or `WARNING` was detected in that baseline, no service-level
calibration change was required. Future fixes should be driven by newly failing
reports or by newly added stricter cases.

## Case Format

Each case has an `id`, business inputs, and an `expected` object. Expected
values should be calibrated against reviewed product behavior. Do not set
unrealistically narrow score ranges; the purpose is to detect regressions, not
to freeze every internal score.

## Explainability Cases

`evaluation/cases/explainability_cases.json` verifies the Evidence Checker,
Career Signal Map, and AI Decision Trace returned by Matching V3.

The evaluator checks that:

- `skillEvidenceMap` exists and classifies skills as `STRONG`, `MEDIUM`, `WEAK`, or `MISSING`;
- `careerSignalMap.categories` exposes category scores between 0 and 100;
- `globalSignals` contains coherent dominant and weak domains;
- `decisionTrace` contains readable decision steps;
- snippets stay short and no sensitive fields are exposed.

Examples:

- a concrete React project should produce `React = STRONG`;
- Docker mentioned only as learning should stay `WEAK`;
- an absent required skill should stay `MISSING`;
- realistic frontend, mobile, QA, DevOps, and Data / AI cases should produce coherent domain signals.

## Status

- `PASS`: all checks passed.
- `WARNING`: no critical failure, but a quality signal should be reviewed.
- `FAIL`: a required quality rule failed.

Global status:

- `PASS`: no suite has failures or warnings.
- `PASS_WITH_WARNINGS`: at least one warning, no failure.
- `FAIL`: at least one failure.

## Adding A New Case

1. Add the case to the relevant JSON file in `evaluation/cases`.
2. Include a clear `description`.
3. Add expected score ranges, labels, skills, quality flags or status.
4. Run `python scripts/evaluate_ai_suite.py`.
5. Review the generated JSON and Markdown reports.

## Limits

These evaluations do not prove perfect AI quality. They verify controlled
scenarios, regression rules, anti-invention constraints, RAG citation behavior,
and orchestration coherence. Matching still depends on CV text quality and the
current deterministic taxonomy. RAG quality depends on indexed documents and
metadata. Generation remains deterministic without an external LLM.
