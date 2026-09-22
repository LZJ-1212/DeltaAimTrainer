export function formatRate(rate: number | null): string {
  if (rate === null) {
    return "—";
  }
  return `${Math.round(rate * 100)}%`;
}

export function formatMilliseconds(ms: number | null): string {
  if (ms === null) {
    return "—";
  }
  return `${Math.round(ms)}`;
}
