export type PointerGate = {
  ignoreNext: boolean;
};

export function consumePointerDelta(
  gate: PointerGate,
  movementX: number,
  movementY: number,
  viewportWidth: number,
  viewportHeight: number,
): { movementX: number; movementY: number } | null {
  if (gate.ignoreNext) {
    gate.ignoreNext = false;
    return null;
  }
  if (!Number.isFinite(movementX) || !Number.isFinite(movementY)) {
    return null;
  }
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return null;
  }
  const isWrapSpike =
    Math.abs(movementX) >= viewportWidth * 0.85 ||
    Math.abs(movementY) >= viewportHeight * 0.85;
  const isRawSpike = Math.abs(movementX) >= 2500 || Math.abs(movementY) >= 2500;
  if (isWrapSpike || isRawSpike) {
    return null;
  }
  return { movementX, movementY };
}
