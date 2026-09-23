# Project Plan — Original Fully 3D Browser Tower Defense

## Active Work — User-directed Headquarters Prototype (2026-09-22)

The latest explicit request advances work beyond the former Phase 1 boundary: first-person headquarters/preparation movement, elevated third-person battles, the headquarters UI and a connected mission flow. This scoped prototype is now active. The historical phase gates below remain; this does not mark Phase 2 or Phase 3 complete.

Implemented and exercised in the embedded browser:

- [x] Single-renderer headquarters → separate briefing room → battle → headquarters lifecycle.
- [x] First-person WASD/arrow/drag movement with collision and touch movement controls.
- [x] Major stations accessible through on-screen controls; original procedural 3D headquarters and map table.
- [x] Two maps, Survival/Challenge rules, immutable deployment selection and editable three-slot loadout.
- [x] Two tower definitions, owned/locked inventory, purchases, model rotation and cosmetic finishes.
- [x] Local profile, mission rewards, login rewards, daily/weekly quests, starter progression track, code redemption, cosmetic crates and wheel tickets.
- [x] Original carrier boss, victory trophy, hidden service log, index and per-map records.
- [x] Legacy checks and new profile/scene integration checks pass (28 total).
- [ ] Native Chrome/Edge/Firefox, physical multi-touch and genuine hidden-tab/resume verification.
- [ ] Full multi-wave campaign, additional modes, evolved towers/combat upgrades, full shop catalog and story-driven headquarters expansion.

The game explicitly labels unavailable catalog content. `README.md` describes the delivered prototype and limitations; `tests/EVIDENCE.md` records the actual verification.

## Source Analysis

The brainstorm contains five connected products that must be built in sequence:

1. A fully 3D tower-defense battle with path-following enemies, placement, targeting, waves, cash, upgrades, detection traits, bosses, and rewards.
2. A navigable 3D lobby connecting play, inventory/loadouts, quests, rewards, achievements, statues, shop, and story.
3. A collection/progression layer with many tower roles, five upgrades per tower, unlock conditions, evolved variants, currencies, and eight-slot loadouts.
4. A difficulty/content ladder with map selection, unique enemy families, final bosses, and increasing wave counts and rewards.
5. A story trail with sequential encounters, narrative triggers, capstone bosses, tower unlocks, and statue rewards.

The supplied screenshots reinforce the desired flow: a social 3D lobby with strong portal landmarks, large catalog panels, map voting, visible loadout slots, a readable top battle HUD, contextual dialogue, boss health, and a reward summary. They are research references from another game and are not production assets.

The raw note that battles become 2D is superseded by the user's latest direction: all gameplay remains 3D. “Pixel art” is reinterpreted as original icon/portrait art or pixel-inspired textures used in UI; towers, enemies, statues, maps, and effects remain 3D.

## Product Pillars

- **Readable 3D tactics:** path, ranges, targets, detection, status effects, and boss threats are understandable at a glance.
- **Distinct tower roles:** damage, range, splash, control, support, economy, spawner, and specialist towers have clear tradeoffs.
- **Earned progression:** difficulty and content unlocks expand choice without replacing tactical play.
- **Strong return loop:** the future lobby makes loadout changes, goals, rewards, statues, and story progress easy to understand.
- **Original identity:** all final names, characters, lore, models, UI art, audio, and balance are original.

## Phase 1 — Vertical Slice / Core Loop

### Goal

Prove the smallest fully 3D interaction loop: inspect one arena, place one tower without colliding with the road or another tower, start one wave, and watch the tower attack path-following enemies.

### Deliverables

- Static `index.html` entry using Three.js `0.180.0` via pinned CDN import map and native ES modules.
- One responsive renderer, perspective camera, lighting setup, and fixed stylized 3D test arena.
- One clearly modeled road following a waypoint path and one 3D base at its end.
- One original enemy type represented by procedural 3D geometry, moving smoothly along every waypoint using delta time.
- One original direct-damage tower represented by procedural 3D geometry.
- Pointer raycast placement with a 3D ghost, range preview, boundary validation, road exclusion, and tower-overlap collision.
- One primary action: tower automatically targets the furthest-progress eligible enemy in range and fires a visible 3D attack.
- One deterministic test wave of exactly 10 enemies.
- Minimal HUD: cash, base health, remaining enemies, battle state, tower button, start-wave button, and terminal restart.
- Battle states `PREP`, `WAVE_ACTIVE`, `WON`, and `LOST`.
- Lightweight pure-logic browser checks for placement, path movement, targeting, state transitions, and restart.

### Fixed Prototype Rules

- Starting cash: 200.
- Base health: 10.
- Tower cost: 100.
- Enemy health: 10.
- Enemy base damage: 1.
- Wave size: 10.
- Tower damage/range/fire rate and enemy speed/spawn interval may be tuned once so a sensible placement can win; values live in data modules.

### Phase 1 Acceptance Gate

