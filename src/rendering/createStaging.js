import * as THREE from 'three';
import { material,mesh,createTowerMesh } from './createMeshes.js';
import { sign } from './createHeadquarters.js';
import { MAPS } from '../data/headquarters.js';
import { TOWERS } from '../data/towers.js';

export const STAGING_STATIONS=Object.freeze([
  {id:'briefing',name:'MAP TABLE',x:0,z:-12},
  {id:'inventory',name:'FIELD ARMORY',x:-12,z:0},
  {id:'rewards',name:'SUPPLY DESK',x:12,z:0}
]);

export function createStaging(scene,map){
  scene.background=new THREE.Color(0x24405c);scene.fog=new THREE.Fog(0x24405c,38,90);
  scene.add(new THREE.HemisphereLight(0xd8f6ff,0x3d465b,2.5));
  const light=new THREE.DirectionalLight(0xffd5a1,2.5);light.position.set(-8,18,10);scene.add(light);
  const root=new THREE.Group();scene.add(root);
  const floor=material(0x426b7f),wall=material(0x23435c),trim=material(0x78a9b7),gold=material(0xffca73),cyan=new THREE.MeshBasicMaterial({color:0x65e5d5});
  const box=(w,h,d,mat,x,y,z)=>mesh(root,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  box(46,.4,46,floor,0,-.25,0);
  for(let n=-20;n<=20;n+=5){box(.07,.03,43,trim,n,.01,0);box(43,.03,.07,trim,0,.01,n);}
  for(const x of [-23,23]){box(.7,10,46,wall,x,5,0);for(const z of [-18,-6,6,18]){box(.9,9,1,trim,x,4.5,z);box(.12,5,.7,cyan,x,4,z);}}
  for(const z of [-23,23])box(46,10,.7,wall,0,5,z);
  for(const x of [-17,17])for(const z of [-17,17]){box(1.2,8,1.2,trim,x,4,z);box(1.25,.18,1.25,gold,x,7.8,z);}
  for(let n=-18;n<20;n+=6){box(2,.035,.12,gold,0,.02,n);box(.12,.035,2,gold,n,.02,-2);}
  sign(root,'EXPEDITION HALL',0,7.5,-21,'#ffe2a2',12);
  const obstacles=[],rotors=[];
  // A physical map table, armory and supplies make preparation spatial.
  box(8,1.7,5,wall,0,.85,-12);box(8.3,.18,5.3,trim,0,1.78,-12);
  const mapPlate=mesh(root,new THREE.BoxGeometry(6,.08,3.6),material(map.color),0,1.95,-12);rotors.push({object:mapPlate,type:'screen',phase:0});
  sign(root,'MAPS / ROUTES',0,4,-17,'#90fff0',7);obstacles.push({x:0,z:-12,radius:4.8});
  for(let i=0;i<MAPS.length;i++){
    const x=-2.5+(i%2)*5,z=-13.1+Math.floor(i/2)*2.1;
    const p=mesh(root,new THREE.BoxGeometry(3,.15,1.25),material(MAPS[i].color),x,2.08,z);p.rotation.y=.12*(i%2?1:-1);
  }
  box(6,2,4,wall,-12,1,0);box(6.2,.15,4.2,gold,-12,2.08,0);sign(root,'LOADOUT',-12,4.5,-2,'#ffd992',5);obstacles.push({x:-12,z:0,radius:4});
  for(let i=0;i<3;i++){const id=['prism-sentry','longwatch','blast-courier'][i],tower=createTowerMesh(false,TOWERS[id]);tower.position.set(-14+i*2,2.15,0);tower.scale.setScalar(.85);root.add(tower);rotors.push({object:tower,type:'tower'});}
  box(6,1.8,4,wall,12,.9,0);box(6.2,.15,4.2,cyan,12,1.9,0);sign(root,'SUPPLIES',12,4.5,-2,'#92fce5',5);obstacles.push({x:12,z:0,radius:4});
  for(let i=0;i<5;i++)box(.75,.65,.75,i%2?gold:trim,10+i,2.3,0);
  for(const x of [-4,4])box(.7,7,1.5,trim,x,3.5,-21);box(8.7,.7,1.5,trim,0,7,-21);box(7.2,5,.1,cyan,0,3.5,-22);
  sign(root,'DEPLOY',0,5.2,-20,'#1e3653',6);
  for(let i=0;i<12;i++){const x=-18+i*3.3;box(.8,.55,.8,i%3?trim:gold,x,.28,18);}
  return {root,obstacles,rotors,mapPlate};
}
