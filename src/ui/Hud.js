import { TOWER,TOWERS } from '../data/towers.js';
import { activeTower } from '../data/progression.js';
import { portrait } from './art.js';
import { WAVE } from '../data/waves.js';
import { MODE_CAMPAIGNS } from '../data/modeCampaigns.js';
import { towerStats,upgradeCost,TOWER_SPECIAL } from '../gameplay/Tower.js';
import { canHit } from '../gameplay/Targeting.js';
export class Hud {
  constructor(scene){
    this.scene=scene;
    this.nodes={
    };
    for(const id of ['cash','health','remaining','state','place','start','skip','restart','outcome','hint'])this.nodes[id]=document.getElementById(id);
    this.nodes.place.querySelector('small').textContent=TOWER.cost+' cash · '+TOWER.damage+' damage · '+TOWER.range+' range';
    document.querySelector('header h1').textContent=scene.mission?.mapData?.name||'Copper Reach';
    this.root=document.querySelector('footer');
    this.onAction=this.onAction.bind(this);
    this.root.addEventListener('click',this.onAction);
    const tray=document.querySelector('#battle-loadout');
    if(tray){tray.innerHTML=scene.mission?scene.mission.loadout.map((id,i)=>{const form=id&&activeTower(id,scene.mission.forms);return `<button data-tower="${id||''}" ${!id?'disabled':''}>${portrait(form?.id||id)}${i+1} · ${form?.name||'Empty'}<small>${form?form.cost+' cash':''}</small></button>`;}).join(''):'';}
    this.panel=document.querySelector('#tower-panel');
    this.panel.innerHTML='<strong id="selected-name"></strong><span id="selected-level"></span><span id="selected-stats"></span><span id="selected-special"></span><button data-action="upgrade" id="tower-upgrade"></button><button data-action="sell" id="tower-sell"></button>';
    this.panelName=this.panel.querySelector('#selected-name');this.panelLevel=this.panel.querySelector('#selected-level');this.panelStats=this.panel.querySelector('#selected-stats');this.panelSpecial=this.panel.querySelector('#selected-special');this.upgradeButton=this.panel.querySelector('#tower-upgrade');this.sellButton=this.panel.querySelector('#tower-sell');
    this.viewButton=document.querySelector('#view-mode');
    this.enemyTip=document.createElement('div');this.enemyTip.id='enemy-tip';this.enemyTip.hidden=true;this.enemyTip.innerHTML='<strong></strong><span></span><div><i></i></div>';document.querySelector('#viewport').append(this.enemyTip);
    this.result=document.querySelector('#battle-result');this.result.hidden=true;
    this.resultAction=()=>scene.headquarters();this.result.querySelector('button').addEventListener('click',this.resultAction);
    this.quests=document.createElement('aside');this.quests.id='battle-quests';this.quests.setAttribute('aria-label','Quest progress');document.querySelector('#viewport').append(this.quests);
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
    this.viewButton.textContent=s.viewMode==='strategy'?'First person · V':'Overhead · V';
    this.set('cash',String(b.cash));
    this.set('health',b.health+' / '+WAVE.baseHealth);
    this.set('remaining',String(b.remaining));
    const groups=MODE_CAMPAIGNS[s.mission?.mode]?.waves[b.wave-1];
    const preview=b.state==='PREP'&&groups?' · Incoming: '+groups.slice(0,3).map(([name,count])=>`${count} ${name}`).join(', ')+(groups.length>3?` +${groups.length-3} groups`:''):'';
    this.set('state',`Wave ${b.wave}/${b.totalWaves} · ${b.state}${preview}`);
    this.nodes.start.disabled=b.state!=='PREP'||s.intro>0;
    this.nodes.start.hidden=s.terminal;
    this.nodes.skip.hidden=b.state!=='WAVE_ACTIVE';
    this.nodes.restart.hidden=!s.terminal;
    this.nodes.place.disabled=s.terminal||s.intro>0;
    this.nodes.place.hidden=!!s.mission;
    const boss=b.enemies.find(e=>e.boss);const bossHud=document.querySelector('#boss-status');if(bossHud){bossHud.hidden=!boss;bossHud.textContent=boss?boss.name+' · '+Math.ceil(boss.health)+' / '+boss.maxHealth:'';}
    this.nodes.place.setAttribute('aria-pressed',String(s.placing));
    this.panel.hidden=!s.selected||s.terminal;
    if(!this.panel.hidden){const t=s.selected,stats=towerStats(t),cost=upgradeCost(t),sell=Math.floor(t.invested*.6);this.panelName.textContent=t.definition.name;this.panelLevel.textContent=`Level ${t.level}/5 · ${t.definition.role}`;this.panelStats.textContent=`Damage ${stats.damage} · Range ${stats.range} m · Attack ${stats.intervalSeconds} s · Total dealt ${Math.floor(t.damageDone)}`;const detects=['Hidden','Flying','Lead'].filter(kind=>canHit(t,{hidden:kind==='Hidden',flying:kind==='Flying',leadProtection:kind==='Lead'?1:0}));this.panelSpecial.textContent=(TOWER_SPECIAL[t.definition.kit]||'')+` · Handles ${detects.join(', ')||'basic contacts'}`;this.upgradeButton.disabled=cost===null||b.cash<cost;this.upgradeButton.classList.toggle('affordable',cost!==null&&b.cash>=cost);this.upgradeButton.textContent=cost===null?'Max level':b.cash>=cost?`Upgrade ready · ${cost} cash`:`Need ${cost-b.cash} more cash`;this.sellButton.textContent=`Sell · ${sell} cash`;}
    if(s.hoveredEnemy)this.showEnemy(s.hoveredEnemy);
    this.set('outcome',b.state==='WON'?'Route secured.':b.state==='LOST'?'Base breached.':'');
    this.set('hint',s.message);
    const p=s.app?.store.data;
    if(p){
      this.quests.hidden=!p.showQuests||s.terminal;
      if(!this.quests.hidden){
        const missions=p.daily.missions+Number(b.wavesStarted>0), kills=p.daily.kills+b.killed,waves=p.daily.waves+b.wavesStarted;
        const title={wins:'Victories',kills:'Selected defeats',waves:'Selected waves'}[p.selectedQuest];
        const selected=p.selectedQuest?`<p>${title}: ${Math.min({wins:1,kills:100,waves:10}[p.selectedQuest],p.selectedProgress+(p.selectedQuest==='wins'?0:p.selectedQuest==='kills'?b.killed:b.wavesStarted))} / ${{wins:1,kills:100,waves:10}[p.selectedQuest]}</p>`:'';
        const markup=`<strong>Quests</strong><p>Daily: ${Number(missions>=1)+Number(kills>=25)+Number(waves>=3)} / 3</p><small>Deploy ${Math.min(1,missions)}/1 · Defeat ${Math.min(25,kills)}/25 · Waves ${Math.min(3,waves)}/3</small>${selected}`;
        if(this.quests.innerHTML!==markup)this.quests.innerHTML=markup;
      }
    }
  }
  showEnemy(enemy,x=this.enemyX,y=this.enemyY){
    this.enemyTip.hidden=!enemy;if(!enemy)return;
    if(Number.isFinite(x))this.enemyX=x;if(Number.isFinite(y))this.enemyY=y;
    const bounds=this.scene.canvas.getBoundingClientRect();this.enemyTip.style.left=Math.min(bounds.width-180,Math.max(8,this.enemyX-bounds.left+16))+'px';this.enemyTip.style.top=Math.max(8,this.enemyY-bounds.top-68)+'px';
    this.enemyTip.querySelector('strong').textContent=enemy.name;this.enemyTip.querySelector('span').textContent=`${Math.ceil(enemy.health)} / ${enemy.maxHealth} HP${enemy.hidden?' · Hidden':''}${enemy.flying?' · Flying':''}${enemy.leadProtection>0?' · Lead':''}`;this.enemyTip.querySelector('i').style.width=100*enemy.health/enemy.maxHealth+'%';
  }
  positionTowerPanel(){}
  showResult(result){
    const minutes=Math.floor(result.elapsed/60),seconds=Math.floor(result.elapsed%60);
    this.result.querySelector('h2').textContent=result.won?'Victory':'Defeat';
    this.result.querySelector('[data-result=progress]').textContent=`Wave ${result.wave} / ${result.total}`;
    this.result.querySelector('[data-result=time]').textContent=`${minutes}:${String(seconds).padStart(2,'0')}`;
    this.result.querySelector('[data-result=rewards]').innerHTML=`<span><img src="assets/icons/coins.svg" alt="Coins"> +${result.coins}</span><span><img src="assets/icons/shards.svg" alt="Gems"> +${result.gems}</span><span>+${result.xp} XP</span>`;
    this.result.hidden=false;this.result.querySelector('button').focus();
  }
  dispose(){
    this.root.removeEventListener('click',this.onAction);
    this.enemyTip.remove();
    this.quests.remove();
    this.result.querySelector('button').removeEventListener('click',this.resultAction);this.result.hidden=true;
  }
}
