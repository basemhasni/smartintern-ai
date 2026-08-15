from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from evaluation.evaluators.consistency_evaluator import evaluate_consistency_cases  # noqa: E402


def main() -> int:
    summary = evaluate_consistency_cases()
    print(json.dumps({key: value for key, value in summary.items() if key != "results"}, indent=2, ensure_ascii=False))
    for result in summary["results"]:
        print(f"[{result['severity']}] {result['id']} ({result['category']})")
        for check in result.get("checks", []):
            if not check.get("passed"):
                print(f"  - {check['name']}: {check['message']}")
    return 1 if summary["fail"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
