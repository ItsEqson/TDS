export function selectTarget(tower,enemies,range){
  let target=null;
  for(const e of enemies){
    if(e.resolved||e.health<=0||!canHit(tower,e))continue;
    if((e.x-tower.x)**2+(e.z-tower.z)**2>range*range)continue;
    if(!target||e.progress>target.progress)target=e;
  }
  return target;
}

export function canHit(tower,enemy){
  const kit=tower.definition?.kit;
  if(enemy.hidden&&tower.level<3&&!['rifle','beam','chain'].includes(kit))return false;
  if(enemy.flying&&tower.level<3&&!['rifle','rapid','beam','chain'].includes(kit))return false;
  if(enemy.leadProtection>0&&tower.level<4&&!['splash','pierce','melee','beam','burn'].includes(kit))return false;
  return true;
}
