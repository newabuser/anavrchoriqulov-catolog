import { useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

export function CinematicBackdrop() {
  const prefersReducedMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);

  const rawX = useMotionValue(-999);
  const rawY = useMotionValue(-999);

  const springX = useSpring(rawX, { stiffness: 55, damping: 26, mass: 0.9 });
  const springY = useSpring(rawY, { stiffness: 55, damping: 26, mass: 0.9 });

  const cursorSpotlight = useMotionTemplate`radial-gradient(640px circle at ${springX}px ${springY}px, rgba(234, 234, 234, 0.055) 0%, rgba(139, 0, 0, 0.095) 34%, rgba(5, 5, 5, 0) 72%)`;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setIsFinePointer(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!isFinePointer || prefersReducedMotion) {
      return;
    }

    rawX.set(window.innerWidth * 0.5);
    rawY.set(window.innerHeight * 0.32);

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      rawX.set(event.clientX);
      rawY.set(event.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isFinePointer, prefersReducedMotion, rawX, rawY]);

  return (
    <div
      aria-hidden="true"
      data-testid="cinematic-backdrop"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]"
    >
      {/* Consolidated Obsidian/Charcoal Gallery Stage, Overhead Diffusion & Crimson Washes */}
      <div className="cinematic-gallery-stage" />

      {/* Desktop Mouse-Responsive Soft Gallery Spotlight */}
      {isFinePointer && !prefersReducedMotion && (
        <motion.div
          data-testid="cursor-light-field"
          style={{ background: cursorSpotlight }}
          className="absolute inset-0 will-change-[background]"
        />
      )}

      {/* Tactile Oil-Canvas & Brushstroke Surface Texture */}
      <div className="painterly-canvas-texture" />
    </div>
  );
}
