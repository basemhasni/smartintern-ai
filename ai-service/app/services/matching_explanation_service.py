"""Professional, case-specific explanations for hybrid matching."""

from __future__ import annotations


def generate_matching_explanation(
    score: int,
    confidence: str,
    coverage_matrix: list[dict],
    domain_alignment: dict,
    warnings: list[str],
) -> str:
    critical = [row for row in coverage_matrix if row["importance"] == "CRITICAL"]
    required = [row for row in coverage_matrix if row["importance"] in ("CRITICAL", "REQUIRED")]
    covered_critical = [row for row in critical if row["coverage"] >= 0.75]
    covered_required = [row for row in required if row["coverage"] >= 0.75]
    partial = [row for row in required if 0 < row["coverage"] < 0.75]
    missing = [row for row in required if row["coverage"] == 0]
    evidence_rows = [row for row in required if row.get("evidence")]

    parts = [
        f"Le profil couvre solidement {len(covered_required)} exigence(s) requise(s) sur {len(required)}."
    ]
    if critical:
        parts.append(f"Parmi les competences critiques, {len(covered_critical)} sur {len(critical)} sont couvertes.")
    if covered_required:
        parts.append(f"Les correspondances les mieux justifiees sont {', '.join(row['requirement'] for row in covered_required[:5])}.")
    if evidence_rows:
        proof_types = sorted({row.get("evidenceType", "UNKNOWN") for row in evidence_rows})
        parts.append(f"Les preuves exploitables proviennent principalement de contextes {', '.join(proof_types).lower()}.")
    if partial:
        parts.append(f"Une couverture partielle est observee pour {', '.join(row['requirement'] for row in partial[:4])}; elle ne vaut pas maitrise explicite.")
    if missing:
        parts.append(f"Le score est limite par l'absence de {', '.join(row['requirement'] for row in missing[:5])}.")
    if domain_alignment.get("score", 0) >= 0.75:
        parts.append(f"L'alignement de domaine est fort avec l'orientation {domain_alignment.get('offerDomain', 'de l offre')}.")
    elif domain_alignment.get("score", 0) < 0.45:
        parts.append("L'alignement de domaine reste faible ou insuffisamment documente.")
    if warnings:
        parts.append(f"Le score a ete contraint par : {'; '.join(warnings[:3])}.")
    parts.append(f"Le score final est {score}/100 avec une confiance {confidence.lower()}.")
    return " ".join(parts)

