import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const INTERACTIVE_SELECTOR =
  'a[href], button:not(:disabled), [role="button"], input, textarea, select, label[for], [data-cursor="interactive"]';

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(INTERACTIVE_SELECTOR) !== null;
}

export function CustomCursor() {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const springConfig = { stiffness: 760, damping: 44, mass: 0.16 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncPointerCapability = () => {
      setIsFinePointer(mediaQuery.matches);
    };

    syncPointerCapability();
    mediaQuery.addEventListener('change', syncPointerCapability);
    return () => mediaQuery.removeEventListener('change', syncPointerCapability);
  }, []);

  useEffect(() => {
    if (!isFinePointer) {
      document.documentElement.classList.remove('custom-cursor-active');
      setIsVisible(false);
      return;
    }

    document.documentElement.classList.add('custom-cursor-active');

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        setIsVisible(false);
        return;
      }

      rawX.set(event.clientX);
      rawY.set(event.clientY);
      setIsVisible(true);
      setIsInteractive(isInteractiveTarget(event.target));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsInteractive(false);
      setIsPressed(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [isFinePointer, rawX, rawY]);

  if (!isFinePointer) {
    return null;
  }

  const targetScale = isPressed
    ? isInteractive
      ? 1.75
      : 0.8
    : isInteractive
      ? 2.25
      : 1;

  return (
    <motion.div
      aria-hidden="true"
      data-testid="custom-cursor"
      data-interactive={isInteractive ? 'true' : 'false'}
      data-visible={isVisible ? 'true' : 'false'}
      style={{
        x: prefersReducedMotion ? rawX : smoothX,
        y: prefersReducedMotion ? rawY : smoothY,
      }}
      className="pointer-events-none fixed top-0 left-0 z-[80] -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <motion.span
        animate={{
          opacity: isVisible ? (isInteractive ? 0.88 : 0.42) : 0,
          scale: targetScale,
          backgroundColor: isInteractive
            ? 'rgba(200, 16, 24, 0.16)'
            : 'rgba(234, 234, 234, 0.34)',
          borderColor: isInteractive
            ? 'rgba(200, 16, 24, 0.82)'
            : 'rgba(234, 234, 234, 0.48)',
        }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 420,
                damping: 30,
                mass: 0.25,
              }
        }
        className="block h-3.5 w-3.5 rounded-full border shadow-[0_0_14px_rgba(255,255,255,0.12)] backdrop-blur-[1px]"
      />
    </motion.div>
  );
}
