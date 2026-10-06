import type { Character, Character5e, CharacterSheet, Ruleset, SheetSkill, ValidationIssue } from "@/types";
import { ABILITY_KEYS } from "@/types";
import { ABILITY_NAMES, abilityModifier, derive, formatModifier } from "../shared/abilities";
import { SKILL_MAP_5E_TO_35E, partitionInventory, sharedFields } from "../shared/conversion";
import { CLASSES_5E, RACES_5E, SKILLS_5E } from "./data";
import {
  armorClass5e,
  characterLevel5e,
  equippedArmor,
  getClass5e,
  maxHitPoints5e,
  proficiencyBonus,
  proficiencyContribution,
  savingThrowProficiencies,
  spellcastingClass,
  subclassSlots,
} from "./rules";

export * from "./data";
export * from "./rules";

function computeSheet(character: Character5e): CharacterSheet {
  const level = characterLevel5e(character);
  const prof = proficiencyBonus(level);
  const mod = (key: (typeof ABILITY_KEYS)[number]) => abilityModifier(character.abilities[key]);
  const saveProfs = savingThrowProficiencies(character);
  const armor = equippedArmor(character);

  const skills: SheetSkill[] = SKILLS_5E.map((skill) => {
    const level = character.skillProficiencies[skill.id] ?? "none";
    const ability = skill.ability ?? "str";
    const tags: string[] = [];
    if (level === "expertise") tags.push("Maestria");
    if (skill.id === "stealth" && armor?.stealthDisadvantage) tags.push("Svantaggio (armatura)");
    return {
      id: skill.id,
      name: skill.name,
      ability: skill.ability,
      value: derive([
        { label: ABILITY_NAMES[ability].long, value: mod(ability) },
        { label: "Competenza", value: proficiencyContribution(level, prof) },
      ]),
      usable: true,
      tags,
    };
  });

  const perception = skills.find((skill) => skill.id === "perception")?.value.total ?? mod("wis");
  const caster = spellcastingClass(character);
  const stats: CharacterSheet["stats"] = [{ name: "Percezione passiva", value: String(10 + perception) }];
  if (caster?.spellcastingAbility) {
    const casting = mod(caster.spellcastingAbility);
    stats.push(
      { name: `CD tiri salvezza incantesimi (${caster.name})`, value: String(8 + prof + casting) },
      { name: "Bonus attacco con incantesimi", value: formatModifier(prof + casting) },
    );
  }
  const heavyPenalty = armor?.strengthRequirement && character.abilities.str < armor.strengthRequirement ? 10 : 0;
  if (heavyPenalty > 0) stats.push({ name: "Velocità ridotta", value: "−10 piedi (Forza insufficiente per l'armatura)" });

  const race = RACES_5E.find((entry) => entry.id === character.raceId);
  return {
    edition: "5e",
    totalLevel: level,
    abilities: ABILITY_KEYS.map((key) => ({ key, score: character.abilities[key], modifier: mod(key) })),
    armorClass: armorClass5e(character),
    armorClassVariants: [],
    initiative: derive([{ label: "Destrezza", value: mod("dex") }]),
    hitPoints: { max: maxHitPoints5e(character), current: character.hitPoints.current, temporary: character.hitPoints.temporary },
    speed: (race?.speed ?? 30) - heavyPenalty,
    attackBase: { name: "Bonus di competenza", value: prof, display: formatModifier(prof) },
    meleeAttack: derive([{ label: "Forza", value: mod("str") }, { label: "Competenza", value: prof }]),
    rangedAttack: derive([{ label: "Destrezza", value: mod("dex") }, { label: "Competenza", value: prof }]),
    saves: ABILITY_KEYS.map((key) => {
      const proficient = saveProfs.includes(key);
      return {
        id: key,
        name: ABILITY_NAMES[key].long,
        proficient,
        value: derive([
          { label: ABILITY_NAMES[key].long, value: mod(key) },
          { label: "Competenza", value: proficient ? prof : 0 },
        ]),
      };
    }),
    skills,
    stats,
  };
}

