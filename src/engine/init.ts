import type { GameConfig, GameState, PlayerId, Order } from "../types";  // Added Order here
import { TERRITORIES } from "../map";
import { createRng } from "./rng";
import { computeSuppliedByTerritory } from "./supply";

function shuffle<T>(arr: T[], rng: { next: () => number }): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newGame(config: GameConfig): GameState {
  const rng = createRng(config.seed);
  const ids = TERRITORIES.map((t) => t.id);
  const shuffled = shuffle(ids, rng);

  const ownerByTerritory: Record<string, PlayerId> = {};
  const unitsByTerritory: Record<string, number> = {};
  const capitalByPlayer: Record<PlayerId, string> = {};
  const pointsByPlayer: Record<PlayerId, number> = {};
  const ordersByPlayer: Record<PlayerId, Order[]> = {};

  for (let p = 0 as PlayerId; p < config.playerCount; p++) {
    pointsByPlayer[p] = 0;
    ordersByPlayer[p] = [];
  }

  for (let i = 0; i < shuffled.length; i++) {
    const p = (i % config.playerCount) as PlayerId;
    const tid = shuffled[i];
    ownerByTerritory[tid] = p;
    unitsByTerritory[tid] = 2;
    if (capitalByPlayer[p] == null) capitalByPlayer[p] = tid;
  }

  let supplied = computeSuppliedByTerritory(ownerByTerritory, capitalByPlayer);

  for (let p = 0 as PlayerId; p < config.playerCount; p++) {
    let toPlace = 6;
    const cap = capitalByPlayer[p];
    if (supplied[cap]) {
      unitsByTerritory[cap] += toPlace;
    }
  }

  supplied = computeSuppliedByTerritory(ownerByTerritory, capitalByPlayer);

  const state: GameState = {
    config,
    round: 1,
    currentPlanner: 0,
    planningConfirmed: Array(config.playerCount).fill(false),
    ownerByTerritory,
    unitsByTerritory,
    capitalByPlayer,
    pointsByPlayer,
    ordersByPlayer,
    suppliedByTerritory: supplied,
    log: [
      "=== ROUND 1 PLANNING ===",
      `Players: ${config.playerCount}`,
      `Seed: ${config.seed}`,
    ],
    winner: null,
  };

  return state;
}
