import type { OpticId } from "../look/ownerLook";
import {
  averageTtkMs,
  trackingUptime,
  type DrillRound,
} from "../shoot/drillRound";

export type SessionDraft = {
  mode: DrillRound["mode"];
  optic: OpticId;
  score: number;
  shotsFired: number;
  shotsHit: number;
  avgReactionMs: number | null;
  trackingUptime: number | null;
  dpi: number;
  sens: number;
  hFovDeg: number;
};

type LookSlice = {
  optic: OpticId;
  dpi: number;
  sens: number;
  hFovDeg: number;
};

export function toSessionDraft(round: DrillRound, look: LookSlice): SessionDraft | null {
  if (round.phase !== "settled") {
    return null;
  }

  const reactionMs = round.mode === "flicking" ? averageTtkMs(round) : null;
  return {
    mode: round.mode,
    optic: look.optic,
    score: round.score,
    shotsFired: round.shotsFired,
    shotsHit: round.shotsHit,
    avgReactionMs: reactionMs === null ? null : Math.round(reactionMs),
    trackingUptime: round.mode === "tracking" ? trackingUptime(round) : null,
    dpi: look.dpi,
    sens: look.sens,
    hFovDeg: look.hFovDeg,
  };
}
