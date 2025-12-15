import type { RNG } from "./rng";

export function rollD6(rng: RNG): number {
  return 1 + Math.floor(rng.next() * 6);
}

export function rollDice(rng: RNG, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rollD6(rng));
  return out;
}

export function compareDice(att: number[], def: number[]) {
  const a = [...att].sort((x, y) => y - x);
  const d = [...def].sort((x, y) => y - x);
  const pairs = Math.min(a.length, d.length);

  let attackerLoss = 0;
  let defenderLoss = 0;
  for (let i = 0; i < pairs; i++) {
    if (a[i] > d[i]) defenderLoss++;
    else attackerLoss++; // ties go to defender
  }
  return { attackerLoss, defenderLoss, aSorted: a, dSorted: d };
}
