import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TELEGRAM_PURCHASE_URL } from '../data/portfolioData';
import { Artwork } from '../types/artwork';
import { useLanguage } from '../context/LanguageContext';
import { formatDisplayPrice, isArtworkSold } from '../utils/galleryLogic';

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  totalCount: number;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function ArtworkLightbox({
  artwork,
  totalCount,
  currentIndex,
  onClose,
  onNavigate,
}: ArtworkLightboxProps) {
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [artwork?.id]);

  const isOpen = artwork !== null;
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === 'ArrowRight' && totalCount > 1) {
        event.preventDefault();
        onNavigateRef.current('next');
      } else if (event.key === 'ArrowLeft' && totalCount > 1) {
        event.preventDefault();
        onNavigateRef.current('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalCount]);

  if (!artwork) {
    return null;
  }

  const sold = isArtworkSold(artwork);
  const displayPrice = formatDisplayPrice(artwork.price);
  const mediumCategoryLabel = artwork.medium.toLowerCase().includes('water')
    ? t.portfolio.watercolorCategory
    : t.portfolio.oilCategory;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      data-testid="artwork-lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/94 p-4 backdrop-blur-md sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#eaeaea]/15 bg-[#0d0d0f] shadow-2xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t.lightbox.close}
          className="absolute top-3 right-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea]/20 bg-black/80 text-[#eaeaea] transition-colors hover:border-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Framed Artwork Canvas Stage */}
        <div className="relative flex flex-1 items-center justify-center bg-[#060607] p-6 sm:p-10">
          {totalCount > 1 && (
            <button
              type="button"
              onClick={() => onNavigate('prev')}
              aria-label={t.lightbox.previous}
              className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea]/15 bg-black/70 text-[#eaeaea] transition-colors hover:border-[#eaeaea]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-[#c81018] sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative rounded-xl border border-neutral-800 bg-[#121214] p-2 shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:p-3">
            <div className="relative overflow-hidden rounded-lg bg-[#080808] ring-1 ring-[#eaeaea]/20">
              {!imageError ? (
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} — ${artwork.medium}`}
                  width={artwork.width}
                  height={artwork.height}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="max-h-[54vh] w-auto max-w-full object-contain lg:max-h-[76vh]"
                />
              ) : (
                <div className="flex h-72 w-72 items-center justify-center bg-neutral-900 p-6 text-center">
                  <span className="font-display text-xs uppercase tracking-[0.2em] text-neutral-400">
                    {artwork.title}
                  </span>
                </div>
              )}

              {sold && (
                <div className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-[#eaeaea]/25 bg-[#08080a]/85 px-3 py-1 backdrop-blur-sm">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-xs bg-[#c81018]" />
                  <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-[#eaeaea]">
                    {t.lightbox.soldStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {totalCount > 1 && (
            <button
              type="button"
              onClick={() => onNavigate('next')}
              aria-label={t.lightbox.next}
              className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea]/15 bg-black/70 text-[#eaeaea] transition-colors hover:border-[#eaeaea]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-[#c81018] sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Museum Accession Details Panel */}
        <aside className="flex w-full shrink-0 flex-col justify-between overflow-y-auto border-t border-[#eaeaea]/10 bg-[#0e0e10] p-6 sm:p-8 lg:w-[390px] lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between gap-4 pr-10 text-xs uppercase tracking-[0.24em] text-neutral-400">
              <span>{artwork.accessionNumber}</span>
              <span className="tabular-nums">
                {currentIndex + 1} / {totalCount}
              </span>
            </div>

            <h2
              id="lightbox-title"
              className="mt-4 font-display text-2xl font-light tracking-[0.06em] text-[#eaeaea] [text-wrap:balance]"
            >
              {artwork.title}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#c81018]">
              <span>{mediumCategoryLabel}</span>
              <span aria-hidden="true" className="text-neutral-600">
                /
              </span>
              <span className="tabular-nums text-neutral-300">{artwork.year}</span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-neutral-300">
              {artwork.description}
            </p>

            <dl className="mt-8 divide-y divide-[#eaeaea]/10 border-y border-[#eaeaea]/10 text-xs">
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">{t.lightbox.medium}</dt>
                <dd className="text-right text-[#eaeaea]">{artwork.medium}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">{t.lightbox.dimensions}</dt>
                <dd className="text-right tabular-nums text-[#eaeaea]">
                  {artwork.dimensions}
                </dd>
              </div>
              {displayPrice && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="uppercase tracking-[0.18em] text-neutral-400">{t.lightbox.price}</dt>
                  <dd className="text-right tabular-nums text-[#eaeaea]">
                    {displayPrice}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">{t.lightbox.edition}</dt>
                <dd className="text-right text-[#eaeaea]">{t.lightbox.uniqueOriginal}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">{t.lightbox.availability}</dt>
                <dd
                  className={`text-right font-display uppercase tracking-[0.16em] ${
                    sold ? 'text-[#e23c42]' : 'text-[#eaeaea]'
                  }`}
                >
                  {sold ? t.lightbox.soldStatus : t.lightbox.availableStatus}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            {sold ? (
              <div
                data-testid="lightbox-sold-status"
                aria-label={t.lightbox.soldStatus}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#eaeaea]/15 bg-white/[0.03] px-6 py-3 font-display text-xs font-medium uppercase tracking-[0.26em] text-neutral-300"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-xs bg-[#c81018]" />
                <span>{t.lightbox.soldStatus}</span>
              </div>
            ) : (
              <a
                href={TELEGRAM_PURCHASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="lightbox-buy-button"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#c81018] bg-[#c81018] px-6 py-3 font-display text-xs font-medium uppercase tracking-[0.22em] text-white shadow-[0_10px_28px_rgba(200,16,24,0.28)] transition-colors duration-200 hover:border-[#df1d25] hover:bg-[#df1d25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
              >
                <span>{t.lightbox.buyButton}</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
