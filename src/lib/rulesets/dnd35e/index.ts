import type { Character, Character35e, CharacterSheet, ModifierPart, Ruleset, SheetSkill, ValidationIssue } from "@/types";
import { ABILITY_KEYS } from "@/types";
import { ABILITY_NAMES, abilityModifier, derive, formatModifier } from "../shared/abilities";
import { SKILL_MAP_5E_TO_35E, partitionInventory, sharedFields } from "../shared/conversion";
import { CLASSES_35E, RACES_35E, SIZE_MODIFIERS, SKILLS_35E, type SaveId } from "./data";
import { FEATS_35E } from "./prerequisites";
import {
  arcaneSpellFailure,
  armorCheckPenalty,
  armorClass35e,
  availableFeats,
  availableSkillPoints,
  baseAttackBonus,
  baseSave,
  characterLevel35e,
  getClass35e,
  isClassSkill,
  iterativeAttacks,
  maxHitPoints35e,
  maxSkillRanks,
  spentSkillPoints,
  synergyBonuses,
  skillDefinition35e,
} from "./rules";

export * from "./data";
export * from "./prerequisites";
export * from "./rules";

const SAVES: readonly { id: SaveId; name: string; ability: "con" | "dex" | "wis"; featId: string }[] = [
  { id: "fort", name: "Tempra", ability: "con", featId: "great-fortitude" },
  { id: "ref", name: "Riflessi", ability: "dex", featId: "lightning-reflexes" },
  { id: "will", name: "Volontà", ability: "wis", featId: "iron-will" },
];

function computeSheet(character: Character35e): CharacterSheet {
  const level = characterLevel35e(character);
  const mod = (key: (typeof ABILITY_KEYS)[number]) => abilityModifier(character.abilities[key]);
  const bab = baseAttackBonus(character.classes);
  const size = SIZE_MODIFIERS[character.size];
  const ac = armorClass35e(character);
  const penalty = armorCheckPenalty(character);

  const skills: SheetSkill[] = SKILLS_35E.map((skill) => {
    const ranks = character.skillRanks[skill.id] ?? 0;
    const ability = skill.ability ?? "int";
    const synergies = synergyBonuses(character.skillRanks, skill.id);
    const parts: ModifierPart[] = [
      { label: "Gradi", value: ranks },
      { label: ABILITY_NAMES[ability].long, value: mod(ability) },
      ...synergies
        .filter((synergy) => !synergy.condition)
        .map((synergy) => ({ label: `Sinergia: ${skillDefinition35e(synergy.from)?.name ?? synergy.from}`, value: synergy.value })),
      { label: "Penalità armatura", value: skill.armorCheckPenalty ? penalty * skill.armorCheckPenalty : 0 },
      { label: "Taglia", value: skill.id === "hide" ? size.hide : 0 },
    ];
    const tags: string[] = [];
    if (isClassSkill(character, skill.id)) tags.push("Di classe");
    if (skill.trainedOnly) tags.push("Solo con addestramento");
    for (const synergy of synergies.filter((entry) => entry.condition)) {
      tags.push(`+2 ${synergy.condition} (${skillDefinition35e(synergy.from)?.name ?? synergy.from})`);
    }
    return {
      id: skill.id,
      name: skill.name,
      ability: skill.ability,
      value: derive(parts),
      usable: !skill.trainedOnly || ranks > 0,
      tags,
    };
  });

  const melee = derive([
    { label: "BAB", value: bab },
    { label: "Forza", value: mod("str") },
    { label: "Taglia", value: size.attackAndAc },
  ]);
  const ranged = derive([
    { label: "BAB", value: bab },
    { label: "Destrezza", value: mod("dex") },
    { label: "Taglia", value: size.attackAndAc },
  ]);
  const fmtAttacks = (modifier: number) => iterativeAttacks(bab, modifier).map(formatModifier).join("/");
  const race = RACES_35E.find((entry) => entry.id === character.raceId);
  const failure = arcaneSpellFailure(character);

  return {
    edition: "3.5e",
    totalLevel: level,
    abilities: ABILITY_KEYS.map((key) => ({ key, score: character.abilities[key], modifier: mod(key) })),
    armorClass: ac.total,
    armorClassVariants: [
      { name: "Contatto", value: ac.touch },
      { name: "Colto alla sprovvista", value: ac.flatFooted },
    ],
    initiative: derive([
      { label: "Destrezza", value: mod("dex") },
      { label: "Iniziativa Migliorata", value: character.featIds.includes("improved-initiative") ? 4 : 0 },
    ]),
    hitPoints: { max: maxHitPoints35e(character), current: character.hitPoints.current, temporary: character.hitPoints.temporary },
    speed: race?.speed ?? 30,
    attackBase: { name: "Bonus di attacco base", value: bab, display: iterativeAttacks(bab, 0).map(formatModifier).join("/") },
    meleeAttack: melee,
    rangedAttack: ranged,
    saves: SAVES.map((save) => ({
      id: save.id,
      name: save.name,
      value: derive([
        { label: "Base", value: baseSave(character.classes, save.id) },
        { label: ABILITY_NAMES[save.ability].long, value: mod(save.ability) },
        { label: FEATS_35E.find((feat) => feat.id === save.featId)?.name ?? save.featId, value: character.featIds.includes(save.featId) ? 2 : 0 },
      ]),
    })),
    skills,
    stats: [
      { name: "Attacchi in mischia", value: fmtAttacks(melee.total - bab) },
      { name: "Attacchi a distanza", value: fmtAttacks(ranged.total - bab) },
      { name: "Lotta", value: formatModifier(bab + mod("str") + size.grapple) },
      { name: "Taglia", value: size.name },
      { name: "Punti abilità", value: `${spentSkillPoints(character)} / ${availableSkillPoints(character)}` },
      { name: "Talenti", value: `${character.featIds.length} / ${availableFeats(character)}` },
      { name: "Penalità di armatura alla prova", value: String(penalty) },
      ...(failure > 0 ? [{ name: "Fallimento incantesimi arcani", value: `${failure}%` }] : []),
    ],
  };
}

