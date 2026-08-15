import json
import os
import time
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener


BASE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000").rstrip("/")
OPENER = build_opener(ProxyHandler({}))
HEADERS = {
    "Content-Type": "application/json",
    "X-Request-ID": "stability-smoke-check",
}


def post(path, payload, timeout=15):
    started_at = time.perf_counter()
    request = Request(
        f"{BASE_URL}{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers=HEADERS,
        method="POST",
    )
    try:
        with OPENER.open(request, timeout=timeout) as response:
            return response.status, json.load(response), round((time.perf_counter() - started_at) * 1000)
    except HTTPError as error:
        return error.code, json.load(error), round((time.perf_counter() - started_at) * 1000)


def main():
    status, invalid, duration = post("/ai/match", {})
    print(f"INVALID status={status} code={invalid.get('error', {}).get('code')} durationMs={duration}")

    offer = {
        "id": "stability-offer",
        "title": "Stage Full Stack",
        "description": "Developpement React et Node.js",
        "requiredSkills": ["React", "Node.js", "Docker"],
        "optionalSkills": ["SQL"],
        "companyName": "Demo Company",
    }
    student = {
        "firstName": "Test",
        "lastName": "Stabilite",
        "educationLevel": "MASTER",
        "targetJob": "Developpeur web",
    }

    status, matching, duration = post("/ai/match", {
        "candidateSkills": ["React", "Node.js", "SQL"],
        "requiredSkills": offer["requiredSkills"],
        "optionalSkills": offer["optionalSkills"],
    })
    if status != 200:
        raise RuntimeError(f"Matching failed with HTTP {status}")
    print(f"MATCH status={status} score={matching.get('score')} decision={matching.get('decisionLabel')} durationMs={duration}")

    status, skill_gap, duration = post("/ai/skill-gap-simulator", {
        "matchingResult": matching,
        "selectedSkills": ["Docker"],
        "options": {"simulationMode": "REALISTIC"},
    })
    if status != 200:
        raise RuntimeError(f"Skill Gap failed with HTTP {status}")
    print(f"SKILL_GAP status={status} potential={skill_gap.get('potentialBestScore')} durationMs={duration}")

    status, career, duration = post("/ai/career-advice", {
        "student": student,
        "candidateSkills": ["React", "Node.js", "SQL"],
        "offer": offer,
        "matching": matching,
        "question": "Comment ameliorer mon profil ?",
    })
    if status != 200:
        raise RuntimeError(f"Career Assistant failed with HTTP {status}")
    print(f"CAREER status={status} actions={len(career.get('actionPlan') or [])} durationMs={duration}")

    letter_offer = {
        key: offer[key]
        for key in ("title", "description", "requiredSkills", "optionalSkills")
    }
    status, letter, duration = post("/ai/generate-letter", {
        "student": student,
        "candidateSkills": ["React", "Node.js", "SQL"],
        "offer": letter_offer,
        "company": {"companyName": "Demo Company", "sector": "Technology"},
        "matching": matching,
        "tone": "PROFESSIONAL",
    })
    if status != 200:
        raise RuntimeError(f"Motivation Letter failed with HTTP {status}")
    print(f"LETTER status={status} chars={len(letter.get('content') or '')} durationMs={duration}")

    status, orchestrator, duration = post("/ai/orchestrate/v2", {
        "intent": "MATCH",
        "cvText": "Developpeur React Node.js SQL",
        "studentProfile": student,
        "offer": offer,
    }, timeout=30)
    if status != 200:
        raise RuntimeError(f"Orchestrator failed with HTTP {status}")
    print(
        f"ORCHESTRATOR status={status} result={orchestrator.get('status')} "
        f"steps={len(orchestrator.get('steps') or [])} durationMs={duration}"
    )


if __name__ == "__main__":
    main()
