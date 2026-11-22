import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getChladniThemeColors,
  getParticleTransitionInk,
  resolveInitialTheme,
} from './useTheme';

test('resolveInitialTheme honors persisted localStorage theme over system preference', () => {
  assert.equal(resolveInitialTheme('dark', false), 'dark');
  assert.equal(resolveInitialTheme('light', true), 'light');
  assert.equal(resolveInitialTheme(null, true), 'dark');
  assert.equal(resolveInitialTheme(null, false), 'light');
  assert.equal(resolveInitialTheme('invalid', true), 'dark');
});

test('getChladniThemeColors returns crisp red sand and matching plate for light and dark themes', () => {
  assert.deepEqual(getChladniThemeColors('light'), {
    sand: '#D20000',
    plate: '#FFFFFF',
  });
  assert.deepEqual(getChladniThemeColors('dark'), {
    sand: '#FF2A2A',
    plate: '#0a0a0a',
  });
});

test('getParticleTransitionInk adapts cleanly to theme mode', () => {
  assert.equal(getParticleTransitionInk('light'), '#D20000');
  assert.equal(getParticleTransitionInk('dark'), '#FF2A2A');
});
