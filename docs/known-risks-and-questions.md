# Known Risks And Questions

This document lists the main handoff risks for the Beta 2.0 API build.

Beta 2.0 combines the reviewed Beta 1.9 crafting/gathering UX with the disabled-by-default API provider layer first prepared in Beta 1.6. Treat the original Beta 1.6 API folder as the historical reference, not as a folder to overwrite.

## API And Hosting Risks

### CORS

If this builder runs from GitHub Pages, the official API must allow that origin. Otherwise browser fetches to `https://api.angelssword.com` will fail.

### Secrets

Do not put private API keys, passwords, or secret tokens in this app. It is a browser app, and users can inspect shipped files.

### Authentication

Official login, account saves, paid/private content, and permission checks need backend support. They should not be handled only by this static app.

`assets/security-config.js` is a disabled placeholder for future official backend/security work. It is not an active security system.

### API Shape

The app expects data that can map into:

```text
window.LYRIAN_DATA
window.LYRIAN_DETAIL_DATA
window.LYRIAN_VERSION_MANIFEST
```

If the official API has a different shape, `src/js/data-mapper.js` must translate it.

### Version Updates

The current update system is local/GitHub-style. Official hosting may need a different version and release process.

## Rules Risks

### Rules Are Still Being Discovered

Several important rule misunderstandings were found during Beta 1.4 and 1.5 work, including expertise, class unlocks, temporary HP, ability costs, item quantities, and elemental mastery unlocks.

Future review should assume more edge cases may exist.

### Tests Are Behavior Coverage, Not The Full Rulebook

The regression tests cover many discovered cases, but they are not a full formal specification.

### Some Logic Is In UI Files

Some builder rules live in `src/js/ui.js` because the app evolved iteratively. If porting to another system, extract behavior carefully instead of assuming all rules are isolated in `src/js/rules.js`.

### Rare Legal Build Paths

The builder should support technically legal cascading build paths, even if they look unusual or min-maxed. Recent review specifically corrected the design goal: these paths should not be blocked just because they bypass a more common mastery route.

Future audits should include race, ancestry, breakthrough, spell, proficiency, item, wand, class, and tier 3 interactions.

### Import/Export Drift

Many players may use the digital builder only long enough to export a character. Spreadsheet/PDF/JSON import and export should be treated as core behavior, not secondary convenience.

Recent fixes covered visible spreadsheet stats/resources, final-stat double-counting, skill row order, custom equipment modifiers, equipped armor booleans, hidden round-trip metadata, and HP tracker sync. New workbook templates or official API fields should be tested against these cases.

### Temporary HP

The current known rule is that temporary HP does not stack. Any official integration should confirm the final desired behavior for all ability/item cases that grant temporary HP.

### Food, Rest, And Consumables

Food/rest and item-use automation are a known future expansion area. The app has some inventory-use behavior, but a full food quality/rest/consumable system needs deeper rules review.

See `combat-access-crafting-audit.md` for the current review of potion access, alchemy rigs, held-item requirements, combat-ready storage, and consumable effect gaps.

### Crafting And Gathering

Crafting and gathering are now guided downtime workflows in the Beta 1.9/2.0 UI. They support recipe selection, material needs, purchase helpers, tool/facility/class checks, crafting points, gathering node setup, access warnings, strike rolls, and inventory/result handling.

Known remaining risk: the gathering workflow still needs deeper functional regression tests matching the crafting outcome test. Several gathering node presets remain GM drafts where the rules do not provide exact HP, Node Points, Lucky Points, yields, or required abilities.

## Dice Risks

### Visual Overlay

The dice system previously had a problem where a dark floor/overlay visibly dimmed the sheet. Tests now guard against this, but any dice renderer changes should be visually checked.

### Asset Availability

New dice packs need complete assets or reliable fallback previews.

## Data Risks

### Generated Data

Runtime data is generated into `assets/*.js` files. Source data also exists under `data/angelssword/`, but the app primarily runs from the bundled assets.

### Stable IDs

Class, item, ability, breakthrough, race, and ancestry IDs need to remain stable for saves and lookups.

### Old Saves

Existing browser saves may contain older data assumptions. Version migration should be handled carefully.

## Open Questions For Official Integration

- Will the API expose public read-only rules data?
- Will API access be allowed from GitHub Pages?
- Will the builder be hosted under an Angel's Sword domain?
- Will official account login be required?
- What endpoint returns rule versions?
- What endpoint returns full game data?
- Are item images served by the API or static CDN paths?
- Should official character saves be supported?
- Should the API validate character builds server-side?
- Should dice packs be local assets, API-provided, or user-downloadable packs?
- How should official updates replace the current local `Check for Updates` flow?
