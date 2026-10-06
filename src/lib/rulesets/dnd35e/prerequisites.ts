import type { AbilityKey } from "@/types";

/** Declarative prerequisite, shared by feats and prestige classes (and homebrew content). */
export type Prerequisite =
  | { type: "ability"; ability: AbilityKey; min: number }
  | { type: "bab"; min: number }
  | { type: "skillRanks"; skillId: string; min: number }
  | { type: "feat"; featId: string }
  | { type: "characterLevel"; min: number }
  | { type: "classLevel"; classId: string; min: number }
  | { type: "race"; raceIds: readonly string[] }
  /** A requirement the engine cannot check (spellcasting, alignment…): shown, never blocking. */
  | { type: "text"; description: string };

export interface FeatDefinition35e {
  id: string;
  name: string;
  /** May be taken as a Fighter bonus feat. */
  fighter?: boolean;
  prerequisites: readonly Prerequisite[];
  benefit: string;
}

export interface PrestigeClassDefinition35e {
  id: string;
  name: string;
  hitDie: number;
  prerequisites: readonly Prerequisite[];
}

/** Facts about a character the evaluator needs, already computed by the ruleset. */
export interface PrerequisiteContext {
  abilities: Record<AbilityKey, number>;
  bab: number;
  skillRanks: Readonly<Record<string, number>>;
  featIds: readonly string[];
  characterLevel: number;
  classLevels: Readonly<Record<string, number>>;
  raceId: string;
}

export interface PrerequisiteResult {
  prerequisite: Prerequisite;
  met: boolean | "unknown";
}

export function checkPrerequisite(prerequisite: Prerequisite, context: PrerequisiteContext): PrerequisiteResult {
  switch (prerequisite.type) {
    case "ability":
      return { prerequisite, met: context.abilities[prerequisite.ability] >= prerequisite.min };
    case "bab":
      return { prerequisite, met: context.bab >= prerequisite.min };
    case "skillRanks":
      return { prerequisite, met: (context.skillRanks[prerequisite.skillId] ?? 0) >= prerequisite.min };
    case "feat":
      return { prerequisite, met: context.featIds.includes(prerequisite.featId) };
    case "characterLevel":
      return { prerequisite, met: context.characterLevel >= prerequisite.min };
    case "classLevel":
      return { prerequisite, met: (context.classLevels[prerequisite.classId] ?? 0) >= prerequisite.min };
    case "race":
      return { prerequisite, met: prerequisite.raceIds.includes(context.raceId) };
    case "text":
      return { prerequisite, met: "unknown" };
  }
}

export function checkPrerequisites(prerequisites: readonly Prerequisite[], context: PrerequisiteContext) {
  const results = prerequisites.map((prerequisite) => checkPrerequisite(prerequisite, context));
  return {
    results,
    /** True when every checkable requirement is met (text-only ones are left to the DM). */
    eligible: results.every((result) => result.met !== false),
  };
}

