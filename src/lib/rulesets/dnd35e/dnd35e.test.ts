import { describe, expect, it } from "vitest";
import type { Character35e } from "@/types";
import {
  ARMOR_35E,
  FEATS_35E,
  PRESTIGE_CLASSES_35E,
  SHIELDS_35E,
  availableSkillPoints,
  baseAttackBonus,
  baseSave,
  checkPrerequisites,
  iterativeAttacks,
  maxSkillRanks,
  prerequisiteContext,
  ruleset35e,
  spentSkillPoints,
  synergyBonuses,
} from ".";

const NOW = "2026-01-01T00:00:00.000Z";

function make(overrides: Partial<Character35e> = {}): Character35e {
  return { ...ruleset35e.createCharacter({ id: "c1", name: "Test", now: NOW }), ...overrides };
}

const equip = <T extends { equipped: boolean }>(item: T): T => ({ ...item, equipped: true });

describe("base attack bonus", () => {
  it("adds progressions per class", () => {
    expect(baseAttackBonus([{ classId: "fighter", level: 6 }])).toBe(6);
    expect(baseAttackBonus([{ classId: "rogue", level: 8 }])).toBe(6);
    expect(baseAttackBonus([{ classId: "wizard", level: 5 }])).toBe(2);
    // Fighter 4 (+4) / Wizard 3 (+1) / Rogue 3 (+2)
    expect(baseAttackBonus([{ classId: "fighter", level: 4 }, { classId: "wizard", level: 3 }, { classId: "rogue", level: 3 }])).toBe(7);
  });

  it("lists iterative attacks", () => {
    expect(iterativeAttacks(11, 3)).toEqual([14, 9, 4]);
    expect(iterativeAttacks(5, 0)).toEqual([5]);
    expect(iterativeAttacks(6, 0)).toEqual([6, 1]);
    expect(iterativeAttacks(20, 0)).toEqual([20, 15, 10, 5]);
  });
});

describe("saving throws", () => {
  it("stacks good-save bonuses when multiclassing", () => {
    // Fighter 1 (Fort +2) / Barbarian 1 (Fort +2) = +4
    expect(baseSave([{ classId: "fighter", level: 1 }, { classId: "barbarian", level: 1 }], "fort")).toBe(4);
    expect(baseSave([{ classId: "wizard", level: 6 }], "will")).toBe(5);
    expect(baseSave([{ classId: "wizard", level: 6 }], "ref")).toBe(2);
  });
});

describe("armor class", () => {
  it("splits AC into its components, touch and flat-footed", () => {
    const character = make({
      size: "small",
      abilities: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
      inventory: [equip(ARMOR_35E.find((item) => item.id === "35-chain-shirt")!), equip(SHIELDS_35E[2])],
      acModifiers: { natural: 1, deflection: 2, dodge: 1, misc: 0 },
    });
    const sheet = ruleset35e.computeSheet(character);
    // 10 + 4 armor + 2 shield + 3 Dex + 1 size + 1 natural + 2 deflection + 1 dodge
    expect(sheet.armorClass.total).toBe(24);
    expect(sheet.armorClassVariants).toEqual([
      { name: "Contatto", value: 10 + 3 + 1 + 2 + 1 },
      { name: "Colto alla sprovvista", value: 24 - 3 - 1 },
    ]);
  });

  it("caps Dex with the lowest max Dex", () => {
    const character = make({
      abilities: { str: 10, dex: 18, con: 10, int: 10, wis: 10, cha: 10 },
      inventory: [equip(ARMOR_35E.find((item) => item.id === "35-full-plate")!)],
    });
    expect(ruleset35e.computeSheet(character).armorClass.total).toBe(10 + 8 + 1);
  });
});

describe("skills", () => {
  it("computes skill points with the ×4 first level and human bonus", () => {
    // Human Rogue 3, Int 14: (8 + 2 + 1) × 4 + 11 × 2 = 66
    const character = make({ classes: [{ classId: "rogue", level: 3 }], abilities: { str: 10, dex: 10, con: 10, int: 14, wis: 10, cha: 10 } });
    expect(availableSkillPoints(character)).toBe(66);
  });

  it("charges 2 points per cross-class rank", () => {
    const character = make({ classes: [{ classId: "fighter", level: 1 }], skillRanks: { climb: 4, hide: 2 } });
    expect(spentSkillPoints(character)).toBe(4 + 4);
  });

  it("caps ranks at level + 3, halved for cross-class", () => {
    expect(maxSkillRanks(1, true)).toBe(4);
    expect(maxSkillRanks(1, false)).toBe(2);
    const issues = ruleset35e.validate(make({ skillRanks: { climb: 5 } }));
    expect(issues.some((issue) => issue.path === "skillRanks.climb")).toBe(true);
  });

  it("applies synergy at 5 ranks", () => {
    expect(synergyBonuses({ tumble: 4 }, "balance")).toEqual([]);
    expect(synergyBonuses({ tumble: 5 }, "balance")).toEqual([{ from: "tumble", value: 2, condition: undefined }]);
    const sheet = ruleset35e.computeSheet(
      make({ classes: [{ classId: "rogue", level: 3 }], skillRanks: { tumble: 5, balance: 2 } }),
    );
    expect(sheet.skills.find((skill) => skill.id === "balance")?.value.total).toBe(2 + 0 + 2);
  });

  it("applies armor check penalty twice to Swim", () => {
    const sheet = ruleset35e.computeSheet(make({ inventory: [equip(ARMOR_35E.find((item) => item.id === "35-chainmail")!)] }));
    expect(sheet.skills.find((skill) => skill.id === "swim")?.value.total).toBe(-10);
  });
});

describe("prerequisites", () => {
  it("checks a feat chain", () => {
    const springAttack = FEATS_35E.find((feat) => feat.id === "spring-attack")!;
    const base = make({ classes: [{ classId: "fighter", level: 4 }], abilities: { str: 10, dex: 13, con: 10, int: 10, wis: 10, cha: 10 } });
    expect(checkPrerequisites(springAttack.prerequisites, prerequisiteContext(base)).eligible).toBe(false);
    const ready = { ...base, featIds: ["dodge", "mobility"] };
    expect(checkPrerequisites(springAttack.prerequisites, prerequisiteContext(ready)).eligible).toBe(true);
  });

  it("leaves text requirements to the DM", () => {
    const defender = PRESTIGE_CLASSES_35E.find((entry) => entry.id === "dwarven-defender")!;
    const character = make({
      raceId: "dwarf",
      classes: [{ classId: "fighter", level: 7 }],
      featIds: ["dodge", "endurance", "toughness"],
    });
    const result = checkPrerequisites(defender.prerequisites, prerequisiteContext(character));
    expect(result.eligible).toBe(true);
    expect(result.results.some((entry) => entry.met === "unknown")).toBe(true);
  });
});
