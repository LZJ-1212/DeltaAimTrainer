import { create } from "zustand";
import {
  advanceRound,
  applyDrillShot,
  createIdleRound,
  startRound,
  type DrillMode,
  type DrillRound,
  type TrackingSample,
} from "./drillRound";
import type { ShotResult } from "./resolveShot";

type TrainingStore = DrillRound & {
  roundSerial: number;
  start: (mode: DrillMode) => void;
  tick: (deltaMs: number, sample?: TrackingSample) => void;
  fire: (result: ShotResult) => void;
  clearLastShot: () => void;
};

export const useTrainingStore = create<TrainingStore>()((set) => ({
  ...createIdleRound("flicking"),
  roundSerial: 0,
  start: (mode) =>
    set((state) => ({
      ...startRound(mode),
      roundSerial: state.roundSerial + 1,
    })),
  tick: (deltaMs, sample) =>
    set((state) => advanceRound(state, deltaMs, sample)),
  fire: (result) => set((state) => applyDrillShot(state, result)),
  clearLastShot: () => set({ lastShot: null }),
}));
