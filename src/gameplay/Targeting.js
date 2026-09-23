export function selectTarget(tower,enemies,range){
  let target=null;
  for(const e of enemies){
    if(e.resolved||e.health<=0)continue;
    if((e.x-tower.x)**2+(e.z-tower.z)**2>range*range)continue;
    if(!target||e.progress>target.progress)target=e;
  }
  return target;
}
