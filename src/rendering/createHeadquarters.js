import * as THREE from 'three';
import { material,mesh,createTowerMesh } from './createMeshes.js';
import { STATIONS } from '../data/headquarters.js';
export function sign(parent,text,x,y,z,color='#c5eee8',width=5){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#0c1c2b';ctx.fillRect(0,0,1024,128);ctx.font='600 58px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,512,68);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return mesh(parent,new THREE.PlaneGeometry(width,width/8),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}),x,y,z);
}
export function createHeadquarters(scene,prep,profile,map){
  scene.background=new THREE.Color(0x101c2b);scene.fog=new THREE.Fog(0x101c2b,30,75);
  scene.add(new THREE.HemisphereLight(0xc4e5ff,0x3a414f,2.3));
  const sun=new THREE.DirectionalLight(0xffe1b0,2.6);sun.position.set(4,18,8);scene.add(sun);
  const root=new THREE.Group();scene.add(root);
  const dark=material(0x172837),steel=material(0x344959),floor=material(0x273b49),white=material(0xa1b4b8);
  const glow=new THREE.MeshBasicMaterial({color:0x8cddcf}),gold=new THREE.MeshBasicMaterial({color:0xf5bd77});
  const box=(w,h,d,mat,x,y,z)=>mesh(root,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  box(46,.3,46,floor,0,-.2,0);
  for(let i=-22;i<=22;i+=4){box(.035,.02,44,steel,i,0,0);box(44,.02,.035,steel,0,0,i);}
  box(46,10,.8,dark,0,5,-23);box(46,10,.8,dark,0,5,23);box(.8,10,46,dark,-23,5,0);box(.8,10,46,dark,23,5,0);
  for(const x of [-21,21])for(const z of [-20,-10,0,10,20]){box(1,10,1,steel,x,5,z);box(.08,7,1.04,glow,x,4,z);}
  for(const z of [-18,-6,6,18]){box(44,.45,.6,steel,0,9,z);box(28,.06,.25,white,0,8.7,z);}
  for(const x of [-3,3])box(.08,.03,35,glow,x,.03,0);
  const obstacles=[],rotors=[],stations=prep?[{id:'briefing',name:'MISSION BRIEFING',x:0,z:-11,color:0x8cddcf}]:STATIONS;
  for(const s of stations){
    const group=new THREE.Group();group.position.set(s.x,0,s.z);group.rotation.y=Math.atan2(-s.x,-s.z);root.add(group);
    const mat=new THREE.MeshBasicMaterial({color:s.color});
    mesh(group,new THREE.BoxGeometry(7,.3,4),steel,0,.1,0);
    mesh(group,new THREE.BoxGeometry(6,3,.6),dark,0,1.6,-1.2);
    mesh(group,new THREE.BoxGeometry(6,.09,.1),mat,0,3.2,-.84);
    sign(group,s.name,0,4,-.7,'#'+s.color.toString(16),6);
    for(const x of [-3.4,3.4])mesh(group,new THREE.BoxGeometry(.28,5,.35),steel,x,2.5,-1);
    for(let i=0;i<7;i++){const bar=mesh(group,new THREE.BoxGeometry(.35,.3+i%3*.3,.08),mat,-2.2+i*.7,1.5,-.85);rotors.push({object:bar,type:'screen',phase:i});}
    const t=createTowerMesh();t.position.set(0,.4,1);t.scale.setScalar(.65);group.add(t);rotors.push({object:t,type:'tower'});
    obstacles.push({x:s.x,z:s.z,radius:3.8});
  }
  // Deployment portal is an actual lit volume behind the operations terminal.
  for(const x of [-4.4,4.4])box(.6,7,1.8,steel,x,3.5,-20);
  box(9.4,.6,1.8,steel,0,7,-20);box(7.8,5.8,.2,glow,0,3.2,-22);
  sign(root,prep?'READY FOR TRANSFER':'COPPER REACH / COMMAND',0,8,-21,'#e0ebe7',12);
  const ring=mesh(root,new THREE.TorusGeometry(2,.06,6,64),gold,0,6,-20);rotors.push({object:ring,type:'ring'});
  // Freight carrier overhead and rotating machinery keep the unoccupied base active.
  const carrier=new THREE.Group();root.add(carrier);
  mesh(carrier,new THREE.BoxGeometry(2,.7,1.2),white);mesh(carrier,new THREE.BoxGeometry(1,.14,1.4),gold,0,-.45,0);rotors.push({object:carrier,type:'carrier'});
  for(const x of [-19,19])for(const z of [-18,18]){box(2,2,2,steel,x,1,z);box(2.05,.12,2.05,gold,x,1.4,z);}
  if(profile.wins){const trophy=mesh(root,new THREE.OctahedronGeometry(1.1),gold,0,4,17);rotors.push({object:trophy,type:'tower'});}
  sign(root,'SERVICE ACCESS / 07',-20,2.5,20,'#7691a4',3);
  let hologram=null;
  if(prep){
    box(11,1.1,8,dark,0,.55,0);box(11.2,.08,8.2,steel,0,1.15,0);for(const x of [-5.5,5.5])box(.06,.04,8.1,glow,x,1.22,0);for(const z of [-4,4])box(11,.04,.06,glow,0,1.22,z);obstacles.push({x:0,z:0,radius:5.8});
    hologram=new THREE.Group();hologram.position.set(0,1.3,0);hologram.scale.setScalar(.32);root.add(hologram);
    const mat=new THREE.MeshBasicMaterial({color:map.color,wireframe:true});mesh(hologram,new THREE.BoxGeometry(28,.3,20),mat);
    const pathMat=new THREE.MeshBasicMaterial({color:0xd2ffec});
    for(let i=1;i<map.path.length;i++){const a=map.path[i-1],b=map.path[i];const road=mesh(hologram,new THREE.BoxGeometry(1.8,.35,Math.hypot(b.x-a.x,b.z-a.z)),pathMat,(a.x+b.x)/2,.4,(a.z+b.z)/2);road.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);}
    sign(root,map.name.toUpperCase(),0,5,-10,'#d1edea',8);
    if(map.id==='frostline')for(let i=0;i<14;i++)mesh(root,new THREE.ConeGeometry(.3,.8,4),white,-6+i,7,-20);
  }
  return {root,obstacles,rotors,hologram};
}
