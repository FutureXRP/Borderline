import type { PlayerId } from "../types";
import { TERRITORY_BY_ID } from "../map";

export function computeSuppliedByTerritory(
  ownerByTerritory: Record<string, PlayerId>,
  capitalByPlayer: Record<PlayerId, string>
): Record<string, boolean> {
  const supplied: Record<string, boolean> = {};
  for (const tid of Object.keys(ownerByTerritory)) supplied[tid] = false;

  const players = Object.keys(capitalByPlayer).map((k) => Number(k) as PlayerId);

  for (const p of players) {
    const cap = capitalByPlayer[p];
    // BFS through player's owned territories
    const q: string[] = [cap];
    const seen = new Set<string>();
    while (q.length) {
      const cur = q.shift()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      supplied[cur] = true;

      const terr = TERRITORY_BY_ID[cur];
      for (const nb of terr.neighbors) {
        if (ownerByTerritory[nb] === p && !seen.has(nb)) q.push(nb);
      }
    }
  }
  return supplied;
}
