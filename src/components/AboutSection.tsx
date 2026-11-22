import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

export function AboutSection() {
  const { t } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const biographyRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: textContainerRef,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: biographyProgress } = useScroll({
    target: biographyRef,
    offset: ['start 0.85', 'end 0.48'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });

  const readingFill = useSpring(biographyProgress, {
    stiffness: 160,
    damping: 28,
    mass: 0.35,
  });

  const bgY = useTransform(smoothProgress, [0, 1], [-20, 20]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1.02, 1.05]);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-16 overflow-hidden border-t border-[#E5E7EB] bg-gradient-to-b from-[#F8F9FA] via-[#FFFFFF] to-[#F1F2F4] px-5 py-24 sm:px-8 lg:py-32"
    >
      <div className="relative z-10 mx-auto grid max-w-[1360px] grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Studio Portrait Column */}
        <div className="lg:col-span-5">
          <figure className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-5">
            <div className="relative flex-1 rounded-xl overflow-hidden bg-[#F1F2F4] ring-1 ring-[#E5E7EB]">
              {!imageError ? (
                <img
                  src={ARTIST_PROFILE.aboutImageUrl || ARTIST_PROFILE.heroImageUrl}
                  alt={ARTIST_PROFILE.heroImageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="aspect-[4/3] w-full object-cover object-[28%_center] contrast-[1.04] brightness-[1.01] lg:aspect-auto lg:h-full"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#E5E7EB] lg:h-full">
                  <span className="font-display text-xs uppercase tracking-[0.28em] text-[#555555]">
                    {ARTIST_PROFILE.name}
                  </span>
                </div>
              )}
            </div>
            <figcaption className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs uppercase tracking-[0.22em] text-[#555555]">
              <span>{t.about.atelierPractice}</span>
              <span>{t.about.studioLocation}</span>
            </figcaption>
          </figure>
        </div>

        {/* Artist Statement Editorial Monograph Container */}
        <div
          ref={textContainerRef}
          data-testid="about-parallax-container"
          className="relative flex flex-col justify-center rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#FFFFFF] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-10 lg:col-span-7 lg:p-14"
        >
          {/* Parallax Subtle Backdrop */}
          <motion.div
            aria-hidden="true"
            data-testid="about-parallax-bg"
            style={
              prefersReducedMotion
                ? { transform: 'scale(1.02)' }
                : { y: bgY, scale: bgScale }
            }
            className="pointer-events-none absolute -inset-y-14 inset-x-0 opacity-[0.05] will-change-transform"
          >
            {!imageError ? (
              <img
                src={ARTIST_PROFILE.aboutImageUrl || ARTIST_PROFILE.heroImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[28%_24%]"
              />
            ) : (
              <div className="h-full w-full bg-[#E5E7EB]" />
            )}
          </motion.div>

          {/* Differential Scroll Text Content */}
          <div data-testid="about-parallax-text" className="relative z-10">
            <p className="font-display text-xs font-normal uppercase tracking-[0.36em] text-[#C62828]">
              {t.about.sectionLabel}
            </p>
            <h2
              id="about-heading"
              className="mt-3 font-mauline text-3xl font-normal uppercase tracking-[0.2em] text-[#222222] sm:text-4xl [text-wrap:balance]"
            >
              {ARTIST_PROFILE.aboutHeadline}
            </h2>
            <p className="mt-2.5 font-display text-sm font-light italic tracking-[0.12em] text-[#555555] sm:text-base">
              {t.about.aboutByline}
            </p>

            <div
              aria-hidden="true"
              className="mt-6 h-px w-full bg-gradient-to-r from-[#E5E7EB] via-[#E5E7EB]/50 to-transparent"
            />

            {/* Biography Copy with Reading Progress Margin Rule */}
            <div ref={biographyRef} className="relative mt-7 pl-5 sm:pl-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 left-0 w-px bg-[#E5E7EB]"
              >
                <motion.span
                  data-testid="about-reading-progress"
                  style={
                    prefersReducedMotion
                      ? { scaleY: 1 }
                      : { scaleY: readingFill }
                  }
                  className="block h-full w-[1.5px] -translate-x-[0.25px] origin-top bg-gradient-to-b from-[#C62828] via-[#C62828] to-[#df1d25]/75 will-change-transform"
                />
              </div>

              <p className="max-w-[60ch] font-display text-lg font-light leading-relaxed tracking-[0.02em] text-[#222222] sm:text-xl">
                {t.about.statementLead}
              </p>

              <div className="mt-5 max-w-[62ch] space-y-4 text-sm leading-[1.85] text-[#555555] sm:text-[15px]">
                {t.about.statementParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Colophon Metadata */}
            <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#E5E7EB] pt-4 text-xs tracking-[0.16em] text-[#555555]">
              <span>{t.about.tagMedium}</span>
              <span aria-hidden="true">·</span>
              <span>{t.about.tagCompositions}</span>
              <span aria-hidden="true">·</span>
              <span>{t.about.tagLocation}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
