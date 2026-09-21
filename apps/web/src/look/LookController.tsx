import {
  adsHorizontalFov,
  adsLookDeltaDeg,
  applyLookDelta,
  horizontalToVerticalFov,
  OPTIC_ZOOM,
} from "@delta-aim/aim-math";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, PerspectiveCamera } from "three";
import { OWNER_LOOK, type OpticId } from "./ownerLook";

type LookControllerProps = {
  optic: OpticId;
  isLocked: boolean;
};

export function LookController({ optic, isLocked }: LookControllerProps) {
  const camera = useThree((state) => state.camera);
  const look = useRef({ yawDeg: 0, pitchDeg: 0 });
  const zoom = OPTIC_ZOOM[optic];

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }
    const adsH = adsHorizontalFov(OWNER_LOOK.hFovDeg, zoom);
    camera.fov = horizontalToVerticalFov(adsH);
    camera.updateProjectionMatrix();
  }, [camera, zoom]);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const onMouseMove = (event: MouseEvent): void => {
      if (document.pointerLockElement === null) {
        return;
      }
      const yawDelta = adsLookDeltaDeg({
        movement: event.movementX,
        sens: OWNER_LOOK.sens,
        yawFactor: OWNER_LOOK.yawFactor,
        hHipDeg: OWNER_LOOK.hFovDeg,
        zoom,
        mdvCoeff: OWNER_LOOK.mdvCoeff,
      });
      const pitchDelta = adsLookDeltaDeg({
        movement: event.movementY,
        sens: OWNER_LOOK.sens,
        yawFactor: OWNER_LOOK.yawFactor,
        hHipDeg: OWNER_LOOK.hFovDeg,
        zoom,
        mdvCoeff: OWNER_LOOK.mdvCoeff,
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
  }, [isLocked, zoom]);

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
