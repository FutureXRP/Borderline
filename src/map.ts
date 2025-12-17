import type { Territory } from "./types";

export const TERRITORY_BY_ID: Record<string, Territory> = {
  A1: { id: "A1", name: "Territory A1", x: 50, y: 50, w: 100, h: 100, neighbors: ["A2", "B1"] },
  A2: { id: "A2", name: "Territory A2", x: 160, y: 50, w: 100, h: 100, neighbors: ["A1", "B2"] },
  B1: { id: "B1", name: "Territory B1", x: 50, y: 160, w: 100, h: 100, neighbors: ["A1", "B2"] },
  B2: { id: "B2", name: "Territory B2", x: 160, y: 160, w: 100, h: 100, neighbors: ["A2", "B1"] },
  // Add your real territories here later with a 'name' string for each
};

export const TERRITORIES = Object.values(TERRITORY_BY_ID);
