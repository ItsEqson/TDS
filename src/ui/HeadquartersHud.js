import * as THREE from 'three';
import { MAPS,MODES,SKINS,ECONOMY } from '../data/headquarters.js';
import { portrait,icon } from './art.js';
import { TOWERS } from '../data/towers.js';
import { VARIANTS,GOLDEN_FORMS,baseTower,towerForms,requiredTowerLevel } from '../data/progression.js';
import { TOWER_SPECIAL } from '../gameplay/Tower.js';
import { createTowerMesh,disposeObject,mesh,material } from '../rendering/createMeshes.js';
const button=(action,label,value='',disabled=false)=>`<button data-hq="${action}" data-value="${value}" ${disabled?'disabled':''}>${label}</button>`;
const card=(title,body)=>`<article class="hq-card"><h3>${title}</h3>${body}</article>`;
const currencyName=key=>({shards:'gems',towerXp:'tower XP',xp:'XP'}[key]||key);
const ROSTER_GROUPS=Object.freeze(['Starter','Intermediate','Advanced','Hardcore & Evolved','Exclusive / Event']);
const rosterGroup=t=>t.tier==='Hardcore'||t.tier==='Evolved'?'Hardcore & Evolved':['Event','Exclusive','Story'].includes(t.tier)?'Exclusive / Event':t.tier;
export class HeadquartersHud {
  constructor(app){
    this.app=app;this.root=document.querySelector('#headquarters');this.dialog=document.querySelector('#hq-dialog');this.content=document.querySelector('#panel-content');this.toast=document.querySelector('#toast');this.panel='';this.filter='All';this.sort='category';this.slot=0;this.tower='prism-sentry';this.clock=0;this.tutorialStep=0;this.wheelAngle=0;
    this.onClick=this.onClick.bind(this);this.onKey=this.onKey.bind(this);this.onCancel=this.onCancel.bind(this);this.onChange=this.onChange.bind(this);
    this.feedback=document.createElement('p');this.feedback.id='panel-feedback';this.feedback.hidden=true;this.feedback.setAttribute('role','status');this.content.before(this.feedback);
    this.root.addEventListener('click',this.onClick);this.dialog.addEventListener('click',this.onClick);this.dialog.addEventListener('cancel',this.onCancel);this.dialog.addEventListener('change',this.onChange);document.addEventListener('keydown',this.onKey);
    for(const b of this.root.querySelectorAll('.hq-nav [data-value]'))b.querySelector('span').outerHTML=icon(b.dataset.value);
    this.preview=new THREE.Scene();this.preview.background=new THREE.Color(0x182c3a);this.preview.add(new THREE.HemisphereLight(0xdffff4,0x243349,3));const light=new THREE.DirectionalLight(0xffd4a4,3);light.position.set(2,4,4);this.preview.add(light);this.camera=new THREE.PerspectiveCamera(38,1,.1,30);this.camera.position.set(3,2.8,4.5);this.camera.lookAt(0,1,0);
  }
  get p(){return this.app.store.data;}
  get isOpen(){return this.dialog.open;}
  show(kind){
    const battle=kind==='battle';document.body.dataset.scene=kind;this.root.hidden=battle;document.querySelector('header').hidden=!battle;document.querySelector('footer').hidden=!battle;
    document.querySelector('#location').textContent=kind==='prep'?'MISSION STAGING':'DEFENSE HEADQUARTERS';
    document.querySelector('#briefing-action').hidden=kind!=='prep';document.querySelector('#stage-back').hidden=kind!=='prep';document.querySelector('#stage-deploy').hidden=kind!=='prep';document.querySelector('#stage-map').hidden=kind!=='prep';this.refreshBar();
  }
  refreshBar(){
    document.querySelector('#profile-coins').textContent=Math.floor(this.p.coins).toLocaleString()+' coins · '+this.p.shards+' gems';document.querySelector('#profile-level').textContent=`LEVEL ${this.app.store.level} · ${this.p.xp%100} / 100 XP`;
    const markup=this.p.loadout.map((id,i)=>button('slot',`${portrait(id)}<span class="slot-number">0${i+1}</span><strong>${id?TOWERS[id].name:'Empty slot'}</strong><small>${id?SKINS[this.p.skin].name:'Equip a tower'}</small>`,i)).join('');
    if(markup!==this.loadoutMarkup){document.querySelector('#loadout').innerHTML=markup;this.loadoutMarkup=markup;}
  }
  setPrompt(text){const node=document.querySelector('#walk-prompt');if(node.textContent!==text)node.textContent=text;}
  setViewMode(mode){document.querySelector('#lobby-view-mode').textContent=mode==='strategy'?'First person · V':'Overhead · V';}
  notify(text){this.toast.textContent=text;this.toast.hidden=false;this.feedback.textContent=text;this.feedback.hidden=false;this.toastTime=5;this.refreshBar();}
  setDeploying(value){document.querySelector('#deploy-overlay').hidden=!value;this.root.inert=value;}
  onCancel(e){e.preventDefault();this.close();}
  onKey(e){if(e.code==='Escape'&&this.isOpen){e.preventDefault();this.close();}}
  onChange(e){if(e.target.id==='roster-filter'){this.filter=e.target.value;this.draw();return;}if(e.target.id==='roster-sort'){this.sort=e.target.value;this.draw();return;}if(e.target.id==='reduced-motion')this.app.reducedMotion=e.target.checked;if(e.target.id==='audio-volume')this.app.audio.setVolume(Number(e.target.value));if(e.target.id==='camera-fov'){this.app.setFov(Number(e.target.value));e.target.nextElementSibling.textContent=`${this.app.fov}°`;}if(e.target.id==='look-sensitivity'){this.app.setLookSensitivity(Number(e.target.value));e.target.nextElementSibling.textContent=`${this.app.lookSensitivity.toFixed(2)}×`;}}
  get roster(){return Object.values(TOWERS).filter(t=>!VARIANTS[t.id]&&(this.filter==='All'||rosterGroup(t)===this.filter)).sort((a,b)=>this.sort==='name'?a.name.localeCompare(b.name):this.sort==='role'?a.role.localeCompare(b.role)||a.name.localeCompare(b.name):this.sort==='level'?(requiredTowerLevel[a.id]||1)-(requiredTowerLevel[b.id]||1)||a.name.localeCompare(b.name):this.sort==='category'?ROSTER_GROUPS.indexOf(rosterGroup(a))-ROSTER_GROUPS.indexOf(rosterGroup(b))||a.name.localeCompare(b.name):Number(this.p.owned.includes(b.id))-Number(this.p.owned.includes(a.id))||a.name.localeCompare(b.name));}
  get rosterControls(){return `<div class="roster-controls"><label>Category<select id="roster-filter">${['All',...ROSTER_GROUPS].map(t=>`<option ${t===this.filter?'selected':''}>${t}</option>`).join('')}</select></label><label>Sort by<select id="roster-sort">${[['category','Category'],['owned','Owned first'],['name','Name'],['role','Role'],['level','Unlock level']].map(([id,name])=>`<option value="${id}" ${id===this.sort?'selected':''}>${name}</option>`).join('')}</select></label></div>`;}
  get inventoryCards(){let group='';return this.roster.map(t=>{const next=rosterGroup(t),heading=this.sort==='category'&&next!==group?`<h3 class="roster-heading">${next}</h3>`:'';group=next;return `${heading}${button('tower',`${portrait(t.id)}<strong>${t.name}</strong><small>${this.p.owned.includes(t.id)?'Owned':`Locked${requiredTowerLevel[t.id]?` · Level ${requiredTowerLevel[t.id]}`:''}`} · ${t.role}${this.p.forms[t.id]?` · ${TOWERS[this.p.forms[t.id]].name} active`:''}</small>`,t.id)}`;}).join('');}
  close(){if(this.panel==='tutorial'&&!this.p.tutorialSeen)this.app.store.markTutorialSeen();if(this.dialog.open)this.dialog.close();this.panel='';this.previewBox=null;this.app.active?.input?.clear?.();this.app.canvas.focus({preventScroll:true});}
  open(panel){
    if(this.app.deploying)return;this.feedback.hidden=true;this.app.active?.input?.clear?.();this.panel=panel;this.draw();if(!this.dialog.open)this.dialog.showModal();this.dialog.querySelector('button')?.focus();
  }
  draw(){
    this.previewBox=null;
    document.querySelector('#panel-title').textContent=({tutorial:'How to play',inventory:'Tower inventory',towerDetail:'Tower inspection',shop:'Requisitions',missions:'Mission command',survivalModes:'Survival modes',hardcoreModes:'Hardcore',briefing:'Staging controls',quests:'Operations board',rewards:'Rewards & progression',crates:'Salvage bay',index:'Field archive',trophies:'Hall of records',settings:'Accessibility'})[this.panel]||this.panel;
    const p=this.p;
    const reward=(id,title,detail,ready)=>card(title,`<p>${detail}</p>${button('claim',(id==='daily'||id==='weekly'?p[id].claimed:p.claims.includes(id))?'Claimed':'Claim reward',id,!ready||(id==='daily'||id==='weekly'?p[id].claimed:p.claims.includes(id)))}`);
    let html='';
    if(this.panel==='tutorial'){
      const pages=[
        ['Explore headquarters','Use WASD to move and right-drag to orbit or tilt the view. Scroll to zoom and press V to switch between overhead and first-person views. Approach a glowing station and press E, or use the station buttons.'],
        ['Prepare your mission','Choose mission at the bottom of headquarters. Pick a difficulty to enter the separate preparation hall. At its map table, choose a route; at the armory, adjust your three tower slots. Deploy when ready.'],
        ['Command the defense','Pan with WASD, zoom with the wheel, right-drag to orbit and tilt, or press V for first person. Select a tower from the bottom tray, then click clear ground beside the road. Green means valid; red means blocked. Press Space to launch each wave.'],
        ['Upgrade and claim','Click a placed tower to open its compact upgrade panel. A bright upgrade button means you can afford it. Hover an enemy to read its health. After the battle, return to headquarters and open Rewards to view daily tasks and spin tickets.']
      ],page=pages[this.tutorialStep];
      html=`<div class="tutorial"><span class="eyebrow">FIELD GUIDE / ${this.tutorialStep+1} OF ${pages.length}</span><h3>${page[0]}</h3><p>${page[1]}</p><div class="tutorial-progress">${pages.map((_,i)=>`<span class="${i===this.tutorialStep?'active':''}"></span>`).join('')}</div><div class="panel-actions">${this.tutorialStep?button('tutorial-prev','← Back'):''}${this.tutorialStep<pages.length-1?button('tutorial-next','Next →'):button('close','Start exploring ✓')}</div></div>`;
    }else if(this.panel==='inventory'){
      html=`<p class="panel-intro">Level ${this.app.store.level} · ${this.roster.filter(t=>p.owned.includes(t.id)).length} base towers owned. Golden and evolved forms appear within their base tower.</p>${this.rosterControls}<div class="inventory-cards">${this.inventoryCards}</div><h3>Equipped loadout</h3><div class="briefing-loadout">${p.loadout.map((id,i)=>button('select-slot',`${i+1}. ${id?TOWERS[id].name:'Empty'}${this.slot===i?' · Selected':''}`,i)).join('')}</div>`;
    }else if(this.panel==='towerDetail'){
      const t=TOWERS[this.tower],owned=p.owned.includes(t.id),level=requiredTowerLevel[t.id]||1,forms=towerForms(t.id);
      html=`<div class="inventory-layout detail-layout"><div><h3>${t.name}</h3><p>${t.tier} · ${t.role}</p><p>${t.description}</p><p>Account level required: ${level}</p>${button('open','← All towers','inventory')}</div><div><div id="model-preview" aria-label="Rotating 3D tower preview"></div><div class="preview-controls">${button('rotate','↶ Rotate model')}</div></div><div class="tower-detail"><h3>${t.name}</h3><dl><dt>Placement</dt><dd>${t.cost} cash</dd><dt>Damage</dt><dd>${t.damage}</dd><dt>Range</dt><dd>${t.range} m</dd><dt>Fire interval</dt><dd>${t.intervalSeconds} s</dd><dt>Mastery</dt><dd>Level ${1+Math.floor((p.mastery[t.id]||0)/100)}</dd></dl><p>Special: ${TOWER_SPECIAL[t.kit]||t.role}.</p>${!owned?button('buy',`Recruit · ${t.unlockPrice} ${currencyName(t.currency)}`,t.id,p[t.currency]<t.unlockPrice||this.app.store.level<level):''}${button('equip',`Equip in slot ${this.slot+1}`,t.id,!owned)}${button('unequip','Clear selected slot',this.slot)}<h4>Form</h4>${button('form',`Standard${!p.forms[t.id]?' ✓':''}`,`${t.id}:standard`,!owned)}${forms.map(id=>{const v=TOWERS[id],have=p.owned.includes(id);return `${button('form',`${v.name}${p.forms[t.id]===id?' ✓':''}`,`${t.id}:${id}`,!have)}${!have&&v.tier!=='Golden'?button('buy',`Unlock ${v.name} · ${v.unlockPrice} ${currencyName(v.currency)}`,id,!owned||p[v.currency]<v.unlockPrice):''}`;}).join('')}<p>Golden forms come from the 50,000 coin Golden crate. Form stats apply when this tower is deployed.</p><h4>Skin</h4>${Object.entries(SKINS).map(([id,s])=>button('skin',s.name+(p.skin===id?' ✓':''),id,!p.skins.includes(id))).join('')}</div></div>`;
    }else if(this.panel==='shop'){
      html=`<p class="panel-intro">Level ${this.app.store.level} · ${Math.floor(p.coins)} coins · ${p.shards} gems. Tower forms are managed inside their base tower.</p>${this.rosterControls}<div class="card-grid">${this.roster.map(t=>card(t.name,`${portrait(t.id)}<small>${t.tier} · ${t.role} · Level ${requiredTowerLevel[t.id]||1}</small><p>${t.description}</p>${button('inspect','Preview character',t.id)}${button('buy',p.owned.includes(t.id)?'Owned':`Recruit · ${t.unlockPrice} ${currencyName(t.currency)}`,t.id,p.owned.includes(t.id)||p[t.currency]<t.unlockPrice||this.app.store.level<(requiredTowerLevel[t.id]||1))}`)).join('')}${card('Golden crate',`<p>50,000 coins · One random original golden form you do not own. Open it in the Salvage Bay.</p>${button('buy','Buy Golden crate · 50,000 coins','golden-crate',p.coins<50000)}${button('open','Open Salvage Bay','crates')}`)}${card('Circuit finish',`${portrait('gilded-prism-sentry')}<h4>Amber circuit</h4><p>A warm amber uniform finish. Cosmetic only.</p>${button('preview-skin','Preview finish','amber')}${button('buy',p.skins.includes('amber')?'Owned':'Buy · 80 coins','amber',p.skins.includes('amber')||p.coins<80)}`)}${card('Cosmetic salvage',`<p>70% Amber circuit · 30% Violet signal. Duplicates return 50 coins.</p>${button('buy','Buy crate · 100 coins','crate',p.coins<100)}${button('open','Open salvage bay','crates')}`)}</div>`;
    }else if(this.panel==='missions'){
      html=`<p class="panel-intro">Choose a mission category.</p><div class="card-grid">${card('Survival',`<p>Choose Easy, Casual, Intermediate, Molten, or Fallen.</p>${button('open','Choose gamemode →','survivalModes')}`)}${card('Hardcore',`<p>Requires level 50. Voidcore also requires a Hardcore victory.</p>${button('open','Continue →','hardcoreModes')}`)}${MODES.filter(m=>!m.available).map(m=>card(m.name,`<p>${m.detail}</p>${button('mode','In development',m.id,true)}`)).join('')}</div>`;
    }else if(this.panel==='survivalModes'||this.panel==='hardcoreModes'){
      const hardcore=this.panel==='hardcoreModes';
      const choices=MODES.filter(m=>m.category===(hardcore?'hardcore':'survival'));
      html=`<p class="panel-intro">${hardcore?'Reach level 50 for Hardcore; win Hardcore to unlock Voidcore.':'Select a Survival mode.'}</p><div class="card-grid">${choices.map(m=>card(m.name,`<p>${m.detail}</p><small>${m.waves} waves · Final boss on wave ${m.waves}</small><small>Triumph: ${Object.entries(m.rewards||{}).map(([k,v])=>`${v} ${currencyName(k)}`).join(' · ')||'Prototype rewards'}</small>${button('mode',this.app.canPlay(m)?'Start →':`Locked${m.requiredLevel?` · Level ${m.requiredLevel}`:''}`,m.id,!this.app.canPlay(m))}`)).join('')}</div>`;
    }else if(this.panel==='briefing'){
      const m=this.app.map,r=p.records[m.id];
      html=`<p class="panel-intro">${MODES.find(x=>x.id===this.app.selection.mode)?.name} · ${m.theme} / ${m.brief}</p><div class="card-grid">${MAPS.map(m=>card(m.name,`<p>${m.theme} · 1 lane · Ground placement</p><p>${m.space} · ${m.hazard}</p>${button('map',this.app.selection.map===m.id?'Selected ✓':'Select map',m.id)}`)).join('')}</div><div class="briefing-summary"><div><h3>${m.name}</h3><p>Path ${Math.round(m.path.slice(1).reduce((n,b,i)=>n+Math.hypot(b.x-m.path[i].x,b.z-m.path[i].z),0))} m · No cliffs</p><p>Best clear: ${r?r.best.toFixed(1)+' s':'Uncleared'} · Wins ${r?.wins||0}</p></div><div><h3>Equipped towers</h3><p>Select a slot to change the loadout before deployment.</p></div></div><div class="briefing-loadout">${p.loadout.map((id,i)=>button('slot',`${portrait(id)}${i+1} · ${id?TOWERS[id].name+' / '+SKINS[p.skin].name:'Choose tower'}`,i)).join('')}</div><div class="panel-actions">${button('open','Edit inventory','inventory')}${button('deploy','Deploy →','',!p.loadout.some(Boolean))}</div>`;
    }else if(this.panel==='rewards'){
      const today=new Date().toISOString().slice(0,10),claimed=p.loginDay===today;
      html=`<p class="panel-intro">Daily rewards and assignments reset at midnight UTC. Claim each reward when it is ready.</p><div class="daily-track">${Array.from({length:7},(_,i)=>`<div class="daily-day ${i===Math.min(p.loginCount,6)?'today':''}"><small>VISIT ${i+1}</small><strong>${20+(i+1)*10}</strong><span>coins</span></div>`).join('')}</div><div class="card-grid">${card('Today’s login reward',`<p>${claimed?'Claimed today':'Ready to claim'} · ${20+Math.min(p.loginCount+1,7)*10} coins</p>${button('claim',claimed?'Claimed today':'Claim today’s coins','login',claimed)}`)}${reward('daily','Daily assignment',`${Math.min(p.daily.missions,1)} / 1 mission completed today · 40 coins`,p.daily.missions>=1)}${reward('weekly','Weekly assignment',`${p.weekly.kills} / 50 contacts defeated · 100 coins`,p.weekly.kills>=50)}${card('Supply wheel',`<p>${p.tickets} spin tickets · the pointer awards the segment it lands on.</p><div class="wheel-wrap"><div class="wheel-pointer">▼</div><div class="reward-wheel" style="transform:rotate(${this.wheelAngle}deg)"><span>25</span><span>40</span><span>60</span><span>100</span></div></div><p class="wheel-result" role="status">${this.spinResult&&!this.spinTime?this.spinResult.message:'25 · 40 · 60 · 100 coins'}</p>${button('spin','Use 1 ticket','',!p.tickets||!!this.spinTime)}`)}${reward('play','On-duty reward',`${Math.min(5,Math.floor(p.played/60))} / 5 active minutes · 40 coins`,p.played>=300)}${reward('season','First Signal · starter track',`${p.xp} / 100 XP · 80 coins. Earn XP by completing missions.`,p.xp>=100)}${reward('season2','First Signal · tier 2',`${p.xp} / 250 XP · 120 coins`,p.xp>=250)}${reward('season3','First Signal · tier 3',`${p.xp} / 500 XP · 200 coins`,p.xp>=500)}${card('Promotional codes',`<label for="code-input">Code</label><input id="code-input" maxlength="32" placeholder="Try FIRSTLIGHT" autocomplete="off">${button('code','Redeem code')}<p id="code-result" role="status"></p>`)}</div>`;
    }else if(this.panel==='quests'){
      html=`<p class="panel-intro">Daily and weekly assignments · complete battles to advance. Daily reset: midnight UTC. Weekly reset: Monday UTC.</p><div class="card-grid">${reward('daily','First deployment',`${Math.min(p.daily.missions,1)} / 1 completed missions today · 40 coins`,p.daily.missions>=1)}${reward('weekly','Clear the signal',`${p.weekly.kills} / 50 enemies defeated this week · 100 coins`,p.weekly.kills>=50)}${reward('achievement','Relay guardian',`${p.wins} victories · Win a mission to earn 60 coins and a headquarters trophy.`,p.wins>=1)}</div>`;
    }else if(this.panel==='crates'){
      html=`<div class="salvage-display"><div class="salvage-crate ${this.crateTime?'opening':''}">◇</div><h3>${this.crateTime?'Decoding salvage…':this.crateResult?SKINS[this.crateResult.id].name:'Cosmetic salvage'}</h3><p>${p.crates} cosmetic crates · ${p.goldenCrates} Golden crates</p>${button('crate','Open cosmetic crate','',!p.crates||!!this.crateTime)}${this.crateResult&&!this.crateTime?button('skin','Equip revealed skin',this.crateResult.id):''}${button('golden-open','Open Golden crate','',!p.goldenCrates)}${button('open','Visit shop','shop')}</div>`;
    }else if(this.panel==='index'){
      html=`<div class="card-grid">${card('Void zombie',`${icon('void')}<p>Fallen / Voidcore threats. Dark rags, violet eyes and crystalline growths. Voidcore enemies have 35% more health and move 35% faster. The Rift Brute leads them.</p>`)}${card('Shambler zombie',p.missions?'<p>10 health · Ground · Speed 3 m/s (Challenge: 4.05). No armor. Threat: groups.</p>':'<p>Unknown contact. Complete a mission to unlock research.</p>')}${card('Hollow Brute',p.missions?'<p>90 health · Ground · Speed 1.5 m/s. A breach destroys the base. Concentrate fire over multiple bends.</p>':'<p>Boss-class contact not yet documented.</p>')}${MAPS.map(m=>card(m.name,`<p>${m.theme} · ${p.records[m.id]?.wins||0} wins · ${p.records[m.id]?.best?.toFixed(1)||'—'} s best clear</p>`)).join('')}${card('Service log 07',p.secret?'<p>“The old access corridor still carries the first relay signal. Keep a light burning for those outside.” Secret found · 30 coins awarded.</p>':'<p>An old maintenance log is hidden somewhere in headquarters.</p>')}</div>`;
    }else if(this.panel==='trophies'){
      html=`<div class="card-grid">${card('Relay guardian',`<span class="tower-glyph">${p.wins?'✦':'◇'}</span><p>${p.wins?'Trophy earned. Your gold relay crystal is displayed in the south hall.':'Win your first mission to light the south hall trophy pedestal.'}</p>`)}${reward('flawless','Unbroken relay',`${p.flawless} flawless victories · Win with full base health · 75 coins`,p.flawless>=1)}${card('Service archivist',`<p>${p.secret?'Hidden log discovered.':'Explore the headquarters service corridor.'}</p>`)}${card('Mission record',`<p>${p.missions} deployments · ${p.wins} victories · ${p.kills} contacts neutralized</p>`)}</div>`;
    }else if(this.panel==='settings')html='<label><input id="reduced-motion" type="checkbox" '+(this.app.reducedMotion?'checked':'')+'> Reduce environment motion and skip deployment camera animation</label><p>WASD move · right-drag to look · mouse wheel zooms out · E interact · Escape close. Touch: hold direction buttons and drag the world to look.</p><label for="camera-fov">Field of view</label><input id="camera-fov" type="range" min="50" max="100" step="1" value="'+this.app.fov+'"><output>'+this.app.fov+'°</output><label for="look-sensitivity">Look sensitivity (mouse and touch)</label><input id="look-sensitivity" type="range" min="0.25" max="2" step="0.05" value="'+this.app.lookSensitivity+'"><output>'+this.app.lookSensitivity.toFixed(2)+'×</output><p>Original synthesized machinery hum and interface cues. Muted by default.</p><label for="audio-volume">Audio volume</label><input id="audio-volume" type="range" min="0" max="1" step=".05" value="'+this.app.audio.volume+'">';
    this.content.innerHTML=html;for(const c of this.content.querySelectorAll('.hq-card'))if(!c.querySelector('img'))c.insertAdjacentHTML('afterbegin',icon(this.panel==='briefing'?'map':this.panel==='shop'?'crates':this.panel==='index'?'zombie':['missions','survivalModes','hardcoreModes'].includes(this.panel)?'missions':this.panel));this.refreshBar();
    if(this.panel==='towerDetail'){this.previewBox=document.querySelector('#model-preview');this.makePreview();}
    if(this.panel==='crates'){
      const display=this.content.querySelector('.salvage-crate');display.textContent='';display.id='model-preview';display.className='crate-preview';this.previewBox=display;
      if(this.model)disposeObject(this.model);this.model=new THREE.Group();this.lid=null;
      if(this.crateResult&&!this.crateTime){this.model=createTowerMesh();this.model.traverse(o=>{if(o.material?.name==='uniform')o.material.color.setHex(SKINS[this.crateResult.id].color);});}
      else {mesh(this.model,new THREE.BoxGeometry(1.6,1.2,1.3),material(0x536879),0,.65);for(const x of [-.55,.55])mesh(this.model,new THREE.BoxGeometry(.08,1.25,1.35),material(0xc99fed),x,.65);this.lid=mesh(this.model,new THREE.BoxGeometry(1.7,.18,1.4),material(0xacbbce),0,1.35);}
      this.preview.add(this.model);
    }
  }
  makePreview(){if(this.model)disposeObject(this.model);const t=TOWERS[this.p.forms[this.tower]]||TOWERS[this.tower];this.model=createTowerMesh(false,t);this.model.traverse(o=>{if(o.material?.name==='uniform'&&(this.previewSkin||this.p.skin)!=='standard')o.material.color.setHex(SKINS[this.previewSkin||this.p.skin].color);});this.preview.add(this.model);}
  onClick(e){
    const b=e.target.closest('[data-hq]');if(!b||b.disabled||this.app.deploying)return;const action=b.dataset.hq,value=b.dataset.value;
    this.app.audio.play('ui');
    switch(action){
      case 'close':this.close();return;
      case 'tutorial-next':this.tutorialStep=Math.min(3,this.tutorialStep+1);this.draw();return;
      case 'tutorial-prev':this.tutorialStep=Math.max(0,this.tutorialStep-1);this.draw();return;
      case 'open':this.open(value);return;
      case 'interact':this.app.active.interact();return;
      case 'view':this.app.active.toggleView();this.app.canvas.focus({preventScroll:true});return;
      case 'hq':this.app.go('hq');return;
      case 'mode':{const mode=MODES.find(m=>m.id===value);if(!mode||!this.app.canPlay(mode))return;this.app.selection.mode=value;this.app.prepare();return;}
      case 'map':this.app.selectMap(value);return;
      case 'difficulty':if(MODES.some(m=>m.id===value&&m.available))this.app.selection.mode=value;break;
      case 'deploy':this.app.deploy();return;
      case 'slot':this.slot=Number(value);this.previewSkin=null;this.open('inventory');return;
      case 'select-slot':this.slot=Number(value);break;
      case 'tower':this.tower=value;this.previewSkin=null;this.open('towerDetail');return;
      case 'inspect':this.tower=value;this.open('towerDetail');return;
      case 'preview-skin':this.previewSkin=value;this.open('towerDetail');return;
      case 'rotate':if(this.model)this.model.rotation.y+=Math.PI/4;return;
      case 'equip':this.app.store.equip(value,this.slot);this.notify('Loadout updated.');break;
      case 'unequip':this.app.store.unequip(Number(value));break;
      case 'skin':this.app.store.setSkin(value);this.previewSkin=null;this.notify('Skin equipped.');break;
      case 'form':{const [base,form]=value.split(':');if(this.app.store.setForm(base,form)){this.notify(`${form==='standard'?'Standard':TOWERS[form].name} form active.`);}break;}
      case 'buy':this.notify(this.app.store.buy(value));break;
      case 'golden-open':{const result=this.app.store.openGoldenCrate();if(result)this.notify(result.duplicate?'All Golden forms owned · 50,000 coins returned.':`${TOWERS[result.id].name} unlocked inside ${TOWERS[result.base].name}.`);break;}
      case 'claim':this.notify(this.app.store.claim(value));break;
      case 'spin':if(this.spinTime||!this.p.tickets)return;this.spinResult=this.app.store.spin();this.spinTime=this.app.reducedMotion?.05:2.2;break;
      case 'crate':if(this.crateTime)return;this.crateResult=this.app.store.openCrate();if(this.crateResult)this.crateTime=this.app.reducedMotion?.05:2.3;break;
      case 'code':{const result=this.app.store.redeem(document.querySelector('#code-input').value);document.querySelector('#code-result').textContent=result;this.notify(result);return;}
    }
    if(this.isOpen)this.draw();
    if(action==='spin'&&this.spinResult?.index!==undefined){const wheel=this.content.querySelector('.reward-wheel');if(wheel){const previous=this.wheelAngle,target=previous+1800+((360-this.spinResult.index*90-previous%360+360)%360);requestAnimationFrame(()=>{wheel.style.transition=this.app.reducedMotion?'none':'transform 2.2s cubic-bezier(.14,.7,.14,1)';wheel.style.transform=`rotate(${target}deg)`;});this.wheelAngle=target;}}
  }
  update(dt){
    this.clock+=dt;if(this.clock>1){this.clock=0;this.refreshBar();}
    if(this.toastTime){this.toastTime-=dt;if(this.toastTime<=0){this.toast.hidden=true;this.feedback.hidden=true;this.toastTime=0;}}
    if(this.model&&!this.app.reducedMotion)this.model.rotation.y+=dt*.35;
    if(this.lid&&this.crateTime){const reveal=1-this.crateTime/2.3;this.lid.position.y=1.35+Math.max(0,reveal-.35)*2;this.lid.rotation.z=Math.sin(reveal*30)*.04;}
    if(this.crateTime){this.crateTime-=dt;if(this.crateTime<=0){this.crateTime=0;if(this.panel==='crates')this.draw();this.app.audio.play('reward');this.notify('Salvage decoded: '+SKINS[this.crateResult.id].name);}}
    if(this.spinTime){this.spinTime-=dt;if(this.spinTime<=0){this.spinTime=0;if(this.panel==='rewards')this.draw();this.notify(this.spinResult.message);}}
  }
  renderPreview(renderer){
    if(!this.previewBox||!this.isOpen)return;
    const r=this.previewBox.getBoundingClientRect(),c=renderer.domElement.getBoundingClientRect();const left=Math.max(r.left,c.left),top=Math.max(r.top,c.top),right=Math.min(r.right,c.right),bottom=Math.min(r.bottom,c.bottom);if(right<=left||bottom<=top)return;
    this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();renderer.setScissorTest(true);renderer.setScissor(left-c.left,c.bottom-bottom,right-left,bottom-top);renderer.setViewport(r.left-c.left,c.bottom-r.bottom,r.width,r.height);renderer.clearDepth();renderer.render(this.preview,this.camera);renderer.setScissorTest(false);renderer.setViewport(0,0,c.width,c.height);
  }
  dispose(){this.close();this.root.removeEventListener('click',this.onClick);this.dialog.removeEventListener('click',this.onClick);this.dialog.removeEventListener('cancel',this.onCancel);this.dialog.removeEventListener('change',this.onChange);document.removeEventListener('keydown',this.onKey);disposeObject(this.preview);}
}
