## Current play flow (2026-09-26)

Start in the 3D headquarters. **Choose mission** sits above the bottom loadout dock. Survival lets you pick Beginner, Easy, Intermediate, Molten, or Fallen; Hardcore starts directly, then offers Voidcore after a Hardcore victory. Starting a mode opens the walkable staging lobby with the same player session and loadout. Choose a map, edit the three equipped slots, then deploy. During battle, WASD moves the commander model; the elevated camera keeps placement visible.

Each difficulty runs 5–25 waves with rising enemy count, health, and speed, a final boss, and growing wave-clear cash. Click a placed tower to inspect its special kit, level, current damage/range/fire interval, total damage dealt, upgrade price, and sell refund. Towers have five battle upgrade levels; upgrades improve stats and visibly enlarge their model. Summon damage and damage-over-time count toward the owning tower. The collection now opens as skin/name cards, with a separate 3D inspection view for each tower. Saved content IDs stay compatible while display names follow `raw_game_ideas.md`.

The roster uses 19 working prototype kits rather than 74 bespoke abilities. Existing portraits are original artwork and shared finishes remain the available skins. Only the currently authored 3D maps and enemy models are available; the named mode bosses use the current boss model and scaling.

## Character roster update

The armory and shop now contain **74 original human recruits** representing every tower role named in `raw_game_ideas.md`, including evolved, golden, and story counterparts. Each has a portrait, a rotating human 3D model, an unlock price, and a working prototype combat role. Inventory and shop have category filters. Existing collection saves and equipped IDs are retained.

Normal encounters use zombies. Fallen and Hardcore / Voidcore use purple void zombies and a Rift Brute. These are compact encounters, not full difficulty campaigns. Void victories award 50 shards; hardcore recruits cost shards and other recruits cost coins. Advanced character-specific abilities, combat upgrade trees, aircraft, vehicles, cliff placement, and detection systems remain future work. Summoner characters currently send friendly human runners; support auras do not stack.

Run `python -m http.server 8011` and open `http://localhost:8011`. Tests: `/tests/index.html`, `/tests/lifecycle.html`, `/tests/headquarters.html`, `/tests/roster.html`. Python only serves static files; the game has no build step. `scripts/expand_roster.py` regenerates the original roster data and vector artwork.

The older prototype notes below describe the earlier delivery and are superseded by this roster update where they differ.

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

Battles use a first-person 3D camera. Walk with **WASD** and right-drag to look; on touchscreens, hold the movement pad and drag the world to turn. Select a tower in the bottom tray, then click/tap valid terrain. Road, arena bounds, tower overlap and cost are validated in simulation. Hover an enemy for its health; click a placed tower for its nearby upgrade panel. **Space** starts each wave, **Escape** cancels, and **R** restarts a terminal battle. Headquarters returns from any battle; abandoning an unfinished battle gives no mission reward.

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
