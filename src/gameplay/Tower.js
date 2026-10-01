import { SPECIALIST as S } from '../data/specialists.js';
import { TOWER } from '../data/towers.js';
import { selectTarget } from './Targeting.js';
export function createTower(id,x,z,definition=TOWER){
  return {
    id,x,z,definition,level:0,invested:definition.cost,damageDone:0,cooldown:0,shotId:0,beamRemaining:0,targetX:x,targetZ:z,chainHits:new Set()
  };
}
export const MAX_TOWER_LEVEL=5;
export const TOWER_SPECIAL=Object.freeze({pistol:'Every fourth shot hits harder',rifle:'Extra damage against bosses',rapid:'Rapid burst bonus',splash:'Damages every enemy near the impact',chain:'Hops between nearby enemies',pierce:'Strikes enemies in a narrow line',spread:'Scatters damage through a short cone',slow:'Slows ordinary enemies',freeze:'Freezes ordinary enemies',burn:'Burns enemies over time',poison:'Poisons enemies over time',bleed:'Causes bleeding damage',beam:'Repeated hits build beam power',melee:'Close-range boss damage; slows at level 2',bounty:'Earns cash on hit',support:'Boosts nearby attack speed',heal:'Restores base health',economy:'Generates battle cash',summon:'Sends friendly reinforcements'});
export function towerStats(t){
  const factor=1+t.level*.32;
  return {damage:Math.round(t.definition.damage*factor*10)/10,range:Math.round((t.definition.range+t.level*.35)*10)/10,intervalSeconds:Math.max(.12,Math.round(t.definition.intervalSeconds*(1-t.level*.07)*100)/100)};
}
export function upgradeCost(t){return t.level<MAX_TOWER_LEVEL?Math.round(t.definition.cost*(.55+t.level*.4)):null;}
export function updateTower(t,enemies,dt){
  const definition=t.definition||TOWER;
  const stats=towerStats(t);
  t.beamRemaining=Math.max(0,t.beamRemaining-dt);
  t.cooldown=Math.max(0,t.cooldown-dt);
  if(t.cooldown>1e-9||['support','heal','economy','summon'].includes(definition.kit))return null;
  const target=selectTarget(t,enemies,stats.range);
  if(!target)return null;
  t.cooldown=stats.intervalSeconds/(t.attackBoost||1);
  t.beamRemaining=TOWER.beamSeconds;
  t.targetX=target.x;
  t.targetZ=target.z;
  t.shotId++;
  if(definition.kit==='beam'){t.beamStacks=t.lastTargetId===target.id?Math.min(4,(t.beamStacks||0)+1):0;t.lastTargetId=target.id;}
  const hit=e=>{const before=e.health,bonus=definition.kit==='rifle'&&e.boss?1.35:definition.kit==='rapid'?1.2:definition.kit==='pistol'&&t.shotId%4===0?1.5:definition.kit==='beam'?1+(t.beamStacks||0)*.12:definition.kit==='melee'&&e.boss?1.2:1;e.health=Math.max(0,e.health-stats.damage*bonus);t.damageDone+=before-e.health;if((['slow','freeze'].includes(definition.kit)||definition.kit==='melee'&&t.level>=2)&&!e.boss){e.slowRemaining=S.slowSeconds;e.slowFactor=definition.kit==='freeze'?0:S.slowFactor;}if(['burn','poison','bleed'].includes(definition.kit)){e.dotRemaining=S.dotSeconds;e.dotDamage=S.dotDamagePerSecond*(1+t.level*.25);e.dotSource=t;}};
  hit(target);
  const eligible=e=>e!==target&&!e.resolved&&e.health>0;
  if(definition.kit==='splash'){
    for(const e of enemies)if(eligible(e)&&Math.hypot(e.x-target.x,e.z-target.z)<=S.splashRadius)hit(e);
  }else if(definition.kit==='chain'){
    let current=target;
    const struck=t.chainHits;struck.clear();struck.add(target);
    for(let n=1;n<S.chainTargets;n++){
      let next=null,best=S.splashRadius*S.splashRadius;
      for(const e of enemies){const d=(e.x-current.x)**2+(e.z-current.z)**2;if(!e.resolved&&e.health>0&&!struck.has(e)&&d<=best){next=e;best=d;}}
      if(!next)break;hit(next);struck.add(next);current=next;
    }
  }else if(definition.kit==='pierce'||definition.kit==='spread'){
    const dx=target.x-t.x,dz=target.z-t.z,length=Math.hypot(dx,dz)||1,ux=dx/length,uz=dz/length;
    let count=1;
    for(const e of enemies){
      if(!eligible(e))continue;
      const ex=e.x-t.x,ez=e.z-t.z,along=ex*ux+ez*uz,side=Math.abs(ex*uz-ez*ux);
      const inPath=definition.kit==='pierce'?along>0&&along<=stats.range&&side<=S.pierceWidth:along>0&&along<=stats.range&&side<=along*Math.tan(S.spreadHalfAngleRadians);
      if(inPath){hit(e);if(++count>=S.chainTargets)break;}
    }
  }
  return target;
}
