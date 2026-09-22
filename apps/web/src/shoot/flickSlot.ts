export const FLICK_SLOTS = [
  { x: -2.6, z: -8 },
  { x: 2.2, z: -7.2 },
  { x: 0, z: -9 },
  { x: -1.4, z: -6.6 },
  { x: 2.8, z: -8.5 },
] as const;

export function flickSlot(spawnIndex: number): { x: number; z: number } {
  if (!Number.isInteger(spawnIndex) || spawnIndex < 0) {
    throw new Error("spawnIndex");
  }

  const slot = FLICK_SLOTS[spawnIndex % FLICK_SLOTS.length];
  if (slot === undefined) {
    throw new Error("spawnIndex");
  }
  return { x: slot.x, z: slot.z };
}
