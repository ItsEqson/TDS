import * as THREE from 'three';
import { createHeadquarters } from '../rendering/createHeadquarters.js';
import { createStaging,STAGING_STATIONS } from '../rendering/createStaging.js';
import { createTowerMesh,disposeObject } from '../rendering/createMeshes.js';
import { TOWERS } from '../data/towers.js';
import { WalkInput } from '../core/WalkInput.js';
import { WALK,STATIONS } from '../data/headquarters.js';
import { moveWalker } from '../gameplay/Walking.js';
export class LobbyScene {
  constructor(canvas,app,prep=false,pose=null){this.canvas=canvas;this.app=app;this.prep=prep;this.pose=pose?{...pose}:{x:0,z:7,yaw:0,pitch:0};this.time=0;}
  init(){
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(this.app.fov,1,.1,100);this.camera.rotation.order='YXZ';this.camera.position.set(this.pose.x,WALK.eyeHeight,this.pose.z);this.camera.rotation.set(this.pose.pitch,this.pose.yaw,0);
    Object.assign(this,this.prep?createStaging(this.scene,this.app.map):createHeadquarters(this.scene,false,this.app.store.data,this.app.map));
    this.avatar=createTowerMesh(false,{...TOWERS['signal-captain'],color:0x51a7c2});this.avatar.scale.setScalar(1.1);this.scene.add(this.avatar);
  }
  enter(){this.input=new WalkInput(this.canvas,this,document.querySelector('#walk-pad'));}
  look(dx,dy){if(this.app.ui.isOpen)return;this.pose.yaw-=dx;this.pose.pitch=THREE.MathUtils.clamp(this.pose.pitch-dy,-1.2,1.2);}
  zoom(delta){this.app.setZoom(this.app.zoom+Math.sign(delta)*1.5);}
  updateCamera(){
    const {x,z,yaw,pitch}=this.pose,d=this.app.zoom;
    if(this.avatar){this.avatar.visible=d>1;this.avatar.position.set(x,0,z);this.avatar.rotation.y=yaw+Math.PI;}
    if(d>0){this.camera.position.set(THREE.MathUtils.clamp(x+Math.sin(yaw)*d,-21,21),WALK.eyeHeight+d*.26,THREE.MathUtils.clamp(z+Math.cos(yaw)*d,-21,21));this.camera.lookAt(x-Math.sin(yaw)*2,WALK.eyeHeight-Math.sin(pitch)*2,z-Math.cos(yaw)*2);}
    else{this.camera.position.set(x,WALK.eyeHeight,z);this.camera.rotation.set(pitch,yaw,0);}
  }
  interact(){if(this.app.ui.isOpen)return;if(this.prep)this.app.ui.open('briefing');else if(this.near)this.app.ui.open(this.near.id);}
  setMap(map){if(this.prep&&this.mapPlate)this.mapPlate.material.color.setHex(map.color);}
  update(dt){
    this.time+=dt;
    if(!this.app.ui.isOpen){
      const i=this.input;this.look(i.axis('turnRight','turnLeft')*WALK.turnSpeed*dt,i.axis('lookDown','lookUp')*WALK.turnSpeed*dt);
      moveWalker(this.pose,i.axis('forward','back'),i.axis('right','left'),dt,this.obstacles);
      const p=this.pose;
      if(!this.prep&&p.x<-18&&p.z>17&&!this.app.store.data.secret){this.app.store.discover();this.app.ui.notify('Service log discovered · +30 coins. Check the Archive.');}
    }
    this.updateCamera();
    const p=this.pose;this.near=(this.prep?STAGING_STATIONS:STATIONS).find(s=>Math.hypot(s.x-p.x,s.z-p.z)<7);
    this.app.ui.setPrompt(this.prep?'Staging lobby · choose map and loadout, then deploy':this.near?'E · '+this.near.name:'WASD to walk · right-drag to look · wheel to zoom');
    if(!this.app.reducedMotion)for(const r of this.rotors){if(r.type==='tower')r.object.rotation.y+=dt*.4;if(r.type==='ring')r.object.rotation.z+=dt*.25;if(r.type==='screen')r.object.scale.y=.7+Math.sin(this.time+r.phase)*.3;if(r.type==='carrier')r.object.position.set(Math.sin(this.time*.14)*17,7.5,6);}
  }
  render(renderer){renderer.render(this.scene,this.camera);}
  resize(w,h){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  exit(){this.input.dispose();}
  dispose(){disposeObject(this.scene);}
}
