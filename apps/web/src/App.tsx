import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair } from "./hud/Crosshair";
import { LockOverlay } from "./hud/LockOverlay";
import { RangeHud } from "./hud/RangeHud";
import { LookController } from "./look/LookController";
import { useLookSettingsStore } from "./look/useLookSettingsStore";
import { TrainingRange } from "./scene/TrainingRange";
import { ShootingController } from "./shoot/ShootingController";

export function App() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  const enterLock = useCallback(() => {
    void stageRef.current?.requestPointerLock();
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
          camera={{ fov: 65.455, near: 0.1, far: 80, position: [0, 1.6, 0] }}
          onCreated={({ gl }) => {
            gl.setClearColor("#0b0f0c");
          }}
        >
          <LookController isLocked={isLocked} />
          <ShootingController isLocked={isLocked} />
          <TrainingRange />
        </Canvas>
        <Crosshair />
        <LockOverlay visible={!isLocked} onEnter={enterLock} />
      </div>
      <RangeHud isLocked={isLocked} />
    </div>
  );
}
