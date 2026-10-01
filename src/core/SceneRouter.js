import { LobbyScene } from '../scenes/LobbyScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { SaveStore } from '../storage/SaveStore.js';
import { HeadquartersHud } from '../ui/HeadquartersHud.js';
import { MAPS,MODES,OPERATION } from '../data/headquarters.js';
import { Audio } from './Audio.js';
export class SceneRouter {
  constructor(canvas){this.canvas=canvas;this.store=new SaveStore();this.audio=new Audio();this.selection={map:'copper-reach',mode:'easy'};this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.fov=this.store.data.fov;this.lookSensitivity=this.store.data.lookSensitivity;this.zoom=0;this.width=1;this.height=1;this.kind='hq';this.pose=null;this.onVisibility=()=>{if(document.hidden)this.audio.suspend();else this.audio.resume();};}
  setFov(value){this.fov=this.store.setFov(value);if(this.active?.camera){this.active.camera.fov=this.fov;this.active.camera.updateProjectionMatrix();}}
  setLookSensitivity(value){this.lookSensitivity=this.store.setLookSensitivity(value);}
  setZoom(value){this.zoom=Math.max(0,Math.min(12,value));document.body.classList.toggle('zoomed',this.zoom>1);this.active?.updateCamera?.();}
  get map(){return MAPS.find(m=>m.id===this.selection.map)||MAPS[0];}
  init(){this.ui=new HeadquartersHud(this);}
  enter(){this.go('hq');document.addEventListener('visibilitychange',this.onVisibility);if(!this.store.data.tutorialSeen)this.ui.open('tutorial');if(this.store.warning)this.ui.notify(this.store.warning);}
  go(kind){
    this.ui.close();if(this.active instanceof LobbyScene)this.pose={...this.active.pose};this.active?.exit();this.active?.dispose();this.kind=kind;
    this.active=kind==='battle'?new BattleScene(this.canvas,this,this.mission):new LobbyScene(this.canvas,this,kind==='prep',this.pose);
    this.ui.show(kind);this.active.init();this.active.enter();this.active.resize(this.width,this.height);this.canvas.focus({preventScroll:true});
  }
  prepare(){const m=this.mode;if(!m||!this.canPlay(m)){this.ui.notify('This mode is locked. Check its level and victory requirements.');return;}this.go('prep');}
  get mode(){return this.selection.mode&&this.modes.find(m=>m.id===this.selection.mode);}
  get modes(){return MODES;}
  canPlay(m){return m.available&&(this.store.level>= (m.requiredLevel||1))&&(m.id!=='voidcore'||this.store.data.clearedModes.includes('hardcore'));}
  selectMap(id){if(!MAPS.some(m=>m.id===id)||this.deploying)return;this.selection.map=id;if(this.kind==='prep'){this.active.setMap(this.map);this.ui.open('briefing');}}
  deploy(){
    if(this.deploying||this.kind!=='prep')return;
    if(!this.canPlay(this.mode)){this.ui.notify('Mode requirements are not met.');return;}
    if(!this.store.data.loadout.some(Boolean)){this.ui.notify('Equip at least one tower before deployment.');return;}
    this.mission=Object.freeze({...this.selection,path:this.map.path,loadout:Object.freeze([...this.store.data.loadout]),forms:Object.freeze({...this.store.data.forms}),skin:this.store.data.skin,mapData:this.map});
    this.ui.close();this.deploying=this.reducedMotion?.05:OPERATION.deploySeconds;this.ui.setDeploying(true);
    this.audio.play('deploy');
  }
  update(dt){
    this.store.tick(dt);
    if(this.deploying){this.deploying-=dt;if(this.deploying<=0){this.deploying=0;this.ui.setDeploying(false);this.go('battle');}}
    this.active.update(dt);this.ui.update(dt);
  }
  render(renderer,alpha){this.active.render(renderer,alpha);this.ui.renderPreview(renderer);}
  resize(w,h){this.width=w;this.height=h;this.active?.resize(w,h);}
  exit(){document.removeEventListener('visibilitychange',this.onVisibility);this.audio.dispose();this.active?.exit();this.store.save();this.ui.dispose();}
  dispose(){this.active?.dispose();}
}
