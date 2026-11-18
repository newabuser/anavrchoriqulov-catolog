import {
  Artwork,
  ArtworkCategory,
  InquiryFormErrors,
  InquiryFormValues,
} from '../types/artwork';

/**
 * Filters artworks by selected gallery category.
 */
export function filterArtworksByCategory(
  artworks: Artwork[],
  category: ArtworkCategory
): Artwork[] {
  if (category === 'ALL') {
    return artworks;
  }
  return artworks.filter((item) => item.category === category);
}

/**
 * Computes item counts for each category tab.
 */
export function computeCategoryCounts(
  artworks: Artwork[],
  categories: ArtworkCategory[]
): Record<ArtworkCategory, number> {
  const counts = {} as Record<ArtworkCategory, number>;
  for (const category of categories) {
    counts[category] =
      category === 'ALL'
        ? artworks.length
        : artworks.filter((item) => item.category === category).length;
  }
  return counts;
}

/**
 * Resolves the next or previous artwork within the active filtered list,
 * wrapping cleanly around the collection bounds.
 */
export function getAdjacentArtwork(
  artworks: Artwork[],
  currentId: string | null,
  direction: 'next' | 'prev'
): Artwork | null {
  if (!currentId || artworks.length === 0) {
    return null;
  }
  const currentIndex = artworks.findIndex((item) => item.id === currentId);
  if (currentIndex === -1) {
    return artworks[0];
  }
  const offset = direction === 'next' ? 1 : -1;
  const nextIndex = (currentIndex + offset + artworks.length) % artworks.length;
  return artworks[nextIndex];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates the studio inquiry form fields without substituting silent fallbacks.
 */
export function validateInquiryForm(
  values: InquiryFormValues,
  customMessages?: {
    name?: string;
    email?: string;
    emailInvalid?: string;
    message?: string;
  }
): InquiryFormErrors {
  const errors: InquiryFormErrors = {};

  if (!values.name.trim()) {
    errors.name = customMessages?.name ?? 'Please enter your name.';
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = customMessages?.email ?? 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = customMessages?.emailInvalid ?? 'Please enter a valid email address.';
  }

  if (values.message.trim().length < 10) {
    errors.message =
      customMessages?.message ??
      'Please include a short note (at least 10 characters).';
  }

  return errors;
}

/**
 * Computes normalized vertical scroll progress in [0, 1], clamped against
 * overscroll and safe when the document fits within the viewport.
 */
export function computeScrollProgress(
  scrollY: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  const maxScroll = scrollHeight - viewportHeight;
  if (maxScroll <= 0 || !Number.isFinite(maxScroll) || !Number.isFinite(scrollY)) {
    return 0;
  }
  const ratio = scrollY / maxScroll;
  return Math.min(1, Math.max(0, ratio));
}

export interface CardTiltAngles {
  rotateX: number;
  rotateY: number;
}

/**
 * Computes subtle clamped 3D tilt angles (degrees) from cursor position within a card.
 */
export function computeCardTilt(
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  maxDeg = 3.2
): CardTiltAngles {
  if (
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(offsetX) ||
    !Number.isFinite(offsetY) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxDeg)
  ) {
    return { rotateX: 0, rotateY: 0 };
  }

  const nx = Math.min(1, Math.max(-1, (offsetX / width - 0.5) * 2));
  const ny = Math.min(1, Math.max(-1, (offsetY / height - 0.5) * 2));

  const rotateY = Math.round(nx * maxDeg * 100) / 100;
  const rotateX = Math.round(-ny * maxDeg * 100) / 100;

  return {
    rotateX: Object.is(rotateX, -0) ? 0 : rotateX,
    rotateY: Object.is(rotateY, -0) ? 0 : rotateY,
  };
}

/**
 * Determines whether the floating Back to Top control should be visible
 * once the user enters the portfolio and scrolls past the top hero area.
 */
export function shouldShowBackToTop(
  isEntered: boolean,
  isLightboxOpen: boolean,
  scrollY: number,
  thresholdPx = 320
): boolean {
  if (!isEntered || isLightboxOpen) {
    return false;
  }
  if (!Number.isFinite(scrollY) || !Number.isFinite(thresholdPx)) {
    return false;
  }
  return scrollY > thresholdPx;
}

export interface MasonryParallaxConfig {
  yRange: [string, string];
  baseScale: number;
}

const MASONRY_PARALLAX_BANDS: ReadonlyArray<[string, string]> = [
  ['-5%', '5%'],
  ['-7%', '7%'],
  ['-4%', '4%'],
];

/**
 * Computes percentage-based vertical parallax travel and matching bleed scale
 * for Masonry cards so adjacent columns exhibit subtle layered depth without exposing frame edges.
 */
export function computeMasonryParallaxRange(index: number): MasonryParallaxConfig {
  const safeIndex = Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  const band = MASONRY_PARALLAX_BANDS[safeIndex % MASONRY_PARALLAX_BANDS.length];
  return {
    yRange: [band[0], band[1]],
    baseScale: 1.18,
  };
}
