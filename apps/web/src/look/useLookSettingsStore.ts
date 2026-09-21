import {
  DEFAULT_LOOK_SETTINGS,
  resolveLookSettings,
  type LookSettings,
} from "@delta-aim/aim-math";
import { create } from "zustand";
import type { OpticId } from "./ownerLook";

type LookSettingsStore = LookSettings & {
  optic: OpticId;
  applySettings: (input: LookSettings) => void;
  setOptic: (optic: OpticId) => void;
  reset: () => void;
};

const initialLookSettings = (): LookSettings & { optic: OpticId } => ({
  ...DEFAULT_LOOK_SETTINGS,
  optic: "redDot",
});

export const useLookSettingsStore = create<LookSettingsStore>()((set) => ({
  ...initialLookSettings(),
  applySettings: (input) => set(resolveLookSettings(input)),
  setOptic: (optic) => set({ optic }),
  reset: () => set(initialLookSettings()),
}));
