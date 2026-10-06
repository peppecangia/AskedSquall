import type { Character, CharacterSheet, ConversionResult, Edition, Ruleset, ValidationIssue } from "@/types";
import { ruleset35e } from "./dnd35e";
import { ruleset5e } from "./dnd5e";

export { ruleset5e, ruleset35e };

/** Registry of every edition. A new edition is one adapter plus one entry here. */
export const RULESETS: { [E in Edition]: Ruleset<E> } = {
  "5e": ruleset5e,
  "3.5e": ruleset35e,
};

export function getRuleset<E extends Edition>(edition: E): Ruleset<E> {
  return RULESETS[edition];
}

/** Dispatches on the character's own edition, keeping the narrowing type-safe. */
export function computeSheet(character: Character): CharacterSheet {
  return character.edition === "5e" ? ruleset5e.computeSheet(character) : ruleset35e.computeSheet(character);
}

export function validateCharacter(character: Character): ValidationIssue[] {
  return character.edition === "5e" ? ruleset5e.validate(character) : ruleset35e.validate(character);
}

export function convertCharacter(character: Character, target: Edition): ConversionResult<Character> {
  return target === "5e" ? ruleset5e.convertFrom(character) : ruleset35e.convertFrom(character);
}
