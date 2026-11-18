import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS, GALLERY_CATEGORIES } from '../data/portfolioData';
import {
  computeCardTilt,
  computeCategoryCounts,
  computeMasonryParallaxRange,
  computeScrollProgress,
  filterArtworksByCategory,
  getAdjacentArtwork,
  shouldShowBackToTop,
  validateInquiryForm,
} from './galleryLogic';

test('filterArtworksByCategory returns all artworks when ALL is selected', () => {
  const result = filterArtworksByCategory(ARTWORKS, 'ALL');
  assert.equal(result.length, ARTWORKS.length);
});

test('computeCategoryCounts tallies each category accurately', () => {
  const counts = computeCategoryCounts(ARTWORKS, GALLERY_CATEGORIES);
  assert.equal(counts.ALL, 5);
});

test('getAdjacentArtwork returns null when list is empty', () => {
  assert.equal(getAdjacentArtwork([], null, 'next'), null);
});

test('validateInquiryForm rejects missing or invalid fields and accepts valid input', () => {
  const invalid = validateInquiryForm({
    name: '   ',
    email: 'not-an-email',
    subject: 'Commission',
    message: 'Too short',
  });
  assert.ok(invalid.name);
  assert.ok(invalid.email);
  assert.ok(invalid.message);

  const valid = validateInquiryForm({
    name: 'Clara Vance',
    email: 'clara@example.com',
    subject: 'Private Acquisition',
    message: 'Interested in availability and framing.',
  });
  assert.deepEqual(valid, {});
});

test('computeScrollProgress clamps bounds and handles non-scrollable viewports', () => {
  assert.equal(computeScrollProgress(0, 2000, 900), 0);
  assert.equal(computeScrollProgress(550, 2000, 900), 0.5);
  assert.equal(computeScrollProgress(1100, 2000, 900), 1);
  assert.equal(computeScrollProgress(-40, 2000, 900), 0);
  assert.equal(computeScrollProgress(1500, 2000, 900), 1);
  assert.equal(computeScrollProgress(100, 900, 900), 0);
  assert.equal(computeScrollProgress(0, 700, 900), 0);
});

test('computeCardTilt computes symmetrical clamped angles and handles zero dimensions', () => {
  assert.deepEqual(computeCardTilt(150, 200, 300, 400, 3), { rotateX: 0, rotateY: 0 });
  assert.deepEqual(computeCardTilt(300, 0, 300, 400, 3), { rotateX: 3, rotateY: 3 });
  assert.deepEqual(computeCardTilt(0, 400, 300, 400, 3), { rotateX: -3, rotateY: -3 });
  assert.deepEqual(computeCardTilt(500, -50, 300, 400, 3), { rotateX: 3, rotateY: 3 });
  assert.deepEqual(computeCardTilt(10, 10, 0, 400, 3), { rotateX: 0, rotateY: 0 });
});

test('shouldShowBackToTop enforces gate, lightbox, and scroll threshold visibility', () => {
  assert.equal(shouldShowBackToTop(false, false, 600, 320), false);
  assert.equal(shouldShowBackToTop(true, true, 600, 320), false);
  assert.equal(shouldShowBackToTop(true, false, 0, 320), false);
  assert.equal(shouldShowBackToTop(true, false, 320, 320), false);
  assert.equal(shouldShowBackToTop(true, false, 321, 320), true);
});

test('computeMasonryParallaxRange returns layered travel ranges within safe scale bleed', () => {
  const c0 = computeMasonryParallaxRange(0);
  const c1 = computeMasonryParallaxRange(1);
  const c2 = computeMasonryParallaxRange(2);
  const cNeg = computeMasonryParallaxRange(-3);

  assert.deepEqual(c0, { yRange: ['-5%', '5%'], baseScale: 1.18 });
  assert.deepEqual(c1, { yRange: ['-7%', '7%'], baseScale: 1.18 });
  assert.deepEqual(c2, { yRange: ['-4%', '4%'], baseScale: 1.18 });
  assert.deepEqual(cNeg, c0);
});
