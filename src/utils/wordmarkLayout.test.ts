import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWordmarkOffsets } from './wordmarkLayout';

test('computeWordmarkOffsets aligns Choriqulov with lowercase n relative to Anvar', () => {
  const result = computeWordmarkOffsets(
    {
      firstLeft: 384,
      firstWidth: 672,
      nLeft: 570,
      lastWidth: 400,
      fontSizePx: 216,
    },
    { opticalShiftEm: 0, verticalAnchorRatio: 0.02 }
  );

  assert.equal(result.leftPx, 186);
  assert.equal(result.topPx, 4.3);
});

test('computeWordmarkOffsets clamps left offset so Choriqulov stays within Anvar width', () => {
  const result = computeWordmarkOffsets(
    {
      firstLeft: 40,
      firstWidth: 270,
      nLeft: 120,
      lastWidth: 210,
      fontSizePx: 90,
    },
    { opticalShiftEm: 0, verticalAnchorRatio: 0.015 }
  );

  assert.equal(result.leftPx, 60);
});

test('computeWordmarkOffsets handles zero dimensions safely', () => {
  assert.deepEqual(
    computeWordmarkOffsets({
      firstLeft: 0,
      firstWidth: 0,
      nLeft: 0,
      lastWidth: 0,
      fontSizePx: 0,
    }),
    { leftPx: 0, topPx: 0 }
  );
});
