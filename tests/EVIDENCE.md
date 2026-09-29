# Phase 1 verification evidence

## 2026-09-29 color, camera, progression and mode pass

Served the project with `python -m http.server 8765` and checked it in the embedded browser. The current suites passed: 12/12 logic, 12/12 roster, 15/15 headquarters, and 7/7 lifecycle. The headquarters suite now checks persistent FOV, zoom distance, right-button look, touch-only pad visibility, mode locks, resizing, and repeated scene/GPU cleanup. The roster suite checks level locks, base-tower alternate forms, the 50,000-coin Golden crate, deployed golden stats, exact Survival wave counts, listed triumph rewards, partial loss rewards, and restart state.

Visually inspected the multicolor headquarters and phone-width layout. Opened the live Settings panel and changed FOV from 68° to 90°. Opened the live Survival menu and confirmed Easy 20, Casual 25, Intermediate 30, Molten 35, and Fallen 40 with their reward previews. A headless fixed-step simulation with three long-range towers reached the configured final wave on all five Survival modes; that setup used extra cash and base health, so it does not establish normal progression balance. Physical touch and full live campaign balance remain open.

Executed against the Python static server at `http://127.0.0.1:8000/` in the Codex embedded Chromium browser on 2026-09-19 (local date). No install or build was used.

## Automated browser results

- **12/12 pure-logic checks passed** at `/tests/`.
- **5/5 lifecycle checks passed** at `/tests/lifecycle.html`.
- Pure checks cover initial values, transition guards, road/bounds/footprint/overlap/cash rejection, single charge, every waypoint, equivalent movement at 30/60/144 Hz, multi-segment steps, once-only resolution, furthest eligible target, exactly ten scheduled spawns, damage and shot signals, defended win, undefended loss, terminal freeze, and three restarts.
- Lifecycle checks run the actual scene and WebGL renderer. Three full defended/restart cycles returned GPU geometry counts and scene child counts to the warmed baseline, cleared enemy/tower mesh maps, and added no listeners. Persistent ghost/range geometry is warmed before taking the baseline because Three.js allocates GPU resources lazily on first rendering.
- Camera corner projections remain within the view at desktop, narrow and short viewport aspect ratios.
- Input checks cover unfocused Space, inactive R, Escape, right-click context handling, and focused start.
- Controlled `document.hidden` values and real `visibilitychange` dispatches verify zero simulation during hidden frames, zero catch-up after a simulated 60-second suspension, and a 0.1-second frame cap after a long visible frame.
- Final browser console inspection showed no warnings or errors for the game or either harness.

## Browser interaction and visual results

- Inspected the 3D raised terrain/road, entry posts, faceted base, procedural sentry and crawling enemies. Full route visible.
- Dragged the pointer from road to terrain: translucent tower ghost/range followed it, with green check/text for valid placement. Road showed a red preview and cross/text.
- Clicked road and exterior: cash stayed 200. Escape and right-click cancelled without spending.
- Placed a sentry inside the first bend: cash changed from 200 to 100 once; repeated click selected it. Overlap rejection retained 100.
- One-sentry live run reached WON with 10/10 base health and zero remaining. Observed moving enemies, decreasing remaining count, and a visible 3D beam in a firing frame.
- Undefended live run reached LOST with 0/10 health and zero remaining.
- Three consecutive live restarts (R, button, button) each restored PREP, 200 cash, 10/10 health, ten remaining, and an empty battlefield without reload.
- Placed two sentries, reducing cash to zero; a third valid-ground attempt reported insufficient funds and spent nothing.
- Repeated Space and R during an active wave did not restart or duplicate the wave. Clicking a tower showed its range.
- Inspected 1280x800 desktop and 390x844 narrow layouts; the HUD remained usable and the complete arena/road stayed in view. Also inspected the default short embedded viewport.

## Remaining verification boundary

A real native-browser hidden/resume transition was **not** reproduced: hiding the embedded browser panel leaves `document.hidden` false. The controlled visibility integration test passed, but does not replace that final manual gate. Current native Chrome, Edge and Firefox were not available as browser-control surfaces; cross-browser smoke testing remains unverified. No Phase 2 implementation or completion claim is implied.

# Headquarters prototype verification — 2026-09-23

