import { create } from "zustand";
import { applyShot, createInitialTraining, type TrainingSnapshot } from "./applyShot";
import type { ShotResult } from "./resolveShot";
import { STATIC_TARGET_IDS } from "./staticTargets";

type TrainingStore = TrainingSnapshot & {
  fire: (result: ShotResult) => void;
  reset: () => void;
  clearLastShot: () => void;
};

const initialTraining = (): TrainingSnapshot =>
  createInitialTraining(STATIC_TARGET_IDS);

export const useTrainingStore = create<TrainingStore>()((set) => ({
  ...initialTraining(),
  fire: (result) =>
    set((state) =>
      applyShot(
        {
          score: state.score,
          shotsFired: state.shotsFired,
          shotsHit: state.shotsHit,
          remainingTargetIds: state.remainingTargetIds,
          lastShot: state.lastShot,
        },
        result,
      ),
    ),
  reset: () => set(initialTraining()),
  clearLastShot: () => set({ lastShot: null }),
}));
