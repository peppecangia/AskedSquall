"use client";

import type { Edition } from "@/types";
import { EDITIONS } from "@/types";
import { RULESETS } from "@/lib/rulesets";
import { cn } from "@/lib/utils";

export function EditionSwitch({ value, onChange }: { value: Edition; onChange: (edition: Edition) => void }) {
  return (
    <div role="radiogroup" aria-label="Edizione delle regole" className="bg-muted inline-flex rounded-lg p-[3px]">
      {EDITIONS.map((edition) => {
        const active = edition === value;
        return (
          <button
            key={edition}
            type="button"
            role="radio"
            aria-checked={active}
            title={RULESETS[edition].name}
            onClick={() => onChange(edition)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {edition}
          </button>
        );
      })}
    </div>
  );
}
