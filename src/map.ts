import type { Territory } from "./types";

/**
 * 24 territories in a 6x4 grid.
 * IDs: T01..T24
 * Neighbors: orthogonal adjacency
 */
export const TERRITORIES: Territory[] = (() => {
  const cols = 6;
  const rows = 4;

  const cellW = 120;
  const cellH = 90;
  const pad = 10;

  const list: Territory[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c + 1;
      const id = `T${String(idx).padStart(2, "0")}`;
      const name = `Territory ${idx}`;

      const neighbors: string[] = [];
      const left = c > 0 ? idx - 1 : null;
      const right = c < cols - 1 ? idx + 1 : null;
      const up = r > 0 ? idx - cols : null;
      const down = r < rows - 1 ? idx + cols : null;
      for (const n of [left, right, up, down]) {
        if (n != null) neighbors.push(`T${String(n).padStart(2, "0")}`);
      }

      list.push({
        id,
        name,
        neighbors,
        x: pad + c * cellW,
        y: pad + r * cellH,
        w: cellW - pad,
        h: cellH - pad,
      });
    }
  }
  return list;
})();

export const TERRITORY_BY_ID: Record<string, Territory> = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t])
);
