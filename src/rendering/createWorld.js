import * as THREE from 'three';
import { ARENA, WAYPOINTS, SEGMENTS } from '../data/arena.js';
import { material, mesh } from './createMeshes.js';
import { surfaceMaterial } from './surfaceMaterial.js';
export function createWorld(scene,map=null){
  const points=map?.path||WAYPOINTS;
  const segments=points.slice(1).map((end,i)=>({start:points[i],end,length:Math.hypot(end.x-points[i].x,end.z-points[i].z)}));
  const world=new THREE.Group();
  scene.add(world);
  const frozen=map?.id==='frostline';
  const ground=surfaceMaterial(frozen?0x8ddaea:0x43b58a,'terrain',6),rock=surfaceMaterial(0x364675,'grain',5),road=surfaceMaterial(frozen?0xc7daff:0xf3ca87,'grain',4),edge=material(0xffa741),dark=material(0x263960),pale=material(0xd8eaff),glow=material(0x43ffe2);
  mesh(world,new THREE.BoxGeometry(ARENA.width,1.3,ARENA.depth),rock,0,-.7);
  const terrain=mesh(world,new THREE.BoxGeometry(ARENA.width,.18,ARENA.depth),ground,0,-.09);
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
  for(let i=0;i<16;i++){
    const x=-13+i*1.75,z=i%2===0?-9.5:9.5;
    mesh(world,new THREE.CylinderGeometry(.09,.14,.65,5),trunk,x,.3,z);
    mesh(world,new THREE.ConeGeometry(.55,1.1,5),foliage,x,1,z);
    mesh(world,new THREE.ConeGeometry(.36,.75,5),tips,x,1.5,z);
    mesh(world,new THREE.DodecahedronGeometry(.2,0),rock,x+.65,.15,z);
  }
  for(const z of [-10,10])mesh(world,new THREE.BoxGeometry(28,.1,.08),glow,0,-.25,z);
  for(const z of [-1.2,1.2])mesh(world,new THREE.BoxGeometry(.3,1.8,.3),dark,start.x,.9,start.z+z);
  mesh(world,new THREE.BoxGeometry(.3,.25,2.7),edge,start.x,1.85,start.z);
  scene.add(new THREE.HemisphereLight(0xeaf7ea,0x253839,2.5));
  const sun=new THREE.DirectionalLight(0xffe7c2,3);
  sun.position.set(-10,22,8);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{
    left:-20,right:20,top:20,bottom:-20,near:1,far:60
  });
  sun.shadow.bias=-.0005;
  scene.add(sun);
  return {
    world,terrain
  };
}
