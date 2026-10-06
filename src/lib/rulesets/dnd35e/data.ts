import type { ArmorItem, ClassDefinition, RaceDefinition, ShieldItem, Size, SkillDefinition } from "@/types";

/** Content from the System Reference Document 3.5 (Open Game License v1.0a). */

export type Progression = "good" | "average" | "poor";
export type SaveProgression = "good" | "poor";
export type SaveId = "fort" | "ref" | "will";

export interface ClassDefinition35e extends ClassDefinition {
  bab: Progression;
  saves: Record<SaveId, SaveProgression>;
  skillPointsPerLevel: number;
  classSkills: readonly string[];
  /** Bonus feats granted by class level (Fighter). */
  bonusFeats?: (classLevel: number) => number;
  prestige?: false;
}

const KNOWLEDGE_IDS = [
  "knowledge-arcana",
  "knowledge-architecture",
  "knowledge-dungeoneering",
  "knowledge-geography",
  "knowledge-history",
  "knowledge-local",
  "knowledge-nature",
  "knowledge-nobility",
  "knowledge-religion",
  "knowledge-planes",
] as const;

export const SKILLS_35E: readonly SkillDefinition[] = [
  { id: "appraise", name: "Valutare", ability: "int" },
  { id: "balance", name: "Equilibrio", ability: "dex", armorCheckPenalty: 1 },
  { id: "bluff", name: "Raggirare", ability: "cha" },
  { id: "climb", name: "Scalare", ability: "str", armorCheckPenalty: 1 },
  { id: "concentration", name: "Concentrazione", ability: "con" },
  { id: "craft", name: "Artigianato", ability: "int" },
  { id: "decipher-script", name: "Decifrare Scritture", ability: "int", trainedOnly: true },
  { id: "diplomacy", name: "Diplomazia", ability: "cha" },
  { id: "disable-device", name: "Disattivare Congegni", ability: "int", trainedOnly: true },
  { id: "disguise", name: "Camuffare", ability: "cha" },
  { id: "escape-artist", name: "Artista della Fuga", ability: "dex", armorCheckPenalty: 1 },
  { id: "forgery", name: "Falsificare", ability: "int" },
  { id: "gather-information", name: "Raccogliere Informazioni", ability: "cha" },
  { id: "handle-animal", name: "Addestrare Animali", ability: "cha", trainedOnly: true },
  { id: "heal", name: "Guarire", ability: "wis" },
  { id: "hide", name: "Nascondersi", ability: "dex", armorCheckPenalty: 1 },
  { id: "intimidate", name: "Intimidire", ability: "cha" },
  { id: "jump", name: "Saltare", ability: "str", armorCheckPenalty: 1 },
  { id: "knowledge-arcana", name: "Conoscenze (arcane)", ability: "int", trainedOnly: true },
  { id: "knowledge-architecture", name: "Conoscenze (architettura e ingegneria)", ability: "int", trainedOnly: true },
  { id: "knowledge-dungeoneering", name: "Conoscenze (dungeon)", ability: "int", trainedOnly: true },
  { id: "knowledge-geography", name: "Conoscenze (geografia)", ability: "int", trainedOnly: true },
  { id: "knowledge-history", name: "Conoscenze (storia)", ability: "int", trainedOnly: true },
  { id: "knowledge-local", name: "Conoscenze (locali)", ability: "int", trainedOnly: true },
  { id: "knowledge-nature", name: "Conoscenze (natura)", ability: "int", trainedOnly: true },
  { id: "knowledge-nobility", name: "Conoscenze (nobiltà e regalità)", ability: "int", trainedOnly: true },
  { id: "knowledge-religion", name: "Conoscenze (religioni)", ability: "int", trainedOnly: true },
  { id: "knowledge-planes", name: "Conoscenze (piani)", ability: "int", trainedOnly: true },
  { id: "listen", name: "Ascoltare", ability: "wis" },
  { id: "move-silently", name: "Muoversi Silenziosamente", ability: "dex", armorCheckPenalty: 1 },
  { id: "open-lock", name: "Scassinare Serrature", ability: "dex", trainedOnly: true },
  { id: "perform", name: "Intrattenere", ability: "cha" },
  { id: "profession", name: "Professione", ability: "wis", trainedOnly: true },
  { id: "ride", name: "Cavalcare", ability: "dex" },
  { id: "search", name: "Cercare", ability: "int" },
  { id: "sense-motive", name: "Percepire Intenzioni", ability: "wis" },
  { id: "sleight-of-hand", name: "Rapidità di Mano", ability: "dex", trainedOnly: true, armorCheckPenalty: 1 },
  { id: "spellcraft", name: "Sapienza Magica", ability: "int", trainedOnly: true },
  { id: "spot", name: "Osservare", ability: "wis" },
  { id: "survival", name: "Sopravvivenza", ability: "wis" },
  { id: "swim", name: "Nuotare", ability: "str", armorCheckPenalty: 2 },
  { id: "tumble", name: "Acrobazia", ability: "dex", trainedOnly: true, armorCheckPenalty: 1 },
  { id: "use-magic-device", name: "Utilizzare Oggetti Magici", ability: "cha", trainedOnly: true },
  { id: "use-rope", name: "Utilizzare Corde", ability: "dex" },
];

