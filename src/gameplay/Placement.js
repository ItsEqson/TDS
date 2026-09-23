import { ARENA, SEGMENTS } from '../data/arena.js';
import { TOWER } from '../data/towers.js';
export function distanceToSegmentSquared(x,z,s){
  const dx=s.end.x-s.start.x,dz=s.end.z-s.start.z;
  const t=Math.max(0,Math.min(1,((x-s.start.x)*dx+(z-s.start.z)*dz)/(s.length*s.length)));
  return (x-s.start.x-t*dx)**2+(z-s.start.z-t*dz)**2;
}
export function placementReason(x,z,towers,cash,definition=TOWER,segments=SEGMENTS){
  if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>ARENA.width/2-TOWER.radius||Math.abs(z)>ARENA.depth/2-TOWER.radius)return 'Outside arena';
  for(const s of segments)if(distanceToSegmentSquared(x,z,s)<=(ARENA.roadWidth/2+TOWER.radius)**2)return 'Keep clear of the road';
  for(const t of towers)if((x-t.x)**2+(z-t.z)**2<(TOWER.radius*2)**2)return 'Too close to another tower';
  if(cash<definition.cost)return 'Not enough cash';
  return '';
}
