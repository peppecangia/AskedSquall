"use client";

import { Heart, Shield, Swords, Zap } from "lucide-react";
import type { CharacterSheet } from "@/types";
import { formatModifier } from "@/lib/rulesets/shared/abilities";
import { useCharacterStore } from "@/stores/character-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput, StatBox, breakdownText } from "./parts";

export function CombatCard({ sheet, onRoll }: { sheet: CharacterSheet; onRoll: (label: string, modifier: number) => void }) {
  const hitPoints = useCharacterStore((state) => state.character.hitPoints);
  const update = useCharacterStore((state) => state.update);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="size-4 text-primary" /> Combattimento
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatBox
            label="Classe Armatura"
            value={sheet.armorClass.total}
            title={breakdownText(sheet.armorClass, false)}
            sub={sheet.armorClassVariants.map((variant) => `${variant.name} ${variant.value}`).join(" · ") || undefined}
          />
          <button type="button" onClick={() => onRoll("Iniziativa", sheet.initiative.total)} className="rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <StatBox label="Iniziativa" value={formatModifier(sheet.initiative.total)} title={breakdownText(sheet.initiative)} className="hover:border-primary h-full" />
          </button>
          <StatBox label="Velocità" value={`${sheet.speed} ft`} sub={`${(sheet.speed * 0.3).toFixed(1).replace(".", ",")} m`} />
          <StatBox label={sheet.attackBase.name} value={sheet.attackBase.display} />
        </div>

        <ul className="grid gap-1 rounded-lg border p-3 text-sm" aria-label="Composizione della Classe Armatura">
          {sheet.armorClass.parts.map((part) => (
            <li key={part.label} className="flex justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Shield className="size-3" /> {part.label}
              </span>
              <span className="tabular-nums">{part.label === "Base" ? part.value : formatModifier(part.value)}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-3 items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="hp-current" className="text-xs">
              <Heart className="size-3 text-destructive" /> PF attuali
            </Label>
            <NumberInput
              id="hp-current"
              value={hitPoints.current}
              max={sheet.hitPoints.max}
              onValueChange={(current) => update({ hitPoints: { ...hitPoints, current } })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="hp-temp" className="text-xs">PF temporanei</Label>
            <NumberInput id="hp-temp" value={hitPoints.temporary} min={0} onValueChange={(temporary) => update({ hitPoints: { ...hitPoints, temporary } })} />
          </div>
          <StatBox label="PF massimi" value={sheet.hitPoints.max} className="py-1" />
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full" role="progressbar" aria-label="Punti ferita" aria-valuemin={0} aria-valuemax={sheet.hitPoints.max} aria-valuenow={hitPoints.current}>
          <div className="bg-destructive h-full transition-[width]" style={{ width: `${Math.max(0, Math.min(100, (hitPoints.current / Math.max(1, sheet.hitPoints.max)) * 100))}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Attacco in mischia", value: sheet.meleeAttack },
            { name: "Attacco a distanza", value: sheet.rangedAttack },
          ].map((attack) => (
            <button
              key={attack.name}
              type="button"
              onClick={() => onRoll(attack.name, attack.value.total)}
              title={breakdownText(attack.value)}
              className="hover:border-primary flex items-center justify-between rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="size-3 text-primary" /> {attack.name}
              </span>
              <span className="font-semibold tabular-nums">{formatModifier(attack.value.total)}</span>
            </button>
          ))}
        </div>

        {sheet.stats.length > 0 ? (
          <dl className="grid gap-1 text-sm">
            {sheet.stats.map((stat) => (
              <div key={stat.name} className="flex justify-between gap-2 border-b border-dashed py-1 last:border-0">
                <dt className="text-muted-foreground">{stat.name}</dt>
                <dd className="font-medium tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}
