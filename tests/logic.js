import { WaveManager } from '../src/gameplay/WaveManager.js';
import { placementReason } from '../src/gameplay/Placement.js';
import { createEnemy,moveEnemy,resolveEnemy } from '../src/gameplay/Enemy.js';
import { selectTarget } from '../src/gameplay/Targeting.js';
import { WAYPOINTS,SEGMENTS,PATH_LENGTH } from '../src/data/arena.js';
import { ENEMY } from '../src/data/enemies.js';
import { TIMING,WAVE,waveBonus,waveClearBonus } from '../src/data/waves.js';
import { Game } from '../src/core/Game.js';
const checks=[];
function assert(value,message='Assertion failed'){
  if(!value)throw Error(message);
}
function test(name,fn){
  try{
    fn();
    checks.push({
      name,pass:true
    });
  }
  catch(e){
    checks.push({
      name,pass:false,error:e.message
    });
  }
}
function finish(b,dt=1/60){
  for(let i=0;i<120/dt&&b.state==='WAVE_ACTIVE';i++)b.update(dt);
}
test('Fresh battle and guarded start/restart',()=>{
  const b=new WaveManager();
  assert(b.cash===200&&b.health===100&&b.remaining===10&&b.state==='PREP');
  assert(!b.restart());
  assert(b.start());
  assert(!b.start());
  assert(!b.restart());
});
test('Placement rejects road, rounded corners, arena exterior and footprint at edge',()=>{
  for(const p of WAYPOINTS)assert(placementReason(p.x,p.z,[],200));
  assert(placementReason(60,0,[],200));
  assert(placementReason(27.5,0,[],200));
  assert(placementReason(NaN,0,[],200));
  assert(!placementReason(-13,0,[],200));
});
test('Placement charges once, rejects overlap and insufficient funds without mutation',()=>{
  const b=new WaveManager();
  assert(b.place(-13,0).ok&&b.cash===100);
  assert(!b.place(-13,0).ok&&b.cash===100&&b.towers.length===1);
  assert(b.place(4,0).ok&&b.cash===0);
  assert(!b.place(-10,7).ok&&b.cash===0&&b.towers.length===2);
});
test('Enemy visits every waypoint and resolves arrival only once',()=>{
  const e=createEnemy(1);
  for(let i=0;i<SEGMENTS.length;i++){
    moveEnemy(e,SEGMENTS[i].length/ENEMY.speedUnitsPerSecond);
    assert(Math.abs(e.x-WAYPOINTS[i+1].x)<1e-8&&Math.abs(e.z-WAYPOINTS[i+1].z)<1e-8,'Missed waypoint '+i);
  }
  assert(Math.abs(e.progress-PATH_LENGTH)<1e-8);
  assert(resolveEnemy(e)&&!resolveEnemy(e));
  assert(!moveEnemy(e,10));
});
test('Path movement equivalent at 30, 60 and 144 Hz; large steps cross bends',()=>{
  const positions=[];
  for(const hz of [30,60,144]){
    const e=createEnemy(1);
    for(let i=0;i<hz*7;i++)moveEnemy(e,1/hz);
    positions.push(e);
  }
  for(const e of positions)assert(Math.abs(e.progress-21)<1e-8);
  assert(Math.abs(positions[0].x-positions[2].x)<1e-8);
  const e=createEnemy(2);
  moveEnemy(e,7);
  assert(Math.abs(e.x-positions[0].x)<1e-8&&Math.abs(e.z-positions[0].z)<1e-8);
});
test('Targeting chooses furthest living eligible enemy, including range boundary',()=>{
  const t={
    x:0,z:0
  },a={
    id:1,x:1,z:0,progress:2,health:10
  },b={
    id:2,x:6.5,z:0,progress:8,health:10
  },c={
    id:3,x:8,z:0,progress:20,health:10
  },d={
    id:4,x:0,z:0,progress:30,health:0
  };
  assert(selectTarget(t,[a,b,c,d],6.5)===b);
  b.resolved=true;
  assert(selectTarget(t,[a,b,c,d],6.5)===a);
  assert(selectTarget(t,[c,d],6.5)===null);
});
test('Wave spawns exactly ten at the configured fixed interval',()=>{
  const b=new WaveManager();
  b.start();
  for(let i=0;i<660;i++){
    b.update(1/60);
    assert(b.spawned===Math.min(10,Math.floor((b.elapsed-1/60+1e-9)/1.1)+1));
  }
  assert(b.spawned===10);
});
test('Skip vote opens on schedule, preserves spawned enemies, and waits five seconds',()=>{
  const mission={mode:'beginner',path:WAYPOINTS,loadout:['prism-sentry'],waveDurationSeconds:3},b=new WaveManager(mission);
  assert(!b.skipWave());b.start();b.update(1/60);
  const old=b.enemies[0];assert(!b.skipWave());
  for(let i=0;i<60;i++)b.update(1/60);
  assert(b.skipVoteOpen&&b.skipWave()&&b.state==='INTERMISSION'&&b.wave===1&&b.enemies.includes(old));
  assert(b.intermissionRemaining===5&&b.wavesStarted===1);
  for(let i=0;i<299;i++)b.update(1/60);
  assert(b.state==='INTERMISSION');b.update(1/60);
  assert(b.state==='WAVE_ACTIVE'&&b.wave===2&&b.wavesStarted===2);
});
test('Wave timer ends the wave with enemies still alive; voting no keeps it running',()=>{
  const b=new WaveManager({mode:'beginner',path:WAYPOINTS,loadout:['prism-sentry'],waveDurationSeconds:2});b.start();b.update(1/60);
  b.elapsedWave=b.skipAtSeconds;assert(b.voteSkip(false)&&b.state==='WAVE_ACTIVE'&&!b.voteSkip(true));
  for(let i=0;i<130&&b.state==='WAVE_ACTIVE';i++)b.update(1/60);
  assert(b.state==='INTERMISSION'&&b.lastWaveEnd.reason==='timer'&&b.enemies.length>0);
});
test('Skip timing policies and boss wave rules are data driven',()=>{
  assert(new WaveManager({mode:'easy',waveDurationSeconds:180}).skipAtSeconds===60);
  assert(new WaveManager({mode:'hardcore'}).skipAtSeconds===20);
  assert(new WaveManager({mode:'easy',skipPolicy:'never'}).skipAtSeconds===Infinity);
  const boss=new WaveManager({mode:'easy'});boss.wave=boss.totalWaves;boss.start();
  assert(boss.bossWave&&boss.waveDurationSeconds===Infinity&&boss.skipAtSeconds===Infinity&&!boss.skipWave());
});
test('Clear bonus pays once after every spawned enemy dies and scales by players',()=>{
  assert(waveBonus(1)===32&&waveClearBonus(1,'easy',1)===8&&waveClearBonus(1,'easy',4)===3);
  assert(waveClearBonus(1,'hardcore',1)===0&&waveClearBonus(1,'voidcore',1)===0);
  const b=new WaveManager({mode:'beginner',path:WAYPOINTS,loadout:['prism-sentry']});b.start();b.update(1/60);
  const old=b.enemies[0];b.endWave('timer');const base=b.cash;
  b.resolve(old,false);assert(b.cash===base+5+waveClearBonus(1,'beginner',1));
  b.resolve(old,false);assert(b.cash===base+5+waveClearBonus(1,'beginner',1));
  const breached=new WaveManager({mode:'beginner',path:WAYPOINTS,loadout:['prism-sentry']});breached.start();breached.update(1/60);const contact=breached.enemies[0];breached.endWave('timer');breached.resolve(contact,true);assert(breached.lastClearBonus===null);
});
test('Breach removes remaining enemy health from the 100 HP base',()=>{
  const b=new WaveManager(),enemy=createEnemy(1);enemy.health=7.4;
  b.resolve(enemy,true);assert(b.health===92&&b.arrived===1);
  b.resolve(enemy,true);assert(b.health===92&&b.arrived===1);
});
test('One inner-bend sentry damages, visibly signals shots, kills all ten and wins',()=>{
  const b=new WaveManager();
  assert(b.place(-13,0).ok);
  b.start();
  let hurt=false,shot=false;
  for(let i=0;i<7200&&b.state==='WAVE_ACTIVE';i++){
    b.update(1/60);
    hurt ||= b.enemies.some(e=>e.health===5);
    shot ||= b.towers[0].beamRemaining>0;
  }
  assert(hurt&&shot);
  assert(b.state==='WON'&&b.killed===10&&b.arrived===0&&b.health===100&&b.remaining===0&&b.spawned===10);
});
test('Undefended run loses with exactly ten base hits, no double resolution',()=>{
  const b=new WaveManager();
  b.start();
  finish(b);
  assert(b.state==='LOST'&&b.health===0&&b.arrived===10&&b.killed===0&&b.spawned===10&&b.remaining===0);
  const frozen=JSON.stringify(b);
  for(let i=0;i<60;i++)b.update(1);
  assert(JSON.stringify(b)===frozen);
  assert(!b.place(-3,0).ok&&!b.start());
});
test('Win is terminal and cannot occur before all ten spawns',()=>{
  const b=new WaveManager();
  b.place(-13,0);
  b.start();
  for(let i=0;i<300;i++)b.update(1/60);
  assert(b.state==='WAVE_ACTIVE'&&b.spawned<10);
  finish(b);
  const frozen=JSON.stringify(b);
  b.update(100);
  assert(JSON.stringify(b)===frozen);
  assert(!b.place(4,0).ok);
});
test('Three consecutive restart cycles restore every battle resource',()=>{
  const b=new WaveManager();
  for(let cycle=0;cycle<3;cycle++){
    if(cycle%2===0)b.place(-13,0);
    b.start();
    finish(b);
    assert(b.restart());
    assert(b.state==='PREP'&&b.cash===200&&b.health===100&&b.remaining===10&&b.spawned===0&&b.killed===0&&b.arrived===0&&b.towers.length===0&&b.enemies.length===0&&b.elapsed===0);
  }
});
test('Game suspension resets accumulated time and frame timestamp',()=>{
  const g=new Game(null,null,null);
  g.last=42;
  g.accumulator=.09;
  g.onVisibility();
  assert(g.last===null&&g.accumulator===0);
  assert(TIMING.maxFrameSeconds===.1&&TIMING.stepSeconds===1/60&&TIMING.maxPixelRatio===2);
});
for(const c of checks){
  const li=document.createElement('li');
  li.textContent=(c.pass?'PASS — ':'FAIL — ')+c.name+(c.error?' / '+c.error:'');
  li.style.color=c.pass?'#b9e8bf':'#ffb7a2';
  document.querySelector('#results').append(li);
}
document.querySelector('#summary').textContent=checks.filter(c=>c.pass).length+' / '+checks.length+' checks passed';
