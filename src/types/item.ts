import type { ContentSource, Cost, DieSize, Edition } from "./common";

interface ItemBase {
  id: string;
  name: string;
  description?: string;
  /** Editions whose rules this item's numbers are written for. */
  editions: readonly Edition[];
  source: ContentSource;
  weight: number;
  cost?: Cost;
  quantity: number;
  equipped: boolean;
}

export type ArmorCategory = "light" | "medium" | "heavy";

export interface ArmorItem extends ItemBase {
  kind: "armor";
  category: ArmorCategory;
  /**
   * Bonus over the base 10. 3.5e: the armor bonus. 5e: base AC minus 10
   * (e.g. chain mail 16 → 6), so both editions compute 10 + armorBonus + Dex.
   */
  armorBonus: number;
  /** Max Dex bonus to AC; null = unlimited. */
  maxDex: number | null;
  /** 3.5e armor check penalty (≤ 0). */
  checkPenalty?: number;
  /** 3.5e arcane spell failure, percent. */
  arcaneFailure?: number;
  /** 5e: disadvantage on Stealth. */
  stealthDisadvantage?: boolean;
  /** 5e: minimum Strength to avoid the speed penalty. */
  strengthRequirement?: number;
}

export interface ShieldItem extends ItemBase {
  kind: "shield";
  shieldBonus: number;
  maxDex?: number | null;
  checkPenalty?: number;
  arcaneFailure?: number;
}

export type DamageType = "bludgeoning" | "piercing" | "slashing";

export interface WeaponItem extends ItemBase {
  kind: "weapon";
  category: "simple" | "martial" | "exotic";
  range: "melee" | "ranged";
  damage: { count: number; die: DieSize; type: DamageType };
  /** 3.5e critical threat range and multiplier, e.g. 19-20/x2. */
  critical?: { range: number; multiplier: number };
  properties: readonly string[];
}

export interface GearItem extends ItemBase {
  kind: "gear";
}

export type Item = ArmorItem | ShieldItem | WeaponItem | GearItem;
export type ItemKind = Item["kind"];
