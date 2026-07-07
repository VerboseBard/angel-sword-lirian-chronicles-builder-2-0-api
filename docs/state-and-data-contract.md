# State And Data Contract

This document explains the current data shapes and state boundaries. It is meant for API integration, AI review, and possible porting into another official interface.

## Static Data Globals

The current app expects these globals to exist before the app renders:

```text
window.LYRIAN_FORM_MAP
window.LYRIAN_DATA
window.LYRIAN_DETAIL_DATA
window.LYRIAN_VERSION_MANIFEST
```

They are loaded from:

```text
assets/lyrian-form-map.js
assets/lyrian-data.js
assets/lyrian-detail-data.js
assets/versions/manifest.js
```

The API-ready provider layer can replace these globals before the app builds its lookups.

## Data Provider Files

```text
assets/api-config.js
src/js/data-provider.js
src/js/api-data-provider.js
src/js/static-data-provider.js
src/js/data-mapper.js
```

Default behavior:

```js
mode: "static"
enabled: false
```

That means the app uses bundled local data.

## Expected API Shape

The simplest future API response should look like this:

```json
{
  "ok": true,
  "source": "official-api",
  "data": {
    "version": "0.13.0",
    "races": [],
    "ancestries": [],
    "classes": [],
    "abilities": [],
    "breakthroughs": [],
    "items": []
  },
  "detailData": {
    "version": "0.13.0",
    "races": [],
    "ancestries": [],
    "classes": [],
    "abilities": [],
    "breakthroughs": [],
    "items": []
  },
  "versionManifest": {
    "schema": 1,
    "defaultVersion": "0.13.0",
    "latestKnownVersion": "0.13.0",
    "versions": []
  }
}
```

Required collections:

```text
races
ancestries
classes
abilities
breakthroughs
items
```

Every record should have stable IDs and display names. Many features also need descriptions, requirements, costs, images, tags/keywords, and class/race relationships.

## App State

The main runtime state is in:

```text
src/js/state.js
```

Important state areas include:

- character fields
- selected game version
- selected race and ancestry
- selected classes
- class progression
- selected breakthroughs
- builder choices
- skill allocations
- selected equipment and quantities
- play resources
- player notes and combat log

The exact state object can change over time, so another implementation should inspect `createDefaultState()` and the state mutation helpers before porting behavior.

## Save And Export

Save/export/import behavior lives mainly in:

```text
src/js/io.js
src/js/state.js
src/js/ui.js
```

Supported behavior includes:

- browser save slots
- JSON export/import
- PDF export with embedded state
- spreadsheet import/export
- visible spreadsheet Core grid parsing
- custom inventory and equipment import/export
- hidden spreadsheet metadata for exact round trips
- saved character recovery

If official account saving is added later, do not blindly reuse local browser-save behavior as the server contract. Use it as a client-side draft/snapshot format and validate official saves on the backend.

## Spreadsheet Round-Trip Contract

The spreadsheet path serves two audiences:

- users who want a readable workbook after building digitally
- the app itself, which needs enough hidden metadata to recover the exact character state later

The visible workbook grid should remain useful even without the app. The hidden metadata should remain authoritative for exact app round trips.

Important behaviors to preserve:

- import visible final stats/resources without double-counting builder bonuses
- sync HP tracker from imported final HP
- import visible skill rows by their spreadsheet labels/order
- export skill rows back to the same visible template rows
- import/export custom weapons, armor, inventory, and equipment modifiers
- export equipped checkboxes as real spreadsheet booleans
- export breakthrough requirements as well as names and costs
- preserve `builder.importedFinalStats` in compact snapshots so round trips do not recalculate imported totals incorrectly

## Version Data

Version metadata lives in:

```text
assets/versions/manifest.json
assets/versions/manifest.js
assets/versions/<version>/lyrian-data.js
assets/versions/<version>/lyrian-detail-data.js
```

The current local update helper uses:

```text
scripts/server.mjs
scripts/update-lyrian-version.mjs
scripts/build-version-assets.mjs
scripts/pull-angels-sword-data.js
```

If this becomes official hosted software, version updates should probably move to API-managed version records instead of local dev endpoints.

## Data Source Archives

The project also contains pulled/source data under:

```text
data/angelssword/raw/
data/angelssword/decoded/
data/angelssword/joined/
```

These can help another AI understand where generated local data came from, but the primary runtime files are the `assets/*.js` data bundles.

## Integration Rule

The safest integration rule is:

> Make the API return or map into the existing runtime data shape first. Only after that works should the internal builder logic be refactored.
