from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from evaluation.evaluators.career_evaluator import evaluate_career_cases
from evaluation.evaluators.letter_evaluator import evaluate_letter_cases
from evaluation.evaluators.matching_evaluator import evaluate_matching_cases
from evaluation.evaluators.orchestrator_evaluator import evaluate_orchestrator_cases
from evaluation.evaluators.rag_evaluator import evaluate_rag_cases


ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "evaluation" / "reports"


def _status(summaries: list[dict[str, Any]]) -> str:
    if any(summary.get("fail", 0) > 0 for summary in summaries):
        return "FAIL"
    if any(summary.get("warning", 0) > 0 for summary in summaries):
        return "PASS_WITH_WARNINGS"
    return "PASS"


def _global_summary(summaries: list[dict[str, Any]]) -> dict[str, Any]:
    total = sum(summary.get("total", 0) for summary in summaries)
    passed = sum(summary.get("pass", 0) for summary in summaries)
    warnings = sum(summary.get("warning", 0) for summary in summaries)
    fails = sum(summary.get("fail", 0) for summary in summaries)
    return {
        "totalCases": total,
        "pass": passed,
        "warning": warnings,
        "fail": fails,
        "status": _status(summaries),
        "matchingAverageScore": next((summary.get("averageScore") for summary in summaries if summary.get("suite") == "Matching V3"), 0),
        "letterQualityChecksRate": next((summary.get("qualityChecksRate") for summary in summaries if summary.get("suite") == "Motivation Letter V2"), 0),
        "careerReadinessCoherenceRate": next((summary.get("readinessCoherenceRate") for summary in summaries if summary.get("suite") == "Career Assistant V2"), 0),
        "ragCitationRate": next((summary.get("citationRate") for summary in summaries if summary.get("suite") == "RAG V2"), 0),
        "orchestratorSuccessRate": next((summary.get("successRate") for summary in summaries if summary.get("suite") == "Orchestrator V2"), 0),
    }


def _markdown(report: dict[str, Any]) -> str:
    lines = [
        "# SmartIntern AI - AI Evaluation Report",
        "",
        f"Generated at: `{report['generatedAt']}`",
        f"Status: **{report['global']['status']}**",
        "",
        "## Summary",
        "",
        "| Suite | PASS | WARNING | FAIL | Total |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for suite in report["suites"]:
        lines.append(f"| {suite['suite']} | {suite['pass']} | {suite['warning']} | {suite['fail']} | {suite['total']} |")
    lines.extend(
        [
            "",
            "## Metrics",
            "",
            f"- Matching average score: `{report['global']['matchingAverageScore']}`",
            f"- Letter quality checks rate: `{report['global']['letterQualityChecksRate']}`",
            f"- Career readiness coherence rate: `{report['global']['careerReadinessCoherenceRate']}`",
            f"- RAG citation rate: `{report['global']['ragCitationRate']}`",
            f"- Orchestrator success rate: `{report['global']['orchestratorSuccessRate']}`",
            "",
            "## Failures And Warnings",
            "",
        ]
    )
    any_issue = False
    for suite in report["suites"]:
        issues = [item for item in suite.get("results", []) if item.get("severity") != "PASS"]
        if not issues:
            continue
        any_issue = True
        lines.append(f"### {suite['suite']}")
        for item in issues:
            lines.append(f"- **{item.get('severity')}** `{item.get('id')}`")
    if not any_issue:
        lines.append("No failures or warnings.")
    return "\n".join(lines) + "\n"


def run_all_evaluations(write_reports: bool = True, rag_mode: str = "mock") -> dict[str, Any]:
    summaries = [
        evaluate_matching_cases(),
        evaluate_career_cases(),
        evaluate_letter_cases(),
        evaluate_rag_cases(mode=rag_mode),
        evaluate_orchestrator_cases(),
    ]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "global": _global_summary(summaries),
        "suites": summaries,
        "reports": {},
    }
    if write_reports:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        json_path = REPORTS_DIR / f"ai_evaluation_report_{timestamp}.json"
        md_path = REPORTS_DIR / f"ai_evaluation_report_{timestamp}.md"
        json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        md_path.write_text(_markdown(report), encoding="utf-8")
        report["reports"] = {"json": str(json_path), "markdown": str(md_path)}
    return report


def print_suite_summary(report: dict[str, Any]) -> None:
    print("========================================")
    print("SmartIntern AI - AI Evaluation Suite")
    print("========================================")
    for suite in report["suites"]:
        print(f"{suite['suite']}: {suite['pass']}/{suite['total']} PASS, {suite['warning']} WARNING, {suite['fail']} FAIL")
    print("----------------------------------------")
    print(f"Global: {report['global']['pass']}/{report['global']['totalCases']} PASS")
    print(f"Status: {report['global']['status']}")
    if report.get("reports"):
        print(f"JSON Report: {report['reports'].get('json')}")
        print(f"Markdown Report: {report['reports'].get('markdown')}")
    print("========================================")
