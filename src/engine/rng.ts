// Deterministic PRNG for reproducible tests & gameplay
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export type RNG = {
  next: () => number; // [0,1)
};

export function createRng(seed: number): RNG {
  const fn = mulberry32(seed);
  return { next: fn };
}
