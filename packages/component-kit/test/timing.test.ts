import assert from 'node:assert/strict';
import test from 'node:test';
import {
  COMPONENT_STANDARD_SOURCE_HASH,
  COMPONENT_STANDARD_VERSION,
  createDurationTimeline,
  getComponentStandardStamp,
  getScaledSpringTiming,
} from '../src/index.js';

test('component-kit exposes the platform standard stamp', () => {
  const stamp = getComponentStandardStamp();
  assert.equal(stamp.sourceVersion, COMPONENT_STANDARD_VERSION);
  assert.equal(stamp.sourceHash, COMPONENT_STANDARD_SOURCE_HASH);
  assert.match(stamp.sourceHash, /^sha256:[a-f0-9]{64}$/);
});

test('createDurationTimeline compresses short durations and holds long durations', () => {
  const compressed = createDurationTimeline({ actualDuration: 60, designedDuration: 120 });
  assert.equal(compressed.scale, 0.5);
  assert.equal(compressed.at(20), 10);
  assert.equal(compressed.holdFrames, 0);

  const held = createDurationTimeline({ actualDuration: 180, designedDuration: 120 });
  assert.equal(held.scale, 1);
  assert.equal(held.actionDuration, 120);
  assert.equal(held.holdFrames, 60);
});

test('getScaledSpringTiming prepares Remotion spring inputs without importing renderer', () => {
  const timeline = createDurationTimeline({ actualDuration: 60, designedDuration: 120 });
  const timing = getScaledSpringTiming(20, 30, 10, timeline);
  assert.equal(timing.frame, 15);
  assert.equal(timing.fps, 60);
});
