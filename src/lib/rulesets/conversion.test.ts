import { describe, expect, it } from "vitest";
import { convertCharacter, ruleset5e } from ".";

describe("edition conversion", () => {
  it("keeps shared data and drops what the target lacks", () => {
    const source = {
      ...ruleset5e.createCharacter({ id: "c1", name: "Arwen", now: "2026-01-01T00:00:00.000Z" }),
      raceId: "tiefling",
      classes: [{ classId: "warlock", level: 2 }, { classId: "rogue", level: 3, subclassId: "thief" }],
      skillProficiencies: { stealth: "proficient" as const },
    };
    const { character, warnings } = convertCharacter(source, "3.5e");
    expect(character.edition).toBe("3.5e");
    expect(character.name).toBe("Arwen");
    expect(character.raceId).toBe("human");
    expect(character.classes).toEqual([{ classId: "rogue", level: 3 }]);
    expect(warnings.length).toBeGreaterThanOrEqual(3);

    const back = convertCharacter(character, "5e");
    expect(back.character.edition).toBe("5e");
    expect(back.character.classes).toEqual([{ classId: "rogue", level: 3 }]);
  });
});