export const CLASSES_35E: readonly ClassDefinition35e[] = [
  {
    id: "barbarian", name: "Barbaro", hitDie: 12, source: "srd", bab: "good",
    saves: { fort: "good", ref: "poor", will: "poor" }, skillPointsPerLevel: 4,
    classSkills: ["climb", "craft", "handle-animal", "intimidate", "jump", "listen", "ride", "survival", "swim"],
  },
  {
    id: "bard", name: "Bardo", hitDie: 6, source: "srd", bab: "average",
    saves: { fort: "poor", ref: "good", will: "good" }, skillPointsPerLevel: 6,
    classSkills: [
      "appraise", "balance", "bluff", "climb", "concentration", "craft", "decipher-script", "diplomacy", "disguise",
      "escape-artist", "gather-information", "hide", "jump", ...KNOWLEDGE_IDS, "listen", "move-silently", "perform",
      "profession", "sense-motive", "sleight-of-hand", "spellcraft", "swim", "tumble", "use-magic-device",
    ],
  },
  {
    id: "cleric", name: "Chierico", hitDie: 8, source: "srd", bab: "average",
    saves: { fort: "good", ref: "poor", will: "good" }, skillPointsPerLevel: 2,
    classSkills: [
      "concentration", "craft", "diplomacy", "heal", "knowledge-arcana", "knowledge-history", "knowledge-religion",
      "knowledge-planes", "profession", "spellcraft",
    ],
  },
  {
    id: "druid", name: "Druido", hitDie: 8, source: "srd", bab: "average",
    saves: { fort: "good", ref: "poor", will: "good" }, skillPointsPerLevel: 4,
    classSkills: [
      "concentration", "craft", "diplomacy", "handle-animal", "heal", "knowledge-nature", "listen", "profession",
      "ride", "spellcraft", "spot", "survival", "swim",
    ],
  },
  {
    id: "fighter", name: "Guerriero", hitDie: 10, source: "srd", bab: "good",
    saves: { fort: "good", ref: "poor", will: "poor" }, skillPointsPerLevel: 2,
    classSkills: ["climb", "craft", "handle-animal", "intimidate", "jump", "ride", "swim"],
    bonusFeats: (level) => (level >= 1 ? 1 + Math.floor(level / 2) : 0),
  },
  {
    id: "monk", name: "Monaco", hitDie: 8, source: "srd", bab: "average",
    saves: { fort: "good", ref: "good", will: "good" }, skillPointsPerLevel: 4,
    classSkills: [
      "balance", "climb", "concentration", "craft", "diplomacy", "escape-artist", "hide", "jump", "knowledge-arcana",
      "knowledge-religion", "listen", "move-silently", "perform", "profession", "sense-motive", "spot", "swim", "tumble",
    ],
  },
  {
    id: "paladin", name: "Paladino", hitDie: 10, source: "srd", bab: "good",
    saves: { fort: "good", ref: "poor", will: "poor" }, skillPointsPerLevel: 2,
    classSkills: [
      "concentration", "craft", "diplomacy", "handle-animal", "heal", "knowledge-nobility", "knowledge-religion",
      "profession", "ride", "sense-motive",
    ],
  },
  {
    id: "ranger", name: "Ranger", hitDie: 8, source: "srd", bab: "good",
    saves: { fort: "good", ref: "good", will: "poor" }, skillPointsPerLevel: 6,
    classSkills: [
      "climb", "concentration", "craft", "handle-animal", "heal", "hide", "jump", "knowledge-dungeoneering",
      "knowledge-geography", "knowledge-nature", "listen", "move-silently", "profession", "ride", "search", "spot",
      "survival", "swim", "use-rope",
    ],
  },
  {
    id: "rogue", name: "Ladro", hitDie: 6, source: "srd", bab: "average",
    saves: { fort: "poor", ref: "good", will: "poor" }, skillPointsPerLevel: 8,
    classSkills: [
      "appraise", "balance", "bluff", "climb", "craft", "decipher-script", "diplomacy", "disable-device", "disguise",
      "escape-artist", "forgery", "gather-information", "hide", "intimidate", "jump", "knowledge-local", "listen",
      "move-silently", "open-lock", "perform", "profession", "search", "sense-motive", "sleight-of-hand", "spot",
      "swim", "tumble", "use-magic-device", "use-rope",
    ],
  },
  {
    id: "sorcerer", name: "Stregone", hitDie: 4, source: "srd", bab: "poor",
    saves: { fort: "poor", ref: "poor", will: "good" }, skillPointsPerLevel: 2,
    classSkills: ["bluff", "concentration", "craft", "knowledge-arcana", "profession", "spellcraft"],
  },
  {
    id: "wizard", name: "Mago", hitDie: 4, source: "srd", bab: "poor",
    saves: { fort: "poor", ref: "poor", will: "good" }, skillPointsPerLevel: 2,
    classSkills: ["concentration", "craft", "decipher-script", ...KNOWLEDGE_IDS, "profession", "spellcraft"],
  },
];

