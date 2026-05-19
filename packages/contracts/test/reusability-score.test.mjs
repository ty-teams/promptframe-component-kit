import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPONENT_REUSABILITY_CONTRACT_VERSION,
  componentReusabilityScoreSchema,
} from '../dist/index.js';

test('reusability score contract accepts deterministic local and platform diagnostics', () => {
  const score = componentReusabilityScoreSchema.parse({
    contractVersion: COMPONENT_REUSABILITY_CONTRACT_VERSION,
    uploadTarget: 'marketplace_authoring',
    targetVisibility: 'public',
    score: 0.42,
    recommendation: 'manual_review',
    signals: [{
      id: 'propsRichness',
      score: 0.1,
      weight: 0.18,
      severity: 'warning',
      reason: 'schema exposes no configurable props; component is difficult to reuse.',
    }],
    generatedAt: '2026-05-20T00:00:00.000Z',
  });

  assert.equal(score.contractVersion, COMPONENT_REUSABILITY_CONTRACT_VERSION);
  assert.equal(score.recommendation, 'manual_review');
  assert.equal(score.signals[0]?.id, 'propsRichness');
});
