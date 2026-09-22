import { describe, expect, it } from "vitest";
import {
  adsHorizontalFov,
  adsLookDeltaDeg,
  applyLookDelta,
  wrapSigned180,
  cmPer360,
  DEFAULT_MDV_COEFF,
  DEFAULT_YAW_FACTOR,
  degreesFromMovement,
  horizontalToVerticalFov,
  mdvScale,
  OPTIC_ZOOM,
  resolveLookSettings,
  adsCmPer180,
} from "./lookMath";

describe("degreesFromMovement", () => {
  it("uses yaw 0.022 and does not multiply DPI", () => {
    expect(
      degreesFromMovement({ movement: 1, sens: 2, yawFactor: DEFAULT_YAW_FACTOR }),
    ).toBeCloseTo(0.044, 8);
  });

  it("scales linearly with movement including negatives", () => {
    expect(
      degreesFromMovement({ movement: -10, sens: 2, yawFactor: 0.022 }),
    ).toBeCloseTo(-0.44, 8);
  });

  it("rejects non-positive sens", () => {
    expect(() =>
      degreesFromMovement({ movement: 1, sens: 0, yawFactor: 0.022 }),
    ).toThrow(/sens/i);
  });
});

describe("cmPer360", () => {
  it("matches owner config 1600 DPI x sens 2 ≈ 13 cm", () => {
    expect(cmPer360({ dpi: 1600, sens: 2, yawFactor: 0.022 })).toBeCloseTo(
      12.99,
      2,
    );
  });

  it("rejects non-positive dpi", () => {
    expect(() => cmPer360({ dpi: 0, sens: 2, yawFactor: 0.022 })).toThrow(/dpi/i);
  });
});

describe("horizontalToVerticalFov", () => {
  it("converts 110 horizontal 16:9-base to vertical FOV", () => {
    expect(horizontalToVerticalFov(110)).toBeCloseTo(77.552, 3);
  });

  it("converts ads-range horizontal FOV below hip min 60", () => {
    expect(horizontalToVerticalFov(53.13)).toBeGreaterThan(20);
    expect(horizontalToVerticalFov(53.13)).toBeLessThan(53.13);
  });

  it("rejects non-optical FOV", () => {
    expect(() => horizontalToVerticalFov(0)).toThrow(/fov/i);
    expect(() => horizontalToVerticalFov(180)).toThrow(/fov/i);
  });
});

describe("adsLookDeltaDeg", () => {
  it("applies MDV 1.33 on top of hip yaw for red-dot", () => {
    const hip = degreesFromMovement({ movement: 1, sens: 2, yawFactor: 0.022 });
    const ads = adsLookDeltaDeg({
      movement: 1,
      sens: 2,
      yawFactor: 0.022,
      hHipDeg: 110,
      zoom: 1.25,
      mdvCoeff: 1.33,
    });
    expect(ads / hip).toBeCloseTo(0.8641, 3);
  });

  it("does not throw when 2x ads FOV falls below 60", () => {
    expect(() =>
      adsLookDeltaDeg({
        movement: 1,
        sens: 2,
        yawFactor: 0.022,
        hHipDeg: 90,
        zoom: 2,
        mdvCoeff: 1.33,
      }),
    ).not.toThrow();
  });
});

describe("resolveLookSettings", () => {
  it("returns owner defaults", () => {
    expect(
      resolveLookSettings({ dpi: 1600, sens: 2, hFovDeg: 110, yawFactor: 0.022 }),
    ).toEqual({ dpi: 1600, sens: 2, hFovDeg: 110, yawFactor: 0.022 });
  });

  it("rejects hip FOV outside 60–120", () => {
    expect(() =>
      resolveLookSettings({ dpi: 1600, sens: 2, hFovDeg: 59, yawFactor: 0.022 }),
    ).toThrow(/fov/i);
    expect(() =>
      resolveLookSettings({ dpi: 1600, sens: 2, hFovDeg: 121, yawFactor: 0.022 }),
    ).toThrow(/fov/i);
  });

  it("rejects non-positive dpi, sens, and yawFactor", () => {
    expect(() =>
      resolveLookSettings({ dpi: 0, sens: 2, hFovDeg: 110, yawFactor: 0.022 }),
    ).toThrow(/dpi/i);
    expect(() =>
      resolveLookSettings({ dpi: 1600, sens: -1, hFovDeg: 110, yawFactor: 0.022 }),
    ).toThrow(/sens/i);
    expect(() =>
      resolveLookSettings({ dpi: 1600, sens: 2, hFovDeg: 110, yawFactor: 0 }),
    ).toThrow(/yawFactor/i);
  });
});

