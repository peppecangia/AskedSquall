import { describe, expect, it } from "vitest";
import { abilityModifier, formatModifier } from "./abilities";
import { keptD20, rollD20 } from "./dice";

describe("abilityModifier", () => {
  it.each([
    [1, -5], [8, -1], [9, -1], [10, 0], [11, 0], [12, 1], [15, 2], [18, 4], [20, 5], [30, 10],
  ])("score %i → %i", (score, expected) => expect(abilityModifier(score)).toBe(expected));

  it("formats signs", () => {
    expect(formatModifier(3)).toBe("+3");
    expect(formatModifier(0)).toBe("+0");
    expect(formatModifier(-2)).toBe("-2");
  });
});

describe("d20 roll modes", () => {
  it("keeps the right die", () => {
    expect(keptD20("advantage", [4, 17])).toBe(17);
    expect(keptD20("disadvantage", [4, 17])).toBe(4);
    expect(keptD20("normal", [9])).toBe(9);
  });

  it("rolls two dice with advantage and adds the modifier", () => {
    const values = [0.1, 0.95];
    const rng = () => values.shift() ?? 0;
    const roll = rollD20("advantage", 5, rng);
    expect(roll.rolls).toEqual([3, 20]);
    expect(roll.total).toBe(25);
  });
});
