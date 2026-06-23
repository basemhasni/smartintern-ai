from __future__ import annotations

from typing import Any

from app.utils.text_normalization import normalize_text


def check_result(name: str, passed: bool, message: str, severity: str | None = None, details: dict | None = None) -> dict:
    if severity is None:
        severity = "PASS" if passed else "FAIL"
    return {
        "name": name,
        "passed": bool(passed),
        "severity": severity if passed else severity,
        "message": message,
        "details": details or {},
    }


def warning_result(name: str, message: str, details: dict | None = None) -> dict:
    return {"name": name, "passed": True, "severity": "WARNING", "message": message, "details": details or {}}


def assert_score_in_range(actual: int | float | None, min_score: int, max_score: int, name: str = "score_in_range") -> dict:
    value = float(actual or 0)
    passed = min_score <= value <= max_score
    return check_result(name, passed, f"score={value} expected={min_score}-{max_score}", details={"actual": value, "min": min_score, "max": max_score})


def assert_contains_expected_items(actual_list: list[Any], expected_list: list[Any], name: str = "contains_expected") -> dict:
    actual = {normalize_text(str(item)) for item in actual_list or []}
    expected = {normalize_text(str(item)) for item in expected_list or []}
    missing = sorted(expected - actual)
    return check_result(name, not missing, f"missing expected items: {missing}", details={"missing": missing, "expected": list(expected), "actual": list(actual)})


def assert_does_not_contain_forbidden_items(text: str, forbidden_items: list[str], name: str = "forbidden_items") -> dict:
    normalized = normalize_text(text or "")
    found = [item for item in forbidden_items if normalize_text(item) in normalized]
    return check_result(name, not found, f"forbidden items found: {found}", details={"found": found})


def assert_no_missing_skill_claimed(letter: str, missing_skills: list[str], name: str = "no_missing_skill_claimed") -> dict:
    normalized = normalize_text(letter or "")
    risky_markers = (
        "maitrise",
        "maitrisant",
        "competences solides",
        "solide experience",
        "experience",
        "i master",
        "mastering",
        "strong skills",
    )
    claims = []
    for skill in missing_skills or []:
        skill_text = normalize_text(skill)
        sentences = [sentence.strip() for sentence in normalized.replace("\n", " ").split(".")]
        for sentence in sentences:
            if skill_text in sentence and any(marker in sentence for marker in risky_markers):
                claims.append(skill)
                break
    return check_result(name, not claims, f"missing skills claimed: {claims}", details={"claimed": claims})


def assert_quality_checks_passed(quality_checks: dict, name: str = "quality_checks") -> dict:
    required = ["usesOnlyVerifiedSkills", "doesNotClaimMissingSkills", "hasProfessionalTone", "hasClearStructure"]
    failed = [key for key in required if quality_checks.get(key) is False]
    return check_result(name, not failed, f"failed quality checks: {failed}", details={"failed": failed, "qualityChecks": quality_checks})


def assert_non_generic_text(text: str, name: str = "non_generic_text") -> dict:
    normalized = normalize_text(text or "")
    generic_phrases = [
        "travaillez vos competences",
        "continuez a progresser",
        "bonne chance",
        "vous devez ameliorer votre profil",
    ]
    passed = len(normalized.split()) >= 18 and not any(phrase in normalized for phrase in generic_phrases)
    return check_result(name, passed, "text should be specific and long enough", details={"wordCount": len(normalized.split())})


def assert_has_citations_if_rag_used(response: dict, name: str = "rag_citations") -> dict:
    used = bool(response.get("used") or response.get("usedContextCount") or response.get("retrievedContextCount"))
    citations = response.get("citations") or []
    warnings = " ".join(str(item) for item in response.get("warnings") or [])
    passed = not used or bool(citations) or "insuffisant" in normalize_text(warnings)
    return check_result(name, passed, "RAG used responses need citations or insufficient-context warning", details={"used": used, "citationCount": len(citations)})


def assert_status_success_or_partial(response: dict, name: str = "status_success_or_partial") -> dict:
    status = response.get("status")
    return check_result(name, status in {"SUCCESS", "PARTIAL_SUCCESS"}, f"status={status}", details={"status": status})


def calculate_pass_fail(checks: list[dict]) -> dict:
    fails = [check for check in checks if check.get("severity") == "FAIL" or not check.get("passed")]
    warnings = [check for check in checks if check.get("severity") == "WARNING" and check.get("passed")]
    return {
        "passed": not fails,
        "severity": "FAIL" if fails else "WARNING" if warnings else "PASS",
        "passCount": sum(1 for check in checks if check.get("severity") == "PASS" and check.get("passed")),
        "warningCount": len(warnings),
        "failCount": len(fails),
        "checks": checks,
    }
