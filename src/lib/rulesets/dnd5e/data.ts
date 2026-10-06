import type { AbilityKey, ArmorItem, ClassDefinition, RaceDefinition, ShieldItem, SkillDefinition } from "@/types";

/** Content from the System Reference Document 5.1 (CC-BY-4.0). */

export interface SubclassDefinition5e {
  id: string;
  name: string;
}

export interface ClassDefinition5e extends ClassDefinition {
  savingThrows: readonly [AbilityKey, AbilityKey];
  /** Class level at which the subclass is chosen (1, 2 or 3). */
  subclassLevel: 1 | 2 | 3;
  subclassLabel: string;
  subclasses: readonly SubclassDefinition5e[];
  spellcastingAbility?: AbilityKey;
  /** Unarmored Defense: 10 + Dex + this ability when wearing no armor. */
  unarmoredDefense?: { ability: AbilityKey; allowsShield: boolean };
}

export const CLASSES_5E: readonly ClassDefinition5e[] = [
  {
    id: "barbarian", name: "Barbaro", hitDie: 12, source: "srd", savingThrows: ["str", "con"],
    subclassLevel: 3, subclassLabel: "Cammino primordiale",
    subclasses: [{ id: "berserker", name: "Cammino del Berserker" }],
    unarmoredDefense: { ability: "con", allowsShield: true },
  },
  {
    id: "bard", name: "Bardo", hitDie: 8, source: "srd", savingThrows: ["dex", "cha"],
    subclassLevel: 3, subclassLabel: "Collegio bardico",
    subclasses: [{ id: "lore", name: "Collegio della Sapienza" }], spellcastingAbility: "cha",
  },
  {
    id: "cleric", name: "Chierico", hitDie: 8, source: "srd", savingThrows: ["wis", "cha"],
    subclassLevel: 1, subclassLabel: "Dominio divino",
    subclasses: [{ id: "life", name: "Dominio della Vita" }], spellcastingAbility: "wis",
  },
  {
    id: "druid", name: "Druido", hitDie: 8, source: "srd", savingThrows: ["int", "wis"],
    subclassLevel: 2, subclassLabel: "Circolo druidico",
    subclasses: [{ id: "land", name: "Circolo della Terra" }], spellcastingAbility: "wis",
  },
  {
    id: "fighter", name: "Guerriero", hitDie: 10, source: "srd", savingThrows: ["str", "con"],
    subclassLevel: 3, subclassLabel: "Archetipo marziale",
    subclasses: [{ id: "champion", name: "Campione" }],
  },
  {
    id: "monk", name: "Monaco", hitDie: 8, source: "srd", savingThrows: ["str", "dex"],
    subclassLevel: 3, subclassLabel: "Tradizione monastica",
    subclasses: [{ id: "open-hand", name: "Via della Mano Aperta" }],
    unarmoredDefense: { ability: "wis", allowsShield: false },
  },
  {
    id: "paladin", name: "Paladino", hitDie: 10, source: "srd", savingThrows: ["wis", "cha"],
    subclassLevel: 3, subclassLabel: "Giuramento sacro",
    subclasses: [{ id: "devotion", name: "Giuramento di Devozione" }], spellcastingAbility: "cha",
  },
  {
    id: "ranger", name: "Ranger", hitDie: 10, source: "srd", savingThrows: ["str", "dex"],
    subclassLevel: 3, subclassLabel: "Archetipo del ranger",
    subclasses: [{ id: "hunter", name: "Cacciatore" }], spellcastingAbility: "wis",
  },
  {
    id: "rogue", name: "Ladro", hitDie: 8, source: "srd", savingThrows: ["dex", "int"],
    subclassLevel: 3, subclassLabel: "Archetipo ladresco",
    subclasses: [{ id: "thief", name: "Furfante" }],
  },
  {
    id: "sorcerer", name: "Stregone", hitDie: 6, source: "srd", savingThrows: ["con", "cha"],
    subclassLevel: 1, subclassLabel: "Origine stregonesca",
    subclasses: [{ id: "draconic", name: "Discendenza draconica" }], spellcastingAbility: "cha",
  },
  {
    id: "warlock", name: "Warlock", hitDie: 8, source: "srd", savingThrows: ["wis", "cha"],
    subclassLevel: 1, subclassLabel: "Patrono ultraterreno",
    subclasses: [{ id: "fiend", name: "L'Immondo" }], spellcastingAbility: "cha",
  },
  {
    id: "wizard", name: "Mago", hitDie: 6, source: "srd", savingThrows: ["int", "wis"],
    subclassLevel: 2, subclassLabel: "Tradizione arcana",
    subclasses: [{ id: "evocation", name: "Scuola di Invocazione" }], spellcastingAbility: "int",
  },
];