describe("adsCmPer180", () => {
  it("is hip cm/360 halved then divided by red-dot MDV scale", () => {
    const hip = cmPer360({ dpi: 1600, sens: 2, yawFactor: 0.022 });
    expect(
      adsCmPer180({
        dpi: 1600,
        sens: 2,
        yawFactor: 0.022,
        hHipDeg: 110,
        zoom: 1.25,
        mdvCoeff: 1.33,
      }),
    ).toBeCloseTo(hip / 2 / 0.8641, 2);
  });
});

describe("adsHorizontalFov", () => {
  it("uses red-dot zoom 1.25 from hip 110", () => {
    expect(OPTIC_ZOOM.redDot).toBe(1.25);
    expect(adsHorizontalFov(110, OPTIC_ZOOM.redDot)).toBeCloseTo(97.611, 3);
  });

  it("uses 2x zoom from hip 110", () => {
    expect(OPTIC_ZOOM.scope2x).toBe(2);
    expect(adsHorizontalFov(110, OPTIC_ZOOM.scope2x)).toBeCloseTo(71.059, 3);
  });

  it("rejects non-positive zoom", () => {
    expect(() => adsHorizontalFov(110, 0)).toThrow(/zoom/i);
  });
});

describe("mdvScale", () => {
  it("scales red-dot vs hip vertical FOV at coeff 1.33", () => {
    const hipV = horizontalToVerticalFov(110);
    const adsV = horizontalToVerticalFov(adsHorizontalFov(110, 1.25));
    expect(
      mdvScale({ hipVFovDeg: hipV, adsVFovDeg: adsV, coeff: DEFAULT_MDV_COEFF }),
    ).toBeCloseTo(0.8641, 3);
  });

  it("rejects non-positive coeff", () => {
    expect(() =>
      mdvScale({ hipVFovDeg: 70, adsVFovDeg: 50, coeff: 0 }),
    ).toThrow(/coeff/i);
  });
});

describe("applyLookDelta", () => {
  it("clamps pitch to ±89", () => {
    const next = applyLookDelta({
      yawDeg: 10,
      pitchDeg: 80,
      deltaYawDeg: 5,
      deltaPitchDeg: 20,
    });
    expect(next.yawDeg).toBeCloseTo(15);
    expect(next.pitchDeg).toBe(89);
  });

  it("wraps yaw through ±180 so a full turn stays continuous", () => {
    expect(
      applyLookDelta({
        yawDeg: 170,
        pitchDeg: 0,
        deltaYawDeg: 20,
        deltaPitchDeg: 0,
      }).yawDeg,
    ).toBeCloseTo(-170);
    expect(
      applyLookDelta({
        yawDeg: -170,
        pitchDeg: 0,
        deltaYawDeg: -20,
        deltaPitchDeg: 0,
      }).yawDeg,
    ).toBeCloseTo(170);
  });
});

describe("wrapSigned180", () => {
  it("keeps ±90 and 180 stable and maps 181 to -179", () => {
    expect(wrapSigned180(0)).toBe(0);
    expect(wrapSigned180(90)).toBe(90);
    expect(wrapSigned180(-90)).toBe(-90);
    expect(wrapSigned180(180)).toBe(180);
    expect(wrapSigned180(181)).toBeCloseTo(-179);
    expect(wrapSigned180(-181)).toBeCloseTo(179);
    expect(wrapSigned180(360)).toBe(0);
  });
});
