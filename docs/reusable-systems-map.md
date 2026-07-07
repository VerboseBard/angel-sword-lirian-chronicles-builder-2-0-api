# Reusable Systems Map

This project can be useful even if another team does not use the visual interface. The most valuable parts are the working examples of how game data, rules, choices, resources, dice, inventory, and tests connect.

## System Overview

| System | Why It Is Useful | Primary Files |
| --- | --- | --- |
| API provider layer | Shows how to switch between bundled static data and future official API data. | `assets/api-config.js`, `src/js/data-provider.js`, `src/js/api-data-provider.js`, `src/js/data-mapper.js`, `src/js/static-data-provider.js` |
| Rules engine | Shows class unlocks, derived stats, selected records, requirements, and resource calculations. | `src/js/rules.js` |
| Character state | Shows how a character's choices and play resources are stored. | `src/js/state.js`, `src/js/io.js` |
| Constants and fixed options | Holds core skill/stat labels, builder steps, class limits, starting values, and dice set config. | `src/js/constants.js` |
| Builder choice logic | Shows how race, ancestry, breakthroughs, classes, skills, and equipment choices are presented and resolved. | `src/js/ui.js` |
| Skill and expertise model | Shows broad skill points, named expertise, expertise stacking, and sheet roll integration. | `src/js/constants.js`, `src/js/rules.js`, `src/js/ui.js` |
| Breakthrough model | Shows repeatable choices, stackable breakthroughs, Elemental Affinity, Language Training, Weapon Training, and Skill Training behavior. | `src/js/ui.js`, `src/js/rules.js` |
| Equipment and materials | Shows purchasing, quantities, generated material cards, remaining Clim, and inventory carry-forward. | `src/js/ui.js`, `src/js/rules.js`, `src/js/io.js` |
| Ability/resource use | Shows AP/RP/Mana spending, variable cost buttons, resource trackers, temporary HP, and ability reference handling. | `src/js/ui.js`, `src/js/rules.js` |
| Dice roller | Shows animated dice, custom dice art, dice tray, dice pack manifest, and fallback previews. | `src/js/dice.js`, `assets/dice-3d/`, `assets/dice/`, `docs/dice-rendering-contract.md` |
| Save/export/import | Shows browser saves, JSON import/export, PDF embedding, spreadsheet import/export, visible workbook grid mapping, custom inventory carry-forward, and character state recovery. | `src/js/io.js`, `src/js/state.js`, `src/js/ui.js` |
| Version manager | Shows local rules version selection and update behavior that would need review for official hosting. | `src/js/rules.js`, `src/js/ui.js`, `scripts/server.mjs`, `scripts/update-lyrian-version.mjs` |
| Regression tests | Shows expected behavior for many rules and UI flows. | `scripts/test-cross-browser.mjs` |

## Best Use If Another Interface Already Exists

If the official site has its own interface, do not start by copying the visual UI. Instead:

1. Read the behavior docs.
2. Identify the rules or helper system you want.
3. Locate the source files and tests listed above.
4. Extract the behavior into your own architecture.
5. Port or recreate the matching regression tests.

## Good Systems To Reuse Directly Or Translate

### Rules Relationships

Useful for making sure all build choices connect correctly:

- class mastery
- tier 2 and tier 3 class prerequisites
- "any of these classes mastered" unlocks
- elemental mastery unlocks
- race and ancestry grants
- breakthrough grants
- skill and expertise grants
- item, spell, proficiency, and class chains that become legal through earlier choices

Start with `docs/rules-logic-map.md`.

### Import And Export Round Trips

Useful for supporting users who want to build a character digitally and then leave with a workbook, PDF, or JSON file.

Preserve these behaviors:

- visible spreadsheet values import into the live sheet
- exported spreadsheets keep visible Core rows useful for spreadsheet users
- hidden metadata preserves exact app state for round-trip imports
- custom equipment and inventory survive import/export
- equipped checkbox values export as spreadsheet booleans
- health tracker values sync from imported final HP

Start with `docs/state-and-data-contract.md` and `docs/ai-integration-scrape-notes.md`.

### Data Provider And API Shape

Useful for replacing local bundled data with official data.

Start with `docs/api-integration-plan.md` and `docs/state-and-data-contract.md`.

### Dice System

Useful if the official site wants:

- animated dice
- custom dice art
- selectable dice packs
- a dice tray
- roll buttons tied to character sheet values

Start with `docs/dice-system-map.md`.

### Tests As Documentation

Useful if another implementation wants to prove it behaves the same way.

Start with `docs/test-behavior-map.md`.

## What To Be Careful With

- Some rule behavior currently lives in UI helpers because the builder grew iteratively.
- Some source data is pulled from generated `assets/*.js` files and normalized at runtime.
- The current update system is meant for local/static builds, not necessarily official hosted integration.
- A browser app cannot protect private API keys.
- The tests are valuable, but they are not a complete formal rulebook.
- Rare legal build paths are intentional behavior. Porting work should calculate them, not simplify them away.
