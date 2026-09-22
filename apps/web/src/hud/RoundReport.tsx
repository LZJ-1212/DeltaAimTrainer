import {
  averageTtkMs,
  firstShotRate,
  hitRate,
  trackingUptime,
} from "../shoot/drillRound";
import { useTrainingStore } from "../shoot/useTrainingStore";
import { formatMilliseconds, formatRate } from "./formatDrill";

type RoundReportProps = {
  onRestart: () => void;
};

export function RoundReport({ onRestart }: RoundReportProps) {
  const phase = useTrainingStore((state) => state.phase);
  const mode = useTrainingStore((state) => state.mode);
  const score = useTrainingStore((state) => state.score);
  const shotsHit = useTrainingStore((state) => state.shotsHit);
  const shotsFired = useTrainingStore((state) => state.shotsFired);
  const kills = useTrainingStore((state) => state.kills);
  const firstShotHits = useTrainingStore((state) => state.firstShotHits);
  const firstShotAttempts = useTrainingStore((state) => state.firstShotAttempts);
  const ttkSumMs = useTrainingStore((state) => state.ttkSumMs);
  const ttkSamples = useTrainingStore((state) => state.ttkSamples);
  const trackedMs = useTrainingStore((state) => state.trackedMs);
  const trackingWindowMs = useTrainingStore((state) => state.trackingWindowMs);

  if (phase !== "settled") {
    return null;
  }

  const accuracy = hitRate({ shotsHit, shotsFired });
  const title = mode === "flicking" ? "甩枪" : "跟枪";
  const ttkLabel = formatMilliseconds(averageTtkMs({ ttkSumMs, ttkSamples }));

  return (
    <section className="round-report" aria-label="本局结算">
      <p className="round-report-kicker">{title} · 60 秒</p>
      <h2>本局结算</h2>
      <dl>
        <div>
          <dt>得分</dt>
          <dd>{score}</dd>
        </div>
        <div>
          <dt>命中率</dt>
          <dd>{formatRate(accuracy)}</dd>
        </div>
        {mode === "flicking" ? (
          <>
            <div>
              <dt>击杀</dt>
              <dd>{kills}</dd>
            </div>
            <div>
              <dt>首发命中</dt>
              <dd>
                {formatRate(firstShotRate({ firstShotHits, firstShotAttempts }))}
              </dd>
            </div>
            <div>
              <dt>平均 TTK</dt>
              <dd>{ttkLabel === "—" ? ttkLabel : `${ttkLabel} ms`}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>Tracking Uptime</dt>
            <dd>{formatRate(trackingUptime({ trackedMs, trackingWindowMs }))}</dd>
          </div>
        )}
      </dl>
      <button type="button" onClick={onRestart}>
        再来一局
      </button>
      <p>Esc 解除锁定后点按钮，或按 R 直接再开一局。</p>
    </section>
  );
}
