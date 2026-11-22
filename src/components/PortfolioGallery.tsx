import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Maximize2, Search, X } from 'lucide-react';
import { Artwork, ArtworkCategory } from '../types/artwork';
import {
  distributeMasonryColumns,
  filterArtworks,
  formatDisplayPrice,
  getAvailableArtworks,
  getEffectiveColumnCount,
} from '../utils/galleryLogic';
import { PortfolioCategoryHeader } from './PortfolioCategoryHeader';
import { useLanguage } from '../context/LanguageContext';
import { ChladniGalleryBackground } from './ChladniGalleryBackground';
import { getChladniThemeColors, useTheme } from '../utils/useTheme';

interface PortfolioGalleryProps {
  artworks: Artwork[];
  categories?: ArtworkCategory[];
  activeCategory?: ArtworkCategory;
  searchQuery?: string;
  isEntered?: boolean;
  isTransitioning?: boolean;
  isLoading?: boolean;
  titleVisible?: boolean;
  onSelectCategory?: (category: ArtworkCategory) => void;
  onSearchChange?: (query: string) => void;
  onOpenArtwork: (artwork: Artwork) => void;
}

interface GalleryCardProps {
  artwork: Artwork;
  index: number;
  onOpen: (artwork: Artwork) => void;
}

const SKELETON_ASPECTS = [
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/2]',
  'aspect-[5/4]',
];

