import { SPECIALIST as S } from '../data/specialists.js';
import { createEnemy,moveEnemy } from './Enemy.js';
import { WAVE } from '../data/waves.js';
// Fixed-step support, status effects and friendly runners belong to battle data.
export function updateSpecialists(b,dt){
  for(const e of b.enemies){
    if(e.dotRemaining>0){e.health=Math.max(0,e.health-e.dotDamage*Math.min(dt,e.dotRemaining));e.dotRemaining=Math.max(0,e.dotRemaining-dt);if(e.health<=0)b.resolve(e,false);}
    e.slowRemaining=Math.max(0,(e.slowRemaining||0)-dt);
  }
  for(const t of b.towers){
    t.attackBoost=1;
    for(const other of b.towers)if(other!==t&&other.definition.kit==='support'&&Math.hypot(t.x-other.x,t.z-other.z)<=other.definition.range){t.attackBoost=S.attackBoost;break;}
    if(!['heal','economy','summon'].includes(t.definition.kit))continue;
    t.utilityClock=(t.utilityClock||0)+dt;
    if(t.utilityClock<t.definition.intervalSeconds)continue;
    t.utilityClock-=t.definition.intervalSeconds;
    if(t.definition.kit==='economy')b.cash+=S.incomeCash;
    if(t.definition.kit==='heal')b.health=Math.min(WAVE.baseHealth,b.health+S.healHealth);
    if(t.definition.kit==='summon'&&b.allies.length<S.maxAllies){const ally=createEnemy(++b.nextAllyId,b.path,{health:S.allyDamage,speed:S.allySpeed});ally.towerId=t.definition.id;b.allies.push(ally);}
  }
  for(let i=b.allies.length-1;i>=0;i--){const a=b.allies[i];let done=moveEnemy(a,dt,b.segments,b.pathLength);for(const e of b.enemies)if(!e.resolved&&Math.hypot(a.x-e.x,a.z-e.z)<S.allyContactRadius){e.health=Math.max(0,e.health-S.allyDamage);if(e.health<=0)b.resolve(e,false);done=true;break;}if(done)b.allies.splice(i,1);}
}
