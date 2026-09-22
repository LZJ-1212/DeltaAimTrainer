import {
  adsCmPer180,
  cmPer360,
  DEFAULT_MDV_COEFF,
  OPTIC_ZOOM,
} from "@delta-aim/aim-math";
import { LookSettingsForm } from "../look/LookSettingsForm";
import { useLookSettingsStore } from "../look/useLookSettingsStore";
import { useTrainingStore } from "../shoot/useTrainingStore";
import { DeltaMark } from "./DeltaMark";

type RangeHudProps = {
  isLocked: boolean;
};

export function RangeHud({ isLocked }: RangeHudProps) {
  const score = useTrainingStore((state) => state.score);
  const shotsHit = useTrainingStore((state) => state.shotsHit);
  const shotsFired = useTrainingStore((state) => state.shotsFired);
  const remaining = useTrainingStore((state) => state.remainingTargetIds.length);
  const optic = useLookSettingsStore((state) => state.optic);
  const dpi = useLookSettingsStore((state) => state.dpi);
  const sens = useLookSettingsStore((state) => state.sens);
  const hFovDeg = useLookSettingsStore((state) => state.hFovDeg);
  const yawFactor = useLookSettingsStore((state) => state.yawFactor);
  const setOptic = useLookSettingsStore((state) => state.setOptic);
  const turnCm = cmPer360({ dpi, sens, yawFactor });
  const ads180Cm = adsCmPer180({
    dpi,
    sens,
    yawFactor,
    hHipDeg: hFovDeg,
    zoom: OPTIC_ZOOM[optic],
    mdvCoeff: DEFAULT_MDV_COEFF,
  });

  return (
    <footer className="range-hud">
      <div className="range-hud-id">
        <DeltaMark className="range-hud-mark" />
        <div>
          <p className="range-hud-brand">三角洲靶场</p>
          <p className="range-hud-meta">
            {dpi} DPI · 灵敏度 {sens} · FOV {hFovDeg} · 腰射 {turnCm.toFixed(1)}{" "}
            cm/360
          </p>
        </div>
      </div>
      <dl className="range-hud-telemetry">
        <div>
          <dt>得分</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>命中</dt>
          <dd>
            {shotsHit}/{shotsFired}
          </dd>
        </div>
        <div>
          <dt>剩余</dt>
          <dd>{remaining}</dd>
        </div>
        <div>
          <dt>开镜 180°</dt>
          <dd>{ads180Cm.toFixed(1)} cm</dd>
        </div>
      </dl>
      <LookSettingsForm />
      <div className="optic-switch" role="group" aria-label="开镜预设">
        <button
          type="button"
          className={optic === "redDot" ? "is-active" : undefined}
          onClick={() => setOptic("redDot")}
        >
          红点 {OPTIC_ZOOM.redDot}x
        </button>
        <button
          type="button"
          className={optic === "scope2x" ? "is-active" : undefined}
          onClick={() => setOptic("scope2x")}
        >
          2倍 {OPTIC_ZOOM.scope2x}x
        </button>
        <button type="button" onClick={() => useTrainingStore.getState().reset()}>
          重置靶
        </button>
        <button
          type="button"
          onClick={() => useLookSettingsStore.getState().resetFacing()}
        >
          重置朝向
        </button>
      </div>
      <p className="range-hud-hint">
        {isLocked
          ? "Esc 退出锁定 · 左键射击 · 1 红点 · 2 切 2倍 · 重置朝向后测 180°"
          : "点击画面锁定指针 · 改手感后点应用 · 开镜 180° 对齐后方十字"}
      </p>
    </footer>
  );
}
