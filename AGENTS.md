# Repository Agent Guide

## Authority and Product Direction

This repository is for an original, browser-first, fully 3D tower-defense game. Every playable world is 3D: lobby, maps, paths, towers, enemies, projectiles, effects, story trail, and reward/statue spaces. HTML/CSS may provide screen-space HUD, menus, tooltips, and accessibility, but never substitute 2D sprites or canvas gameplay for the 3D world.

When sources conflict, use this order:

1. The user's latest explicit request.
2. `PROJECT_PLAN.md` for current phase and scope.
3. This file for implementation rules.
4. `raw_game_ideas.md` as an idea backlog, not a specification.
5. `assets/references/` as visual research only.

The brainstorm and screenshots reference Tower Defense Simulator. Do not copy its code, models, textures, icons, UI compositions, character designs, names, writing, sounds, balance tables, or branding. Create original names and designs. Reference images may inform general concepts such as hierarchy, readable silhouettes, lobby zoning, and battle HUD information.

## Architecture and Stack

- Use Three.js `0.180.0` from a pinned CDN URL, native browser import maps, and ES modules.
- Use plain HTML, CSS, and modern JavaScript. No npm, Node runtime, bundler, framework, TypeScript compiler, or build step during the prototype unless the user explicitly approves a justified change.
- Run from a basic static HTTP server in current desktop Chrome, Edge, and Firefox.
- Use one `THREE.WebGLRenderer`. Route between separately owned scenes rather than creating multiple applications or render loops.
- Start with one `BattleScene`. Add `LobbyScene`, `StoryScene`, and other scene types only in their scheduled phase.
- Prefer procedural low-poly geometry and flat or lightly textured materials during early phases. Use GLB/GLTF later for original production models.
- Use `THREE.Raycaster` for placement and selection. Keep path/placement rules in pure gameplay modules, not embedded in raycast handlers.
- Run authoritative simulation on a fixed timestep. Cap accumulated time after tab suspension; render separately with `requestAnimationFrame`.
- Keep simulation independent of Three.js. Positions, health, progress, targeting, cash, cooldowns, and wave results belong to simulation data. Meshes mirror that state.
- Use a small scene router and explicit lifecycle methods: `init`, `enter`, `update`, `render`, `exit`, and `dispose` as applicable.
- Put persistence behind one versioned storage adapter. Never call `localStorage` directly from towers, enemies, scenes, or UI components.

## Target Project Structure

Create only the files required by the active phase.

```text
/
  index.html
  AGENTS.md
  PROJECT_PLAN.md
  FirstPrompt.md
  raw_game_ideas.md
  /assets
    /references              Research screenshots; never runtime assets
      /lobby
      /progression-ui
      /mode-selection
      /matchmaking
      /battle-gameplay
    /models                  Original optimized GLB/GLTF models
    /textures                Original/licensed textures
    /audio                   Original/licensed SFX and music
    /icons                   Original SVG/PNG interface icons
  /css
    main.css
  /src
    main.js                  Renderer and application bootstrap
    /core
      Game.js                Single loop and lifecycle ownership
      Input.js               Central input map and removable listeners
      State.js               State machines and transition guards
      EventBus.js            Add only when direct ownership is insufficient
    /scenes
      BattleScene.js
      LobbyScene.js          Future phase only
    /gameplay
      Enemy.js
      Tower.js
      WaveManager.js
      Targeting.js
      Placement.js
    /rendering
      createWorld.js
      createMeshes.js
      AssetManager.js        Add when external runtime assets exist
    /data
      arena.js
      towers.js
      enemies.js
      waves.js
    /ui
      Hud.js
    /storage
      SaveStore.js           Future phase only
    /utils
  /tests
```

Do not create empty directories or speculative modules.

## State and Ownership

