import { describe, expect, it } from "vitest";
import { formatMilliseconds, formatRate } from "./formatDrill";

describe("formatDrill", () => {
  it("renders an empty sample as a dash and rounds rates", () => {
    expect(formatRate(null)).toBe("—");
    expect(formatRate(0)).toBe("0%");
    expect(formatRate(0.806)).toBe("81%");
    expect(formatMilliseconds(null)).toBe("—");
    expect(formatMilliseconds(180.4)).toBe("180");
  });
});
