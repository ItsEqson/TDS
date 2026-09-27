import { SPECIALIST as S } from '../data/specialists.js';
import { STATES, isTerminal, canTransition } from '../core/State.js';
import { WAVE } from '../data/waves.js';
import { updateSpecialists } from './specialists.js';
import { TOWERS } from '../data/towers.js';
import { OPERATION,MODES } from '../data/headquarters.js';
import { WAYPOINTS } from '../data/arena.js';
import { ENEMY } from '../data/enemies.js';
import { placementReason } from './Placement.js';
import { createEnemy, moveEnemy, resolveEnemy } from './Enemy.js';
import { createTower, updateTower,upgradeCost } from './Tower.js';
// Sole owner of all mutable battle data. No DOM or rendering imports.
export class WaveManager {
  constructor(mission=null){
    this.mission=mission;
    this.mode=MODES.find(m=>m.id===mission?.mode);
    this.totalWaves=this.mode?.waves||1;
    this.path=mission?.path||WAYPOINTS;
    this.segments=this.path.slice(1).map((end,i)=>({start:this.path[i],end,length:Math.hypot(end.x-this.path[i].x,end.z-this.path[i].z)}));
    this.pathLength=this.segments.reduce((n,s)=>n+s.length,0);
    this.count=mission?OPERATION.count:WAVE.count;
    this.reset();
  }
  reset(){
    this.state=STATES.PREP;
    this.wave=1;
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
    if(!this.transition(STATES.WAVE_ACTIVE))return false;
    this.spawned=0;this.nextSpawn=0;this.elapsedWave=0;
    this.count=this.mission?OPERATION.count+Math.min(this.wave-1,8)*2:WAVE.count;
    return true;
  }
  upgrade(id){
    const tower=this.towers.find(t=>t.id===id),cost=tower&&upgradeCost(tower);
    if(!tower||isTerminal(this.state)||cost===null||this.cash<cost)return false;
    this.cash-=cost;tower.invested+=cost;tower.level++;return true;
  }
  sell(id){
    const index=this.towers.findIndex(t=>t.id===id);
    if(index<0||isTerminal(this.state))return null;
    const [tower]=this.towers.splice(index,1),refund=Math.floor(tower.invested*.6);
    this.cash+=refund;return refund;
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
    while(this.spawned<this.count&&this.elapsedWave+1e-9>=this.nextSpawn){
      const boss=!!this.mission&&this.wave===this.totalWaves&&this.spawned===this.count-1;
      const multiplier=['challenge','hardcore','voidcore'].includes(this.mission?.mode)?OPERATION.challengeSpeed:1;
      const waveScale=(1+(this.wave-1)*.15)*(this.mode?.healthScale||1);
      this.enemies.push(createEnemy(++this.spawned,this.path,this.mission?{health:Math.ceil((boss?OPERATION.bossHealth:ENEMY.health)*waveScale),speed:(boss?OPERATION.bossSpeed:ENEMY.speedUnitsPerSecond)*multiplier*(1+(this.wave-1)*.025),boss}:{}));
      this.nextSpawn+=WAVE.spawnIntervalSeconds;
    }
    this.elapsed+=dt;
    this.elapsedWave+=dt;
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
    if(this.state===STATES.WAVE_ACTIVE&&this.spawned===this.count&&this.enemies.length===0&&this.health>0){
      if(this.wave<this.totalWaves){this.cash+=20+this.wave*12;this.wave++;this.state=STATES.PREP;}
      else this.transition(STATES.WON);
    }
  }
}
