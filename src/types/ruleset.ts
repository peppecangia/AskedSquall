import type { AbilityKey, DieSize, Edition, ModifierPart, Size } from "./common";
import type { Character, CharacterForEdition } from "./character";

export interface ClassDefinition {
  id: string;
  name: string;
  hitDie: DieSize;
  source: "srd" | "homebrew";
}

export interface SkillDefinition {
  id: string;
  name: string;
  ability: AbilityKey | null;
  /** 3.5e: can only be used with at least one rank. */
  trainedOnly?: boolean;
  /** 3.5e: armor check penalty applies (multiplier, 2 for Swim). */
  armorCheckPenalty?: number;
}

export interface RaceDefinition {
  id: string;
  name: string;
  size: Size;
  speed: number;
  /** 3.5e: extra skill points per level (×4 at 1st level). */
  bonusSkillPointsPerLevel?: number;
  source: "srd" | "homebrew";
}

/** A number on the sheet with the parts that make it up. */
export interface DerivedValue {
  total: number;
  parts: ModifierPart[];
}

export interface SheetAbility {
  key: AbilityKey;
  score: number;
  modifier: number;
}

export interface SheetSave {
  id: string;
  name: string;
  value: DerivedValue;
  proficient?: boolean;
}

export interface SheetSkill {
  id: string;
  name: string;
  ability: AbilityKey | null;
  value: DerivedValue;
  /** True when the character can use it (3.5e trained-only skills need ranks). */
  usable: boolean;
  tags: string[];
}

/** Edition-agnostic view model the UI renders. Every edition fills it from its own rules. */
export interface CharacterSheet {
  edition: Edition;
  totalLevel: number;
  abilities: SheetAbility[];
  armorClass: DerivedValue;
  /** Extra AC readings (3.5e touch / flat-footed). */
  armorClassVariants: { name: string; value: number }[];
  initiative: DerivedValue;
  hitPoints: { max: number; current: number; temporary: number };
  speed: number;
  /** 5e proficiency bonus or 3.5e base attack bonus. */
  attackBase: { name: string; value: number; display: string };
  meleeAttack: DerivedValue;
  rangedAttack: DerivedValue;
  saves: SheetSave[];
  skills: SheetSkill[];
  stats: { name: string; value: string }[];
}

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  path?: string;
}

export interface ConversionResult<C extends Character> {
  character: C;
  warnings: string[];
}

/**
 * The adapter every edition implements. All functions are pure:
 * same input, same output, no I/O, no UI.
 */
export interface Ruleset<E extends Edition = Edition> {
  edition: E;
  name: string;
  license: { name: string; url: string };
  classes: readonly ClassDefinition[];
  races: readonly RaceDefinition[];
  skills: readonly SkillDefinition[];
  createCharacter(seed: { id: string; name: string; now: string }): CharacterForEdition<E>;
  computeSheet(character: CharacterForEdition<E>): CharacterSheet;
  validate(character: CharacterForEdition<E>): ValidationIssue[];
  /** Brings a character from any edition into this one. */
  convertFrom(character: Character): ConversionResult<CharacterForEdition<E>>;
}
