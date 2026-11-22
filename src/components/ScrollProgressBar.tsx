import { useEffect, useRef } from 'react';
import { computeScrollProgress } from '../utils/galleryLogic';

interface ScrollProgressBarProps {
  visible: boolean;
  layoutKey?: string;
}

export function ScrollProgressBar({ visible, layoutKey }: ScrollProgressBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const applyProgress = (value: number) => {
    if (barRef.current) barRef.current.style.transform = `scaleX(${value})`;
    rootRef.current?.setAttribute('data-progress', value.toFixed(3));
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const next = computeScrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      applyProgress(next);
    };

    const scheduleUpdate = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(scheduleUpdate)
        : null;
    resizeObserver?.observe(document.documentElement);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [visible, layoutKey]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-testid="scroll-progress-bar"
      data-progress="0.000"
      className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[2px] bg-[var(--border)]/35"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-[#c81018] will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
