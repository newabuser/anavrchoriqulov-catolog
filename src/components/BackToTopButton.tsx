import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { shouldShowBackToTop } from '../utils/galleryLogic';
import { useLanguage } from '../context/LanguageContext';

interface BackToTopButtonProps {
  isEntered: boolean;
  isLightboxOpen: boolean;
}

const SCROLL_THRESHOLD_PX = 320;

export function BackToTopButton({
  isEntered,
  isLightboxOpen,
}: BackToTopButtonProps) {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const updateScroll = () => {
      setScrollY(window.scrollY);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  const isVisible = shouldShowBackToTop(
    isEntered,
    isLightboxOpen,
    scrollY,
    SCROLL_THRESHOLD_PX
  );

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="floating-back-to-top"
          type="button"
          data-testid="floating-back-to-top"
          aria-label={t.footer.backToTop}
          title={t.footer.backToTop}
          onClick={handleScrollToTop}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
          }
          className="group fixed right-5 bottom-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#eaeaea]/18 bg-[#08080a]/70 text-[#eaeaea]/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_12px_32px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(234,234,234,0.14)] transition-colors duration-200 hover:border-[#c81018]/80 hover:bg-[#140e0f]/88 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c81018] sm:right-8 sm:bottom-8"
        >
          <ArrowUp
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