- [x] Loads from a basic static HTTP server with no install/build step and no console errors.
- [x] All world elements and interactions are 3D; DOM is HUD/menu only.
- [x] Preview follows the pointer and communicates valid/invalid placement beyond color alone.
- [x] Placement rejects road, outside bounds, overlap, and insufficient cash; success deducts cost once.
- [x] Exactly 10 enemies follow all waypoints at frame-rate-independent speed.
- [x] The tower picks the furthest-progress in-range living enemy and visibly damages/kills it.
- [x] Cash, base health, enemy count, and state remain accurate.
- [x] A defended run can reach `WON`; an undefended run can reach `LOST`.
- [x] Restart restores the initial battle without page refresh, duplicate loops/listeners, or leftover meshes.
- [ ] Resize and hidden-tab behavior are safe. Resize and controlled visibility-event checks pass; native hidden/resume manual verification remains pending.

Verification: `tests/EVIDENCE.md` records 12/12 logic checks, 5/5 lifecycle checks, live win/loss and three restart cycles. The native visibility check remains open; the user-directed headquarters prototype above now defines active work.

### Not in Phase 1

Lobby, player-avatar movement, multiple towers, upgrades, multiple waves/modes/maps, detection traits, inventory, save data, bosses, rewards, story, quests, achievements, statues, daily login, shop, chests, audio, particles, or imported production models.

## Phase 2 — Secondary Battle Systems

### Goal

Turn the verified slice into a small repeatable Beginner match with meaningful choices.

### Milestones

1. **Wave economy:** five Beginner waves, intermissions, spawn groups, wave cash, kill rewards, escalating enemy stats, early-wave start, and robust win/loss summary.
2. **Tower decisions:** three original roles—starter damage, long range, and crowd control—plus selection, sell, targeting priority, and five data-driven upgrade levels.
3. **Enemy decisions:** standard, fast, flying, and hidden traits; explicit detection capabilities; boss immunity rules; readable 3D indicators.
4. **Beginner boss:** one original final boss with a telegraphed mechanic and a fair five-wave balance curve.
5. **Profile foundation:** versioned local save, coins, match rewards, owned/unowned tower records, and a small test loadout UI before expanding to eight slots.

### Phase 2 Gate

- A five-wave Beginner match is replayable and balanced with at least two viable tower combinations.
- All five upgrade levels, sell values, targeting modes, status effects, and detection rules pass focused tests.
- Rewards apply exactly once and persist safely across reloads.
- Missing, old, or corrupt saves migrate or reset without crashing.

## Phase 3 — Content Expansion

### Goal

Build the original game's content identity and connect battles to a functional 3D lobby.

### Milestones

1. **3D lobby foundation:** keyboard/mouse avatar movement, collisions, camera, battle portal, inventory zone, and transitions to/from battle.
2. **Match flow:** difficulty selection, a separate 3D map-vote area, loadout editing, countdown, battle transfer, and return with results.
3. **Difficulty ladder:** Easy (15 waves), Medium (count finalized by playtesting), Hard (25), and Hardcore (40), shipped one at a time with original enemy families and bosses.
4. **Map library:** at least three original maps with data-driven paths, placement zones, cliff/ground rules, themes, and tested camera framing.
5. **Collection:** full inventory browser, locked `???` presentation, tower details, upgrade previews, unlock sources, and up to eight equipped towers.
6. **Tower roster:** add small, tested batches grouped by role. Treat the long brainstorm roster as inspiration/backlog rather than a launch checklist.
7. **Story:** 3D trail/map, sequential nodes, narrative triggers, encounter waves, three original capstone bosses, and tower/statue rewards.
8. **Metagame:** quests, achievements, daily login, shop, two currencies, chests, boss-statue collection, and capped daily statue production—each shipped independently with save migration.

### Phase 3 Gate

- The lobby-to-vote-to-battle-to-results-to-lobby flow works without reload.
- At least two modes and two maps are stable and distinct.
- Progression remains recoverable across versioned save upgrades.
- New content uses original names, designs, models, lore, and balance.

## Phase 4 — Polish and Audio

### Goal

Make the established experience expressive, accessible, performant, and cohesive.

### Deliverables

- Original optimized low-poly models, animations, materials, textures, environment dressing, and 3D statues.
- Original UI icons/portraits, including optional pixel-inspired presentation derived from original designs.
- Projectiles, hit flashes, particles, status effects, restrained camera shake, boss entrances, chest reveals, and victory presentation.
- Original/licensed music and sound for UI, placement, towers, enemies, waves, bosses, victory, defeat, lobby zones, and rewards.
- Separate volume controls, mute persistence, subtitles/text alternatives, reduced motion, keyboard navigation, color-safe indicators, and scalable UI.
- Loading progress, reconnect/error messaging, optional asset fallbacks, settings, onboarding, credits, and attribution.
- Performance budgets for draw calls, triangles, texture memory, enemies, projectiles, particles, and quality levels.
- Regression testing across current Chrome, Edge, and Firefox at desktop and narrow viewport sizes.

## Deferred Backlog

Evolved/golden variants, large event rosters, player-controlled advanced towers, exclusive towers, randomized high-cost chests, ranked/PvP, parties, social leaderboards, gift codes, battle passes, sandbox/admin modes, and every named reference boss remain deferred until the core cooperative/single-player tower-defense loop and original content pipeline are stable.

No item enters production merely because it appears in `raw_game_ideas.md` or a reference screenshot. It must first be assigned to an active milestone with acceptance criteria.
