import * as THREE from 'three';
import { material,mesh,createTowerMesh } from './createMeshes.js';
import { sign } from './createHeadquarters.js';
import { MAPS } from '../data/headquarters.js';
import { TOWERS } from '../data/towers.js';

export const STAGING_STATIONS=Object.freeze([
  {id:'maps',name:'MAP TABLE',x:0,z:-12},
  {id:'inventory',name:'FIELD ARMORY',x:-12,z:0},
]);

export function createStaging(scene,map){
  scene.background=new THREE.Color(0x8ed0e1);scene.fog=new THREE.Fog(0x8ed0e1,75,170);
  scene.add(new THREE.HemisphereLight(0xd8f6ff,0x3d465b,2.5));
  const light=new THREE.DirectionalLight(0xffd5a1,2.5);light.position.set(-8,18,10);scene.add(light);
  const root=new THREE.Group();scene.add(root);
  const floor=material(0x4d7388),wall=material(0x23435c),trim=material(0x78a9b7),gold=material(0xffca73),cyan=new THREE.MeshBasicMaterial({color:0x65e5d5});
  const box=(w,h,d,mat,x,y,z)=>mesh(root,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  const sea=new THREE.MeshStandardMaterial({color:0x278fa9,roughness:.24,metalness:.22});
  mesh(root,new THREE.PlaneGeometry(320,320),sea,0,-2.2,0).rotation.x=-Math.PI/2;
  const sand=material(0xd6c596),grass=material(0x72a97b),foam=new THREE.MeshBasicMaterial({color:0xbde7dc});
  mesh(root,new THREE.CylinderGeometry(34,38,2,48),sand,0,-1.3,0);
  mesh(root,new THREE.CylinderGeometry(30,33,.35,48),grass,0,-.18,0);
  mesh(root,new THREE.TorusGeometry(34.2,.24,6,64),foam,0,-1.95,0).rotation.x=Math.PI/2;
  box(46,.4,46,floor,0,-.25,0);
  for(const [x,z,color] of [[0,-12,0x397e86],[-12,0,0x937456],[12,0,0x966b80],[0,13,0x637e61]]){
    const tile=material(color);mesh(root,new THREE.CylinderGeometry(7,7,.05,12),tile,x,0,z);
    mesh(root,new THREE.TorusGeometry(6.8,.08,6,48),gold,x,.05,z).rotation.x=Math.PI/2;
  }
  for(let n=-20;n<=20;n+=5){box(.07,.03,43,trim,n,.01,0);box(43,.03,.07,trim,0,.01,n);}
  // Low railings preserve the open island view from both camera modes.
  for(const x of [-22.8,22.8]){box(.35,.8,46,trim,x,.45,0);for(let z=-21;z<=21;z+=6)box(.45,1.5,.45,gold,x,.75,z);}
  for(const z of [-22.8,22.8]){box(46,.8,.35,trim,0,.45,z);for(let x=-21;x<=21;x+=6)box(.45,1.5,.45,gold,x,.75,z);}
  const rock=material(0x8c9182),leaf=material(0x388773),trunk=material(0x886e54);
  for(const [x,z,scale] of [[-29,-22,1],[29,-18,.9],[-29,19,.8],[28,25,1.1]]){
    mesh(root,new THREE.DodecahedronGeometry(2.1*scale,0),rock,x,-.2,z);
    mesh(root,new THREE.CylinderGeometry(.27,.45,4*scale,7),trunk,x,1.6*scale,z);
    for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])mesh(root,new THREE.ConeGeometry(1.25*scale,3*scale,6),leaf,x+dx*.8*scale,4.3*scale,z+dz*.8*scale);
  }
  for(let n=-18;n<20;n+=6){box(2,.035,.12,gold,0,.02,n);box(.12,.035,2,gold,n,.02,-2);}
  sign(root,'ISLAND DEPLOYMENT',0,5.5,-21,'#ffe2a2',10);
  const obstacles=[],rotors=[];
  // A physical map table, armory and supplies make preparation spatial.
  mesh(root,new THREE.CylinderGeometry(4.2,4.6,1.7,12),wall,0,.85,-12);mesh(root,new THREE.CylinderGeometry(4.35,4.35,.18,12),trim,0,1.78,-12);
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
