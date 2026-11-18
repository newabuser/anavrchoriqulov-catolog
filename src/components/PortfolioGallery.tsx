import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { AspectRatioHint, Artwork, ArtworkCategory } from '../types/artwork';
import {
  computeCardTilt,
  computeCategoryCounts,
  computeMasonryParallaxRange,
  filterArtworksByCategory,
} from '../utils/galleryLogic';
import { PortfolioCategoryHeader } from './PortfolioCategoryHeader';
import { useLanguage } from '../context/LanguageContext';

interface PortfolioGalleryProps {
  artworks: Artwork[];
  categories: ArtworkCategory[];
  activeCategory: ArtworkCategory;
  isEntered?: boolean;
  isLoading?: boolean;
  onSelectCategory: (category: ArtworkCategory) => void;
  onOpenArtwork: (artwork: Artwork) => void;
}

interface GalleryCardProps {
  artwork: Artwork;
  index: number;
  isEntered: boolean;
  onOpen: (artwork: Artwork) => void;
}

const SKELETON_ASPECTS: AspectRatioHint[] = [
  'portrait',
  'landscape',
  'square',
  'portrait',
  'landscape',
  'portrait',
];

function getAspectClass(ratio: AspectRatioHint): string {
  if (ratio === 'portrait') return 'aspect-[3/4]';
  if (ratio === 'square') return 'aspect-square';
  return 'aspect-[4/3]';
}

