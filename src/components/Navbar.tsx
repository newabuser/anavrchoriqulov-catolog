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
  ];

  const contactItem = {
    index: '02',
    label: t.nav.contact,
    subtitle: t.nav.contactSubtitle,
    href: '#contact',
  };

  useEffect(() => {
    const sectionIds = ['gallery', 'contact'] as const;

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
      {/* Floating Sticky Architectural Frame (88-92% width) */}
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
              ? 'border-[#E5E7EB] bg-[rgba(255,255,255,0.92)] shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
              : 'border-[#E5E7EB] bg-[rgba(255,255,255,0.8)] shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className="relative flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center lg:px-8">
            {/* LEFT: AC Monogram + ANVAR CHORIQULOV */}
            <a
              href="#home"
              onClick={handleLinkClick}
              className={`group flex min-w-0 items-center gap-3 justify-self-start whitespace-nowrap text-[#222222] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C62828] ${
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
                className={`shrink-0 ${
                  prefersReducedMotion
                    ? ''
                    : 'transition-transform duration-200 group-hover:scale-105'
                }`}
              >
                <rect
                  x="1"
                  y="1"
                  width="26"
                  height="26"
                  stroke="#222222"
                  strokeWidth="1"
                />
                <rect
                  x="4.5"
                  y="4.5"
                  width="19"
                  height="19"
                  stroke="#C62828"
                  strokeWidth="0.75"
                />
                <text
                  x="14"
                  y="17.2"
                  textAnchor="middle"
                  fill="#222222"
                  fontSize="9"
                  fontWeight="500"
                  letterSpacing="1.2"
                  fontFamily="Raleway, sans-serif"
                >
                  {ARTIST_PROFILE.monogram}
                </text>
              </svg>
              <span className="truncate font-display text-[11px] font-medium uppercase tracking-[0.2em] text-[#222222] sm:text-xs sm:tracking-[0.24em] lg:text-[13px] lg:tracking-[0.28em]">
                {ARTIST_PROFILE.name}
              </span>
            </a>

            {/* CENTER: GALLERY & ABOUT */}
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
                    className={`relative shrink-0 whitespace-nowrap py-2 font-display text-[11px] font-normal uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C62828] lg:text-xs lg:tracking-[0.26em] ${
                      isActive
                        ? 'text-[#222222] font-medium'
                        : 'text-[#555555] hover:text-[#222222]'
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
                        className="pointer-events-none absolute right-0 bottom-0.5 left-0 h-px bg-[#C62828]"
                      />
                    )}
                    {showUnderline && prefersReducedMotion && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-0 bottom-0.5 left-0 h-px bg-[#C62828]"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* RIGHT: Language Selector + Pill CONTACT CTA + Mobile Menu Toggle */}
            <div className="flex items-center justify-end justify-self-end gap-2.5 sm:gap-3">
              <div className="hidden md:inline-block">
                <LanguageSelector variant="desktop" />
              </div>

              <a
                href={contactItem.href}
                data-testid="navbar-pill-cta"
                aria-current={activeHref === contactItem.href ? 'location' : undefined}
                className={`hidden shrink-0 items-center justify-center rounded-full border px-4 py-1.5 font-display text-[11px] font-normal uppercase tracking-[0.24em] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#C62828] hover:bg-[#C62828] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] md:inline-flex lg:px-5 lg:py-2 lg:text-xs ${
                  activeHref === contactItem.href
                    ? 'border-[#C62828] bg-[#C62828] text-white'
                    : 'border-[#E5E7EB] bg-[#F8F9FA] text-[#222222]'
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
                className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F8F9FA] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#F1F2F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] md:hidden ${
                  prefersReducedMotion ? '' : 'transition-all duration-200'
                }`}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Slide-In Navigation */}
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
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm md:hidden"
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
              className="fixed inset-0 z-[60] flex h-[100svh] min-h-[100svh] w-full flex-col justify-between overflow-y-auto bg-[rgba(255,255,255,0.98)] text-[#222222] backdrop-blur-[28px] md:hidden"
            >
              <div className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] px-5 pt-[env(safe-area-inset-top)] sm:px-8">
                <a
                  href="#home"
                  onClick={handleLinkClick}
                  className="flex min-w-0 items-center gap-3 text-[#222222] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C62828]"
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
                      stroke="#222222"
                      strokeWidth="1"
                    />
                    <rect
                      x="4.5"
                      y="4.5"
                      width="19"
                      height="19"
                      stroke="#C62828"
                      strokeWidth="0.75"
                    />
                    <text
                      x="14"
                      y="17.2"
                      textAnchor="middle"
                      fill="#222222"
                      fontSize="9"
                      fontWeight="500"
                      letterSpacing="1.2"
                      fontFamily="Raleway, sans-serif"
                    >
                      {ARTIST_PROFILE.monogram}
                    </text>
                  </svg>
                  <span className="truncate font-display text-xs font-medium uppercase tracking-[0.22em] text-[#222222] sm:text-sm sm:tracking-[0.28em]">
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
                  className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F8F9FA] text-[#222222] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#F1F2F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] ${
                    prefersReducedMotion ? '' : 'transition-all duration-200'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav
                aria-label="Mobile navigation"
                className="relative z-10 flex flex-1 flex-col px-6 py-5 sm:px-10 sm:py-8"
              >
                <div className="my-auto">
                  <p className="mb-4 font-display text-[11px] font-normal uppercase tracking-[0.38em] text-[#C62828] sm:mb-6">
                    {t.nav.menuTitle} · {t.about.studioLocation}
                  </p>

                  <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
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
                        className="group flex items-center justify-between py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C62828] sm:py-5"
                      >
                        <div className="flex items-baseline gap-4 sm:gap-5">
                          <span className="font-display text-[11px] font-medium tracking-[0.28em] text-[#C62828]">
                            {item.index}
                          </span>
                          <div>
                            <span
                              className={`block font-mauline text-2xl font-normal uppercase tracking-[0.18em] text-[#222222] sm:text-4xl ${
                                prefersReducedMotion
                                  ? ''
                                  : 'transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-[#C62828]'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="mt-1 block font-display text-[11px] font-light tracking-[0.18em] text-[#555555]">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        <ArrowUpRight
                          aria-hidden="true"
                          className={`h-5 w-5 shrink-0 text-[#6B7280] group-hover:text-[#C62828] ${
                            prefersReducedMotion
                              ? ''
                              : 'transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                          }`}
                        />
                      </motion.a>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-8">
                    <LanguageSelector variant="mobile" />
                  </div>
                </div>
              </nav>

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-10 bg-[#F8F9FA]">
                <div>
                  <p className="font-display text-[11px] font-light uppercase tracking-[0.26em] text-[#555555]">
                    {t.about.painterRole} · {t.about.studioLocation}
                  </p>
                  <a
                    href={`mailto:${ARTIST_PROFILE.contactEmail}`}
                    className="mt-1 inline-block text-xs tracking-[0.04em] text-[#222222] font-medium transition-colors hover:text-[#C62828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828]"
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
                    className={`inline-flex min-h-[44px] items-center rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-5 py-2.5 font-display text-[11px] font-medium uppercase tracking-[0.24em] text-[#222222] hover:border-[#C62828] hover:text-[#C62828] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] ${
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
