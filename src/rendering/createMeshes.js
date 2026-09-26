import * as THREE from 'three';
import { TOWER,TOWERS } from '../data/towers.js';
import { surfaceMaterial } from './surfaceMaterial.js';
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
// All deployables are people: equipment communicates each specialist's role.
export function createTowerMesh(ghost=false,definition=TOWERS['prism-sentry']){
  const g=new THREE.Group(),d=definition;
  const cloth=surfaceMaterial(d.color,'cloth'),dark=material(0x203052),skin=material([0xbd886b,0xe4b591,0x825843,0xb77755][(d.appearance||0)%4]),metal=material(0xd6e8ff);
  metal.metalness=.65;metal.roughness=.32;
  const accent=material([0xffce45,0x39e5ff,0xff709d,0x9cff6b,0xb8a0ff][(d.appearance||0)%5]);
  accent.emissive.copy(accent.color);accent.emissiveIntensity=.18;
  cloth.name='uniform';
  for(const x of [-.2,.2]){mesh(g,new THREE.BoxGeometry(.27,.62,.3),dark,x,.4);mesh(g,new THREE.BoxGeometry(.3,.16,.48),dark,x,.12,.08);}
  mesh(g,new THREE.BoxGeometry(.72,.68,.4),cloth,0,1.03);
  mesh(g,new THREE.BoxGeometry(.5,.48,.46),skin,0,1.64);
  mesh(g,new THREE.BoxGeometry(.57,.15,.52),cloth,0,1.93);
  mesh(g,new THREE.BoxGeometry(.6,.07,.6),dark,0,1.82,.05);
  const style=(d.appearance||0)%5;
  if(style===1)mesh(g,new THREE.BoxGeometry(.12,.32,.43),metal,0,2.08);
  if(style===2)mesh(g,new THREE.BoxGeometry(.68,.08,.7),cloth,0,1.9);
  if(style===3)for(const x of [-.3,.3])mesh(g,new THREE.BoxGeometry(.12,.28,.25),dark,x,1.72);
  if(style===4)mesh(g,new THREE.BoxGeometry(.52,.13,.06),metal,0,1.68,.26);
  if(['Advanced','Hardcore','Exclusive','Golden'].includes(d.tier))for(const x of [-.44,.44])mesh(g,new THREE.BoxGeometry(.32,.18,.44),metal,x,1.4);
  for(const x of [-.13,.13])mesh(g,new THREE.BoxGeometry(.07,.06,.03),dark,x,1.67,.24);
  for(const x of [-.47,.47]){const arm=mesh(g,new THREE.BoxGeometry(.22,.55,.23),cloth,x,1.13,.13);arm.rotation.x=-.65;mesh(g,new THREE.BoxGeometry(.2,.18,.2),skin,x,.97,.32);}
  mesh(g,new THREE.BoxGeometry(.42,.45,.23),dark,0,1.1,-.32);
  // Layered armor, utility belt, seams and equipment lights read at both camera scales.
  mesh(g,new THREE.BoxGeometry(.49,.34,.07),dark,0,1.14,.235);
  mesh(g,new THREE.BoxGeometry(.16,.18,.025),accent,.12,1.18,.28);
  mesh(g,new THREE.BoxGeometry(.74,.1,.45),dark,0,.77);
  mesh(g,new THREE.BoxGeometry(.15,.12,.04),metal,0,.77,.25);
  for(const x of [-.25,.25]){
    mesh(g,new THREE.BoxGeometry(.13,.18,.1),accent,x,.85,.28);
    mesh(g,new THREE.BoxGeometry(.2,.17,.06),metal,x,.42,.18);
    mesh(g,new THREE.BoxGeometry(.08,.44,.035),metal,x,1.1,.25);
    mesh(g,new THREE.BoxGeometry(.25,.08,.25),accent,x*1.9,1.32,.14);
  }
  mesh(g,new THREE.BoxGeometry(.42,.04,.025),accent,0,1.88,.315);
  for(const x of [-.13,.13])mesh(g,new THREE.CylinderGeometry(.055,.055,.36,6),accent,x,1.15,-.48);
  const kit=d.kit;
  if(d.sourceRole==='Brawler'){
    for(const x of [-.47,.47])mesh(g,new THREE.BoxGeometry(.38,.32,.42),metal,x,1,.4);
  }else if(['melee','bleed','freeze'].includes(kit)){
    mesh(g,new THREE.BoxGeometry(.09,1.1,.12),metal,.49,1.48,.42);
    if(kit==='freeze')mesh(g,new THREE.BoxGeometry(.5,.3,.3),cloth,.49,1.94,.42);
    if(d.sourceRole==='Warden')mesh(g,new THREE.BoxGeometry(.65,.85,.12),metal,-.48,1.02,.5);
  }else if(['support','heal','economy','summon'].includes(kit)){
    mesh(g,new THREE.BoxGeometry(.55,.38,.12),dark,0,1,.48);
    mesh(g,new THREE.BoxGeometry(.38,.23,.03),cloth,0,1.02,.56);
    if(kit==='heal'){mesh(g,new THREE.BoxGeometry(.08,.23,.04),metal,0,1.03,.59);mesh(g,new THREE.BoxGeometry(.24,.08,.04),metal,0,1.03,.59);}
    if(kit==='economy')for(const x of [-.2,.2])mesh(g,new THREE.ConeGeometry(.14,.4,5),cloth,x,1.58,-.35);
    if(kit==='summon')mesh(g,new THREE.CylinderGeometry(.025,.025,.65,4),metal,-.3,1.66,-.32);
  }else{
    const length=kit==='rifle'?1.25:kit==='pistol'?.42:.8;
    mesh(g,new THREE.BoxGeometry(kit==='splash'?.28:.16,.2,length),dark,.32,1.16,.55);
    mesh(g,new THREE.BoxGeometry(.19,.08,.2),cloth,.32,1.31,.55);
    if(kit==='rapid')for(const x of [.25,.39])mesh(g,new THREE.BoxGeometry(.06,.06,.95),metal,x,1.12,.65);
  }
  if(ghost)g.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=.45;o.material.depthWrite=false;o.castShadow=false;}});
  return g;
}
export function createEnemyMesh(voidZombie=false){
  const g=new THREE.Group(),skin=material(voidZombie?0x8558bc:0x8ecb65),rags=surfaceMaterial(voidZombie?0x43255f:0x466476,'cloth'),eye=material(voidZombie?0xed8fff:0xffdf65);
  eye.emissive.copy(eye.color);eye.emissiveIntensity=.65;
  for(const x of [-.2,.2]){const leg=mesh(g,new THREE.BoxGeometry(.28,.58,.32),rags,x,.38);(g.userData.legs??=[]).push(leg);}
  mesh(g,new THREE.BoxGeometry(.72,.63,.4),rags,0,.99);
  mesh(g,new THREE.BoxGeometry(.55,.5,.48),skin,0,1.57);
  for(const x of [-.47,.47]){const arm=mesh(g,new THREE.BoxGeometry(.24,.66,.25),skin,x,1.1,.28);arm.rotation.x=-1;}
  for(const x of [-.14,.14])mesh(g,new THREE.BoxGeometry(.13,.08,.03),eye,x,1.62,.25);
  mesh(g,new THREE.BoxGeometry(.23,.07,.03),rags,0,1.42,.25);
  for(const x of [-.24,.24])mesh(g,new THREE.BoxGeometry(.09,.26,.025),skin,x,1.02,.215);
  for(const x of [-.07,.04])mesh(g,new THREE.BoxGeometry(.045,.055,.025),eye,x,1.43,.28);
  if(voidZombie)for(const x of [-.24,.24])mesh(g,new THREE.ConeGeometry(.12,.45,4),eye,x,1.96);
  g.userData.health=mesh(g,new THREE.BoxGeometry(.85,.07,.06),material(0xc9efb6),0,2.25);
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
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(o=>{
    if(o.geometry)geometries.add(o.geometry);
    if(o.material){
      for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
    }
  });
  for(const g of geometries)g.dispose();
  for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
  for(const t of textures)t.dispose();
  root.removeFromParent();
}
