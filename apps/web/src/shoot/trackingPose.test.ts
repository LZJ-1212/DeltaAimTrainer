import { describe, expect, it } from "vitest";
import { trackingPose } from "./trackingPose";

describe("trackingPose", () => {
  it("starts on the left side of the lane at 8 meters", () => {
    const pose = trackingPose(0);
    expect(pose.x).toBeCloseTo(-2.4, 5);
    expect(pose.z).toBe(-8);
  });

  it("holds still for the stop window, then leaves without a snap", () => {
    const held = trackingPose(3_000);
    expect(held.z).toBe(-8);
    expect(Math.abs(held.x)).toBeLessThanOrEqual(3.2);
    expect(trackingPose(3_100)).toEqual(held);
    expect(trackingPose(3_279)).toEqual(held);
    expect(trackingPose(3_280)).toEqual(held);
  });

  it("does not teleport across a slide or a bucket boundary", () => {
    let previous = trackingPose(0);
    for (let elapsedMs = 1; elapsedMs <= 8_000; elapsedMs += 1) {
      const pose = trackingPose(elapsedMs);
      expect(Math.abs(pose.x - previous.x)).toBeLessThan(0.02);
      expect(pose.z).toBe(-8);
      previous = pose;
    }
  });

  it("does not freeze on the lane edge late in the minute", () => {
    let stillMs = 0;
    let longestStillMs = 0;
    let previous = trackingPose(40_000);
    for (let elapsedMs = 40_016; elapsedMs <= 60_000; elapsedMs += 16) {
      const pose = trackingPose(elapsedMs);
      if (Math.abs(pose.x - previous.x) < 0.004) {
        stillMs += 16;
        longestStillMs = Math.max(longestStillMs, stillMs);
      } else {
        stillMs = 0;
      }
      previous = pose;
    }
    expect(longestStillMs).toBeLessThan(400);
  });

  it("stays inside the lane", () => {
    for (const elapsedMs of [0, 1_500, 2_840, 3_280, 7_500, 50_000, 59_500]) {
      const pose = trackingPose(elapsedMs);
      expect(pose.z).toBe(-8);
      expect(pose.x).toBeGreaterThanOrEqual(-3.2);
      expect(pose.x).toBeLessThanOrEqual(3.2);
    }
  });

  it("rejects a negative or non-finite time", () => {
    expect(() => trackingPose(-1)).toThrow(/elapsedMs/i);
    expect(() => trackingPose(Number.NaN)).toThrow(/elapsedMs/i);
  });
});
