from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from statistics import mean
from time import perf_counter


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.orchestration.orchestrator_v2 import orchestrate_v2  # noqa: E402
from app.rag.grounded_answer_service_v2 import generate_grounded_answer  # noqa: E402
from app.rag.hybrid_retrieval_service_v2 import hybrid_search  # noqa: E402
from app.services.career_assistant_v2_service import generate_career_advice_v2  # noqa: E402
from app.services.cv_analysis_v3 import analyze_cv_v3  # noqa: E402
from app.services.hybrid_matching_engine_v3 import HybridMatchingEngineV3  # noqa: E402
from app.services.motivation_letter_v2_service import generate_motivation_letter_v2  # noqa: E402
from app.services.offer_analysis_v3 import analyze_offer_v3  # noqa: E402
from app.services.skill_gap_simulator_service import simulate_skill_gap_impact  # noqa: E402


CV_TEXT = (
    "Projet de gestion realise avec React, TypeScript, Node.js, Express.js et PostgreSQL. "
    "J ai implemente les composants, les API REST, les migrations et les tests. "
    "Le projet a ete dockerise et documente."
)
OFFER = {
    "id": "benchmark-offer",
    "title": "Stage React Node.js",
    "description": "Construire une application React et Node.js avec PostgreSQL, REST API et Docker.",
    "requiredSkills": ["React", "Node.js", "PostgreSQL", "REST API"],
    "optionalSkills": ["Docker", "CI/CD"],
}
DOCUMENTS = [
    {"id": "doc-1", "title": "Guide React", "text": "Construire et tester des composants React.", "metadata": {"skills": ["React"], "section": "skills"}},
    {"id": "doc-2", "title": "Guide Docker", "text": "Dockeriser une API et documenter son lancement.", "metadata": {"skills": ["Docker"], "section": "projects"}},
]


def _measure(action, repetitions: int) -> dict:
    samples = []
    for _ in range(repetitions):
        started = perf_counter()
        action()
        samples.append((perf_counter() - started) * 1000)
    return {"min": round(min(samples), 2), "average": round(mean(samples), 2), "max": round(max(samples), 2), "runs": repetitions}


def main() -> int:
    parser = argparse.ArgumentParser(description="Benchmark deterministic AI quality workflows.")
    parser.add_argument("--runs", type=int, default=10)
    args = parser.parse_args()
    repetitions = max(1, min(args.runs, 100))

    cv = analyze_cv_v3(CV_TEXT)
    offer_analysis = analyze_offer_v3(OFFER["title"], OFFER["description"], OFFER["requiredSkills"], OFFER["optionalSkills"])
    engine = HybridMatchingEngineV3()

    def matching():
        return engine.match(cv["skills"], OFFER["requiredSkills"], OFFER["optionalSkills"], cv, offer_analysis, CV_TEXT, OFFER["description"], False)

    match = matching()
    student = {"firstName": "Evaluation", "educationLevel": "Licence informatique", "targetJob": "Developpeur fullstack"}
    career_payload = {"student": student, "offer": OFFER, "matching": match, "ragContextDocuments": []}
    letter_payload = {"student": student, "offer": OFFER, "company": {"companyName": "Entreprise test"}, "cvAnalysis": cv, "matching": match}

    def rag():
        search = hybrid_search("React Docker", DOCUMENTS)
        return generate_grounded_answer("Comment renforcer React et Docker ?", search["results"])

    orchestrator_payload = {
        "intent": "CAREER_ADVICE",
        "student": student,
        "offer": OFFER,
        "candidateSkills": cv["skills"],
        "matchingResult": match,
        "options": {"includeRag": False},
    }
    metrics = {
        "matchingWithExplainability": _measure(matching, repetitions),
        "skillGapSimulator": _measure(lambda: simulate_skill_gap_impact(match, ["CI/CD"], {"simulationMode": "REALISTIC", "forceMode": True}), repetitions),
        "careerAssistant": _measure(lambda: generate_career_advice_v2(career_payload), repetitions),
        "motivationLetter": _measure(lambda: generate_motivation_letter_v2(letter_payload), repetitions),
        "ragRetrievalAndAnswer": _measure(rag, repetitions),
        "orchestratorCareerAdvice": _measure(lambda: orchestrate_v2(orchestrator_payload), repetitions),
    }
    print(json.dumps(metrics, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
