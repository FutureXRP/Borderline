import { describe, it, expect } from "vitest";
import type { GameState } from "../types";
import { newGame } from "../engine/init";
import { resolveRound } from "../engine/resolve";

describe("resolveRound determinism", () => {
  it("is deterministic for same seed", () => {
    const base = newGame({ playerCount: 2, seed: 1234, maxOrdersPerRound: 3, maxAttackOrdersPerRound: 1 });

    // force clean consistent state
    const s1: GameState = {
      ...base,
      // ensure capitals owned and units exist
      ordersByPlayer: {
        0: [{ type: "REINFORCE", playerId: 0, territoryId: base.capitalByPlayer[0], units: 3 }],
        1: [{ type: "REINFORCE", playerId: 1, territoryId: base.capitalByPlayer[1], units: 3 }],
      } as any,
      planningConfirmed: [true, true],
    };

    const a = resolveRound(s1);
    const b = resolveRound(s1);

    expect(a.ownerByTerritory).toEqual(b.ownerByTerritory);
    expect(a.unitsByTerritory).toEqual(b.unitsByTerritory);
    expect(a.pointsByPlayer).toEqual(b.pointsByPlayer);
  });
});
