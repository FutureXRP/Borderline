export type PlayerId = number;

export type Territory = {
  id: string;
  name: string;  // Added the missing 'name' property (required by your type)
  x: number;
  y: number;
  w: number;
  h: number;
  neighbors: string[];
};

export type Order =
  | { type: "REINFORCE"; playerId: PlayerId; territoryId: string; units: number }
  | { type: "ATTACK"; playerId: PlayerId; fromId: string; toId: string; dice: 1 | 2 | 3 }
  | { type: "FORTIFY"; playerId: PlayerId; fromId: string; toId: string; units: number };

export type GameConfig = {
  playerCount: number;
  seed: number;
  maxOrdersPerRound: number;
  maxAttackOrdersPerRound: number;
};

export type GameState = {
  config: GameConfig;
  round: number;
  currentPlanner: PlayerId;
  planningConfirmed: boolean[];
  ownerByTerritory: Record<string, PlayerId>;
  unitsByTerritory: Record<string, number>;
  suppliedByTerritory: Record<string, boolean>;
  capitalByPlayer: Record<PlayerId, string>;
  pointsByPlayer: Record<PlayerId, number>;
  ordersByPlayer: Record<PlayerId, Order[]>;
  log: string[];
  winner: PlayerId | null;
};
