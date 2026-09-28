import * as THREE from 'three';
import { SceneRouter } from '../src/core/SceneRouter.js';
import { SaveStore } from '../src/storage/SaveStore.js';
import { WaveManager } from '../src/gameplay/WaveManager.js';
import { MAPS } from '../src/data/headquarters.js';
const results=[];
function assert(v,m='Assertion failed'){if(!v)throw Error(m);}
function test(name,fn){try{fn();results.push('PASS — '+name);}catch(e){results.push('FAIL — '+name+' / '+e.message);console.error(e);}}
const memory=()=>{let data=null;return {getItem:()=>data,setItem:(key,value)=>{data=value;}};};
const store=new SaveStore(memory());
test('New profiles begin with three distinct equipped defenders',()=>{
 assert(store.data.loadout.join(',')==='prism-sentry,longwatch,blast-courier');
 assert(store.data.loadout.every(id=>store.data.owned.includes(id)));
});
test('Save recovery rejects malformed fields, unknown towers, duplicate slots and future versions',()=>{
 const p=store.normalize({version:1,coins:-1,played:'bad',loadout:['prism-sentry','prism-sentry','unknown'],skins:['unknown']});assert(p.coins===200&&p.played===0&&p.loadout[1]===null&&p.loadout[2]===null&&p.skin==='standard');assert(store.normalize({version:900}).loadout[0]==='prism-sentry');
});
test('Purchases, loadout swaps and skin changes survive save/reload',()=>{
 store.redeem('FIRSTLIGHT');assert(store.data.coins===300);store.equip('longwatch',0);assert(store.data.loadout.join(',')==='longwatch,prism-sentry,blast-courier');const reloaded=new SaveStore(store.storage);assert(reloaded.data.loadout[0]==='longwatch'&&reloaded.data.coins===300);assert(!store.equip('unknown',1));
});
test('Daily login, codes and starter claims cannot pay twice',()=>{
 store.claim('login');const n=store.data.coins;store.claim('login');store.redeem('FIRSTLIGHT');store.claim('daily');assert(store.data.coins===n);assert(store.redeem('OLDRELAY').includes('expired'));assert(store.redeem('nonsense').includes('Invalid'));
});
test('Every expanded map accepts roadside defense and undefended routes can lose',()=>{
 for(const map of MAPS)for(const mode of ['survival','challenge']){
  const b=new WaveManager({path:map.path,mode,loadout:['prism-sentry','longwatch']});
  assert(map.path.length>=8&&b.pathLength>100,map.id+' path too short');const near={x:map.path[1].x+4,z:0};assert(b.place(near.x,near.z).ok,map.id+' placement');assert(!b.place(near.x,near.z).ok,'Overlap accepted');
  const loss=new WaveManager({path:map.path,mode,loadout:['prism-sentry']});loss.start();for(let i=0;i<10000&&loss.state==='WAVE_ACTIVE';i++)loss.update(1/60);assert(loss.state==='LOST');
 }
});
test('Longwatch uses its own damage, range and price with a locked loadout',()=>{
 const b=new WaveManager({path:MAPS[0].path,mode:'survival',loadout:['longwatch']});assert(!b.place(-13,0,'prism-sentry').ok);const result=b.place(-13,0,'longwatch');assert(result.ok&&b.cash===60&&result.tower.definition.range===9);b.start();for(let i=0;i<1000;i++)b.update(1/60);assert(b.killed>0);
});
test('Recurring quest periods reset, and crate/ticket rewards consume once',()=>{
 const s=new SaveStore(memory());s.data.daily={period:'2000-01-01',missions:9,claimed:true};s.data.weekly={period:'2000-01-01',kills:90,claimed:true};s.refreshPeriods();assert(s.data.daily.missions===0&&!s.data.daily.claimed&&s.data.weekly.kills===0);s.buy('crate');const reveal=s.openCrate();assert(reveal&&s.data.crates===0&&s.openCrate()===null);s.spin();const coins=s.data.coins;s.spin();assert(s.data.coins===coins&&s.data.tickets===0);
});
test('Wheel prize data matches the coins granted for each segment',()=>{
 const original=Math.random,prizes=[25,40,60,100];
 try{for(let i=0;i<4;i++){Math.random=()=> (i+.1)/4;const s=new SaveStore(memory()),before=s.data.coins,result=s.spin();assert(result.index===i&&result.coins===prizes[i]&&s.data.coins===before+prizes[i]&&s.data.tickets===0);}}
 finally{Math.random=original;}
});
const html=new DOMParser().parseFromString(await(await fetch('/')).text(),'text/html');
document.querySelector('#fixture').append(html.querySelector('#game'),html.querySelector('#hq-dialog'));document.querySelector('#loading').remove();
const canvas=document.createElement('canvas');canvas.tabIndex=0;document.querySelector('#viewport').append(canvas);
const renderer=new THREE.WebGLRenderer({canvas});renderer.setSize(960,600,false);
const app=new SceneRouter(canvas);app.store=store;app.reducedMotion=true;app.init();app.enter();app.ui.close();app.resize(960,600);
test('Keyboard and multi-touch movement move, collide and clear on blur',()=>{
 const s=app.active;canvas.focus();const before=s.camera.position.z;canvas.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',bubbles:true,cancelable:true}));for(let i=0;i<30;i++)s.update(1/60);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'}));assert(s.camera.position.z<before);for(let i=0;i<1000;i++){s.input.keys.add('KeyW');s.update(1/60);}assert(s.camera.position.z>-13,'Walked through terminal');window.dispatchEvent(new Event('blur'));assert(s.input.keys.size===0);s.input.touch.set(7,'right');const x=s.camera.position.x;s.update(.1);assert(s.camera.position.x>x);document.dispatchEvent(new Event('visibilitychange'));assert(s.input.touch.size===0);
});
test('Empty loadouts block deploy; map and loadout lock at deployment',()=>{
 app.prepare();store.unequip(0);store.unequip(1);store.unequip(2);app.deploy();assert(!app.deploying);store.equip('prism-sentry',0);app.selectMap('frostline');app.deploy();assert(Object.isFrozen(app.mission)&&Object.isFrozen(app.mission.loadout));app.update(.1);assert(app.kind==='battle'&&app.active.battle.path===MAPS[1].path);
});
test('Mission result pays exactly once and a terminal restart resets without duplicate rewards',()=>{
 const b=app.active.battle;app.active.chooseTower('prism-sentry');app.active.x=-11;app.active.z=0;app.active.hasPoint=true;app.active.click();for(let i=0;i<100000&&!app.active.terminal;i++){if(b.state==='PREP')app.active.start();app.active.update(1/60);}assert(app.active.terminal);const n=store.data.coins;app.active.update(1);app.active.render(renderer,1);assert(store.data.coins===n);app.active.restart();assert(app.active.battle.state==='PREP'&&app.active.battle.cash===200&&store.data.coins===n);
});
test('Repeated headquarters/prep/battle transitions release GPU resources',()=>{
 app.go('hq');app.render(renderer,1);const base={...renderer.info.memory};
 for(let i=0;i<3;i++){app.prepare();app.ui.close();app.render(renderer,1);app.deploy();app.update(.1);app.render(renderer,1);app.go('hq');app.render(renderer,1);}
 assert(renderer.info.memory.geometries===base.geometries,'Geometry leaked');assert(renderer.info.memory.textures===base.textures,'Textures leaked');
});
test('Portrait and desktop resizing preserve finite cameras and dialog controls',()=>{
 for(const [w,h] of [[390,844],[1280,720]]){app.resize(w,h);assert(app.active.camera.aspect===w/h);app.ui.open('inventory');app.ui.update(.1);app.render(renderer,1);app.ui.close();}
});
app.exit();app.dispose();renderer.dispose();
for(const text of results){const li=document.createElement('li');li.textContent=text;document.querySelector('#results').append(li);}
document.querySelector('#summary').textContent=results.filter(s=>s.startsWith('PASS')).length+' / '+results.length+' headquarters checks passed';