export const RACES_35E: readonly RaceDefinition[] = [
  { id: "human", name: "Umano", size: "medium", speed: 30, bonusSkillPointsPerLevel: 1, source: "srd" },
  { id: "dwarf", name: "Nano", size: "medium", speed: 20, source: "srd" },
  { id: "elf", name: "Elfo", size: "medium", speed: 30, source: "srd" },
  { id: "gnome", name: "Gnomo", size: "small", speed: 20, source: "srd" },
  { id: "half-elf", name: "Mezzelfo", size: "medium", speed: 30, source: "srd" },
  { id: "half-orc", name: "Mezzorco", size: "medium", speed: 30, source: "srd" },
  { id: "halfling", name: "Halfling", size: "small", speed: 20, source: "srd" },
];

export const SIZE_MODIFIERS: Record<Size, { attackAndAc: number; grapple: number; hide: number; name: string }> = {
  fine: { attackAndAc: 8, grapple: -16, hide: 16, name: "Piccolissima" },
  diminutive: { attackAndAc: 4, grapple: -12, hide: 12, name: "Minuta" },
  tiny: { attackAndAc: 2, grapple: -8, hide: 8, name: "Minuscola" },
  small: { attackAndAc: 1, grapple: -4, hide: 4, name: "Piccola" },
  medium: { attackAndAc: 0, grapple: 0, hide: 0, name: "Media" },
  large: { attackAndAc: -1, grapple: 4, hide: -4, name: "Grande" },
  huge: { attackAndAc: -2, grapple: 8, hide: -8, name: "Enorme" },
  gargantuan: { attackAndAc: -4, grapple: 12, hide: -12, name: "Mastodontica" },
  colossal: { attackAndAc: -8, grapple: 16, hide: -16, name: "Colossale" },
};

/** Skill synergies: 5 ranks in `from` grant +2 to `to`. Conditional ones apply only in a situation. */
export interface Synergy {
  from: string;
  to: string;
  condition?: string;
}

export const SYNERGIES_35E: readonly Synergy[] = [
  { from: "bluff", to: "diplomacy" },
  { from: "bluff", to: "intimidate" },
  { from: "bluff", to: "sleight-of-hand" },
  { from: "bluff", to: "disguise", condition: "per recitare un personaggio" },
  { from: "craft", to: "appraise", condition: "oggetti legati all'artigianato" },
  { from: "decipher-script", to: "use-magic-device", condition: "con le pergamene" },
  { from: "escape-artist", to: "use-rope", condition: "per legare" },
  { from: "handle-animal", to: "ride" },
  { from: "jump", to: "tumble" },
  { from: "knowledge-arcana", to: "spellcraft" },
  { from: "knowledge-architecture", to: "search", condition: "porte segrete e scomparti" },
  { from: "knowledge-dungeoneering", to: "survival", condition: "sottoterra" },
  { from: "knowledge-geography", to: "survival", condition: "per non perdersi" },
  { from: "knowledge-local", to: "gather-information" },
  { from: "knowledge-nature", to: "survival", condition: "in superficie, ambienti naturali" },
  { from: "knowledge-nobility", to: "diplomacy" },
  { from: "knowledge-planes", to: "survival", condition: "su altri piani" },
  { from: "search", to: "survival", condition: "per seguire tracce" },
  { from: "sense-motive", to: "diplomacy" },
  { from: "spellcraft", to: "use-magic-device", condition: "con le pergamene" },
  { from: "survival", to: "knowledge-nature" },
  { from: "tumble", to: "balance" },
  { from: "tumble", to: "jump" },
  { from: "use-magic-device", to: "spellcraft", condition: "decifrare pergamene" },
  { from: "use-rope", to: "climb", condition: "con una corda" },
  { from: "use-rope", to: "escape-artist", condition: "liberarsi da corde" },
];

