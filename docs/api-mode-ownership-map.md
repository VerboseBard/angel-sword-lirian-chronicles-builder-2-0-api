# API-Mode Ownership Map - What Your Integration Replaces

This project was built WITHOUT access to an official API. Several of its
systems exist only to work around that: they scrape public data, bundle it,
and update it locally. The moment a real API feeds this app, those systems
change owners — some become your responsibility to replace, some become
development-only tools, and some become dead weight you can remove.

This document exists so nobody ships the workaround scaffolding into an
official deployment by accident.

## Summary Table

| Component | Role today (static mode) | Role under official API mode |
| --- | --- | --- |
| `assets/lyrian-data.js`, `assets/lyrian-detail-data.js`, `assets/versions/*` | THE data source | Offline/failure fallback only. Needs a staleness policy (see below) |
| `scripts/pull-angels-sword-data.js` | Scrapes public API/site into `data/angelssword/` | OBSOLETE for live data. Keep only to refresh the fallback bundle, or delete if you host the app yourself |
| `scripts/build-version-assets.mjs` | Builds bundled data files from pulled data | Same as above — fallback-refresh tooling only |
| `scripts/update-lyrian-version.mjs` + "Check for Updates" / "Download New Version" UI | Local rules-update system (checks the public site, plans downloads) | MUST BE REPLACED by your API's version list, or removed. Do not ship the current updater against an official backend |
| `scripts/server.mjs` local `/api/versions/*` endpoints | Dev-server support for the local updater | Dev-only. Never deploy this server; it is a development convenience |
| `scripts/server.mjs` `GET /builder/game-data` | Mock of the endpoint your API should provide | Reference implementation / test double. Your real endpoint replaces it in production; the mock stays for `npm test` |
| `assets/api-config.js` | Off by default | Your deployment flips this on with your base URL |
| `assets/security-config.js` | Disabled placeholder | Stays disabled until you design a real backend/auth flow. Never put secrets in it |
| `src/js/data-provider.js`, `api-data-provider.js`, `data-mapper.js`, `static-data-provider.js` | The integration surface | KEEP. This is the layer your data flows through |
| Spreadsheet/PDF/JSON import-export, rules logic, wizards, dice, tests | Product behavior | KEEP. None of this is scraping scaffolding |

## Known Limitation: Version Switching In API Mode

Today the in-app version manager switches rules versions by loading LOCAL
bundled script files (`assets/versions/<id>/lyrian-data.js`). In API mode this
has a sharp edge:

- The API payload replaces the version manifest at startup. If the manifest
  you serve lists only the served version, the switcher is effectively
  single-version. That is the safe configuration.
- If a saved character references an older rules version that exists in the
  LOCAL bundle, loading that save can pull the local bundled data in over the
  API data. The app will run, but the data source silently reverts for that
  session.

Treat API mode as single-version until you implement version-aware fetching:
the clean design is `GET /builder/game-data?version=<id>` (the local mock
already demonstrates it) plus a small change to `applyGameVersion()` in
`src/js/rules.js` to re-fetch from the provider instead of loading local
script assets when the active provider is the API.

## Fallback Staleness Policy (Decision Needed)

Bundled data remains the fallback when the API is unreachable. Under official
hosting you must decide:

- How old may the bundled fallback be before it is worse than an error page?
- Who regenerates it, and when? (The scrape scripts can do it at build time —
  that is the one legitimate long-term use they have left.)
- Should the app tell the player "you are on offline data from <date>"?

There is no code for this policy yet; it is intentionally left to the team
that controls the release pipeline.

## Rules Data Corrections Flow

Today, when the community discovers a rules misreading, the fix lands in this
repo's bundled data and logic. Under API mode, data corrections belong to the
API. Anything encoded in app logic (requirement parsing, unlock cascades,
effect formulas) still lives here — see `docs/rules-logic-map.md` and note
that a large share of rules behavior currently lives in `src/js/ui.js`
(a known refactoring debt, documented in `docs/known-risks-and-questions.md`).
