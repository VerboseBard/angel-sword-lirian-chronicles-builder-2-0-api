# Play Sheet 1.6 Action Plan

Last updated: 2026-07-01

This plan captures the play-sheet, combat-access, inventory-readiness, effects, conditions, crafting, gathering, and reference-detail work discussed during the Beta 1.6 pass.

## Current QA Status

The latest 1.6 sweep after moving Clim, adding Effects & Conditions, compacting effect display, expanding references, and adding inventory readiness passed:

- `npm.cmd run build`
- `npm.cmd run audit:minmax`
- `npm.cmd test`
- Static local asset/id check: no missing local `index.html` or CSS refs; no duplicate static HTML ids.
- Stale selector check: removed old `play-tracker-money` and `play-active-effects-card` code paths.

The cross-browser suite now treats `Effects & Conditions` as the card occupying the old Clim dashboard slot.
Effect and condition rows are intentionally compact on the sheet: only the blue clickable name is visible, and the detail/clear controls live in the modal.

## Implemented In This Slice

- Clim was moved into the Spirit Core card with amount input, Add, and Subtract controls.
- The freed dashboard space now shows `Effects & Conditions`.
- Effects are split into `Positive Effects` and `Negative / Conditions`.
- Positive effects and negative conditions can be manually added through the Effects & Conditions modal picker.
- Active effects and conditions render as compact clickable names; clicking one opens a detail modal with summary, source/duration metadata, and Clear when the entry is removable.
- Official rules-backed entries now store rule profiles. Exact modifiers such as Haste, Slow, Blinded X, Sunder X, Stagger X, and Root update the live sheet while active and reverse when cleared.
- Vague source-dependent labels such as Blessed, Inspired, Empowered, Resistant, Concealed, and Flying are marked as manual reminders until the player/GM provides exact source text and values.
- Food mana recovery lockout appears as a condition-style reminder until rest.
- Active effects no longer live under the Actions tab.
- `Full Restore` and `Sync Derived Stats` moved into the Quick Rolls tool cluster.
- Basic actions, defense cards, item rows, and item catalog cards can feed the Reference Detail panel.
- Inventory items show advisory readiness badges and warnings.

## Product Direction

The play sheet should separate owning something from being able to use it right now.

The main rule:

- **Abilities** remain the source/reference library.
- **Combat** shows usable encounter actions and blocked combat actions with reasons.
- **Field / Downtime** shows rests, travel, gathering, crafting setup, food, utility checks, and non-combat procedures.
- **Effects & Conditions** stay globally visible near resources and defenses, not inside one tab.

## Priority 1: Rename And Split The Action Workspace

Replace the current `Actions` tab with clearer context tabs:

- `Combat`
- `Field / Downtime`
- keep `Abilities`
- keep `Inventory`
- keep `Crafting & Gathering` until the later crafting split
- keep `Proficiencies`
- keep `Breakthroughs`
- keep `Notes`

Combat should include:

- attack actions
- reaction actions
- combat-ready item uses
- spell/ability actions that can be used in encounters
- reload, draw, stow, and start-turn controls
- blocked actions with clear reasons

Field / Downtime should include:

- rest buttons
- food recovery state
- travel and movement checks outside combat
- foraging/gathering session entry points
- crafting prep and downtime utilities
- non-combat ability uses

## Priority 2: Combat Loadout State

Add real state for where items are, not just whether they are owned.

Required state:

- main hand
- off hand
- worn/equipped
- quick-access slots
- combat-ready container
- packed inventory
- non-combat storage
- item quantity per location

This enables rules such as:

- item is owned but not reachable in combat
- item must be held
- item is in a potion belt or alchemy rig
- item is packed away
- only one version of a container/equipment type may be active

## Priority 3: Gate Item Use By Readiness

The current readiness badges are advisory. Next pass should convert them into behavior.

Use buttons should become:

- enabled when the item is usable now
- disabled/blocked when the item is not ready
- accompanied by a reason such as `In backpack`, `Requires held item`, `Needs reload`, or `Not in combat-ready storage`
- paired with a manual override for GM rulings

Regression tests should cover:

- potion in Alchemy Rig usable in combat
- potion in Backpack owned but blocked in combat
- quick-access item usable without digging through inventory
- Counter-Potion requires the alchemy item to be held
- Quickdraw Alchemy can draw from combat inventory

## Priority 4: Ammo, Fuel, Reload, Draw, And Stow

Add structured reload/access tracking.

Track:

- ammo pools
- loaded state
- weapon capacity
- fuel cartridges
- shell consumption
- one-per-turn draw/stow limits
- 0 AP draw or sheath rules
- weapon-specific reload blocks

Items and weapons to test include:

- Fuel Cartridge Pack
- Quick Artifice Reload
- Windlass Arbalest
- guns using cartridges or shells
- Hori Hidden Weapon
- Pistol 0 AP draw/sheath

