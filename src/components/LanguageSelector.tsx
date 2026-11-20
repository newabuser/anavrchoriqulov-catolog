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

  // Close dropdown on outside click or escape key (for desktop)
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
          <span className="font-display text-[10px] font-normal uppercase tracking-[0.28em] text-[#c81018]">
            {t.nav.selectLanguage}
          </span>
          <span className="text-[11px] text-neutral-400 font-display">
            {currentOption.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#eaeaea]/[0.14] bg-[#0c0c0e]/90 p-1.5 shadow-[inset_0_1px_0_rgba(234,234,234,0.1),0_4px_16px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
                    ? 'border border-[#c81018]/80 bg-[#c81018] text-white shadow-[0_2px_12px_rgba(200,16,24,0.38)]'
                    : 'border border-transparent bg-transparent text-neutral-300 hover:border-[#eaeaea]/20 hover:bg-white/[0.04] hover:text-[#eaeaea]'
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
        className={`group inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3 py-1 font-display text-xs font-normal uppercase tracking-[0.2em] shadow-[inset_0_1px_0_rgba(234,234,234,0.12),0_2px_8px_rgba(0,0,0,0.32)] backdrop-blur-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c81018] ${
          isOpen
            ? 'border-[#c81018]/80 bg-[#160c0d]/90 text-white shadow-[0_0_14px_rgba(200,16,24,0.24)]'
            : 'border-[#eaeaea]/[0.16] bg-[#0c0c0e]/80 text-[#eaeaea] hover:border-[#eaeaea]/[0.32] hover:bg-white/[0.05] hover:text-white'
        }`}
      >
        <Globe
          className={`h-3.5 w-3.5 transition-colors ${
            isOpen ? 'text-[#c81018]' : 'text-neutral-400 group-hover:text-neutral-200'
          }`}
          aria-hidden="true"
        />
        <span className="text-[11px] tracking-[0.18em]">{currentOption.shortLabel}</span>
        <ChevronDown
          className={`h-3 w-3 text-neutral-400 transition-transform duration-200 group-hover:text-neutral-200 ${
            isOpen ? 'rotate-180 text-white' : ''
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
            className="absolute right-0 top-full mt-2 w-44 origin-top-right overflow-hidden rounded-xl border border-[#eaeaea]/[0.18] bg-[#0a0a0d]/[0.98] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.88),inset_0_1px_0_rgba(234,234,234,0.16)] backdrop-blur-2xl z-50"
          >
            {/* Subtle silver reflection line */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#eaeaea]/25 to-transparent"
            />

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
                    className={`flex min-h-[38px] w-full items-center justify-between rounded-lg px-3 py-2 text-left font-display transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#c81018] ${
                      isActive
                        ? 'bg-[#c81018]/15 text-white font-medium'
                        : 'text-neutral-300 hover:bg-white/[0.06] hover:text-[#eaeaea]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-[#c81018] shadow-[0_0_6px_#c81018]' : 'bg-neutral-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs tracking-[0.06em]">
                        {opt.nativeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-light uppercase tracking-[0.16em] text-neutral-400">
                        {opt.shortLabel}
                      </span>
                      {isActive && (
                        <Check className="h-3.5 w-3.5 text-[#c81018]" aria-hidden="true" />
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
