import type { ArmorItem, Character35e, DerivedValue, ShieldItem } from "@/types";
import { abilityModifier, derive } from "../shared/abilities";
import { averageHitDie, totalLevel } from "../shared/classes";
import {
  CLASSES_35E,
  RACES_35E,
  SIZE_MODIFIERS,
  SKILLS_35E,
  SYNERGIES_35E,
  type ClassDefinition35e,
  type Progression,
  type SaveId,
  type SaveProgression,
} from "./data";
import type { PrerequisiteContext } from "./prerequisites";

export function getClass35e(classId: string): ClassDefinition35e | undefined {
  return CLASSES_35E.find((entry) => entry.id === classId);
}

export function characterLevel35e(character: Character35e): number {
  return totalLevel(character.classes);
}

/** Base attack bonus for one class: good = level, average = ¾ level, poor = ½ level (rounded down). */
export function baseAttackForClass(progression: Progression, level: number): number {
  switch (progression) {
    case "good":
      return level;
    case "average":
      return Math.floor((level * 3) / 4);
    case "poor":
      return Math.floor(level / 2);
  }
}

/** Multiclass BAB: each class computed on its own levels, then added together (SRD rule). */
export function baseAttackBonus(classes: Character35e["classes"]): number {
  return classes.reduce((sum, entry) => {
    const definition = getClass35e(entry.classId);
    return sum + (definition ? baseAttackForClass(definition.bab, entry.level) : 0);
  }, 0);
}

/** Iterative attacks: an extra attack at −5 for each full 5 points of BAB above +1, up to four. */
export function iterativeAttacks(bab: number, modifier: number): number[] {
  const attacks: number[] = [];
  for (let base = bab; attacks.length < 4 && (attacks.length === 0 || base >= 1); base -= 5) {
    attacks.push(base + modifier);
  }
  return attacks;
}

/** Base save for one class: good = 2 + ½ level, poor = ⅓ level (rounded down). */
export function baseSaveForClass(progression: SaveProgression, level: number): number {
  return progression === "good" ? 2 + Math.floor(level / 2) : Math.floor(level / 3);
}

/** Multiclass base saves: each class computed separately and summed (SRD rule, good-save +2 stacks). */
export function baseSave(classes: Character35e["classes"], save: SaveId): number {
  return classes.reduce((sum, entry) => {
    const definition = getClass35e(entry.classId);
    return sum + (definition ? baseSaveForClass(definition.saves[save], entry.level) : 0);
  }, 0);
}

export function equippedArmor35e(character: Character35e): ArmorItem | undefined {
  return character.inventory.find((item): item is ArmorItem => item.kind === "armor" && item.equipped);
}

export function equippedShield35e(character: Character35e): ShieldItem | undefined {
  return character.inventory.find((item): item is ShieldItem => item.kind === "shield" && item.equipped);
}

/** Dex bonus to AC after armor and shield caps. */
export function effectiveDexToAc(character: Character35e): number {
  const dex = abilityModifier(character.abilities.dex);
  const caps = [equippedArmor35e(character)?.maxDex, equippedShield35e(character)?.maxDex].filter(
    (cap): cap is number => cap !== null && cap !== undefined,
  );
  return caps.length > 0 ? Math.min(dex, ...caps) : dex;
}

export interface ArmorClass35e {
  total: DerivedValue;
  touch: number;
  flatFooted: number;
}

/**
 * AC = 10 + armor + shield + Dex + size + natural + deflection + dodge + misc.
 * Touch drops armor, shield and natural armor; flat-footed drops positive Dex and dodge.
 */
export function armorClass35e(character: Character35e): ArmorClass35e {
  const armor = equippedArmor35e(character);
  const shield = equippedShield35e(character);
  const dex = effectiveDexToAc(character);
  const size = SIZE_MODIFIERS[character.size].attackAndAc;
  const { natural, deflection, dodge, misc } = character.acModifiers;

  const total = derive([
    { label: "Base", value: 10 },
    { label: armor ? `Armatura (${armor.name})` : "Armatura", value: armor?.armorBonus ?? 0 },
    { label: shield ? `Scudo (${shield.name})` : "Scudo", value: shield?.shieldBonus ?? 0 },
    { label: "Destrezza", value: dex },
    { label: "Taglia", value: size },
    { label: "Armatura naturale", value: natural },
    { label: "Deviazione", value: deflection },
    { label: "Schivare", value: dodge },
    { label: "Varie", value: misc },
  ]);
  const touch = 10 + dex + size + deflection + dodge + misc;
  const flatFooted = total.total - Math.max(dex, 0) - dodge;
  return { total, touch, flatFooted };
}

