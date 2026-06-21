"""CV V3 enrichment with attributable evidence."""

from app.services.cv_analysis_v2 import analyze_cv_v2
from app.services.evidence_extraction_service import build_candidate_evidence_profile


def analyze_cv_v3(text: str) -> dict:
    analysis = analyze_cv_v2(text)
    analysis["evidenceProfile"] = build_candidate_evidence_profile(analysis, text)
    return analysis

