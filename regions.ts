import type { Region } from "./types";

/**
 * 4 regions, 6 territories each:
 * Region A: T01..T06
 * Region B: T07..T12
 * Region C: T13..T18
 * Region D: T19..T24
 */
export const REGIONS: Region[] = [
  { id: "A", name: "Northline", territoryIds: ["T01","T02","T03","T04","T05","T06"] },
  { id: "B", name: "Eastreach", territoryIds: ["T07","T08","T09","T10","T11","T12"] },
  { id: "C", name: "Southglen", territoryIds: ["T13","T14","T15","T16","T17","T18"] },
  { id: "D", name: "Westfall", territoryIds: ["T19","T20","T21","T22","T23","T24"] },
];
