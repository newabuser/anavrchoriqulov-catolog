import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function LanguageSelector({
  variant = 'desktop',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, options, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = options.find((opt) => opt.code === language) ?? options[0];

  if (variant === 'mobile') {
    return (
      <div
        className={`w-full ${className}`}
        role="group"
        aria-label={t.nav.selectLanguage}
      >
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <span className="font-display text-[10px] font-normal uppercase tracking-[0.28em] text-[#C62828]">
            {t.nav.selectLanguage}
          </span>
          <span className="text-[11px] text-[#555555] font-display">
            {currentOption.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          {options.map((opt) => {
            const isActive = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code)}
                aria-pressed={isActive}
                className={`relative flex min-h-[44px] flex-col items-center justify-center rounded-lg px-2 py-1.5 font-display transition-all duration-200 ${
                  isActive
                    ? 'border border-[#C62828] bg-[#C62828] text-white shadow-[0_2px_12px_rgba(198,40,40,0.28)]'
                    : 'border border-transparent bg-transparent text-[#555555] hover:border-[#E5E7EB] hover:bg-[#FFFFFF] hover:text-[#222222]'
                }`}
              >
                <span className="text-xs font-medium tracking-[0.18em]">
                  {opt.shortLabel}
                </span>
                <span className="text-[9px] opacity-80 tracking-wide">
                  {opt.nativeName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
      data-testid="language-selector-desktop"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${t.nav.selectLanguage}: ${currentOption.label}`}
        className={`group inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3 py-1 font-display text-xs font-normal uppercase tracking-[0.2em] shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62828] ${
          isOpen
            ? 'border-[#C62828] bg-[#FFFFFF] text-[#222222] shadow-[0_0_14px_rgba(198,40,40,0.15)]'
            : 'border-[#E5E7EB] bg-[#F8F9FA] text-[#222222] hover:border-[#D1D5DB] hover:bg-[#FFFFFF] hover:text-[#111111]'
        }`}
      >
        <Globe
          className={`h-3.5 w-3.5 transition-colors ${
            isOpen ? 'text-[#C62828]' : 'text-[#6B7280] group-hover:text-[#222222]'
          }`}
          aria-hidden="true"
        />
        <span className="text-[11px] tracking-[0.18em]">{currentOption.shortLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-[#6B7280] transition-transform duration-200 group-hover:text-[#222222] ${
            isOpen ? 'rotate-180 text-[#222222]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-label={t.nav.selectLanguage}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-44 origin-top-right overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl z-50"
          >
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isActive = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setLanguage(opt.code);
                      setIsOpen(false);
                    }}
                    className={`flex min-h-[38px] w-full items-center justify-between rounded-lg px-3 py-2 text-left font-display transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#C62828] ${
                      isActive
                        ? 'bg-[#C62828]/10 text-[#C62828] font-medium'
                        : 'text-[#374151] hover:bg-[#F8F9FA] hover:text-[#111111]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-[#C62828] shadow-[0_0_6px_#C62828]' : 'bg-[#D1D5DB]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs tracking-[0.06em]">
                        {opt.nativeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-light uppercase tracking-[0.16em] text-[#6B7280]">
                        {opt.shortLabel}
                      </span>
                      {isActive && (
                        <Check className="h-3.5 w-3.5 text-[#C62828]" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
