import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { computeWordmarkOffsets, type WordmarkOffsets } from '../utils/wordmarkLayout';

interface WelcomeGateProps {
  isEntered: boolean;
  onEnter: () => void;
}

export function WelcomeGate({ isEntered, onEnter }: WelcomeGateProps) {
  const [imageError, setImageError] = useState(false);
  const [wordmarkOffsets, setWordmarkOffsets] = useState<WordmarkOffsets | null>(null);
  const firstWordRef = useRef<HTMLSpanElement | null>(null);
  const lastWordRef = useRef<HTMLSpanElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });

  const parallaxY = useTransform(smoothScrollY, [0, 900], [0, -68]);
  const parallaxScale = useTransform(smoothScrollY, [0, 900], [1.06, 1.13]);

  const measureWordmarkAlignment = () => {
    const firstEl = firstWordRef.current;
    const lastEl = lastWordRef.current;
    if (!firstEl || !lastEl) return;

    const textNode = firstEl.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE || (textNode.textContent?.length ?? 0) < 2) {
      return;
    }

    const nRange = document.createRange();
    nRange.setStart(textNode, 1);
    nRange.setEnd(textNode, 2);

    const firstRect = firstEl.getBoundingClientRect();
    const nRect = nRange.getBoundingClientRect();
    const lastRect = lastEl.getBoundingClientRect();
    const fontSizePx = parseFloat(window.getComputedStyle(firstEl).fontSize) || 0;

    setWordmarkOffsets(
      computeWordmarkOffsets(
        {
          firstLeft: firstRect.left,
          firstWidth: firstRect.width,
          nLeft: nRect.left,
          lastWidth: lastRect.width,
          fontSizePx,
        },
        {
          opticalShiftEm: -0.008,
          verticalAnchorRatio: -0.012,
        }
      )
    );
  };

  useLayoutEffect(() => {
    measureWordmarkAlignment();
  }, []);

  useEffect(() => {
    let active = true;
    const handleMeasure = () => {
      if (active) measureWordmarkAlignment();
    };

    document.fonts?.ready.then(handleMeasure).catch(() => {});

    const observer =
      typeof ResizeObserver !== 'undefined' && firstWordRef.current
        ? new ResizeObserver(handleMeasure)
        : null;

    if (observer && firstWordRef.current) {
      observer.observe(firstWordRef.current);
    }
    window.addEventListener('resize', handleMeasure);

    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener('resize', handleMeasure);
    };
  }, []);

  const [portraitLoaded, setPortraitLoaded] = useState(false);

  useEffect(() => {
    if (isEntered || typeof window === 'undefined') return;
    const preload = new Image();
    preload.crossOrigin = 'anonymous';
    preload.src = ARTIST_PROFILE.heroImageUrl;
    if ('fonts' in document) {
      document.fonts.load('400 26px "CaskoLuxuryDemo-Regular"').catch(() => {});
    }
  }, [isEntered]);

  return (
    <section
      aria-label="Welcome entrance"
      aria-hidden={isEntered}
      data-testid="welcome-gate"
      className={`fixed inset-0 z-50 flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#080808] ${
        isEntered
          ? 'opacity-0 pointer-events-none invisible'
          : 'opacity-100 visible transition-opacity duration-500 ease-out'
      }`}
    >
      {/* Monochrome Backdrop with Initial Portrait Reveal & Scroll Parallax (swap heroImageUrl in src/data/portfolioData.ts) */}
      <motion.div
        aria-hidden="true"
        data-testid="welcome-parallax-bg"
        style={
          prefersReducedMotion
            ? { transform: 'scale(1.03)' }
            : { y: parallaxY, scale: parallaxScale }
        }
        className="pointer-events-none absolute inset-0 will-change-transform"
      >
        {!imageError ? (
          <motion.img
            src={ARTIST_PROFILE.heroImageUrl}
            alt={ARTIST_PROFILE.heroImageAlt}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onLoad={() => setPortraitLoaded(true)}
            onError={() => setImageError(true)}
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : portraitLoaded
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0.72, scale: 1.04 }
            }
            transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover object-[38%_center] grayscale contrast-[1.14] brightness-[1.04] lg:object-center"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,#181818_0%,#050505_78%)]" />
        )}
      </motion.div>

      {/* Studio Depth & Controlled Deep-Crimson Light Field */}
      <div aria-hidden="true" className="welcome-studio-lighting" />

      {/* Responsive Hero Layout Frame: Exact Center on Mobile/Tablet, Right-Side Editorial Zone on Desktop */}
      <div className="relative z-10 mx-auto flex h-full min-h-[100svh] w-full max-w-[1440px] items-center justify-center pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] sm:px-8 lg:justify-end lg:px-14 xl:px-20">
        {/* Single Unified Typographic & CTA Content Group */}
        <motion.div
          data-testid="hero-content-group"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }
          }
          className="relative flex w-full max-w-xl flex-col items-center justify-center py-6 text-center before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_center,rgba(8,8,8,0.6)_0%,transparent_72%)] lg:w-[54%] lg:max-w-[660px] lg:py-10 lg:before:bg-[radial-gradient(ellipse_at_center,rgba(8,8,8,0.36)_0%,transparent_70%)] xl:w-[52%]"
        >
          {/* Group 1: Location + Unified Artist Wordmark */}
          <div
            data-testid="hero-identity-group"
            className="flex flex-col items-center"
          >
            <p className="font-display text-[11px] font-light uppercase tracking-[0.44em] text-[#eaeaea]/85 sm:text-xs md:text-sm">
              {ARTIST_PROFILE.studioLocation}
            </p>

            <h1
              data-testid="artist-wordmark"
              aria-label="Anvar Choriqulov"
              className="wordmark-lockup mt-5 max-w-full text-left select-none sm:mt-6"
            >
              <span
                ref={firstWordRef}
                data-testid="wordmark-first"
                className="wordmark-first whitespace-nowrap"
              >
                Anvar
              </span>
              <span className="sr-only"> </span>
              <span
                ref={lastWordRef}
                data-testid="wordmark-last"
                style={
                  wordmarkOffsets
                    ? { left: `${wordmarkOffsets.leftPx}px`, top: `${wordmarkOffsets.topPx}px` }
                    : undefined
                }
                className="wordmark-last whitespace-nowrap"
              >
                Choriqulov
              </span>
            </h1>
          </div>

          {/* Group 2: Decorative Transition Divider + Discipline */}
          <div
            data-testid="hero-discipline-group"
            className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:gap-3.5 md:mt-9"
          >
            <div
              aria-hidden="true"
              data-testid="hero-divider"
              className="h-px w-10 bg-gradient-to-r from-transparent via-[#eaeaea]/45 to-transparent sm:w-14"
            />

            <p className="font-display text-[11px] font-light uppercase tracking-[0.38em] text-[#eaeaea]/90 sm:text-xs md:text-sm">
              {ARTIST_PROFILE.subtitle}
            </p>
          </div>

          {/* Group 3: Refined Crimson-Illuminated WELCOME CTA */}
          <button
            type="button"
            data-testid="welcome-cta"
            onClick={onEnter}
            tabIndex={isEntered ? -1 : 0}
            className="welcome-neon-btn mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full px-11 py-3.5 font-display text-xs font-normal uppercase tracking-[0.34em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:mt-12 md:mt-14"
          >
            WELCOME
          </button>
        </motion.div>
      </div>
    </section>
  );
}
