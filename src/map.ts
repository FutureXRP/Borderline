import type { Territory } from "./types";

export type Territory = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  neighbors: string[];
};

export const TERRITORY_BY_ID: Record<string, Territory> = {
  // Replace or expand this with your actual map territories
  // This is a minimal example to get the build working
  A1: { id: "A1", x: 50, y: 50, w: 100, h: 100, neighbors: ["A2", "B1"] },
  A2: { id: "A2", x: 160, y: 50, w: 100, h: 100, neighbors: ["A1", "B2"] },
  B1: { id: "B1", x: 50, y: 160, w: 100, h: 100, neighbors: ["A1", "B2"] },
  B2: { id: "B2", x: 160, y: 160, w: 100, h: 100, neighbors: ["A2", "B1"] },
  // Add all your real territories here later
};

export const TERRITORIES = Object.values(TERRITORY_BY_ID);
