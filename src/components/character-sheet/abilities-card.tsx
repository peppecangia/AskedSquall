"use client";

import type { AbilityKey, CharacterSheet } from "@/types";
import { ABILITY_NAMES, formatModifier } from "@/lib/rulesets/shared/abilities";
import { useCharacterStore } from "@/stores/character-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput } from "./parts";

export function AbilitiesCard({ sheet, onRoll }: { sheet: CharacterSheet; onRoll: (label: string, modifier: number) => void }) {
  const abilities = useCharacterStore((state) => state.character.abilities);
  const update = useCharacterStore((state) => state.update);
  const setScore = (key: AbilityKey, score: number) => update({ abilities: { ...abilities, [key]: score } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caratteristiche</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 lg:grid-cols-2">
        {sheet.abilities.map((ability) => (
          <div key={ability.key} className="bg-muted/40 flex flex-col items-center gap-1 rounded-lg border p-2">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wide" title={ABILITY_NAMES[ability.key].long}>
              {ABILITY_NAMES[ability.key].short}
            </span>
            <button
              type="button"
              onClick={() => onRoll(`Prova di ${ABILITY_NAMES[ability.key].long}`, ability.modifier)}
              className="hover:text-primary rounded font-serif text-2xl font-semibold tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              title="Tira una prova"
            >
              {formatModifier(ability.modifier)}
            </button>
            <NumberInput
              aria-label={`Punteggio di ${ABILITY_NAMES[ability.key].long}`}
              value={ability.score}
              min={1}
              max={30}
              onValueChange={(score) => setScore(ability.key, score)}
              className="w-16"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
