// Authored from the mode and wave tables supplied for this project.
export const MODE_CAMPAIGNS = Object.freeze({
  easy: {
    enemies: {
      "Normal": {"health": 4, "description": "The basic starting enemy. Very weak and slow enough for almost any tower to handle."},
      "Speedy": {"health": 4, "description": "A weak but faster early-game enemy."},
      "Slow": {"health": 14, "description": "Moves slowly but has much more HP than Normal or Speedy."},
      "Normal Boss": {"health": 150, "description": "The first major tank enemy. Much more durable than the basic enemies."},
      "Hidden": {"health": 15, "description": "Cannot be targeted unless a tower has Hidden Detection."},
      "Breaker2": {"health": 20, "description": "When killed, it creates a Breaker."},
      "Breaker": {"health": 10, "description": "The smaller and faster enemy released from Breaker2."},
      "Necromancer": {"health": 360, "description": "A summoner that creates Skeletons, increasing the number of enemies on the path."},
      "Skeleton": {"health": 15, "description": "Weak enemy summoned by Necromancers."},
      "Armored": {"health": 100, "description": "Has defense, reducing incoming damage."},
      "Slow Boss": {"health": 1400, "description": "Extremely slow but has a large amount of HP."},
      "Enraged": {"health": 165, "description": "A dangerous fast enemy that can quickly run through weak defenses."},
      "Breaker3": {"health": 90, "description": "Has defense and creates a Breaker2 when defeated, continuing the Breaker chain."},
      "Brute": {"health": 10000, "description": "Easy Mode's final boss. Can smash/stun towers and is vastly tougher than everything before it."},
    },
    waves: [
      [["Normal",4]], // 1
      [["Normal",4],["Speedy",2]], // 2
      [["Normal",10],["Speedy",4]], // 3
      [["Normal",6],["Speedy",4],["Slow",3]], // 4
      [["Normal",5],["Slow",6]], // 5
      [["Slow",4],["Speedy",8],["Normal Boss",1]], // 6
      [["Slow",6],["Speedy",8],["Normal Boss",1]], // 7
      [["Normal",10],["Slow",8],["Hidden",5]], // 8
      [["Normal Boss",2],["Hidden",7],["Speedy",5]], // 9
      [["Slow",6],["Speedy",7],["Breaker2",5]], // 10
      [["Breaker2",10],["Hidden",10],["Normal Boss",1]], // 11
      [["Slow",5],["Breaker2",13],["Hidden",7],["Necromancer",1]], // 12
      [["Breaker2",8],["Armored",6]], // 13
      [["Breaker2",10],["Armored",12],["Hidden",7],["Normal Boss",2]], // 14
      [["Normal Boss",3],["Breaker2",8],["Armored",10],["Necromancer",2]], // 15
      [["Breaker2",6],["Hidden",4],["Armored",6],["Slow Boss",1]], // 16
      [["Slow",10],["Enraged",10],["Breaker2",6]], // 17
      [["Breaker2",8],["Armored",12],["Enraged",6],["Necromancer",2]], // 18
      [["Enraged",7],["Breaker2",15],["Normal Boss",1],["Slow Boss",1],["Breaker3",3]], // 19
      [["Breaker3",4],["Breaker2",8],["Armored",5],["Normal Boss",6],["Enraged",5],["Brute",1]], // 20
    ],
  },
  casual: {
    enemies: {
      "Normal": {"health": 5, "description": "Basic starting enemy."},
      "Speedy": {"health": 4, "description": "Fast but fragile early enemy."},
      "Slow": {"health": 20, "description": "Slow early tank."},
      "Normal Boss": {"health": 220, "description": "Early high-HP enemy."},
      "Hidden": {"health": 24, "description": "Requires Hidden Detection."},
      "Enraged": {"health": 60, "description": "Fast enemy intended to pressure slower defenses."},
      "Armored": {"health": 70, "description": "Has defense and takes reduced damage."},
      "Breaker2": {"health": 30, "description": "Splits into one Breaker when killed."},
      "Breaker": {"health": 15, "description": "Smaller child of Breaker2."},
      "Necromancer": {"health": 750, "description": "Summons Skeletons onto the path."},
      "Skeleton": {"health": 50, "description": "Summoned by Necromancers; also appears directly on some waves."},
      "Slow Boss": {"health": 3000, "description": "Very slow but extremely durable."},
      "Hidden Boss": {"health": 1500, "description": "A high-HP Hidden enemy requiring detection."},
      "Hazmat": {"health": 175, "description": "Defensive enemy with resistance/immunity to several status effects."},
      "Speedy Boss": {"health": 4000, "description": "Combines very high HP with high movement speed."},
      "Bolt": {"health": 200, "description": "Extremely fast enemy; one of Casual's largest speed checks."},
      "Breaker3": {"health": 60, "description": "Defensive splitter that produces Breaker2."},
      "Breaker4": {"health": 250, "description": "Large Breaker that splits into three Breaker3s, creating a huge swarm."},
      "Grave Digger": {"health": 40000, "description": "Final boss. Uses abilities rather than merely walking down the path and can create additional pressure."},
    },
    waves: [
      [["Normal",4]], // 1
      [["Normal",4],["Speedy",4]], // 2
      [["Normal",5],["Speedy",3]], // 3
      [["Slow",5]], // 4
      [["Normal",6],["Speedy",3],["Slow",4]], // 5
      [["Normal",5],["Speedy",7],["Slow",9]], // 6
      [["Normal",8],["Speedy",5],["Slow",6],["Normal Boss",1]], // 7
      [["Normal",4],["Speedy",3],["Slow",8]], // 8
      [["Hidden",12]], // 9
      [["Normal",16],["Speedy",6],["Slow",10],["Hidden",4],["Normal Boss",2]], // 10
      [["Slow",14],["Speedy",18],["Breaker2",6],["Normal",6]], // 11
      [["Breaker2",8],["Normal Boss",4],["Slow",6],["Speedy",16],["Normal",8],["Hidden",3]], // 12
      [["Slow",16],["Normal",14],["Breaker2",9],["Armored",12],["Normal Boss",4],["Speedy",7]], // 13
      [["Armored",9],["Normal Boss",5],["Breaker2",4],["Speedy",8],["Skeleton",8],["Necromancer",1]], // 14
      [["Hidden",20],["Breaker2",9],["Normal Boss",10],["Armored",4]], // 15
      [["Speedy",8],["Breaker2",10],["Armored",6],["Normal Boss",4],["Enraged",7],["Necromancer",1],["Skeleton",8]], // 16
      [["Armored",12],["Normal Boss",4],["Necromancer",2],["Enraged",8],["Breaker2",9]], // 17
      [["Breaker2",20],["Breaker3",16],["Necromancer",2]], // 18
      [["Normal Boss",12],["Breaker3",8],["Enraged",16],["Armored",8],["Necromancer",2],["Slow Boss",1]], // 19
      [["Breaker3",11],["Normal Boss",12],["Enraged",10],["Hazmat",12],["Armored",8],["Necromancer",2]], // 20
      [["Enraged",6],["Slow Boss",2],["Hazmat",10],["Necromancer",4],["Normal Boss",7],["Armored",9]], // 21
      [["Normal Boss",11],["Hazmat",26],["Armored",16],["Hidden Boss",3],["Necromancer",5],["Enraged",10],["Skeleton",14]], // 22
      [["Hazmat",12],["Enraged",4],["Necromancer",5],["Hidden Boss",2],["Armored",8],["Breaker3",6],["Normal Boss",8],["Speedy",16],["Speedy Boss",1]], // 23
      [["Skeleton",16],["Necromancer",6],["Hidden Boss",4],["Bolt",14],["Slow Boss",3],["Normal Boss",4],["Armored",14],["Breaker3",10]], // 24
      [["Bolt",10],["Hidden Boss",4],["Normal",40],["Speedy",40],["Slow",28],["Hazmat",6],["Necromancer",5],["Normal Boss",4],["Breaker3",6],["Slow Boss",3],["Grave Digger",1],["Breaker4",3]], // 25
    ],
  },
  intermediate: {
    enemies: {
      "Normal": {"health": 5, "description": "Basic enemy."},
      "Speedy": {"health": 6, "description": "Fast basic enemy."},
      "Slow": {"health": 25, "description": "Slow but tougher basic enemy."},
      "Normal Boss": {"health": 180, "description": "Early tank."},
      "Abnormal": {"health": 10, "description": "Stronger version of a basic zombie."},
      "Quick": {"health": 14, "description": "Fast enemy with little HP."},
      "Heavy": {"health": 45, "description": "Slow, 25% Defense enemy."},
      "Elite Abnormal": {"health": 250, "description": "Major early-game tank with 30% Defense."},
      "Hidden": {"health": 35, "description": "Requires Hidden Detection."},
      "Breaker2": {"health": 40, "description": "Splits into Breaker."},
      "Breaker": {"health": 20, "description": "Child of Breaker2."},
      "Bolt": {"health": 125, "description": "Extremely fast; speed is the main threat."},
      "Reaver": {"health": 200, "description": "Has extremely high Defense, making its effective toughness much greater than 200 HP."},
      "Ghoul": {"health": 500, "description": "Tough aggressive enemy; some wave versions gain Hidden."},
      "Boomer": {"health": 850, "description": "Explosive special enemy that punishes units around it."},
      "Hazmat": {"health": 200, "description": "Defensive enemy resistant to status effects."},
      "Living Experiment": {"health": 2400, "description": "Large experimental tank with Defense."},
      "Speedy Boss": {"health": 2200, "description": "Very fast high-HP enemy."},
      "Slime": {"health": 350, "description": "Mid-game biological enemy that appears in groups."},
      "Breaker4": {"health": 170, "description": "Dies into three Breaker3s."},
      "Breaker3": {"health": 90, "description": "Dies into Breaker2."},
      "Elite Hazmat": {"health": 320, "description": "60% Defense plus several status immunities."},
      "Hidden Boss": {"health": 850, "description": "High-HP Hidden enemy."},
      "Failed Experiment": {"health": 9000, "description": "Huge tank with roughly 50% Defense."},
      "Giant Boss": {"health": 12500, "description": "Massive tank with status immunities."},
      "Patient Zero": {"health": 100000, "description": "Final boss. Can stomp and stun towers and summon Living Experiments, Boomers, Ghouls and Speedy Bosses."},
    },
    waves: [
      [["Normal",4]], // 1
      [["Normal",7]], // 2
      [["Normal",6],["Speedy",3]], // 3
      [["Normal",4],["Speedy",5],["Slow",4]], // 4
      [["Slow",6],["Speedy",6],["Normal",6]], // 5
      [["Normal",8],["Slow",3],["Normal Boss",1]], // 6
      [["Normal",2],["Speedy",2],["Slow",2],["Abnormal",4],["Quick",4],["Heavy",4]], // 7
      [["Abnormal",4],["Heavy",8],["Quick",6]], // 8
      [["Abnormal",8],["Heavy",8],["Elite Abnormal",1]], // 9
      [["Heavy",6],["Quick",8],["Hidden",10]], // 10
      [["Heavy",8],["Quick",6],["Hidden",8],["Elite Abnormal",2]], // 11
      [["Breaker2",6],["Hidden",12],["Heavy",3],["Elite Abnormal",2]], // 12
      [["Bolt",8],["Breaker2",10],["Elite Abnormal",3],["Heavy",6]], // 13
      [["Bolt",10],["Hidden",10],["Abnormal",5],["Quick",5],["Breaker2",8]], // 14
      [["Hidden",10],["Reaver",6],["Breaker2",5],["Bolt",4],["Elite Abnormal",3]], // 15
      [["Hidden",6],["Bolt",4],["Reaver",2],["Breaker2",5],["Elite Abnormal",2],["Ghoul",1]], // 16
      [["Heavy",6],["Elite Abnormal",3],["Reaver",3],["Bolt",9],["Boomer",1],["Ghoul",3],["Breaker2",8]], // 17
      [["Hazmat",12],["Reaver",8],["Bolt",8],["Ghoul",4],["Living Experiment",1],["Breaker2",4]], // 18
      [["Reaver",12],["Ghoul",5],["Hazmat",20],["Breaker2",4],["Bolt",8]], // 19
      [["Bolt",24],["Speedy Boss",1]], // 20
      [["Hazmat",6],["Slime",18],["Breaker2",10],["Reaver",6],["Elite Abnormal",3],["Living Experiment",2],["Ghoul",4]], // 21
      [["Bolt",9],["Boomer",1],["Slime",5],["Breaker4",3],["Speedy Boss",1],["Hazmat",12],["Ghoul",3],["Living Experiment",2]], // 22
      [["Living Experiment",1],["Breaker2",5],["Slime",15],["Elite Hazmat",18],["Ghoul",4],["Breaker4",2],["Boomer",1],["Bolt",5],["Hidden Boss",1]], // 23
      [["Elite Hazmat",18],["Breaker4",6],["Reaver",7],["Slime",18],["Speedy Boss",2],["Bolt",12],["Ghoul",8],["Boomer",2],["Living Experiment",3]], // 24
      [["Slime",14],["Ghoul",5],["Hidden Boss",3],["Elite Hazmat",6],["Breaker4",4],["Reaver",3],["Failed Experiment",1],["Bolt",4]], // 25
      [["Living Experiment",6],["Breaker4",3],["Ghoul",8],["Slime",12],["Boomer",1],["Hazmat",6],["Elite Hazmat",6],["Reaver",5],["Speedy Boss",1],["Bolt",6]], // 26
      [["Living Experiment",4],["Reaver",11],["Elite Hazmat",27],["Ghoul",12],["Slime",12],["Breaker4",12],["Failed Experiment",1],["Bolt",16],["Speedy Boss",1]], // 27
      [["Bolt",15],["Elite Hazmat",12],["Boomer",2],["Living Experiment",1],["Ghoul",3],["Slime",12],["Reaver",7],["Breaker4",3],["Speedy Boss",1],["Giant Boss",1]], // 28
      [["Elite Hazmat",22],["Boomer",2],["Bolt",14],["Ghoul",11],["Speedy Boss",3],["Breaker4",3],["Slime",15],["Living Experiment",3],["Reaver",5],["Failed Experiment",1]], // 29
      [["Normal",5],["Speedy",5],["Slow",5],["Abnormal",5],["Quick",5],["Heavy",5],["Slime",15],["Boomer",3],["Normal Boss",3],["Elite Abnormal",3],["Breaker4",2],["Reaver",3],["Ghoul",3],["Bolt",9],["Living Experiment",3],["Elite Hazmat",3],["Giant Boss",1],["Patient Zero",1]], // 30
    ],
  },
  molten: {
    enemies: {
      "Abnormal": {"health": 6, "description": "Basic Molten-mode starting enemy."},
      "Quick": {"health": 8, "description": "Fast early enemy."},
      "Heavy": {"health": 45, "description": "Slow enemy with 25% Defense."},
      "Elite Abnormal": {"health": 250, "description": "30% Defense early tank."},
      "Molten": {"health": 90, "description": "Fire-themed enemy with Defense and resistance to burning."},
      "Corpse": {"health": 75, "description": "Remains/spawned body used by certain Molten enemies."},
      "Molten Demon": {"health": 160, "description": "Enemy commonly summoned by Molten Necromancers."},
      "Breaker": {"health": 40, "description": "Final small member of the Breaker chain."},
      "Breaker2": {"health": 60, "description": "Splits into Breaker."},
      "Breaker3": {"health": 160, "description": "Splits into Breaker2."},
      "Molten Golem": {"health": 2750, "description": "Large tank with Defense."},
      "Elite Hazmat": {"health": 320, "description": "60% Defense and strong status resistance."},
      "Hidden Boss": {"health": 1000, "description": "High-HP Hidden enemy."},
      "Molten Necromancer": {"health": 1750, "description": "Summons Molten Demons."},
      "Elite Boomer": {"health": 900, "description": "Explosive fast special enemy."},
      "Molten Hound": {"health": 500, "description": "Extremely fast enemy that explodes on death and can damage units."},
      "Molten Mech": {"health": 1800, "description": "Fast mechanical tank with strong Defense."},
      "Bulwark": {"health": 6000, "description": "Very slow defensive enemy with stun immunity."},
      "Breaker4": {"health": 320, "description": "Splits into three Breaker3s."},
      "Elite Molten": {"health": 1000, "description": "Upgraded Molten enemy."},
      "Molten Executioner": {"health": 27500, "description": "Huge enemy whose hammer attack can stun towers."},
      "Tanker": {"health": 17500, "description": "Large late-game tank with stun/freeze immunity."},
      "Molten Summoner": {"health": 15000, "description": "Summons Elite Moltens."},
      "Molten Titan": {"health": 9000, "description": "High-HP enemy with Defense."},
      "Molten Warlord": {"health": 150000, "description": "Final boss. Uses powerful area attacks/shockwaves capable of stunning towers and damaging units."},
    },
    waves: [
      [["Abnormal",4]], // 1
      [["Quick",3],["Abnormal",5]], // 2
      [["Abnormal",6],["Quick",5]], // 3
      [["Quick",12]], // 4
      [["Heavy",4]], // 5
      [["Heavy",6],["Quick",10]], // 6
      [["Abnormal",12],["Elite Abnormal",1]], // 7
      [["Heavy",9]], // 8
      [["Molten",3],["Heavy",5],["Abnormal",6],["Quick",6]], // 9
      [["Heavy",5],["Elite Abnormal",1],["Abnormal",9]], // 10
      [["Heavy",6],["Molten Demon",2],["Quick",8]], // 11
      [["Molten",3],["Elite Abnormal",2],["Heavy",6]], // 12
      [["Elite Abnormal",2],["Molten Demon",4]], // 13
      [["Breaker3",3],["Elite Abnormal",1],["Heavy",10]], // 14
      [["Molten",5],["Molten Demon",3],["Elite Abnormal",2]], // 15
      [["Molten",4],["Molten Golem",1],["Elite Abnormal",2]], // 16
      [["Elite Hazmat",6],["Molten Demon",4]], // 17
      [["Molten",8],["Elite Abnormal",2],["Molten Demon",3],["Hidden Boss",1],["Breaker3",5]], // 18
      [["Molten Demon",4],["Hidden Boss",2],["Breaker3",5]], // 19
      [["Molten",8],["Molten Necromancer",2],["Molten Demon",4],["Heavy",6]], // 20
      [["Molten Golem",1],["Elite Hazmat",5],["Elite Boomer",1],["Breaker3",5]], // 21
      [["Molten Demon",3],["Elite Hazmat",5],["Molten Hound",4],["Molten Necromancer",1]], // 22
      [["Molten",6],["Hidden Boss",1],["Molten Demon",4],["Molten Mech",1],["Molten Hound",4]], // 23
      [["Hidden Boss",3],["Molten Demon",5],["Molten Golem",1],["Molten Necromancer",1]], // 24
      [["Molten",8],["Bulwark",1],["Molten Demon",4],["Breaker3",8],["Elite Boomer",1],["Hidden Boss",1],["Molten Necromancer",1]], // 25
      [["Molten Golem",4],["Breaker3",6],["Molten Hound",6],["Breaker4",6],["Molten Mech",1]], // 26
      [["Elite Boomer",2],["Elite Molten",8],["Elite Hazmat",10]], // 27
      [["Elite Molten",4],["Molten Mech",3],["Hidden Boss",5],["Molten Hound",5]], // 28
      [["Molten Golem",5],["Molten Mech",2],["Elite Boomer",1],["Elite Molten",8],["Breaker4",6]], // 29
      [["Molten Executioner",1],["Molten Golem",3],["Bulwark",2],["Elite Molten",3]], // 30
      [["Hidden Boss",4],["Molten Mech",1],["Elite Boomer",1],["Molten Hound",4],["Tanker",2],["Elite Hazmat",8],["Breaker4",5],["Bulwark",3],["Molten Necromancer",5]], // 31
      [["Tanker",1],["Molten Necromancer",4],["Molten Summoner",1],["Bulwark",3],["Molten Hound",15]], // 32
      [["Hidden Boss",6],["Breaker4",8],["Molten Necromancer",6],["Molten Summoner",3],["Bulwark",8],["Elite Molten",8]], // 33
      [["Tanker",2],["Elite Hazmat",6],["Molten Executioner",1],["Elite Molten",8],["Molten Titan",4],["Molten Summoner",1],["Bulwark",5]], // 34
      [["Molten Titan",3],["Molten Executioner",1],["Molten Warlord",1],["Tanker",1],["Elite Molten",6],["Bulwark",3]], // 35
    ],
  },
  fallen: {
    enemies: {
      "Abnormal": {"health": 8, "description": "Basic Fallen starting enemy."},
      "Quick": {"health": 10, "description": "Fast early enemy."},
      "Fallen Skeleton": {"health": 50, "description": "Early Fallen infantry; can also be summoned."},
      "Fallen Dreg": {"health": 80, "description": "Leaves a Corpse behind when defeated."},
      "Corpse": {"health": 75, "description": "Remains created when Fallen Dregs die."},
      "Fallen Squire": {"health": 500, "description": "Armored enemy often given Aggro, forcing towers to focus on it."},
      "Breaker2": {"health": 100, "description": "Splits into Breaker."},
      "Breaker": {"health": 50, "description": "Child of Breaker2."},
      "Fallen Soul": {"health": 150, "description": "Faster supernatural Fallen enemy."},
      "Fallen": {"health": 300, "description": "Fast standard Fallen warrior."},
      "Fallen Giant": {"health": 4000, "description": "Large high-HP tank."},
      "Fallen Hazmat": {"health": 400, "description": "60% Defense plus burn/stun/freeze resistance."},
      "Possessed Armor": {"health": 1500, "description": "Has a 750 shield and heavy Defense; becomes more dangerous when its armor is destroyed."},
      "Fallen Necromancer": {"health": 3000, "description": "Summons Fallen Skeletons."},
      "Corrupted Fallen": {"health": 1200, "description": "Fast upgraded Fallen."},
      "Fallen Seraph": {"health": 250, "description": "Fast scouting/support-style Fallen enemy."},
      "Fallen Jester": {"health": 10000, "description": "Throws special presents that buff nearby enemies."},
      "Necrotic Skeleton": {"health": 1400, "description": "Fast powerful skeleton, often summoned by Fallen Summoners or Fallen King."},
      "Breaker4": {"health": 320, "description": "Splits into three Breaker3s."},
      "Breaker3": {"health": 160, "description": "Splits into Breaker2."},
      "Fallen Rusher": {"health": 900, "description": "Extremely fast shielded enemy; designed to charge through defenses."},
      "Fallen Hero": {"health": 3500, "description": "Durable elite Fallen warrior."},
      "Fallen Shield": {"health": 15000, "description": "Has an additional 5,000 shield and very high Defense."},
      "Fallen Summoner": {"health": 12500, "description": "Summons Necrotic Skeletons."},
      "Fallen Angel": {"health": 5000, "description": "Flying enemy; requires towers capable of attacking Flying enemies."},
      "Fallen Honor Guard": {"health": 100000, "description": "Huge miniboss that leaves a trail which speeds up enemies walking over it."},
      "Fallen Tank": {"health": 22500, "description": "Heavy late-game tank."},
      "Fallen Guardian": {"health": 45000, "description": "Elite sword enemy that can attack/stun nearby towers."},
      "Fallen King": {"health": 250000, "description": "Final boss. Uses attacks and summons reinforcements including Necrotic Skeletons."},
    },
    waves: [
      [["Abnormal",5]], // 1
      [["Abnormal",8]], // 2
      [["Abnormal",6],["Quick",4]], // 3
      [["Quick",8],["Abnormal",8]], // 4
      [["Fallen Skeleton",3],["Abnormal",5],["Quick",5]], // 5
      [["Fallen Skeleton",5]], // 6
      [["Fallen Dreg",1],["Abnormal",9],["Quick",3]], // 7
      [["Fallen Dreg",3],["Fallen Skeleton",4]], // 8
      [["Fallen Squire",1],["Abnormal",6],["Fallen Skeleton",4]], // 9
      [["Fallen Dreg",3],["Breaker2",2],["Fallen Skeleton",4]], // 10
      [["Fallen Squire",1],["Fallen Dreg",3],["Fallen Skeleton",3],["Breaker2",3]], // 11
      [["Fallen Soul",11]], // 12
      [["Fallen Skeleton",5],["Fallen Dreg",3],["Fallen Squire",1]], // 13
      [["Breaker2",6],["Fallen Soul",6],["Fallen",3]], // 14
      [["Fallen Skeleton",8],["Fallen Squire",2],["Breaker2",4],["Fallen",1]], // 15
      [["Fallen Dreg",5],["Fallen Soul",4],["Fallen",3],["Fallen Squire",2],["Fallen Giant",1]], // 16
      [["Fallen Hazmat",6],["Fallen",2]], // 17
      [["Fallen Giant",1],["Fallen Hazmat",7]], // 18
      [["Fallen Squire",3],["Fallen Dreg",10],["Fallen",4],["Fallen Soul",8],["Possessed Armor",1]], // 19
      [["Fallen",6],["Fallen Hazmat",5],["Fallen Skeleton",8],["Fallen Squire",3],["Fallen Necromancer",1]], // 20
      [["Corrupted Fallen",2],["Breaker2",5],["Fallen Squire",3],["Fallen Soul",8],["Possessed Armor",2]], // 21
      [["Corrupted Fallen",3],["Fallen Squire",3],["Fallen Seraph",5]], // 22
      [["Fallen Squire",3],["Fallen Seraph",5],["Fallen Necromancer",1],["Fallen Hazmat",5]], // 23
      [["Fallen Soul",7],["Possessed Armor",3],["Fallen Hazmat",4],["Corrupted Fallen",2]], // 24
      [["Possessed Armor",1],["Fallen Hazmat",6],["Corrupted Fallen",3],["Fallen Giant",3],["Fallen Jester",1]], // 25
      [["Necrotic Skeleton",1],["Fallen Giant",3],["Breaker4",8]], // 26
      [["Fallen Giant",1],["Necrotic Skeleton",3],["Possessed Armor",3],["Fallen Seraph",8],["Fallen Necromancer",1]], // 27
      [["Fallen Rusher",7]], // 28
      [["Fallen Rusher",1],["Corrupted Fallen",4],["Breaker4",10],["Fallen Hazmat",8],["Fallen Hero",1],["Fallen Seraph",9]], // 29
      [["Fallen Rusher",3],["Corrupted Fallen",5],["Fallen Giant",4],["Fallen Necromancer",1],["Fallen Shield",1],["Necrotic Skeleton",5],["Fallen Summoner",1]], // 30
      [["Fallen Hero",6],["Fallen Giant",3],["Fallen Hazmat",7],["Possessed Armor",3],["Corrupted Fallen",4],["Fallen Necromancer",2],["Fallen Summoner",1]], // 31
      [["Fallen Shield",1],["Fallen Rusher",5],["Breaker4",6],["Fallen Jester",2],["Fallen Hero",4]], // 32
      [["Necrotic Skeleton",1],["Corrupted Fallen",7],["Fallen Giant",3],["Fallen Necromancer",3],["Fallen Seraph",18],["Fallen Angel",1]], // 33
      [["Fallen Shield",1],["Necrotic Skeleton",2],["Fallen Hero",6],["Fallen Rusher",6],["Fallen Summoner",1]], // 34
      [["Necrotic Skeleton",1],["Breaker4",9],["Fallen Hero",5],["Fallen Giant",3],["Fallen Necromancer",3],["Fallen Honor Guard",1]], // 35
      [["Fallen Giant",4],["Corrupted Fallen",8],["Fallen Hero",10],["Fallen Tank",1]], // 36
      [["Corrupted Fallen",10],["Fallen Hero",12],["Fallen Necromancer",3],["Possessed Armor",15],["Fallen Giant",3],["Fallen Angel",3],["Fallen Summoner",2]], // 37
      [["Fallen Shield",1],["Necrotic Skeleton",3],["Possessed Armor",14],["Fallen Rusher",7],["Fallen Hero",8],["Fallen Angel",5],["Fallen Guardian",1],["Fallen Tank",1]], // 38
      [["Fallen Tank",1],["Fallen Rusher",6],["Breaker4",6],["Fallen Shield",1],["Fallen Hero",7],["Fallen Giant",5],["Fallen Jester",3],["Fallen Guardian",1],["Fallen Summoner",1]], // 39
      [["Fallen Shield",1],["Fallen Rusher",8],["Necrotic Skeleton",3],["Fallen Tank",1],["Possessed Armor",6],["Fallen Hero",5],["Fallen Giant",3],["Fallen Angel",3],["Fallen Summoner",2],["Fallen Guardian",2],["Fallen King",1]], // 40
    ],
  },
  hardcore: {
    enemies: {
      "Odd": {"health": 13, "description": "Basic Void enemy."},
      "Swift": {"health": 12, "description": "Very fast early enemy."},
      "Hefty": {"health": 50, "description": "Slow early tank with Defense."},
      "Mandrake": {"health": 100, "description": "Special enemy that releases smaller early enemies when defeated."},
      "Phantom": {"health": 70, "description": "Hidden enemy."},
      "Balloon": {"health": 15, "description": "Starts as a Flying enemy protected by a balloon/shield."},
      "Lead": {"health": 30, "description": "Has the Lead property, requiring attacks capable of damaging Lead protection."},
      "Elite Lead": {"health": 400, "description": "Much stronger shielded Lead enemy."},
      "Mystery": {"health": 80, "description": "When killed, changes/spawns into another enemy."},
      "Blighted": {"health": 4500, "description": "Large corrupted tank."},
      "Cursed Skeleton": {"health": 400, "description": "Regenerates health and may receive additional modifiers."},
      "Voidling": {"health": 2500, "description": "Fast Void enemy; can also be summoned by other enemies."},
      "Void Reaper": {"health": 2250, "description": "Summoner that creates four Mysteries."},
      "Elite Phantom": {"health": 3250, "description": "Stronger Hidden Phantom."},
      "Mandragora": {"health": 6500, "description": "Large upgraded Mandrake."},
      "Void Rusher": {"health": 800, "description": "Very fast, shielded enemy."},
      "Void Pike": {"health": 1500, "description": "Armored/Lead-type Void soldier."},
      "Void Titan": {"health": 27500, "description": "Huge hammer enemy with status immunity and dangerous attacks."},
      "Void Floater": {"health": 750, "description": "Has a large 1,500 shield; its pod is tougher than its actual body."},
      "Elite Mystery": {"health": 2000, "description": "Strong Mystery capable of producing dangerous advanced enemies."},
      "Void Brute": {"health": 60000, "description": "Giant miniboss-level tank."},
      "Unknown Small": {"health": 6000, "description": "Fast later-game Void enemy."},
      "Elite Void Rusher": {"health": 4000, "description": "Upgraded shielded Rusher."},
      "Nightshade": {"health": 4000, "description": "Special summoner/support enemy."},
      "Void Keeper": {"health": 100000, "description": "Major boss with ranged attacks and summoning abilities."},
      "Soul": {"health": 2500, "description": "Fast Hidden + Ghost enemy."},
      "Slow King": {"health": 12000, "description": "Slow shielded tank with very high Defense while protected."},
      "Void Cultist": {"health": 15000, "description": "Summons Healing Beacons."},
      "Healing Beacon": {"health": 1, "description": "Invincible-style support summon that repeatedly heals nearby enemies; destroying it normally isn't the solution."},
      "Speedy King": {"health": 3000, "description": "On death creates an area that gives enemies a 50% speed boost for 10 seconds."},
      "Vindicator": {"health": 50000, "description": "Has a 15,000 shield and extremely high Defense while protected."},
      "Elite Soul": {"health": 20000, "description": "Strong Hidden/Ghost Soul with status immunity."},
      "Unknown Boss": {"health": 27500, "description": "On death explodes/debuffs and creates extra pressure."},
      "Heavy Voidling": {"health": 40000, "description": "Fast heavy enemy; its stomp stuns towers and damages units."},
      "Void Knight": {"health": 75000, "description": "Sword-wielding elite that can stun towers and regenerate health."},
      "Void Trickster": {"health": 20000, "description": "Summons Void Portals and Speedy Kings."},
      "Void Portal": {"health": 6000, "description": "Stationary summoner that repeatedly creates Voidlings."},
      "Void Swordmaster": {"health": 350000, "description": "Major sword miniboss with extremely high HP and dangerous abilities."},
      "Void Guardian": {"health": 150000, "description": "Massive spear enemy; can attack/stun towers."},
      "Void Eye": {"health": 15000, "description": "Nearly stationary summon whose ranged attack creates explosions that stun towers."},
      "Void Reaver": {"health": 1200000, "description": "Hardcore final boss. Has multiple phases/abilities, curses towers and summons additional enemies."},
    },
    waves: [
      [["Odd",3],["Swift",3]], // 1
      [["Odd",7]], // 2
      [["Swift",5]], // 3
      [["Hefty",4],["Odd",5]], // 4
      [["Hefty",2],["Swift",4]], // 5
      [["Odd",3],["Hefty",6]], // 6
      [["Hefty",3],["Odd",6],["Swift",4]], // 7
      [["Mandrake",1],["Hefty",4],["Odd",5]], // 8
      [["Hefty",12]], // 9
      [["Phantom",7]], // 10
      [["Hefty",6],["Mandrake",1],["Swift",6]], // 11
      [["Balloon",6]], // 12
      [["Phantom",10],["Mandrake",2]], // 13
      [["Lead",8]], // 14
      [["Phantom",6],["Mandrake",2],["Balloon",7],["Lead",6]], // 15
      [["Mandrake",3],["Lead",8],["Elite Lead",1]], // 16
      [["Mandrake",4],["Mystery",8]], // 17
      [["Mystery",5],["Mandrake",3],["Elite Lead",2],["Lead",5],["Balloon",10]], // 18
      [["Mandrake",1],["Lead",6],["Phantom",8],["Elite Lead",2],["Blighted",1]], // 19
      [["Elite Lead",3],["Cursed Skeleton",5]], // 20
      [["Mystery",6],["Balloon",6],["Voidling",1],["Cursed Skeleton",4]], // 21
      [["Lead",8],["Phantom",7],["Void Reaper",1],["Cursed Skeleton",5],["Mystery",8]], // 22
      [["Cursed Skeleton",5],["Elite Lead",3],["Elite Phantom",1],["Phantom",6]], // 23
      [["Voidling",1],["Cursed Skeleton",9],["Blighted",2],["Void Reaper",1]], // 24
      [["Elite Lead",6],["Elite Phantom",3]], // 25
      [["Blighted",2],["Mandragora",1],["Cursed Skeleton",6]], // 26
      [["Void Rusher",7]], // 27
      [["Elite Lead",6],["Cursed Skeleton",7],["Void Pike",3]], // 28
      [["Mandragora",1],["Void Reaper",2],["Elite Phantom",3],["Void Rusher",9]], // 29
      [["Blighted",3],["Mandragora",1],["Void Titan",1],["Void Rusher",6],["Cursed Skeleton",4],["Balloon",6],["Void Reaper",1],["Voidling",2]], // 30
      [["Blighted",3],["Voidling",4],["Elite Phantom",4],["Void Floater",6]], // 31
      [["Void Pike",4],["Elite Phantom",3],["Elite Mystery",7]], // 32
      [["Void Pike",4],["Voidling",8],["Elite Mystery",8],["Blighted",4],["Mandragora",1],["Void Brute",1],["Void Titan",1],["Void Rusher",9],["Void Floater",5]], // 33
      [["Void Floater",6],["Mandragora",2],["Unknown Small",4],["Elite Void Rusher",5]], // 34
      [["Mandragora",1],["Nightshade",2],["Elite Void Rusher",2],["Void Pike",6],["Elite Mystery",5]], // 35
      [["Nightshade",1],["Elite Void Rusher",5],["Elite Mystery",4],["Blighted",3],["Mandragora",2],["Void Keeper",1],["Void Reaper",3],["Void Rusher",8],["Unknown Small",4],["Void Floater",5]], // 36
      [["Soul",10],["Slow King",3],["Void Pike",6],["Void Titan",1],["Unknown Small",4]], // 37
      [["Slow King",2],["Void Titan",3],["Void Cultist",1],["Elite Mystery",6],["Void Floater",10]], // 38
      [["Soul",8],["Slow King",4],["Speedy King",3],["Nightshade",4],["Unknown Small",5]], // 39
      [["Soul",7],["Nightshade",5],["Slow King",4],["Vindicator",1],["Elite Mystery",5],["Unknown Small",6],["Elite Void Rusher",8],["Void Pike",10],["Speedy King",3]], // 40
      [["Soul",6],["Elite Soul",4],["Void Titan",1],["Unknown Boss",3],["Speedy King",3],["Void Cultist",1],["Heavy Voidling",1]], // 41
      [["Slow King",6],["Void Titan",2],["Void Knight",1],["Void Trickster",1],["Speedy King",4],["Soul",8]], // 42
      [["Heavy Voidling",1],["Elite Soul",3],["Slow King",4],["Void Knight",2],["Vindicator",1],["Void Swordmaster",1],["Elite Void Rusher",6],["Void Cultist",2]], // 43
      [["Slow King",3],["Void Knight",1],["Void Guardian",1],["Elite Void Rusher",12],["Elite Soul",5],["Void Trickster",2],["Unknown Boss",4]], // 44
      [["Heavy Voidling",3],["Elite Soul",5],["Slow King",10],["Vindicator",1],["Speedy King",9],["Nightshade",6],["Unknown Boss",4],["Void Titan",4],["Void Knight",3],["Void Guardian",1],["Void Reaver",1]], // 45
    ],
  },
  voidcore: {
    enemies: {
      "Odd": {"health": 17, "description": "Basic Voidcore enemy."},
      "Swift": {"health": 24, "description": "Very fast early enemy."},
      "Hefty": {"health": 75, "description": "Slow defensive early tank."},
      "Cursed Skeleton": {"health": 150, "description": "Health-regenerating skeleton. Interestingly, its Voidcore base HP is lower than Hardcore's, but it appears much earlier."},
      "Phantom": {"health": 100, "description": "Hidden enemy."},
      "Balloon": {"health": 15, "description": "Flying enemy while its balloon protection remains."},
      "Lead": {"health": 80, "description": "Lead enemy with an additional protective shield."},
      "Elite Lead": {"health": 650, "description": "Large shielded Lead enemy."},
      "Mystery": {"health": 260, "description": "Dies into a random enemy."},
      "Blighted": {"health": 5000, "description": "High-HP corrupted enemy."},
      "Mandrake": {"health": 750, "description": "Releases smaller enemies when defeated."},
      "Voidling": {"health": 2800, "description": "Fast Void enemy."},
      "Elite Phantom": {"health": 3500, "description": "Strong Hidden Phantom."},
      "Void Reaper": {"health": 2750, "description": "Summons four Mysteries."},
      "Void Floater": {"health": 1250, "description": "Protected by a huge 2,500 shield."},
      "Void Rusher": {"health": 1250, "description": "Fast enemy with a 400 shield."},
      "Void Pike": {"health": 2000, "description": "Armored Lead-style enemy."},
      "Void Titan": {"health": 40000, "description": "Huge hammer enemy."},
      "Mandragora": {"health": 12000, "description": "Giant upgraded Mandrake."},
      "Elite Mystery": {"health": 4500, "description": "Advanced random-enemy summoner."},
      "Void Brute": {"health": 80000, "description": "Giant miniboss tank."},
      "Void Keeper": {"health": 40000, "description": "Boss with ranged attacks and summoning abilities."},
      "Unknown Small": {"health": 9000, "description": "Fast later-game enemy."},
      "Elite Void Rusher": {"health": 5000, "description": "Upgraded shielded Rusher."},
      "Slow King": {"health": 14000, "description": "Has an additional 7,000 shield and huge Defense while protected."},
      "Speedy King": {"health": 3500, "description": "Creates a 50%-speed-boost area on death."},
      "Crystalian": {"health": 40000, "description": "Special boss with strong defensive mechanics."},
      "Soul": {"health": 3000, "description": "Fast Hidden + Ghost enemy."},
      "Elite Soul": {"health": 25000, "description": "Strong Hidden/Ghost Soul."},
      "Void Trickster": {"health": 20000, "description": "Summons Void Portals and Speedy Kings."},
      "Void Portal": {"health": 8000, "description": "Stationary object that repeatedly summons Voidlings."},
      "Nightshade": {"health": 5000, "description": "Special summoner/support enemy."},
      "Vindicator": {"health": 65000, "description": "Has a huge 25,000 shield and enormous Defense."},
      "Unknown Boss": {"health": 32500, "description": "Dangerous death effect and enemy spawning."},
      "Void Cultist": {"health": 20000, "description": "Summons Healing Beacons."},
      "Healing Beacon": {"health": 1, "description": "Support summon that continuously heals enemies."},
      "Soul Stealer": {"health": 375000, "description": "Major Voidcore boss that manipulates/summons Souls and other Void enemies."},
      "Void Eye": {"health": 15000, "description": "Stationary ranged stunner summoned by major enemies."},
      "Heavy Voidling": {"health": 40000, "description": "Fast tank whose stomp stuns towers."},
      "Void Knight": {"health": 90000, "description": "Large sword enemy capable of tower disruption and regeneration."},
      "Void Swordmaster": {"health": 700000, "description": "Extremely powerful late-game miniboss."},
      "Void Guardian": {"health": 200000, "description": "Giant spear enemy with tower-stunning attacks."},
      "Void Reaver": {"health": 1200000, "description": "Main Wave 50 boss with multiple phases, curses and summons."},
      "Void Caster": {"health": 650000, "description": "Appears with/supports the Void Reaver. Can protect, revive/support it and create additional enemies."},
    },
    waves: [
      [["Odd",4],["Swift",2]], // 1
      [["Odd",6]], // 2
      [["Odd",6],["Swift",3]], // 3
      [["Hefty",4],["Odd",6]], // 4
      [["Odd",8],["Swift",6]], // 5
      [["Swift",7],["Hefty",2]], // 6
      [["Swift",3],["Hefty",6],["Odd",7]], // 7
      [["Cursed Skeleton",2],["Hefty",4],["Swift",5]], // 8
      [["Cursed Skeleton",1],["Swift",4],["Hefty",4]], // 9
      [["Phantom",6]], // 10
      [["Balloon",6]], // 11
      [["Cursed Skeleton",3],["Phantom",4]], // 12
      [["Lead",8]], // 13
      [["Lead",5],["Phantom",7],["Balloon",7]], // 14
      [["Lead",5],["Elite Lead",1],["Cursed Skeleton",4]], // 15
      [["Mystery",4],["Cursed Skeleton",10]], // 16
      [["Lead",6],["Elite Lead",2],["Mystery",4],["Phantom",6]], // 17
      [["Cursed Skeleton",4],["Lead",7],["Elite Lead",3],["Blighted",1]], // 18
      [["Cursed Skeleton",7],["Mandrake",3]], // 19
      [["Lead",7],["Mystery",5],["Balloon",8],["Voidling",1]], // 20
      [["Mandrake",8],["Lead",4],["Elite Lead",5]], // 21
      [["Phantom",10],["Cursed Skeleton",5],["Elite Phantom",1]], // 22
      [["Voidling",1],["Mystery",8],["Mandrake",7],["Void Reaper",1]], // 23
      [["Blighted",2],["Void Reaper",1],["Mystery",6],["Voidling",1]], // 24
      [["Balloon",4],["Elite Phantom",3],["Void Floater",3],["Phantom",8]], // 25
      [["Mandrake",8],["Mystery",8],["Blighted",1],["Void Reaper",2],["Elite Lead",4]], // 26
      [["Voidling",2],["Void Rusher",5]], // 27
      [["Void Pike",3],["Elite Phantom",5],["Void Floater",5]], // 28
      [["Void Pike",3],["Blighted",3],["Mandrake",5],["Void Reaper",3]], // 29
      [["Elite Lead",3],["Elite Phantom",3],["Blighted",3],["Void Titan",1],["Void Rusher",9],["Voidling",3]], // 30
      [["Mandragora",2],["Mandrake",8],["Blighted",4],["Mystery",6]], // 31
      [["Voidling",1],["Void Floater",12],["Mandragora",2],["Void Reaper",3]], // 32
      [["Void Pike",7],["Void Rusher",12],["Elite Mystery",5]], // 33
      [["Void Rusher",7],["Voidling",2],["Void Pike",5],["Blighted",3],["Mandragora",2],["Void Brute",1]], // 34
      [["Void Reaper",3],["Void Keeper",1],["Elite Phantom",2],["Elite Mystery",5]], // 35
      [["Unknown Small",4],["Mandragora",2],["Void Floater",10]], // 36
      [["Mandragora",1],["Elite Mystery",5],["Void Rusher",8],["Elite Void Rusher",5]], // 37
      [["Void Titan",1],["Slow King",2],["Void Pike",12],["Elite Void Rusher",4]], // 38
      [["Elite Mystery",4],["Slow King",3],["Unknown Small",6],["Speedy King",3]], // 39
      [["Crystalian",1],["Slow King",2],["Elite Void Rusher",5],["Void Titan",1],["Unknown Small",8],["Speedy King",1]], // 40
      [["Soul",12],["Elite Soul",3],["Slow King",3]], // 41
      [["Mandragora",3],["Void Trickster",1],["Elite Mystery",8],["Nightshade",4],["Unknown Small",6]], // 42
      [["Nightshade",7],["Void Titan",2],["Void Floater",6],["Unknown Small",6],["Slow King",3],["Vindicator",1],["Void Trickster",1]], // 43
      [["Elite Soul",3],["Unknown Boss",3],["Soul",5],["Unknown Small",5],["Void Cultist",1],["Elite Void Rusher",5]], // 44
      [["Soul",13],["Elite Soul",5],["Slow King",4],["Void Titan",3],["Void Cultist",1],["Soul Stealer",1],["Unknown Boss",2]], // 45
      [["Heavy Voidling",2],["Elite Void Rusher",9],["Slow King",6],["Soul",6],["Speedy King",7],["Void Trickster",1]], // 46
      [["Elite Soul",4],["Unknown Boss",4],["Heavy Voidling",2],["Void Titan",2],["Void Knight",1],["Crystalian",1],["Void Cultist",3]], // 47
      [["Heavy Voidling",1],["Nightshade",5],["Unknown Small",6],["Unknown Boss",2],["Crystalian",1],["Soul",6],["Elite Soul",3],["Vindicator",1],["Elite Void Rusher",8],["Speedy King",4],["Slow King",6],["Void Titan",4],["Void Trickster",1],["Void Knight",2],["Void Swordmaster",1]], // 48
      [["Nightshade",18],["Slow King",12],["Void Knight",3],["Void Guardian",1],["Void Trickster",3],["Void Cultist",1],["Elite Void Rusher",10],["Speedy King",3]], // 49
      [["Vindicator",1],["Slow King",7],["Void Cultist",1],["Unknown Boss",4],["Heavy Voidling",2],["Elite Void Rusher",14],["Void Titan",5],["Void Guardian",2],["Void Knight",4],["Void Trickster",1],["Void Reaver",1]], // 50
    ],
  },
});
