import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeApiError } from '../src/api/apiError.js';
import { normalizeAiMatchResult, normalizeSkillGapSimulation } from '../src/utils/ai.js';
import { normalizeApplications } from '../src/utils/applications.js';

test('normalizes a complete Matching V3 response', () => {
  const result = normalizeAiMatchResult({
    score: 82,
    confidence: 'HIGH',
    decisionLabel: 'GOOD_MATCH',
    matchedSkills: ['React'],
    v3: { scoreBreakdown: { skills: 82 } },
    explainability: {
      skillEvidenceMap: { React: { evidenceLevel: 'STRONG', evidenceSnippets: ['Project'] } },
      careerSignalMap: { categories: [{ category: 'Frontend', matchedSkills: ['React'] }] },
      decisionTrace: [{ step: 'MATCH', details: ['React found'] }],
    },
  });

  assert.equal(result.score, 82);
  assert.deepEqual(result.matchedSkills, ['React']);
  assert.deepEqual(result.explainability.skillEvidenceMap.React.evidenceSnippets, ['Project']);
});

test('normalizes partial and malformed matching fields without inventing a score', () => {
  const result = normalizeAiMatchResult({
    confidence: null,
    matchedSkills: null,
    explainability: {
      skillEvidenceMap: { React: null, Node: { evidenceSnippets: 'invalid' } },
      careerSignalMap: { categories: [null, { category: 'Backend', missingSkills: null }] },
      decisionTrace: [null, { step: 'CHECK', details: 'invalid' }],
    },
  });

  assert.equal(result.score, null);
  assert.deepEqual(result.matchedSkills, []);
  assert.equal(result.explainability.skillEvidenceMap.React, undefined);
  assert.deepEqual(result.explainability.careerSignalMap.categories[0].missingSkills, []);
  assert.deepEqual(result.explainability.decisionTrace[0].details, []);
});

test('keeps absent Skill Gap values unavailable', () => {
  const result = normalizeSkillGapSimulation({ recommendedProjects: null });
  assert.equal(result.currentScore, null);
  assert.equal(result.potentialBestScore, null);
  assert.equal(result.scoreGain, null);
  assert.deepEqual(result.recommendedProjects, []);
});

test('normalizes unavailable and timeout errors for the UI', () => {
  const unavailable = normalizeApiError({ response: { status: 503, data: { error: { code: 'AI_SERVICE_UNAVAILABLE' } } } });
  const timeout = normalizeApiError({ code: 'ECONNABORTED' });
  const invalidResponse = normalizeApiError({ response: { status: 502, data: { error: { code: 'AI_INVALID_RESPONSE' } } } });

  assert.equal(unavailable.code, 'AI_SERVICE_UNAVAILABLE');
  assert.equal(timeout.code, 'TIMEOUT');
  assert.equal(invalidResponse.code, 'AI_INVALID_RESPONSE');
  assert.ok(!unavailable.message.includes('Axios'));
});

test('normalizes a non-array applications response to an empty list', () => {
  assert.deepEqual(normalizeApplications({ data: [] }), []);
});
