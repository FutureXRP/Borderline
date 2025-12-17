import type { GameConfig, GameState, PlayerId } from "../types";
import { TERRITORIES } from "../map";  // or "../maps" if you kept the name with "s"

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
  const ids = TERRITORIES.map((t: { id: string }) => t.id);  // explicit type for t
  const shuffled = shuffle(ids, rng);
  const ownerByTerritory: Record<string, PlayerId> = {};
  const unitsByTerritory: Record<string, number> = {};
  const capitalByPlayer: Record<PlayerId, string> = {};
  const pointsByPlayer: Record<PlayerId, number> = {};
  const ordersByPlayer: Record<PlayerId, any> = {};

  for (let p = 0 as PlayerId; p < config.playerCount; p++) {
    pointsByPlayer[p] = 0;
    ordersByPlayer[p] = [];
  }

  // Deal territories
  for (let i = 0; i < shuffled.length; i++) {
    const p = (i % config.playerCount) as PlayerId;
    const tid = shuffled[i] as string;  // explicit cast to string
    ownerByTerritory[tid] = p;
    unitsByTerritory[tid] = 2;
    if (capitalByPlayer[p] == null) capitalByPlayer[p] = tid;
  }

  // ... rest of your init code (supply, extra units, log, etc.)
}
