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
import { MathUtils, PerspectiveCamera } from "three";
import { useLookSettingsStore } from "./useLookSettingsStore";

type LookControllerProps = {
  isLocked: boolean;
};

export function LookController({ isLocked }: LookControllerProps) {
  const camera = useThree((state) => state.camera);
  const look = useRef({ yawDeg: 0, pitchDeg: 0 });
  const optic = useLookSettingsStore((state) => state.optic);
  const hFovDeg = useLookSettingsStore((state) => state.hFovDeg);
  const zoom = OPTIC_ZOOM[optic];

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
      const settings = useLookSettingsStore.getState();
      const currentZoom = OPTIC_ZOOM[settings.optic];
      const yawDelta = adsLookDeltaDeg({
        movement: event.movementX,
        sens: settings.sens,
        yawFactor: settings.yawFactor,
        hHipDeg: settings.hFovDeg,
        zoom: currentZoom,
        mdvCoeff: DEFAULT_MDV_COEFF,
      });
      const pitchDelta = adsLookDeltaDeg({
        movement: event.movementY,
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
      camera.rotation.set(
        MathUtils.degToRad(look.current.pitchDeg),
        MathUtils.degToRad(look.current.yawDeg),
        0,
        "YXZ",
      );
    };

    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, isLocked]);

  useFrame(() => {
    camera.rotation.set(
      MathUtils.degToRad(look.current.pitchDeg),
      MathUtils.degToRad(look.current.yawDeg),
      0,
      "YXZ",
    );
  });

  return null;
}
