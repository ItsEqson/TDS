import * as THREE from 'three';
import { ARENA, WAYPOINTS, SEGMENTS } from '../data/arena.js';
import { material, mesh } from './createMeshes.js';
import { surfaceMaterial } from './surfaceMaterial.js';
export function createWorld(scene,map=null){
  const points=map?.path||WAYPOINTS;
  const segments=points.slice(1).map((end,i)=>({start:points[i],end,length:Math.hypot(end.x-points[i].x,end.z-points[i].z)}));
  const world=new THREE.Group();
  scene.add(world);
  const frozen=map?.id==='frostline',ember=map?.id==='ember-pass',garden=map?.id==='verdant-loop';
  const ground=surfaceMaterial(frozen?0x91dbea:ember?0xca815e:garden?0x58bb78:0x48b997,'terrain',9),rock=surfaceMaterial(ember?0x75435c:0x364675,'grain',7),road=surfaceMaterial(frozen?0xd5e5ff:ember?0xe7b47d:0xf3ca87,'grain',6),edge=material(ember?0xffe27b:0xffa741),dark=material(0x263960),pale=material(0xd8eaff),glow=material(frozen?0x9ff4ff:0x43ffe2);
  mesh(world,new THREE.BoxGeometry(ARENA.width,1.3,ARENA.depth),rock,0,-.7);
  const terrain=mesh(world,new THREE.BoxGeometry(ARENA.width,.18,ARENA.depth),ground,0,-.09);
  // Distant physical scenery gives the first-person field a horizon without expanding placement.
  mesh(world,new THREE.BoxGeometry(110,1,90),rock,0,-1.45);
  const distant=material(frozen?0x79abc2:ember?0x935d59:garden?0x357969:0x477970);
  for(let i=0;i<28;i++){
    const side=i%4,offset=-48+(i*17%96),x=side<2?offset:side===2?-39:39,z=side<2?(side===0?-31:31):offset;
    const height=2+(i%5)*.8;
    if(ember)mesh(world,new THREE.CylinderGeometry(.7,1.5,height,5),distant,x,height/2-1,z);
    else if(frozen)mesh(world,new THREE.ConeGeometry(1.6,height,5),distant,x,height/2-1,z);
    else{mesh(world,new THREE.CylinderGeometry(.18,.28,1.3,5),dark,x,-.3,z);mesh(world,new THREE.ConeGeometry(1.2,height,5),distant,x,height/2,z);}
  }
  for(const s of segments){
    const r=mesh(world,new THREE.BoxGeometry(ARENA.roadWidth,.18,s.length),road,(s.start.x+s.end.x)/2,.09,(s.start.z+s.end.z)/2);
    r.rotation.y=Math.atan2(s.end.x-s.start.x,s.end.z-s.start.z);
  }
  for(const p of points)mesh(world,new THREE.CylinderGeometry(ARENA.roadWidth/2,ARENA.roadWidth/2,.18,16),road,p.x,.09,p.z);
  // Small physical route studs reinforce direction without screen-space map art.
  for(const s of segments)for(let d=1;d<s.length;d+=2){
    const f=d/s.length;
    mesh(world,new THREE.BoxGeometry(.14,.04,.14),edge,s.start.x+(s.end.x-s.start.x)*f,.2,s.start.z+(s.end.z-s.start.z)*f);
  }
  const end=points.at(-1);
  mesh(world,new THREE.CylinderGeometry(1,1.2,.45,6),dark,end.x,.35,end.z);
  mesh(world,new THREE.CylinderGeometry(.72,.9,1.5,6),pale,end.x,1.2,end.z);
  mesh(world,new THREE.OctahedronGeometry(.65),glow,end.x,2.25,end.z);
  const start=points[0];
  // Border dressing leaves the placement field and tactical road unobstructed.
  const foliage=material(frozen?0x72a7ed:0x238665),tips=material(frozen?0xc3f9ff:0x8bdb63),trunk=material(0x845d63);
  for(let i=0;i<32;i++){
    const x=-26+i*1.65,z=i%2===0?-18.8:18.8;
    mesh(world,new THREE.CylinderGeometry(.09,.14,.65,5),trunk,x,.3,z);
    if(ember){mesh(world,new THREE.DodecahedronGeometry(.8+(i%3)*.25,0),rock,x,.55,z);mesh(world,new THREE.ConeGeometry(.2,.65,5),edge,x,1.4,z);}
    else{mesh(world,new THREE.ConeGeometry(.65,1.4,5),foliage,x,1.05,z);mesh(world,new THREE.ConeGeometry(.42,.9,5),tips,x,1.72,z);}
    mesh(world,new THREE.DodecahedronGeometry(.24,0),rock,x+.7,.15,z);
  }
  for(const z of [-20,20])mesh(world,new THREE.BoxGeometry(56,.1,.08),glow,0,-.25,z);
  for(const x of [-27.7,27.7])mesh(world,new THREE.BoxGeometry(.08,.1,40),glow,x,-.25,0);
  for(let i=0;i<18;i++){const x=-24+i*2.8,z=i%2?-17:17;mesh(world,new THREE.CylinderGeometry(.1,.15,1.4,6),dark,x,.7,z);mesh(world,new THREE.OctahedronGeometry(.28),glow,x,1.55,z);}
  for(const z of [-1.2,1.2])mesh(world,new THREE.BoxGeometry(.3,1.8,.3),dark,start.x,.9,start.z+z);
  mesh(world,new THREE.BoxGeometry(.3,.25,2.7),edge,start.x,1.85,start.z);
  scene.add(new THREE.HemisphereLight(0xeaf7ea,0x253839,2.5));
  const sun=new THREE.DirectionalLight(0xffe7c2,3);
  sun.position.set(-10,22,8);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{
    left:-32,right:32,top:26,bottom:-26,near:1,far:90
  });
  sun.shadow.bias=-.0005;
  scene.add(sun);
  return {
    world,terrain
  };
}
