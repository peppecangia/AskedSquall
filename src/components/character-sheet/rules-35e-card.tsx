"use client";

import { Check, CircleHelp, ScrollText, X } from "lucide-react";
import type { Character35e, Size } from "@/types";
import { SIZES } from "@/types";
import {
  FEATS_35E,
  PRESTIGE_CLASSES_35E,
  RACES_35E,
  SIZE_MODIFIERS,
  getClass35e,
  availableFeats,
  checkPrerequisites,
  prerequisiteContext,
  skillDefinition35e,
  type Prerequisite,
  type PrerequisiteResult,
} from "@/lib/rulesets/dnd35e";
import { ABILITY_NAMES } from "@/lib/rulesets/shared/abilities";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { NumberInput } from "./parts";

function describePrerequisite(prerequisite: Prerequisite): string {
  switch (prerequisite.type) {
    case "ability":
      return `${ABILITY_NAMES[prerequisite.ability].short} ${prerequisite.min}`;
    case "bab":
      return `BAB +${prerequisite.min}`;
    case "skillRanks":
      return `${skillDefinition35e(prerequisite.skillId)?.name ?? prerequisite.skillId} ${prerequisite.min} gradi`;
    case "feat":
      return FEATS_35E.find((feat) => feat.id === prerequisite.featId)?.name ?? prerequisite.featId;
    case "characterLevel":
      return `Livello ${prerequisite.min}`;
    case "classLevel":
      return `${getClass35e(prerequisite.classId)?.name ?? prerequisite.classId} ${prerequisite.min}`;
    case "race":
      return `Razza: ${prerequisite.raceIds.map((id) => RACES_35E.find((race) => race.id === id)?.name ?? id).join(", ")}`;
    case "text":
      return prerequisite.description;
  }
}

function PrerequisiteList({ results }: { results: PrerequisiteResult[] }) {
  if (results.length === 0) return <span className="text-muted-foreground text-xs">Nessun requisito</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {results.map((result, index) => (
        <Badge key={index} variant={result.met === true ? "success" : result.met === false ? "destructive" : "secondary"} className="font-normal">
          {result.met === true ? <Check /> : result.met === false ? <X /> : <CircleHelp />}
          {describePrerequisite(result.prerequisite)}
        </Badge>
      ))}
    </span>
  );
}

const AC_FIELDS: { key: keyof Character35e["acModifiers"]; label: string }[] = [
  { key: "natural", label: "Armatura naturale" },
  { key: "deflection", label: "Deviazione" },
  { key: "dodge", label: "Schivare" },
  { key: "misc", label: "Varie" },
];

export function Rules35eCard({ character }: { character: Character35e }) {
  const update35e = useCharacterStore((state) => state.update35e);
  const context = prerequisiteContext(character);
  const featSlots = availableFeats(character);

  const toggleFeat = (featId: string, on: boolean) =>
    update35e((c) => ({ ...c, featIds: on ? [...c.featIds, featId] : c.featIds.filter((id) => id !== featId) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="size-4 text-primary" /> Regole 3.5e
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <section className="grid gap-2" aria-labelledby="ac-sources">
          <h4 id="ac-sources" className="text-sm font-medium">Taglia e altre fonti di CA</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="grid gap-1 sm:col-span-1">
              <Label htmlFor="size" className="text-xs">Taglia</Label>
              <NativeSelect id="size" value={character.size} onChange={(event) => update35e((c) => ({ ...c, size: event.target.value as Size }))} className="h-8">
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {SIZE_MODIFIERS[size].name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {AC_FIELDS.map((field) => (
              <div key={field.key} className="grid gap-1">
                <Label htmlFor={`ac-${field.key}`} className="text-xs">{field.label}</Label>
                <NumberInput
                  id={`ac-${field.key}`}
                  value={character.acModifiers[field.key]}
                  onValueChange={(value) => update35e((c) => ({ ...c, acModifiers: { ...c.acModifiers, [field.key]: value } }))}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-2" aria-labelledby="feats">
          <div className="flex items-baseline justify-between">
            <h4 id="feats" className="text-sm font-medium">Talenti</h4>
            <span className={cn("text-muted-foreground text-xs", character.featIds.length > featSlots && "text-destructive")}>
              {character.featIds.length} / {featSlots}
            </span>
          </div>
          <ul className="grid gap-1.5">
            {FEATS_35E.map((feat) => {
              const taken = character.featIds.includes(feat.id);
              const { results, eligible } = checkPrerequisites(feat.prerequisites, context);
              return (
                <li key={feat.id} className={cn("grid gap-1 rounded-md border px-2.5 py-1.5", taken && "border-primary/60 bg-primary/5")}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={taken}
                      disabled={!taken && !eligible}
                      onChange={(event) => toggleFeat(feat.id, event.target.checked)}
                      className="accent-primary size-4"
                    />
                    <span className="font-medium">{feat.name}</span>
                    {feat.fighter ? <Badge variant="outline" className="text-[10px]">Guerriero</Badge> : null}
                    <span className="text-muted-foreground hidden truncate text-xs md:inline">{feat.benefit}</span>
                  </label>
                  {feat.prerequisites.length > 0 ? <PrerequisiteList results={results} /> : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-2" aria-labelledby="prestige">
          <h4 id="prestige" className="text-sm font-medium">Classi di prestigio</h4>
          <ul className="grid gap-1.5">
            {PRESTIGE_CLASSES_35E.map((prestige) => {
              const { results, eligible } = checkPrerequisites(prestige.prerequisites, context);
              return (
                <li key={prestige.id} className="grid gap-1 rounded-md border px-2.5 py-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{prestige.name}</span>
                    <Badge variant={eligible ? "success" : "outline"}>{eligible ? "Accessibile" : "Requisiti mancanti"}</Badge>
                  </div>
                  <PrerequisiteList results={results} />
                </li>
              );
            })}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
