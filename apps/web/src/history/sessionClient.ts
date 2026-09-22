import type { SessionDraft } from "./sessionDraft";

export type AccuracyPoint = {
  id: string;
  createdAt: string;
  mode: "flicking" | "tracking";
  accuracy: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAccuracyPoint(value: unknown): value is AccuracyPoint {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    (value.mode === "flicking" || value.mode === "tracking") &&
    typeof value.accuracy === "number" &&
    Number.isFinite(value.accuracy)
  );
}

export function parseWeeklyAccuracy(payload: unknown): AccuracyPoint[] {
  if (!isRecord(payload) || !Array.isArray(payload.points)) {
    throw new Error("points");
  }
  return payload.points.filter(isAccuracyPoint);
}

async function readError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isRecord(body) && typeof body.error === "string" && body.error.length > 0) {
      return body.error;
    }
  } catch {
    return "request failed";
  }
  return "request failed";
}

export async function saveSession(draft: SessionDraft): Promise<void> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function loadWeeklyAccuracy(): Promise<AccuracyPoint[]> {
  const response = await fetch("/api/sessions/week");
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return parseWeeklyAccuracy(await response.json());
}
