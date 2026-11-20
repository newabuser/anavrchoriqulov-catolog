import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS, GALLERY_CATEGORIES, TELEGRAM_PURCHASE_URL } from '../data/portfolioData';
import {
  computeCardTilt,
  computeCategoryCounts,
  computeMasonryParallaxRange,
  computeScrollProgress,
  distributeMasonryColumns,
  filterArtworks,
  filterArtworksByCategory,
  formatDisplayPrice,
  getAdjacentArtwork,
  getArtworkMediumType,
  getEffectiveColumnCount,
  isArtworkSold,
  shouldShowBackToTop,
  validateInquiryForm,
} from './galleryLogic';

test('filterArtworksByCategory filters all 4 curated categories without duplicates', () => {
  const all = filterArtworksByCategory(ARTWORKS, 'ALL');
  assert.equal(all.length, 126);
  assert.equal(new Set(all.map((a) => a.id)).size, 126);

  const oil = filterArtworksByCategory(ARTWORKS, 'OIL');
  assert.equal(oil.length, 124);
  assert.ok(oil.every((a) => getArtworkMediumType(a) === 'oil'));
  // Sold oil painting stays visible inside Oil Paintings
  assert.ok(oil.some((a) => a.id === 'artwork-21'));

  const watercolor = filterArtworksByCategory(ARTWORKS, 'WATERCOLOR');
  assert.deepEqual(
    watercolor.map((a) => a.id),
    ['artwork-125', 'artwork-126']
  );

  const sold = filterArtworksByCategory(ARTWORKS, 'SOLD');
  assert.deepEqual(
    sold.map((a) => a.id),
    ['artwork-21']
  );
});

test('computeCategoryCounts tallies ALL, OIL, WATERCOLOR, and SOLD accurately', () => {
  const counts = computeCategoryCounts(ARTWORKS, GALLERY_CATEGORIES);
  assert.deepEqual(counts, {
    ALL: 126,
    OIL: 124,
    WATERCOLOR: 2,
    SOLD: 1,
  });
});

test('distributeMasonryColumns preserves every artwork once with balanced columns', () => {
  const cols = distributeMasonryColumns(ARTWORKS, 3);
  assert.equal(cols.length, 3);
  const flattenedIds = cols.flat().map((entry) => entry.artwork.id);
  assert.equal(flattenedIds.length, 126);
  assert.equal(new Set(flattenedIds).size, 126);

  assert.equal(getEffectiveColumnCount(1440, 126), 3);
  assert.equal(getEffectiveColumnCount(1440, 2), 2);
  assert.equal(getEffectiveColumnCount(1440, 1), 1);
  assert.equal(getEffectiveColumnCount(768, 126), 2);
  assert.equal(getEffectiveColumnCount(390, 126), 1);
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

test('isArtworkSold and formatDisplayPrice reflect availability status cleanly', () => {
  assert.equal(isArtworkSold({ title: 'MULLALAR', price: '300 USD (sold)' }), true);
  assert.equal(isArtworkSold({ title: 'Any', price: '300 USD', status: 'sold' }), true);
  assert.equal(isArtworkSold({ title: 'Darvesh', price: '300 USD', status: 'available' }), false);
  assert.equal(formatDisplayPrice('300 USD (sold)'), '300 USD');
  assert.equal(formatDisplayPrice('300 USD'), '300 USD');
  const soldCount = ARTWORKS.filter((item) => isArtworkSold(item)).length;
  assert.equal(soldCount, 1);
  assert.equal(TELEGRAM_PURCHASE_URL, 'https://t.me/Anvar_rassom');
});

test('filterArtworks filters by category, title, normalized apostrophes, and US/UK watercolor spelling', () => {
  assert.equal(filterArtworks(ARTWORKS, 'ALL', '   ').length, 126);

  const watercolourMatches = filterArtworks(ARTWORKS, 'ALL', 'watercolour');
  const watercolorMatches = filterArtworks(ARTWORKS, 'ALL', 'watercolor');
  assert.deepEqual(
    watercolourMatches.map((item) => item.id),
    ['artwork-125', 'artwork-126']
  );
  assert.deepEqual(
    watercolorMatches.map((item) => item.id),
    ['artwork-125', 'artwork-126']
  );

  const straightApostropheMatches = filterArtworks(ARTWORKS, 'ALL', "ko'xna uy");
  assert.deepEqual(
    straightApostropheMatches.map((item) => item.id),
    ['artwork-125']
  );

  const soldInOilMatches = filterArtworks(ARTWORKS, 'OIL', 'sold');
  assert.deepEqual(
    soldInOilMatches.map((item) => item.id),
    ['artwork-21']
  );
  assert.equal(filterArtworks(ARTWORKS, 'WATERCOLOR', 'sold').length, 0);

  const combinedTokenMatches = filterArtworks(ARTWORKS, 'OIL', 'paranji 550');
  assert.deepEqual(
    combinedTokenMatches.map((item) => item.id),
    ['artwork-101']
  );

  assert.equal(filterArtworks(ARTWORKS, 'ALL', 'nonexistent-xyz-999').length, 0);
});
