import { TOWER,TOWERS } from '../data/towers.js';
import { WAVE } from '../data/waves.js';
export class Hud {
  constructor(scene){
    this.scene=scene;
    this.nodes={
    };
    for(const id of ['cash','health','remaining','state','place','start','restart','outcome','hint'])this.nodes[id]=document.getElementById(id);
    this.nodes.place.querySelector('small').textContent=TOWER.cost+' cash · '+TOWER.damage+' damage · '+TOWER.range+' range';
    this.root=document.querySelector('footer');
    this.onAction=this.onAction.bind(this);
    this.root.addEventListener('click',this.onAction);
    const tray=document.querySelector('#battle-loadout');
    if(tray){tray.innerHTML=scene.mission?scene.mission.loadout.map((id,i)=>`<button data-tower="${id||''}" ${!id?'disabled':''}>${i+1} · ${id?TOWERS[id].name:'Empty'}<small>${id?TOWERS[id].cost+' cash':''}</small></button>`).join(''):'';}
    const back=document.querySelector('#return-hq');if(back)back.hidden=!scene.app;
  }
  onAction(e){
    const tower=e.target.closest('[data-tower]');if(tower&&!tower.disabled){this.scene.chooseTower(tower.dataset.tower);this.scene.canvas.focus();return;}
    const button=e.target.closest('button[data-action]');
    if(!button||button.disabled)return;
    this.scene[button.dataset.action]();
    this.scene.canvas.focus({
      preventScroll:true
    });
  }
  set(id,text){
    if(this.nodes[id].textContent!==text)this.nodes[id].textContent=text;
  }
  update(){
    const s=this.scene,b=s.battle;
    this.set('cash',String(b.cash));
    this.set('health',b.health+' / '+WAVE.baseHealth);
    this.set('remaining',String(b.remaining));
    this.set('state',b.state);
    this.nodes.start.disabled=b.state!=='PREP'||s.intro>0;
    this.nodes.start.hidden=s.terminal;
    this.nodes.restart.hidden=!s.terminal;
    this.nodes.place.disabled=s.terminal||s.intro>0;
    this.nodes.place.hidden=!!s.mission;
    const boss=b.enemies.find(e=>e.boss);const bossHud=document.querySelector('#boss-status');if(bossHud){bossHud.hidden=!boss;bossHud.textContent=boss?'BASTION CARRIER · '+boss.health+' / '+boss.maxHealth:'';}
    this.nodes.place.setAttribute('aria-pressed',String(s.placing));
    this.set('outcome',b.state==='WON'?'Route secured.':b.state==='LOST'?'Base breached.':'');
    this.set('hint',s.message);
  }
  dispose(){
    this.root.removeEventListener('click',this.onAction);
  }
}
