import { LobbyScene } from '../scenes/LobbyScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { SaveStore } from '../storage/SaveStore.js';
import { HeadquartersHud } from '../ui/HeadquartersHud.js';
import { MAPS,OPERATION } from '../data/headquarters.js';
import { Audio } from './Audio.js';
export class SceneRouter {
  constructor(canvas){this.canvas=canvas;this.store=new SaveStore();this.audio=new Audio();this.selection={map:'copper-reach',mode:'beginner'};this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;this.width=1;this.height=1;this.kind='hq';this.pose=null;this.onVisibility=()=>{if(document.hidden)this.audio.suspend();else this.audio.resume();};}
  get map(){return MAPS.find(m=>m.id===this.selection.map)||MAPS[0];}
  init(){this.ui=new HeadquartersHud(this);}
  enter(){this.go('hq');document.addEventListener('visibilitychange',this.onVisibility);if(!this.store.data.tutorialSeen)this.ui.open('tutorial');if(this.store.warning)this.ui.notify(this.store.warning);}
  go(kind){
    this.ui.close();if(this.active instanceof LobbyScene)this.pose={...this.active.pose};this.active?.exit();this.active?.dispose();this.kind=kind;
    this.active=kind==='battle'?new BattleScene(this.canvas,this,this.mission):new LobbyScene(this.canvas,this,kind==='prep',this.pose);
    this.ui.show(kind);this.active.init();this.active.enter();this.active.resize(this.width,this.height);this.canvas.focus({preventScroll:true});
  }
  prepare(){this.go('prep');}
  selectMap(id){if(!MAPS.some(m=>m.id===id)||this.deploying)return;this.selection.map=id;if(this.kind==='prep'){this.active.setMap(this.map);this.ui.open('briefing');}}
  deploy(){
    if(this.deploying||this.kind!=='prep')return;
    if(!this.store.data.loadout.some(Boolean)){this.ui.notify('Equip at least one tower before deployment.');return;}
    this.mission=Object.freeze({...this.selection,path:this.map.path,loadout:Object.freeze([...this.store.data.loadout]),skin:this.store.data.skin,mapData:this.map});
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
