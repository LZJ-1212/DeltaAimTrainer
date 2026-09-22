export const DEFAULT_YAW_FACTOR = 0.022;
export const DEFAULT_MDV_COEFF = 1.33;
export const ASPECT_16_9 = 16 / 9;
export const OPTIC_ZOOM = { redDot: 1.25, scope2x: 2 } as const;
export const HIP_FOV_MIN = 60;
export const HIP_FOV_MAX = 120;
export const PITCH_LIMIT_DEG = 89;

export type LookDeltaInput = {
  movement: number;
  sens: number;
  yawFactor: number;
};

export type CmPer360Input = {
  dpi: number;
  sens: number;
  yawFactor: number;
};

export type MdvScaleInput = {
  hipVFovDeg: number;
  adsVFovDeg: number;
  coeff: number;
};

export type AdsLookInput = LookDeltaInput & {
  hHipDeg: number;
  zoom: number;
  mdvCoeff: number;
};

export type AdsCmPer180Input = CmPer360Input & {
  hHipDeg: number;
  zoom: number;
  mdvCoeff: number;
};

export type ApplyLookInput = {
  yawDeg: number;
  pitchDeg: number;
  deltaYawDeg: number;
  deltaPitchDeg: number;
  pitchLimitDeg?: number;
};

export type LookSettings = {
  dpi: number;
  sens: number;
  hFovDeg: number;
  yawFactor: number;
};

export const DEFAULT_LOOK_SETTINGS: LookSettings = {
  dpi: 1600,
  sens: 2,
  hFovDeg: 110,
  yawFactor: DEFAULT_YAW_FACTOR,
};

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
}

function requireFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degreesFromMovement({
  movement,
  sens,
  yawFactor,
}: LookDeltaInput): number {
  requireFinite("movement", movement);
  requirePositive("sens", sens);
  requirePositive("yawFactor", yawFactor);
  return movement * sens * yawFactor;
}

export function cmPer360({ dpi, sens, yawFactor }: CmPer360Input): number {
  requirePositive("dpi", dpi);
  requirePositive("sens", sens);
  requirePositive("yawFactor", yawFactor);
  return (360 / (dpi * sens * yawFactor)) * 2.54;
}

export function assertHipHorizontalFov(hFovDeg: number): void {
  requireFinite("fov", hFovDeg);
  if (hFovDeg < HIP_FOV_MIN || hFovDeg > HIP_FOV_MAX) {
    throw new Error(`fov must be between ${HIP_FOV_MIN} and ${HIP_FOV_MAX}`);
  }
}

export function horizontalToVerticalFov(hFovDeg: number): number {
  requireFinite("fov", hFovDeg);
  if (hFovDeg <= 0 || hFovDeg >= 180) {
    throw new Error("fov must be between 0 and 180 exclusive");
  }
  const h = degToRad(hFovDeg);
  return radToDeg(2 * Math.atan(Math.tan(h / 2) / ASPECT_16_9));
}

export function adsHorizontalFov(hHipDeg: number, zoom: number): number {
  requirePositive("zoom", zoom);
  assertHipHorizontalFov(hHipDeg);
  const h = degToRad(hHipDeg);
  return radToDeg(2 * Math.atan(Math.tan(h / 2) / zoom));
}

export function mdvScale({
  hipVFovDeg,
  adsVFovDeg,
  coeff,
}: MdvScaleInput): number {
  requirePositive("coeff", coeff);
  requirePositive("hipVFov", hipVFovDeg);
  requirePositive("adsVFov", adsVFovDeg);
  const hip = degToRad(hipVFovDeg) / 2;
  const ads = degToRad(adsVFovDeg) / 2;
  return Math.atan(coeff * Math.tan(ads)) / Math.atan(coeff * Math.tan(hip));
}

export function adsLookDeltaDeg({
  movement,
  sens,
  yawFactor,
  hHipDeg,
  zoom,
  mdvCoeff,
}: AdsLookInput): number {
  const hipDeg = degreesFromMovement({ movement, sens, yawFactor });
  const hipV = horizontalToVerticalFov(hHipDeg);
  const adsH = adsHorizontalFov(hHipDeg, zoom);
  const adsV = horizontalToVerticalFov(adsH);
  const scale = mdvScale({
    hipVFovDeg: hipV,
    adsVFovDeg: adsV,
    coeff: mdvCoeff,
  });
  return hipDeg * scale;
}

export function adsCmPer180({
  dpi,
  sens,
  yawFactor,
  hHipDeg,
  zoom,
  mdvCoeff,
}: AdsCmPer180Input): number {
  const hipCm = cmPer360({ dpi, sens, yawFactor });
  const hipV = horizontalToVerticalFov(hHipDeg);
  const adsH = adsHorizontalFov(hHipDeg, zoom);
  const adsV = horizontalToVerticalFov(adsH);
  const scale = mdvScale({
    hipVFovDeg: hipV,
    adsVFovDeg: adsV,
    coeff: mdvCoeff,
  });
  return hipCm / 2 / scale;
}

export function wrapSigned180(deg: number): number {
  requireFinite("deg", deg);
  const wrapped = ((((deg + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

export function applyLookDelta({
  yawDeg,
  pitchDeg,
  deltaYawDeg,
  deltaPitchDeg,
  pitchLimitDeg = PITCH_LIMIT_DEG,
}: ApplyLookInput): { yawDeg: number; pitchDeg: number } {
  requireFinite("yawDeg", yawDeg);
  requireFinite("pitchDeg", pitchDeg);
  requireFinite("deltaYawDeg", deltaYawDeg);
  requireFinite("deltaPitchDeg", deltaPitchDeg);
  requirePositive("pitchLimitDeg", pitchLimitDeg);
  const nextPitch = Math.min(
    pitchLimitDeg,
    Math.max(-pitchLimitDeg, pitchDeg + deltaPitchDeg),
  );
  return { yawDeg: wrapSigned180(yawDeg + deltaYawDeg), pitchDeg: nextPitch };
}

export function resolveLookSettings(input: LookSettings): LookSettings {
  requirePositive("dpi", input.dpi);
  requirePositive("sens", input.sens);
  requirePositive("yawFactor", input.yawFactor);
  assertHipHorizontalFov(input.hFovDeg);
  return {
    dpi: input.dpi,
    sens: input.sens,
    hFovDeg: input.hFovDeg,
    yawFactor: input.yawFactor,
  };
}
