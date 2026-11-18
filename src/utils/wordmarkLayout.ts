export interface WordmarkMeasurements {
  firstLeft: number;
  firstWidth: number;
  nLeft: number;
  lastWidth: number;
  fontSizePx: number;
}

export interface WordmarkOffsets {
  leftPx: number;
  topPx: number;
}

/**
 * Computes pixel-precise placement for "Choriqulov" relative to "Anvar".
 * Anchors the horizontal origin to the vertical axis of lowercase 'n',
 * clamps within the outer width of "Anvar" to avoid overflow, and positions
 * the surname tightly above the x-height line of "nvar" with a minimal gap.
 */
export function computeWordmarkOffsets(
  m: WordmarkMeasurements,
  options: {
    opticalShiftEm?: number;
    verticalAnchorRatio?: number;
  } = {}
): WordmarkOffsets {
  const { opticalShiftEm = -0.008, verticalAnchorRatio = -0.012 } = options;

  if (m.firstWidth <= 0 || m.fontSizePx <= 0) {
    return { leftPx: 0, topPx: 0 };
  }

  const rawLeft = m.nLeft - m.firstLeft + opticalShiftEm * m.fontSizePx;
  const maxSafeLeft = Math.max(0, m.firstWidth - m.lastWidth);
  const clampedLeft = Math.min(Math.max(0, rawLeft), maxSafeLeft > 0 ? maxSafeLeft : rawLeft);

  const topPx = verticalAnchorRatio * m.fontSizePx;

  return {
    leftPx: Math.round(clampedLeft * 10) / 10,
    topPx: Math.round(topPx * 10) / 10,
  };
}
