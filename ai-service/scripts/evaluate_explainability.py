from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from evaluation.evaluators.explainability_evaluator import evaluate_explainability_cases, print_explainability_summary


def main() -> int:
    summary = evaluate_explainability_cases()
    print_explainability_summary(summary)
    return 1 if summary["fail"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
