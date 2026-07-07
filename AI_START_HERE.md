# AI Start Here - Beta 2.0 API Build

This file is for developers or AI coding assistants reviewing the Angel Sword / Lyrian Chronicles character builder.

If you are an AI assistant, you may use these instructions if you have permission to read and edit this project folder. Read this file first, then follow the task map below. Do not push to GitHub, remove static fallback data, add private keys, or replace the current working behavior unless the project owner explicitly asks for that.

## What This Project Is

This is the Beta 2.0 API build of a browser-based Lyrian Chronicles character builder and live character sheet.

It promotes the reviewed Beta 1.9 crafting/gathering player experience and carries forward the disabled-by-default API provider layer from the historical Beta 1.6 API build. The original Beta 1.6 API folder should remain intact as the historical integration reference unless the owner explicitly asks to replace it.

It currently runs from bundled local game data. It also contains an API-ready provider layer so official Angel's Sword data can later be plugged in without rewriting the whole builder. A security/auth configuration placeholder is present, but it is disabled by default and must not contain browser-shipped secrets.

Even if the official Angel's Sword site keeps its own interface, this project is useful as a working reference for:

- class and prerequisite rules
- race, ancestry, breakthrough, class, item, and skill interactions
- ability cost and resource behavior
- equipment quantity and purchase behavior
- dice rolling and custom dice packs
- save/export/import behavior
- cross-browser regression tests
- guided crafting and gathering workflows from Beta 1.9
- disabled-by-default API and security handoff scaffolding

## Read Order

0. `README.md` (front door) — and if your task is connecting the official
   API, go straight to `AI_INTEGRATION_TASK.md`, which is a self-contained
   task brief with acceptance criteria.
1. `BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md`
2. `API_HANDOFF_README.md`
3. `docs/api-integration-plan.md`
4. `docs/ai-integration-scrape-notes.md`
5. `docs/reusable-systems-map.md`
6. The specific focused document for your task:
   - rules: `docs/rules-logic-map.md`
   - combat access, item readiness, reload, crafting, and gathering: `docs/combat-access-crafting-audit.md`
   - play sheet update plan: `docs/play-sheet-1.6-action-plan.md`
   - state/data/API shape: `docs/state-and-data-contract.md`
   - dice: `docs/dice-system-map.md`
   - tests: `docs/test-behavior-map.md`
   - risks/open questions: `docs/known-risks-and-questions.md`

## Task Routing

| If you want to... | Start with... | Then inspect... |
| --- | --- | --- |
| Connect the official API to this app | `AI_INTEGRATION_TASK.md` | `docs/sample-api-payload.json`, `scripts/validate-api-payload.mjs`, the mock endpoint in `scripts/server.mjs` |
| Know which systems an API integration replaces | `docs/api-mode-ownership-map.md` | `scripts/pull-angels-sword-data.js`, `scripts/update-lyrian-version.mjs` |
| Give this project to another AI or official integrator | `docs/ai-integration-scrape-notes.md` | `API_HANDOFF_README.md`, `docs/reusable-systems-map.md`, `scripts/test-cross-browser.mjs` |
| Understand API integration | `docs/api-integration-plan.md` | `assets/api-config.js`, `src/js/data-provider.js`, `src/js/api-data-provider.js`, `src/js/data-mapper.js` |
| Understand disabled security/auth placeholder | `assets/security-config.js` | `docs/api-integration-plan.md`, `docs/known-risks-and-questions.md` |
| Use this as a rules-logic reference | `docs/rules-logic-map.md` | `src/js/rules.js`, `src/js/state.js`, `src/js/constants.js`, `src/js/ui.js` |
| Understand class unlocks | `docs/rules-logic-map.md` | Search `src/js/rules.js` for `requirement`, `mastery`, `unlock`, `elemental` |
| Understand breakthroughs | `docs/rules-logic-map.md` | Search `src/js/ui.js` for `Elemental Affinity`, `repeatable`, `stackable`, `builderChoices` |
| Understand skills and expertise | `docs/rules-logic-map.md` | Search `src/js/constants.js`, `src/js/ui.js`, and `src/js/rules.js` for `expertise`, `Skill Training`, `skill point` |
| Understand equipment/items | `docs/reusable-systems-map.md` | Search `src/js/ui.js`, `src/js/rules.js`, and `src/js/io.js` for `equipment`, `inventory`, `Clim`, `quantity`, `material` |
| Understand ability use and resources | `docs/rules-logic-map.md` | Search `src/js/ui.js` and `src/js/rules.js` for `usePlayCost`, `AP`, `RP`, `Mana`, `temporary` |
| Understand spreadsheet/PDF/JSON import and export | `docs/state-and-data-contract.md` | `src/js/io.js`, `src/js/ui.js`, `scripts/test-cross-browser.mjs` |
| Understand character state | `docs/state-and-data-contract.md` | `src/js/state.js`, `src/js/io.js` |
| Understand dice and dice packs | `docs/dice-system-map.md` | `src/js/dice.js`, `assets/dice-3d/`, `assets/dice/`, `docs/dice-rendering-contract.md` |
| Understand expected behavior | `docs/test-behavior-map.md` | `scripts/test-cross-browser.mjs` |
| Find known problems and handoff warnings | `docs/known-risks-and-questions.md` | `docs/api-integration-plan.md` |

## How To Run

```powershell
npm install
npm start
```

Open the local URL shown in the terminal.

## How To Test

```powershell
npm test
```

This rebuilds `assets/app.bundle.js` and runs the cross-browser regression suite.

## Important Rules For Future Work

- Keep `assets/api-config.js` in static mode unless testing an official API intentionally.
- Keep `assets/security-config.js` disabled unless an official backend/security design is being tested.
- Do not place private API keys, passwords, or secret tokens in this browser app.
- Keep bundled static data working as a fallback.
- Treat `scripts/test-cross-browser.mjs` as a behavior contract, not just a browser test.
- Preserve technically legal cascading build paths. Do not block unusual class, race, breakthrough, item, or spell chains just because they are rare.
- Keep spreadsheet/PDF/JSON round trips working; many users may build digitally only to export a character.
- Active effects should resolve stat and resource references through the same sheet fields used by the live dashboard. Examples: Regrowth reads Focus, Root reads Agility, Axolotl Elixir reads Toughness, Presence Concealment modifies Stealth, and Haste/Bear Elixir/Stun/Weakened/Shaken use temporary AP/RP limits without permanently overwriting base fields.
- If moving this under the official Angel's Sword site, review the version update system before release.
- If another interface already exists, port the rules behavior and tests before copying visual UI.
- Preserve the Beta 1.9 downtime UX decisions unless the project owner explicitly revises them.
