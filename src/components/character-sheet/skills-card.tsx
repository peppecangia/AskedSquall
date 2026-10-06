"use client";

import type { Character, CharacterSheet, ProficiencyLevel } from "@/types";
import { availableSkillPoints, isClassSkill, maxSkillRanks, spentSkillPoints } from "@/lib/rulesets/dnd35e";
import { ABILITY_NAMES, formatModifier } from "@/lib/rulesets/shared/abilities";
import { cn } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberInput, breakdownText } from "./parts";

const NEXT_PROFICIENCY: Record<ProficiencyLevel, ProficiencyLevel> = {
  none: "proficient",
  half: "proficient",
  proficient: "expertise",
  expertise: "none",
};

const PROFICIENCY_LABEL: Record<ProficiencyLevel, string> = {
  none: "Nessuna competenza",
  half: "Mezza competenza",
  proficient: "Competente",
  expertise: "Maestria",
};

export function SkillsCard({
  character,
  sheet,
  onRoll,
}: {
  character: Character;
  sheet: CharacterSheet;
  onRoll: (label: string, modifier: number) => void;
}) {
  const update5e = useCharacterStore((state) => state.update5e);
  const update35e = useCharacterStore((state) => state.update35e);

  const budget =
    character.edition === "3.5e" ? { spent: spentSkillPoints(character), available: availableSkillPoints(character) } : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abilità</CardTitle>
        <CardDescription>
          {budget ? (
            <span className={cn(budget.spent > budget.available && "text-destructive")}>
              Punti abilità spesi {budget.spent} su {budget.available}. Di classe 1 punto per grado, fuori classe 2.
            </span>
          ) : (
            "Clicca il pallino per cambiare competenza: nessuna, competente, maestria."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-0.5">
          {sheet.skills.map((skill) => {
            const proficiency = character.edition === "5e" ? (character.skillProficiencies[skill.id] ?? "none") : null;
            const classSkill = character.edition === "3.5e" ? isClassSkill(character, skill.id) : false;
            return (
              <li
                key={skill.id}
                className={cn("hover:bg-muted/50 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md px-1.5 py-1 text-sm", !skill.usable && "opacity-50")}
              >
                {character.edition === "5e" && proficiency ? (
                  <button
                    type="button"
                    aria-label={`${skill.name}: ${PROFICIENCY_LABEL[proficiency]}`}
                    title={PROFICIENCY_LABEL[proficiency]}
                    onClick={() =>
                      update5e((c) => ({ ...c, skillProficiencies: { ...c.skillProficiencies, [skill.id]: NEXT_PROFICIENCY[proficiency] } }))
                    }
                    className={cn(
                      "grid size-4 place-items-center rounded-full border border-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      proficiency !== "none" && "bg-primary",
                    )}
                  >
                    {proficiency === "expertise" ? <span className="bg-primary-foreground size-1.5 rounded-full" /> : null}
                  </button>
                ) : character.edition === "3.5e" ? (
                  <NumberInput
                    aria-label={`Gradi in ${skill.name}`}
                    value={character.skillRanks[skill.id] ?? 0}
                    min={0}
                    max={maxSkillRanks(sheet.totalLevel, classSkill)}
                    step={classSkill ? 1 : 0.5}
                    onValueChange={(ranks) =>
                      update35e((c) => {
                        const skillRanks = { ...c.skillRanks };
                        if (ranks > 0) skillRanks[skill.id] = ranks;
                        else delete skillRanks[skill.id];
                        return { ...c, skillRanks };
                      })
                    }
                    className="h-7 w-14 px-1"
                  />
                ) : null}

                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={cn("truncate", classSkill && "font-medium")}>{skill.name}</span>
                  {skill.ability ? <span className="text-muted-foreground text-[11px]">{ABILITY_NAMES[skill.ability].short}</span> : null}
                  {skill.tags
                    .filter((tag) => tag !== "Di classe")
                    .map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                        {tag}
                      </Badge>
                    ))}
                </div>

                <button
                  type="button"
                  disabled={!skill.usable}
                  onClick={() => onRoll(skill.name, skill.value.total)}
                  title={breakdownText(skill.value)}
                  className="hover:text-primary w-10 rounded text-right font-semibold tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {formatModifier(skill.value.total)}
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
