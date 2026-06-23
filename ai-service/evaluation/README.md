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
python -m unittest discover -s tests -v
```

The suite writes:

- `evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.json`
- `evaluation/reports/ai_evaluation_report_YYYYMMDD_HHMMSS.md`

## Case Format

Each case has an `id`, business inputs, and an `expected` object. Expected
values should be calibrated against reviewed product behavior. Do not set
unrealistically narrow score ranges; the purpose is to detect regressions, not
to freeze every internal score.

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
