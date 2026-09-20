# First Implementation Prompt — Phase 1 Only

Read all of `AGENTS.md`, `PROJECT_PLAN.md`, `raw_game_ideas.md`, and `assets/references/README.md` before editing. Inspect the reference folders, but treat every screenshot as research only. Do not copy, crop, trace, ship, or closely reproduce any referenced game's characters, models, icons, text, names, branding, or layout.

The repository was intentionally reset. Implement only Phase 1 from `PROJECT_PLAN.md`: one original, fully 3D tower-defense vertical slice. Do not begin Phase 2 and do not create the lobby, player-avatar controls, inventory, loadouts, upgrades, multiple tower/enemy types, multiple waves/maps/modes, bosses, rewards, persistence, story, quests, achievements, statues, daily login, shop, chests, audio, particles, or production model pipeline.

## Required Stack

- Three.js `0.180.0` from a pinned CDN URL through a browser import map.
- Plain HTML, CSS, and native ES modules.
- No npm, package manager, bundler, framework, transpiler, or build command.
- Must run from a basic static HTTP server in current desktop browsers.
- One renderer and one animation loop.

## Build Exactly This Loop

- Render one original low-poly 3D arena, a contrasting 3D road following fixed waypoints, and a 3D base.
- Render one original procedural 3D enemy with 10 health. It travels every waypoint at a constant delta-time-based speed, deals 1 damage once when it reaches the base, then despawns.
- Render one original procedural 3D tower costing 100. It automatically targets the living enemy furthest along the path within range and performs a clearly visible 3D ranged attack.
- Start with 200 cash and 10 base health.
- Spawn exactly 10 enemies at a fixed interval in one test wave.
- Use explicit states: `PREP`, `WAVE_ACTIVE`, `WON`, and `LOST`.
- Win only after all 10 enemies have spawned and no living enemies remain while the base has health. Lose immediately at zero base health. Stop simulation actions at either terminal state.
- Show a DOM HUD for cash, base health, total enemies remaining (unspawned plus alive), state, tower selection, wave start, outcome, and restart. World objects and gameplay remain 3D.

Keep tunable values in data modules. Choose tower damage/range/fire rate, enemy speed, and spawn interval so one sensible tower placement can win, and document the chosen values.

## Bind These Inputs

- Clicking the tower HUD button enters placement mode.
- Pointer movement raycasts against valid 3D terrain and moves a translucent 3D tower ghost plus range preview.
- Left click on valid ground places one tower and deducts exactly 100 cash once.
- Road, outside-arena positions, and overlap with an existing tower are invalid.
- Valid and invalid previews differ by color and by a text/icon/shape cue.
- Right click or `Escape` cancels placement without spending cash.
- `Space` or the Start Wave button starts the wave only from `PREP` and cannot start it twice.
- Clicking a placed tower shows its 3D range indicator.
- `R` or the Restart button works only from `WON` or `LOST` and resets the battle without a page reload.
- Keyboard shortcuts act only while the game is focused; prevent browser defaults only for active bindings.

Keep the full road visible in the default camera. Optional orbit inspection is allowed only if it cannot conflict with placement and is not required to play.

## Architecture Requirements

- Follow the Phase 1 subset of the structure in `AGENTS.md`; create no empty future directories/modules.
- Authoritative movement, collision, targeting, health, cooldowns, cash, and state must not depend on mesh transforms.
- Centralize input mappings and use removable named listeners.
- Cap frame delta and device pixel ratio, handle resize, and pause simulation on hidden tabs.
- Reuse hot-loop objects and dispose transient meshes/materials correctly.
- Provide helpful WebGL/CDN failure messaging.
- Add a small browser-based pure-logic test harness without introducing a package manager.
- Add a concise `README.md` explaining the static-server command, controls, and tuning values.

## Acceptance Criteria

Do not report completion until all items pass:

1. The project loads through a static HTTP server with no install/build step and no console errors.
2. Every world element and gameplay interaction is 3D; DOM is HUD/help only.
3. The placement ghost follows the pointer and clearly communicates valid versus invalid placement without relying only on color.
4. Placement rejects the road, arena exterior, tower overlap, and insufficient funds; valid placement charges exactly 100 once.
5. Exactly 10 enemies spawn, traverse every waypoint smoothly at equivalent speed across frame rates, and resolve exactly once by death or base arrival.
6. A tower selects the furthest-progress eligible in-range target, visibly attacks it, reduces health, and can kill it.
7. Cash, health, remaining count, and state stay accurate through the whole run.
8. A reasonable defended run reaches `WON`; an undefended run reaches `LOST`.
9. Three consecutive restarts restore 200 cash, 10 health, 10 remaining, `PREP`, and an empty battlefield without duplicate loops/listeners or leftover meshes.
10. Desktop and narrow viewport resizing preserve a usable HUD and complete map view.
11. Hiding/resuming the tab does not cause enemies to jump to the base.
12. Automated pure-logic checks pass, and manual browser testing confirms the visual/input behavior.

Report created files, controls, tuning values, automated and manual test evidence, and any remaining Phase 1 limitation. Do not implement Phase 2.
