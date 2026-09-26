import { SPECIALIST as S } from '../data/specialists.js';
import { STATES, isTerminal, canTransition } from '../core/State.js';
import { WAVE } from '../data/waves.js';
import { updateSpecialists } from './specialists.js';
import { TOWERS } from '../data/towers.js';
import { OPERATION } from '../data/headquarters.js';
import { WAYPOINTS } from '../data/arena.js';
import { ENEMY } from '../data/enemies.js';
import { placementReason } from './Placement.js';
import { createEnemy, moveEnemy, resolveEnemy } from './Enemy.js';
import { createTower, updateTower } from './Tower.js';
// Sole owner of all mutable battle data. No DOM or rendering imports.
export class WaveManager {
  constructor(mission=null){
    this.mission=mission;
    this.path=mission?.path||WAYPOINTS;
    this.segments=this.path.slice(1).map((end,i)=>({start:this.path[i],end,length:Math.hypot(end.x-this.path[i].x,end.z-this.path[i].z)}));
    this.pathLength=this.segments.reduce((n,s)=>n+s.length,0);
    this.count=mission?OPERATION.count:WAVE.count;
    this.reset();
  }
  reset(){
    this.state=STATES.PREP;
    this.cash=WAVE.startingCash;
    this.health=WAVE.baseHealth;
    this.spawned=0;
    this.killed=0;
    this.arrived=0;
    this.elapsed=0;
    this.nextSpawn=0;
    this.enemies=[];
    this.towers=[];this.allies=[];this.nextAllyId=0;
  }
  transition(next){
    if(!canTransition(this.state,next))return false;
    this.state=next;
    return true;
  }
  start(){
    return this.transition(STATES.WAVE_ACTIVE);
  }
  restart(){
    if(!isTerminal(this.state))return false;
    this.reset();
    return true;
  }
  get remaining(){
    return this.count-this.spawned+this.enemies.length;
  }
  place(x,z,towerId='prism-sentry'){
    const definition=TOWERS[towerId];
    if(!definition||(this.mission&&!this.mission.loadout.includes(towerId)))return {ok:false,reason:'Tower not equipped'};
    if(isTerminal(this.state))return {
      ok:false,reason:'Battle has ended'
    };
    const reason=placementReason(x,z,this.towers,this.cash,definition,this.segments);
    if(reason)return {
      ok:false,reason
    };
    const tower=createTower(this.towers.length+1,x,z,definition);
    this.towers.push(tower);
    this.cash-=definition.cost;
    return {
      ok:true,tower
    };
  }
  resolve(e,arrival){
    if(!resolveEnemy(e))return;
    if(arrival){
      this.arrived++;
      this.health=Math.max(0,this.health-(e.boss?OPERATION.bossDamage:ENEMY.baseDamage));
      if(this.health===0)this.transition(STATES.LOST);
    }
    else {this.killed++;if(this.mission)this.cash+=e.boss?OPERATION.bossCash:OPERATION.killCash;}
  }
  update(dt){
    if(this.state!==STATES.WAVE_ACTIVE)return;
    while(this.spawned<this.count&&this.elapsed+1e-9>=this.nextSpawn){
      const boss=!!this.mission&&this.spawned===this.count-1;
      const multiplier=['challenge','hardcore','voidcore'].includes(this.mission?.mode)?OPERATION.challengeSpeed:1;
      this.enemies.push(createEnemy(++this.spawned,this.path,this.mission?{health:(boss?OPERATION.bossHealth:ENEMY.health)*(['hardcore','voidcore'].includes(this.mission?.mode)?S.voidHealthMultiplier:1),speed:(boss?OPERATION.bossSpeed:ENEMY.speedUnitsPerSecond)*multiplier,boss}:{}));
      this.nextSpawn+=WAVE.spawnIntervalSeconds;
    }
    this.elapsed+=dt;
    updateSpecialists(this,dt);
    for(const e of this.enemies){
      if(e.resolved)continue;
      if(moveEnemy(e,dt,this.segments,this.pathLength))this.resolve(e,true);
      if(isTerminal(this.state))break;
    }
    if(!isTerminal(this.state))for(const t of this.towers){
      const target=updateTower(t,this.enemies,dt);
      if(target&&t.definition.kit==='bounty')this.cash+=S.bountyCash;
      for(const e of this.enemies)if(!e.resolved&&e.health<=0)this.resolve(e,false);
    }
    for(let i=this.enemies.length-1;i>=0;i--)if(this.enemies[i].resolved)this.enemies.splice(i,1);
    if(this.state===STATES.WAVE_ACTIVE&&this.spawned===this.count&&this.enemies.length===0&&this.health>0)this.transition(STATES.WON);
  }
}
