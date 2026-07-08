# AI Integration Scrape Notes

This document is a compact handoff for another AI assistant, official site developer, or API integrator. It lists the most reusable behavior and the recent fixes that should not be lost if this project is scraped, ported, or compared against another character builder.

## Core Principle

If a build path is technically legal by the rules, the builder should allow it and make it function. Do not block unusual cascading paths just because they look like min-maxing.

Examples of legal cascading behavior to preserve:

- race, ancestry, or breakthrough grants an unlock
- that unlock qualifies the character for a class
- that class grants a proficiency, spell, mastery, or item access
- that new access qualifies the character for another class, ability, item, or spell path
- items and wands may grant access to spells or effects that affect later choices

The system should calculate these connections rather than relying only on simple fixed prerequisite lists.

## Best Files To Scrape First

```text
AI_START_HERE.md
API_HANDOFF_README.md
docs/api-integration-plan.md
docs/reusable-systems-map.md
docs/rules-logic-map.md
docs/state-and-data-contract.md
docs/test-behavior-map.md
docs/known-risks-and-questions.md
scripts/test-cross-browser.mjs
src/js/rules.js
src/js/ui.js
src/js/state.js
src/js/io.js
src/js/constants.js
```

## API Integration Shape

The Beta 2.0 API build currently runs from bundled static data, but it has a provider layer ready for an official read-only game-data API. That provider layer was first prepared in the historical Beta 1.6 API build, then carried forward into the Beta 2.0 promotion of the reviewed Beta 1.9 crafting/gathering experience.

Important files:

```text
assets/api-config.js
assets/security-config.js
src/js/data-provider.js
src/js/api-data-provider.js
src/js/data-mapper.js
src/js/static-data-provider.js
```

Expected first API job:

- public rule version list
- races and ancestries
- classes and class requirements
- abilities and costs
- breakthroughs and choice effects
- items, equipment, requirements, modifiers, and images
- patch notes or update notes

Do not place private API keys or secrets in the browser app. Account saves, private content, permissions, and official validation need a backend.

## Beta 1.9 / 2.0 Downtime UX To Preserve

Crafting and gathering are not minor side tabs in the promoted build. They are guided play modes.

Preserve these behaviors:

- Combat, Crafting, and Gathering mode tabs must switch reliably.
- Crafting uses a staged workflow: choose recipe, gather materials, check tool/facility/class support, roll/spend points, resolve outcome.
- Gathering uses a staged workflow: choose node, check access, roll strikes, resolve/handle yield.
- Missing tools, classes, materials, abilities, or GM permissions are visible player-facing warnings.
- GM overrides can allow table rulings without pretending the missing rule support exists.
- Node draft cards must remain readable; no clipped or overlapping card rows.
- Craft outcome resolution must not duplicate inventory/log entries when clicked repeatedly.
- Gathering outcome resolution must not double-award: once an attempt is finished, the Resolve Gather step shows the recorded outcome, Finish/Reset are disabled, and play continues through Repeat This Node or Pick A New Node.
- Breakthrough purchases past the creation budget spend normal XP: the Exp field is decremented and Spirit Core incremented, the budget chips show Creation Breakthrough EXP / Normal XP Spent / Available, and removing the purchase refunds the XP.
- Locked breakthrough cards render compact with an inspect-to-expand action; unlocking or selecting them expands the full controls.

## Recent Import And Export Fixes To Preserve

Spreadsheet import/export was updated after comparing real Roland Beaumont and Masaru workbooks against the live sheet.

Preserve these behaviors:

- visible workbook stat/resource values can be trusted during import
- imported final stats must not be double-counted by builder bonuses
- conditional or temporary bonus text should not become permanent math
- blank ancestry should not default to a real ancestry
- class rows with blank level and zero cost should be ignored
- visible Core equipment and weapon rows should import even when the Inventory sheet is sparse
- skill imports and exports must use the visible spreadsheet skill row order, not only the internal skill definition order
- custom equipment modifiers should import into the live sheet and export back into the workbook
- equipped armor checkboxes must export as real spreadsheet booleans
- breakthrough requirements should export along with names and costs
- exported spreadsheets should include hidden round-trip metadata for exact app-state recovery

Important implementation files:

```text
src/js/ui.js
src/js/io.js
scripts/test-cross-browser.mjs
```

## Active Effect Formula Automation To Preserve

Active effects can contain resolvable rule formulas. Do not leave these as plain reminder text when the referenced sheet value exists.

Current linked cases:

- Haste grants +2 current AP, and spending/recovery respects the temporary AP limit until the effect is cleared.
- Regrowth snapshots the current Focus value and displays `3 + Focus = HP` for start-of-turn healing.
- Presence Concealment applies +5 Stealth through active skill-check modifiers.
- Root snapshots the current Agility value, sets Speed to 0, and sets Dodge to `13 + Agility`.
- Bear Elixir comes from inventory use, applies an active effect that raises RP max by 1, and grants one current RP without using the old manual max-resource warning.
- Axolotl Elixir comes from inventory use, applies true damage equal to Toughness x 5, and snapshots Toughness for the start-turn HP reminder.
- Shaken reduces AP max by 1 without compounding across renders.
- Weakened sets AP max to 2 and RP max to 1 while active.
- Stun sets AP max/recovery and RP max to 0 while active.

Important implementation files:

```text
src/js/rules.js
src/js/ui.js
scripts/test-cross-browser.mjs
```

Useful search targets:

```text
getActivePlayEffectModifierSummary
getActivePlayResourceCurrentLimit
getActivePlaySkillCheckModifier
MANUAL_PLAY_EFFECT_OPTIONS
applyPlayEffectResourceGrant
```

## Regression Characters

The current regression coverage includes two important workbook-style characters:

### Roland Beaumont

Useful for checking:

- Human plus Ancient Marionette import behavior
- visible final stats and resources
- multi-class import without placeholder class rows
- custom/visible equipment fallback
- HP tracker sync

### Masaru

Useful for checking:

- Youkai plus Oni lineage behavior
- In Sync and Powerful Ki breakthrough import
- Intimidation and Negotiation visible-row mapping
- custom armor that increases Block
- HP tracker sync at 65 / 65
- spreadsheet export of custom inventory, equipped armor boolean, skill rows, and hidden metadata

## Tests As Portable Rule Evidence

The main behavior contract is:

```powershell
npm test
```

The most useful test file is:

```text
scripts/test-cross-browser.mjs
```

When the official rules update, add a small fixture for each newly discovered interaction and keep old fixtures passing unless the rulebook intentionally changes.

## Integration Advice For Another Interface

If the official site already has its own UI, do not start by copying this visual interface. Reuse or port these parts first:

- data provider shape
- rules unlock logic
- cascading prerequisite calculations
- builder state model
- spreadsheet/PDF/JSON round-trip behavior
- dice and live sheet helper behavior
- regression fixtures

The UI can be different as long as the behavior and exported character data remain correct.
