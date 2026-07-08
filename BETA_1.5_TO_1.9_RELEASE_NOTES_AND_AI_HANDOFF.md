# Beta 1.5 To Beta 1.9 Release Notes And AI Handoff

Last updated: 2026-07-07

This document summarizes what changed from the stable Beta 1.5 baseline through Beta 1.9, and how those changes connect to the AI/API handoff material that started in the Beta 1.6 API build.

## Review Verdict

Beta 1.9 is a clean reviewed downtime UX build.

Checks run on 2026-07-07:

- `npm.cmd test`: passed. Rebuilt `assets/app.bundle.js` and ran the Chromium, Firefox, and WebKit regression suite.
- `npm.cmd run audit:minmax`: passed. No tier 3+ missing-foundation class-path issues were reported.
- `npm.cmd audit --audit-level=moderate`: passed with `0 vulnerabilities`.
- Focused browser smoke: crafting/gathering mode tabs, wizard entry, recipe selection, and gathering node draft cards were checked during the 1.9 pass.

Known remaining risks:

- The suite now has a functional crafting outcome regression, but gathering still needs deeper functional tests for node progress, repeat attempts, and awarded inventory.
- Some crafting/gathering rules are still inferred where the official rules do not give exact recipe or node details. The UI labels these cases as inferred, GM draft, or GM permission.
- A large amount of downtime behavior still lives in `src/js/ui.js`; a later hardening pass should extract reusable crafting/gathering profile helpers.

## Beta 1.5 Baseline

Beta 1.5 is the stable static/public baseline. It intentionally does not contain the API provider layer.

Important behavior carried forward:

- Character builder and live play sheet.
- Local rules versions `0.12.5`, `0.12.6`, and `0.13.0`, with fresh characters defaulting to the latest bundled version.
- Browser save/load.
- JSON, PDF, and spreadsheet export/import.
- Improved workbook import/export behavior from the earlier Roland/Masaru testing pass.
- Static browser/GitHub Pages deployment shape.

Beta 1.5 remains the clean static anchor for comparing later non-API work.

## Beta 1.6 API Build

Beta 1.6 was the API/handoff experiment and documentation package.

Important additions:

- Disabled-by-default API provider layer:
  - `assets/api-config.js`
  - `src/js/data-provider.js`
  - `src/js/api-data-provider.js`
  - `src/js/data-mapper.js`
  - `src/js/static-data-provider.js`
- AI/developer handoff docs:
  - `AI_START_HERE.md`
  - `API_HANDOFF_README.md`
  - `docs/api-integration-plan.md`
  - `docs/ai-integration-scrape-notes.md`
  - `docs/reusable-systems-map.md`
  - `docs/rules-logic-map.md`
  - `docs/state-and-data-contract.md`
  - `docs/test-behavior-map.md`
  - `docs/known-risks-and-questions.md`

Key rule from 1.6:

- Static bundled data must continue to work.
- API mode stays off unless intentionally enabled.
- No private API keys, passwords, or secret tokens belong in the browser app.

## Beta 1.7 Crafting And Gathering Workstream

Beta 1.7 started from the clean 1.5 static baseline and focused on downtime systems rather than API integration.

Major changes:

- Added Combat / Crafting / Gathering play modes.
- Built the first dedicated Crafting and Gathering front-facing interfaces.
- Removed combat-only sheet clutter from crafting/gathering views.
- Added recipe picker, recipe categories, quick filters, item/manual mode, and shop concept.
- Added build outline visuals for recipe types:
  - potion bottle / elixir
  - shield
  - armor, clothing, cloak
  - weapon and tool forms
- Added recipe material slots showing required quantity, owned quantity, missing quantity, and standard/custom prices.
- Added purchase buttons for missing materials when a standard or custom price is available.
- Added crafting dice, crafting points, spent/available tracking, and recipe point spend controls.
- Added required tool, helper tool, facility, and class support cards.
- Added facility levels and use tracking, with facility bonuses applied to the relevant crafting skill checks.
- Added gathering node drafts, node setup, required tool/ability display, node points, lucky points, strike dice, and node HP tracking.
- Added GM override for gathering readiness so a GM can allow a gather even when a tool or class ability is missing.
- Added collapsible notes/support/reference sections to reduce noise.
- Added item artwork in the blueprint area where matching item images are available.

Important 1.7 design decision:

- Missing materials, tools, class access, and GM-only uncertainties should warn the player clearly, but most downtime steps should not over-police legal play. The GM can override uncertain cases.

## Beta 1.8 Guided Downtime Wizards

Beta 1.8 rebuilt the 1.7 crafting/gathering dashboards into guided workflows.

Crafting wizard:

1. Recipe
2. Materials
3. Support
4. Rolls
5. Complete

Gathering wizard:

1. Node
2. Readiness
3. Strikes
4. Finish

Major changes:

