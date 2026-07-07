# Lyrian Chronicles Character Builder - Beta 2.0 API Build

This is the local Beta 2.0 API build for the Angel Sword character builder and live play sheet.

It starts from the reviewed Beta 1.9 new-player downtime UX build and adds the disabled-by-default API handoff layer from the historical Beta 1.6 API build. The original Beta 1.6 folder remains intact as a reference.

## Workstream

Beta 2.0 preserves the guided crafting and gathering workflows from Beta 1.9, including clearer step names, visible goal/next-action coaching, safer outcome language, crafting support checks, gathering node setup, and corrected node card readability.

Crafting and gathering both run as guided downtime workflows. Each step shows what the player is trying to do, what to click next, and which warnings are soft GM gates rather than hard app failures.

The API provider and security placeholders are present but off by default. Keep `assets/api-config.js` in static mode and `assets/security-config.js` disabled unless intentionally testing an official backend.

## Public Web Build

The live public site is published as a single browser link through GitHub Pages. Visitors open the site URL directly; they do not need to download a ZIP, install Node.js, or run a local launcher.

Keep asset paths relative so the same build can run from the GitHub Pages address, a local dev server, or direct file startup.

## Local Development

```powershell
npm install
npm start
```

Then open the local URL printed by the server.

## Testing

```powershell
npm test
```

This rebuilds `assets/app.bundle.js` and runs the cross-browser regression suite.

## Included

- Interactive builder and live play sheet.
- Guided crafting wizard (5 steps: choose recipe, gather materials, check support, roll points, resolve craft).
- Guided gathering wizard (4 steps: choose node, check access, roll strikes, resolve gather).
- Disabled-by-default API provider handoff layer from the Beta 1.6 API build.
- Disabled-by-default security placeholder for future official backend/auth work.
- Local rules versions `0.12.5`, `0.12.6`, and `0.13.0`; fresh characters default to the latest local version.
- Browser save/load slots.
- JSON, PDF, and spreadsheet export/import.
- Official-style PDF and Google-style spreadsheet templates.
- Static web deployment through GitHub Pages.

## Tester Notes

Characters are saved in the browser used to open the app. Export a JSON, PDF, or spreadsheet copy if you want a backup or need to move the character to another machine or browser.

Leaflit and Asari dice are intentionally marked as coming soon in this build.

## AI / API Handoff

Start with `BETA_1.5_TO_1.9_RELEASE_NOTES_AND_AI_HANDOFF.md`, then read `AI_START_HERE.md` and `API_HANDOFF_README.md`.

The important point: Beta 2.0 is the promoted 1.9 player experience plus the 1.6 API integration scaffolding. It is not a replacement of the historical Beta 1.6 API folder.

---
Lyrian Chronicles Character Builder
