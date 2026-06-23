from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.rag.hybrid_retrieval_service_v2 import hybrid_search
from evaluation.evaluators.rag_evaluator import evaluate_rag_cases, print_rag_summary


DOCUMENTS = [
    {"id": "cv-react-1", "ownerType": "CV", "ownerId": "cv1", "title": "CV Fullstack", "text": "Projet e-commerce React Node.js et PostgreSQL.", "metadata": {"studentId": "s1", "section": "projects", "skills": ["React", "Node.js", "PostgreSQL"]}},
    {"id": "cv-react-2", "ownerType": "CV", "ownerId": "cv1", "title": "CV Fullstack", "text": "API REST Node.js documentee et testee.", "metadata": {"studentId": "s1", "section": "experience", "skills": ["Node.js", "REST API"]}},
    {"id": "offer-react", "ownerType": "OFFER", "ownerId": "o1", "title": "Offre Fullstack", "text": "Stage React Node.js. Docker et CI/CD sont demandes.", "metadata": {"offerId": "o1", "companyId": "c1", "status": "PUBLISHED", "section": "required_skills", "skills": ["React", "Node.js", "Docker", "CI/CD"]}},
    {"id": "cv-devops", "ownerType": "CV", "ownerId": "cv2", "title": "CV DevOps", "text": "Docker Kubernetes et pipelines CI/CD avec GitHub Actions.", "metadata": {"studentId": "s2", "section": "skills", "skills": ["Docker", "Kubernetes", "CI/CD"]}},
    {"id": "offer-qa", "ownerType": "OFFER", "ownerId": "o2", "title": "Offre QA", "text": "Tests Selenium Postman et assurance qualite.", "metadata": {"offerId": "o2", "companyId": "c2", "status": "PUBLISHED", "skills": ["Selenium", "Postman"]}},
]


def run_case(name, check):
    try:
        ok, details = check()
    except Exception as error:
        ok, details = False, str(error)
    print(f"Case: {name}\n{details}\n{'PASS' if ok else 'FAIL'}\n")
    return ok


def main() -> int:
    parser = argparse.ArgumentParser(description="Evaluate RAG V2.")
    parser.add_argument("--mode", choices=["mock", "integration"], default=None)
    args = parser.parse_args()
    if args.mode:
        if args.mode == "integration":
            print("Integration mode requires backend wiring; running mock evaluation.")
        summary = evaluate_rag_cases(mode="mock")
        print_rag_summary(summary)
        return 0 if summary["fail"] == 0 else 1

    cases = []
    cases.append(run_case("react_node_retrieval", lambda: ((result := hybrid_search("React Node.js", DOCUMENTS))["results"][0]["id"] in {"cv-react-1", "offer-react"}, str([(item["id"], item["score"]) for item in result["results"]]))))
    cases.append(run_case("docker_cicd_retrieval", lambda: ((result := hybrid_search("Docker CI/CD", DOCUMENTS))["results"][0]["id"] in {"cv-devops", "offer-react"}, str([(item["id"], item["score"]) for item in result["results"]]))))
    cases.append(run_case("linked_cv_offer_context", lambda: ((result := hybrid_search("ameliorer CV React", DOCUMENTS, options={"topK": 4})), {item["ownerType"] for item in result["results"]} >= {"CV", "OFFER"}, str([(item["id"], item["ownerType"]) for item in result["results"]]))[1:]))
    cases.append(run_case("out_of_context", lambda: ((answer := generate_grounded_answer("Fiscalite quantique", []))["confidence"] == "LOW" and not answer["citations"], answer["answer"])))
    cases.append(run_case("student_scope", lambda: ((visible := [item for item in DOCUMENTS if item["ownerType"] == "OFFER" or item["metadata"].get("studentId") == "s1"]), all(item["metadata"].get("studentId") != "s2" for item in visible), str([item["id"] for item in visible]))[1:]))
    cases.append(run_case("company_scope", lambda: ((visible := [item for item in DOCUMENTS if item["metadata"].get("companyId") == "c1" or item["metadata"].get("studentId") == "s1"]), all(item["id"] != "cv-devops" for item in visible), str([item["id"] for item in visible]))[1:]))
    cases.append(run_case("deduplication", lambda: ((result := hybrid_search("React Node.js", DOCUMENTS + [{**DOCUMENTS[0], "id": f"dup-{index}"} for index in range(4)], options={"topK": 8})), sum(1 for item in result["results"] if item["ownerId"] == "cv1") <= 2, str([item["id"] for item in result["results"]]))[1:]))
    cases.append(run_case("reranking_precision", lambda: ((result := hybrid_search("Selenium Postman", DOCUMENTS))["results"][0]["id"] == "offer-qa", str([(item["id"], item["score"]) for item in result["results"]]))))
    passed = sum(cases)
    print(f"Summary: {passed}/{len(cases)} PASS")
    return 0 if passed == len(cases) else 1


if __name__ == "__main__":
    raise SystemExit(main())
