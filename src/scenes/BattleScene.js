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
    this.placing=false;
    this.selected=null;
    this.message='Place a defender near the inner bend, then start the wave.';
    this.pointer=new THREE.Vector2();
    this.raycaster=new THREE.Raycaster();
    this.hits=[];
    this.towerMeshes=new Map();
    this.enemyMeshes=new Map();this.allyMeshes=new Map();
    this.direction=new THREE.Vector3();
    this.up=new THREE.Vector3(0,1,0);
    this.hasPoint=false;this.yaw=0;this.pitch=-.22;this.hoveredEnemy=null;
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
    this.walkX=0;this.walkZ=15;this.camera.position.set(this.walkX,WALK.eyeHeight,this.walkZ);
    this.camera.rotation.set(this.pitch,this.yaw,0);
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

        if(this.mission&&this.mission.skin!=='standard')model.traverse(o=>{if(o.material?.name==='uniform')o.material.color.setHex(SKINS[this.mission.skin].color);});
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
      const speed=WALK.speed*dt/length;
      this.walkX=THREE.MathUtils.clamp(this.walkX+(right*Math.cos(this.yaw)-forward*Math.sin(this.yaw))*speed,-ARENA.width/2+1,ARENA.width/2-1);
      this.walkZ=THREE.MathUtils.clamp(this.walkZ+(-forward*Math.cos(this.yaw)-right*Math.sin(this.yaw))*speed,-ARENA.depth/2+1,ARENA.depth/2-1);
      this.updateCamera();
    }
    if(this.intro>0){this.intro=Math.max(0,this.intro-dt);this.message='Deployment flyover · tracing the approach to the relay';if(!this.intro)this.message=`Commander: Ground swarm inbound. Stop the ${FINAL_BOSSES[this.mission?.mode]||'final threat'} before it reaches the relay.`;this.hud.update();return;}
    const before=this.battle.state;
    this.battle.update(dt);
    if(before==='WAVE_ACTIVE'&&this.battle.state==='PREP')this.message=`Wave ${this.battle.wave-1} cleared. +${20+(this.battle.wave-1)*12} cash. Prepare for wave ${this.battle.wave}.`;
    if(before!==this.battle.state&&this.terminal){
      this.placing=false;
      this.ghost.visible=false;
      this.range.visible=false;
      this.message=this.battle.state==='WON'?'Route secured. Press R or Restart to play again.':'Base breached. Press R or Restart to try a defense.';
      if(this.app&&!this.rewarded){this.rewarded=true;const reward=this.app.store.complete(this.battle,this.mission);this.message+=` ${reward?`+${reward} account coins. `:''}Experience and mode rewards added to your profile.`;}
    }
    this.hud.update();
  }
  render(renderer,alpha){
    this.updateCamera();
    if(this.intro>0)this.camera.position.y+=Math.sin(this.intro/OPERATION.flyoverSeconds*Math.PI)*2;
    for(const e of this.battle.enemies){
      let model=this.enemyMeshes.get(e.id);
      if(!model){
        model=createEnemyMesh(['fallen','hardcore','voidcore'].includes(this.mission?.mode));
        this.scene.add(model);
        this.enemyMeshes.set(e.id,model);
      }
      model.position.set(e.previousX+(e.x-e.previousX)*alpha,0,e.previousZ+(e.z-e.previousZ)*alpha);
      if(e.x!==e.previousX||e.z!==e.previousZ)model.rotation.y=Math.atan2(e.x-e.previousX,e.z-e.previousZ);
      if(e.boss)model.scale.setScalar(1.7);
      model.userData.health.visible=this.hoveredEnemy?.id===e.id;
      model.userData.health.scale.x=e.health/e.maxHealth;
      model.userData.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(e.progress*3+i*Math.PI)*.32);
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
        beam
      }
      =this.towerMeshes.get(t.id);
      beam.visible=t.beamRemaining>0&&!this.terminal;
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
    for(const t of this.battle.towers)if(t.shotId)this.towerMeshes.get(t.id).model.rotation.y=Math.atan2(t.targetX-t.x,t.targetZ-t.z);
    renderer.render(this.scene,this.camera);
    this.hud?.positionTowerPanel();
  }
  resize(width,height){
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    this.pointerOutside();
  }
  look(dx,dy){this.yaw-=dx;this.pitch=THREE.MathUtils.clamp(this.pitch-dy,-1.25,1.25);}
  updateCamera(){const d=this.app?.zoom||0;if(this.avatar){this.avatar.visible=d>1;this.avatar.position.set(this.walkX,0,this.walkZ);this.avatar.rotation.y=this.yaw+Math.PI;}if(d>0){this.camera.position.set(this.walkX+Math.sin(this.yaw)*d,WALK.eyeHeight+d*.26,this.walkZ+Math.cos(this.yaw)*d);this.camera.lookAt(this.walkX-Math.sin(this.yaw)*2,WALK.eyeHeight-Math.sin(this.pitch)*2,this.walkZ-Math.cos(this.yaw)*2);}else{this.camera.position.set(this.walkX,WALK.eyeHeight,this.walkZ);this.camera.rotation.set(this.pitch,this.yaw,0);}}
  chooseTower(id){if(!this.mission?.loadout.includes(id))return;this.towerId=id;this.place();}
  headquarters(){this.app?.go('hq');}
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
