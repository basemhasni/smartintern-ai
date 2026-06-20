from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.cv_analysis_v2 import analyze_cv_v2
from app.services.matching_engine_v2 import match_profile_to_offer
from app.services.offer_analysis_v2 import analyze_offer_v2


def main() -> int:
    fixture_path = ROOT / "tests" / "fixtures" / "matching_cases.json"
    cases = json.loads(fixture_path.read_text(encoding="utf-8"))
    failures = 0

    for case in cases:
        offer_data = case["offer"]
        cv_analysis = analyze_cv_v2(case["cvText"])
        offer_analysis = analyze_offer_v2(
            offer_data["title"],
            offer_data["description"],
            offer_data.get("requiredSkills"),
            offer_data.get("optionalSkills"),
        )
        result = match_profile_to_offer(cv_analysis, offer_analysis)
        minimum, maximum = case["expectedRange"]
        score_ok = minimum <= result["score"] <= maximum
        confidence_ok = not case.get("expectedConfidence") or result["confidence"] == case["expectedConfidence"]
        passed = score_ok and confidence_ok
        failures += 0 if passed else 1

        print(f"Case: {case['name']}")
        print(f"Expected: {minimum}-{maximum}")
        print(f"Actual: {result['score']} ({result['confidence']}, {result['decisionLabel']})")
        print("PASS" if passed else "FAIL")
        print(f"Explanation: {result['explanation']}")
        print()

    print(f"Summary: {len(cases) - failures}/{len(cases)} cases passed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