The latest user request superseded the old Phase 1 scope. The earlier evidence above is historical; the current application starts in headquarters.

## Results

- **12/12** legacy logic checks passed at `/tests/` after the changes.
- **5/5** legacy lifecycle checks passed at `/tests/lifecycle.html`, including a final rerun on September 23.
- **11/11** headquarters integration checks passed at `/tests/headquarters.html`.
- Local ES module import resolution passed. No runtime module references `assets/references`. `git diff --check` passed.

The headquarters checks cover malformed/missing/future saves, purchase persistence, unknown/duplicate loadout rejection, swapping slots, daily/code duplicate-claim prevention, quest-period reset, one-use crate/ticket consumption, actual Longwatch price/range/damage, wins and losses for both maps/rulesets, keyboard movement and simulated touch direction state, collisions, blur/visibility clearing, empty-loadout deployment rejection, immutable mission selection, exactly-once result rewards, terminal restart, and GPU geometry/texture cleanup after repeated HQ/prep/battle transitions. Test profiles use memory storage.

## Browser observations

- Inspected the headquarters, inventory's rotating 3D preview, mission selector, separate themed briefing room/map table, rewards and tactical battle through the real UI.
- Changed the selected map to Frostline Depot from the briefing screen and observed matching room signage and selection.
- Inspected the actual game in a 390×844 nested viewport. Inventory, loadout and touch movement controls remained reachable. Inspected 844×390 landscape, found overlapping/overflowing controls, fixed the compact layout and reinspected successfully.
- Claimed a login reward and observed the disabled “Claimed today” state and visible confirmation.
- On the final live run: entered Survival briefing, deployed, waited for the camera introduction, placed two sentries through raycast pointer clicks, observed 200 → 100 → 0 cash, started the encounter, and observed the carrier boss and its health display.
- The live run reached **WON**, 10/10 base health, zero remaining contacts and 80 battle cash. The result awarded **60 account coins**.
- Clicked Restart: PREP, 200 cash, 10/10 health, 11 contacts and an empty arena returned without reload.
- Returned to headquarters: profile showed **50 XP and 315 coins**, exactly 60 more than its pre-mission balance. No extra result award occurred on restart/return.
- Final main-game console inspection returned **no warnings or errors**. The integration harness also returned no errors. The iframe QA page once logged an injected `MutationObserver.observe` error; the project uses no MutationObserver and the embedded game's controls/rendering continued working.

## Remaining release gates

Only the embedded Chromium surface was available. Physical phone multi-touch, current native Chrome/Edge/Firefox, audible audio-quality review and a genuine native hidden-tab/resume transition are unverified. The movement test exercises touch state but does not replace a physical multi-touch check. The viewport override did not change the embedded page's dimensions, so phone/landscape visual inspection used a real fixed-size iframe instead. Controlled visibility and resize lifecycle checks pass.

Story/Hardcore/Event/Sandbox content, combat upgrades/evolution, extended shop categories, multi-wave campaigns and story-driven headquarters changes are not implemented. Their UI states and README explicitly identify this boundary; passing tests do not claim completion of the full brainstorm.

## 2026-09-23 — Character roster and artwork

- Static Python HTTP server; embedded Chromium browser. 12/12 logic, 5/5 lifecycle, 11/11 headquarters, and 6/6 new roster checks passed (34 total).
- All 74 portraits loaded; all 74 recruits were purchased, equipped and round-tripped through in-memory saves. Duplicate purchases do not charge again. Hardcore purchases require shards.
- Verified splash, control with boss immunity, damage-over-time, income, healing, nonstacking support, and friendly runners. Fallen, Hardcore and Voidcore simulation runs won and awarded shards; reset cleared entities.
- Inspected inventory portraits and rotating human models, shop portraits, hardcore category filtering, mission selection and a live Voidcore zombie encounter. Main game console checks reported no errors.
- Existing checks exercised rendered win/loss, three restart cycles, repeated scene transitions, geometry disposal, responsive cameras, and input cleanup.
- Visually inspected 652px layout and a real 390 x 844 iframe. Fixed shrinking tower cards that created nested scrollbars and visually confirmed the corrected phone inventory.
- A later accessibility interaction with the responsive iframe emitted a MutationObserver error from browser tooling; the repository contains no MutationObserver usage. The main game was checked separately.
- Native Chrome/Edge/Firefox, physical touch, long-session performance and full roster balance remain unverified. All kits use prototype ground placement; advanced per-character systems and full campaigns remain unfinished.
- git diff --check passed.

