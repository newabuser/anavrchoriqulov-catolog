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
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
    if (cardRef.current) {
      cardRef.current.scrollTop = 0;
    }
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

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-y-contain bg-[#222222]/60 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] backdrop-blur-md sm:p-6 lg:p-8"
      onClick={onClose}
    >
      <div
        ref={cardRef}
        data-testid="artwork-lightbox-card"
        className="artwork-modal-card relative flex w-full max-w-6xl flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_24px_80px_rgba(0,0,0,0.15)] lg:max-h-[92vh] lg:flex-row lg:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top-Right Close Button on Mobile/Tablet; Absolute Top-Right on Desktop */}
        <div className="pointer-events-none sticky top-0 z-30 -mb-14 flex h-14 shrink-0 items-center justify-end px-3 pt-2 lg:contents">
          <button
            ref={closeButtonRef}
            type="button"
            data-testid="lightbox-close-button"
            onClick={onClose}
            aria-label={t.lightbox.close}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors hover:border-[#C62828] hover:text-[#C62828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] lg:absolute lg:top-3 lg:right-3 lg:z-20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Framed Artwork Canvas Stage */}
        <div className="relative flex flex-none items-center justify-center bg-[#F8F9FA] px-4 pt-16 pb-6 sm:px-10 sm:pt-16 sm:pb-8 lg:flex-1 lg:p-10">
          {totalCount > 1 && (
            <button
              type="button"
              data-testid="lightbox-prev-button"
              onClick={() => onNavigate('prev')}
              aria-label={t.lightbox.previous}
              className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors hover:border-[#C62828] hover:text-[#C62828] focus-visible:outline-2 focus-visible:outline-[#C62828] sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-3">
            <div className="relative overflow-hidden rounded-lg bg-[#F1F2F4] ring-1 ring-[#E5E7EB]">
              {!imageError ? (
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} — ${artwork.medium}`}
                  width={artwork.width}
                  height={artwork.height}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="artwork-modal-image block h-auto w-auto max-w-full object-contain sm:max-h-[64dvh] lg:max-h-[76vh]"
                />
              ) : (
                <div className="flex h-72 w-72 items-center justify-center bg-[#E5E7EB] p-6 text-center">
                  <span className="font-display text-xs uppercase tracking-[0.2em] text-[#555555]">
                    {artwork.title}
                  </span>
                </div>
              )}

              {sold && (
                <div className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-[#FFFFFF]/90 px-3 py-1 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-xs bg-[#C62828]" />
                  <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-[#222222]">
                    {t.lightbox.soldStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {totalCount > 1 && (
            <button
              type="button"
              data-testid="lightbox-next-button"
              onClick={() => onNavigate('next')}
              aria-label={t.lightbox.next}
              className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors hover:border-[#C62828] hover:text-[#C62828] focus-visible:outline-2 focus-visible:outline-[#C62828] sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Museum Accession Details Panel */}
        <aside className="flex w-full shrink-0 flex-col justify-between border-t border-[#E5E7EB] bg-[#F8F9FA] px-5 pt-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:p-8 lg:w-[390px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between gap-4 pr-10 text-xs uppercase tracking-[0.24em] text-[#555555]">
              <span>{artwork.accessionNumber}</span>
              <span className="tabular-nums">
                {currentIndex + 1} / {totalCount}
              </span>
            </div>

            <h2
              id="lightbox-title"
              className="mt-4 font-display text-2xl font-light tracking-[0.06em] text-[#222222] [text-wrap:balance]"
            >
              {artwork.title}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C62828]">
              <span>{mediumCategoryLabel}</span>
              <span aria-hidden="true" className="text-[#E5E7EB]">
                /
              </span>
              <span className="tabular-nums text-[#555555]">{artwork.year}</span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#555555]">
              {artwork.description}
            </p>

            <dl className="mt-8 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB] text-xs">
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-[#555555]">{t.lightbox.medium}</dt>
                <dd className="text-right text-[#222222]">{artwork.medium}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-[#555555]">{t.lightbox.dimensions}</dt>
                <dd className="text-right tabular-nums text-[#222222]">
                  {artwork.dimensions}
                </dd>
              </div>
              {displayPrice && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="uppercase tracking-[0.18em] text-[#555555]">{t.lightbox.price}</dt>
                  <dd className="text-right tabular-nums text-[#222222]">
                    {displayPrice}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-[#555555]">{t.lightbox.edition}</dt>
                <dd className="text-right text-[#222222]">{t.lightbox.uniqueOriginal}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-[#555555]">{t.lightbox.availability}</dt>
                <dd
                  className={`text-right font-display uppercase tracking-[0.16em] ${
                    sold ? 'text-[#C62828]' : 'text-[#222222]'
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
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-6 py-3 font-display text-xs font-medium uppercase tracking-[0.26em] text-[#555555]"
              >
                <span aria-hidden="true" className="h-2 w-2 rounded-xs bg-[#C62828]" />
                <span>{t.lightbox.soldStatus}</span>
              </div>
            ) : (
              <a
                href={TELEGRAM_PURCHASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="lightbox-buy-button"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-[#C62828] bg-[#C62828] px-6 py-3 font-display text-xs font-medium uppercase tracking-[0.22em] text-white shadow-[0_10px_28px_rgba(198,40,40,0.28)] transition-colors duration-200 hover:bg-[#df1d25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828]"
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
