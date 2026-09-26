import { SPECIALIST as S } from '../data/specialists.js';
import { TOWER } from '../data/towers.js';
import { selectTarget } from './Targeting.js';
export function createTower(id,x,z,definition=TOWER){
  return {
    id,x,z,definition,cooldown:0,shotId:0,beamRemaining:0,targetX:x,targetZ:z
  };
}
export function updateTower(t,enemies,dt){
  const definition=t.definition||TOWER;
  t.beamRemaining=Math.max(0,t.beamRemaining-dt);
  t.cooldown=Math.max(0,t.cooldown-dt);
  if(t.cooldown>1e-9||['support','heal','economy','summon'].includes(definition.kit))return null;
  const target=selectTarget(t,enemies,definition.range);
  if(!target)return null;
  t.cooldown=definition.intervalSeconds/(t.attackBoost||1);
  t.beamRemaining=TOWER.beamSeconds;
  t.targetX=target.x;
  t.targetZ=target.z;
  t.shotId++;
  const hit=e=>{e.health=Math.max(0,e.health-definition.damage);if(['slow','freeze'].includes(definition.kit)&&!e.boss){e.slowRemaining=S.slowSeconds;e.slowFactor=definition.kit==='freeze'?0:S.slowFactor;}if(['burn','poison','bleed'].includes(definition.kit)){e.dotRemaining=S.dotSeconds;e.dotDamage=S.dotDamagePerSecond;}};
  hit(target);
  if(['splash','chain','pierce','spread'].includes(definition.kit)){let count=1;for(const e of enemies){if(e===target||e.resolved||e.health<=0||Math.hypot(e.x-target.x,e.z-target.z)>S.splashRadius)continue;hit(e);if(++count>=S.chainTargets&&definition.kit!=='splash')break;}}
  return target;
}
