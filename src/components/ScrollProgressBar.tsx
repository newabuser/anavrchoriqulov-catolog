import { useEffect, useState } from 'react';
import { computeScrollProgress } from '../utils/galleryLogic';

interface ScrollProgressBarProps {
  visible: boolean;
  layoutKey?: string;
}

export function ScrollProgressBar({ visible, layoutKey }: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
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
      setProgress(next);
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
      aria-hidden="true"
      data-testid="scroll-progress-bar"
      data-progress={progress.toFixed(3)}
      className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[2px] bg-white/5"
    >
      <div
        className="h-full w-full origin-left bg-[#c81018] transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