function MasonrySkeletonGrid({ count = 6 }: { count?: number }) {
  const items = SKELETON_ASPECTS.slice(0, count);

  return (
    <div
      data-testid="gallery-skeleton"
      role="status"
      aria-label="Loading portfolio artworks"
      className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10"
    >
      {items.map((ratio, index) => {
        const spanClass =
          index % 3 === 0 ? 'md:col-span-7' : index % 3 === 1 ? 'md:col-span-5 md:mt-12' : 'md:col-span-6';
        return (
          <div
            key={`skeleton-${index}`}
            aria-hidden="true"
            className={`${spanClass} rounded-2xl border border-[#eaeaea]/10 bg-[#0d0d0f] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.68)] sm:p-5`}
          >
            <div className="rounded-xl bg-[#080808] p-2 ring-1 ring-[#eaeaea]/15">
              <div
                className={`relative rounded-lg overflow-hidden bg-[#141416] ${getAspectClass(ratio)} w-full`}
              >
                <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 px-0.5">
              <div className="relative h-3.5 w-2/3 overflow-hidden bg-neutral-800/80">
                <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              </div>
              <div className="h-3 w-12 shrink-0 bg-neutral-800/60" />
            </div>
            <div className="mt-2 flex items-center gap-2 px-0.5">
              <div className="h-2.5 w-24 bg-neutral-800/60" />
              <div className="h-2.5 w-28 bg-neutral-800/40" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GalleryCard({ artwork, index, isEntered, onOpen }: GalleryCardProps) {
  const { t } = useLanguage();
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'end start'],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.35,
  });

  const { yRange, baseScale } = computeMasonryParallaxRange(index);
  const imageParallaxY = useTransform(smoothScrollProgress, [0, 1], yRange);

  const tiltSpringConfig = { stiffness: 260, damping: 24, mass: 0.45 };
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const rotateX = useSpring(rawRotateX, tiltSpringConfig);
  const rotateY = useSpring(rawRotateY, tiltSpringConfig);
  const scale = useSpring(rawScale, tiltSpringConfig);

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    rawScale.set(1.02);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { rotateX: nextX, rotateY: nextY } = computeCardTilt(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
      3.2
    );
    rawRotateX.set(nextX);
    rawRotateY.set(nextY);
    rawScale.set(1.02);
  };

  const resetHoverTilt = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScale.set(1);
  };

  useEffect(() => {
    setHasError(false);
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [artwork.imageUrl]);

  const aspectClass = getAspectClass(artwork.aspectRatio);

  const editorialSpanClass = (() => {
    const slot = index % 5;
    if (slot === 0) return 'col-span-1 md:col-span-7';
    if (slot === 1) return 'col-span-1 md:col-span-5 md:mt-14';
    if (slot === 2) return 'col-span-1 md:col-span-5';
    if (slot === 3) return 'col-span-1 md:col-span-7 md:-mt-4';
    return 'col-span-1 md:col-span-8 md:col-start-3';
  })();

  return (
    <motion.article
      className={editorialSpanClass}
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={isEntered ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.65,
              delay: (index % 3) * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }
      }
    >
      <button
        type="button"
        onClick={() => onOpen(artwork)}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetHoverTilt}
        onBlur={resetHoverTilt}
        aria-label={`${t.portfolio.inspectArtwork}: ${artwork.title} (${artwork.category}, ${artwork.year})`}
        className="group block w-full rounded-2xl border border-[#eaeaea]/[0.1] bg-[#0d0d0f] p-2.5 text-left shadow-[0_20px_48px_rgba(0,0,0,0.68)] transition-all duration-300 hover:border-[#eaeaea]/30 hover:shadow-[0_32px_72px_rgba(0,0,0,0.88)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:p-5"
      >
        {/* Crisp Architectural Museum Matting with Subtle Interactive 3D Tilt & Scale */}
        <motion.div
          data-testid="masonry-card-tilt"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  transformPerspective: 950,
                  rotateX,
                  rotateY,
                  scale,
                }
          }
          className="rounded-xl bg-[#080808] p-1.5 ring-1 ring-[#eaeaea]/75 will-change-transform sm:p-2"
        >
          <div
            ref={frameRef}
            className={`relative rounded-lg overflow-hidden bg-[#070708] ${aspectClass} w-full`}
          >
            {/* Per-Card Frame Skeleton Overlay While Image Streams In */}
            {!isLoaded && !hasError && (
              <div
                aria-hidden="true"
                data-testid="card-image-skeleton"
                className="absolute inset-0 z-10 bg-[#141416]"
              >
                <div className="gallery-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
              </div>
            )}

            {!hasError ? (
              <motion.div
                data-testid="masonry-image-parallax"
                style={
                  prefersReducedMotion
                    ? undefined
                    : { y: imageParallaxY, scale: baseScale }
                }
                className="h-full w-full will-change-transform"
              >
                <img
                  ref={imgRef}
                  src={artwork.imageUrl}
                  alt={`${artwork.title} — ${artwork.medium}`}
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsLoaded(true)}
                  onError={() => setHasError(true)}
                  className={`block h-full w-full object-contain p-2 sm:p-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </motion.div>
            ) : (
              <div
                className={`flex ${aspectClass} w-full flex-col items-center justify-center bg-gradient-to-br from-[#161618] to-[#080808] p-4 text-center`}
              >
                <span className="font-display text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  {artwork.title}
                </span>
              </div>
            )}

            {/* Subtle Hover Scrim & Expand Affordance */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 flex items-end justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center border border-[#eaeaea]/40 bg-black/65 text-[#eaeaea] backdrop-blur-xs sm:h-8 sm:w-8">
                <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Unboxed Museum Plaque Metadata: Title, Dimensions, Medium, Price */}
        <div className="mt-3 flex items-baseline justify-between gap-2 px-0.5 sm:mt-4 sm:gap-4">
          <h3 className="font-display text-xs font-normal tracking-[0.06em] text-[#eaeaea] transition-colors group-hover:text-white sm:text-sm md:text-[15px]">
            {artwork.title}
          </h3>
          {artwork.price ? (
            <span className="shrink-0 font-display text-[11px] font-light tabular-nums tracking-[0.12em] text-[#eaeaea]/85 sm:text-xs">
              {artwork.price}
            </span>
          ) : (
            <span className="shrink-0 text-[11px] tabular-nums tracking-[0.12em] text-neutral-400 sm:text-xs">
              {artwork.year}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-0.5 text-[10px] text-neutral-400 sm:text-xs">
          <span className="tabular-nums tracking-[0.06em] text-neutral-300/90">
            {artwork.dimensions}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{artwork.medium}</span>
          {artwork.price && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums text-neutral-400">{artwork.year}</span>
            </>
          )}
        </div>
      </button>
    </motion.article>
  );
}

export function PortfolioGallery({
  artworks,
  categories,
  activeCategory,
  isEntered = true,
  isLoading = false,
  onSelectCategory,
  onOpenArtwork,
}: PortfolioGalleryProps) {
  const { t } = useLanguage();
  const filteredArtworks = filterArtworksByCategory(artworks, activeCategory);
  const categoryCounts = computeCategoryCounts(artworks, categories);

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
      {/* Architectural Exhibition Lighting: Multi-Beam Ceiling Spotlights & Restrained Crimson Bounce */}
      <div aria-hidden="true" className="gallery-exhibition-lighting z-0" />
      {/* Subtle Museum Wall Bay Seam Hairlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 hidden w-full max-w-[1360px] -translate-x-1/2 border-x border-[#eaeaea]/[0.03] lg:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px]">
        {/* Section Heading */}
        <PortfolioCategoryHeader />

        {/* Architectural Category Filter Bar (rendered only when multiple categories exist) */}
        {categories.length > 1 && (
          <div
            role="tablist"
            aria-label="Exhibition categories"
            className="mt-10 flex flex-nowrap items-center justify-center gap-x-3.5 overflow-x-auto border-b border-[#eaeaea]/[0.09] sm:gap-x-9"
          >
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              const count = categoryCounts[category] ?? 0;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectCategory(category)}
                  className={`relative min-h-[44px] shrink-0 whitespace-nowrap px-0.5 py-3 font-display text-[10px] font-normal uppercase tracking-[0.16em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:px-1 sm:text-xs sm:tracking-[0.26em] ${
                    isSelected
                      ? 'text-[#eaeaea]'
                      : 'text-neutral-400 hover:text-[#eaeaea]'
                  }`}
                >
                  <span>{category}</span>
                  {artworks.length > 0 && (
                    <span className="ml-1.5 text-[10px] tabular-nums text-neutral-500">
                      ({count})
                    </span>
                  )}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-[#c81018]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Asymmetrical Exhibition Grid or Curated Archive State */}
        {isLoading ? (
          <MasonrySkeletonGrid count={activeCategory === 'ALL' ? 6 : 2} />
        ) : filteredArtworks.length > 0 ? (
          <motion.div
            key={isEntered ? activeCategory : 'gate'}
            data-testid="masonry-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={
              filteredArtworks.length === 1
                ? 'mx-auto mt-14 max-w-2xl'
                : 'mt-14 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start md:gap-10'
            }
          >
            {filteredArtworks.map((artwork, index) => (
              <GalleryCard
                key={artwork.id}
                artwork={artwork}
                index={index}
                isEntered={isEntered}
                onOpen={onOpenArtwork}
              />
            ))}
          </motion.div>
        ) : (
          <div
            data-testid="gallery-empty-state"
            className="relative mt-14 overflow-hidden rounded-2xl border border-[#eaeaea]/[0.12] bg-[#111114]/86 px-6 py-16 text-center shadow-[0_28px_70px_rgba(0,0,0,0.68)] sm:px-12 sm:py-20"
          >
            {/* Subtle Directional Gallery Wall Wash & Corner Hairlines */}
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
                {activeCategory === 'ALL'
                  ? t.portfolio.emptyHeadingAll
                  : `${t.portfolio.emptyHeadingCategory} ${activeCategory}`}
              </h2>

              <div
                aria-hidden="true"
                className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-[#eaeaea]/35 to-transparent"
              />

              <p className="mt-5 text-sm leading-relaxed text-neutral-300/85 sm:text-[15px]">
                {t.portfolio.emptyDescription}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
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
