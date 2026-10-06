import type { AbilityKey, ModifierPart } from "@/types";

export const ABILITY_NAMES: Record<AbilityKey, { short: string; long: string }> = {
  str: { short: "FOR", long: "Forza" },
  dex: { short: "DES", long: "Destrezza" },
  con: { short: "COS", long: "Costituzione" },
  int: { short: "INT", long: "Intelligenza" },
  wis: { short: "SAG", long: "Saggezza" },
  cha: { short: "CAR", long: "Carisma" },
};

/** Same formula in 3.5e and 5e. */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function sumParts(parts: readonly ModifierPart[]): number {
  return parts.reduce((total, part) => total + part.value, 0);
}

/** Builds a DerivedValue-shaped object, dropping zero parts except the first (the base). */
export function derive(parts: readonly ModifierPart[]): { total: number; parts: ModifierPart[] } {
  const kept = parts.filter((part, index) => index === 0 || part.value !== 0);
  return { total: sumParts(parts), parts: kept };
}