function validate(character: Character5e): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const level = characterLevel5e(character);
  if (level < 1) issues.push({ severity: "error", message: "Serve almeno un livello di classe.", path: "classes" });
  if (level > 20) issues.push({ severity: "error", message: "Il livello totale massimo in 5e è 20.", path: "classes" });
  for (const entry of character.classes) {
    if (!getClass5e(entry.classId)) issues.push({ severity: "error", message: `Classe sconosciuta: ${entry.classId}.`, path: "classes" });
  }
  for (const slot of subclassSlots(character)) {
    if (slot.unlocked && !slot.selectedId) {
      issues.push({ severity: "warning", message: `${slot.className}: scegli ${slot.label.toLowerCase()} (livello ${slot.unlockLevel}).`, path: "classes" });
    }
  }
  for (const key of ABILITY_KEYS) {
    const score = character.abilities[key];
    if (score < 1 || score > 30) issues.push({ severity: "error", message: `${ABILITY_NAMES[key].long} deve essere tra 1 e 30.`, path: `abilities.${key}` });
  }
  return issues;
}

function createCharacter(seed: { id: string; name: string; now: string }): Character5e {
  return {
    id: seed.id,
    name: seed.name,
    edition: "5e",
    raceId: "human",
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hitPoints: { current: 8, temporary: 0 },
    inventory: [],
    spellIds: [],
    notes: "",
    createdAt: seed.now,
    updatedAt: seed.now,
    classes: [{ classId: "fighter", level: 1 }],
    skillProficiencies: {},
    rollMode: "normal",
    inspiration: false,
  };
}

function convertFrom(character: Character): { character: Character5e; warnings: string[] } {
  if (character.edition === "5e") return { character, warnings: [] };
  const warnings: string[] = [];

  const classes = character.classes.flatMap((entry) => {
    if (getClass5e(entry.classId)) return [{ classId: entry.classId, level: entry.level }];
    warnings.push(`La classe "${entry.classId}" non esiste in 5e ed è stata rimossa.`);
    return [];
  });
  if (classes.length === 0) classes.push({ classId: "fighter", level: 1 });
  let excess = classes.reduce((sum, entry) => sum + entry.level, 0) - 20;
  if (excess > 0) {
    warnings.push("Livello totale oltre 20: ridotto al massimo della 5e.");
    for (let i = classes.length - 1; i >= 0 && excess > 0; i -= 1) {
      const cut = Math.min(excess, classes[i].level - 1);
      classes[i].level -= cut;
      excess -= cut;
    }
  }

  const raceId = RACES_5E.some((race) => race.id === character.raceId) ? character.raceId : "human";
  if (raceId !== character.raceId) warnings.push(`Razza "${character.raceId}" non disponibile: impostata su Umano.`);

  const skillProficiencies: Character5e["skillProficiencies"] = {};
  for (const [skill5e, skills35e] of Object.entries(SKILL_MAP_5E_TO_35E)) {
    if (skills35e.some((id) => (character.skillRanks[id] ?? 0) >= 1)) skillProficiencies[skill5e] = "proficient";
  }
  if (Object.keys(skillProficiencies).length > 0) {
    warnings.push("Competenze nelle abilità dedotte dai gradi 3.5e: controlla che rispettino le scelte di classe.");
  }
  if (character.featIds.length > 0) warnings.push("I talenti 3.5e non sono stati convertiti.");

  const { kept, dropped } = partitionInventory(character.inventory, "5e");
  if (dropped.length > 0) warnings.push(`Oggetti scritti per la 3.5e rimossi: ${dropped.map((item) => item.name).join(", ")}.`);

  return {
    character: {
      ...sharedFields(character),
      edition: "5e",
      raceId,
      inventory: kept,
      classes,
      skillProficiencies,
      rollMode: "normal",
      inspiration: false,
    },
    warnings,
  };
}

export const ruleset5e: Ruleset<"5e"> = {
  edition: "5e",
  name: "D&D 5e (SRD 5.1)",
  license: { name: "Creative Commons CC-BY-4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
  classes: CLASSES_5E,
  races: RACES_5E,
  skills: SKILLS_5E,
  createCharacter,
  computeSheet,
  validate,
  convertFrom,
};
