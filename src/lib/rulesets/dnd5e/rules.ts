import type {
  ArmorItem,
  Character5e,
  DerivedValue,
  ModifierPart,
  ProficiencyLevel,
  RollMode,
  ShieldItem,
} from "@/types";
import { ABILITY_NAMES, abilityModifier, derive } from "../shared/abilities";
import { averageHitDie, totalLevel } from "../shared/classes";
import { CLASSES_5E, type ClassDefinition5e, type SubclassDefinition5e } from "./data";

export function getClass5e(classId: string): ClassDefinition5e | undefined {
  return CLASSES_5E.find((entry) => entry.id === classId);
}

/** Proficiency bonus from total character level: +2 at 1–4, +3 at 5–8 … +6 at 17–20. */
export function proficiencyBonus(level: number): number {
  const clamped = Math.min(Math.max(level, 1), 20);
  return 2 + Math.floor((clamped - 1) / 4);
}

/**
 * Combines every source of advantage/disadvantage affecting one roll.
 * Any advantage plus any disadvantage cancel out, however many of each.
 */
export function combineRollModes(sources: readonly RollMode[]): RollMode {
  const hasAdvantage = sources.includes("advantage");
  const hasDisadvantage = sources.includes("disadvantage");
  if (hasAdvantage && !hasDisadvantage) return "advantage";
  if (hasDisadvantage && !hasAdvantage) return "disadvantage";
  return "normal";
}

export function proficiencyMultiplier(level: ProficiencyLevel): number {
  switch (level) {
    case "none":
      return 0;
    case "half":
      return 0.5;
    case "proficient":
      return 1;
    case "expertise":
      return 2;
  }
}

/** Bonus a proficiency level adds; half proficiency rounds down. */
export function proficiencyContribution(level: ProficiencyLevel, bonus: number): number {
  return Math.floor(proficiencyMultiplier(level) * bonus);
}

export interface SubclassSlot {
  classId: string;
  className: string;
  label: string;
  unlockLevel: number;
  unlocked: boolean;
  options: readonly SubclassDefinition5e[];
  selectedId?: string;
}

/** Which subclasses a character can (or will be able to) choose, per class. */
export function subclassSlots(character: Character5e): SubclassSlot[] {
  return character.classes.flatMap((entry) => {
    const definition = getClass5e(entry.classId);
    if (!definition) return [];
    return [
      {
        classId: entry.classId,
        className: definition.name,
        label: definition.subclassLabel,
        unlockLevel: definition.subclassLevel,
        unlocked: entry.level >= definition.subclassLevel,
        options: definition.subclasses,
        selectedId: entry.subclassId,
      },
    ];
  });
}

export function equippedArmor(character: Character5e): ArmorItem | undefined {
  return character.inventory.find((item): item is ArmorItem => item.kind === "armor" && item.equipped);
}

export function equippedShield(character: Character5e): ShieldItem | undefined {
  return character.inventory.find((item): item is ShieldItem => item.kind === "shield" && item.equipped);
}

/** AC = 10 + armor + Dex (capped by armor) + shield, or the best Unarmored Defense without armor. */
export function armorClass5e(character: Character5e): DerivedValue {
  const dex = abilityModifier(character.abilities.dex);
  const armor = equippedArmor(character);
  const shield = equippedShield(character);
  const shieldPart: ModifierPart = { label: shield?.name ?? "Scudo", value: shield?.shieldBonus ?? 0 };

  if (armor) {
    const dexPart = armor.maxDex === null ? dex : Math.min(dex, armor.maxDex);
    return derive([
      { label: "Base", value: 10 },
      { label: armor.name, value: armor.armorBonus },
      { label: "Destrezza", value: dexPart },
      shieldPart,
    ]);
  }

  const candidates: DerivedValue[] = [
    derive([{ label: "Base", value: 10 }, { label: "Destrezza", value: dex }, shieldPart]),
  ];
  for (const entry of character.classes) {
    const unarmored = getClass5e(entry.classId)?.unarmoredDefense;
    if (!unarmored || (shield && !unarmored.allowsShield)) continue;
    candidates.push(
      derive([
        { label: "Base", value: 10 },
        { label: "Destrezza", value: dex },
        { label: `Difesa senza armatura (${ABILITY_NAMES[unarmored.ability].short})`, value: abilityModifier(character.abilities[unarmored.ability]) },
        shieldPart,
      ]),
    );
  }
  return candidates.reduce((best, candidate) => (candidate.total > best.total ? candidate : best));
}

/** Max HP: full hit die at 1st level of the first class, then the fixed average; Con each level, min 1 per level. */
export function maxHitPoints5e(character: Character5e): number {
  if (character.hitPoints.maxOverride !== undefined) return character.hitPoints.maxOverride;
  const con = abilityModifier(character.abilities.con);
  let total = 0;
  character.classes.forEach((entry, index) => {
    const die = getClass5e(entry.classId)?.hitDie ?? 8;
    for (let level = 1; level <= entry.level; level += 1) {
      const roll = index === 0 && level === 1 ? die : averageHitDie(die);
      total += Math.max(1, roll + con);
    }
  });
  return total;
}

/** Saving throw proficiencies come from the starting (first) class only. */
export function savingThrowProficiencies(character: Character5e): readonly string[] {
  const first = character.classes[0];
  return first ? (getClass5e(first.classId)?.savingThrows ?? []) : [];
}

export function spellcastingClass(character: Character5e): ClassDefinition5e | undefined {
  for (const entry of character.classes) {
    const definition = getClass5e(entry.classId);
    if (definition?.spellcastingAbility) return definition;
  }
  return undefined;
}

export function characterLevel5e(character: Character5e): number {
  return totalLevel(character.classes);
}
