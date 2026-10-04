## Current play flow (2026-10-03)

Start in a colorful 3D headquarters with the same overhead strategy camera used in battle. Use **WASD** to move, **right-drag** to orbit and tilt, the **mouse wheel** to zoom, and **V** to switch to or from first person. Touch movement pads appear only on coarse touch devices. Set a persistent 50°–100° field of view in Settings. Battles start in that overhead strategy view; **V** switches to a walkable first-person view.

Survival offers Easy (20 waves), Casual (25), Intermediate (30), Molten (35), and Fallen (40). Hardcore has 45 waves and Voidcore has 50; both require account level 50, and Voidcore requires a Hardcore victory. Each public mode now uses its supplied natural-spawn groups, enemy roster, and base HP. The old five-wave Beginner campaign remains internally for save/test compatibility but is no longer a separate public mode. Pick a mode, choose a map in the walkable staging hall, edit the three-slot loadout, and deploy.

Winning awards each mode's listed coins or gems, account XP, and tower XP. Loss rewards scale with waves survived; account XP doubles Friday through Sunday (UTC). Level thresholds from `raw_game_ideas.md` gate Turret (50), Pursuit (100), and Gatling Gun (175). Golden forms are obtained through a 50,000-coin Golden crate; evolved forms and owned golden forms are selected inside their base tower and use their own battle stats. The inventory sorts by ownership, name, role, or unlock level. Existing save IDs migrate to base-tower loadout slots.

The roster still uses shared prototype combat kits rather than fully bespoke abilities. The named mode bosses share the current procedural model and scaling. Multiplayer cash splitting, VIP boosts, authored boss mechanics, and physical mobile-device testing remain outside this single-player prototype.

## Character roster update

The roster contains **74 original human character definitions** representing roles from `raw_game_ideas.md`. Golden and evolved entries are alternate forms within a base tower, and the public inventory/shop list only base towers. Each has a portrait, a rotating 3D model, and a prototype combat role. Existing collection IDs are retained.

Enemy types use procedural 3D silhouettes with visual markers for hidden, flying, lead-armored, splitting, summoning, and boss traits. Sniper-style towers detect hidden and flying contacts; splash, piercing, melee, beam, and fire attacks can break lead protection. Upgrades broaden detection. Splitters create child enemies, summoners add reinforcements, healers restore nearby enemies, and some heavy enemies stun towers. These are simplified shared mechanics; individually authored abilities, regeneration, shields, and campaign balance tuning remain open. Hardcore recruits spend gems (stored under the legacy `shards` save field). Summoner characters currently send friendly human runners; support auras do not stack.

Run `python -m http.server 8011` and open `http://localhost:8011`. Tests: `/tests/index.html`, `/tests/lifecycle.html`, `/tests/headquarters.html`, `/tests/roster.html`. Python only serves static files; the game has no build step. `scripts/expand_roster.py` regenerates the original roster data and vector artwork.

The older prototype notes below are historical and are superseded by this current play flow where they differ.

# Copper Reach — Headquarters prototype

Original browser-first 3D tower defense, using Three.js 0.180.0, native ES modules and a single renderer. No install or build step.

## Run

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open [the game](http://localhost:8000/). Internet access to the pinned jsDelivr module and WebGL are required.

## Play

You arrive in a first-person headquarters. Walk with **WASD**, look with **arrow keys** or by dragging the world, and use **E** near a station. On touchscreens, hold the direction buttons while dragging the world with another finger. Every major station also has a menu shortcut. **Escape** closes panels; native dialog focus keeps keyboard navigation inside them.

Choose **Missions → Survival or Hardcore** to enter the separate preparation hall. Its 3D map table, armory, and supplies frame the staging controls. Choose among Copper Reach, Frostline Depot, Ember Pass, and Verdant Loop, edit the three-slot loadout, then deploy. Selection remains immutable for that run. Empty loadouts cannot deploy.

Battles use an overhead 3D strategy camera by default, with **V** switching to first person. Pan with **WASD**, zoom with the wheel, and right-drag to orbit and tilt; on touchscreens, hold the movement pad and drag the world to adjust the view. Select a tower in the bottom tray, then click/tap valid terrain. Road, arena bounds, tower overlap and cost are validated in simulation. Hover an enemy for its health; click a placed tower for its nearby upgrade panel. **Space** starts each wave, **Escape** cancels, and **R** restarts a terminal battle. Headquarters returns from any battle; abandoning an unfinished battle gives no mission reward.

New profiles start with Scout, Sniper, and Demoman equipped. Two Scouts at different bends are a viable Beginner opening. Battle cash and account coins are separate.

## Included systems

- Walkable procedural headquarters with station landmarks, collision, animated screens, a freight carrier, rotating tower displays, a secret log and a victory trophy.
- Separate walkable preparation hall, four longer maps, mode selection, locked deployment settings and a short camera introduction.
- Owned/locked tower inventory, one rotating 3D inspection preview using the existing renderer, equip/unequip/swap, mastery XP and three cosmetic finishes.
- Tower and skin purchases, cosmetic crates with a 3D reveal, duplicate compensation, a visible prize wheel and code redemption (`FIRSTLIGHT` is the starter code).
- Four-page first-visit tutorial, visible seven-visit daily login track, UTC daily/weekly quests, active-play reward, three starter progression tiers, achievements, field index, best clear times and wins.
- Versioned saved profile behind `SaveStore`. Missing, malformed or unavailable storage recovers safely. Browser storage is local to the chosen origin; localhost and 127.0.0.1 are separate profiles.
- Reduced-motion setting and optional original synthesized machinery/interface audio, muted by default. These accessibility settings currently apply to the session.

## Scope limits

This is a playable headquarters prototype, not the full brainstorm. Story, Event and Sandbox are visibly unavailable. The named final bosses currently share procedural enemy models, and most specialist roles share prototype kits. Emotes, consumables, rotating daily shop stock, and story-driven expansion remain unfinished. The starter progression track is permanent, not a timed live-service season. Cosmetics are shared finishes, not individual authored character skins.

## Verification

- `/tests/`: 12 legacy pure-logic checks.
- `/tests/lifecycle.html`: 5 legacy renderer/input/restart checks.
- `/tests/headquarters.html`: 11 profile, movement, battle and scene-transition integration checks, using in-memory storage to avoid modifying the player's save.
- `/tests/responsive.html`: embeds the real game at phone and landscape dimensions for visual/manual checks.

See `tests/EVIDENCE.md` for observed results and browser limitations. Native Chrome/Edge/Firefox and physical mobile-device input remain manual release gates.

## Ownership

`Game` owns the single fixed-step/render loop and renderer. `SceneRouter` owns the active scene, immutable mission snapshot, shared UI, profile and audio. `LobbyScene` mirrors plain walking state; `BattleScene` mirrors `WaveManager`. Each scene removes its listeners and disposes its resources when left. `SaveStore` is the only localStorage caller. Models and world signage are original procedural assets; reference screenshots are never runtime imports.

### Color and material update

Existing 3D spaces now include procedural panel, fabric and terrain textures, layered tower equipment, brighter station architecture and arena dressing. All 74 original SVG portraits and 14 interface icons have richer color and highlights. Run `python scripts/enrich_art.py` after regenerating roster artwork to reapply the SVG detail pass; it is idempotent and is not a runtime/build dependency.
