"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Character } from "@/types";
import { getRuleset } from "@/lib/rulesets";
import { subclassSlots } from "@/lib/rulesets/dnd5e";
import { useCharacterStore } from "@/stores/character-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { NumberInput } from "./parts";

export function IdentityCard({ character, totalLevel }: { character: Character; totalLevel: number }) {
  const update = useCharacterStore((state) => state.update);
  const update5e = useCharacterStore((state) => state.update5e);
  const update35e = useCharacterStore((state) => state.update35e);
  const ruleset = getRuleset(character.edition);
  const maxTotal = character.edition === "5e" ? 20 : 40;

  const setRace = (raceId: string) => {
    if (character.edition === "5e") update5e((c) => ({ ...c, raceId }));
    else update35e((c) => ({ ...c, raceId, size: ruleset.races.find((race) => race.id === raceId)?.size ?? c.size }));
  };

  const setClass = (index: number, patch: { classId?: string; level?: number; subclassId?: string }) => {
    if (character.edition === "5e") {
      update5e((c) => ({
        ...c,
        classes: c.classes.map((entry, i) =>
          i !== index ? entry : { ...entry, ...patch, ...(patch.classId ? { subclassId: undefined } : {}) },
        ),
      }));
    } else {
      update35e((c) => ({
        ...c,
        classes: c.classes.map((entry, i) =>
          i === index ? { classId: patch.classId ?? entry.classId, level: patch.level ?? entry.level } : entry,
        ),
      }));
    }
  };

  const addClass = () => {
    const used = new Set(character.classes.map((entry) => entry.classId));
    const classId = ruleset.classes.find((entry) => !used.has(entry.id))?.id;
    if (!classId) return;
    if (character.edition === "5e") update5e((c) => ({ ...c, classes: [...c.classes, { classId, level: 1 }] }));
    else update35e((c) => ({ ...c, classes: [...c.classes, { classId, level: 1 }] }));
  };

  const removeClass = (index: number) => {
    if (character.edition === "5e") update5e((c) => ({ ...c, classes: c.classes.filter((_, i) => i !== index) }));
    else update35e((c) => ({ ...c, classes: c.classes.filter((_, i) => i !== index) }));
  };

  const slots = character.edition === "5e" ? subclassSlots(character) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="sr-only">Identità</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={character.name} onChange={(event) => update({ name: event.target.value })} className="font-serif text-lg font-semibold" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="race">Razza</Label>
            <NativeSelect id="race" value={character.raceId} onChange={(event) => setRace(event.target.value)}>
              {ruleset.races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="player">Giocatore</Label>
            <Input id="player" value={character.playerName ?? ""} onChange={(event) => update({ playerName: event.target.value })} />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Classi <span className="text-muted-foreground">· livello totale {totalLevel}</span>
            </span>
            <Button variant="outline" size="sm" onClick={addClass} disabled={character.classes.length >= ruleset.classes.length}>
              <Plus /> Multiclasse
            </Button>
          </div>
          <ul className="grid gap-2">
            {character.classes.map((entry, index) => {
              const slot = slots[index];
              const otherLevels = totalLevel - entry.level;
              return (
                <li key={`${entry.classId}-${index}`} className="grid items-center gap-2 sm:grid-cols-[1fr_5rem_1.4fr_auto]">
                  <NativeSelect aria-label="Classe" value={entry.classId} onChange={(event) => setClass(index, { classId: event.target.value })}>
                    {ruleset.classes.map((definition) => (
                      <option
                        key={definition.id}
                        value={definition.id}
                        disabled={definition.id !== entry.classId && character.classes.some((other) => other.classId === definition.id)}
                      >
                        {definition.name} (d{definition.hitDie})
                      </option>
                    ))}
                  </NativeSelect>
                  <NumberInput aria-label="Livello" value={entry.level} min={1} max={maxTotal - otherLevels} onValueChange={(level) => setClass(index, { level })} />
                  <div className="min-h-8">
                    {slot ? (
                      slot.unlocked ? (
                        <NativeSelect aria-label={slot.label} value={slot.selectedId ?? ""} onChange={(event) => setClass(index, { subclassId: event.target.value || undefined })}>
                          <option value="">{slot.label}…</option>
                          {slot.options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </NativeSelect>
                      ) : (
                        <Badge variant="outline" className="h-8 text-muted-foreground">
                          {slot.label}: livello {slot.unlockLevel}
                        </Badge>
                      )
                    ) : null}
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Rimuovi classe" onClick={() => removeClass(index)} disabled={character.classes.length === 1}>
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
