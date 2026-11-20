import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  onReplayEntrance?: () => void;
}

export function Navbar({ onReplayEntrance }: NavbarProps) {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [activeHref, setActiveHref] = useState<string>('#gallery');
  const [isScrolled, setIsScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const centerLinks = [
    { index: '01', label: t.nav.gallery, subtitle: t.nav.gallerySubtitle, href: '#gallery' },
    { index: '02', label: t.nav.about, subtitle: t.nav.aboutSubtitle, href: '#about' },
  ];

  const contactItem = {
    index: '03',
    label: t.nav.contact,
    subtitle: t.nav.contactSubtitle,
    href: '#contact',
  };

  useEffect(() => {
    const sectionIds = ['gallery', 'about', 'contact'] as const;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);

      const probeY = window.scrollY + window.innerHeight * 0.34;
      let nextActive = '#gallery';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probeY) {
          nextActive = `#${id}`;
        }
      }
      setActiveHref(nextActive);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    closeButtonRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Floating Sticky Architectural Frame (88-92% width, preserves top crimson scroll accent) */}
      <div className="pointer-events-none sticky top-0 z-40 w-full pt-3 sm:pt-4">
        <header
          data-testid="site-navbar"
          data-scrolled={isScrolled ? 'true' : 'false'}
          className={`pointer-events-auto relative mx-auto h-14 w-[92%] max-w-[1320px] rounded-2xl border backdrop-blur-[26px] backdrop-saturate-[155%] md:h-[62px] md:w-[90%] ${
            prefersReducedMotion
              ? ''
              : 'transition-[background-color,border-color,box-shadow] duration-300 ease-out'
          } ${
            isScrolled
              ? 'border-[#eaeaea]/[0.18] bg-[rgba(8,8,10,0.8)] shadow-[inset_0_1px_0_rgba(234,234,234,0.16),inset_0_-1px_0_rgba(0,0,0,0.52),0_22px_50px_rgba(0,0,0,0.62),0_4px_14px_rgba(0,0,0,0.38)]'
              : 'border-[#eaeaea]/[0.14] bg-[rgba(14,14,16,0.56)] shadow-[inset_0_1px_0_rgba(234,234,234,0.14),inset_0_-1px_0_rgba(0,0,0,0.42),0_16px_40px_rgba(0,0,0,0.48),0_3px_12px_rgba(0,0,0,0.3)]'
          }`}
        >
          {/* Smoked Glass Vertical Depth & Diagonal Silver-White Reflections */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(234,234,234,0.065)_0%,rgba(234,234,234,0.012)_42%,rgba(0,0,0,0.18)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(112deg,transparent_12%,rgba(234,234,234,0.055)_28%,transparent_44%,rgba(234,234,234,0.032)_70%,transparent_86%)]" />
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#eaeaea]/30 to-transparent" />
          </div>

          <div className="relative flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center lg:px-8">
            {/* LEFT: AC Monogram with Subtle Metallic Highlight + ANVAR CHORIQULOV */}
            <a
              href="#home"
              onClick={handleLinkClick}
              className={`group flex min-w-0 items-center gap-3 justify-self-start whitespace-nowrap text-[#eaeaea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] ${
                prefersReducedMotion ? '' : 'transition-opacity duration-200'
              }`}
              aria-label={`${ARTIST_PROFILE.name} — ${t.footer.backToTop}`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden="true"
                className={`shrink-0 drop-shadow-[0_1px_4px_rgba(234,234,234,0.12)] ${
                  prefersReducedMotion
                    ? ''
                    : 'transition-transform duration-200 group-hover:scale-105'
                }`}
              >
                <defs>
                  <linearGradient id="ac-metallic-frame" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#eaeaea" stopOpacity="0.92" />
                    <stop offset="50%" stopColor="#a7adb7" stopOpacity="0.62" />
                    <stop offset="100%" stopColor="#eaeaea" stopOpacity="0.88" />
                  </linearGradient>
                </defs>
                <rect
                  x="1"
                  y="1"
                  width="26"
                  height="26"
                  stroke="url(#ac-metallic-frame)"
                  strokeWidth="1"
                />
                <rect
                  x="4.5"
                  y="4.5"
                  width="19"
                  height="19"
                  stroke="#c81018"
                  strokeOpacity="0.9"
                  strokeWidth="0.75"
                />
                <text
                  x="14"
                  y="17.2"
                  textAnchor="middle"
                  fill="#eaeaea"
                  fontSize="9"
                  fontWeight="300"
                  letterSpacing="1.2"
                  fontFamily="Raleway, sans-serif"
                >
                  {ARTIST_PROFILE.monogram}
                </text>
              </svg>
              <span className="truncate font-display text-[11px] font-light uppercase tracking-[0.2em] text-[#eaeaea] sm:text-xs sm:tracking-[0.24em] lg:text-[13px] lg:tracking-[0.28em]">
                {ARTIST_PROFILE.name}
              </span>
            </a>

            {/* CENTER: GALLERY & ABOUT with Minimal Crimson Active Accent & Hover Underline */}
            <nav
              aria-label="Primary navigation"
              onMouseLeave={() => setHoveredHref(null)}
              className="hidden items-center justify-center gap-6 justify-self-center md:flex lg:gap-10"
            >
              {centerLinks.map((item) => {
                const isHovered = hoveredHref === item.href;
                const isActive = activeHref === item.href;
                const showUnderline = isHovered || (!hoveredHref && isActive);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'location' : undefined}
                    onMouseEnter={() => setHoveredHref(item.href)}
                    onFocus={() => setHoveredHref(item.href)}
                    onBlur={() => setHoveredHref(null)}
                    className={`relative shrink-0 whitespace-nowrap py-2 font-display text-[11px] font-normal uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] lg:text-xs lg:tracking-[0.26em] ${
                      isActive
                        ? 'text-[#eaeaea]'
                        : 'text-[#eaeaea]/65 hover:text-[#eaeaea]'
                    } ${prefersReducedMotion ? '' : 'transition-colors duration-200'}`}
                  >
                    <span className="relative z-10">{item.label}</span>

                    {showUnderline && !prefersReducedMotion && (
                      <motion.span
                        layoutId="navbar-editorial-underline"
                        aria-hidden="true"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 34,
                          mass: 0.55,
                        }}
                        className="pointer-events-none absolute right-0 bottom-0.5 left-0 h-px bg-gradient-to-r from-transparent via-[#c81018] to-transparent"
                      />
                    )}
                    {showUnderline && prefersReducedMotion && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 bottom-0.5 left-0 h-px bg-gradient-to-r from-transparent via-[#c81018] to-transparent"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* RIGHT: Language Selector + Compact Dark Charcoal Pill CONTACT CTA (Desktop/Tablet) + Mobile Menu Toggle */}
            <div className="flex items-center justify-end justify-self-end gap-2.5 sm:gap-3">
              <div className="hidden md:inline-block">
                <LanguageSelector variant="desktop" />
              </div>

              <a
                href={contactItem.href}
                data-testid="navbar-pill-cta"
                aria-current={activeHref === contactItem.href ? 'location' : undefined}
                className={`hidden shrink-0 items-center justify-center rounded-full border px-4 py-1.5 font-display text-[11px] font-normal uppercase tracking-[0.24em] shadow-[inset_0_1px_0_rgba(234,234,234,0.12),0_4px_12px_rgba(0,0,0,0.38)] hover:border-[#c81018]/80 hover:bg-[#150c0d]/92 hover:text-white hover:shadow-[inset_0_1px_0_rgba(234,234,234,0.16),0_0_18px_rgba(200,16,24,0.22),0_4px_14px_rgba(0,0,0,0.48)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018] md:inline-flex lg:px-5 lg:py-2 lg:text-xs ${
                  activeHref === contactItem.href
                    ? 'border-[#c81018]/75 bg-[#150c0d]/85 text-[#eaeaea]'
                    : 'border-[#eaeaea]/[0.16] bg-[#0c0c0e]/85 text-[#eaeaea]'
                } ${prefersReducedMotion ? '' : 'transition-all duration-300 ease-out'}`}
              >
                {contactItem.label}
              </a>

              <button
                ref={menuButtonRef}
                type="button"
                data-testid="mobile-menu-trigger"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
                aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
                className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] border border-[#eaeaea]/[0.14] bg-white/[0.04] text-[#eaeaea] shadow-[inset_0_1px_0_rgba(234,234,234,0.12)] hover:border-[#eaeaea]/[0.28] hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018] md:hidden ${
                  prefersReducedMotion ? '' : 'transition-all duration-200'
                }`}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Dark Smoked Glass Full-Screen Mobile Slide-In Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="mobile-nav-backdrop"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-black/75 backdrop-blur-sm md:hidden"
            />

            <motion.div
              key="mobile-nav-panel"
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation drawer"
              data-testid="mobile-menu-panel"
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.46,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed inset-0 z-[60] flex h-[100svh] min-h-[100svh] w-full flex-col justify-between overflow-y-auto bg-[rgba(13,13,15,0.92)] text-white backdrop-blur-[28px] backdrop-saturate-[150%] md:hidden"
            >
              {/* Subtle Smoked Glass Reflection & Ambient Studio Depth */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,16,24,0.08)_0%,transparent_48%),linear-gradient(155deg,rgba(234,234,234,0.045)_0%,transparent_44%)]"
              />

              {/* Top Brand & Close Header */}
              <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#eaeaea]/[0.12] px-5 pt-[env(safe-area-inset-top)] sm:px-8">
                <a
                  href="#home"
                  onClick={handleLinkClick}
                  className="flex min-w-0 items-center gap-3 text-[#eaeaea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018]"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="26"
                      height="26"
                      stroke="#eaeaea"
                      strokeOpacity="0.82"
                      strokeWidth="1"
                    />
                    <rect
                      x="4.5"
                      y="4.5"
                      width="19"
                      height="19"
                      stroke="#c81018"
                      strokeOpacity="0.9"
                      strokeWidth="0.75"
                    />
                    <text
                      x="14"
                      y="17.2"
                      textAnchor="middle"
                      fill="#eaeaea"
                      fontSize="9"
                      fontWeight="300"
                      letterSpacing="1.2"
                      fontFamily="Raleway, sans-serif"
                    >
                      {ARTIST_PROFILE.monogram}
                    </text>
                  </svg>
                  <span className="truncate font-display text-xs font-light uppercase tracking-[0.22em] text-[#eaeaea] sm:text-sm sm:tracking-[0.28em]">
                    {ARTIST_PROFILE.name}
                  </span>
                </a>

                <button
                  ref={closeButtonRef}
                  type="button"
                  data-testid="mobile-menu-close"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    menuButtonRef.current?.focus();
                  }}
                  aria-label={t.nav.closeMenu}
                  className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] border border-[#eaeaea]/[0.16] bg-white/[0.05] text-[#eaeaea] shadow-[inset_0_1px_0_rgba(234,234,234,0.14)] hover:border-[#c81018]/75 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018] ${
                    prefersReducedMotion ? '' : 'transition-all duration-200'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Semantic Mobile Navigation Links: GALLERY, ABOUT & CONTACT */}
              <nav
                aria-label="Mobile navigation"
                className="relative z-10 flex flex-1 flex-col px-6 py-5 sm:px-10 sm:py-8"
              >
                <div className="my-auto">
                  <p className="mb-4 font-display text-[11px] font-light uppercase tracking-[0.38em] text-[#c81018] sm:mb-6">
                    {t.nav.menuTitle} · {t.about.studioLocation}
                  </p>

                  <div className="divide-y divide-[#eaeaea]/[0.11] border-y border-[#eaeaea]/[0.11]">
                    {[...centerLinks, contactItem].map((item, idx) => (
                      <motion.a
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.38,
                          delay: prefersReducedMotion ? 0 : 0.06 + idx * 0.06,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="group flex items-center justify-between py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:py-5"
                      >
                        <div className="flex items-baseline gap-4 sm:gap-5">
                          <span className="font-display text-[11px] font-light tracking-[0.28em] text-[#c81018]/85 transition-colors group-hover:text-[#c81018]">
                            {item.index}
                          </span>
                          <div>
                            <span
                              className={`block font-mauline text-2xl font-normal uppercase tracking-[0.18em] text-[#eaeaea] sm:text-4xl ${
                                prefersReducedMotion
                                  ? ''
                                  : 'transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="mt-1 block font-display text-[11px] font-light tracking-[0.18em] text-neutral-400 transition-colors group-hover:text-neutral-300">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <ArrowUpRight
                          aria-hidden="true"
                          className={`h-5 w-5 shrink-0 text-neutral-500 group-hover:text-[#c81018] ${
                            prefersReducedMotion
                              ? ''
                              : 'transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                          }`}
                        />
                      </motion.a>
                    ))}
                  </div>

                  {/* Mobile Language Selector */}
                  <div className="mt-6 sm:mt-8">
                    <LanguageSelector variant="mobile" />
                  </div>
                </div>
              </nav>

              {/* Editorial Studio Footer */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#eaeaea]/[0.11] px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-10">
                <div>
                  <p className="font-display text-[11px] font-light uppercase tracking-[0.26em] text-neutral-400">
                    {t.about.painterRole} · {t.about.studioLocation}
                  </p>
                  <a
                    href={`mailto:${ARTIST_PROFILE.contactEmail}`}
                    className="mt-1 inline-block text-xs tracking-[0.04em] text-neutral-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018]"
                  >
                    {ARTIST_PROFILE.contactEmail}
                  </a>
                </div>

                {onReplayEntrance && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onReplayEntrance();
                    }}
                    className={`inline-flex min-h-[44px] items-center rounded-full border border-[#eaeaea]/[0.18] bg-[#101012]/80 px-5 py-2.5 font-display text-[11px] font-light uppercase tracking-[0.24em] text-[#eaeaea] hover:border-[#c81018]/75 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018] ${
                      prefersReducedMotion ? '' : 'transition-colors duration-200'
                    }`}
                  >
                    {t.nav.entranceGate}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
