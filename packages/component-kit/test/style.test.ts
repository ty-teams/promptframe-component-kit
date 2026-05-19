import assert from 'node:assert/strict';
import test from 'node:test';
import { resolvePromptFrameStyle } from '../src/style.js';

test('resolvePromptFrameStyle maps public style intent to stable render tokens', () => {
  const style = resolvePromptFrameStyle({
    tone: 'tech',
    accentColor: '#38bdf8',
    density: 'compact',
    motionIntensity: 'subtle',
    fontScale: 'large',
  }, {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
  });

  assert.equal(style.colors.accent, '#38bdf8');
  assert.equal(style.spacing.unit, 8);
  assert.equal(style.motion.intensity, 'subtle');
  assert.equal(style.typography.fontScale, 'large');
});

