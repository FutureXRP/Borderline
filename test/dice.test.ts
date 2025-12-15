import { describe, it, expect } from "vitest";
import { compareDice } from "../engine/dice";

describe("dice compare", () => {
  it("ties go to defender", () => {
    const { attackerLoss, defenderLoss } = compareDice([6, 3], [6, 1]);
    expect(attackerLoss).toBe(1);
    expect(defenderLoss).toBe(1);
  });

  it("basic comparisons", () => {
    const r = compareDice([5, 4, 1], [3, 2]);
    // Compare (5 vs 3) defender loses, (4 vs 2) defender loses
    expect(r.defenderLoss).toBe(2);
    expect(r.attackerLoss).toBe(0);
  });
});
