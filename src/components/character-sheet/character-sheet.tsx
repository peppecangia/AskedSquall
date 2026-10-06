"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import { computeSheet, getRuleset, validateCharacter } from "@/lib/rulesets";
import { useCharacterStore } from "@/stores/character-store";
import { useRollStore } from "@/stores/roll-store";
import { Button } from "@/components/ui/button";
import { AbilitiesCard } from "./abilities-card";
import { CombatCard } from "./combat-card";
import { EditionSwitch } from "./edition-switch";
import { EquipmentCard } from "./equipment-card";
import { IdentityCard } from "./identity-card";
import { RollLog } from "./roll-log";
import { Rules35eCard } from "./rules-35e-card";
import { Rules5eCard } from "./rules-5e-card";
import { SavesCard } from "./saves-card";
import { SkillsCard } from "./skills-card";

export function CharacterSheetView() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useCharacterStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  const character = useCharacterStore((state) => state.character);
  const warnings = useCharacterStore((state) => state.conversionWarnings);
  const setEdition = useCharacterStore((state) => state.setEdition);
  const dismissWarnings = useCharacterStore((state) => state.dismissWarnings);
  const reset = useCharacterStore((state) => state.reset);
  const roll = useRollStore((state) => state.roll);

  const sheet = useMemo(() => computeSheet(character), [character]);
  const issues = useMemo(() => validateCharacter(character), [character]);
  const onRoll = (label: string, modifier: number) => roll(label, modifier, character.edition === "5e" ? character.rollMode : "normal");

  if (!hydrated) {
    return <div className="text-muted-foreground grid min-h-[60vh] place-items-center text-sm">Caricamento della scheda…</div>;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Scheda personaggio</h1>
          <p className="text-muted-foreground text-sm">
            {getRuleset(character.edition).name} · licenza {getRuleset(character.edition).license.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditionSwitch value={character.edition} onChange={setEdition} />
          <Button variant="ghost" size="icon" aria-label="Nuovo personaggio" title="Nuovo personaggio" onClick={() => reset()}>
            <RotateCcw />
          </Button>
        </div>
      </header>

      {warnings.length > 0 ? (
        <div role="status" className="border-primary/40 bg-primary/10 flex gap-3 rounded-lg border p-3 text-sm">
          <AlertTriangle className="text-primary mt-0.5 size-4 shrink-0" />
          <div className="grid flex-1 gap-1">
            <p className="font-medium">Personaggio convertito in {character.edition}</p>
            <ul className="text-muted-foreground list-disc pl-4">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Chiudi avvisi" onClick={dismissWarnings}>
            <X />
          </Button>
        </div>
      ) : null}

      <IdentityCard character={character} totalLevel={sheet.totalLevel} />

      {issues.length > 0 ? (
        <ul className="grid gap-1 text-sm" aria-label="Controlli sulle regole">
          {issues.map((issue) => (
            <li key={issue.message} className={issue.severity === "error" ? "text-destructive" : "text-primary"}>
              {issue.severity === "error" ? "✕" : "!"} {issue.message}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid content-start gap-4">
          <AbilitiesCard sheet={sheet} onRoll={onRoll} />
          <EquipmentCard character={character} />
        </div>
        <div className="grid content-start gap-4">
          <CombatCard sheet={sheet} onRoll={onRoll} />
          <SavesCard sheet={sheet} onRoll={onRoll} />
          {character.edition === "5e" ? <Rules5eCard character={character} /> : <Rules35eCard character={character} />}
        </div>
        <div className="grid content-start gap-4">
          <RollLog />
          <SkillsCard character={character} sheet={sheet} onRoll={onRoll} />
        </div>
      </div>
    </div>
  );
}
