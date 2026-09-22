import { adsCmPer180, DEFAULT_MDV_COEFF, OPTIC_ZOOM } from "@delta-aim/aim-math";
import { useLookSettingsStore } from "../look/useLookSettingsStore";
import { displaySeconds } from "../shoot/drillRound";
import { useTrainingStore } from "../shoot/useTrainingStore";

const OPTIC_LABEL = {
  redDot: "红点",
  scope2x: "2倍",
} as const;

export function StageChrome() {
  const optic = useLookSettingsStore((state) => state.optic);
  const dpi = useLookSettingsStore((state) => state.dpi);
  const sens = useLookSettingsStore((state) => state.sens);
  const hFovDeg = useLookSettingsStore((state) => state.hFovDeg);
  const yawFactor = useLookSettingsStore((state) => state.yawFactor);
  const score = useTrainingStore((state) => state.score);
  const phase = useTrainingStore((state) => state.phase);
  const elapsedMs = useTrainingStore((state) => state.elapsedMs);
  const ads180Cm = adsCmPer180({
    dpi,
    sens,
    yawFactor,
    hHipDeg: hFovDeg,
    zoom: OPTIC_ZOOM[optic],
    mdvCoeff: DEFAULT_MDV_COEFF,
  });

  return (
    <div className="stage-chrome" aria-hidden>
      <span className="stage-corner stage-corner-tl" />
      <span className="stage-corner stage-corner-tr" />
      <span className="stage-corner stage-corner-bl" />
      <span className="stage-corner stage-corner-br" />
      <p className="stage-readout stage-readout-tl">
        {OPTIC_LABEL[optic]} {OPTIC_ZOOM[optic]}x
        <span>剩余 {displaySeconds({ phase, elapsedMs })}s</span>
        <span>得分 {score}</span>
      </p>
      <p className="stage-readout stage-readout-tr">
        开镜 180° {ads180Cm.toFixed(1)} cm
      </p>
    </div>
  );
}
