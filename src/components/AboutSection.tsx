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

  const bgY = useTransform(smoothProgress, [0, 1], [-44, 44]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1.08, 1.15]);
  const textY = useTransform(smoothProgress, [0, 1], [14, -14]);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative scroll-mt-16 overflow-hidden border-t border-[#eaeaea]/10 bg-gradient-to-b from-[#0d0d10]/74 via-[#111114]/78 to-[#09090b]/76 px-5 py-24 sm:px-8 lg:py-32"
    >
      {/* Editorial Monograph Chiaroscuro Wall Lighting & Whisper-Quiet Crimson Depth */}
      <div aria-hidden="true" className="about-monograph-lighting z-0" />

      <div className="relative z-10 mx-auto grid max-w-[1360px] grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Studio Portrait Column */}
        <div className="lg:col-span-5">
          <figure className="flex h-full flex-col rounded-2xl border border-[#eaeaea]/[0.11] bg-[#101013]/92 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.68)] sm:p-5">
            <div className="relative flex-1 rounded-xl overflow-hidden bg-[#080808] ring-1 ring-[#eaeaea]/25">
              {!imageError ? (
                <img
                  src={ARTIST_PROFILE.aboutImageUrl || ARTIST_PROFILE.heroImageUrl}
                  alt={ARTIST_PROFILE.heroImageAlt}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="aspect-[4/3] w-full object-cover object-[28%_center] grayscale contrast-[1.08] brightness-[1.03] lg:aspect-auto lg:h-full"
                />
              ) : (
                <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#121214] lg:h-full">
                  <span className="font-display text-xs uppercase tracking-[0.28em] text-neutral-400">
                    {ARTIST_PROFILE.name}
                  </span>
                </div>
              )}

              {/* Subtle Metallic Silver Inner Border echoing typographic metallic luster */}
              <div
                aria-hidden="true"
                data-testid="about-profile-metallic-border"
                className="pointer-events-none absolute inset-0 z-10 rounded-xl border border-white/[0.14] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.32),inset_1px_0_1px_rgba(235,238,245,0.2),inset_0_-1px_1px_rgba(150,156,168,0.22),inset_-1px_0_1px_rgba(125,130,140,0.18)]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-gradient-to-br from-white/[0.035] via-transparent to-black/[0.12]"
              />
            </div>
            <figcaption className="mt-4 flex items-center justify-between border-t border-[#eaeaea]/[0.08] pt-3 text-xs uppercase tracking-[0.22em] text-neutral-400">
              <span>{t.about.atelierPractice}</span>
              <span>{t.about.studioLocation}</span>
            </figcaption>
          </figure>
        </div>

        {/* Artist Statement Editorial Monograph Container */}
        <div
          ref={textContainerRef}
          data-testid="about-parallax-container"
          className="relative flex flex-col justify-center rounded-2xl overflow-hidden border border-[#eaeaea]/[0.11] bg-[#08080a]/88 p-7 sm:p-10 lg:col-span-7 lg:p-14"
        >
          {/* Parallax Monochrome Backdrop Image */}
          <motion.div
            aria-hidden="true"
            data-testid="about-parallax-bg"
            style={
              prefersReducedMotion
                ? { transform: 'scale(1.06)' }
                : { y: bgY, scale: bgScale }
            }
            className="pointer-events-none absolute -inset-y-14 inset-x-0 will-change-transform"
          >
            {!imageError ? (
              <img
                src={ARTIST_PROFILE.aboutImageUrl || ARTIST_PROFILE.heroImageUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[28%_24%] opacity-[0.22] grayscale contrast-125 brightness-75"
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_center,#1b1b1b_0%,#080808_75%)]" />
            )}
          </motion.div>

          {/* Editorial Chiaroscuro Readability Scrims */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#080808]/85 via-[#080808]/64 to-[#080808]/88"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(8,8,8,0.45)_0%,rgba(8,8,8,0.94)_85%)]"
          />

          {/* Differential Scroll Text Content */}
          <motion.div
            data-testid="about-parallax-text"
            style={prefersReducedMotion ? undefined : { y: textY }}
            className="relative z-10 will-change-transform"
          >
            <p className="font-display text-xs font-normal uppercase tracking-[0.36em] text-[#e23c42]">
              {t.about.sectionLabel}
            </p>
            <h2
              id="about-heading"
              className="mt-3 font-mauline text-3xl font-normal uppercase tracking-[0.2em] text-[#eaeaea] sm:text-4xl [text-wrap:balance]"
            >
              {ARTIST_PROFILE.aboutHeadline}
            </h2>
            <p className="mt-2.5 font-display text-sm font-light italic tracking-[0.12em] text-[#eaeaea]/78 sm:text-base">
              {t.about.aboutByline}
            </p>

            <div
              aria-hidden="true"
              className="mt-6 h-px w-full bg-gradient-to-r from-[#eaeaea]/20 via-[#eaeaea]/8 to-transparent"
            />

            {/* Biography Copy with Subtle Editorial Reading Progress Margin Rule */}
            <div ref={biographyRef} className="relative mt-7 pl-5 sm:pl-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 left-0 w-px bg-[#eaeaea]/12"
              >
                <motion.span
                  data-testid="about-reading-progress"
                  style={
                    prefersReducedMotion
                      ? { scaleY: 1 }
                      : { scaleY: readingFill }
                  }
                  className="block h-full w-[1.5px] -translate-x-[0.25px] origin-top bg-gradient-to-b from-[#c81018] via-[#c81018] to-[#f07377]/75 shadow-[0_0_8px_rgba(200,16,24,0.42)] will-change-transform"
                />
              </div>

              <p className="max-w-[60ch] font-display text-lg font-light leading-relaxed tracking-[0.02em] text-[#eaeaea] sm:text-xl">
                {t.about.statementLead}
              </p>

              <div className="mt-5 max-w-[62ch] space-y-4 text-sm leading-[1.85] text-[#eaeaea]/76 sm:text-[15px]">
                {t.about.statementParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Quiet Monograph Colophon Metadata (unboxed text, zero pills) */}
            <div className="mt-9 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#eaeaea]/10 pt-4 text-xs tracking-[0.16em] text-neutral-400">
              <span>{t.about.tagMedium}</span>
              <span aria-hidden="true">·</span>
              <span>{t.about.tagCompositions}</span>
              <span aria-hidden="true">·</span>
              <span>{t.about.tagLocation}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