## 2026-09-25 — Color and material detail pass

- Brighter jewel-tone headquarters stations, distinct display recruits, wall bands, floor inlays and original 128px procedural panel textures.
- Added woven uniforms, layered armor, knee plates, utility belts, equipment lights and metallic accents to every tower model; textured zombie clothing and brighter enemy silhouettes.
- Both arenas use detailed ground/road surfaces, perimeter trees/crystals and illuminated plinth edges. Gameplay remains entirely 3D.
- Enriched all 74 original vector portraits and 14 navigation icons with colored gradients, highlights and equipment detail. `scripts/enrich_art.py` reapplies the artwork pass after roster generation.
- Browser checks: 12 logic + 5 lifecycle + 11 headquarters + 6 roster = 34 passing. Roster disposal check now also requires uploaded surface textures to return to zero after model disposal.
- Visually inspected headquarters, tower inventory, Copper Reach terrain and a live two-tower encounter. Checked 390x844 and 844x390 iframe layouts; fixed compact landscape help/loadout spacing.
- All 88 SVG files parse successfully. Main-game and roster console inspection reported no warnings or errors. `git diff --check` passed.
- Native browser matrix, physical touch and long-session performance remain unverified.
- Final live validation: placed two recruits, reached WON with 10/10 base health, restarted to PREP with 200 cash and no towers, then returned to headquarters successfully. Final phone inspection confirmed separated movement/help/loadout controls.

## 2026-09-26 — Modes, staging and tower controls

- Served the static game locally and opened it in the in-app Chromium browser. The full browser suites passed: 12/12 core logic, 5/5 lifecycle, 11/11 headquarters and 10/10 roster checks (38 total). The roster checks now cover five upgrades, a one-time sell refund, wave escalation, long mode progression, a viable two-Scout Beginner run with affordable upgrades, and the persisted Hardcore unlock.
- Exercised the visible Survival choices, verified Fallen appears under Survival, and verified the initial Hardcore screen offers only Hardcore Start. Started a mode, entered the walkable staging lobby, changed the map to Frostline, and deployed. The same saved loadout and commander session continued into battle.
- In a live Beginner battle, placed a Scout on 3D terrain, upgraded it from level 0 to level 1 (damage 5 to 6.6, range 6.5 to 6.9, interval 0.65 to 0.60 seconds), observed its damage total rise during a wave, and sold it for the displayed 93 cash. The selected-tower buttons remain mounted while the HUD updates.
- Visually inspected the centered mission control, staging lobby and selected-tower HUD. The 390 × 844 phone layout keeps touch movement clear of the mission button; the 844 × 390 landscape layout retains the loadout and mission button. Main-game console reported no warnings or errors. The headquarters suite exercised repeated scene transitions and resource cleanup; lifecycle checks covered resize and restart.
- Still unverified: native Chrome/Edge/Firefox and physical touch. The roster has shared prototype kits and the mode bosses share one procedural model; fully bespoke abilities, enemy families and boss attacks remain unbuilt.
## First-person field and preparation hall — 2026-09-28

- Served the static project with Python HTTP server in the in-app Chromium browser. The updated suites passed: 12/12 logic, 10/10 roster, 13/13 headquarters, and 7/7 lifecycle checks (42 total). The new checks cover starter ownership, all four long map paths, wheel prize amounts, first-person camera resizing, enemy hover health, simulated touch movement/look, and cleanup/restart behavior.
- Visually inspected the first-visit tutorial, distinct 3D preparation hall, four-map staging controls, and Ember Pass first-person battle. Placed a Scout by raycast, upgraded it, and observed the contextual panel switch from affordable to exact cash shortfall. Inspected the visible seven-visit daily track and spun the four-segment wheel; the displayed 60-coin result matched its final pointer segment. The main game reported no console warnings or errors during this run.
- Inspected the 390×844 phone and 844×390 landscape layouts in nested browser viewports. The phone battle shows a movement pad alongside the field and keeps the loadout and wave controls reachable.
- Native Chrome/Edge/Firefox, physical touch, and genuine hidden-tab/resume behavior remain unverified.
