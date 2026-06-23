from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from evaluation.run_all_evaluations import print_suite_summary, run_all_evaluations  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Run the full SmartIntern AI evaluation suite.")
    parser.add_argument("--rag-mode", choices=["mock", "integration"], default="mock")
    parser.add_argument("--no-report", action="store_true", help="Do not write JSON/Markdown reports.")
    args = parser.parse_args()

    if args.rag_mode == "integration":
        print("Integration RAG mode is not wired to a live backend in this runner yet; using mock mode.")
        args.rag_mode = "mock"

    report = run_all_evaluations(write_reports=not args.no_report, rag_mode=args.rag_mode)
    print_suite_summary(report)
    return 1 if report["global"]["status"] == "FAIL" else 0


if __name__ == "__main__":
    raise SystemExit(main())
