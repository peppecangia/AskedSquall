"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Character, Character35e, Character5e, Edition } from "@/types";
import { convertCharacter, getRuleset } from "@/lib/rulesets";

interface CharacterState {
  character: Character;
  /** Last version of the character in each edition, so switching back is lossless. */
  snapshots: Partial<Record<Edition, Character>>;
  conversionWarnings: string[];
  setEdition: (edition: Edition) => void;
  update: (patch: Partial<Pick<Character, "name" | "playerName" | "alignment" | "notes" | "abilities" | "hitPoints" | "inventory">>) => void;
  update5e: (recipe: (character: Character5e) => Character5e) => void;
  update35e: (recipe: (character: Character35e) => Character35e) => void;
  dismissWarnings: () => void;
  reset: () => void;
}

function newCharacter(edition: Edition): Character {
  return getRuleset(edition).createCharacter({ id: crypto.randomUUID(), name: "Nuovo personaggio", now: new Date().toISOString() });
}

const touch = <C extends Character>(character: C): C => ({ ...character, updatedAt: new Date().toISOString() });

/** Copies what both editions share from the edited character onto an older snapshot. */
function syncShared<C extends Character>(target: C, source: Character): C {
  return {
    ...target,
    name: source.name,
    playerName: source.playerName,
    alignment: source.alignment,
    notes: source.notes,
    abilities: { ...source.abilities },
    hitPoints: { ...target.hitPoints, current: source.hitPoints.current, temporary: source.hitPoints.temporary },
    updatedAt: source.updatedAt,
  };
}

/** Placeholder rendered before the persisted state loads on the client. */
const INITIAL: Character = getRuleset("5e").createCharacter({ id: "draft", name: "Nuovo personaggio", now: "1970-01-01T00:00:00.000Z" });

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      character: INITIAL,
      snapshots: {},
      conversionWarnings: [],

      setEdition: (edition) => {
        const { character, snapshots } = get();
        if (character.edition === edition) return;
        const saved = snapshots[edition];
        const next = saved ? { character: syncShared(saved, character), warnings: [] } : convertCharacter(character, edition);
        set({
          character: next.character,
          snapshots: { ...snapshots, [character.edition]: character },
          conversionWarnings: next.warnings,
        });
      },

      update: (patch) => set((state) => ({ character: touch({ ...state.character, ...patch }) })),

      update5e: (recipe) =>
        set((state) => (state.character.edition === "5e" ? { character: touch(recipe(state.character)) } : state)),

      update35e: (recipe) =>
        set((state) => (state.character.edition === "3.5e" ? { character: touch(recipe(state.character)) } : state)),

      dismissWarnings: () => set({ conversionWarnings: [] }),

      reset: () => set({ character: newCharacter(get().character.edition), snapshots: {}, conversionWarnings: [] }),
    }),
    {
      name: "dnd-companion:character",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ character: state.character, snapshots: state.snapshots }),
    },
  ),
);
