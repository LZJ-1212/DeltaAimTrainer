import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair } from "./hud/Crosshair";
import { LockOverlay } from "./hud/LockOverlay";
import { RangeHud } from "./hud/RangeHud";
import { StageChrome } from "./hud/StageChrome";
import { LookController } from "./look/LookController";
import { useLookSettingsStore } from "./look/useLookSettingsStore";
import { RANGE_PALETTE } from "./scene/rangePalette";
import { TrainingRange } from "./scene/TrainingRange";
import { ShootingController } from "./shoot/ShootingController";

const CANVAS_CAMERA = {
  fov: 65.455,
  near: 0.1,
  far: 80,
  position: [0, 1.6, 0] as const,
};

export function App() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

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
      setIsLocked(document.pointerLockElement === stageRef.current);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "1") {
        useLookSettingsStore.getState().setOptic("redDot");
      }
      if (event.key === "2") {
        useLookSettingsStore.getState().setOptic("scope2x");
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
          <TrainingRange />
        </Canvas>
        <StageChrome />
        <Crosshair />
        <LockOverlay visible={!isLocked} onEnter={enterLock} />
      </div>
      <RangeHud isLocked={isLocked} />
    </div>
  );
}
