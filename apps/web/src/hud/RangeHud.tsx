import { cmPer360, OPTIC_ZOOM } from "@delta-aim/aim-math";
import { OWNER_LOOK, type OpticId } from "../look/ownerLook";

type RangeHudProps = {
  optic: OpticId;
  isLocked: boolean;
  onOpticChange: (optic: OpticId) => void;
};

export function RangeHud({ optic, isLocked, onOpticChange }: RangeHudProps) {
  const turnCm = cmPer360({
    dpi: OWNER_LOOK.dpi,
    sens: OWNER_LOOK.sens,
    yawFactor: OWNER_LOOK.yawFactor,
  });

  return (
    <div className="range-hud">
      <p className="range-hud-brand">DELTA AIM</p>
      <p className="range-hud-meta">
        {OWNER_LOOK.dpi} DPI · sens {OWNER_LOOK.sens} · FOV {OWNER_LOOK.hFovDeg} ·
        腰射 {turnCm.toFixed(1)} cm/360
      </p>
      <div className="optic-switch" role="group" aria-label="开镜预设">
        <button
          type="button"
          className={optic === "redDot" ? "is-active" : undefined}
          onClick={() => onOpticChange("redDot")}
        >
          红点 {OPTIC_ZOOM.redDot}x
        </button>
        <button
          type="button"
          className={optic === "scope2x" ? "is-active" : undefined}
          onClick={() => onOpticChange("scope2x")}
        >
          2倍 {OPTIC_ZOOM.scope2x}x
        </button>
      </div>
      <p className="range-hud-hint">
        {isLocked ? "Esc 退出锁定 · 1 红点 · 2 切 2倍" : "点击画面锁定指针"}
      </p>
    </div>
  );
}
