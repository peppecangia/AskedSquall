/** Editions supported by the ruleset engine. Add new ids here to plug in a new edition. */
export const EDITIONS = ["5e", "3.5e"] as const;
export type Edition = (typeof EDITIONS)[number];

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];
export type AbilityScores = Record<AbilityKey, number>;

export const SIZES = [
  "fine",
  "diminutive",
  "tiny",
  "small",
  "medium",
  "large",
  "huge",
  "gargantuan",
  "colossal",
] as const;
export type Size = (typeof SIZES)[number];

export type DieSize = 4 | 6 | 8 | 10 | 12 | 20;

export type ContentSource = "srd" | "homebrew";

export type CoinUnit = "cp" | "sp" | "ep" | "gp" | "pp";
export interface Cost {
  amount: number;
  unit: CoinUnit;
}

/** One labelled contribution to a total, used to explain every derived number on the sheet. */
export interface ModifierPart {
  label: string;
  value: number;
}
