# Beta 2.0 API Integration Plan

These instructions can be used by a developer or by an AI coding assistant with permission to read and edit this project folder. If an AI is making changes, it should treat this document as the integration map and should keep static bundled data working unless explicitly told to remove it.

For the full handoff map, read `AI_START_HERE.md` and `BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md` from the project root. For reusable systems beyond API work, read `docs/reusable-systems-map.md`.

For a compact AI-scrapable summary of the current reusable behavior and recent import/export fixes, read `docs/ai-integration-scrape-notes.md`.

## Goal

Beta 2.0 should be prepared for an official Angel's Sword API without making the current web build dependent on that API. The builder must still work from its bundled local data on GitHub Pages, from a local dev server, and from direct file startup.

Beta 2.0 starts from the reviewed Beta 1.9 crafting/gathering UX and carries forward the disabled-by-default API provider layer first built in Beta 1.6.

The safest approach is a data-provider layer:

- `StaticDataProvider` keeps using the bundled `assets/lyrian-data.js`, `assets/lyrian-detail-data.js`, and `assets/versions/manifest.js`.
- `ApiDataProvider` is optional and disabled by default.
- `DataMapper` translates an API response into the same `window.LYRIAN_DATA`, `window.LYRIAN_DETAIL_DATA`, and `window.LYRIAN_VERSION_MANIFEST` shapes the app already uses.
- The rest of the builder should not care whether data came from local files or the API.

## Current Data Flow

Today, `index.html` loads these scripts before the app bundle:

```html
<script src="assets/lyrian-form-map.js"></script>
<script src="assets/lyrian-data.js"></script>
<script src="assets/lyrian-detail-data.js"></script>
<script src="assets/versions/manifest.js"></script>
```

Those scripts place data on globals:

- `window.LYRIAN_FORM_MAP`
- `window.LYRIAN_DATA`
- `window.LYRIAN_DETAIL_DATA`
- `window.LYRIAN_VERSION_MANIFEST`

The builder code then builds internal lookup tables from those globals. That means API integration should not start by rewriting the builder. It should start by filling those same globals from a provider.

## New Beta 2.0 Flow

1. `index.html` loads `assets/api-config.js`.
2. Local bundled data still loads like before.
3. `src/js/main.js` starts the app.
4. Before rendering, `initializeDataProvider()` checks `window.LYRIAN_API_CONFIG`.
5. If API mode is disabled, the provider reports `static` and nothing changes.
6. If API mode is enabled, it requests game data from the official API.
7. `data-mapper.js` validates and maps the API payload.
8. The mapped data replaces `window.LYRIAN_DATA`, `window.LYRIAN_DETAIL_DATA`, and optionally `window.LYRIAN_VERSION_MANIFEST`.
9. `refreshGameDataRuntime()` rebuilds the app's lookup tables.
10. The builder renders using the active data source.

## Configuration

The integration is controlled by `assets/api-config.js`.

Default:

```js
window.LYRIAN_API_CONFIG = {
  mode: "static",
  enabled: false,
  apiBaseUrl: "",
  gameDataPath: "/builder/game-data",
  timeoutMs: 8000,
  fallbackToStatic: true,
  strict: false
};
```

To test a future official API:

```js
window.LYRIAN_API_CONFIG = {
  mode: "api",
  enabled: true,
  apiBaseUrl: "https://api.angelssword.com",
  gameDataPath: "/builder/game-data",
  timeoutMs: 8000,
  fallbackToStatic: true,
  strict: false
};
```

No private keys, passwords, or secret tokens should be placed in this config. This is a browser app. Anything shipped to the browser can be read by users.

Security/auth placeholders are controlled separately by `assets/security-config.js`. That file must remain disabled by default:

```js
enabled: false
mode: "off"
authRequired: false
```

Login, permissions, official character saving, paid/private content, or AI features need a backend design before this is enabled.

## Expected API Payload

The easiest API response shape is:

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

The mapper also accepts a looser response where the top level directly contains `version`, `races`, `classes`, etc. The official payload should still include stable IDs and names for every record.

Two shape rules that are easy to miss:

- `data` requires all six collections as arrays: `races`, `ancestries`, `classes`, `abilities`, `breakthroughs`, `items`.
- `detailData` requires only three collections: `races`, `ancestries`, `classes` — richer records carrying `descriptionHtml`, `descriptionText`, `lineageChoices`, `keyAbility`, and detailed `abilities`. This intentionally differs from the summary shape; the bundled detail data has never carried the other three collections.

## Testing The Contract Locally (No Official API Needed)

This build ships a working reference implementation of the expected endpoint plus tooling to verify a candidate payload:

