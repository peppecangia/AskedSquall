import { describe, expect, it } from "vitest";
import type { Character5e } from "@/types";
import { ARMOR_5E, SHIELDS_5E, combineRollModes, proficiencyBonus, ruleset5e, subclassSlots } from ".";

const NOW = "2026-01-01T00:00:00.000Z";

function make(overrides: Partial<Character5e> = {}): Character5e {
  return { ...ruleset5e.createCharacter({ id: "c1", name: "Test", now: NOW }), ...overrides };
}

const equip = <T extends { equipped: boolean }>(item: T): T => ({ ...item, equipped: true });
const armorById = (id: string) => equip(ARMOR_5E.find((item) => item.id === id)!);

describe("proficiency bonus", () => {
  it.each([[1, 2], [4, 2], [5, 3], [8, 3], [9, 4], [13, 5], [17, 6], [20, 6]])("level %i → +%i", (level, bonus) => {
    expect(proficiencyBonus(level)).toBe(bonus);
  });

  it("uses total level across classes", () => {
    const sheet = ruleset5e.computeSheet(make({ classes: [{ classId: "fighter", level: 3 }, { classId: "wizard", level: 2 }] }));
    expect(sheet.attackBase.value).toBe(3);
  });
});

describe("advantage / disadvantage", () => {
  it("cancels out regardless of count", () => {
    expect(combineRollModes(["advantage", "advantage", "disadvantage"])).toBe("normal");
    expect(combineRollModes(["advantage", "normal"])).toBe("advantage");
    expect(combineRollModes(["disadvantage"])).toBe("disadvantage");
    expect(combineRollModes([])).toBe("normal");
  });
});

describe("subclasses", () => {
  it("unlock at the class's own level (cleric 1, wizard 2, fighter 3)", () => {
    const character = make({
      classes: [{ classId: "cleric", level: 1 }, { classId: "wizard", level: 2 }, { classId: "fighter", level: 2 }],
    });
    const unlocked = Object.fromEntries(subclassSlots(character).map((slot) => [slot.classId, slot.unlocked]));
    expect(unlocked).toEqual({ cleric: true, wizard: true, fighter: false });
  });

  it("warns when an unlocked subclass is not chosen", () => {
    const issues = ruleset5e.validate(make({ classes: [{ classId: "rogue", level: 3 }] }));
    expect(issues.some((issue) => issue.message.includes("Ladro"))).toBe(true);
  });
});

describe("armor class", () => {
  it("caps Dex for medium armor and adds a shield", () => {
    const character = make({
      abilities: { str: 14, dex: 18, con: 12, int: 10, wis: 10, cha: 10 },
      inventory: [armorById("5e-breastplate"), equip(SHIELDS_5E[0])],
    });
    expect(ruleset5e.computeSheet(character).armorClass.total).toBe(10 + 4 + 2 + 2);
  });

  it("ignores Dex in heavy armor", () => {
    const character = make({ abilities: { str: 16, dex: 14, con: 10, int: 10, wis: 10, cha: 10 }, inventory: [armorById("5e-plate")] });
    expect(ruleset5e.computeSheet(character).armorClass.total).toBe(18);
  });

  it("uses the best Unarmored Defense", () => {
    const monk = make({
      classes: [{ classId: "monk", level: 1 }],
      abilities: { str: 10, dex: 16, con: 10, int: 10, wis: 16, cha: 10 },
    });
    expect(ruleset5e.computeSheet(monk).armorClass.total).toBe(16);
    // Monk Unarmored Defense does not work with a shield.
    const withShield = { ...monk, inventory: [equip(SHIELDS_5E[0])] };
    expect(ruleset5e.computeSheet(withShield).armorClass.total).toBe(15);
  });
});

describe("saves and skills", () => {
  it("takes save proficiencies from the first class only", () => {
    const sheet = ruleset5e.computeSheet(make({ classes: [{ classId: "wizard", level: 1 }, { classId: "fighter", level: 1 }] }));
    const proficient = sheet.saves.filter((save) => save.proficient).map((save) => save.id);
    expect(proficient).toEqual(["int", "wis"]);
  });

  it("doubles proficiency with expertise", () => {
    const sheet = ruleset5e.computeSheet(
      make({
        classes: [{ classId: "rogue", level: 5 }],
        abilities: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 },
        skillProficiencies: { stealth: "expertise" },
      }),
    );
    expect(sheet.skills.find((skill) => skill.id === "stealth")?.value.total).toBe(3 + 6);
  });
});

describe("hit points", () => {
  it("max die at level 1, then average", () => {
    const character = make({ classes: [{ classId: "fighter", level: 3 }], abilities: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 } });
    expect(ruleset5e.computeSheet(character).hitPoints.max).toBe(12 + 8 + 8);
  });
});
