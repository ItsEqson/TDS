import * as THREE from 'three';
import { TOWERS } from '../src/data/towers.js';
import { SaveStore } from '../src/storage/SaveStore.js';
import { WaveManager } from '../src/gameplay/WaveManager.js';
import { MAPS } from '../src/data/headquarters.js';
import { MODES } from '../src/data/headquarters.js';
import { MODE_CAMPAIGNS } from '../src/data/modeCampaigns.js';
import { campaignEnemy } from '../src/data/enemies.js';
import { selectTarget } from '../src/gameplay/Targeting.js';
import { VARIANTS,GOLDEN_FORMS,baseTower,requiredTowerLevel } from '../src/data/progression.js';
import { createTower,updateTower,towerStats,upgradeCost } from '../src/gameplay/Tower.js';
import { createEnemy } from '../src/gameplay/Enemy.js';
import { updateSpecialists } from '../src/gameplay/specialists.js';
import { createTowerMesh,createEnemyMesh,disposeObject } from '../src/rendering/createMeshes.js';
const results=[];
const assert=(v,m='Assertion failed')=>{if(!v)throw Error(m);};
async function test(name,fn){try{await fn();results.push('PASS — '+name);}catch(e){results.push('FAIL — '+name+': '+e.message);console.error(e);}}
await test('Base roster, level gates and alternate forms persist without duplicate loadout towers',()=>{
 let data=null;const storage={getItem:()=>data,setItem:(k,v)=>data=v},s=new SaveStore(storage);s.data.coins=300000;s.data.shards=100000;
 for(const [id,level] of Object.entries(requiredTowerLevel)){assert(s.buy(id).includes(`level ${level}`));assert(!s.data.owned.includes(id));}
 s.data.xp=17400;assert(s.level===175);
 for(const t of Object.values(TOWERS).filter(t=>!VARIANTS[t.id])){s.buy(t.id);assert(s.data.owned.includes(t.id),t.id);assert(s.equip(t.id,1),t.id);}
 const form='signal-captain',base=VARIANTS[form];s.buy(form);assert(s.setForm(base,form));assert(s.equip(form,1));assert(s.data.loadout[1]===base);
 const before=s.data.coins;s.buy('golden-crate');assert(s.data.coins===before-50000);const gold=s.openGoldenCrate();assert(GOLDEN_FORMS.includes(gold.id)&&gold.base===baseTower(gold.id));assert(s.setForm(gold.base,gold.id));
 const reloaded=new SaveStore(storage);assert(reloaded.data.forms[base]===(gold.base===base?gold.id:form)&&reloaded.data.forms[gold.base]===gold.id);
});
await test('Every portrait loads as a valid image',async()=>{
 await Promise.all(Object.keys(TOWERS).map(id=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.naturalWidth?resolve():reject(Error(id));image.onerror=()=>reject(Error(id));image.src='../assets/icons/towers/'+id+'.svg';})));
});
await test('Splash resolves groups; control respects boss immunity; poison ticks',()=>{
 const enemies=[createEnemy(1),createEnemy(2),createEnemy(3)];enemies.forEach(e=>{e.x=0;e.z=0;e.health=30;});
 updateTower(createTower(1,0,0,TOWERS['blast-courier']),enemies,.1);assert(enemies.every(e=>e.health===22));
 enemies[0].boss=true;updateTower(createTower(2,0,0,TOWERS['gel-runner']),enemies,.1);assert(!enemies[0].slowRemaining);
 enemies[0].boss=false;updateTower(createTower(3,0,0,TOWERS['gel-runner']),enemies,.1);assert(enemies[0].slowRemaining>0);
 updateTower(createTower(4,0,0,TOWERS['spore-rifleman']),enemies,.1);assert(enemies[0].dotRemaining===3);
 const b=new WaveManager();b.enemies=enemies;const health=enemies[0].health;updateSpecialists(b,.1);assert(enemies[0].health<health);
});
await test('Crowd kits use distinct blast, chain, line and cone footprints',()=>{
 const attack=(id,points)=>{const enemies=points.map(([x,z],i)=>{const e=createEnemy(i+1);e.x=x;e.z=z;e.progress=points.length-i;e.health=100;return e;});updateTower(createTower(99,0,0,TOWERS[id]),enemies,.1);return enemies.map(e=>e.health<100);};
 const splash=attack('blast-courier',[[2,0],[2,2],[4,2]]);
 const chain=attack('arc-thrower',[[2,0],[4,0],[6,0],[9,0]]);
 const pierce=attack('wind-fletcher',[[2,0],[3,0],[3,2]]);
 const spread=attack('breach-officer',[[2,0],[3,1],[3,2]]);
 assert(splash[1]&&!splash[2],'Blast should stay centered on impact');
 assert(chain[1]&&chain[2]&&!chain[3],'Chain should hop to a third contact');
 assert(pierce[1]&&!pierce[2],'Pierce should follow a narrow line');
 assert(spread[1]&&!spread[2],'Scatter should cover a limited cone');
});
await test('Income, healing, nonstacking support and friendly runners operate only during combat',()=>{
 const b=new WaveManager();b.towers=['supply-grower','field-mender','rally-officer','signal-captain','prism-sentry','contract-captain'].map((id,i)=>createTower(i,0,0,TOWERS[id]));b.health=5;const cash=b.cash;b.update(5);assert(b.cash===cash);b.start();for(let i=0;i<301;i++)b.update(1/60);assert(b.cash>=cash+12);assert(b.health>=6);assert(b.towers[4].attackBoost===1.25);assert(b.nextAllyId>0);
});
await test('Five upgrades improve live stats; selling returns 60% once',()=>{
 const b=new WaveManager();b.cash=5000;const placed=b.place(-13,0);assert(placed.ok);const t=placed.tower,base=towerStats(t);for(let i=0;i<5;i++){const cost=upgradeCost(t),cash=b.cash;assert(b.upgrade(t.id));assert(b.cash===cash-cost);}assert(t.level===5&&towerStats(t).damage>base.damage&&towerStats(t).range>base.range&&towerStats(t).intervalSeconds<base.intervalSeconds);assert(upgradeCost(t)===null&&!b.upgrade(t.id));const refund=Math.floor(t.invested*.6),cash=b.cash;assert(b.sell(t.id)===refund&&b.cash===cash+refund);assert(b.sell(t.id)===null);
});
await test('Survival waves increase contacts and enemy health',()=>{
 const mission={path:MAPS[0].path,map:MAPS[0].id,mode:'beginner',loadout:['prism-sentry']},b=new WaveManager(mission);b.health=1000;b.start();b.update(1/60);const first=b.enemies[0].maxHealth,count=b.count;for(let i=0;i<10000&&b.wave===1;i++)b.update(1/60);assert(b.state==='WAVE_ACTIVE'&&b.wave===2);b.update(1/60);assert(b.count>count&&b.enemies.some(e=>e.wave===2&&e.maxHealth>first));
});
await test('Beginner can be won with two Scouts and affordable upgrades',()=>{
 const b=new WaveManager({path:MAPS[0].path,map:MAPS[0].id,mode:'beginner',loadout:['prism-sentry']});
 assert(b.place(-13,0).ok&&b.place(-1,0).ok);
 let upgraded=0;
 for(let i=0;i<100000&&!['WON','LOST'].includes(b.state);i++){
   if(b.state==='PREP')b.start();
   if(b.state==='INTERMISSION'&&upgraded!==b.wave){for(const t of b.towers)b.upgrade(t.id);upgraded=b.wave;}
   b.update(1/60);
 }
 assert(b.state==='WON','Outcome '+b.state+' on wave '+b.wave+' with '+b.health+' health');
});
await test('Hardcore victory persists the Voidcore unlock',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(key,value)=>saved=value},s=new SaveStore(storage);
 assert(!s.data.clearedModes.includes('hardcore'));
 s.complete({state:'WON',killed:0,health:10,towers:[],elapsed:12},{mode:'hardcore',map:'copper-reach'});
 assert(new SaveStore(storage).data.clearedModes.includes('hardcore'));
});
await test('Campaign wave counts and triumph rewards match mode data; restart clears entities',()=>{
 const counts={easy:20,casual:25,intermediate:30,molten:35,fallen:40,hardcore:45,voidcore:50};for(const [id,waves] of Object.entries(counts)){assert(MODES.find(m=>m.id===id).waves===waves);assert(MODE_CAMPAIGNS[id].waves.length===waves);}
 for(const mode of ['easy','casual','intermediate','molten','fallen','hardcore','voidcore']){const mission={path:MAPS[0].path,map:MAPS[0].id,mode,loadout:['longwatch']},b=new WaveManager(mission),m=MODES.find(x=>x.id===mode);assert(b.totalWaves===m.waves);b.cash=1000;assert(b.place(-13,0,'longwatch').ok);b.state='WON';const s=new SaveStore({getItem:()=>null,setItem:()=>{}}),reward=s.complete(b,mission),day=new Date().getUTCDay(),boost=day===0||day>=5?2:1;assert(reward===(m.rewards.coins||0)&&s.data.xp===m.rewards.xp*boost&&s.data.shards===(m.rewards.shards||0));b.restart();assert(!b.allies.length&&!b.towers.length&&!b.enemies.length);}
});
await test('Supplied wave groups spawn their named enemies and base health',()=>{
 const cases=[['easy','Normal',4,'Brute'],['casual','Normal',5,'Grave Digger'],['intermediate','Normal',5,'Patient Zero'],['molten','Abnormal',6,'Molten Warlord'],['fallen','Abnormal',8,'Fallen King'],['hardcore','Odd',13,'Void Reaver'],['voidcore','Odd',17,'Void Reaver']];
 for(const [mode,name,health,final] of cases){
  const b=new WaveManager({path:MAPS[0].path,mode,loadout:['prism-sentry']});
  assert(b.remaining===MODE_CAMPAIGNS[mode].waves[0].reduce((n,[,count])=>n+count,0),mode+' prep contacts');
  b.start();b.update(1/60);
  assert(b.count===MODE_CAMPAIGNS[mode].waves[0].reduce((n,[,count])=>n+count,0),mode+' first-wave count');
  assert(b.enemies[0].name===name&&b.enemies[0].maxHealth===health,mode+' first enemy');
  assert(MODE_CAMPAIGNS[mode].waves.at(-1).some(([enemy])=>enemy===final),mode+' final boss');
 }
});
await test('A campaign enemy keeps its listed HP across waves and reinforcements',()=>{
 const mission={path:MAPS[0].path,mode:'easy',loadout:['prism-sentry']},b=new WaveManager(mission);
 for(const wave of [1,8,12,20]){
  b.wave=wave;b.state='PREP';b.start();b.update(1/60);
  const name=b.spawnPlan[0],listed=campaignEnemy('easy',name).health;
  assert(b.enemies[0].maxHealth===listed,`${name} changed HP on wave ${wave}`);
  const extra=b.spawnCampaignEnemy(name,b.enemies[0]);
  assert(extra.maxHealth===listed,`${name} reinforcement changed HP`);
  b.enemies.length=0;
 }
});
await test('Every supplied wave entry has a defined enemy and positive fixed HP',()=>{
 for(const [mode,campaign] of Object.entries(MODE_CAMPAIGNS)){
  for(const [index,groups] of campaign.waves.entries())for(const [name,count] of groups){
   const enemy=campaignEnemy(mode,name);
   assert(enemy&&Number.isFinite(enemy.health)&&enemy.health>0&&Number.isInteger(count)&&count>0,`${mode} wave ${index+1}: ${name}`);
  }
 }
});
await test('Named enemy types receive distinct procedural visual signatures',()=>{
 const names=new Set(Object.values(MODE_CAMPAIGNS).flatMap(c=>Object.keys(c.enemies)));
 const signatures=new Set([...names].map(name=>[...name].reduce((n,char)=>(n*31+char.charCodeAt(0))>>>0,7)));
 assert(signatures.size===names.size,`${names.size-signatures.size} visual signatures collide`);
});
await test('Detection, lead protection, splits, and summoning use campaign traits',()=>{
 const mission={path:MAPS[0].path,mode:'easy',loadout:['prism-sentry','longwatch','blast-courier']},b=new WaveManager(mission);
 const hidden=createEnemy(1,mission.path,{...campaignEnemy('easy','Hidden'),speed:3});hidden.x=hidden.z=0;
 const scout=createTower(1,0,0,TOWERS['prism-sentry']),sniper=createTower(2,0,0,TOWERS.longwatch);
 assert(selectTarget(scout,[hidden],10)===null);assert(selectTarget(sniper,[hidden],10)===hidden);
 const lead=createEnemy(2,mission.path,{...campaignEnemy('hardcore','Lead'),speed:3});lead.x=lead.z=0;
 assert(selectTarget(scout,[lead],10)===null);assert(selectTarget(createTower(3,0,0,TOWERS['blast-courier']),[lead],10)===lead);
 const breaker=b.spawnCampaignEnemy('Breaker2');b.resolve(breaker,false);assert(b.enemies.some(e=>e.name==='Breaker'));
 const necro=b.spawnCampaignEnemy('Necromancer');b.start();necro.abilityTimer=0;b.update(1/60);assert(b.enemies.some(e=>e.name==='Skeleton'));
});
await test('Partial campaign rewards scale with waves survived',()=>{
 const mission={mode:'hardcore',map:'copper-reach'},s=new SaveStore({getItem:()=>null,setItem:()=>{}});s.complete({state:'LOST',wave:40,killed:0,health:0,towers:[],elapsed:10},mission);assert(s.data.shards>0&&s.data.shards<400&&s.data.xp>10);
});
await test('Selected golden form supplies the deployed tower stats',()=>{
 const b=new WaveManager({path:MAPS[0].path,mode:'easy',loadout:['prism-sentry'],forms:{'prism-sentry':'gilded-prism-sentry'}});const placed=b.place(-13,0,'prism-sentry');assert(placed.ok&&placed.tower.definition.id==='gilded-prism-sentry'&&placed.tower.definition.damage>TOWERS['prism-sentry'].damage);
});
await test('Character and zombie geometry renders, then releases all resources',()=>{
 const renderer=new THREE.WebGLRenderer();renderer.setSize(900,380);document.querySelector('#gallery').append(renderer.domElement);const scene=new THREE.Scene();scene.background=new THREE.Color(0x172d38);scene.add(new THREE.HemisphereLight(0xffffff,0x65798a,3));const camera=new THREE.PerspectiveCamera(40,900/380,.1,100);camera.position.set(5,5,13);camera.lookAt(0,1,0);
 const models=['prism-sentry','bulwark-guard','beam-channeler','field-mender','supply-grower'].map(id=>createTowerMesh(false,TOWERS[id]));models.push(createEnemyMesh(),createEnemyMesh(true));models.forEach((m,i)=>{m.position.x=(i-3)*1.6;scene.add(m);});renderer.render(scene,camera);assert(renderer.info.memory.geometries>0);assert(renderer.info.memory.textures>0,'Surface maps upload');for(const m of models)disposeObject(m);renderer.render(scene,camera);assert(renderer.info.memory.geometries===0);assert(renderer.info.memory.textures===0,'Surface maps release');renderer.dispose();
});
for(const result of results){const li=document.createElement('li');li.textContent=result;document.querySelector('#results').append(li);}document.querySelector('#summary').textContent=results.filter(r=>r.startsWith('PASS')).length+' / '+results.length+' roster checks passed';