type ArmorSeed = Pick<ArmorItem, "id" | "name" | "category" | "armorBonus" | "maxDex" | "checkPenalty" | "arcaneFailure" | "weight"> & { gp: number };

function armor(seed: ArmorSeed): ArmorItem {
  const { gp, ...rest } = seed;
  return { ...rest, kind: "armor", editions: ["3.5e"], source: "srd", cost: { amount: gp, unit: "gp" }, quantity: 1, equipped: false };
}

export const ARMOR_35E: readonly ArmorItem[] = [
  armor({ id: "35-padded", name: "Imbottita", category: "light", armorBonus: 1, maxDex: 8, checkPenalty: 0, arcaneFailure: 5, weight: 10, gp: 5 }),
  armor({ id: "35-leather", name: "Cuoio", category: "light", armorBonus: 2, maxDex: 6, checkPenalty: 0, arcaneFailure: 10, weight: 15, gp: 10 }),
  armor({ id: "35-studded-leather", name: "Cuoio borchiato", category: "light", armorBonus: 3, maxDex: 5, checkPenalty: -1, arcaneFailure: 15, weight: 20, gp: 25 }),
  armor({ id: "35-chain-shirt", name: "Giaco di maglia", category: "light", armorBonus: 4, maxDex: 4, checkPenalty: -2, arcaneFailure: 20, weight: 25, gp: 100 }),
  armor({ id: "35-hide", name: "Pelle", category: "medium", armorBonus: 3, maxDex: 4, checkPenalty: -3, arcaneFailure: 20, weight: 25, gp: 15 }),
  armor({ id: "35-scale-mail", name: "Corazza di scaglie", category: "medium", armorBonus: 4, maxDex: 3, checkPenalty: -4, arcaneFailure: 25, weight: 30, gp: 50 }),
  armor({ id: "35-chainmail", name: "Cotta di maglia", category: "medium", armorBonus: 5, maxDex: 2, checkPenalty: -5, arcaneFailure: 30, weight: 40, gp: 150 }),
  armor({ id: "35-breastplate", name: "Corazza di piastre", category: "medium", armorBonus: 5, maxDex: 3, checkPenalty: -4, arcaneFailure: 25, weight: 30, gp: 200 }),
  armor({ id: "35-splint-mail", name: "Corazza a strisce", category: "heavy", armorBonus: 6, maxDex: 0, checkPenalty: -7, arcaneFailure: 40, weight: 45, gp: 200 }),
  armor({ id: "35-banded-mail", name: "Corazza a bande", category: "heavy", armorBonus: 6, maxDex: 1, checkPenalty: -6, arcaneFailure: 35, weight: 35, gp: 250 }),
  armor({ id: "35-half-plate", name: "Mezza armatura", category: "heavy", armorBonus: 7, maxDex: 0, checkPenalty: -7, arcaneFailure: 40, weight: 50, gp: 600 }),
  armor({ id: "35-full-plate", name: "Armatura completa", category: "heavy", armorBonus: 8, maxDex: 1, checkPenalty: -6, arcaneFailure: 35, weight: 50, gp: 1500 }),
];

function shield(id: string, name: string, bonus: number, penalty: number, failure: number, weight: number, gp: number, maxDex?: number): ShieldItem {
  return {
    id, name, kind: "shield", shieldBonus: bonus, checkPenalty: penalty, arcaneFailure: failure, maxDex: maxDex ?? null,
    editions: ["3.5e"], source: "srd", weight, cost: { amount: gp, unit: "gp" }, quantity: 1, equipped: false,
  };
}

export const SHIELDS_35E: readonly ShieldItem[] = [
  shield("35-buckler", "Buckler", 1, -1, 5, 5, 15),
  shield("35-light-shield", "Scudo leggero", 1, -1, 5, 6, 9),
  shield("35-heavy-shield", "Scudo pesante", 2, -2, 15, 15, 20),
  shield("35-tower-shield", "Scudo torre", 4, -10, 50, 45, 30, 2),
];
