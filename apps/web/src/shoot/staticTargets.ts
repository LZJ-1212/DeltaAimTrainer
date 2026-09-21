export const STATIC_TARGETS = [
  { id: "left", position: [-2.4, 1.95, -8] as const },
  { id: "center", position: [0, 1.95, -8] as const },
  { id: "right", position: [2.4, 1.95, -8] as const },
] as const;

export const STATIC_TARGET_IDS = ["left", "center", "right"] as const;

export const TARGET_USER_DATA: Record<
  (typeof STATIC_TARGET_IDS)[number],
  { targetId: string }
> = {
  left: { targetId: "left" },
  center: { targetId: "center" },
  right: { targetId: "right" },
};
