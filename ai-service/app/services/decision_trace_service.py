"""Human-readable AI decision trace for matching."""

from __future__ import annotations

from typing import Any


def _as_dict(value: Any) -> dict:
    return value if isinstance(value, dict) else {}


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _step(step: str, title: str, status: str, summary: str, details: list[str] | None = None) -> dict:
    return {
        "step": step,
        "title": title,
        "status": status,
        "summary": summary,
        "details": [detail for detail in (details or []) if detail][:6],
    }


def build_decision_trace(cv_analysis: dict, offer_analysis: dict, matching_result: dict, explainability: dict) -> list[dict]:
    v3 = _as_dict(matching_result.get("v3"))
    matrix = _as_list(v3.get("coverageMatrix"))
    evidence_summary = _as_dict(explainability.get("evidenceSummary"))
    signal_map = _as_dict(explainability.get("careerSignalMap"))
    global_signals = _as_dict(signal_map.get("globalSignals"))

    skills = _as_list(cv_analysis.get("detectedSkills")) or _as_list(cv_analysis.get("skills"))
    domains = _as_list(cv_analysis.get("domainSignals"))
    cv_quality = _as_dict(cv_analysis.get("rawTextQuality")).get("quality", "UNKNOWN")
    required = _as_list(offer_analysis.get("requiredSkills"))
    optional = _as_list(offer_analysis.get("optionalSkills"))
    matched = _as_list(matching_result.get("matchedSkills"))
    missing_required = _as_list(v3.get("missingRequiredSkills")) or _as_list(matching_result.get("missingSkills"))
    critical_missing = _as_list(v3.get("criticalMissingSkills"))
    partial = _as_list(v3.get("partialMatchedSkills"))
    score_breakdown = _as_dict(v3.get("scoreBreakdown"))

    trace = [
        _step(
            "CV_ANALYSIS",
            "Analyse du CV",
            "SUCCESS" if skills else "WARNING",
            f"Le CV contient {len(skills)} competence(s) detectee(s) avec une qualite de texte {cv_quality}.",
            [
                f"Domaines detectes: {', '.join(domains[:4])}." if domains else "Aucun domaine technique clair n'a ete detecte.",
                f"Competences principales: {', '.join(skills[:6])}." if skills else "Le CV doit etre enrichi avec des projets et technologies concretes.",
            ],
        ),
        _step(
            "OFFER_ANALYSIS",
            "Analyse de l'offre",
            "SUCCESS" if required else "WARNING",
            f"L'offre contient {len(required)} competence(s) requise(s) et {len(optional)} competence(s) optionnelle(s).",
            [
                f"Exigences principales: {', '.join(required[:6])}." if required else "Les exigences de l'offre restent peu exploitables.",
                f"Competences optionnelles: {', '.join(optional[:5])}." if optional else "",
            ],
        ),
        _step(
            "EVIDENCE_CHECK",
            "Verification des preuves",
            "SUCCESS" if evidence_summary.get("strong") or evidence_summary.get("medium") else "WARNING",
            (
                f"Preuves: {evidence_summary.get('strong', 0)} fortes, "
                f"{evidence_summary.get('medium', 0)} moyennes, "
                f"{evidence_summary.get('weak', 0)} faibles, "
                f"{evidence_summary.get('missing', 0)} absentes."
            ),
            [
                f"Meilleur domaine de preuve: {global_signals.get('bestEvidenceCategory')}." if global_signals.get("bestEvidenceCategory") else "",
                f"Domaines a renforcer: {', '.join(global_signals.get('weakDomains', [])[:3])}." if global_signals.get("weakDomains") else "",
            ],
        ),
        _step(
            "REQUIREMENT_COVERAGE",
            "Couverture des exigences",
            "SUCCESS" if matrix else "WARNING",
            f"{len(matched)} competence(s) obligatoire(s) sont couvertes; {len(missing_required)} restent manquantes.",
            [
                f"Competences couvertes: {', '.join(matched[:6])}." if matched else "Aucune competence requise n'est fortement couverte.",
                f"Competences critiques manquantes: {', '.join(critical_missing[:4])}." if critical_missing else "",
                f"Correspondances partielles: {', '.join(str(item.get('skill')) for item in partial[:4] if isinstance(item, dict))}." if partial else "",
            ],
        ),
        _step(
            "SCORING",
            "Calcul du score",
            "SUCCESS",
            f"Le score final est {matching_result.get('score')}/100 avec une confiance {matching_result.get('confidence', 'LOW')}.",
            [
                f"Decision: {matching_result.get('decisionLabel')}." if matching_result.get("decisionLabel") else "",
                f"Contribution exigences critiques: {score_breakdown.get('criticalSkills')}." if score_breakdown else "",
                f"Le score est limite par: {', '.join(critical_missing[:3])}." if critical_missing else "",
            ],
        ),
    ]
    return trace
