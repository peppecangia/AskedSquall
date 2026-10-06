import type { AbilityScores, Edition, Size } from "./common";
import type { Item } from "./item";

export type RollMode = "normal" | "advantage" | "disadvantage";
export type ProficiencyLevel = "none" | "half" | "proficient" | "expertise";

interface CharacterBase {
  id: string;
  name: string;
  playerName?: string;
  raceId: string;
  alignment?: string;
  /** Final scores, racial adjustments already applied. */
  abilities: AbilityScores;
  hitPoints: {
    current: number;
    temporary: number;
    /** Overrides the computed maximum (e.g. rolled hit points). */
    maxOverride?: number;
  };
  inventory: Item[];
  spellIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassLevel5e {
  classId: string;
  level: number;
  subclassId?: string;
}

export interface Character5e extends CharacterBase {
  edition: "5e";
  /** Order matters: the first entry is the starting class (saving throw proficiencies). */
  classes: ClassLevel5e[];
  skillProficiencies: Record<string, ProficiencyLevel>;
  /** Global d20 toggle shown on the sheet. */
  rollMode: RollMode;
  inspiration: boolean;
}

export interface ClassLevel35e {
  classId: string;
  level: number;
}

export interface Character35e extends CharacterBase {
  edition: "3.5e";
  size: Size;
  classes: ClassLevel35e[];
  /** Ranks per skill id (half ranks allowed for cross-class skills). */
  skillRanks: Record<string, number>;
  featIds: string[];
  /** AC sources not coming from equipped items. */
  acModifiers: { natural: number; deflection: number; dodge: number; misc: number };
}

export type Character = Character5e | Character35e;
export type CharacterForEdition<E extends Edition> = Extract<Character, { edition: E }>;
