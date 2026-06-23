from __future__ import annotations

import json
from pathlib import Path

from app.rag.grounded_answer_service_v2 import generate_grounded_answer
from app.rag.hybrid_retrieval_service_v2 import hybrid_search
from evaluation.evaluators.quality_metrics import assert_has_citations_if_rag_used, calculate_pass_fail, check_result


ROOT = Path(__file__).resolve().parents[2]

DEFAULT_DOCUMENTS = [
    {"id": "cv-react-1", "ownerType": "CV", "ownerId": "cv1", "title": "CV Fullstack", "text": "Projet e-commerce React Node.js et PostgreSQL.", "metadata": {"studentId": "s1", "section": "projects", "skills": ["React", "Node.js", "PostgreSQL"]}},
    {"id": "cv-react-2", "ownerType": "CV", "ownerId": "cv1", "title": "CV Fullstack", "text": "API REST Node.js documentee et testee.", "metadata": {"studentId": "s1", "section": "experience", "skills": ["Node.js", "REST API"]}},
    {"id": "offer-react", "ownerType": "OFFER", "ownerId": "o1", "title": "Offre Fullstack", "text": "Stage React Node.js. Docker et CI/CD sont demandes.", "metadata": {"offerId": "o1", "companyId": "c1", "status": "PUBLISHED", "section": "required_skills", "skills": ["React", "Node.js", "Docker", "CI/CD"]}},
    {"id": "cv-devops", "ownerType": "CV", "ownerId": "cv2", "title": "CV DevOps", "text": "Docker Kubernetes et pipelines CI/CD avec GitHub Actions.", "metadata": {"studentId": "s2", "section": "skills", "skills": ["Docker", "Kubernetes", "CI/CD"]}},
    {"id": "offer-qa", "ownerType": "OFFER", "ownerId": "o2", "title": "Offre QA", "text": "Tests Selenium Postman et assurance qualite.", "metadata": {"offerId": "o2", "companyId": "c2", "status": "PUBLISHED", "skills": ["Selenium", "Postman"]}},
]


def _scope_documents(documents: list[dict], scope: dict | None) -> list[dict]:
    if not scope:
        return documents
    role = scope.get("role")
    if role == "STUDENT":
        student_id = scope.get("studentId")
        return [doc for doc in documents if doc.get("ownerType") == "OFFER" or doc.get("metadata", {}).get("studentId") == student_id]
    if role == "COMPANY":
        company_id = scope.get("companyId")
        allowed_students = set(scope.get("allowedStudentIds") or [])
        return [
            doc
            for doc in documents
            if doc.get("metadata", {}).get("companyId") == company_id
            or doc.get("metadata", {}).get("studentId") in allowed_students
        ]
    return documents


def evaluate_rag_cases(cases_path: Path | None = None, mode: str = "mock") -> dict:
    cases_path = cases_path or ROOT / "evaluation" / "cases" / "rag_cases.json"
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    results = []

    for case in cases:
        checks = []
        if case.get("expectedInsufficient"):
            answer = generate_grounded_answer(case.get("question", ""), case.get("contexts", []))
            checks.append(check_result("insufficient_context", answer.get("confidence") == "LOW" and not answer.get("citations"), "out-of-context query should be LOW with no citations"))
            checks.append(assert_has_citations_if_rag_used(answer))
            result_payload = {"answer": answer}
        else:
            documents = DEFAULT_DOCUMENTS
            if case.get("duplicateOwnerId"):
                documents = documents + [{**DEFAULT_DOCUMENTS[0], "id": f"dup-{idx}"} for idx in range(4)]
            scoped = _scope_documents(documents, case.get("scope"))
            search = hybrid_search(case.get("query", ""), scoped, options={"topK": 8})
            ids = [item["id"] for item in search.get("results", [])]
            owner_types = {item.get("ownerType") for item in search.get("results", [])}
            checks.append(check_result("has_results", bool(search.get("results")), "retrieval should return results"))
            if case.get("expectedTopIds"):
                checks.append(check_result("expected_top", bool(ids) and ids[0] in case["expectedTopIds"], f"top={ids[:1]} expected={case['expectedTopIds']}"))
            if case.get("expectedOwnerTypes"):
                checks.append(check_result("expected_owner_types", set(case["expectedOwnerTypes"]).issubset(owner_types), f"ownerTypes={owner_types} expected={case['expectedOwnerTypes']}"))
            if case.get("forbiddenIds"):
                forbidden = [item for item in ids if item in case["forbiddenIds"]]
                checks.append(check_result("scope_security", not forbidden, f"forbidden ids returned: {forbidden}"))
            if case.get("maxPerOwner"):
                owner_id = case.get("duplicateOwnerId")
                count = sum(1 for item in search.get("results", []) if item.get("ownerId") == owner_id)
                checks.append(check_result("deduplication", count <= case["maxPerOwner"], f"ownerId={owner_id} count={count} max={case['maxPerOwner']}"))
            checks.append(check_result("no_embeddings_exposed", all("embedding" not in item and "embeddingJson" not in item for item in search.get("results", [])), "retrieval results must not expose embeddings"))
            answer = generate_grounded_answer(case.get("query", ""), search.get("results", [])[:3])
            checks.append(assert_has_citations_if_rag_used(answer))
            result_payload = {"search": search, "answer": answer}
        summary = calculate_pass_fail(checks)
        results.append({"id": case["id"], "mode": mode, "severity": summary["severity"], "passed": summary["passed"], "checks": checks, "details": result_payload})

    return {
        "suite": "RAG V2",
        "mode": mode,
        "total": len(results),
        "pass": sum(1 for item in results if item["severity"] == "PASS"),
        "warning": sum(1 for item in results if item["severity"] == "WARNING"),
        "fail": sum(1 for item in results if item["severity"] == "FAIL"),
        "citationRate": round(sum(1 for item in results if (item.get("details", {}).get("answer") or {}).get("citations")) / len(results), 2) if results else 0,
        "results": results,
    }


def print_rag_summary(summary: dict) -> None:
    for item in summary["results"]:
        print(f"[{item['severity']}] {item['id']} mode={item['mode']}")
    print(f"RAG V2: {summary['pass']}/{summary['total']} PASS, {summary['warning']} WARNING, {summary['fail']} FAIL")
