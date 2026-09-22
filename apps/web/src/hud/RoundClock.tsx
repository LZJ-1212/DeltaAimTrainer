import { useEffect } from "react";
import { drainTrackingSample } from "../shoot/trackingSample";
import { useTrainingStore } from "../shoot/useTrainingStore";

type RoundClockProps = {
  isLocked: boolean;
};

export function RoundClock({ isLocked }: RoundClockProps) {
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      const sample = drainTrackingSample();
      const training = useTrainingStore.getState();
      if (!isLocked || training.phase !== "running") {
        return;
      }
      training.tick(delta, sample.windowMs > 0 ? sample : undefined);
    }, 200);
    return () => {
      window.clearInterval(id);
    };
  }, [isLocked]);

  return null;
}
