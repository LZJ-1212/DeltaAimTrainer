import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { HistoryPanel } from "./history/HistoryPanel";
import { usePersistSettledRound } from "./history/usePersistSettledRound";
import { Crosshair } from "./hud/Crosshair";
import { LockOverlay } from "./hud/LockOverlay";
import { RangeHud } from "./hud/RangeHud";
import { RoundClock } from "./hud/RoundClock";
import { RoundReport } from "./hud/RoundReport";
import { StageChrome } from "./hud/StageChrome";
import { LookController } from "./look/LookController";
import { useLookSettingsStore } from "./look/useLookSettingsStore";
import { RANGE_PALETTE } from "./scene/rangePalette";
import { TrainingRange } from "./scene/TrainingRange";
import { ShootingController } from "./shoot/ShootingController";
import { useTrainingStore } from "./shoot/useTrainingStore";

const CANVAS_CAMERA = {
  fov: 65.455,
  near: 0.1,
  far: 80,
  position: [0, 1.6, 0] as const,
};

export function App() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [historyRevision, setHistoryRevision] = useState(0);
  const phase = useTrainingStore((state) => state.phase);
  const reloadHistory = useCallback(() => {
    setHistoryRevision((revision) => revision + 1);
  }, []);
  const saveError = usePersistSettledRound(reloadHistory);

  const enterLock = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    try {
      void stage.requestPointerLock({ unadjustedMovement: true });
    } catch {
      void stage.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    const onLockChange = (): void => {
      const locked = document.pointerLockElement === stageRef.current;
      setIsLocked(locked);
      if (!locked) {
        return;
      }
      const training = useTrainingStore.getState();
      if (training.phase === "idle") {
        training.start(training.mode);
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (event.key === "1") {
        useLookSettingsStore.getState().setOptic("redDot");
      }
      if (event.key === "2") {
        useLookSettingsStore.getState().setOptic("scope2x");
      }
      if (event.key === "r" || event.key === "R") {
        const training = useTrainingStore.getState();
        if (training.phase === "settled") {
          training.start(training.mode);
        }
      }
    };
    document.addEventListener("pointerlockchange", onLockChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="app-shell">
      <div className="stage" ref={stageRef}>
        <Canvas
          dpr={1}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
          camera={CANVAS_CAMERA}
          onCreated={({ gl }) => {
            gl.setClearColor(RANGE_PALETTE.clear);
          }}
        >
          <LookController isLocked={isLocked} />
          <ShootingController isLocked={isLocked} />
          <TrainingRange isLocked={isLocked} />
        </Canvas>
        <RoundClock isLocked={isLocked} />
        <StageChrome />
        <Crosshair />
        <RoundReport
          onRestart={() => {
            const training = useTrainingStore.getState();
            training.start(training.mode);
            enterLock();
          }}
        />
        {isLocked ? null : (
          <HistoryPanel revision={historyRevision} saveError={saveError} />
        )}
        <LockOverlay visible={!isLocked && phase !== "settled"} onEnter={enterLock} />
      </div>
      <RangeHud isLocked={isLocked} />
    </div>
  );
}
