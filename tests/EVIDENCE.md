# Phase 1 verification evidence

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
