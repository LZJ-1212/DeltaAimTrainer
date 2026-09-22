import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { applyCameraLook } from "./applyCameraLook";

function forwardOf(pitchDeg: number, yawDeg: number): Vector3 {
  const camera = new PerspectiveCamera();
  applyCameraLook(camera, pitchDeg, yawDeg);
  return new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
}

describe("applyCameraLook", () => {
  it("turns two degrees from yaw 89 to 91 instead of flipping", () => {
    const from = forwardOf(0, 89);
    const to = forwardOf(0, 91);
    expect((from.angleTo(to) * 180) / Math.PI).toBeCloseTo(2, 1);
  });

  it("turns two degrees from pitch 87 to 89 instead of flipping", () => {
    const from = forwardOf(87, 0);
    const to = forwardOf(89, 0);
    expect((from.angleTo(to) * 180) / Math.PI).toBeCloseTo(2, 1);
  });

  it("stays continuous when yaw wraps 179 to -179", () => {
    const from = forwardOf(0, 179);
    const to = forwardOf(0, -179);
    expect((from.angleTo(to) * 180) / Math.PI).toBeCloseTo(2, 1);
  });
});
