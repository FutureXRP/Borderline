import type { GameConfig, GameState, PlayerId } from "../types";
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
  const capitalByPlayer: Record<PlayerId, string> = {} as any;
  const pointsByPlayer: Record<PlayerId, number> = {} as any;
  const ordersByPlayer: Record<PlayerId, any> = {} as any;

  for (let p = 0 as PlayerId; p < config.playerCount; p++) {
    pointsByPlayer[p] = 0;
    ordersByPlayer[p] = [];
  }

  // Deal territories evenly
  for (let i = 0; i < shuffled.length; i++) {
    const p = (i % config.playerCount) as PlayerId;
    const tid = shuffled[i];
    ownerByTerritory[tid] = p;
    unitsByTerritory[tid] = 2; // initial 2 on each owned territory
    // first dealt becomes capital
    if (capitalByPlayer[p] == null) capitalByPlayer[p] = tid;
  }

  // Compute supply (initially all owned connected to capital? not necessarily; that's OK)
  let supplied = computeSuppliedByTerritory(ownerByTerritory, capitalByPlayer);

  // Give each player +6 extra units to place (only on supplied territories)
  for (let p = 0 as PlayerId; p < config.playerCount; p++) {
    let toPlace = 6;
    const cap = capitalByPlayer[p];
    if (supplied[cap]) {
      unitsByTerritory[cap] += toPlace;
      toPlace = 0;
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
      `Capitals: ${Object.entries(capitalByPlayer)
        .map(([p, t]) => `P${Number(p) + 1}:${t}`)
        .join(" | ")}`
    ],
    winner: null,
  };

  return state;
}