- **Mock endpoint**: `npm start`, then `GET /builder/game-data` on the local server returns the full expected payload built from the bundled data. `?version=<id>` serves any locally bundled rules version; unknown versions return a 404 with the available list. See `handleMockGameData` in `scripts/server.mjs`.
- **Sample payload**: `docs/sample-api-payload.json` is a truncated, readable example (regenerate with `npm run api:sample`).
- **Validator**: `node scripts/validate-api-payload.mjs <url-or-file> [--compare-local]` checks any payload with the app's own mapper plus id/name/duplicate checks, and can diff entry counts and id sets against the bundled data. `npm run api:validate -- <url>` also works.
- **Regression tests**: `npm test` includes an API-mode pass against the mock endpoint (proving API data drives the app, including detail data survival) and a static-fallback pass against a missing endpoint.

## Known Mismatch With The Existing Public API

The provider expects ONE aggregate endpoint. The existing public API at `api.angelssword.com/ttrpg/...` serves each resource separately (`/ttrpg/{version}/classes`, `/ttrpg/{version}/items`, and so on). An official integration must either build the aggregate endpoint server-side (recommended — the mock endpoint is the reference) or extend `src/js/api-data-provider.js` to fetch and aggregate the per-resource endpoints client-side, reusing the field mapping already proven in `scripts/pull-angels-sword-data.js`. `AI_INTEGRATION_TASK.md` spells out both options with acceptance criteria.

## What The API Can Safely Handle First

Good first API targets:

- rule version list
- races and ancestry/subrace data
- class data and requirements
- ability data
- breakthrough data
- item data
- item image URLs
- patch notes/update notes

These are read-only data calls and fit the current app.

## Reusable Project Systems

If the official Angel's Sword site already has its own interface, this project can still be used as a working reference for rule interactions and player-facing helper systems.

### Rules Logic Reference

The main rules behavior lives across:

```text
src/js/rules.js
src/js/state.js
src/js/constants.js
src/js/ui.js
scripts/test-cross-browser.mjs
```

These files show how the builder currently connects race, ancestry, classes, class mastery, tier prerequisites, elemental mastery, breakthroughs, skills, expertise, equipment, ability costs, resource spending, temporary HP, and the play sheet.

The tests are especially useful as a behavior map because they describe what the app expects to work.

### Dice Roller And Dice Packs

The dice system is also a reusable area:

```text
src/js/dice.js
assets/dice-3d/dice-3d-embedded.js
assets/dice-3d/lyrian-accurate-dice.js
assets/dice-3d/new-angelsword-dice-face-art.384-webp.js
assets/dice/dice-pack-manifest.json
assets/dice/new-angelsword/
docs/dice-rendering-contract.md
```

This area covers animated rolls, custom Angel Sword dice art, dice tray behavior, dice pack metadata, fallback dice previews, and tests that guard against visual roll-overlay regressions.

## What Should Wait

These require a larger backend/auth design:

- user account login
- saving characters to official accounts
- loading official saved characters
- paid/private content permission checks
- GM campaign sync
- AI features using private API keys

Those are not safe to implement only inside a public GitHub Pages browser app.

## Known Risks And Holes

### Version Updates And Official Hosting

The current builder uses a local/GitHub-style update system for rules versions. It checks local version files and, when running on the local development server, can use local endpoints such as `/api/versions/check`, `/api/versions/download`, and `/api/versions/local`.

If this project is hosted under the official Angel's Sword site or connected to the official API, that update model needs to be reviewed. The official system may need API-provided version lists, server-managed release channels, account-aware content permissions, or a different deployment process entirely.

This is an integration point, not a finished official update strategy.

### CORS

If the builder is hosted on GitHub Pages, `https://api.angelssword.com` must allow that origin. Otherwise browser requests will fail even if the endpoint exists.

### Authentication

If the API requires login or secret keys, this static app cannot safely store those secrets. That would need a server-side proxy or official Angel's Sword hosting.

### Data Shape Drift

If API field names differ from the local generated data, the mapper must translate them. The first integration should use read-only data and compare it against local records.

### Missing Details

The builder uses both summary data and richer detail data. An API that only returns names without descriptions, requirements, costs, or images would make parts of the UI blank.

### Version Switching

The current app supports local version switching with downloaded JS files. API version switching needs a clear endpoint contract, such as `/builder/game-data?version=0.13.0`.

### Offline And File Startup

The app should not break when opened directly from disk or when the API is offline. The default remains static mode.

### Server-Side Validation

The browser can guide users, but it cannot be trusted as the final rules authority for official saved characters. Official account saves should be validated by the official backend.

## Recommended Implementation Phases

### Phase 1: API-Ready Skeleton

Add config, provider, mapper, runtime status, and documentation. Keep API disabled by default.

### Phase 2: Read-Only API Test

Use a test endpoint that returns the same shape as local data. Compare counts and key records against local data.

### Phase 3: Official Rule Data Source

Let the builder read official public data when enabled, with static fallback.

When official rule data changes, rerun the workbook import/export fixtures as well as the normal builder tests. API data changes can affect class unlocks, skill row mapping, item modifiers, custom equipment behavior, and exported workbook fidelity.

### Phase 4: Hosted Official Integration

If needed, host the builder under an Angel's Sword domain and add authenticated character-save features.

### Phase 5: AI And Advanced Tools

Add AI only through a backend that can protect API keys and validate permissions.
