"use client";

import type { CharacterSheet } from "@/types";
import { formatModifier } from "@/lib/rulesets/shared/abilities";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { breakdownText } from "./parts";

export function SavesCard({ sheet, onRoll }: { sheet: CharacterSheet; onRoll: (label: string, modifier: number) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiri salvezza</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={cn("grid gap-2", sheet.saves.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")}>
          {sheet.saves.map((save) => (
            <li key={save.id}>
              <button
                type="button"
                onClick={() => onRoll(`Tiro salvezza: ${save.name}`, save.value.total)}
                title={breakdownText(save.value)}
                className="hover:border-primary flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="flex items-center gap-1.5 truncate">
                  {save.proficient !== undefined ? (
                    <span aria-label={save.proficient ? "Competente" : "Non competente"} className={cn("size-2 shrink-0 rounded-full border border-primary", save.proficient && "bg-primary")} />
                  ) : null}
                  {save.name}
                </span>
                <span className="font-semibold tabular-nums">{formatModifier(save.value.total)}</span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
