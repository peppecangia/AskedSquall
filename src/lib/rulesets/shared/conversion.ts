import type { Character, Edition, Item } from "@/types";

/** 5e skill id → the 3.5e skills it replaces. Used when moving a character between editions. */
export const SKILL_MAP_5E_TO_35E: Readonly<Record<string, readonly string[]>> = {
  acrobatics: ["tumble", "balance"],
  "animal-handling": ["handle-animal"],
  arcana: ["knowledge-arcana"],
  athletics: ["climb", "jump", "swim"],
  deception: ["bluff"],
  history: ["knowledge-history"],
  insight: ["sense-motive"],
  intimidation: ["intimidate"],
  investigation: ["search"],
  medicine: ["heal"],
  nature: ["knowledge-nature"],
  perception: ["spot", "listen"],
  performance: ["perform"],
  persuasion: ["diplomacy"],
  religion: ["knowledge-religion"],
  "sleight-of-hand": ["sleight-of-hand"],
  stealth: ["hide", "move-silently"],
  survival: ["survival"],
};

/** Fields every edition shares, copied as they are. */
export function sharedFields(character: Character) {
  return {
    id: character.id,
    name: character.name,
    playerName: character.playerName,
    alignment: character.alignment,
    abilities: { ...character.abilities },
    hitPoints: { current: character.hitPoints.current, temporary: character.hitPoints.temporary },
    spellIds: [] as string[],
    notes: character.notes,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  };
}

/** Keeps items written for the target edition and reports the others. */
export function partitionInventory(inventory: readonly Item[], target: Edition) {
  const kept = inventory.filter((item) => item.editions.includes(target));
  const dropped = inventory.filter((item) => !item.editions.includes(target));
  return { kept, dropped };
}
