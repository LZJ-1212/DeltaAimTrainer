import { Euler, MathUtils, type Object3D } from "three";

const LOOK_EULER = new Euler(0, 0, 0, "YXZ");

export function applyCameraLook(
  camera: Object3D,
  pitchDeg: number,
  yawDeg: number,
): void {
  camera.rotation.order = "YXZ";
  LOOK_EULER.set(
    MathUtils.degToRad(pitchDeg),
    MathUtils.degToRad(yawDeg),
    0,
    "YXZ",
  );
  camera.quaternion.setFromEuler(LOOK_EULER, false);
  camera.rotation.set(LOOK_EULER.x, LOOK_EULER.y, LOOK_EULER.z, "YXZ");
}
