export interface ChladniRuntimeConfig {
  isConstrained: boolean;
  particleCount: number;
  maxDpr: number;
  maxFps: number | null;
  warmupSteps: number;
}

export interface LapisRuntimeConfig {
  isMobile: boolean;
  maxPixels: number;
  maxDpr: number;
  initialQuality: number;
  minQuality: number;
  singleSample: boolean;
}

export interface QualityGovernorState {
  avgDt: number;
  quality: number;
  cooldown: number;
  calm: number;
  slowAtMinSeconds: number;
  shouldFallback: boolean;
}

export const CHLADNI_DESKTOP_PARTICLES = 12000;
export const CHLADNI_MOBILE_PARTICLES = 3500;
export const CHLADNI_DESKTOP_WARMUP_STEPS = 90;
export const CHLADNI_MOBILE_WARMUP_STEPS = 40;
export const CHLADNI_WARMUP_DT = 1 / 30;
export const MOBILE_BREAKPOINT_PX = 768;

export const LAPIS_DESKTOP_MAX_PIXELS = 2_000_000;
export const LAPIS_MOBILE_MAX_PIXELS = 500_000;
export const LAPIS_MIN_QUALITY = 0.35;
export const LAPIS_MOBILE_INITIAL_QUALITY = 0.6;
export const LAPIS_SLOW_DT = 1 / 48;
export const LAPIS_FAST_DT = 1 / 56;
export const LAPIS_FALLBACK_FRAME_DT = 0.05; // 50ms
export const LAPIS_FALLBACK_DURATION_SEC = 2.0;

export function isConstrainedChladniDevice(
  viewportWidth: number,
  hardwareConcurrency?: number
): boolean {
  const narrowViewport = viewportWidth > 0 && viewportWidth < MOBILE_BREAKPOINT_PX;
  const lowCores =
    typeof hardwareConcurrency === 'number' &&
    Number.isFinite(hardwareConcurrency) &&
    hardwareConcurrency > 0 &&
    hardwareConcurrency <= 4;
  return narrowViewport || lowCores;
}

export function getChladniRuntimeConfig({
  viewportWidth,
  hardwareConcurrency,
}: {
  viewportWidth: number;
  hardwareConcurrency?: number;
}): ChladniRuntimeConfig {
  const isConstrained = isConstrainedChladniDevice(viewportWidth, hardwareConcurrency);
  const isNarrow = viewportWidth > 0 && viewportWidth < MOBILE_BREAKPOINT_PX;
  return {
    isConstrained,
    particleCount: isConstrained ? CHLADNI_MOBILE_PARTICLES : CHLADNI_DESKTOP_PARTICLES,
    maxDpr: isConstrained ? 1.5 : 2,
    maxFps: isConstrained ? 30 : null,
    warmupSteps: isNarrow ? CHLADNI_MOBILE_WARMUP_STEPS : CHLADNI_DESKTOP_WARMUP_STEPS,
  };
}

export function getLapisRuntimeConfig({
  viewportWidth,
}: {
  viewportWidth: number;
}): LapisRuntimeConfig {
  const isMobile = viewportWidth > 0 && viewportWidth < MOBILE_BREAKPOINT_PX;
  return {
    isMobile,
    maxPixels: isMobile ? LAPIS_MOBILE_MAX_PIXELS : LAPIS_DESKTOP_MAX_PIXELS,
    maxDpr: isMobile ? 1 : 2,
    initialQuality: isMobile ? LAPIS_MOBILE_INITIAL_QUALITY : 1,
    minQuality: LAPIS_MIN_QUALITY,
    singleSample: isMobile,
  };
}

export function stepQualityGovernor(
  state: QualityGovernorState,
  rawDt: number,
  minQuality: number = LAPIS_MIN_QUALITY
): { state: QualityGovernorState; resized: boolean } {
  const dt = Math.max(0, Math.min(rawDt, 0.25));
  const avgDt = state.avgDt + (dt - state.avgDt) * 0.25;
  let quality = state.quality;
  let cooldown = state.cooldown - dt;
  let calm = state.calm;
  let resized = false;

  if (cooldown <= 0) {
    if (avgDt > LAPIS_SLOW_DT && quality > minQuality) {
      quality = Math.max(minQuality, quality * 0.75);
      cooldown = 0.35;
      calm = 0;
      resized = true;
    } else if (avgDt < LAPIS_FAST_DT && quality < 1) {
      calm += dt;
      if (calm > 3) {
        quality = Math.min(1, quality * 1.15);
        cooldown = 0.75;
        calm = 0;
        resized = true;
      }
    } else {
      calm = 0;
    }
  }

  let slowAtMinSeconds = state.slowAtMinSeconds;
  if (quality <= minQuality + 1e-4 && avgDt > LAPIS_FALLBACK_FRAME_DT) {
    slowAtMinSeconds += dt;
  } else {
    slowAtMinSeconds = 0;
  }

  const shouldFallback = state.shouldFallback || slowAtMinSeconds >= LAPIS_FALLBACK_DURATION_SEC;

  return {
    state: {
      avgDt,
      quality,
      cooldown,
      calm,
      slowAtMinSeconds,
      shouldFallback,
    },
    resized,
  };
}

export type HeavyAnimationId = 'chladni' | 'lapis';

interface CoordinatorState {
  chladniWanted: boolean;
  lapisWanted: boolean;
}

const coordinatorState: CoordinatorState = {
  chladniWanted: false,
  lapisWanted: false,
};

const coordinatorListeners = new Set<() => void>();

export function getActiveHeavyAnimation(): HeavyAnimationId | null {
  if (coordinatorState.lapisWanted) return 'lapis';
  if (coordinatorState.chladniWanted) return 'chladni';
  return null;
}

export function setHeavyAnimationWanted(id: HeavyAnimationId, wanted: boolean): void {
  const prev = getActiveHeavyAnimation();
  if (id === 'chladni') {
    coordinatorState.chladniWanted = wanted;
  } else {
    coordinatorState.lapisWanted = wanted;
  }
  const next = getActiveHeavyAnimation();
  if (prev !== next) {
    coordinatorListeners.forEach((listener) => listener());
  }
}

export function subscribeHeavyAnimationCoordinator(listener: () => void): () => void {
  coordinatorListeners.add(listener);
  return () => {
    coordinatorListeners.delete(listener);
  };
}
