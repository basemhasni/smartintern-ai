# Dead Code Cleanup Report

This report records only removals proven by repository-wide reference checks on
branch `chore/final-pre-devops-audit`.

## Files Removed

Eight React pages had no static import, lazy import, route, test, script,
documentation link or dynamic filename reference:

- `frontend-web/src/pages/student/StudentPlaceholderPage.jsx`
- `frontend-web/src/pages/student/ApplicationsPlaceholderPage.jsx`
- `frontend-web/src/pages/student/OffersPlaceholderPage.jsx`
- `frontend-web/src/pages/student/CareerAssistantPlaceholderPage.jsx`
- `frontend-web/src/pages/company/CompanyProfilePlaceholderPage.jsx`
- `frontend-web/src/pages/company/CompanyOffersPlaceholderPage.jsx`
- `frontend-web/src/pages/company/CompanyApplicationsPlaceholderPage.jsx`
- `frontend-web/src/pages/company/CandidateRankingPlaceholderPage.jsx`

## Components And Imports Removed

- Three non-functional notification buttons were removed from the student,
  company and admin headers.
- Three now-unused `Bell` imports were removed with those controls.
- The unused backend `path` import and public `/uploads` static mount were
  removed. The mount removal is classified primarily as a security fix.

Counts: 8 files, 8 page components, 3 inert controls and 4 imports removed.
No standalone unused function or class was identified and removed.

## Routes And Dependencies

- Routes removed: 0. Every registered route had a current web, mobile, test,
  script or documented compatibility consumer.
- npm dependencies removed: 0. All declared packages had a verified role.
- Python dependencies removed: 0. Optional model packages are intentionally not
  in the core requirements and deterministic fallbacks use the installed set.
- Notification dependencies removed: 0 because Firebase, FCM and
  `expo-notifications` were already absent.

## Mock And Placeholder Review

No hard-coded production business record was removed because none was found on
reachable screens. The deleted placeholder pages were obsolete shells, not
fixtures. Evaluation cases, official smoke fixtures and development-only test
accounts were retained. All temporary E2E records were deleted after execution.

## Code Deliberately Retained

- `legacy` compatibility branches used by current API normalizers or AI
  fallbacks remain.
- `mock`, `sample` and `fixture` references under tests/evaluation remain because
  they drive reproducible validation and are not rendered as live data.
- `sampleOffers` in the web dashboard is a bounded slice of real API results,
  not static sample data.
- Input `placeholder` props remain as normal form UX.
- Flutter terms in AI taxonomy and evaluation cases remain because Flutter is a
  legitimate candidate skill. They are not traces of the removed Flutter app.
- Abstract `NotImplemented` branches and future-feature TODOs with active design
  value remain; no resolved TODO/FIXME was found that could be safely deleted.
- DevOps documentation remains as scope guidance. No infrastructure was built.

## Verification

After cleanup, frontend tests and production build passed, backend tests passed,
AI tests/evaluations passed, mobile lint/typecheck passed, and the complete
mobile student smoke passed 40/40. `git diff --check` is part of the final audit
validation.
