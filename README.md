# Compagno D&D (3.5e e 5e)

Companion local-first per D&D 3.5e e 5e. Primo passo: tipi base, adapter delle regole e scheda personaggio con switch di edizione.

## Avvio

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # test unitari delle regole (Vitest)
npm run typecheck && npm run lint && npm run build
```

## Struttura

- `src/types/` interfacce di base: `Character` (unione 5e / 3.5e), `Ruleset`, `Item`, `Spell`.
- `src/lib/rulesets/` regole come funzioni pure, una cartella per edizione (`dnd5e/`, `dnd35e/`) più `shared/`.
  `index.ts` è il registro: una nuova edizione è un adapter che implementa `Ruleset` più una voce in `RULESETS`.
- `src/components/character-sheet/` la scheda; legge solo il modello `CharacterSheet` prodotto dall'adapter.
- `src/components/ui/` componenti in stile Shadcn (`components.json` pronto per `npx shadcn add`).
- `src/stores/` stato Zustand (persistito in localStorage per ora; Dexie arriverà col modulo dati).

## Scelte e semplificazioni

- PF massimi: dado pieno al 1° livello, poi media arrotondata per eccesso (sovrascrivibile con `maxOverride`).
- 3.5e: il costo dei gradi dipende dal fatto che l'abilità sia di classe per *una qualsiasi* delle classi; i punti per livello usano l'Int attuale.
- 3.5e: bonus del Monaco alla CA (Sag) non ancora modellato.
- Cambiare edizione converte il personaggio; la versione precedente resta salvata, quindi tornare indietro non perde nulla.

## Licenze

- Contenuti 5e dall'SRD 5.1, Creative Commons CC-BY-4.0.
- Contenuti 3.5e dall'SRD 3.5, Open Game License v1.0a (testo integrale da aggiungere in `LICENSE-OGL.md`).
- Nessun contenuto protetto da marchio.
