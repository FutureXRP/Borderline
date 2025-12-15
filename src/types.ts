export type PlayerId = number; // 0..n-1

export type Order =
  | { type: "REINFORCE"; playerId: PlayerId; territoryId: string; units: number }
  | { type: "ATTACK"; playerId: PlayerId; fromId: string; toId: string; dice: 1 | 2 | 3 }
  | { type: "FORTIFY"; playerId: PlayerId; fromId: string; toId: string; units: number };

export type Territory = {
  id: string;
  name: string;
  neighbors: string[];
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Region = {
  id: string;
  name: string;
  territoryIds: string[];
};

export type GameConfig = {
  playerCount: number;
  seed: number;
  maxOrdersPerRound: number; // 3
  maxAttackOrdersPerRound: number; // 1
};

export type GameState = {
  config: GameConfig;

  round: number;
  currentPlanner: PlayerId; // whose turn to plan (hotseat)
  planningConfirmed: boolean[]; // per player

  ownerByTerritory: Record<string, PlayerId>;
  unitsByTerritory: Record<string, number>;

  capitalByPlayer: Record<PlayerId, string>;
  pointsByPlayer: Record<PlayerId, number>;

  ordersByPlayer: Record<PlayerId, Order[]>;
  suppliedByTerritory: Record<string, boolean>; // computed for current planner view (updated frequently)

  log: string[];
  winner: PlayerId | null;
};
