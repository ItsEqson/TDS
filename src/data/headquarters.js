import { WAYPOINTS } from './arena.js';
export const WALK = Object.freeze({ speed:6, turnSpeed:1.7, sensitivity:.004, radius:.45, eyeHeight:2.2, bound:21 });
export const MAPS = Object.freeze([
  {id:'copper-reach',name:'Copper Reach',theme:'Highland relay',color:0x50b694,path:WAYPOINTS,brief:'A winding road crosses the highland relay.',space:'Wide inner bends',hazard:'None'},
  {id:'frostline',name:'Frostline Depot',theme:'Frozen supply outpost',color:0x9bbfc7,path:[[-26,-13],[-15,-13],[-15,13],[-2,13],[-2,-11],[12,-11],[12,12],[24,12]].map(([x,z])=>({x,z})),brief:'A long supply route with tight turns.',space:'Central corridor',hazard:'Low visibility beyond the arena'},
  {id:'ember-pass',name:'Ember Pass',theme:'Red rock canyon',color:0xc98961,path:[[-26,12],[-19,12],[-19,-12],[-8,-12],[-8,10],[5,10],[5,-10],[17,-10],[17,12],[24,12]].map(([x,z])=>({x,z})),brief:'Hold a switchback through warm canyon stone.',space:'Several broad plateaus',hazard:'Long final approach'},
  {id:'verdant-loop',name:'Verdant Loop',theme:'Overgrown observatory',color:0x63ae7c,path:[[-26,-12],[-15,-12],[-15,10],[-2,10],[-2,-10],[12,-10],[12,11],[24,11]].map(([x,z])=>({x,z})),brief:'Protect the observatory along its long garden road.',space:'Open center',hazard:'Dense outer foliage'}
]);
export const MODES = Object.freeze([
  {id:'beginner',name:'Beginner',detail:'Short introduction. Final threat: the Brute.',available:true,category:'survival',waves:5,healthScale:1},
  {id:'easy',name:'Easy',detail:'Growing groups. Final threat: the Grave Digger.',available:true,category:'survival',waves:8,healthScale:1.2},
  {id:'intermediate',name:'Intermediate',detail:'Faster and sturdier enemies. Final threat: Patient Zero.',available:true,category:'survival',waves:10,healthScale:1.45},
  {id:'molten',name:'Molten',detail:'Heat-charged enemies. Final threat: the Molten Warlord.',available:true,category:'survival',waves:12,healthScale:1.75},
  {id:'fallen',name:'Fallen',detail:'Fallen enemies. Final threats: the Fallen Monarchs.',available:true,category:'survival',waves:15,healthScale:2.1},
  {id:'hardcore',name:'Hardcore',detail:'A long void assault. Win to unlock Voidcore.',available:true,category:'hardcore',waves:20,healthScale:2.5},
  {id:'voidcore',name:'Voidcore',detail:'The void returns with greater force.',available:true,category:'hardcore',waves:25,healthScale:3.2},
  ...['Story','Event','Sandbox'].map(name=>({id:name.toLowerCase(),name,detail:'Additional mission content in development.',available:false}))
]);
export const FINAL_BOSSES=Object.freeze({beginner:'Brute',easy:'Grave Digger',intermediate:'Patient Zero',molten:'Molten Warlord',fallen:'Fallen Monarch',hardcore:'Void Reaver',voidcore:'The Void'});
export const STATIONS = Object.freeze([
  {id:'missions',name:'DEPLOYMENT',x:0,z:-17,color:0x8cddcf},
  {id:'inventory',name:'ARMORY',x:-13,z:-12,color:0x9eabff},
  {id:'shop',name:'REQUISITIONS',x:13,z:-12,color:0xf7c879},
  {id:'rewards',name:'REWARDS',x:-17,z:1,color:0xf4b180},
  {id:'quests',name:'OPERATIONS',x:17,z:1,color:0xa3d590},
  {id:'trophies',name:'HALL OF RECORDS',x:0,z:17,color:0xe5ce8e},
  {id:'crates',name:'SALVAGE BAY',x:-13,z:12,color:0xc99fed},
  {id:'index',name:'ARCHIVE',x:13,z:12,color:0x8ec9f1}
]);
export const SKINS = Object.freeze({standard:{name:'Relay standard',color:0x74d5be},amber:{name:'Amber circuit',color:0xffb857},violet:{name:'Violet signal',color:0xc593ff}});
export const ECONOMY = Object.freeze({startCoins:200,towerPrice:250,skinPrice:80,cratePrice:100,winCoins:60,lossCoins:15,playSeconds:300,playCoins:40});
export const OPERATION=Object.freeze({count:11,bossHealth:90,bossSpeed:1.5,bossDamage:10,challengeSpeed:1.35,killCash:5,bossCash:30,deploySeconds:1.4,flyoverSeconds:2.6});
