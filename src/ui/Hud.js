import { TOWER,TOWERS } from '../data/towers.js';
import { portrait } from './art.js';
import { WAVE } from '../data/waves.js';
import { towerStats,upgradeCost,TOWER_SPECIAL } from '../gameplay/Tower.js';
import { FINAL_BOSSES } from '../data/headquarters.js';
import * as THREE from 'three';
export class Hud {
  constructor(scene){
    this.scene=scene;
    this.nodes={
    };
    for(const id of ['cash','health','remaining','state','place','start','restart','outcome','hint'])this.nodes[id]=document.getElementById(id);
    this.nodes.place.querySelector('small').textContent=TOWER.cost+' cash · '+TOWER.damage+' damage · '+TOWER.range+' range';
    document.querySelector('header h1').textContent=scene.mission?.mapData?.name||'Copper Reach';
    this.root=document.querySelector('footer');
    this.onAction=this.onAction.bind(this);
    this.root.addEventListener('click',this.onAction);
    const tray=document.querySelector('#battle-loadout');
    if(tray){tray.innerHTML=scene.mission?scene.mission.loadout.map((id,i)=>`<button data-tower="${id||''}" ${!id?'disabled':''}>${portrait(id)}${i+1} · ${id?TOWERS[id].name:'Empty'}<small>${id?TOWERS[id].cost+' cash':''}</small></button>`).join(''):'';}
    this.panel=document.querySelector('#tower-panel');
    this.panel.innerHTML='<strong id="selected-name"></strong><span id="selected-level"></span><span id="selected-stats"></span><span id="selected-special"></span><button data-action="upgrade" id="tower-upgrade"></button><button data-action="sell" id="tower-sell"></button>';
    this.panelName=this.panel.querySelector('#selected-name');this.panelLevel=this.panel.querySelector('#selected-level');this.panelStats=this.panel.querySelector('#selected-stats');this.panelSpecial=this.panel.querySelector('#selected-special');this.upgradeButton=this.panel.querySelector('#tower-upgrade');this.sellButton=this.panel.querySelector('#tower-sell');
    this.projected=new THREE.Vector3();this.enemyTip=document.createElement('div');this.enemyTip.id='enemy-tip';this.enemyTip.hidden=true;this.enemyTip.innerHTML='<strong></strong><span></span><div><i></i></div>';document.querySelector('#viewport').append(this.enemyTip);
    const back=document.querySelector('#return-hq');if(back)back.hidden=!scene.app;
  }
  onAction(e){
    const selected=e.target.closest('#tower-panel [data-action]');if(selected){this.scene[selected.dataset.action]();this.scene.canvas.focus();return;}
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
    this.set('state',`Wave ${b.wave}/${b.totalWaves} · ${b.state}`);
    this.nodes.start.disabled=b.state!=='PREP'||s.intro>0;
    this.nodes.start.hidden=s.terminal;
    this.nodes.restart.hidden=!s.terminal;
    this.nodes.place.disabled=s.terminal||s.intro>0;
    this.nodes.place.hidden=!!s.mission;
    const boss=b.enemies.find(e=>e.boss);const bossHud=document.querySelector('#boss-status');if(bossHud){bossHud.hidden=!boss;bossHud.textContent=boss?(FINAL_BOSSES[s.mission?.mode]||'Hollow Brute')+' · '+Math.ceil(boss.health)+' / '+boss.maxHealth:'';}
    this.nodes.place.setAttribute('aria-pressed',String(s.placing));
    this.panel.hidden=!s.selected||s.terminal;
    if(!this.panel.hidden){const t=s.selected,stats=towerStats(t),cost=upgradeCost(t),sell=Math.floor(t.invested*.6);this.panelName.textContent=t.definition.name;this.panelLevel.textContent=`Level ${t.level}/5 · ${t.definition.role}`;this.panelStats.textContent=`Damage ${stats.damage} · Range ${stats.range} m · Attack ${stats.intervalSeconds} s · Total dealt ${Math.floor(t.damageDone)}`;this.panelSpecial.textContent=TOWER_SPECIAL[t.definition.kit]||'';this.upgradeButton.disabled=cost===null||b.cash<cost;this.upgradeButton.classList.toggle('affordable',cost!==null&&b.cash>=cost);this.upgradeButton.textContent=cost===null?'Max level':b.cash>=cost?`Upgrade ready · ${cost} cash`:`Need ${cost-b.cash} more cash`;this.sellButton.textContent=`Sell · ${sell} cash`;}
    if(s.hoveredEnemy)this.showEnemy(s.hoveredEnemy);
    this.set('outcome',b.state==='WON'?'Route secured.':b.state==='LOST'?'Base breached.':'');
    this.set('hint',s.message);
  }
  showEnemy(enemy,x=this.enemyX,y=this.enemyY){
    this.enemyTip.hidden=!enemy;if(!enemy)return;
    if(Number.isFinite(x))this.enemyX=x;if(Number.isFinite(y))this.enemyY=y;
    const bounds=this.scene.canvas.getBoundingClientRect();this.enemyTip.style.left=Math.min(bounds.width-180,Math.max(8,this.enemyX-bounds.left+16))+'px';this.enemyTip.style.top=Math.max(8,this.enemyY-bounds.top-68)+'px';
    this.enemyTip.querySelector('strong').textContent=enemy.boss?'Boss contact':'Road contact';this.enemyTip.querySelector('span').textContent=`${Math.ceil(enemy.health)} / ${enemy.maxHealth} HP`;this.enemyTip.querySelector('i').style.width=100*enemy.health/enemy.maxHealth+'%';
  }
  positionTowerPanel(){
    if(this.panel.hidden)return;const s=this.scene,r=s.canvas.getBoundingClientRect();this.projected.set(s.selected.x,2.7,s.selected.z).project(s.camera);
    const behind=this.projected.z>1||this.projected.z< -1;this.panel.classList.toggle('offscreen',behind);
    if(behind)return;
    const width=Math.min(310,r.width-24),height=this.panel.offsetHeight||170;
    this.panel.style.left=Math.min(r.right-width-12,Math.max(r.left+12,r.left+(this.projected.x+1)*r.width/2+24))+'px';
    this.panel.style.top=Math.min(r.bottom-height-12,Math.max(r.top+12,r.top+(1-this.projected.y)*r.height/2-height/2))+'px';
  }
  dispose(){
    this.root.removeEventListener('click',this.onAction);
    this.enemyTip.remove();
  }
}
