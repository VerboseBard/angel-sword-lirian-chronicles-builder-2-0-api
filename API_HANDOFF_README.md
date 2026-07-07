# Angel Sword Character Builder - API Handoff

These instructions can be given to a developer or run through an AI coding assistant such as Codex, Gemini, Claude, or another tool, as long as that AI has permission to read and edit this project folder. The AI should read this file first, then read `docs/api-integration-plan.md`, before changing code.

This is the Beta 2.0 API-ready build of the Lyrian Chronicles character builder.

The app currently works from bundled local game data. API mode is prepared but disabled by default. This folder combines the reviewed Beta 1.9 crafting/gathering experience with the API handoff scaffolding first prepared in Beta 1.6.

The historical `Angel Sword Lirian Chronicles Beta 1.6 API build` folder remains the original API reference. Do not overwrite it unless the project owner explicitly asks.

## Recommended Reading Order

If handing this folder to another developer or AI assistant, start here:

```text
AI_START_HERE.md
API_HANDOFF_README.md
docs/api-integration-plan.md
docs/ai-integration-scrape-notes.md
docs/reusable-systems-map.md
BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md
```

Then use the focused notes:

```text
docs/rules-logic-map.md
docs/state-and-data-contract.md
docs/dice-system-map.md
docs/test-behavior-map.md
docs/known-risks-and-questions.md
```

## How To Run

1. Install Node.js if needed.
2. Open this folder in a terminal.
3. Run:

```powershell
npm install
npm start
```

4. Open the local URL shown in the terminal.

## Where API Integration Starts

Read this first:

```text
docs/api-integration-plan.md
```

Main files:

```text
assets/api-config.js
src/js/data-provider.js
src/js/api-data-provider.js
src/js/data-mapper.js
src/js/static-data-provider.js
assets/security-config.js
```

## If You Already Have Your Own Interface

This project can still be useful even if the official Angel's Sword site already has its own UI.

The most reusable parts are the rule-connection logic and supporting systems, not necessarily the visual layout.

Start here:

```text
src/js/rules.js
src/js/state.js
src/js/constants.js
src/js/ui.js
scripts/test-cross-browser.mjs
```

What these files help demonstrate:

- class prerequisite and mastery unlock logic
- tier 2 and tier 3 class connections
- elemental mastery class unlocks
- technically legal cascading build paths, including rare race, breakthrough, item, spell, and class chains
- race, ancestry, breakthrough, and class interactions
- repeatable and choice-based breakthroughs
- skill and expertise tracking
- equipment costs, quantities, and inventory behavior
- spreadsheet/PDF/JSON import and export behavior
- ability AP/RP/Mana spending behavior
- temporary HP and resource handling
- expected behavior captured as regression tests

If another interface wants to reuse this work, treat this project as a working rules-logic reference. Extract or translate the rules behavior first, instead of copying the visual UI by default.

For a fuller map, read:

```text
docs/reusable-systems-map.md
docs/rules-logic-map.md
docs/state-and-data-contract.md
docs/ai-integration-scrape-notes.md
```

## Dice Roller And Dice Pack System

This project also contains a reusable dice roller and dice asset system. If the official site wants animated dice, custom dice sets, or user-selectable dice packs, this area is worth reviewing.

Important files:

```text
src/js/dice.js
assets/dice-3d/dice-3d-embedded.js
assets/dice-3d/lyrian-accurate-dice.js
assets/dice-3d/new-angelsword-dice-face-art.384-webp.js
assets/dice/dice-pack-manifest.json
assets/dice/new-angelsword/
docs/dice-rendering-contract.md
```

Useful behavior already explored here:

- clickable roll buttons on the character sheet
- animated dice roll display
- custom Angel Sword dice art
- dice tray support
- dice pack manifest structure
- fallback dice preview assets
- tests guarding against the dice overlay darkening the page

If more dice sets are added later, the likely path is to extend the dice pack manifest and add matching image/texture assets, then make sure the dice renderer can select them without affecting the rest of the sheet.

For a fuller dice handoff, read:

```text
docs/dice-system-map.md
```

## Current Default

`assets/api-config.js` is set to:

```js
mode: "static"
enabled: false
```

That means the app uses the bundled local files:

```text
assets/lyrian-data.js
assets/lyrian-detail-data.js
assets/versions/manifest.js
```

`assets/security-config.js` is set to:

```js
enabled: false
mode: "off"
authRequired: false
```

That means security/auth integration is documented but inactive by default.

## Future API Mode

To test an official API, change `assets/api-config.js` to:

```js
mode: "api"
enabled: true
apiBaseUrl: "https://api.angelssword.com"
```

The expected endpoint is controlled by:

```js
gameDataPath: "/builder/game-data"
```

## Version Update Warning

The current builder has a local/GitHub-style version update system for rules data. If this project is moved under the official Angel's Sword website or API system, that updater should be reviewed before release.

The official site may need a different update flow, such as:

- API-provided rule version lists
- server-managed release channels
- official deployment pipelines
- account-aware or permission-aware content updates
- removal or replacement of the current local dev update endpoints

Do not assume the current `Check for Updates` / `Download New Version` behavior is final for an official hosted build.

## Expected API Job

The API should provide read-only game data first:

- races
- ancestries and subraces
- classes
- abilities
- breakthroughs
- items
- rule versions
- patch notes or update notes

The app expects that data to be mapped into the same shape as the current bundled local data.

## Recent Import/Export Handoff Notes

Spreadsheet import and export were recently checked against real Roland Beaumont and Masaru character workbooks. The current behavior preserves visible workbook stats/resources, avoids double-counting imported final stats, imports custom equipment from visible Core rows, maps spreadsheet skill rows by label/order, exports custom inventory and equipped armor booleans, and embeds hidden state metadata for exact spreadsheet round trips.

These behaviors are part of the handoff contract now. If another official interface ports this work, keep the Roland and Masaru-style fixtures or recreate equivalent tests.

## Important Warning

Do not put private API keys, passwords, or secret tokens into this browser app. Anything inside this app can be seen by users.

If login, official character saving, private data, paid content, or AI features are needed, those must be handled by an official backend/server.
