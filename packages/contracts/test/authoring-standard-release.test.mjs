import assert from 'node:assert/strict';
import test from 'node:test';
import {
  authoringStandardFreshnessDecisionSchema,
  authoringStandardReleaseSchema,
  AUTHORING_STANDARD_RELEASE_VERSION,
  COMPONENT_STANDARD_SOURCE_HASH,
  COMPONENT_STANDARD_VERSION,
  PROMPTFRAME_AUTHORING_STANDARD_RELEASE,
} from '../dist/index.js';

test('authoring standard release exposes upload targets and package floors', () => {
  const release = authoringStandardReleaseSchema.parse(PROMPTFRAME_AUTHORING_STANDARD_RELEASE);

  assert.equal(release.releaseVersion, AUTHORING_STANDARD_RELEASE_VERSION);
  assert.equal(release.standardVersion, COMPONENT_STANDARD_VERSION);
  assert.equal(release.standardSourceHash, COMPONENT_STANDARD_SOURCE_HASH);
  assert.deepEqual(release.uploadTargets.map((target) => target.target), [
    'marketplace_authoring',
    'project_private_generation',
  ]);
  assert.equal(release.uploadTargets[0].requiresHumanPublishApproval, true);
  assert.equal(release.uploadTargets[1].requiresHumanPublishApproval, false);
  assert.match(release.minPackageVersions.contracts, /^\d+\.\d+\.\d+/);
  assert.match(release.minPackageVersions.cli, /^\d+\.\d+\.\d+/);
});

test('freshness decision keeps local and current standard fingerprints separate', () => {
  const decision = authoringStandardFreshnessDecisionSchema.parse({
    status: 'upload_blocking',
    target: 'marketplace_authoring',
    localStandardVersion: 'component-standard.v0.0.9',
    localStandardSourceHash: `sha256:${'0'.repeat(64)}`,
    currentStandardVersion: COMPONENT_STANDARD_VERSION,
    currentStandardSourceHash: COMPONENT_STANDARD_SOURCE_HASH,
    minPackageVersions: PROMPTFRAME_AUTHORING_STANDARD_RELEASE.minPackageVersions,
    diagnostic: {
      code: 'standard.freshness.upload_blocking',
      severity: 'error',
      message: 'Local authoring standard is stale.',
    },
    retryable: false,
  });

  assert.equal(decision.status, 'upload_blocking');
  assert.notEqual(decision.localStandardSourceHash, decision.currentStandardSourceHash);
  assert.equal(decision.diagnostic.code, 'standard.freshness.upload_blocking');
});