- Replaced the old dashboard layout with step-by-step guided workflows.
- Added persistent wizard summary chips.
- Added Continue/Back navigation.
- Added crafting success/failure resolution.
- Craft success adds the crafted item to inventory and consumes materials.
- Craft failure consumes materials by default but labels that as GM-adjustable because the official failure consequences are unclear.
- Added undo for resolved craft outcomes.
- Fixed duplicate crafting outcome resolution so `Craft Succeeded` / `Craft Failed` cannot duplicate inventory/log entries.
- Added a functional regression test for duplicate craft outcome prevention.
- Added Playwright close timeouts so browser-close hangs do not leave the test suite stuck after screenshots.

Important 1.8 design decision:

- The guided wizard is the primary crafting/gathering interface. Do not resurrect the old dashboard as accidental dead code.

## Beta 1.9 New Player Downtime UX

Beta 1.9 starts from the hardened 1.8 baseline and focuses on clarity for new players.

Major changes:

- Renamed wizard steps into action language:
  - Choose Recipe
  - Gather Materials
  - Check Support
  - Roll Points
  - Resolve Craft
  - Choose Node
  - Check Access
  - Roll Strikes
  - Resolve Gather
- Added goal and next-action coach text for each wizard step.
- Replaced one-line "Soft gate" language with clearer guidance and warning panels.
- Disabled the crafting Continue button only on the empty recipe-selection state, because there is nothing meaningful to continue to before choosing a recipe.
- Kept missing material/tool/class/ability warnings as soft GM-facing gates after a selection exists.
- Fixed the 4-step gathering wizard navigation so it uses four columns instead of a phantom fifth column.
- Improved gathering resource draft cards with dedicated header/meta/yield/requirement layout.
- Fixed gathering resource card overlap by forcing multi-column resource-card grids to size rows by content.
- Preserved accessibility improvements by keeping hidden mode panels paired with `aria-hidden`.

## AI Handoff Connection

The 1.6 handoff docs remain the best map for API integration, rules logic, state/import/export contracts, test behavior, and known risks.

For any future AI/developer working from 1.9 or a promoted API build:

1. Read this file first for the 1.5 to 1.9 timeline.
2. Read `AI_START_HERE.md` and `API_HANDOFF_README.md` if the build includes the API handoff layer.
3. Read `docs/api-integration-plan.md` before changing API behavior.
4. Read `docs/state-and-data-contract.md` before changing save/import/export state.
5. Read `docs/test-behavior-map.md` before changing tests.
6. Preserve the 1.9 downtime UX decisions unless the owner explicitly revises them.

## Beta 1.9 Post-Promotion Fixes (2026-07-07, Synced Into 2.0)

After the 2.0 promotion snapshot was taken, Beta 1.9 received one more fix
session. Those changes were reviewed, verified by 1.9's own full test run,
and then synced into this 2.0 build (see the git history: the sync is its own
tagged commit). What that session added:

- Gathering outcome resolution guard: finishing a gathering attempt now
  records a `lastGatheringOutcome` snapshot, blocks double-finishing, renders
  the Resolve Gather step in a resolved state (explains yield or no-yield,
  progress reset, node depletion), disables Finish/Reset once resolved, and
  routes forward through Repeat This Node / Pick A New Node. This mirrors the
  crafting outcome guard from Beta 1.8.
- Breakthrough EXP overflow: breakthrough purchases beyond the creation
  budget now spend from normal XP. The budget panel shows Creation
  Breakthrough EXP / Normal XP Spent / Available; the Exp field is
  decremented and Spirit Core incremented through `applyBreakthroughExpDelta`
  across every add/remove path (toggle, elemental affinity, repeatable,
  stackable).
- Compact locked breakthrough cards: locked elemental-affinity, repeatable,
  and stackable breakthrough cards render compact (2-line clamp, no choice
  controls) with an inspect action to expand them.
- Per-type gathering node icons: mining, farming, foraging, and husbandry
  nodes render dedicated SVG icons with per-type card styling.
- Clearer no-yield messaging when finishing a gathering attempt below the
  Node Point target.

New regression tests from that session (now part of this build's suite):

- `runGatheringNoYieldResolutionAssertion` - the first functional gathering
  wizard test, closing the long-standing backlog item.
- A breakthrough general-XP spending assertion (Exp 5200 -> 5050, Spirit
  Core 1400 -> 1550 for a 150-cost purchase past the creation budget).
- A compact locked breakthrough card layout assertion.

## Promotion To Beta 2.0 API Build

The recommended promoted package is a new copy, not an overwrite of the historical 1.6 API folder:

`Angel Sword Lirian Chronicles Beta 2.0 API build`

Beta 2.0 should combine:

- The Beta 1.9 crafting/gathering/new-player UX.
- The Beta 1.6 disabled-by-default API provider layer.
- A disabled-by-default security config placeholder for future official backend/auth work.
- Updated handoff docs that explain the 1.9 downtime system and the preserved API/security defaults.

The historical 1.6 API folder should remain intact as the original integration reference unless the owner explicitly asks to replace it.
