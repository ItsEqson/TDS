import * as THREE from 'three';
import { createHeadquarters } from '../rendering/createHeadquarters.js';
import { createStaging,STAGING_STATIONS } from '../rendering/createStaging.js';
import { createTowerMesh,disposeObject } from '../rendering/createMeshes.js';
import { TOWERS } from '../data/towers.js';
import { WalkInput } from '../core/WalkInput.js';
import { WALK,STATIONS } from '../data/headquarters.js';
import { moveWalker } from '../gameplay/Walking.js';
export class LobbyScene {
  constructor(canvas,app,prep=false,pose=null){this.canvas=canvas;this.app=app;this.prep=prep;this.pose=pose?{...pose}:{x:0,z:7,yaw:0,pitch:.88};this.firstPitch=0;this.viewMode=app.viewMode;this.time=0;}
  init(){
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(this.app.fov,1,.1,180);this.camera.rotation.order='YXZ';
    Object.assign(this,this.prep?createStaging(this.scene,this.app.map):createHeadquarters(this.scene,false,this.app.store.data,this.app.map));
    this.avatar=createTowerMesh(false,{...TOWERS['signal-captain'],color:0x51a7c2});this.avatar.scale.setScalar(1.1);this.scene.add(this.avatar);this.updateCamera();
  }
  enter(){this.input=new WalkInput(this.canvas,this,document.querySelector('#walk-pad'));this.app.ui.setViewMode(this.viewMode);}
  look(dx,dy){if(this.app.ui.isOpen)return;this.pose.yaw-=dx;if(this.viewMode==='strategy')this.pose.pitch=THREE.MathUtils.clamp(this.pose.pitch+dy,.25,1.42);else this.firstPitch=THREE.MathUtils.clamp(this.firstPitch-dy,-1.2,1.2);this.updateCamera();}
  zoom(delta){if(this.viewMode==='first-person'){if(delta>0)this.toggleView();return;}this.app.setZoom(this.app.zoom+Math.sign(delta)*3);}
  toggleView(){this.viewMode=this.viewMode==='strategy'?'first-person':'strategy';this.app.viewMode=this.viewMode;this.app.ui.setViewMode(this.viewMode);this.updateCamera();}
  updateCamera(){
    const {x,z,yaw,pitch}=this.pose;
    if(this.overhead)this.overhead.visible=this.viewMode==='first-person';
    if(this.avatar){this.avatar.visible=this.viewMode==='strategy';this.avatar.position.x=x;this.avatar.position.z=z;this.avatar.rotation.y=yaw+Math.PI;this.avatar.userData.head.rotation.x=THREE.MathUtils.clamp((pitch-.72)*.7,-.32,.48);}
    if(this.viewMode==='strategy'){
      const horizontal=this.app.zoom*Math.cos(pitch);
      this.camera.position.set(x+Math.sin(yaw)*horizontal,2+this.app.zoom*Math.sin(pitch),z+Math.cos(yaw)*horizontal);
      this.camera.lookAt(x,0,z);
    }else{this.camera.position.set(x,WALK.eyeHeight,z);this.camera.rotation.set(this.firstPitch,yaw,0);}
  }
  interact(){if(this.app.ui.isOpen)return;if(this.near)this.app.ui.open(this.near.id);}
  setMap(map){if(this.prep&&this.mapPlate)this.mapPlate.material.color.setHex(map.color);}
  update(dt){
    this.time+=dt;
    if(!this.app.ui.isOpen){
      const i=this.input;this.look(i.axis('turnRight','turnLeft')*WALK.turnSpeed*dt,i.axis('lookDown','lookUp')*WALK.turnSpeed*dt);
      const forward=i.axis('forward','back'),right=i.axis('right','left');moveWalker(this.pose,forward,right,dt,this.obstacles);
      const stride=this.time*10,walking=!!(forward||right);
      this.avatar.position.y=walking?Math.abs(Math.sin(stride))*.06:0;
      this.avatar.userData.legs?.forEach((leg,index)=>leg.rotation.x=walking?Math.sin(stride+index*Math.PI)*.4:0);
      this.avatar.userData.arms?.forEach((arm,index)=>arm.rotation.x=-.65+(walking?Math.sin(stride+index*Math.PI)*.16:0));
      const p=this.pose;
      if(!this.prep&&p.x<-18&&p.z>17&&!this.app.store.data.secret){this.app.store.discover();this.app.ui.notify('Service log discovered · +30 coins. Check the Archive.');}
    }
    this.updateCamera();
    const p=this.pose;this.near=(this.prep?STAGING_STATIONS:STATIONS).find(s=>Math.hypot(s.x-p.x,s.z-p.z)<7);
    this.app.ui.setPrompt(this.near?'E · '+this.near.name:this.prep?'Island staging · choose map and loadout':'WASD move · drag look · wheel zoom');
    if(!this.app.reducedMotion)for(const r of this.rotors){if(r.type==='tower')r.object.rotation.y+=dt*.4;if(r.type==='ring')r.object.rotation.z+=dt*.25;if(r.type==='screen')r.object.scale.y=.7+Math.sin(this.time+r.phase)*.3;if(r.type==='carrier')r.object.position.set(Math.sin(this.time*.14)*17,7.5,6);}
  }
  render(renderer){renderer.render(this.scene,this.camera);}
  resize(w,h){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  exit(){this.input.dispose();}
  dispose(){disposeObject(this.scene);}
}
