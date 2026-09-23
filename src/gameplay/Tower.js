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
  if(t.cooldown>1e-9)return null;
  const target=selectTarget(t,enemies,definition.range);
  if(!target)return null;
  t.cooldown=definition.intervalSeconds;
  t.beamRemaining=TOWER.beamSeconds;
  t.targetX=target.x;
  t.targetZ=target.z;
  t.shotId++;
  target.health=Math.max(0,target.health-definition.damage);
  return target;
}
