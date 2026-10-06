"use client";

import * as React from "react";
import type { DerivedValue } from "@/types";
import { formatModifier } from "@/lib/rulesets/shared/abilities";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/** Explains how a number is built, as a native tooltip and for screen readers. */
export function breakdownText(value: DerivedValue, signed = true): string {
  return value.parts.map((part, index) => `${index === 0 && !signed ? part.value : formatModifier(part.value)} ${part.label}`).join("  ·  ");
}

export function StatBox({
  label,
  value,
  sub,
  title,
  className,
  children,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("bg-muted/40 flex flex-col items-center justify-center rounded-lg border px-3 py-2 text-center", className)} title={title}>
      <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">{label}</span>
      <span className="font-serif text-2xl leading-tight font-semibold tabular-nums">{value}</span>
      {sub ? <span className="text-muted-foreground text-xs">{sub}</span> : null}
      {children}
    </div>
  );
}

export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      onChange={(event) => {
        const parsed = Number(event.target.value);
        if (Number.isNaN(parsed)) return;
        const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, parsed));
        onValueChange(clamped);
      }}
      className={cn("h-8 text-center tabular-nums", className)}
      {...props}
    />
  );
}
