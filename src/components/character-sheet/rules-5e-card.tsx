"use client";

import { Sparkles } from "lucide-react";
import type { Character5e, RollMode } from "@/types";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MODES: { value: RollMode; label: string }[] = [
  { value: "disadvantage", label: "Svantaggio" },
  { value: "normal", label: "Normale" },
  { value: "advantage", label: "Vantaggio" },
];

export function Rules5eCard({ character }: { character: Character5e }) {
  const update5e = useCharacterStore((state) => state.update5e);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> Regole 5e
        </CardTitle>
        <CardDescription>Il modo scelto vale per tutti i tiri di d20 fatti dalla scheda.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div role="radiogroup" aria-label="Modo di tiro" className="bg-muted grid grid-cols-3 rounded-lg p-[3px]">
          {MODES.map((mode) => {
            const active = character.rollMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update5e((c) => ({ ...c, rollMode: mode.value }))}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? mode.value === "advantage"
                      ? "bg-success text-background"
                      : mode.value === "disadvantage"
                        ? "bg-destructive text-background"
                        : "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={character.inspiration}
            onChange={(event) => update5e((c) => ({ ...c, inspiration: event.target.checked }))}
            className="accent-primary size-4"
          />
          Ispirazione
        </label>
      </CardContent>
    </Card>
  );
}
