# AI Integration Task - Connect The Official API

This file is a ready-to-use task brief. If you are on the Angel's Sword team
(or working for them) and want an AI coding assistant such as Claude to do the
integration, give the assistant this whole file plus read/edit access to this
project folder. A human developer can follow it the same way.

Everything below this line is the task.

---

## Your Mission

Connect the official Angel's Sword game-data API to this character builder's
existing data-provider layer, so the app can load live rules data instead of
its bundled local copy — without breaking the bundled/static mode that must
remain the fallback.

You do NOT need to redesign the app. The provider layer is already built,
tested, and disabled by default. Your job is to make real data flow through it.

## What Already Exists

| Piece | File | Status |
| --- | --- | --- |
| Runtime config | `assets/api-config.js` | Disabled by default (`mode: "static"`) |
| Provider entry | `src/js/data-provider.js` | Working |
| API fetcher | `src/js/api-data-provider.js` | Working, expects one aggregate endpoint |
| Payload mapper | `src/js/data-mapper.js` | Working, validates and maps into app globals |
| Static fallback | `src/js/static-data-provider.js` | Working, the default path |
| Local mock of the expected endpoint | `scripts/server.mjs` → `GET /builder/game-data` | Working reference implementation |
| Payload contract example | `docs/sample-api-payload.json` | Generated, truncated example |
| Payload validator | `scripts/validate-api-payload.mjs` | Run it against your endpoint |
| API-mode regression tests | `scripts/test-cross-browser.mjs` | Run via `npm test` |

The app boots, checks `window.LYRIAN_API_CONFIG`, and if API mode is enabled
fetches `{apiBaseUrl}{gameDataPath}` (default `/builder/game-data`), maps the
payload onto `window.LYRIAN_DATA`, `window.LYRIAN_DETAIL_DATA`, and
`window.LYRIAN_VERSION_MANIFEST`, then renders. On any failure it falls back
to bundled data (`fallbackToStatic: true`).

## Important Mismatch You Must Resolve

The provider expects ONE aggregate endpoint returning all collections in a
single payload. The existing public API at `api.angelssword.com/ttrpg/...`
serves each resource separately (`/ttrpg/{version}/classes`, `/ttrpg/{version}/items`,
and so on). These do not match. Pick one of these two options:

### Option A (recommended): implement the aggregate endpoint server-side

Build `GET /builder/game-data` (any path is fine; it is configurable) on your
API. Make it return what the local mock returns. To see the exact expected
response, run:

```powershell
npm install
npm start
```

Then open `http://127.0.0.1:4180/builder/game-data` — that is a full,
working reference response built from this app's bundled data. A truncated
readable example is in `docs/sample-api-payload.json`. Support
`?version=<id>` the way the mock does if you want version switching later.

### Option B: teach the client your existing endpoints

Extend `src/js/api-data-provider.js` to fetch your existing per-resource
endpoints, aggregate them client-side, and hand the combined object to
`mapApiPayloadToLyrianGlobals()` in `src/js/data-mapper.js`. The scrape
script `scripts/pull-angels-sword-data.js` already contains working fetch and
field-mapping logic for those endpoints — port its mapping, do not reinvent it.
This option means more requests at app startup and more client code to
maintain; prefer Option A if you control the API.

## Payload Contract Essentials

- `data` must contain `version` (string) plus SIX array collections:
  `races`, `ancestries`, `classes`, `abilities`, `breakthroughs`, `items`.
- `detailData` contains THREE array collections: `races`, `ancestries`,
  `classes` — richer records with `descriptionHtml`, `descriptionText`,
  `lineageChoices` (demon clans), `keyAbility`, and `abilities`. If you omit
  `detailData`, detail views silently degrade to summary data.
- Every entry needs a stable string `id` and a `name`. Saves and lookups key
  on ids; changing ids breaks existing saved characters.
- `versionManifest` is optional. If you send one, list ONLY versions your API
  can serve, with no local `dataPath` entries.

Do not trust prose (including this file) over the validator:

```powershell
node scripts/validate-api-payload.mjs https://your-api.example.com/builder/game-data --compare-local
```

## Hard Rules

1. Static bundled mode must keep working. It is the default and the fallback.
   Do not remove bundled data or make startup depend on the network.
2. No secrets in this app. No API keys, passwords, or tokens — every file here
   ships to the browser. Anything requiring auth needs your own backend.
3. Do not weaken `src/js/data-mapper.js` validation to make a payload pass.
   Fix the payload instead. The validator tells you exactly what is wrong.
4. Preserve rare-but-legal build paths and the uncertainty labeling (inferred
   badges, GM overrides). See `docs/ai-integration-scrape-notes.md`.
5. Read `docs/api-mode-ownership-map.md` before touching the version-update
   system: parts of this project (the scrape scripts, the local
   Check-for-Updates flow) are development scaffolding that your integration
   replaces, not features to preserve.

## Acceptance Criteria

Run all of these; all must pass:

1. `node scripts/validate-api-payload.mjs <your-endpoint>` → `RESULT: PASS`.
2. `npm test` → green. This includes two API-mode regression tests: one
   proving API data drives the app end to end, one proving static fallback
   still works when the endpoint is unreachable. (On Windows PowerShell use
   `npm.cmd` if plain `npm` is blocked by execution policy.)
3. Manual check: set `assets/api-config.js` to
   `{ mode: "api", enabled: true, apiBaseUrl: "<your-api>" }`, run
   `npm start`, and confirm the status line reports data loaded from the API
   and a character can be built.
4. Manual check: break `apiBaseUrl` on purpose, reload, and confirm the app
   still starts on bundled data with a fallback status message.
5. CORS: confirm your API allows the origin the builder is hosted on
   (GitHub Pages origin or your own domain). Browser fetches fail without it.

## When You Are Done

- Leave `assets/api-config.js` committed in whatever mode the deployment
  should default to, and say so explicitly in your handback notes.
- Record which option (A or B) you implemented and why.
- List any payload fields the validator warned about that you chose to ship.
- Re-read `docs/known-risks-and-questions.md` and answer the open questions
  you now can (hosting origin, version endpoint, image URLs, save validation).
