import * as THREE from 'three';
import { WaveManager } from '../gameplay/WaveManager.js';
import { towerStats } from '../gameplay/Tower.js';
import { placementReason } from '../gameplay/Placement.js';
import { isTerminal } from '../core/State.js';
import { Input } from '../core/Input.js';
import { Hud } from '../ui/Hud.js';
import { TOWER,TOWERS } from '../data/towers.js';
import { activeTower } from '../data/progression.js';
import { SKINS,OPERATION,FINAL_BOSSES } from '../data/headquarters.js';
import { ENEMY } from '../data/enemies.js';
import { ARENA } from '../data/arena.js';
import { WALK } from '../data/headquarters.js';
import { createWorld } from '../rendering/createWorld.js';
import { createTowerMesh,createEnemyMesh,createRange,createBeam,disposeObject } from '../rendering/createMeshes.js';
export class BattleScene {
  constructor(canvas,app=null,mission=null){
    this.canvas=canvas;
    this.app=app;this.mission=mission;this.towerId=mission?.loadout.find(Boolean)||'prism-sentry';this.rewarded=false;this.intro=mission&&!app?.reducedMotion?OPERATION.flyoverSeconds:0;
    this.battle=new WaveManager(mission);
    this.seenWaveEnd=0;this.seenClearBonus=0;
    this.placing=false;
    this.selected=null;
    this.message='Place a defender near the inner bend, then start the wave.';
    this.pointer=new THREE.Vector2();
    this.raycaster=new THREE.Raycaster();
    this.hits=[];
    this.towerMeshes=new Map();
    this.enemyMeshes=new Map();this.allyMeshes=new Map();
    this.direction=new THREE.Vector3();
    this.hoverProbe=new THREE.Vector3();
    this.up=new THREE.Vector3(0,1,0);
    this.hasPoint=false;this.yaw=0;this.pitch=.88;this.firstPitch=0;this.distance=32;this.viewMode=app?.viewMode||'strategy';this.hoveredEnemy=null;this.motionTime=0;
  }
  init(){
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x182d35);
    this.camera=new THREE.PerspectiveCamera(this.app?.fov||68,1,.1,250);this.camera.rotation.order='YXZ';
    const {
      terrain
    }
    =createWorld(this.scene,this.mission?.mapData);
    this.terrain=terrain;
    this.ghost=createTowerMesh(true,this.definition);this.ghostTowerId=this.towerId;
    this.ghost.scale.setScalar(1.35);
    this.ghost.visible=false;
    this.scene.add(this.ghost);
    this.avatar=createTowerMesh(false,{...TOWERS['signal-captain'],color:0x51a7c2});this.avatar.scale.setScalar(1.1);this.scene.add(this.avatar);
    this.walkX=0;this.walkZ=0;this.updateCamera();
    this.range=createRange();
    this.scene.add(this.range);
    this.scene.updateMatrixWorld(true);
  }
  enter(){
    this.input=new Input(this.canvas,this);
    this.hud=new Hud(this);
    this.hud.update();
  }
  get terminal(){
    return isTerminal(this.battle.state);
  }
  get definition(){return activeTower(this.towerId,this.mission?.forms);}
  place(){
    if(this.terminal)return;
    if(this.ghostTowerId!==this.towerId){disposeObject(this.ghost);this.ghost=createTowerMesh(true,this.definition);this.ghost.scale.setScalar(1.35);this.scene.add(this.ghost);this.ghostTowerId=this.towerId;}
    this.placing=true;
    this.selected=null;
    this.message='Move over terrain. ✓ Place here / × cannot place. Esc cancels.';
    this.refreshPreview();
    this.hud.update();
  }
  canCancel(){
    return this.placing||this.selected!==null;
  }
  cancel(){
    this.placing=false;
    this.selected=null;
    this.ghost.visible=false;
    this.range.visible=false;
    this.message='Selection cleared. No cash spent.';
    this.hud.update();
  }
  start(){
    if(this.intro>0)return;
    if(this.battle.start()){
      this.message=`Wave ${this.battle.wave} / ${this.battle.totalWaves} active. Defenders target the furthest enemy in range.`;
      this.hud.update();
    }
  }
  skipWave(){
    if(this.intro>0||!this.battle.skipWave())return;
    this.message=this.battle.state==='INTERMISSION'?`Skip vote passed. Wave ${this.battle.wave+1} begins after the intermission; existing enemies remain.`:'Skip vote recorded.';
    this.hud.update();
  }
  voteNo(){if(this.battle.voteSkip(false)){this.message='You voted to continue this wave.';this.hud.update();}}
  upgrade(){
    if(!this.selected)return;
    if(this.battle.upgrade(this.selected.id)){
      const model=this.towerMeshes.get(this.selected.id)?.model;
      if(model)model.scale.setScalar(1.35+this.selected.level*.1);
      this.showSelection();this.message=`${this.selected.definition.name} upgraded to level ${this.selected.level}.`;
    }else this.message='Upgrade unavailable or insufficient cash.';
    this.hud.update();
  }
  sell(){
    if(!this.selected)return;
    const id=this.selected.id,refund=this.battle.sell(id);
    if(refund===null)return;
    const meshes=this.towerMeshes.get(id);disposeObject(meshes.model);disposeObject(meshes.beam);this.towerMeshes.delete(id);
    this.selected=null;this.range.visible=false;this.message=`Tower sold for ${refund} cash.`;this.hud.update();
  }
  restart(){
    if(this.app){this.app.go('battle');return;}
    if(!this.battle.restart())return;
    this.clearEntities();
    this.placing=false;
    this.selected=null;
    this.hasPoint=false;
    this.ghost.visible=false;
    this.range.visible=false;
    this.message='Fresh field. Place a defender, then start the wave.';
    this.hud.update();
  }
  clearEntities(){
    for(const {
      model,beam
    }
    of this.towerMeshes.values()){
      disposeObject(model);
      disposeObject(beam);
    }
    for(const m of this.enemyMeshes.values())disposeObject(m);
    for(const m of this.allyMeshes.values())disposeObject(m);this.allyMeshes.clear();
    this.towerMeshes.clear();
    this.enemyMeshes.clear();
  }
  point(clientX,clientY){
    if(this.intro>0)return;
    const r=this.canvas.getBoundingClientRect();
    this.pointer.set((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    this.hoveredEnemy=null;
    let enemyDistance=Infinity;
    for(const [id,model] of this.enemyMeshes){
      const hit=this.raycaster.intersectObject(model,true)[0];
      if(hit&&hit.distance<enemyDistance){this.hoveredEnemy=this.battle.enemies.find(e=>e.id===id)||null;enemyDistance=hit.distance;}
    }
    if(!this.hoveredEnemy){
      let closest=24*24;
      for(const [id,model] of this.enemyMeshes){
        this.hoverProbe.set(model.position.x,1.2+model.position.y,model.position.z).project(this.camera);
        if(this.hoverProbe.z< -1||this.hoverProbe.z>1)continue;
        const dx=(this.hoverProbe.x-this.pointer.x)*r.width*.5,dy=(this.hoverProbe.y-this.pointer.y)*r.height*.5,distance=dx*dx+dy*dy;
        if(distance<closest){closest=distance;this.hoveredEnemy=this.battle.enemies.find(e=>e.id===id)||null;}
      }
    }
    this.hud?.showEnemy(this.hoveredEnemy,clientX,clientY);
    this.hits.length=0;
    this.raycaster.intersectObject(this.terrain,false,this.hits);
    this.hasPoint=this.hits.length>0;
    if(this.hasPoint){
      this.x=this.hits[0].point.x;
      this.z=this.hits[0].point.z;
    }
    this.refreshPreview();
  }
  pointerOutside(){
    this.hasPoint=false;this.hoveredEnemy=null;this.hud?.showEnemy(null);
    this.refreshPreview();
  }
  refreshPreview(){
    if(!this.placing)return;
    this.ghost.visible=this.hasPoint;
    this.range.visible=this.hasPoint;
    const definition=this.definition;
    this.range.scale.setScalar(definition.range/TOWER.range);
    let reason=this.hasPoint?placementReason(this.x,this.z,this.battle.towers,this.battle.cash,definition,this.battle.segments):'Outside arena';
    this.message=reason?'× '+reason:'✓ Place here · '+definition.cost+' cash';
    if(this.hasPoint){
      this.ghost.position.set(this.x,0,this.z);
      this.range.position.set(this.x,.24,this.z);
      const color=reason?0xfa8571:0x9ef6c7;
      this.ghost.traverse(o=>{
        if(o.material)o.material.color.setHex(color);
      });
      this.range.material.color.setHex(color);
    }
    this.hud?.update();
  }
  click(){
    if(this.terminal||this.intro>0)return;
    if(this.placing){
      if(!this.hasPoint)return;
      const result=this.battle.place(this.x,this.z,this.towerId);
      if(result.ok){
        const model=createTowerMesh(false,result.tower.definition),beam=createBeam();
        model.scale.setScalar(1.35);

        const skin=this.mission?.towerSkins?.[this.towerId]||this.mission?.skin;
        if(skin&&skin!=='standard')model.traverse(o=>{if(o.material?.name==='uniform')o.material.color.setHex(SKINS[skin].color);});
        model.position.set(result.tower.x,0,result.tower.z);
        model.userData.towerId=result.tower.id;
        this.scene.add(model,beam);
        model.updateMatrixWorld(true);
        this.towerMeshes.set(result.tower.id,{
          model,beam
        });
        this.placing=false;
        this.ghost.visible=false;
        this.selected=result.tower;
        this.message=this.definition.name+' placed. Click another slot to build more.';
        this.showSelection();
      }
      else this.message='× '+result.reason;
      this.hud.update();
      return;
    }
    this.hits.length=0;
    for(const {
      model
    }
    of this.towerMeshes.values())this.raycaster.intersectObject(model,true,this.hits);
    this.hits.sort((a,b)=>a.distance-b.distance);
    if(this.hits.length){
      let root=this.hits[0].object;
      while(!root.userData.towerId&&root.parent)root=root.parent;
      this.selected=this.battle.towers.find(t=>t.id===root.userData.towerId);
      const d=this.selected.definition;this.message=d.name+' · level '+this.selected.level+' · '+this.selected.damageDone.toFixed(0)+' damage dealt';
    }
    else this.selected=null;
    this.showSelection();
    this.hud.update();
  }
  showSelection(){
    this.range.visible=!!this.selected;
    if(this.selected){
      this.range.scale.setScalar(towerStats(this.selected).range/TOWER.range);
      this.range.position.set(this.selected.x,.24,this.selected.z);
      this.range.material.color.setHex(0xb8f2cb);
    }
  }
  update(dt){
    if(this.input){const forward=this.input.axis('forward','back'),right=this.input.axis('right','left'),length=Math.hypot(forward,right)||1;
      const speed=WALK.speed*1.6*dt/length;
      this.walkX=THREE.MathUtils.clamp(this.walkX+(right*Math.cos(this.yaw)-forward*Math.sin(this.yaw))*speed,-ARENA.width/2+2,ARENA.width/2-2);
      this.walkZ=THREE.MathUtils.clamp(this.walkZ+(-forward*Math.cos(this.yaw)-right*Math.sin(this.yaw))*speed,-ARENA.depth/2+2,ARENA.depth/2-2);
      this.motionTime+=dt;
      if(this.avatar){
        const walking=!!(forward||right),stride=this.motionTime*10;
        this.avatar.position.y=walking?Math.abs(Math.sin(stride))*.06:0;
        this.avatar.userData.legs?.forEach((leg,i)=>leg.rotation.x=walking?Math.sin(stride+i*Math.PI)*.4:0);
        this.avatar.userData.arms?.forEach((arm,i)=>arm.rotation.x=-.65+(walking?Math.sin(stride+i*Math.PI)*.16:0));
      }
      this.updateCamera();
    }
    if(this.intro>0){this.intro=Math.max(0,this.intro-dt);this.message='Deployment flyover · tracing the approach to the relay';if(!this.intro)this.message=`Commander: Ground swarm inbound. Stop the ${FINAL_BOSSES[this.mission?.mode]||'final threat'} before it reaches the relay.`;this.hud.update();return;}
    const before=this.battle.state;
    this.battle.update(dt);
    const end=this.battle.lastWaveEnd;
    if(end&&end.wave!==this.seenWaveEnd){this.seenWaveEnd=end.wave;this.message=`Wave ${end.wave} ended (${end.reason}). +${end.bonus} wave cash. ${this.battle.wave<this.battle.totalWaves?'Next wave in 5 seconds.':''}`;}
    const clear=this.battle.lastClearBonus;
    if(clear&&clear.wave!==this.seenClearBonus){this.seenClearBonus=clear.wave;this.message=`Wave ${clear.wave} fully cleared. +${clear.amount} clear bonus.`;}
    if(before==='INTERMISSION'&&this.battle.state==='WAVE_ACTIVE')this.message=`Wave ${this.battle.wave} active. Enemies from earlier waves remain on the path.`;
    if(before!==this.battle.state&&this.terminal){
      this.placing=false;
      this.ghost.visible=false;
      this.range.visible=false;
      this.message=this.battle.state==='WON'?'Route secured. Press R or Restart to play again.':'Base breached. Press R or Restart to try a defense.';
      if(this.app&&!this.rewarded){
        this.rewarded=true;
        const before={...this.app.store.data};
        this.app.store.complete(this.battle,this.mission);
        const coinGain=this.app.store.data.coins-before.coins,gemGain=this.app.store.data.shards-before.shards;
        if(coinGain)this.app.ui.showCurrencyReward('coins',coinGain);
        else if(gemGain)this.app.ui.showCurrencyReward('gems',gemGain);
        this.hud.showResult({won:this.battle.state==='WON',wave:this.battle.wave,total:this.battle.totalWaves,elapsed:this.battle.elapsed,coins:this.app.store.data.coins-before.coins,gems:this.app.store.data.shards-before.shards,xp:this.app.store.data.xp-before.xp});
      }
    }
    this.hud.update();
  }
  render(renderer,alpha){
    this.updateCamera();
    if(this.intro>0)this.camera.position.y+=Math.sin(this.intro/OPERATION.flyoverSeconds*Math.PI)*2;
    for(const e of this.battle.enemies){
      let model=this.enemyMeshes.get(e.id);
      if(!model){
        model=createEnemyMesh(['fallen','hardcore','voidcore'].includes(this.mission?.mode),e);
        this.scene.add(model);
        this.enemyMeshes.set(e.id,model);
      }
      model.position.set(e.previousX+(e.x-e.previousX)*alpha,model.userData.flying?.6:0,e.previousZ+(e.z-e.previousZ)*alpha);
      if(e.x!==e.previousX||e.z!==e.previousZ)model.rotation.y=Math.atan2(e.x-e.previousX,e.z-e.previousZ);
      if(e.boss)model.scale.setScalar(1.7);
      if(model.userData.armor)model.userData.armor.visible=e.leadProtection>0;
      model.userData.health.visible=this.hoveredEnemy?.id===e.id;
      model.userData.health.scale.x=e.health/e.maxHealth;
      const stride=e.progress*(e.speed>4?5:3.5);
      model.userData.legs?.forEach((leg,i)=>leg.rotation.x=Math.sin(stride+i*Math.PI)*.48);
      model.userData.arms?.forEach((arm,i)=>arm.rotation.x=-.7-Math.sin(stride+i*Math.PI)*.26);
      if(model.userData.body)model.userData.body.position.y=Math.abs(Math.sin(stride))*.08;
      if(model.userData.flying)model.position.y=.55+Math.sin(this.motionTime*3+e.id)*.15;
    }
    for(const [id,model] of this.enemyMeshes){
      if(!this.battle.enemies.some(e=>e.id===id)){
        disposeObject(model);
        this.enemyMeshes.delete(id);
        if(this.hoveredEnemy?.id===id){this.hoveredEnemy=null;this.hud?.showEnemy(null);}
      }
    }
    for(const t of this.battle.towers){
      const {
        beam,model
      }
      =this.towerMeshes.get(t.id);
      const firing=t.beamRemaining>0&&['WAVE_ACTIVE','INTERMISSION'].includes(this.battle.state);
      model.rotation.x=firing?-.09*Math.min(1,t.beamRemaining/.12):0;
      model.position.y=firing?-.045*Math.sin(this.motionTime*30):0;
      beam.visible=firing;
      if(beam.visible){
        this.direction.set(t.targetX-t.x,.75-1.7,t.targetZ-t.z);
        const length=this.direction.length();
        beam.position.set((t.x+t.targetX)/2,1.225,(t.z+t.targetZ)/2);
        beam.scale.y=length;
        beam.quaternion.setFromUnitVectors(this.up,this.direction.divideScalar(length));
      }
    }
    for(const a of this.battle.allies){let m=this.allyMeshes.get(a.id);if(!m){m=createTowerMesh(false,TOWERS[a.towerId]);m.scale.setScalar(.65);this.scene.add(m);this.allyMeshes.set(a.id,m);}m.position.set(a.x,0,a.z);if(a.x!==a.previousX||a.z!==a.previousZ)m.rotation.y=Math.atan2(a.x-a.previousX,a.z-a.previousZ);}
    for(const [id,m] of this.allyMeshes)if(!this.battle.allies.some(a=>a.id===id)){disposeObject(m);this.allyMeshes.delete(id);}
    if(['WAVE_ACTIVE','INTERMISSION'].includes(this.battle.state)&&this.battle.enemies.length){
      for(const t of this.battle.towers)if(t.shotId)this.towerMeshes.get(t.id).model.rotation.y=Math.atan2(t.targetX-t.x,t.targetZ-t.z);
    }else for(const {model,beam} of this.towerMeshes.values()){model.rotation.y=0;beam.visible=false;}
    renderer.render(this.scene,this.camera);
    this.hud?.positionTowerPanel();
  }
  resize(width,height){
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    this.pointerOutside();
  }
  look(dx,dy){this.yaw-=dx;if(this.viewMode==='strategy')this.pitch=THREE.MathUtils.clamp(this.pitch+dy,.25,1.42);else this.firstPitch=THREE.MathUtils.clamp(this.firstPitch-dy,-1.25,1.25);this.updateCamera();}
  zoomBy(amount){if(this.viewMode==='first-person'){if(amount>0)this.toggleView();return;}this.distance=THREE.MathUtils.clamp(this.distance+amount,12,75);this.updateCamera();}
  toggleView(){this.viewMode=this.viewMode==='strategy'?'first-person':'strategy';if(this.app)this.app.viewMode=this.viewMode;this.updateCamera();this.hud?.update();}
  updateCamera(){
    if(!this.camera)return;
    if(this.avatar){
      this.avatar.visible=this.viewMode==='strategy';this.avatar.position.x=this.walkX;this.avatar.position.z=this.walkZ;
      this.avatar.rotation.y=this.yaw+Math.PI;
      this.avatar.userData.head.rotation.x=THREE.MathUtils.clamp((this.pitch-.72)*.7,-.32,.48);
    }
    if(this.viewMode==='first-person'){
      this.camera.position.set(this.walkX,WALK.eyeHeight,this.walkZ);
      this.camera.rotation.set(this.firstPitch,this.yaw,0);
      return;
    }
    const horizontal=this.distance*Math.cos(this.pitch);
    this.camera.position.set(this.walkX+Math.sin(this.yaw)*horizontal,2+this.distance*Math.sin(this.pitch),this.walkZ+Math.cos(this.yaw)*horizontal);
    this.camera.lookAt(this.walkX,0,this.walkZ);
  }
  chooseTower(id){if(!this.mission?.loadout.includes(id))return;this.towerId=id;this.place();}
  headquarters(){this.app?.returnToHeadquarters();}
  exit(){
    this.input.dispose();
    this.hud.dispose();
  }
  dispose(){
    this.clearEntities();
    disposeObject(this.scene);
    this.scene.traverse(o=>{
      if(o.shadow)o.shadow.dispose();
    });
  }
}
