# Lyrian Chronicles Character Builder - Beta 2.0 API Build

A browser-based character builder and live play sheet for the Angel's Sword
Lyrian Chronicles TTRPG. Fan-made, runs entirely in the browser from bundled
public rules data, and ships with a disabled-by-default provider layer ready
for an official API. See [NOTICE.md](NOTICE.md) for ownership and data
provenance.

This build combines the reviewed Beta 1.9 player experience plus the Beta
1.92 tester-feedback hotpatch (builder, live play sheet, class progression,
class prerequisites, equipment shopping,
guided crafting and gathering wizards) with the API handoff layer first
prepared in the Beta 1.6 API build.

## Quick Start

```powershell
npm install
npm start     # local dev server; opens the app in your browser
npm test      # rebuilds the bundle and runs the cross-browser regression suite
```

On Windows PowerShell, use `npm.cmd` if plain `npm` is blocked by the local
execution policy.

## Integrating An Official API? Start Here

The app runs from bundled local data by default. The API path is built,
tested, and waiting for a real endpoint.

1. **Give your developer or AI assistant [AI_INTEGRATION_TASK.md](AI_INTEGRATION_TASK.md).**
   It is a self-contained task brief with acceptance criteria.
2. See the expected payload: run `npm start` and open
   `http://127.0.0.1:4180/builder/game-data` (a full working mock of the
   endpoint the app expects), or read the truncated example in
   [docs/sample-api-payload.json](docs/sample-api-payload.json).
3. Check your endpoint: `node scripts/validate-api-payload.mjs <url>` tells
   you exactly what the app would accept, warn about, or reject.
4. Read [docs/api-mode-ownership-map.md](docs/api-mode-ownership-map.md) —
   it lists which parts of this project are scraping/update workarounds that
   your integration replaces, so scaffolding does not ship to production.

## Documentation Map

| To understand... | Read... |
| --- | --- |
| The API integration task, end to end | `AI_INTEGRATION_TASK.md` |
| The integration design and payload contract | `docs/api-integration-plan.md` |
| What your integration replaces (scrape/update scaffolding) | `docs/api-mode-ownership-map.md` |
| The version history 1.5 → 2.0 | `BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md` |
| AI/developer onboarding and task routing | `AI_START_HERE.md`, `API_HANDOFF_README.md` |
| Reusable systems (rules logic, dice, import/export) | `docs/reusable-systems-map.md`, `docs/rules-logic-map.md` |
| State, saves, and import/export contracts | `docs/state-and-data-contract.md` |
| Behavior guaranteed by tests | `docs/test-behavior-map.md`, `scripts/test-cross-browser.mjs` |
| Known risks and open questions | `docs/known-risks-and-questions.md` |
| Ownership, game-content provenance, licensing | `NOTICE.md` |

## What The App Does

- Full character builder: race, ancestry, classes, breakthroughs, skills,
  equipment, abilities — including rare-but-legal cascading unlock paths,
  which are deliberately preserved rather than blocked.
- Live play sheet: resources, actions, effects, inventory, notes, play log.
- Beta 1.92 feedback fixes: clearable builder choices, corrected class
  progression and alternate-expertise prerequisites, equipment category
  filters, weapon proficiency hints, sticky remaining Clim, and stacked Food
  Unit purchase/consume controls.
- Guided crafting wizard (choose recipe → gather materials → check support →
  roll points → resolve craft) and gathering wizard (choose node → check
  access → roll strikes → resolve gather), with soft GM-facing warnings
  instead of hard blocks, and explicit labeling wherever rules are inferred
  rather than official.
- Bundled rules versions `0.12.5`, `0.12.6`, `0.13.0`; fresh characters
  default to the latest.
- Browser save slots plus JSON, PDF, and spreadsheet export/import with exact
  round-trip metadata.
- Animated dice roller with custom Angel Sword dice packs.
- Static deployment: GitHub Pages, any static host, a local server, or direct
  file startup all work. Keep asset paths relative.

## Key Defaults

- `assets/api-config.js`: `mode: "static"`, `enabled: false` — bundled data.
- `assets/security-config.js`: disabled placeholder. This is a browser app;
  no secrets may ever be added to it. Login, account saves, and paid content
  need an official backend.

## Testing

`npm test` rebuilds `assets/app.bundle.js` and runs the Playwright suite
across Chromium, Firefox, and WebKit: layout and DOM assertions at three
viewport sizes, direct-file startup, functional rules regressions
(import/export fixtures, crafting outcome guard), and two API-provider tests
(API mode against the local mock endpoint, and static fallback when the
endpoint is unreachable).

`npm run audit:minmax` reports legal/unusual class unlock cascades — the
project treats legal bypass routes as features to preserve, and this audit
keeps them visible.

## Tester Notes

Characters save into the browser you used to open the app. Export a JSON,
PDF, or spreadsheet copy to back up or move a character. Leaflit and Asari
dice are intentionally marked as coming soon in this build.

## Project History

This folder is the promoted Beta 2.0 package. The historical
`Angel Sword Lirian Chronicles Beta 1.6 API build` folder remains the original
API-handoff reference and should not be overwritten. The full 1.5 → 2.0
timeline is in `BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md`.
