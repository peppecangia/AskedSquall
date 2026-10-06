/** Total character level across all class entries. */
export function totalLevel(classes: readonly { level: number }[]): number {
  return classes.reduce((sum, entry) => sum + entry.level, 0);
}

export function levelInClass(classes: readonly { classId: string; level: number }[], classId: string): number {
  return classes.filter((entry) => entry.classId === classId).reduce((sum, entry) => sum + entry.level, 0);
}

/** Average hit die result rounded up (d8 → 5), used for levels after the first. */
export function averageHitDie(die: number): number {
  return die / 2 + 1;
}
