"use client";

import { Dices } from "lucide-react";
import { formatModifier } from "@/lib/rulesets/shared/abilities";
import { cn } from "@/lib/utils";
import { useRollStore } from "@/stores/roll-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODE_LABEL = { normal: "", advantage: "vantaggio", disadvantage: "svantaggio" } as const;

export function RollLog() {
  const rolls = useRollStore((state) => state.rolls);
  const clear = useRollStore((state) => state.clear);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Dices className="size-4 text-primary" /> Tiri recenti
        </CardTitle>
        {rolls.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Pulisci
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {rolls.length === 0 ? (
          <p className="text-muted-foreground text-sm">Clicca un modificatore, un tiro salvezza o un&apos;abilità per tirare il d20.</p>
        ) : (
          <ul className="grid gap-1.5" aria-live="polite">
            {rolls.map((roll) => (
              <li key={roll.id} className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{roll.label}</span>
                  <span className="text-muted-foreground text-xs">
                    d20{" "}
                    {roll.rolls.map((value, index) => (
                      <span key={index} className={cn(roll.rolls.length > 1 && value !== roll.kept && "line-through opacity-60", "mr-1")}>
                        [{value}]
                      </span>
                    ))}
                    {formatModifier(roll.modifier)} {MODE_LABEL[roll.mode]}
                  </span>
                </span>
                <span
                  className={cn(
                    "font-serif text-xl font-semibold tabular-nums",
                    roll.kept === 20 && "text-success",
                    roll.kept === 1 && "text-destructive",
                  )}
                >
                  {roll.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
