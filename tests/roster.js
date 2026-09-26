import * as THREE from 'three';
import { TOWERS } from '../src/data/towers.js';
import { SaveStore } from '../src/storage/SaveStore.js';
import { WaveManager } from '../src/gameplay/WaveManager.js';
import { MAPS } from '../src/data/headquarters.js';
import { createTower,updateTower } from '../src/gameplay/Tower.js';
import { createEnemy } from '../src/gameplay/Enemy.js';
import { updateSpecialists } from '../src/gameplay/specialists.js';
import { createTowerMesh,createEnemyMesh,disposeObject } from '../src/rendering/createMeshes.js';
const results=[];
const assert=(v,m='Assertion failed')=>{if(!v)throw Error(m);};
async function test(name,fn){try{await fn();results.push('PASS — '+name);}catch(e){results.push('FAIL — '+name+': '+e.message);console.error(e);}}
await test('All 74 recruits purchase, equip and persist; shards cannot be replaced by coins',()=>{
 let data=null;const storage={getItem:()=>data,setItem:(k,v)=>data=v},s=new SaveStore(storage);s.data.coins=100000;s.data.shards=0;const hardcore=Object.values(TOWERS).find(t=>t.tier==='Hardcore');s.buy(hardcore.id);assert(!s.data.owned.includes(hardcore.id));s.data.shards=100000;
 for(const t of Object.values(TOWERS)){s.buy(t.id);assert(s.data.owned.includes(t.id));assert(s.equip(t.id,1));const before=s.data[t.currency];s.buy(t.id);assert(s.data[t.currency]===before);}
 const reloaded=new SaveStore(storage);assert(reloaded.data.owned.length===74);assert(reloaded.data.loadout[1]===s.data.loadout[1]);
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
await test('Fallen / Voidcore complete, award shards, and reset all entities',()=>{
 for(const mode of ['fallen','hardcore','voidcore']){const mission={path:MAPS[0].path,map:MAPS[0].id,mode,loadout:['longwatch']};const b=new WaveManager(mission);b.cash=1000;for(const x of [-4,3])assert(b.place(x,0,'longwatch').ok,'Placement '+x);b.start();for(let i=0;i<10000&&b.state==='WAVE_ACTIVE';i++)b.update(1/60);assert(b.state==='WON',mode);const s=new SaveStore({getItem:()=>null,setItem:()=>{}});s.complete(b,mission);assert(s.data.shards===50);b.restart();assert(!b.allies.length&&!b.towers.length&&!b.enemies.length);}
});
await test('Character and zombie geometry renders, then releases all resources',()=>{
 const renderer=new THREE.WebGLRenderer();renderer.setSize(900,380);document.querySelector('#gallery').append(renderer.domElement);const scene=new THREE.Scene();scene.background=new THREE.Color(0x172d38);scene.add(new THREE.HemisphereLight(0xffffff,0x65798a,3));const camera=new THREE.PerspectiveCamera(40,900/380,.1,100);camera.position.set(5,5,13);camera.lookAt(0,1,0);
 const models=['prism-sentry','bulwark-guard','beam-channeler','field-mender','supply-grower'].map(id=>createTowerMesh(false,TOWERS[id]));models.push(createEnemyMesh(),createEnemyMesh(true));models.forEach((m,i)=>{m.position.x=(i-3)*1.6;scene.add(m);});renderer.render(scene,camera);assert(renderer.info.memory.geometries>0);assert(renderer.info.memory.textures>0,'Surface maps upload');for(const m of models)disposeObject(m);renderer.render(scene,camera);assert(renderer.info.memory.geometries===0);assert(renderer.info.memory.textures===0,'Surface maps release');renderer.dispose();
});
for(const result of results){const li=document.createElement('li');li.textContent=result;document.querySelector('#results').append(li);}document.querySelector('#summary').textContent=results.filter(r=>r.startsWith('PASS')).length+' / '+results.length+' roster checks passed';