- Use explicit battle states: `PREP`, `WAVE_ACTIVE`, `WON`, and `LOST`. Add states only when a current mechanic requires them.
- Keep immutable definitions separate from mutable runtime entities.
- Separate these domains: application/session, active scene, battle, player profile, inventory, loadout, and content definitions.
- Give each mutable resource one owner. The game owns the loop and renderer; the scene owns scene objects; input owns browser listeners; HUD owns DOM listeners; an entity manager owns entity lifetimes.
- State changes happen through named methods with validation. Do not let rendering or UI mutate fields directly.
- Cross-system events must use named constants and documented payloads. Prefer direct calls when ownership is already clear.
- Stable content IDs are lowercase kebab case and never derived from display names.

## Coding Standards

- Use focused ES modules and named exports. Prefer pure functions for targeting, collision, cost, reward, and progression calculations.
- Keep scene files as coordinators. Move reusable rules and mesh factories into focused modules.
- Put tuning values in `/src/data`; do not scatter magic numbers through update loops.
- Use delta seconds, world units, and explicit units in names where ambiguity is possible.
- Avoid per-frame allocations in hot paths. Reuse vectors, raycasters, geometries, materials, and scratch arrays.
- Dispose geometries, materials, textures, render targets, and controls when their owner exits.
- Every added DOM, keyboard, pointer, visibility, or resize listener must have an identifiable callback and cleanup path.
- Pause simulation while the tab is hidden. Cap device pixel ratio and handle resize without changing simulation state.
- Fail visibly and helpfully if WebGL or a required CDN module cannot load.
- Add sound through named hooks such as `audio.play('tower-fire')`. Logic must work with audio missing or muted.
- Comment decisions and non-obvious constraints, not syntax.

## Inputs and Accessibility

- Declare all bindings in one exported input map.
- Reserve `Escape` for cancel/back, `Space` for starting/advancing a wave, and `R` for restart when a battle is terminal.
- Use pointer raycasting against dedicated placement surfaces. A 3D preview must show valid and invalid states using color plus shape, icon, or text.
- Prevent browser defaults only for active bindings while the game surface is focused.
- Do not bind logic to visible button text. Use stable action IDs.
- DOM controls need labels, focus states, keyboard operation, readable contrast, and scalable text.
- Provide reduced-motion and volume settings when those systems are introduced.

## Scope and Delivery Rules

- Work only on the phase explicitly requested. If no phase is named, use the active phase in `PROJECT_PLAN.md`.
- Never implement future features “while here.” A small interface seam is acceptable only when it prevents immediate rework.
- Build the smallest playable interpretation of the active requirement.
- Implement and verify mechanics one at a time. Do not batch a large tower roster, enemy roster, or menu suite.
- Preserve existing inputs, stable IDs, saved data, and module contracts. Migrate intentionally when a breaking change is approved.
- Do not add the lobby, inventory, upgrades, multiple modes, bosses, story, statues, quests, daily rewards, currencies, chests, shops, or audio before their scheduled milestone.
- Do not mark roadmap items complete without browser evidence.
- Before handoff: run available automated checks, serve locally, inspect the console, exercise the changed loop, resize the viewport, and test at least one cleanup/restart cycle.

## Reference Image Rules

- Read `assets/references/README.md` before using visual references.
- Keep reference screenshots out of runtime imports and production builds.
- Extract abstract lessons only: content grouping, flow, density, contrast, camera intent, and feedback timing.
- Never trace, crop, ship, recolor, or recreate protected material from a reference screenshot.
- New references go into the closest category folder and must be added to the catalog with source/ownership notes.
- If a reference conflicts with the fully 3D requirement, preserve the 3D requirement.

## Runtime Asset Rules

- Early prototypes use original procedural geometry, simple materials, and original SVG icons.
- External assets require a compatible license and attribution record before integration.
- Use GLB/GLTF for original 3D models. Keep textures small, reuse materials, and establish performance budgets before content expansion.
- Load runtime assets through one asset manager with progress, caching, failure handling, and procedural fallbacks.
- Maintain a cohesive stylized direction: bold silhouettes, readable role colors, strong path contrast, limited material complexity, and effects that never hide tactical information.

## Definition of Done

A change is done only when it stays inside the active phase, runs from a static server without a build step, has no new console errors, keeps authoritative state separate from rendering, cleans up listeners and GPU resources, preserves established behavior, and passes the relevant acceptance criteria in `PROJECT_PLAN.md`.
