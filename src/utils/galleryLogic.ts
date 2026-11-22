import {
  Artwork,
  ArtworkCategory,
  ArtworkMediumType,
  InquiryFormErrors,
  InquiryFormValues,
} from '../types/artwork';

const SOLD_MARKER_PATTERN = /\(sold\)/i;
const WATERCOLOR_PATTERN = /watercolou?r|akvarel/i;

/**
 * Resolves normalized medium type ('oil' | 'watercolor') for filtering and indexing.
 */
export function getArtworkMediumType(
  artwork: Pick<Artwork, 'medium' | 'mediumType'>
): ArtworkMediumType {
  if (artwork.mediumType === 'watercolor' || artwork.mediumType === 'oil') {
    return artwork.mediumType;
  }
  return WATERCOLOR_PATTERN.test(artwork.medium) ? 'watercolor' : 'oil';
}

/**
 * Identifies whether an artwork is marked sold via explicit status or "(sold)" marker.
 */
export function isArtworkSold(
  artwork: Pick<Artwork, 'price' | 'title'> & { status?: Artwork['status'] }
): boolean {
  if (artwork.status === 'sold') {
    return true;
  }
  return SOLD_MARKER_PATTERN.test(artwork.price ?? '') || SOLD_MARKER_PATTERN.test(artwork.title);
}

/**
 * Formats an artwork price for clean museum display when an explicit SOLD badge is rendered.
 */
export function formatDisplayPrice(price?: string): string | undefined {
  if (!price) return undefined;
  const cleaned = price.replace(/\s*\(sold\)\s*/gi, '').trim();
  return cleaned || undefined;
}

/**
 * Returns only artworks that are available for public gallery display,
 * excluding sold items while keeping underlying catalogue records intact.
 */
export function getAvailableArtworks(artworks: Artwork[]): Artwork[] {
  return artworks.filter((item) => !isArtworkSold(item));
}

/**
 * Filters artworks by gallery category without duplicates.
 * - ALL: Every artwork in the catalogue (available and sold)
 * - OIL: Oil paintings only (available and sold)
 * - WATERCOLOR: Watercolor artworks only (available and sold)
 * - SOLD: All sold artworks regardless of painting medium
 */
export function filterArtworksByCategory(
  artworks: Artwork[],
  category: ArtworkCategory
): Artwork[] {
  if (category === 'ALL') {
    return artworks;
  }
  if (category === 'OIL') {
    return artworks.filter((item) => getArtworkMediumType(item) === 'oil');
  }
  if (category === 'WATERCOLOR') {
    return artworks.filter((item) => getArtworkMediumType(item) === 'watercolor');
  }
  if (category === 'SOLD') {
    return artworks.filter((item) => isArtworkSold(item));
  }
  return artworks;
}

/**
 * Normalizes text for flexible keyword matching (lowercases and unifies curly/straight apostrophes).
 */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u02bb`']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filters artworks in real time by category and multi-token search query
 * across title, medium (both watercolour/watercolor and oil), availability status,
 * dimensions, price, accession number, description, and year.
 */
export function filterArtworks(
  artworks: Artwork[],
  category: ArtworkCategory,
  searchQuery: string
): Artwork[] {
  const byCategory = filterArtworksByCategory(artworks, category);
  const normalizedQuery = normalizeSearchText(searchQuery);
  if (!normalizedQuery) {
    return byCategory;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return byCategory.filter((item) => {
    const mediumType = getArtworkMediumType(item);
    const mediumAliases =
      mediumType === 'watercolor'
        ? 'watercolor watercolour'
        : 'oil painting oil paintings';
    const availabilityToken = isArtworkSold(item) ? 'sold' : 'available';

    const haystack = normalizeSearchText(
      [
        item.title,
        item.medium,
        mediumAliases,
        availabilityToken,
        item.dimensions,
        item.price ?? '',
        item.accessionNumber,
        item.description,
        item.year,
      ].join(' ')
    );
    return tokens.every((token) => haystack.includes(token));
  });
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
    counts[category] = filterArtworksByCategory(artworks, category).length;
  }
  return counts;
}

export interface MasonryColumnEntry {
  artwork: Artwork;
  index: number;
}

/**
 * Computes responsive column count clamped to visible item count so narrow
 * filtered views (e.g. 1 or 2 items) never leave empty ghost columns.
 */
export function getEffectiveColumnCount(
  viewportWidth: number,
  itemCount: number
): 1 | 2 | 3 {
  const baseCols: 1 | 2 | 3 =
    viewportWidth >= 1024 ? 3 : viewportWidth >= 640 ? 2 : 1;
  if (itemCount <= 1) return 1;
  if (itemCount === 2) return Math.min(baseCols, 2) as 1 | 2;
  return baseCols;
}

/**
 * Distributes artworks across `columnCount` columns using a shortest-column
 * Masonry heuristic weighted by exact natural aspect ratio + metadata caption height.
 * Guarantees each artwork appears exactly once with balanced column heights.
 */
export function distributeMasonryColumns(
  artworks: Artwork[],
  columnCount: number
): MasonryColumnEntry[][] {
  const cols = Math.max(1, Math.floor(columnCount));
  const columns: MasonryColumnEntry[][] = Array.from({ length: cols }, () => []);
  const columnHeights = new Array<number>(cols).fill(0);

  artworks.forEach((artwork, index) => {
    let shortestCol = 0;
    for (let col = 1; col < cols; col++) {
      if (columnHeights[col] < columnHeights[shortestCol]) {
        shortestCol = col;
      }
    }

    const safeWidth = artwork.width > 0 ? artwork.width : 4;
    const safeHeight = artwork.height > 0 ? artwork.height : 3;
    const normalizedCardHeight = safeHeight / safeWidth + 0.28;

    columns[shortestCol].push({ artwork, index });
    columnHeights[shortestCol] += normalizedCardHeight;
  });

  return columns;
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
