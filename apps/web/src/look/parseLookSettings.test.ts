import { describe, expect, it } from "vitest";
import {
  describeLookSettingsError,
  parseLookSettingsDraft,
} from "./parseLookSettings";

describe("parseLookSettingsDraft", () => {
  it("parses owner defaults from numeric strings", () => {
    expect(
      parseLookSettingsDraft({
        dpi: "1600",
        sens: "2",
        hFovDeg: "110",
        yawFactor: "0.022",
      }),
    ).toEqual({ dpi: 1600, sens: 2, hFovDeg: 110, yawFactor: 0.022 });
  });

  it("trims whitespace", () => {
    expect(
      parseLookSettingsDraft({
        dpi: " 800 ",
        sens: "1.5",
        hFovDeg: "105",
        yawFactor: "0.022",
      }),
    ).toEqual({ dpi: 800, sens: 1.5, hFovDeg: 105, yawFactor: 0.022 });
  });

  it("rejects empty or non-numeric fields", () => {
    expect(() =>
      parseLookSettingsDraft({
        dpi: "",
        sens: "2",
        hFovDeg: "110",
        yawFactor: "0.022",
      }),
    ).toThrow(/dpi/i);
    expect(() =>
      parseLookSettingsDraft({
        dpi: "1600",
        sens: "abc",
        hFovDeg: "110",
        yawFactor: "0.022",
      }),
    ).toThrow(/sens/i);
  });

  it("rejects hip FOV outside 60–120", () => {
    expect(() =>
      parseLookSettingsDraft({
        dpi: "1600",
        sens: "2",
        hFovDeg: "130",
        yawFactor: "0.022",
      }),
    ).toThrow(/fov/i);
  });
});

describe("describeLookSettingsError", () => {
  it("maps fov errors to Chinese", () => {
    expect(describeLookSettingsError(new Error("fov must be between 60 and 120"))).toBe(
      "FOV 须在 60–120",
    );
  });
});
