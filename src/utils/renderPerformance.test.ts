import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHLADNI_DESKTOP_PARTICLES,
  CHLADNI_MOBILE_PARTICLES,
  getActiveHeavyAnimation,
  getChladniRuntimeConfig,
  getLapisRuntimeConfig,
  LAPIS_DESKTOP_MAX_PIXELS,
  LAPIS_MIN_QUALITY,
  LAPIS_MOBILE_INITIAL_QUALITY,
  LAPIS_MOBILE_MAX_PIXELS,
  setHeavyAnimationWanted,
  stepQualityGovernor,
} from './renderPerformance';

test('getChladniRuntimeConfig adapts particle count, DPR cap, and FPS cap for mobile and low-core devices', () => {
  const desktop = getChladniRuntimeConfig({ viewportWidth: 1440, hardwareConcurrency: 8 });
  assert.deepEqual(desktop, {
    isConstrained: false,
    particleCount: CHLADNI_DESKTOP_PARTICLES,
    maxDpr: 2,
    maxFps: null,
  });

  const mobile = getChladniRuntimeConfig({ viewportWidth: 390, hardwareConcurrency: 8 });
  assert.deepEqual(mobile, {
    isConstrained: true,
    particleCount: CHLADNI_MOBILE_PARTICLES,
    maxDpr: 1.5,
    maxFps: 30,
  });

  const lowCoreDesktop = getChladniRuntimeConfig({ viewportWidth: 1440, hardwareConcurrency: 4 });
  assert.deepEqual(lowCoreDesktop, {
    isConstrained: true,
    particleCount: CHLADNI_MOBILE_PARTICLES,
    maxDpr: 1.5,
    maxFps: 30,
  });
});

test('getLapisRuntimeConfig lowers pixel budget, DPR, quality, and enables single-sample on mobile', () => {
  const desktop = getLapisRuntimeConfig({ viewportWidth: 1440 });
  assert.deepEqual(desktop, {
    isMobile: false,
    maxPixels: LAPIS_DESKTOP_MAX_PIXELS,
    maxDpr: 2,
    initialQuality: 1,
    minQuality: LAPIS_MIN_QUALITY,
    singleSample: false,
  });

  const mobile = getLapisRuntimeConfig({ viewportWidth: 390 });
  assert.deepEqual(mobile, {
    isMobile: true,
    maxPixels: LAPIS_MOBILE_MAX_PIXELS,
    maxDpr: 1,
    initialQuality: LAPIS_MOBILE_INITIAL_QUALITY,
    minQuality: LAPIS_MIN_QUALITY,
    singleSample: true,
  });
});

test('stepQualityGovernor reacts down to minQuality 0.35 and triggers CSS fallback after 2s > 50ms', () => {
  let state = {
    avgDt: 0.06,
    quality: 0.6,
    cooldown: 0,
    calm: 0,
    slowAtMinSeconds: 0,
    shouldFallback: false,
  };

  // First slow tick drops quality toward 0.35 quickly
  let step = stepQualityGovernor(state, 0.06);
  state = step.state;
  assert.equal(step.resized, true);
  assert.ok(state.quality < 0.6 && state.quality >= LAPIS_MIN_QUALITY);

  // Subsequent slow ticks reach minQuality (0.35) and accumulate 2 seconds
  for (let i = 0; i < 60; i++) {
    step = stepQualityGovernor(state, 0.06);
    state = step.state;
  }
  assert.equal(state.quality, LAPIS_MIN_QUALITY);
  assert.equal(state.shouldFallback, true);
});

test('heavy animation coordinator allows only one active animation at a time', () => {
  setHeavyAnimationWanted('chladni', false);
  setHeavyAnimationWanted('lapis', false);
  assert.equal(getActiveHeavyAnimation(), null);

  setHeavyAnimationWanted('chladni', true);
  assert.equal(getActiveHeavyAnimation(), 'chladni');

  // When Contact WebGL becomes visible, it takes over so Chladni pauses
  setHeavyAnimationWanted('lapis', true);
  assert.equal(getActiveHeavyAnimation(), 'lapis');

  // When Contact leaves viewport, Chladni resumes
  setHeavyAnimationWanted('lapis', false);
  assert.equal(getActiveHeavyAnimation(), 'chladni');

  setHeavyAnimationWanted('chladni', false);
  assert.equal(getActiveHeavyAnimation(), null);
});