## Priority 5: Effects And Conditions Model

The new dashboard card is only display logic. The next pass should make effects and conditions structured.

Started: active effects now preserve a `rules` profile with rule text, automation notes, numeric value metadata, modifiers, and one-time resource grants.

Add fields:

- name
- source
- tone: positive, negative, neutral
- duration: turn, round, encounter, until rest, manual
- timing: start turn, end turn, on use, on rest
- tags: potion, food, spell, condition, injury, terrain, item, ability
- clear behavior
- optional stat/resource modifiers

Implemented controls:

- manual add positive effect
- manual add negative condition
- curated picker entries
- optional custom entry
- shared duration field
- clear one through the effect/condition detail modal
- exact rule detail popup for rules-backed effects
- automatic derived-stat updates for Haste, Slow, Root, Blinded X, Sunder X, and Stagger X
- active skill-check modifiers such as Presence Concealment applying +5 Stealth while active
- formula-backed effect resolution such as Regrowth using Focus and Root using Agility
- inventory-created active effects such as Bear Elixir linking RP max/RP grant and Axolotl Elixir resolving Toughness
- safe automation for max-resource effects such as Stun, Weakened, and Shaken without overwriting editable AP/RP max fields

Needed controls:

- turn-start/end damage resolution buttons for Burning X, Bleeding, and Toxic
- clear expired turn effects
- clear rest effects
- clear encounter effects

## Priority 6: Reference Detail Expansion

The right-side Reference Detail panel should answer “what does this do?” for all clickable play surfaces.

Add reference entries for:

- Light Attack
- Heavy Attack
- Precise Attack
- Move
- Double Move
- Dodge
- Block
- Guard
- Evasion
- Potency
- Initiative
- Save
- Rest types
- Full Restore
- Sync Derived Stats
- Clear Log
- common conditions
- terrain and movement restrictions

Keep short summaries inline for mobile and scanning. Use Reference Detail for longer rules text, excerpts, conditions, and edge cases.

## Priority 7: Crafting And Gathering Split

The current `Crafting & Gathering` tab is useful but still broad.

Split the model into:

- Crafting tracker
- Gathering tracker

Crafting should track:

- recipe
- material units
- crafting dice
- crafting points
- mods
- facility/tool
- notes and GM rulings

Gathering should track:

- session type: Foraging, Mining, Farming, Lumber, etc.
- gathering skill
- tool
- proficiency status
- Node Points
- Lucky Points
- Strike Dice
- gathered output units

Foraging should not be treated as a generic free skill check until the official rules confirm that. Current item/class text implies it can be a real gathering-session system.

## Priority 8: Character Creator Min-Max And Prerequisite Bypass Support

Keep supporting legal bypass paths without judging whether they are good player choices.

Needs:

- explicit prerequisite override display
- class access grants from ancestry, lineage, and breakthroughs
- EXP reduction and 0 EXP entry handling
- warnings when an unlock depends on temporary or combat-only effects
- clear review/export notes when manual overrides are used

Regression coverage should include:

- Demon clan class entries
- Gnome Miner unlock
- Sheepfolk Aetherie entry
- Angelblooded
- Mystic Eyes of Faerie Light
- Touched by Death
- elemental mastery sources from race/ancestry
- spell sources that satisfy class gates

## Priority 9: Data/API Structure

Move away from fragile text-only inference over time.

Ideal item/action profile fields:

- actionType
- cost
- combatReadyStorage
- nonCombatStorage
- quickAccess
- requiresHeld
- drawAction
- stowAction
- reloadAction
- ammoOrFuel
- capacity
- consumable
- craftingTool
- gatheringTool
- sessionRequirement
- classAccessOverride

Keep the raw official text visible, but drive sheet behavior from structured fields when available.

## Priority 10: Test Plan

Update and expand `scripts/test-cross-browser.mjs` as each behavior moves from advisory to enforced.

Required new tests:

- Combat and Field / Downtime tabs render the correct action sets.
- Abilities remain visible as reference entries while generated actions appear in the correct context.
- Effects & Conditions remains visible across tabs and mobile widths.
- Clim controls inside Spirit Core still update funds and purchase availability.
- Item readiness badges match known source items.
- Blocked item actions show reasons.
- Reference Detail opens for basic actions, defense cards, items, and abilities.
- Rest clears rest-duration effects and food recovery lockout.
- Full Restore clears active effects and resources as a sheet tool.
- Ammo/reload state blocks illegal attacks.

## Open Decisions

- Final tab names: `Combat` and `Field / Downtime` are the current recommendation.
- Whether blocked actions should be visible by default or behind a `Show blocked` toggle.
- Whether the right-side Reference Detail becomes a bottom drawer on mobile.
- Exact official rules for draw/stow/interact costs when item text does not override them.
- Exact official gathering-session reset timing for Node Points, Lucky Points, and Strike Dice.