export const FEATS_35E: readonly FeatDefinition35e[] = [
  { id: "power-attack", name: "Attacco Poderoso", fighter: true, prerequisites: [{ type: "ability", ability: "str", min: 13 }], benefit: "Scambia bonus di attacco con danni in mischia." },
  { id: "cleave", name: "Incalzare", fighter: true, prerequisites: [{ type: "ability", ability: "str", min: 13 }, { type: "feat", featId: "power-attack" }], benefit: "Attacco extra dopo aver abbattuto un nemico." },
  { id: "great-cleave", name: "Incalzare Migliorato", fighter: true, prerequisites: [{ type: "ability", ability: "str", min: 13 }, { type: "feat", featId: "cleave" }, { type: "feat", featId: "power-attack" }, { type: "bab", min: 4 }], benefit: "Incalzare senza limite per round." },
  { id: "dodge", name: "Schivare", fighter: true, prerequisites: [{ type: "ability", ability: "dex", min: 13 }], benefit: "+1 schivare alla CA contro un avversario." },
  { id: "mobility", name: "Mobilità", fighter: true, prerequisites: [{ type: "ability", ability: "dex", min: 13 }, { type: "feat", featId: "dodge" }], benefit: "+4 schivare alla CA contro attacchi di opportunità da movimento." },
  { id: "spring-attack", name: "Attacco Rapido", fighter: true, prerequisites: [{ type: "ability", ability: "dex", min: 13 }, { type: "feat", featId: "dodge" }, { type: "feat", featId: "mobility" }, { type: "bab", min: 4 }], benefit: "Muoversi prima e dopo un attacco in mischia." },
  { id: "weapon-finesse", name: "Arma Accurata", fighter: true, prerequisites: [{ type: "bab", min: 1 }], benefit: "Usa Des invece di For per attaccare con armi leggere." },
  { id: "weapon-focus", name: "Arma Focalizzata", fighter: true, prerequisites: [{ type: "bab", min: 1 }, { type: "text", description: "Competenza nell'arma scelta" }], benefit: "+1 ai tiri per colpire con l'arma scelta." },
  { id: "combat-expertise", name: "Maestria in Combattimento", fighter: true, prerequisites: [{ type: "ability", ability: "int", min: 13 }], benefit: "Scambia bonus di attacco con CA." },
  { id: "improved-trip", name: "Sbilanciare Migliorato", fighter: true, prerequisites: [{ type: "ability", ability: "int", min: 13 }, { type: "feat", featId: "combat-expertise" }], benefit: "+4 a sbilanciare, attacco gratuito dopo." },
  { id: "combat-reflexes", name: "Riflessi in Combattimento", fighter: true, prerequisites: [], benefit: "Attacchi di opportunità extra pari al mod. Des." },
  { id: "improved-initiative", name: "Iniziativa Migliorata", fighter: true, prerequisites: [], benefit: "+4 alle prove di iniziativa." },
  { id: "toughness", name: "Robustezza", prerequisites: [], benefit: "+3 punti ferita." },
  { id: "endurance", name: "Resistenza Fisica", prerequisites: [], benefit: "+4 a prove per resistere a fatica e ambiente." },
  { id: "iron-will", name: "Volontà di Ferro", prerequisites: [], benefit: "+2 ai tiri salvezza sulla Volontà." },
  { id: "lightning-reflexes", name: "Riflessi Fulminei", prerequisites: [], benefit: "+2 ai tiri salvezza sui Riflessi." },
  { id: "great-fortitude", name: "Tempra Possente", prerequisites: [], benefit: "+2 ai tiri salvezza sulla Tempra." },
];

export const PRESTIGE_CLASSES_35E: readonly PrestigeClassDefinition35e[] = [
  {
    id: "duelist", name: "Duellante", hitDie: 10,
    prerequisites: [
      { type: "bab", min: 6 }, { type: "skillRanks", skillId: "perform", min: 2 }, { type: "skillRanks", skillId: "tumble", min: 5 },
      { type: "feat", featId: "dodge" }, { type: "feat", featId: "mobility" }, { type: "feat", featId: "weapon-finesse" },
    ],
  },
  {
    id: "shadowdancer", name: "Danzatore delle Ombre", hitDie: 8,
    prerequisites: [
      { type: "skillRanks", skillId: "move-silently", min: 8 }, { type: "skillRanks", skillId: "hide", min: 10 },
      { type: "skillRanks", skillId: "perform", min: 5 }, { type: "feat", featId: "combat-reflexes" },
      { type: "feat", featId: "dodge" }, { type: "feat", featId: "mobility" },
    ],
  },
  {
    id: "dwarven-defender", name: "Difensore Nanico", hitDie: 12,
    prerequisites: [
      { type: "race", raceIds: ["dwarf"] }, { type: "text", description: "Allineamento legale" }, { type: "bab", min: 7 },
      { type: "feat", featId: "dodge" }, { type: "feat", featId: "endurance" }, { type: "feat", featId: "toughness" },
    ],
  },
];
