import { beforeEach, describe, expect, it } from "vitest";
import { useLookSettingsStore } from "./useLookSettingsStore";

describe("useLookSettingsStore", () => {
  beforeEach(() => {
    useLookSettingsStore.getState().reset();
  });

  it("starts at owner red-dot defaults", () => {
    const state = useLookSettingsStore.getState();
    expect(state.dpi).toBe(1600);
    expect(state.sens).toBe(2);
    expect(state.hFovDeg).toBe(110);
    expect(state.yawFactor).toBe(0.022);
    expect(state.optic).toBe("redDot");
  });

  it("applies valid settings without touching optic", () => {
    useLookSettingsStore.getState().setOptic("scope2x");
    useLookSettingsStore.getState().applySettings({
      dpi: 800,
      sens: 1.5,
      hFovDeg: 90,
      yawFactor: 0.022,
    });
    const state = useLookSettingsStore.getState();
    expect(state.dpi).toBe(800);
    expect(state.sens).toBe(1.5);
    expect(state.hFovDeg).toBe(90);
    expect(state.optic).toBe("scope2x");
  });

  it("keeps previous settings when apply is invalid", () => {
    expect(() =>
      useLookSettingsStore.getState().applySettings({
        dpi: 1600,
        sens: 2,
        hFovDeg: 200,
        yawFactor: 0.022,
      }),
    ).toThrow(/fov/i);
    expect(useLookSettingsStore.getState().hFovDeg).toBe(110);
  });

  it("increments facingResetId without changing look settings", () => {
    useLookSettingsStore.getState().applySettings({
      dpi: 800,
      sens: 1.5,
      hFovDeg: 90,
      yawFactor: 0.022,
    });
    expect(useLookSettingsStore.getState().facingResetId).toBe(0);
    useLookSettingsStore.getState().resetFacing();
    const state = useLookSettingsStore.getState();
    expect(state.facingResetId).toBe(1);
    expect(state.dpi).toBe(800);
    expect(state.sens).toBe(1.5);
  });
});
