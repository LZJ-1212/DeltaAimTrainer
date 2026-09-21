import { useEffect } from "react";
import { useTrainingStore } from "../shoot/useTrainingStore";

export function Crosshair() {
  const lastShot = useTrainingStore((state) => state.lastShot);
  const shotsHit = useTrainingStore((state) => state.shotsHit);

  useEffect(() => {
    if (lastShot !== "hit") {
      return;
    }
    const timer = window.setTimeout(() => {
      useTrainingStore.getState().clearLastShot();
    }, 140);
    return () => {
      window.clearTimeout(timer);
    };
  }, [lastShot, shotsHit]);

  return (
    <div
      className={lastShot === "hit" ? "crosshair is-hit" : "crosshair"}
      aria-hidden
    >
      <span className="crosshair-flash" />
      <span className="crosshair-arm crosshair-arm-h" />
      <span className="crosshair-arm crosshair-arm-v" />
      <span className="crosshair-dot" />
    </div>
  );
}
