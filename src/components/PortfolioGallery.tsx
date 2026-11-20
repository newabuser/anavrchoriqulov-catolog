import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Maximize2, Search, X } from 'lucide-react';
import { Artwork, ArtworkCategory } from '../types/artwork';
import {
  computeCategoryCounts,
  distributeMasonryColumns,
  filterArtworks,
  formatDisplayPrice,
  getEffectiveColumnCount,
  isArtworkSold,
} from '../utils/galleryLogic';
import { PortfolioCategoryHeader } from './PortfolioCategoryHeader';
import { useLanguage } from '../context/LanguageContext';

interface PortfolioGalleryProps {
  artworks: Artwork[];
  categories: ArtworkCategory[];
  activeCategory: ArtworkCategory;
  searchQuery?: string;
  isEntered?: boolean;
  isLoading?: boolean;
  onSelectCategory: (category: ArtworkCategory) => void;
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
              className="rounded-xl border border-[#eaeaea]/[0.08] bg-[#0c0c0e] p-3 sm:p-3.5"
            >
              <div className={`relative w-full overflow-hidden rounded-lg bg-[#141416] ${aspectClass}`}>
                <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-4 px-0.5">
                <div className="relative h-3.5 w-2/3 overflow-hidden bg-neutral-800/80">
                  <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>
                <div className="h-3 w-12 shrink-0 bg-neutral-800/60" />
              </div>
              <div className="mt-2 flex items-center gap-2 px-0.5">
                <div className="h-2.5 w-20 bg-neutral-800/60" />
                <div className="h-2.5 w-24 bg-neutral-800/40" />
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

