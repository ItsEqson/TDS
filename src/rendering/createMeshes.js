import * as THREE from 'three';
import { TOWER } from '../data/towers.js';
export function material(color){
  return new THREE.MeshStandardMaterial({
    color,roughness:0.8,flatShading:true
  });
}
export function mesh(parent,geometry,mat,x=0,y=0,z=0){
  const m=new THREE.Mesh(geometry,mat);
  m.position.set(x,y,z);
  m.castShadow=true;
  m.receiveShadow=true;
  parent.add(m);
  return m;
}
export function createTowerMesh(ghost=false){
  const g=new THREE.Group();
  const dark=material(0x203b42),teal=material(0x74d5be),pale=material(0xe9dfbf);
  mesh(g,new THREE.CylinderGeometry(.62,.72,.25,6),dark,0,.18);
  mesh(g,new THREE.CylinderGeometry(.32,.48,1.2,6),pale,0,.85);
  mesh(g,new THREE.OctahedronGeometry(.55),teal,0,1.7);
  for(const x of [-.48,.48])mesh(g,new THREE.BoxGeometry(.16,.85,.28),dark,x,1.4);
  if(ghost)g.traverse(o=>{
    if(o.material){
      o.material.transparent=true;
      o.material.opacity=.45;
      o.material.depthWrite=false;
      o.castShadow=false;
    }
  });
  return g;
}
export function createEnemyMesh(){
  const g=new THREE.Group();
  const shell=material(0xd98443),dark=material(0x443a35),eye=material(0xffe3a4);
  const body=mesh(g,new THREE.DodecahedronGeometry(.52,0),shell,0,.75);
  body.scale.set(1,0.8,1.2);
  mesh(g,new THREE.BoxGeometry(.5,.18,.18),eye,0,.87,.49);
  for(const x of [-.43,.43])for(const z of [-.32,.32])mesh(g,new THREE.BoxGeometry(.2,.38,.28),dark,x,.35,z);
  const health=mesh(g,new THREE.BoxGeometry(.85,.09,.09),material(0xc9efb6),0,1.4);
  g.userData.health=health;
  return g;
}
export function createRange(){
  const m=new THREE.Mesh(new THREE.TorusGeometry(TOWER.range,.045,5,96),new THREE.MeshBasicMaterial({
    color:0xb8f2cb,transparent:true,opacity:.75
  }));
  m.rotation.x=-Math.PI/2;
  m.position.y=.15;
  m.visible=false;
  return m;
}
export function createBeam(){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1,6),new THREE.MeshBasicMaterial({
    color:0xffefab
  }));
  m.visible=false;
  return m;
}
export function disposeObject(root){
  const geometries=new Set(),materials=new Set();
  root.traverse(o=>{
    if(o.geometry)geometries.add(o.geometry);
    if(o.material){
      for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
    }
  });
  for(const g of geometries)g.dispose();
  for(const m of materials)m.dispose();
  root.removeFromParent();
}