function MasonrySkeletonGrid({
  count = 6,
  columnCount = 3,
}: {
  count?: number;
  columnCount?: 1 | 2 | 3;
}) {
  const items = SKELETON_ASPECTS.slice(0, count);
  const cols = Math.max(1, Math.min(columnCount, items.length));
  const skeletonColumns = Array.from({ length: cols }, () => [] as string[]);
  items.forEach((aspectClass, idx) => {
    skeletonColumns[idx % cols].push(aspectClass);
  });

  const skeletonContainerClass =
    cols === 1
      ? 'mx-auto mt-12 grid max-w-lg grid-cols-1 gap-7'
      : cols === 2
        ? 'mt-12 grid grid-cols-1 items-start gap-7 sm:grid-cols-2'
        : 'mt-12 grid grid-cols-1 items-start gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8';

  return (
    <div
      data-testid="gallery-skeleton"
      role="status"
      aria-label="Loading portfolio artworks"
      className={skeletonContainerClass}
    >
      {skeletonColumns.map((colItems, colIdx) => (
        <div key={`skeleton-col-${colIdx}`} className="flex flex-col gap-7 lg:gap-8">
          {colItems.map((aspectClass, itemIdx) => (
            <div
              key={`skeleton-${colIdx}-${itemIdx}`}
              aria-hidden="true"
              className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 shadow-[var(--shadow-card)] sm:p-3.5"
            >
              <div className={`relative w-full overflow-hidden rounded-lg bg-[var(--bg-subtle)] ${aspectClass}`}>
                <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[var(--fg)]/[0.05] to-transparent" />
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-4 px-0.5">
                <div className="relative h-3.5 w-2/3 overflow-hidden bg-[var(--border)]">
                  <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[var(--fg)]/[0.05] to-transparent" />
                </div>
                <div className="h-3 w-12 shrink-0 bg-[var(--border)]" />
              </div>
              <div className="mt-2 flex items-center gap-2 px-0.5">
                <div className="h-2.5 w-20 bg-[var(--border)]" />
                <div className="h-2.5 w-24 bg-[var(--border)]/60" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const GalleryCard = memo(function GalleryCard({
  artwork,
  index,
  onOpen,
}: GalleryCardProps) {
  const { t } = useLanguage();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const displayPrice = formatDisplayPrice(artwork.price);
  const categoryLabel =
    artwork.medium.toLowerCase().includes('water')
      ? t.portfolio.watercolorCategory
      : t.portfolio.oilCategory;

  useEffect(() => {
    setHasError(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [artwork.imageUrl]);

  return (
    <article data-artwork-id={artwork.id} data-artwork-status="available">
      <button
        type="button"
        onClick={() => onOpen(artwork)}
        aria-label={`${t.portfolio.inspectArtwork}: ${artwork.title} (${artwork.medium}, ${artwork.year})`}
        className="group block w-full rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-3 text-left shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color] duration-300 hover:border-[#C62828]/60 hover:bg-[var(--card-bg)] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C62828] sm:p-3.5"
      >
        {/* Exact-Proportion Museum Artwork Canvas */}
        <div className="relative overflow-hidden rounded-lg bg-[var(--bg-subtle)]">
          {!isLoaded && !hasError && (
            <div
              aria-hidden="true"
              data-testid="card-image-skeleton"
              className="absolute inset-0 z-10 bg-[var(--border)]"
            >
              <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-[var(--fg)]/[0.05] to-transparent" />
            </div>
          )}

          {!hasError ? (
            <img
              ref={imgRef}
              src={artwork.imageUrl}
              alt={`${artwork.title} — ${artwork.medium}`}
              width={artwork.width}
              height={artwork.height}
              loading={index < 6 ? 'eager' : 'lazy'}
              fetchPriority={index < 3 ? 'high' : 'auto'}
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`block h-auto w-full transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-[var(--border)] p-4 text-center">
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">
                {artwork.title}
              </span>
            </div>
          )}

          {/* Hover Scrim & Details Affordance */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/50 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-white">
              {categoryLabel}
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/30 bg-black/60 text-white">
              <Maximize2 className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Museum Wall Plaque Metadata */}
        <div className="mt-3.5 flex items-baseline justify-between gap-3 px-0.5">
          <h3 className="font-display text-sm font-normal tracking-[0.04em] text-[var(--fg)] transition-colors group-hover:text-[var(--accent-text)] sm:text-[15px]">
            {artwork.title}
          </h3>
          {displayPrice ? (
            <span className="shrink-0 font-display text-xs font-light tabular-nums tracking-[0.1em] text-[var(--fg)]">
              {displayPrice}
            </span>
          ) : (
            <span className="shrink-0 text-xs tabular-nums tracking-[0.1em] text-[var(--fg-muted)]">
              {artwork.year}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-0.5 text-[11px] text-[var(--fg-muted)] sm:text-xs">
          <span className="tabular-nums tracking-[0.04em] text-[var(--fg)]">
            {artwork.dimensions}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{artwork.medium}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-[var(--fg-muted)]">{artwork.year}</span>
        </div>
      </button>
    </article>
  );
});

const smBreakpointQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(min-width: 640px)')
    : null;

const lgBreakpointQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(min-width: 1024px)')
    : null;

function getViewportWidthSnapshot(): number {
  if (typeof window === 'undefined') return 1440;
  return window.innerWidth;
}

function getServerViewportWidthSnapshot(): number {
  return 1440;
}

function subscribeViewportWidth(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('resize', onStoreChange, { passive: true });
  window.visualViewport?.addEventListener('resize', onStoreChange, { passive: true });
  smBreakpointQuery?.addEventListener('change', onStoreChange);
  lgBreakpointQuery?.addEventListener('change', onStoreChange);

  const observer =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => onStoreChange())
      : null;
  observer?.observe(document.documentElement);

  return () => {
    window.removeEventListener('resize', onStoreChange);
    window.visualViewport?.removeEventListener('resize', onStoreChange);
    smBreakpointQuery?.removeEventListener('change', onStoreChange);
    lgBreakpointQuery?.removeEventListener('change', onStoreChange);
    observer?.disconnect();
  };
}

function useResponsiveViewportWidth(): number {
  return useSyncExternalStore(
    subscribeViewportWidth,
    getViewportWidthSnapshot,
    getServerViewportWidthSnapshot
  );
}

export function PortfolioGallery({
  artworks,
  searchQuery,
  isEntered = true,
  isLoading = false,
  titleVisible = true,
  onSearchChange,
  onOpenArtwork,
}: PortfolioGalleryProps) {
  const { t } = useLanguage();
  const theme = useTheme();
  const chladniColors = getChladniThemeColors(theme);
  const [internalQuery, setInternalQuery] = useState('');
  const viewportWidth = useResponsiveViewportWidth();

  const effectiveQuery = searchQuery ?? internalQuery;
  const handleQueryChange = (nextValue: string) => {
    if (onSearchChange) {
      onSearchChange(nextValue);
    } else {
      setInternalQuery(nextValue);
    }
  };

  const isSearchActive = effectiveQuery.trim().length > 0;

  const availableArtworks = useMemo(
    () => getAvailableArtworks(artworks),
    [artworks]
  );

  const filteredArtworks = useMemo(
    () => filterArtworks(availableArtworks, 'ALL', effectiveQuery),
    [availableArtworks, effectiveQuery]
  );

  const columnCount = getEffectiveColumnCount(viewportWidth, filteredArtworks.length);

  const masonryColumns = useMemo(
    () => distributeMasonryColumns(filteredArtworks, columnCount),
    [filteredArtworks, columnCount]
  );

  const gridContainerClass =
    columnCount === 1
      ? 'mx-auto mt-12 grid max-w-lg grid-cols-1 gap-7'
      : columnCount === 2
        ? filteredArtworks.length === 2
          ? 'mx-auto mt-12 grid max-w-4xl grid-cols-1 items-start gap-7 sm:grid-cols-2'
          : 'mt-12 grid grid-cols-1 items-start gap-7 sm:grid-cols-2'
        : 'mt-12 grid grid-cols-1 items-start gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8';

  const handleInquiryScroll = () => {
    const contactEl = document.getElementById('contact');
    contactEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="gallery"
      aria-labelledby="portfolio-heading"
      className="relative scroll-mt-20 overflow-x-clip px-5 pt-24 pb-28 sm:px-8 sm:pt-26 lg:pt-28 lg:pb-32"
    >
      {/* Full-Gallery Persistent ChladniTune Background */}
      <div
        aria-hidden="true"
        data-testid="gallery-chladni-wrapper"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          data-testid="gallery-chladni-sticky"
          className="sticky top-0 h-[100lvh] w-full overflow-hidden"
        >
          <ChladniGalleryBackground
            active={isEntered}
            sand={chladniColors.sand}
            plate={chladniColors.plate}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1360px]">
        {/* Section Heading */}
        <PortfolioCategoryHeader titleVisible={titleVisible} />

        {/* Liquid-Glass Catalogue Search Bar */}
        <div className="mx-auto mt-9 max-w-xl">
          <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--search-bg)] px-4 py-1 backdrop-blur-xl shadow-[var(--shadow-card)] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[#C62828] focus-within:bg-[var(--card-bg)] focus-within:shadow-[0_0_20px_rgba(198,40,40,0.12),0_8px_24px_rgba(0,0,0,0.12)]">
            <Search
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[var(--fg-muted)]"
            />
            <label htmlFor="gallery-search-input" className="sr-only">
              {t.portfolio.searchLabel}
            </label>
            <input
              id="gallery-search-input"
              data-testid="gallery-search-input"
              type="search"
              value={effectiveQuery}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder={t.portfolio.searchPlaceholder}
              aria-label={t.portfolio.searchLabel}
              className="min-h-[40px] w-full bg-transparent px-3 font-sans text-sm text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {isSearchActive && (
              <div className="flex shrink-0 items-center gap-2">
                <span
                  data-testid="gallery-search-count"
                  className="font-display text-[11px] tabular-nums tracking-[0.14em] text-[var(--fg-muted)]"
                >
                  {filteredArtworks.length} / {availableArtworks.length}
                </span>
                <button
                  type="button"
                  data-testid="gallery-search-clear"
                  onClick={() => handleQueryChange('')}
                  aria-label={t.portfolio.clearSearch}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--fg)] transition-colors hover:border-[#C62828] hover:bg-[#C62828] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Masonry Grid or Empty State */}
        {isLoading ? (
          <MasonrySkeletonGrid
            count={6}
            columnCount={getEffectiveColumnCount(viewportWidth, 6)}
          />
        ) : filteredArtworks.length > 0 ? (
          <div
            data-testid="masonry-grid"
            data-columns={columnCount}
            className={gridContainerClass}
          >
            {masonryColumns.map((columnItems, colIndex) => (
              <div
                key={`masonry-col-${colIndex}`}
                data-testid="masonry-column"
                className="flex flex-col gap-7 lg:gap-8"
              >
                {columnItems.map(({ artwork, index }) => (
                  <GalleryCard
                    key={artwork.id}
                    artwork={artwork}
                    index={index}
                    onOpen={onOpenArtwork}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div
            data-testid="gallery-empty-state"
            className="relative mt-14 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-16 text-center shadow-[var(--shadow-elevated)] sm:px-12 sm:py-20"
          >
            <div className="relative z-10 mx-auto max-w-xl">
              <p className="font-display text-[11px] font-normal uppercase tracking-[0.34em] text-[var(--accent-text)]">
                {t.portfolio.curatorialArchive}
              </p>

              <h2 className="mt-4 font-mauline text-2xl font-normal uppercase tracking-[0.16em] text-[var(--fg)] sm:text-3xl [text-wrap:balance]">
                {isSearchActive
                  ? t.portfolio.searchEmptyHeading
                  : t.portfolio.emptyHeadingAll}
              </h2>

              <div
                aria-hidden="true"
                className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
              />

              <p className="mt-5 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-[15px]">
                {isSearchActive
                  ? t.portfolio.searchEmptyDescription
                  : t.portfolio.emptyDescription}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                {isSearchActive && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange('')}
                    className="inline-flex min-h-[44px] items-center justify-center border border-[var(--border)] bg-[var(--card-bg)] px-6 py-2.5 font-display text-xs uppercase tracking-[0.22em] text-[var(--fg)] transition-colors duration-200 hover:border-[#C62828] hover:text-[var(--accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828]"
                  >
                    {t.portfolio.clearSearch}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleInquiryScroll}
                  className="inline-flex min-h-[44px] items-center justify-center border border-[#C62828] bg-[#C62828] px-7 py-2.5 font-display text-xs uppercase tracking-[0.24em] text-white transition-all duration-200 hover:bg-[#df1d25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828]"
                >
                  {t.portfolio.inquirePrivateViewing}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