  const sold = isArtworkSold(artwork);
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
    <article data-artwork-id={artwork.id} data-artwork-status={sold ? 'sold' : 'available'}>
      <button
        type="button"
        onClick={() => onOpen(artwork)}
        aria-label={`${t.portfolio.inspectArtwork}: ${artwork.title} (${artwork.medium}, ${artwork.year}${sold ? `, ${t.portfolio.soldBadge}` : ''})`}
        className={`group block w-full rounded-xl border p-3 text-left transition-[border-color,box-shadow,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:p-3.5 ${
          sold
            ? 'border-[#eaeaea]/[0.07] bg-[#0b0b0d]/90 hover:border-[#eaeaea]/20 hover:shadow-[0_22px_52px_rgba(0,0,0,0.75)]'
            : 'border-[#eaeaea]/[0.09] bg-[#0d0d10] shadow-[0_14px_38px_rgba(0,0,0,0.58)] hover:border-[#eaeaea]/28 hover:bg-[#101014] hover:shadow-[0_26px_64px_rgba(0,0,0,0.84)]'
        }`}
      >
        {/* Exact-Proportion Museum Artwork Canvas */}
        <div className="relative overflow-hidden rounded-lg bg-[#070709]">
          {!isLoaded && !hasError && (
            <div
              aria-hidden="true"
              data-testid="card-image-skeleton"
              className="absolute inset-0 z-10 bg-[#141416]"
            >
              <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
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
              } ${sold ? 'brightness-[0.94]' : ''}`}
            />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gradient-to-br from-[#161618] to-[#080808] p-4 text-center">
              <span className="font-display text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                {artwork.title}
              </span>
            </div>
          )}

          {/* Subtle Sold Status Indicator */}
          {sold && (
            <div
              data-testid="artwork-sold-badge"
              className="pointer-events-none absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1.5 rounded-md border border-[#eaeaea]/20 bg-[#08080a]/85 px-2.5 py-1 backdrop-blur-sm shadow-[0_6px_18px_rgba(0,0,0,0.48)]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-xs bg-[#c81018]"
              />
              <span className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-[#eaeaea]">
                {t.portfolio.soldBadge}
              </span>
            </div>
          )}

          {/* Subtle Hover Scrim & Details Affordance */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/65 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <span className="font-display text-[10px] uppercase tracking-[0.2em] text-[#eaeaea]/90">
              {categoryLabel}
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#eaeaea]/30 bg-black/70 text-[#eaeaea]">
              <Maximize2 className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Unboxed Museum Wall Plaque Metadata */}
        <div className="mt-3.5 flex items-baseline justify-between gap-3 px-0.5">
          <h3
            className={`font-display text-sm font-normal tracking-[0.04em] transition-colors sm:text-[15px] ${
              sold
                ? 'text-[#eaeaea]/75 group-hover:text-[#eaeaea]'
                : 'text-[#eaeaea] group-hover:text-white'
            }`}
          >
            {artwork.title}
          </h3>
          {displayPrice ? (
            <span
              className={`shrink-0 font-display text-xs font-light tabular-nums tracking-[0.1em] ${
                sold ? 'text-neutral-500' : 'text-[#eaeaea]/85'
              }`}
            >
              {displayPrice}
            </span>
          ) : (
            <span className="shrink-0 text-xs tabular-nums tracking-[0.1em] text-neutral-400">
              {artwork.year}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-0.5 text-[11px] text-neutral-400 sm:text-xs">
          <span className="tabular-nums tracking-[0.04em] text-neutral-300/90">
            {artwork.dimensions}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{artwork.medium}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums text-neutral-400">{artwork.year}</span>
          {sold && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-display text-[10px] font-medium uppercase tracking-[0.16em] text-[#e23c42]">
                {t.portfolio.soldBadge}
              </span>
            </>
          )}
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
  categories,
  activeCategory,
  searchQuery,
  isLoading = false,
  onSelectCategory,
  onSearchChange,
  onOpenArtwork,
}: PortfolioGalleryProps) {
  const { t } = useLanguage();
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

  const filteredArtworks = useMemo(
    () => filterArtworks(artworks, activeCategory, effectiveQuery),
    [artworks, activeCategory, effectiveQuery]
  );

  const categoryCounts = useMemo(
    () => computeCategoryCounts(artworks, categories),
    [artworks, categories]
  );

  const columnCount = getEffectiveColumnCount(viewportWidth, filteredArtworks.length);

  const masonryColumns = useMemo(
    () => distributeMasonryColumns(filteredArtworks, columnCount),
    [filteredArtworks, columnCount]
  );

  const categoryLabels: Record<ArtworkCategory, string> = {
    ALL: t.portfolio.allCategory,
    OIL: t.portfolio.oilCategory,
    WATERCOLOR: t.portfolio.watercolorCategory,
    SOLD: t.portfolio.soldCategory,
  };

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
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-[#070709]/68 via-[#0b0b0e]/64 to-[#08080a]/72 px-5 pt-24 pb-28 sm:px-8 sm:pt-26 lg:pt-28 lg:pb-32"
    >
      {/* Architectural Exhibition Lighting */}
      <div aria-hidden="true" className="gallery-exhibition-lighting z-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-full max-w-[1360px] -translate-x-1/2 border-x border-[#eaeaea]/[0.03] lg:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px]">
        {/* Section Heading */}
        <PortfolioCategoryHeader />

        {/* Architectural Category Navigation Bar */}
        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Exhibition categories"
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-b border-[#eaeaea]/[0.09] sm:gap-x-9"
          >
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              const count = categoryCounts[category] ?? 0;
              const label = categoryLabels[category] ?? category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  data-category={category}
                  aria-selected={isSelected}
                  onClick={() => onSelectCategory(category)}
                  className={`relative min-h-[44px] shrink-0 whitespace-nowrap px-1 py-3 font-display text-[11px] font-normal uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:text-xs sm:tracking-[0.22em] ${
                    isSelected
                      ? 'text-[#eaeaea]'
                      : 'text-neutral-400 hover:text-[#eaeaea]'
                  }`}
                >
                  <span>{label}</span>{' '}
                  <span
                    className={`ml-1 text-[11px] tabular-nums ${
                      isSelected ? 'text-[#eaeaea]/75' : 'text-neutral-500'
                    }`}
                  >
                    ({count})
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] bg-[#c81018]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Real-Time Liquid-Glass Catalogue Search Bar */}
        <div className="mx-auto mt-7 max-w-xl">
          <div className="relative flex items-center rounded-xl border border-[#eaeaea]/[0.13] bg-[rgba(14,14,16,0.72)] px-4 py-1 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(234,234,234,0.1),0_14px_34px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[#c81018]/75 focus-within:bg-[rgba(14,14,16,0.88)] focus-within:shadow-[0_0_24px_rgba(200,16,24,0.16),0_18px_40px_rgba(0,0,0,0.58)]">
            <Search
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#eaeaea]/55"
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
              className="min-h-[40px] w-full bg-transparent px-3 font-sans text-sm text-[#eaeaea] placeholder:text-neutral-400/80 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {(isSearchActive || activeCategory !== 'ALL') && (
              <div className="flex shrink-0 items-center gap-2">
                <span
                  data-testid="gallery-search-count"
                  className="font-display text-[11px] tabular-nums tracking-[0.14em] text-neutral-400"
                >
                  {filteredArtworks.length} / {artworks.length}
                </span>
                {isSearchActive && (
                  <button
                    type="button"
                    data-testid="gallery-search-clear"
                    onClick={() => handleQueryChange('')}
                    aria-label={t.portfolio.clearSearch}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#eaeaea]/15 bg-white/[0.04] text-[#eaeaea]/80 transition-colors hover:border-[#c81018]/70 hover:bg-[#c81018]/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Balanced Shortest-Column Masonry Grid or Curated Archive State */}
        {isLoading ? (
          <MasonrySkeletonGrid
            count={activeCategory === 'ALL' ? 6 : 2}
            columnCount={getEffectiveColumnCount(viewportWidth, activeCategory === 'ALL' ? 6 : 2)}
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
            className="relative mt-14 overflow-hidden rounded-2xl border border-[#eaeaea]/[0.12] bg-[#111114]/86 px-6 py-16 text-center shadow-[0_28px_70px_rgba(0,0,0,0.68)] sm:px-12 sm:py-20"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,234,234,0.06)_0%,transparent_62%),radial-gradient(circle_at_bottom_right,rgba(192,0,32,0.12)_0%,rgba(139,0,0,0.08)_38%,transparent_64%)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 left-4 h-4 w-4 border-t border-l border-[#eaeaea]/25"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-4 h-4 w-4 border-t border-r border-[#eaeaea]/25"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b border-l border-[#eaeaea]/25"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 bottom-4 h-4 w-4 border-b border-r border-[#eaeaea]/25"
            />

            <div className="relative z-10 mx-auto max-w-xl">
              <p className="font-display text-[11px] font-normal uppercase tracking-[0.34em] text-[#e23c42]">
                {t.portfolio.curatorialArchive}
              </p>

              <h2 className="mt-4 font-mauline text-2xl font-normal uppercase tracking-[0.16em] text-[#eaeaea] sm:text-3xl [text-wrap:balance]">
                {isSearchActive
                  ? t.portfolio.searchEmptyHeading
                  : activeCategory === 'ALL'
                    ? t.portfolio.emptyHeadingAll
                    : `${t.portfolio.emptyHeadingCategory} ${categoryLabels[activeCategory]}`}
              </h2>

              <div
                aria-hidden="true"
                className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-[#eaeaea]/35 to-transparent"
              />

              <p className="mt-5 text-sm leading-relaxed text-neutral-300/85 sm:text-[15px]">
                {isSearchActive
                  ? t.portfolio.searchEmptyDescription
                  : t.portfolio.emptyDescription}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                {isSearchActive && (
                  <button
                    type="button"
                    onClick={() => handleQueryChange('')}
                    className="inline-flex min-h-[44px] items-center justify-center border border-[#eaeaea]/25 bg-transparent px-6 py-2.5 font-display text-xs uppercase tracking-[0.22em] text-[#eaeaea] transition-colors duration-200 hover:border-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {t.portfolio.clearSearch}
                  </button>
                )}
                {activeCategory !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => onSelectCategory('ALL')}
                    className="inline-flex min-h-[44px] items-center justify-center border border-[#eaeaea]/25 bg-transparent px-6 py-2.5 font-display text-xs uppercase tracking-[0.22em] text-[#eaeaea] transition-colors duration-200 hover:border-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {t.portfolio.viewAllCategories}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleInquiryScroll}
                  className="inline-flex min-h-[44px] items-center justify-center border border-[#c81018]/80 bg-[#c81018]/14 px-7 py-2.5 font-display text-xs uppercase tracking-[0.24em] text-[#eaeaea] transition-all duration-200 hover:border-[#c81018] hover:bg-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
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
