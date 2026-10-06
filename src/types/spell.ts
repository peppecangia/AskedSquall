import type { ContentSource, Edition } from "./common";

export const SPELL_SCHOOLS = [
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
  "universal",
] as const;
export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

interface SpellBase {
  id: string;
  name: string;
  school: SpellSchool;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
  source: ContentSource;
}

export interface Spell5e extends SpellBase {
  edition: "5e";
  /** 0 = cantrip. */
  level: number;
  components: { verbal: boolean; somatic: boolean; material?: string };
  concentration: boolean;
  ritual: boolean;
  classes: readonly string[];
  higherLevels?: string;
}

export interface Spell35e extends SpellBase {
  edition: "3.5e";
  /** Level per class id, e.g. { wizard: 3, sorcerer: 3 }. */
  levels: Readonly<Record<string, number>>;
  components: {
    verbal: boolean;
    somatic: boolean;
    material?: string;
    focus?: string;
    divineFocus?: boolean;
    xpCost?: number;
  };
  savingThrow: string;
  spellResistance: boolean;
}

export type Spell = Spell5e | Spell35e;
export type SpellForEdition<E extends Edition> = Extract<Spell, { edition: E }>;
