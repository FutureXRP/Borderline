import type { GameState, Order, PlayerId } from "../types";
import { REGIONS } from "../regions";
import { TERRITORY_BY_ID } from "../map";
import { createRng } from "./rng";
import { rollDice, compareDice } from "./dice";
import { computeSuppliedByTerritory } from "./supply";

function keyAttack(o: Extract<Order, { type: "ATTACK" }>) {
  return `${o.playerId}|${o.fromId}|${o.toId}`;
}
function keyFortify(o: Extract<Order, { type: "FORTIFY" }>) {
  return `${o.playerId}|${o.fromId}|${o.toId}`;
}

function ownedCount(state: GameState, p: PlayerId): number {
  return Object.values(state.ownerByTerritory).filter((x) => x === p).length;
}

function controlledRegions(state: GameState, p: PlayerId): number {
  let count = 0;
  for (const r of REGIONS) {
    if (r.territoryIds.every((tid) => state.ownerByTerritory[tid] === p)) count++;
  }
  return count;
}

export function computeReinforcements(state: GameState, p: PlayerId): number {
  const base = 3;
  const bonus = controlledRegions(state, p); // 0..4
  return base + bonus;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function resolveRound(prev: GameState): GameState {
  if (prev.winner != null) return prev;

  const rng = createRng(prev.config.seed + prev.round * 1000);

  let state: GameState = {
    ...prev,
    log: [...prev.log, `\n=== ROUND ${prev.round} RESOLUTION ===`],
  };

  // 1) Compute supply at start of resolution
  state = {
    ...state,
    suppliedByTerritory: computeSuppliedByTerritory(state.ownerByTerritory, state.capitalByPlayer),
  };
  state.log.push(`Supply computed.`);

  // 2) Apply reinforcements (orders) within reinforce phase, player order
  for (let p = 0 as PlayerId; p < state.config.playerCount; p++) {
    const reinfBudget = computeReinforcements(state, p);
    let remaining = reinfBudget;

    const reinfOrders = (state.ordersByPlayer[p] ?? []).filter(
      (o): o is Extract<Order, { type: "REINFORCE" }> => o.type === "REINFORCE"
    );

    // Only allow placement on supplied territories (enforce again)
    for (const o of reinfOrders) {
      if (remaining <= 0) break;
      if (state.ownerByTerritory[o.territoryId] !== p) continue;
      if (!state.suppliedByTerritory[o.territoryId]) continue;

      const place = clamp(o.units, 0, remaining);
      state.unitsByTerritory[o.territoryId] += place;
      remaining -= place;
      state.log.push(`P${p + 1} reinforces ${o.territoryId} +${place} (remaining ${remaining}).`);
    }

    // If player didn't spend all reinforcements, auto-place remainder on capital (if supplied)
    if (remaining > 0) {
      const cap = state.capitalByPlayer[p];
      if (state.ownerByTerritory[cap] === p && state.suppliedByTerritory[cap]) {
        state.unitsByTerritory[cap] += remaining;
        state.log.push(`P${p + 1} auto-places ${remaining} on Capital ${cap}.`);
      }
    }
  }

  // 3) Resolve attacks in deterministic order:
  const allAttacks: Extract<Order, { type: "ATTACK" }>[] = [];
  for (let p = 0 as PlayerId; p < state.config.playerCount; p++) {
    for (const o of state.ordersByPlayer[p] ?? []) {
      if (o.type === "ATTACK") allAttacks.push(o);
    }
  }
  allAttacks.sort((a, b) => (keyAttack(a) < keyAttack(b) ? -1 : keyAttack(a) > keyAttack(b) ? 1 : 0));

  const capitalCapturedThisRound = new Set<string>(); // capital territoryIds captured (for scoring)
  for (const o of allAttacks) {
    const p = o.playerId;
    const from = o.fromId;
    const to = o.toId;

    // Validate live conditions at resolution time
    if (state.ownerByTerritory[from] !== p) continue;
    if (!state.suppliedByTerritory[from]) continue;
    if (state.ownerByTerritory[to] === p) continue;
    if (!TERRITORY_BY_ID[from].neighbors.includes(to)) continue;

    const fromUnits = state.unitsByTerritory[from];
    if (fromUnits < 2) continue;
    const maxDice = Math.min(3, fromUnits - 1);
    const attDiceCount = clamp(o.dice, 1, maxDice);

    const defOwner = state.ownerByTerritory[to];
    const defUnits = state.unitsByTerritory[to];
    const defDiceCount = clamp(defUnits >= 2 ? 2 : 1, 1, 2);

    const attRolls = rollDice(rng, attDiceCount);
    const defRolls = rollDice(rng, defDiceCount);
    const cmp = compareDice(attRolls, defRolls);

    state.unitsByTerritory[from] -= cmp.attackerLoss;
    state.unitsByTerritory[to] -= cmp.defenderLoss;

    state.log.push(
      `ATTACK P${p + 1} ${from}→${to} | att ${attRolls.join(",")} vs def ${defRolls.join(",")} | losses A-${cmp.attackerLoss} D-${cmp.defenderLoss}`
    );

    // Capture if defender dropped to 0
    if (state.unitsByTerritory[to] <= 0) {
      // Determine move-in (MVP auto-move = min(3, available) leaving 1 behind)
      const availableToMove = state.unitsByTerritory[from] - 1;
      const moveIn = clamp(Math.min(3, availableToMove), 1, Math.max(1, availableToMove));
      state.unitsByTerritory[from] -= moveIn;
      state.ownerByTerritory[to] = p;
      state.unitsByTerritory[to] = moveIn;

      state.log.push(`CAPTURE! P${p + 1} takes ${to} and moves in ${moveIn}.`);

      // Capital capture scoring (immediate, once per enemy capital)
      for (const [enemyStr, capTid] of Object.entries(state.capitalByPlayer)) {
        const enemy = Number(enemyStr) as PlayerId;
        if (enemy !== p && capTid === to) {
          if (!capitalCapturedThisRound.has(to)) {
            capitalCapturedThisRound.add(to);
            state.pointsByPlayer[p] += 1;
            state.log.push(`OBJECTIVE: P${p + 1} captured enemy Capital ${to} (+1 point).`);
          }
        }
      }
    }
  }

  // Recompute supply after attacks (because ownership changed)
  state = {
    ...state,
    suppliedByTerritory: computeSuppliedByTerritory(state.ownerByTerritory, state.capitalByPlayer),
  };
  state.log.push(`Supply recomputed after attacks.`);

  // 4) Resolve fortifies in deterministic order
  const allFortifies: Extract<Order, { type: "FORTIFY" }>[] = [];
  for (let p = 0 as PlayerId; p < state.config.playerCount; p++) {
    for (const o of state.ordersByPlayer[p] ?? []) {
      if (o.type === "FORTIFY") allFortifies.push(o);
    }
  }
  allFortifies.sort((a, b) => (keyFortify(a) < keyFortify(b) ? -1 : keyFortify(a) > keyFortify(b) ? 1 : 0));

  for (const o of allFortifies) {
    const p = o.playerId;
    const from = o.fromId;
    const to = o.toId;

    if (state.ownerByTerritory[from] !== p || state.ownerByTerritory[to] !== p) continue;
    if (!TERRITORY_BY_ID[from].neighbors.includes(to)) continue;

    const fromUnits = state.unitsByTerritory[from];
    const move = clamp(o.units, 0, fromUnits - 1);
    if (move <= 0) continue;

    state.unitsByTerritory[from] -= move;
    state.unitsByTerritory[to] += move;
    state.log.push(`FORTIFY P${p + 1} ${from}→${to} moves ${move}.`);
  }

  // 5) Scoring phase (end-of-round objectives)
  for (let p = 0 as PlayerId; p < state.config.playerCount; p++) {
    const tcount = ownedCount(state, p);
    const rcount = controlledRegions(state, p);

    if (tcount >= 10) {
      state.pointsByPlayer[p] += 1;
      state.log.push(`OBJECTIVE: P${p + 1} holds ${tcount} territories (>=10) (+1 point).`);
    }
    if (rcount >= 2) {
      state.pointsByPlayer[p] += 1;
      state.log.push(`OBJECTIVE: P${p + 1} controls ${rcount} regions (>=2) (+1 point).`);
    }
  }

  // Win check
  let winner: PlayerId | null = null;
  for (let p = 0 as PlayerId; p < state.config.playerCount; p++) {
    if (state.pointsByPlayer[p] >= 3) winner = p;
  }
  if (winner != null) {
    state.log.push(`\n🏁 WINNER: Player ${winner + 1} (3+ points).`);
  }

  // Prepare next round planning
  state = {
    ...state,
    round: state.round + 1,
    currentPlanner: 0,
    planningConfirmed: Array(state.config.playerCount).fill(false),
    ordersByPlayer: Object.fromEntries(
      Array.from({ length: state.config.playerCount }, (_, p) => [p, []])
    ) as Record<PlayerId, Order[]>,
    winner,
  };

  // Refresh supply for planning view
  state.suppliedByTerritory = computeSuppliedByTerritory(state.ownerByTerritory, state.capitalByPlayer);
  state.log.push(`\n=== ROUND ${state.round} PLANNING ===`);

  return state;
}