export const SKILLS_5E: readonly SkillDefinition[] = [
  { id: "acrobatics", name: "Acrobazia", ability: "dex" },
  { id: "animal-handling", name: "Addestrare Animali", ability: "wis" },
  { id: "arcana", name: "Arcano", ability: "int" },
  { id: "athletics", name: "Atletica", ability: "str" },
  { id: "deception", name: "Inganno", ability: "cha" },
  { id: "history", name: "Storia", ability: "int" },
  { id: "insight", name: "Intuizione", ability: "wis" },
  { id: "intimidation", name: "Intimidire", ability: "cha" },
  { id: "investigation", name: "Indagare", ability: "int" },
  { id: "medicine", name: "Medicina", ability: "wis" },
  { id: "nature", name: "Natura", ability: "int" },
  { id: "perception", name: "Percezione", ability: "wis" },
  { id: "performance", name: "Intrattenere", ability: "cha" },
  { id: "persuasion", name: "Persuasione", ability: "cha" },
  { id: "religion", name: "Religione", ability: "int" },
  { id: "sleight-of-hand", name: "Rapidità di Mano", ability: "dex" },
  { id: "stealth", name: "Furtività", ability: "dex" },
  { id: "survival", name: "Sopravvivenza", ability: "wis" },
];

export const RACES_5E: readonly RaceDefinition[] = [
  { id: "human", name: "Umano", size: "medium", speed: 30, source: "srd" },
  { id: "dwarf", name: "Nano", size: "medium", speed: 25, source: "srd" },
  { id: "elf", name: "Elfo", size: "medium", speed: 30, source: "srd" },
  { id: "halfling", name: "Halfling", size: "small", speed: 25, source: "srd" },
  { id: "gnome", name: "Gnomo", size: "small", speed: 25, source: "srd" },
  { id: "half-elf", name: "Mezzelfo", size: "medium", speed: 30, source: "srd" },
  { id: "half-orc", name: "Mezzorco", size: "medium", speed: 30, source: "srd" },
  { id: "dragonborn", name: "Dragonide", size: "medium", speed: 30, source: "srd" },
  { id: "tiefling", name: "Tiefling", size: "medium", speed: 30, source: "srd" },
];

type ArmorSeed = Pick<ArmorItem, "id" | "name" | "category" | "armorBonus" | "maxDex" | "weight"> &
  Partial<Pick<ArmorItem, "stealthDisadvantage" | "strengthRequirement">> & { gp: number };

function armor(seed: ArmorSeed): ArmorItem {
  const { gp, ...rest } = seed;
  return { ...rest, kind: "armor", editions: ["5e"], source: "srd", cost: { amount: gp, unit: "gp" }, quantity: 1, equipped: false };
}

/** armorBonus = base AC − 10, see ArmorItem. */
export const ARMOR_5E: readonly ArmorItem[] = [
  armor({ id: "5e-padded", name: "Imbottita", category: "light", armorBonus: 1, maxDex: null, weight: 8, gp: 5, stealthDisadvantage: true }),
  armor({ id: "5e-leather", name: "Cuoio", category: "light", armorBonus: 1, maxDex: null, weight: 10, gp: 10 }),
  armor({ id: "5e-studded-leather", name: "Cuoio borchiato", category: "light", armorBonus: 2, maxDex: null, weight: 13, gp: 45 }),
  armor({ id: "5e-hide", name: "Pelle", category: "medium", armorBonus: 2, maxDex: 2, weight: 12, gp: 10 }),
  armor({ id: "5e-chain-shirt", name: "Giaco di maglia", category: "medium", armorBonus: 3, maxDex: 2, weight: 20, gp: 50 }),
  armor({ id: "5e-scale-mail", name: "Corazza di scaglie", category: "medium", armorBonus: 4, maxDex: 2, weight: 45, gp: 50, stealthDisadvantage: true }),
  armor({ id: "5e-breastplate", name: "Corazza di piastre", category: "medium", armorBonus: 4, maxDex: 2, weight: 20, gp: 400 }),
  armor({ id: "5e-half-plate", name: "Mezza armatura", category: "medium", armorBonus: 5, maxDex: 2, weight: 40, gp: 750, stealthDisadvantage: true }),
  armor({ id: "5e-ring-mail", name: "Corazza ad anelli", category: "heavy", armorBonus: 4, maxDex: 0, weight: 40, gp: 30, stealthDisadvantage: true }),
  armor({ id: "5e-chain-mail", name: "Cotta di maglia", category: "heavy", armorBonus: 6, maxDex: 0, weight: 55, gp: 75, stealthDisadvantage: true, strengthRequirement: 13 }),
  armor({ id: "5e-splint", name: "Corazza a strisce", category: "heavy", armorBonus: 7, maxDex: 0, weight: 60, gp: 200, stealthDisadvantage: true, strengthRequirement: 15 }),
  armor({ id: "5e-plate", name: "Armatura completa", category: "heavy", armorBonus: 8, maxDex: 0, weight: 65, gp: 1500, stealthDisadvantage: true, strengthRequirement: 15 }),
];

export const SHIELDS_5E: readonly ShieldItem[] = [
  { id: "5e-shield", name: "Scudo", kind: "shield", shieldBonus: 2, editions: ["5e"], source: "srd", weight: 6, cost: { amount: 10, unit: "gp" }, quantity: 1, equipped: false },
];
