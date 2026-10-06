import type { DieSize, RollMode } from "@/types";

/** Random source returning a float in [0, 1). Injected so rolls stay testable. */
export type Rng = () => number;

export function rollDie(die: DieSize, rng: Rng): number {
  return Math.floor(rng() * die) + 1;
}

export interface D20Roll {
  mode: RollMode;
  rolls: number[];
  kept: number;
  modifier: number;
  total: number;
}

/** Picks the kept d20 for a roll mode (advantage keeps the highest, disadvantage the lowest). */
export function keptD20(mode: RollMode, rolls: readonly number[]): number {
  if (rolls.length === 0) throw new Error("keptD20 needs at least one roll");
  if (mode === "advantage") return Math.max(...rolls);
  if (mode === "disadvantage") return Math.min(...rolls);
  return rolls[0];
}

export function rollD20(mode: RollMode, modifier: number, rng: Rng): D20Roll {
  const count = mode === "normal" ? 1 : 2;
  const rolls = Array.from({ length: count }, () => rollDie(20, rng));
  const kept = keptD20(mode, rolls);
  return { mode, rolls, kept, modifier, total: kept + modifier };
}
