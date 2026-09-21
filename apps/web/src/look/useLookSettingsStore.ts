import {
  DEFAULT_LOOK_SETTINGS,
  resolveLookSettings,
  type LookSettings,
} from "@delta-aim/aim-math";
import { create } from "zustand";
import type { OpticId } from "./ownerLook";

type LookSettingsStore = LookSettings & {
  optic: OpticId;
  facingResetId: number;
  applySettings: (input: LookSettings) => void;
  setOptic: (optic: OpticId) => void;
  resetFacing: () => void;
  reset: () => void;
};

const initialLookSettings = (): LookSettings & {
  optic: OpticId;
  facingResetId: number;
} => ({
  ...DEFAULT_LOOK_SETTINGS,
  optic: "redDot",
  facingResetId: 0,
});

export const useLookSettingsStore = create<LookSettingsStore>()((set) => ({
  ...initialLookSettings(),
  applySettings: (input) => set(resolveLookSettings(input)),
  setOptic: (optic) => set({ optic }),
  resetFacing: () =>
    set((state) => ({ facingResetId: state.facingResetId + 1 })),
  reset: () => set(initialLookSettings()),
}));
