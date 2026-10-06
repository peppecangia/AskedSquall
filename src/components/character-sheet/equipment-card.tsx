"use client";

import { Backpack } from "lucide-react";
import type { ArmorItem, Character, Item, ShieldItem } from "@/types";
import { ARMOR_35E, SHIELDS_35E } from "@/lib/rulesets/dnd35e";
import { ARMOR_5E, SHIELDS_5E } from "@/lib/rulesets/dnd5e";
import { useCharacterStore } from "@/stores/character-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

const CATEGORY_LABEL: Record<ArmorItem["category"], string> = { light: "leggera", medium: "media", heavy: "pesante" };

export function EquipmentCard({ character }: { character: Character }) {
  const update = useCharacterStore((state) => state.update);
  const armorOptions = character.edition === "5e" ? ARMOR_5E : ARMOR_35E;
  const shieldOptions = character.edition === "5e" ? SHIELDS_5E : SHIELDS_35E;
  const armor = character.inventory.find((item): item is ArmorItem => item.kind === "armor" && item.equipped);
  const shield = character.inventory.find((item): item is ShieldItem => item.kind === "shield" && item.equipped);

  const equip = (kind: "armor" | "shield", choice: Item | undefined) => {
    const rest = character.inventory.filter((item) => !(item.kind === kind && item.equipped));
    update({ inventory: choice ? [...rest, { ...choice, equipped: true }] : rest });
  };

  const describe = (item: ArmorItem) =>
    character.edition === "5e"
      ? `${item.name}: CA ${10 + item.armorBonus}${item.maxDex === null ? " + Des" : item.maxDex > 0 ? ` + Des (max ${item.maxDex})` : ""}`
      : `${item.name}: +${item.armorBonus}, Des max ${item.maxDex ?? "—"}, penalità ${item.checkPenalty ?? 0}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Backpack className="size-4 text-primary" /> Equipaggiamento
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="armor">Armatura</Label>
          <NativeSelect id="armor" value={armor?.id ?? ""} onChange={(event) => equip("armor", armorOptions.find((item) => item.id === event.target.value))}>
            <option value="">Nessuna armatura</option>
            {(["light", "medium", "heavy"] as const).map((category) => (
              <optgroup key={category} label={`Armatura ${CATEGORY_LABEL[category]}`}>
                {armorOptions
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {describe(item)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="shield">Scudo</Label>
          <NativeSelect id="shield" value={shield?.id ?? ""} onChange={(event) => equip("shield", shieldOptions.find((item) => item.id === event.target.value))}>
            <option value="">Nessuno scudo</option>
            {shieldOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}: +{item.shieldBonus}
              </option>
            ))}
          </NativeSelect>
        </div>
      </CardContent>
    </Card>
  );
}
