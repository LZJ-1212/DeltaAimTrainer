import {
  adsHorizontalFov,
  adsLookDeltaDeg,
  applyLookDelta,
  DEFAULT_MDV_COEFF,
  horizontalToVerticalFov,
  OPTIC_ZOOM,
} from "@delta-aim/aim-math";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera } from "three";
import { applyCameraLook } from "./applyCameraLook";
import { consumePointerDelta } from "./pointerDelta";
import { useLookSettingsStore } from "./useLookSettingsStore";

type LookControllerProps = {
  isLocked: boolean;
};

function lockViewportSize(): { width: number; height: number } {
  const el = document.pointerLockElement;
  if (el instanceof HTMLElement) {
    return { width: el.clientWidth, height: el.clientHeight };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

export function LookController({ isLocked }: LookControllerProps) {
  const camera = useThree((state) => state.camera);
  const look = useRef({ yawDeg: 0, pitchDeg: 0 });
  const pointerGate = useRef({ ignoreNext: true });
  const optic = useLookSettingsStore((state) => state.optic);
  const hFovDeg = useLookSettingsStore((state) => state.hFovDeg);
  const facingResetId = useLookSettingsStore((state) => state.facingResetId);
  const zoom = OPTIC_ZOOM[optic];

  useEffect(() => {
    look.current = { yawDeg: 0, pitchDeg: 0 };
  }, [facingResetId]);

  useEffect(() => {
    if (isLocked) {
      pointerGate.current.ignoreNext = true;
    }
  }, [isLocked]);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }
    const adsH = adsHorizontalFov(hFovDeg, zoom);
    camera.fov = horizontalToVerticalFov(adsH);
    camera.updateProjectionMatrix();
  }, [camera, hFovDeg, zoom]);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const onMouseMove = (event: MouseEvent): void => {
      if (document.pointerLockElement === null) {
        return;
      }
      const viewport = lockViewportSize();
      const delta = consumePointerDelta(
        pointerGate.current,
        event.movementX,
        event.movementY,
        viewport.width,
        viewport.height,
      );
      if (delta === null) {
        return;
      }
      const settings = useLookSettingsStore.getState();
      const currentZoom = OPTIC_ZOOM[settings.optic];
      const yawDelta = adsLookDeltaDeg({
        movement: delta.movementX,
        sens: settings.sens,
        yawFactor: settings.yawFactor,
        hHipDeg: settings.hFovDeg,
        zoom: currentZoom,
        mdvCoeff: DEFAULT_MDV_COEFF,
      });
      const pitchDelta = adsLookDeltaDeg({
        movement: delta.movementY,
        sens: settings.sens,
        yawFactor: settings.yawFactor,
        hHipDeg: settings.hFovDeg,
        zoom: currentZoom,
        mdvCoeff: DEFAULT_MDV_COEFF,
      });
      look.current = applyLookDelta({
        yawDeg: look.current.yawDeg,
        pitchDeg: look.current.pitchDeg,
        deltaYawDeg: -yawDelta,
        deltaPitchDeg: -pitchDelta,
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [isLocked]);

  useFrame(() => {
    applyCameraLook(camera, look.current.pitchDeg, look.current.yawDeg);
  });

  return null;
}
