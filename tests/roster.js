import * as THREE from 'three';
import { TOWERS } from '../src/data/towers.js';
import { SaveStore } from '../src/storage/SaveStore.js';
import { WaveManager } from '../src/gameplay/WaveManager.js';
import { MAPS } from '../src/data/headquarters.js';
import { MODES } from '../src/data/headquarters.js';
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
await test('Income, healing, nonstacking support and friendly runners operate only during combat',()=>{
 const b=new WaveManager();b.towers=['supply-grower','field-mender','rally-officer','signal-captain','prism-sentry','contract-captain'].map((id,i)=>createTower(i,0,0,TOWERS[id]));b.health=5;const cash=b.cash;b.update(5);assert(b.cash===cash);b.start();for(let i=0;i<301;i++)b.update(1/60);assert(b.cash>=cash+12);assert(b.health>=6);assert(b.towers[4].attackBoost===1.25);assert(b.nextAllyId>0);
});
await test('Five upgrades improve live stats; selling returns 60% once',()=>{
 const b=new WaveManager();b.cash=5000;const placed=b.place(-13,0);assert(placed.ok);const t=placed.tower,base=towerStats(t);for(let i=0;i<5;i++){const cost=upgradeCost(t),cash=b.cash;assert(b.upgrade(t.id));assert(b.cash===cash-cost);}assert(t.level===5&&towerStats(t).damage>base.damage&&towerStats(t).range>base.range&&towerStats(t).intervalSeconds<base.intervalSeconds);assert(upgradeCost(t)===null&&!b.upgrade(t.id));const refund=Math.floor(t.invested*.6),cash=b.cash;assert(b.sell(t.id)===refund&&b.cash===cash+refund);assert(b.sell(t.id)===null);
});
await test('Survival waves increase contacts and enemy health',()=>{
 const mission={path:MAPS[0].path,map:MAPS[0].id,mode:'beginner',loadout:['prism-sentry']},b=new WaveManager(mission);b.health=1000;b.start();b.update(1/60);const first=b.enemies[0].maxHealth,count=b.count;for(let i=0;i<10000&&b.state==='WAVE_ACTIVE';i++)b.update(1/60);assert(b.state==='PREP'&&b.wave===2);b.start();b.update(1/60);assert(b.count>count&&b.enemies[0].maxHealth>first);
});
await test('Beginner can be won with two Scouts and affordable upgrades',()=>{
 const b=new WaveManager({path:MAPS[0].path,map:MAPS[0].id,mode:'beginner',loadout:['prism-sentry']});
 assert(b.place(-13,0).ok&&b.place(-1,0).ok);
 for(let i=0;i<100000&&!['WON','LOST'].includes(b.state);i++){
   if(b.state==='PREP'){for(const t of b.towers)b.upgrade(t.id);b.start();}
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
 const counts={easy:20,casual:25,intermediate:30,molten:35,fallen:40};for(const [id,waves] of Object.entries(counts))assert(MODES.find(m=>m.id===id).waves===waves);
 for(const mode of ['easy','casual','intermediate','molten','fallen','hardcore','voidcore']){const mission={path:MAPS[0].path,map:MAPS[0].id,mode,loadout:['longwatch']},b=new WaveManager(mission),m=MODES.find(x=>x.id===mode);assert(b.totalWaves===m.waves);b.cash=1000;assert(b.place(-13,0,'longwatch').ok);b.state='WON';const s=new SaveStore({getItem:()=>null,setItem:()=>{}}),reward=s.complete(b,mission),day=new Date().getUTCDay(),boost=day===0||day>=5?2:1;assert(reward===(m.rewards.coins||0)&&s.data.xp===m.rewards.xp*boost&&s.data.shards===(m.rewards.shards||0));b.restart();assert(!b.allies.length&&!b.towers.length&&!b.enemies.length);}
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
