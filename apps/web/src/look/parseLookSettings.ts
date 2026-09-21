import { resolveLookSettings, type LookSettings } from "@delta-aim/aim-math";

export type LookSettingsDraft = {
  dpi: string;
  sens: string;
  hFovDeg: string;
  yawFactor: string;
};

function parsePositiveField(name: string, raw: string): number {
  const value = Number(raw.trim());
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
  return value;
}

export function parseLookSettingsDraft(draft: LookSettingsDraft): LookSettings {
  return resolveLookSettings({
    dpi: parsePositiveField("dpi", draft.dpi),
    sens: parsePositiveField("sens", draft.sens),
    hFovDeg: parsePositiveField("fov", draft.hFovDeg),
    yawFactor: parsePositiveField("yawFactor", draft.yawFactor),
  });
}

export function describeLookSettingsError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/fov/i.test(message)) {
    return "FOV 须在 60–120";
  }
  if (/dpi/i.test(message)) {
    return "DPI 须为正数";
  }
  if (/sens/i.test(message)) {
    return "灵敏度须为正数";
  }
  if (/yawFactor/i.test(message)) {
    return "yaw 须为正数";
  }
  return "设置无效";
}
