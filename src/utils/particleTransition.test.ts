import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceTransitionTime,
  computeHeadingSpec,
  computeHeroCoverRect,
  DEFAULT_HEADING_FONT_FAMILY,
  fitHeadingDimensions,
  formatParticleHeadingText,
} from '../components/ParticleTransition';
import { TRANSLATIONS } from '../i18n/translations';

test('advanceTransitionTime prevents multi-second stalls from skipping dissolve or gather phases', () => {
  const step1 = advanceTransitionTime(
    { t: 0, lastNow: 1000, justStarted: true },
    21000
  );
  assert.ok(Math.abs(step1.dt - 1 / 60) < 1e-6);
  assert.ok(Math.abs(step1.state.t - 1 / 60) < 1e-6);
  assert.equal(step1.state.justStarted, false);

  const step2 = advanceTransitionTime(step1.state, 36000);
  assert.equal(step2.dt, 0.12);
  assert.ok(step2.state.t < 0.2);

  const step3 = advanceTransitionTime(step2.state, 36016.67);
  assert.ok(Math.abs(step3.dt - 0.01667) < 1e-4);
});

test('computeHeroCoverRect matches object-position 38% on mobile (<1024) and 50% on desktop (>=1024)', () => {
  const mobile = computeHeroCoverRect({
    sw: 78,
    sh: 169,
    viewportWidth: 390,
    viewportHeight: 844,
    naturalWidth: 1376,
    naturalHeight: 768,
  });

  assert.ok(mobile.dw > 78);
  assert.ok(Math.abs(mobile.dx - (-2.34 + (82.68 - mobile.dw) * 0.38)) < 0.01);

  const desktop = computeHeroCoverRect({
    sw: 480,
    sh: 270,
    viewportWidth: 1920,
    viewportHeight: 1080,
    naturalWidth: 1376,
    naturalHeight: 768,
  });

  const expectedBoxW = 480 * 1.06;
  const expectedLeft = (480 - expectedBoxW) / 2;
  assert.ok(Math.abs(desktop.dx - (expectedLeft + (expectedBoxW - desktop.dw) * 0.5)) < 0.01);
});

test('computeHeroCoverRect honors measured heroImgRect when provided', () => {
  const rect = computeHeroCoverRect({
    sw: 480,
    sh: 270,
    viewportWidth: 1920,
    viewportHeight: 1080,
    naturalWidth: 1376,
    naturalHeight: 768,
    heroImgRect: { left: -57.6, top: -32.4, width: 2035.2, height: 1144.8 },
  });

  const boxW = 2035.2 / 4;
  const boxH = 1144.8 / 4;
  const k = Math.max(boxW / 1376, boxH / 768);
  const expectedDw = 1376 * k;
  const expectedDx = -57.6 / 4 + (boxW - expectedDw) * 0.5;
  assert.ok(Math.abs(rect.dx - expectedDx) < 0.05);
  assert.ok(Math.abs(rect.dy - (-32.4 / 4)) < 0.05);
});

test('formatParticleHeadingText applies locale-aware uppercase transform across UZ, EN, and RU', () => {
  assert.equal(formatParticleHeadingText('  r ö y x a t ', 'uz'), 'R Ö Y X A T');
  assert.equal(formatParticleHeadingText('c a t a l o g u e', 'en'), 'C A T A L O G U E');
  assert.equal(formatParticleHeadingText('к а т а л о г', 'ru'), 'К А Т А Л О Г');
  assert.equal(
    formatParticleHeadingText(TRANSLATIONS.ru.portfolio.catalogueTitle, 'ru'),
    'К А Т А Л О Г'
  );
  assert.equal(formatParticleHeadingText('ў қ ғ ҳ', 'uz'), 'Ў Қ Ғ Ҳ');
});

test('fitHeadingDimensions scales fontSize and letterSpacing proportionally when exceeding 80% screen width', () => {
  // Fits within 80% of 1920px -> unchanged
  const fitsDesktop = fitHeadingDimensions({
    fontSize: 26,
    letterSpacing: 11.96,
    measuredWidth: 420,
    maxWidth: 1920 * 0.8,
  });
  assert.equal(fitsDesktop.scale, 1);
  assert.equal(fitsDesktop.fontSize, 26);

  // Exceeds 80% of 390px (312px) -> scales both fontSize and letterSpacing cleanly
  const longMobile = fitHeadingDimensions({
    fontSize: 20,
    letterSpacing: 9.2,
    measuredWidth: 468,
    maxWidth: 390 * 0.8,
  });
  assert.ok(Math.abs(longMobile.scale - 312 / 468) < 1e-6);
  assert.ok(Math.abs(longMobile.fontSize - 20 * (312 / 468)) < 1e-6);
  assert.ok(Math.abs(longMobile.letterSpacing - 9.2 * (312 / 468)) < 1e-6);
});

test('computeHeadingSpec uses translated heading text without Georgia fallback on desktop and mobile', () => {
  assert.equal(DEFAULT_HEADING_FONT_FAMILY.includes('Georgia'), false);

  const ruDesktop = computeHeadingSpec(1920, 1080, TRANSLATIONS.ru.portfolio.catalogueTitle, 'ru');
  assert.equal(ruDesktop.renderText, 'К А Т А Л О Г');
  assert.equal(ruDesktop.fontFamily, DEFAULT_HEADING_FONT_FAMILY);
  assert.equal(ruDesktop.fontSize, 26);
  assert.equal(ruDesktop.centerX, 960);

  const enMobile = computeHeadingSpec(390, 844, TRANSLATIONS.en.portfolio.catalogueTitle, 'en');
  assert.equal(enMobile.renderText, 'C A T A L O G U E');
  assert.equal(enMobile.fontSize, 20);
  assert.equal(enMobile.centerX, 195);
});
