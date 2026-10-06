"use client";

import { create } from "zustand";
import type { RollMode } from "@/types";
import { rollD20, type D20Roll } from "@/lib/rulesets/shared/dice";

export interface RollEntry extends D20Roll {
  id: number;
  label: string;
}

interface RollState {
  rolls: RollEntry[];
  roll: (label: string, modifier: number, mode: RollMode) => void;
  clear: () => void;
}

let counter = 0;

export const useRollStore = create<RollState>()((set) => ({
  rolls: [],
  roll: (label, modifier, mode) => {
    counter += 1;
    const entry: RollEntry = { id: counter, label, ...rollD20(mode, modifier, Math.random) };
    set((state) => ({ rolls: [entry, ...state.rolls].slice(0, 8) }));
  },
  clear: () => set({ rolls: [] }),
}));