/** Armor check penalty from armor and shield combined (≤ 0). */
export function armorCheckPenalty(character: Character35e): number {
  return (equippedArmor35e(character)?.checkPenalty ?? 0) + (equippedShield35e(character)?.checkPenalty ?? 0);
}

export function arcaneSpellFailure(character: Character35e): number {
  return (equippedArmor35e(character)?.arcaneFailure ?? 0) + (equippedShield35e(character)?.arcaneFailure ?? 0);
}

/** A skill is a class skill if any of the character's classes lists it. */
export function isClassSkill(character: Character35e, skillId: string): boolean {
  return character.classes.some((entry) => getClass35e(entry.classId)?.classSkills.includes(skillId));
}

/** Max ranks: level + 3 for class skills, half that for cross-class skills. */
export function maxSkillRanks(characterLevel: number, classSkill: boolean): number {
  return classSkill ? characterLevel + 3 : (characterLevel + 3) / 2;
}

/** Skill points cost: 1 per rank for class skills, 2 per rank (half-rank steps) for cross-class. */
export function skillRankCost(ranks: number, classSkill: boolean): number {
  return classSkill ? ranks : ranks * 2;
}

/**
 * Skill points available: (class points + Int mod + racial bonus, min 1) per level,
 * ×4 at 1st character level, which is the first level of the first class listed.
 * Uses the current Int modifier for every level (no per-level Int history yet).
 */
export function availableSkillPoints(character: Character35e): number {
  const int = abilityModifier(character.abilities.int);
  const racial = RACES_35E.find((race) => race.id === character.raceId)?.bonusSkillPointsPerLevel ?? 0;
  let total = 0;
  character.classes.forEach((entry, index) => {
    const perLevel = Math.max(1, (getClass35e(entry.classId)?.skillPointsPerLevel ?? 2) + int + racial);
    for (let level = 1; level <= entry.level; level += 1) {
      total += index === 0 && level === 1 ? perLevel * 4 : perLevel;
    }
  });
  return total;
}

export function spentSkillPoints(character: Character35e): number {
  return Object.entries(character.skillRanks).reduce(
    (sum, [skillId, ranks]) => sum + skillRankCost(ranks, isClassSkill(character, skillId)),
    0,
  );
}

export interface SynergyBonus {
  from: string;
  value: number;
  condition?: string;
}

/** +2 from every skill with 5 or more ranks that has a synergy towards `skillId`. */
export function synergyBonuses(skillRanks: Readonly<Record<string, number>>, skillId: string): SynergyBonus[] {
  return SYNERGIES_35E.filter((synergy) => synergy.to === skillId && (skillRanks[synergy.from] ?? 0) >= 5).map(
    (synergy) => ({ from: synergy.from, value: 2, condition: synergy.condition }),
  );
}

/** Feats available: 1 + 1 every 3 levels, +1 for humans, plus Fighter bonus feats. */
export function availableFeats(character: Character35e): number {
  const level = characterLevel35e(character);
  if (level < 1) return 0;
  const human = character.raceId === "human" ? 1 : 0;
  const bonus = character.classes.reduce(
    (sum, entry) => sum + (getClass35e(entry.classId)?.bonusFeats?.(entry.level) ?? 0),
    0,
  );
  return 1 + Math.floor(level / 3) + human + bonus;
}

/** Max HP: full hit die at 1st level, average (rounded up) afterwards, Con each level, min 1 per level. */
export function maxHitPoints35e(character: Character35e): number {
  if (character.hitPoints.maxOverride !== undefined) return character.hitPoints.maxOverride;
  const con = abilityModifier(character.abilities.con);
  let total = character.featIds.includes("toughness") ? 3 : 0;
  character.classes.forEach((entry, index) => {
    const die = getClass35e(entry.classId)?.hitDie ?? 8;
    for (let level = 1; level <= entry.level; level += 1) {
      total += Math.max(1, (index === 0 && level === 1 ? die : averageHitDie(die)) + con);
    }
  });
  return total;
}

export function prerequisiteContext(character: Character35e): PrerequisiteContext {
  const classLevels: Record<string, number> = {};
  for (const entry of character.classes) classLevels[entry.classId] = (classLevels[entry.classId] ?? 0) + entry.level;
  return {
    abilities: character.abilities,
    bab: baseAttackBonus(character.classes),
    skillRanks: character.skillRanks,
    featIds: character.featIds,
    characterLevel: characterLevel35e(character),
    classLevels,
    raceId: character.raceId,
  };
}

export function skillDefinition35e(skillId: string) {
  return SKILLS_35E.find((skill) => skill.id === skillId);
}
