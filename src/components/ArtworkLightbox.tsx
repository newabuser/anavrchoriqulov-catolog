import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Artwork } from '../types/artwork';

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  totalCount: number;
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onInquire: (artworkTitle: string) => void;
}

export function ArtworkLightbox({
  artwork,
  totalCount,
  currentIndex,
  onClose,
  onNavigate,
  onInquire,
}: ArtworkLightboxProps) {
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
          aria-label="Close artwork lightbox"
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
              aria-label="Previous artwork"
              className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea]/15 bg-black/70 text-[#eaeaea] transition-colors hover:border-[#eaeaea]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-[#c81018] sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          <div className="rounded-xl border border-neutral-800 bg-[#121214] p-2.5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] sm:p-3.5">
            <div className="rounded-lg bg-[#080808] p-1.5 ring-1 ring-[#eaeaea]/80">
              {!imageError ? (
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} — ${artwork.medium}`}
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
            </div>
          </div>

          {totalCount > 1 && (
            <button
              type="button"
              onClick={() => onNavigate('next')}
              aria-label="Next artwork"
              className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea]/15 bg-black/70 text-[#eaeaea] transition-colors hover:border-[#eaeaea]/50 hover:text-white focus-visible:outline-2 focus-visible:outline-[#c81018] sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Museum Accession Details Panel */}
        <aside className="flex w-full shrink-0 flex-col justify-between overflow-y-auto border-t border-[#eaeaea]/10 bg-[#0e0e10] p-6 sm:p-8 lg:w-[380px] lg:border-t-0 lg:border-l">
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
              <span>{artwork.category}</span>
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
                <dt className="uppercase tracking-[0.18em] text-neutral-400">Medium</dt>
                <dd className="text-right text-[#eaeaea]">{artwork.medium}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">Dimensions</dt>
                <dd className="text-right tabular-nums text-[#eaeaea]">
                  {artwork.dimensions}
                </dd>
              </div>
              {artwork.price && (
                <div className="flex justify-between gap-4 py-3">
                  <dt className="uppercase tracking-[0.18em] text-neutral-400">Price</dt>
                  <dd className="text-right tabular-nums text-[#eaeaea]">
                    {artwork.price}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-3">
                <dt className="uppercase tracking-[0.18em] text-neutral-400">Edition</dt>
                <dd className="text-right text-[#eaeaea]">Unique Original</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => onInquire(artwork.title)}
              className="inline-flex min-h-[44px] w-full items-center justify-center border border-[#eaeaea]/35 bg-transparent px-6 py-3 font-display text-xs font-normal uppercase tracking-[0.24em] text-[#eaeaea] transition-colors duration-200 hover:border-[#c81018] hover:bg-[#c81018] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
            >
              INQUIRE ABOUT THIS WORK
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
