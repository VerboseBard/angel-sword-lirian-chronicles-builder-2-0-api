# Beta 2.11 Patch Notes

Beta 2.11 is the mobile performance and iPhone layout hotpatch for the Beta 2.1 Mirane and Quick Build release. Public URLs, deployment paths, save keys, and bundled game-data version identifiers remain unchanged.

## Mobile startup performance

- Reduced the measured first-load payload from about 20.4 MB to 6.4 MB by loading PDF, spreadsheet, embedded export, and 3D dice tools only when they are used.
- Removed the duplicate rules-data download by starting directly from the current bundled `0.13.0` data.
- Improved the throttled phone startup measurement from about 48 seconds to 15 seconds in the local regression profile.
- Preserved PDF and spreadsheet import/export, direct-file startup, and full 3D dice behavior through on-demand runtime loading.

## iPhone layout fixes

- Builder steps, play-sheet pages, and character tabs now wrap inside the viewport instead of being clipped in horizontal rails.
- Crafting and Gathering wizard steps remain fully visible and use the complete phone width.
- Current Build summary cards stack cleanly on narrow screens.
- Builder navigation controls no longer stick over and obscure page content.
- The floating dice control is smaller, moves to the right in the character sheet, and stays out of Crafting and Gathering workspaces.
- Added explicit narrow-width containment and fresh asset cache keys so iPhones receive the corrected layout without changing the site address.

## Character starts

- Standard Play and Mirane Expedition are selectable in guided creation and Quick Build.
- Mirane confirmation explains that the campaign uses different restrictions and costs.
- Campaign-blocked choices remain visible and are labelled unavailable for the campaign.
- Mirane starting Clim, material limits, crafting prices, and review-page retirement/retraining guidance are enforced by the builder.

## Quick Build

- Twelve complete starter packages cover defensive, martial, stealth, ranged, magical, support, performance, crafting, and alchemy roles.
- Packages assign legal class paths, all creation breakthrough EXP, supporting skills, proficiencies, and affordable equipment.
- Tier-two paths and useful second tier-one classes are selected per role instead of applying one progression pattern to every package.
- Slimefolk is included as a featured race choice, alongside Dullahan and Wolf-folk so the Quick Build species grid has eighteen choices and six complete rows.
- Race-specific restrictions and early-unlock benefits use validated package substitutions and explanatory notes.
- Every class choice includes a newcomer summary of its skills, mechanics, and expected gameplay feel.

## Validation target

Beta 2.11 passes the complete cross-browser suite in Chromium, Firefox, and WebKit at wide desktop, desktop, and phone layouts, plus targeted 320 px, 390 px, and 430 px mobile-width checks and all Standard/Mirane package and class-progression audits.