function validate(character: Character35e): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const level = characterLevel35e(character);
  if (level < 1) issues.push({ severity: "error", message: "Serve almeno un livello di classe.", path: "classes" });
  for (const entry of character.classes) {
    if (!getClass35e(entry.classId)) issues.push({ severity: "error", message: `Classe sconosciuta: ${entry.classId}.`, path: "classes" });
  }

  const spent = spentSkillPoints(character);
  const available = availableSkillPoints(character);
  if (spent > available) {
    issues.push({ severity: "error", message: `Punti abilità spesi ${spent} su ${available} disponibili.`, path: "skillRanks" });
  }
  for (const [skillId, ranks] of Object.entries(character.skillRanks)) {
    const classSkill = isClassSkill(character, skillId);
    const max = maxSkillRanks(level, classSkill);
    const name = skillDefinition35e(skillId)?.name ?? skillId;
    if (ranks > max) {
      issues.push({ severity: "error", message: `${name}: ${ranks} gradi, massimo ${max} (${classSkill ? "di classe" : "fuori classe"}).`, path: `skillRanks.${skillId}` });
    }
    if (classSkill && !Number.isInteger(ranks)) {
      issues.push({ severity: "error", message: `${name}: i mezzi gradi valgono solo per le abilità fuori classe.`, path: `skillRanks.${skillId}` });
    }
  }

  if (character.featIds.length > availableFeats(character)) {
    issues.push({ severity: "warning", message: `Talenti scelti ${character.featIds.length} su ${availableFeats(character)} disponibili.`, path: "featIds" });
  }
  return issues;
}

function createCharacter(seed: { id: string; name: string; now: string }): Character35e {
  return {
    id: seed.id,
    name: seed.name,
    edition: "3.5e",
    raceId: "human",
    size: "medium",
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hitPoints: { current: 10, temporary: 0 },
    inventory: [],
    spellIds: [],
    notes: "",
    createdAt: seed.now,
    updatedAt: seed.now,
    classes: [{ classId: "fighter", level: 1 }],
    skillRanks: {},
    featIds: [],
    acModifiers: { natural: 0, deflection: 0, dodge: 0, misc: 0 },
  };
}

function convertFrom(character: Character): { character: Character35e; warnings: string[] } {
  if (character.edition === "3.5e") return { character, warnings: [] };
  const warnings: string[] = [];

  const classes = character.classes.flatMap((entry) => {
    if (getClass35e(entry.classId)) return [{ classId: entry.classId, level: entry.level }];
    warnings.push(`La classe "${entry.classId}" non esiste nell'SRD 3.5 ed è stata rimossa.`);
    return [];
  });
  if (classes.length === 0) classes.push({ classId: "fighter", level: 1 });
  if (character.classes.some((entry) => entry.subclassId)) warnings.push("Le sottoclassi 5e non esistono in 3.5e e sono state rimosse.");

  const race = RACES_35E.find((entry) => entry.id === character.raceId);
  if (!race) warnings.push(`Razza "${character.raceId}" non disponibile nell'SRD 3.5: impostata su Umano.`);

  const proficient = Object.entries(character.skillProficiencies).filter(([, level]) => level !== "none");
  if (proficient.length > 0) {
    const names = proficient.flatMap(([id]) => SKILL_MAP_5E_TO_35E[id] ?? []);
    warnings.push(`I gradi di abilità vanno assegnati a mano. Corrispondenze suggerite: ${names.map((id) => skillDefinition35e(id)?.name ?? id).join(", ")}.`);
  }

  const { kept, dropped } = partitionInventory(character.inventory, "3.5e");
  if (dropped.length > 0) warnings.push(`Oggetti scritti per la 5e rimossi: ${dropped.map((item) => item.name).join(", ")}.`);

  return {
    character: {
      ...sharedFields(character),
      edition: "3.5e",
      raceId: race?.id ?? "human",
      size: race?.size ?? "medium",
      inventory: kept,
      classes,
      skillRanks: {},
      featIds: [],
      acModifiers: { natural: 0, deflection: 0, dodge: 0, misc: 0 },
    },
    warnings,
  };
}

export const ruleset35e: Ruleset<"3.5e"> = {
  edition: "3.5e",
  name: "D&D 3.5e (SRD 3.5)",
  license: { name: "Open Game License v1.0a", url: "https://opengamingfoundation.org/ogl.html" },
  classes: CLASSES_35E,
  races: RACES_35E,
  skills: SKILLS_35E,
  createCharacter,
  computeSheet,
  validate,
  convertFrom,
};
