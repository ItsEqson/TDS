import { WAYPOINTS, SEGMENTS, PATH_LENGTH } from '../data/arena.js';
import { ENEMY } from '../data/enemies.js';
export function createEnemy(id,path=WAYPOINTS,stats={}){
  return {
    id,x:path[0].x,z:path[0].z,previousX:path[0].x,previousZ:path[0].z,progress:0,segment:0,segmentProgress:0,health:stats.health||ENEMY.health,maxHealth:stats.health||ENEMY.health,speed:stats.speed||ENEMY.speedUnitsPerSecond,boss:!!stats.boss,resolved:false
  };
}
export function moveEnemy(e,dt,segments=SEGMENTS,pathLength=PATH_LENGTH){
  if(e.resolved)return false;
  e.previousX=e.x;
  e.previousZ=e.z;
  let travel=(e.speed||ENEMY.speedUnitsPerSecond)*dt;
  while(travel>0&&e.segment<segments.length){
    const s=segments[e.segment];
    const step=Math.min(travel,s.length-e.segmentProgress);
    e.segmentProgress+=step;
    e.progress+=step;
    travel-=step;
    const f=e.segmentProgress/s.length;
    e.x=s.start.x+(s.end.x-s.start.x)*f;
    e.z=s.start.z+(s.end.z-s.start.z)*f;
    if(e.segmentProgress>=s.length-1e-9){
      e.segment++;
      e.segmentProgress=0;
    }
  }
  return e.progress>=pathLength-1e-9;
}
export function resolveEnemy(e){
  if(e.resolved)return false;
  e.resolved=true;
  return true;
}
