import { describe, it, expect } from "vitest";
import { computeSuppliedByTerritory } from "../engine/supply";

describe("supply", () => {
  it("marks connected owned path from capital as supplied", () => {
    // 2 players, simple subset of territories
    const owner: Record<string, number> = {
      T01: 0, T02: 0, T03: 0,
      T07: 1, T08: 1
    };

    const caps: Record<number, string> = { 0: "T01", 1: "T07" };

    const supplied = computeSuppliedByTerritory(owner, caps);
    expect(supplied["T01"]).toBe(true);
    expect(supplied["T02"]).toBe(true);
    expect(supplied["T03"]).toBe(true);
    expect(supplied["T07"]).toBe(true);
    expect(supplied["T08"]).toBe(true);
  });

  it("unsupplied when disconnected from capital", () => {
    // Player 0 owns T01 and T12 but not the path between them
    const owner: Record<string, number> = {
      T01: 0,
      T12: 0,
      T07: 1
    };
    const caps: Record<number, string> = { 0: "T01", 1: "T07" };
    const supplied = computeSuppliedByTerritory(owner, caps);
    expect(supplied["T01"]).toBe(true);
    expect(supplied["T12"]).toBe(false);
  });
});
