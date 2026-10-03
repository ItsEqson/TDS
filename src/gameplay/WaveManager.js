import { SPECIALIST as S } from '../data/specialists.js';
import { STATES, isTerminal, canTransition } from '../core/State.js';
import { WAVE } from '../data/waves.js';
import { updateSpecialists } from './specialists.js';
import { TOWERS } from '../data/towers.js';
import { activeTower } from '../data/progression.js';
import { OPERATION,MODES,FINAL_BOSSES } from '../data/headquarters.js';
import { WAYPOINTS } from '../data/arena.js';
import { ENEMY,campaignEnemy } from '../data/enemies.js';
import { MODE_CAMPAIGNS } from '../data/modeCampaigns.js';
import { placementReason } from './Placement.js';
import { createEnemy, moveEnemy, resolveEnemy } from './Enemy.js';
import { createTower, updateTower,upgradeCost } from './Tower.js';
// Sole owner of all mutable battle data. No DOM or rendering imports.
export class WaveManager {
  constructor(mission=null){
    this.mission=mission;
    this.mode=MODES.find(m=>m.id===mission?.mode);
    this.campaign=MODE_CAMPAIGNS[mission?.mode]||null;
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
    this.nextEnemyId=0;
    this.killed=0;
    this.arrived=0;
    this.elapsed=0;
    this.nextSpawn=0;
    this.spawnPlan=this.campaign?.waves[0]?.flatMap(([name,count])=>Array(count).fill(name))||null;
    this.count=this.spawnPlan?.length||(this.mission?OPERATION.count:WAVE.count);
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
    this.spawnPlan=this.campaign?.waves[this.wave-1]?.flatMap(([name,count])=>Array(count).fill(name))||null;
    this.count=this.spawnPlan?.length||(this.mission?OPERATION.count+Math.min(this.wave-1,8)*2:WAVE.count);
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
  spawnCampaignEnemy(name,parent=null){
    const definition=campaignEnemy(this.mission.mode,name);
    if(!definition)return null;
    const enemy=createEnemy(++this.nextEnemyId,this.path,{...definition,speed:definition.speedUnitsPerSecond,boss:name===FINAL_BOSSES[this.mission.mode]||name==='Void Caster'});
    if(parent){enemy.x=enemy.previousX=parent.x;enemy.z=enemy.previousZ=parent.z;enemy.progress=parent.progress;enemy.segment=parent.segment;enemy.segmentProgress=parent.segmentProgress;}
    this.enemies.push(enemy);
    return enemy;
  }
  place(x,z,towerId='prism-sentry'){
    const definition=activeTower(towerId,this.mission?.forms);
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
    else {
      this.killed++;if(this.mission)this.cash+=e.boss?OPERATION.bossCash:OPERATION.killCash;
      for(const name of e.splitInto||[])this.spawnCampaignEnemy(name,e);
    }
  }
  update(dt){
    if(this.state!==STATES.WAVE_ACTIVE)return;
    while(this.spawned<this.count&&this.elapsedWave+1e-9>=this.nextSpawn){
      const name=this.spawnPlan?.[this.spawned];
      const definition=name?campaignEnemy(this.mission.mode,name):null;
      const boss=definition?name===FINAL_BOSSES[this.mission.mode]:!!this.mission&&this.wave===this.totalWaves&&this.spawned===this.count-1;
      const multiplier=['challenge','hardcore','voidcore'].includes(this.mission?.mode)?OPERATION.challengeSpeed:1;
      const waveScale=(1+(this.wave-1)*.15)*(this.mode?.healthScale||1);
      this.spawned++;
      if(definition){
        this.spawnCampaignEnemy(name);
        if(this.mission.mode==='voidcore'&&name==='Void Reaver')this.spawnCampaignEnemy('Void Caster');
      }else this.enemies.push(createEnemy(++this.nextEnemyId,this.path,this.mission?{health:Math.ceil((boss?OPERATION.bossHealth:ENEMY.health)*waveScale),speed:(boss?OPERATION.bossSpeed:ENEMY.speedUnitsPerSecond)*multiplier*(1+(this.wave-1)*.025),boss}:{}));
      this.nextSpawn+=WAVE.spawnIntervalSeconds;
    }
    this.elapsed+=dt;
    this.elapsedWave+=dt;
    updateSpecialists(this,dt);
    for(const e of this.enemies){
      if(e.resolved)continue;
      if(e.summons&&e.abilitiesUsed<4){e.abilityTimer-=dt;if(e.abilityTimer<=0){this.spawnCampaignEnemy(e.summons,e);e.abilityTimer=6;e.abilitiesUsed++;}}
      if(e.stuns){e.abilityTimer-=dt;if(e.abilityTimer<=0){for(const t of this.towers)if((t.x-e.x)**2+(t.z-e.z)**2<49)t.stunRemaining=2;e.abilityTimer=8;}}
      if(e.heals){for(const ally of this.enemies)if(ally!==e&&!ally.resolved&&(ally.x-e.x)**2+(ally.z-e.z)**2<25)ally.health=Math.min(ally.maxHealth,ally.health+dt*6);}
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
      if(this.wave<this.totalWaves){this.cash+=20+this.wave*12;this.wave++;this.state=STATES.PREP;this.spawned=0;this.spawnPlan=this.campaign?.waves[this.wave-1]?.flatMap(([name,count])=>Array(count).fill(name))||null;this.count=this.spawnPlan?.length||(this.mission?OPERATION.count+Math.min(this.wave-1,8)*2:WAVE.count);}
      else this.transition(STATES.WON);
    }
  }
}
