import type { GameState, Order, PlayerId } from "../types";
import { TERRITORY_BY_ID } from "../map";

export function validateOrder(state: GameState, order: Order): string | null {
  const p = order.playerId;

  if (state.winner != null) return "Game is over.";

  const orders = state.ordersByPlayer[p] ?? [];
  if (orders.length >= state.config.maxOrdersPerRound) return "Max orders reached.";

  const attackCount = orders.filter((o) => o.type === "ATTACK").length;
  if (order.type === "ATTACK" && attackCount >= state.config.maxAttackOrdersPerRound) {
    return "Only 1 attack order per round in MVP.";
  }

  switch (order.type) {
    case "REINFORCE": {
      if (order.units <= 0) return "Reinforce units must be > 0.";
      if (state.ownerByTerritory[order.territoryId] !== p) return "Must reinforce your territory.";
      if (!state.suppliedByTerritory[order.territoryId]) return "Territory is unsupplied.";
      return null;
    }
    case "ATTACK": {
      const from = order.fromId;
      const to = order.toId;
      if (from === to) return "Invalid attack.";
      if (state.ownerByTerritory[from] !== p) return "Must attack from your territory.";
      if (!state.suppliedByTerritory[from]) return "Cannot attack from unsupplied territory.";
      if (state.ownerByTerritory[to] === p) return "Cannot attack your own territory.";
      const terr = TERRITORY_BY_ID[from];
      if (!terr.neighbors.includes(to)) return "Can only attack neighbors.";
      const fromUnits = state.unitsByTerritory[from] ?? 0;
      if (fromUnits < 2) return "Need at least 2 units to attack (leave 1 behind).";
      if (order.dice < 1 || order.dice > 3) return "Invalid dice count.";
      const maxDice = Math.min(3, fromUnits - 1);
      if (order.dice > maxDice) return `Not enough units for ${order.dice} dice.`;
      return null;
    }
    case "FORTIFY": {
      const from = order.fromId;
      const to = order.toId;
      if (from === to) return "Invalid fortify.";
      if (state.ownerByTerritory[from] !== p || state.ownerByTerritory[to] !== p) {
        return "Fortify must be between your territories.";
      }
      const terr = TERRITORY_BY_ID[from];
      if (!terr.neighbors.includes(to)) return "Fortify must be adjacent in MVP.";
      const fromUnits = state.unitsByTerritory[from] ?? 0;
      if (order.units <= 0) return "Units must be > 0.";
      if (fromUnits - order.units < 1) return "Must leave at least 1 unit behind.";
      return null;
    }
  }
}

export function validateAllPlayersConfirmed(state: GameState): string | null {
  const n = state.config.playerCount;
  for (let p = 0 as PlayerId; p < n; p++) {
    if (!state.planningConfirmed[p]) return "Not all players have confirmed.";
  }
  return null;
}
