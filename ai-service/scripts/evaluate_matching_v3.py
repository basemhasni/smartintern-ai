from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.cv_analysis_v3 import analyze_cv_v3
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3
from app.services.offer_analysis_v3 import analyze_offer_v3


def main() -> int:
    cases_path = ROOT / "evaluation" / "cases" / "matching_v3_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    engine = HybridMatchingEngineV3()
    failures = 0

    for case in cases:
        offer_data = case["offer"]
        cv = analyze_cv_v3(case["cv_text"])
        offer = analyze_offer_v3(offer_data["title"], offer_data["description"], offer_data["requiredSkills"], offer_data["optionalSkills"])
        result = engine.match(cv["skills"], offer["requiredSkills"], offer["optionalSkills"], cv, offer, case["cv_text"], offer_data["description"], True)
        minimum, maximum = case["expected_score_min"], case["expected_score_max"]
        score_ok = minimum <= result["score"] <= maximum
        decision_ok = result["decisionLabel"] == case["expected_decision_label"]
        confidence_ok = not case.get("expected_confidence") or result["confidence"] == case["expected_confidence"]
        matched_ok = set(case["expected_matched_skills"]).issubset(result["matchedSkills"])
        missing_ok = set(case["expected_missing_required_skills"]).issubset(result["v3"]["missingRequiredSkills"])
        passed = score_ok and decision_ok and confidence_ok and matched_ok and missing_ok
        failures += 0 if passed else 1

        print(f"Case: {case['name']}")
        print(f"Score: {result['score']} | Expected: {minimum}-{maximum}")
        print(f"Decision: {result['decisionLabel']} | Expected: {case['expected_decision_label']}")
        print(f"Matched: {', '.join(result['matchedSkills']) or '-'}")
        print(f"Missing required: {', '.join(result['v3']['missingRequiredSkills']) or '-'}")
        print("PASS" if passed else "FAIL")
        print(f"Explanation: {result['explanation'][:360]}")
        print()

    print(f"Summary: {len(cases) - failures}/{len(cases)} cases passed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

