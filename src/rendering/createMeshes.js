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
  for(const x of [-.2,.2]){mesh(g,new THREE.CapsuleGeometry(.15,.34,4,8),dark,x,.4);mesh(g,new THREE.CapsuleGeometry(.12,.2,4,8),dark,x,.13,.08).rotation.x=Math.PI/2;}
  mesh(g,new THREE.CylinderGeometry(.43,.38,.7,10),cloth,0,1.03);
  mesh(g,new THREE.SphereGeometry(.32,12,8),skin,0,1.65);
  mesh(g,new THREE.BoxGeometry(.57,.15,.52),cloth,0,1.93);
  mesh(g,new THREE.BoxGeometry(.6,.07,.6),dark,0,1.82,.05);
  const style=(d.appearance||0)%5;
  if(style===1)mesh(g,new THREE.BoxGeometry(.12,.32,.43),metal,0,2.08);
  if(style===2)mesh(g,new THREE.BoxGeometry(.68,.08,.7),cloth,0,1.9);
  if(style===3)for(const x of [-.3,.3])mesh(g,new THREE.BoxGeometry(.12,.28,.25),dark,x,1.72);
  if(style===4)mesh(g,new THREE.BoxGeometry(.52,.13,.06),metal,0,1.68,.26);
  if(['Advanced','Hardcore','Exclusive','Golden'].includes(d.tier))for(const x of [-.44,.44])mesh(g,new THREE.BoxGeometry(.32,.18,.44),metal,x,1.4);
  for(const x of [-.13,.13])mesh(g,new THREE.BoxGeometry(.07,.06,.03),dark,x,1.67,.24);
  for(const x of [-.47,.47]){const arm=mesh(g,new THREE.CapsuleGeometry(.12,.34,4,8),cloth,x,1.13,.13);arm.rotation.x=-.65;mesh(g,new THREE.SphereGeometry(.11,8,6),skin,x,.97,.32);}
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
export function createEnemyMesh(voidZombie=false,enemy=null){
  const name=enemy?.name||'',code=[...name].reduce((n,char)=>(n*31+char.charCodeAt(0))>>>0,7);
  const shade=code%4,g=new THREE.Group(),skin=material(voidZombie?[0x8558bc,0x6b91bc,0xb480ba,0x8e719f][shade]:[0x8ecb65,0xa7b973,0x7ac0a3,0xb4a376][shade]),rags=surfaceMaterial(voidZombie?[0x43255f,0x304461,0x583957,0x35355d][shade]:[0x466476,0x695e59,0x456b59,0x5c647a][shade],'cloth'),eye=material(voidZombie?0xed8fff:0xffdf65);
  // Name-derived color and equipment give each campaign type a stable silhouette.
  const accentColor=new THREE.Color().setHSL(((code*0.61803398875)%1),.68,.53);
  const accent=material(accentColor),trim=material(accentColor.clone().multiplyScalar(.48));
  eye.emissive.copy(eye.color);eye.emissiveIntensity=.65;
  for(const x of [-.2,.2]){const leg=mesh(g,new THREE.CapsuleGeometry(.16,.32,4,8),rags,x,.38);(g.userData.legs??=[]).push(leg);}
  const body=mesh(g,new THREE.CylinderGeometry(.4,.34,.67,10),rags,0,.99);g.userData.body=body;
  mesh(g,new THREE.SphereGeometry(.33,12,8),skin,0,1.57);
  for(const x of [-.47,.47]){const arm=mesh(g,new THREE.CapsuleGeometry(.13,.4,4,8),skin,x,1.1,.28);arm.rotation.x=-1;(g.userData.arms??=[]).push(arm);}
  for(const x of [-.14,.14])mesh(g,new THREE.BoxGeometry(.13,.08,.03),eye,x,1.62,.25);
  mesh(g,new THREE.BoxGeometry(.23,.07,.03),rags,0,1.42,.25);
  for(const x of [-.24,.24])mesh(g,new THREE.BoxGeometry(.09,.26,.025),skin,x,1.02,.215);
  for(const x of [-.07,.04])mesh(g,new THREE.BoxGeometry(.045,.055,.025),eye,x,1.43,.28);
  if(voidZombie)for(const x of [-.24,.24])mesh(g,new THREE.ConeGeometry(.12,.45,4),eye,x,1.96);
  const shape=code%7;
  if(shape===0)mesh(g,new THREE.ConeGeometry(.36,.48,5),accent,0,2.03);
  if(shape===1)mesh(g,new THREE.BoxGeometry(.72,.16,.5),accent,0,1.94);
  if(shape===2)for(const x of [-.25,.25])mesh(g,new THREE.ConeGeometry(.13,.55,4),accent,x,2.04);
  if(shape===3)mesh(g,new THREE.OctahedronGeometry(.34),accent,0,1.99);
  if(shape===4){mesh(g,new THREE.TorusGeometry(.36,.08,5,12),accent,0,1.94).rotation.x=Math.PI/2;}
  if(shape===5)mesh(g,new THREE.CylinderGeometry(.29,.38,.37,6),accent,0,1.99);
  if(shape===6)for(const x of [-.27,.27])mesh(g,new THREE.BoxGeometry(.14,.42,.22),accent,x,1.96);
  const gear=(code>>>4)%5;
  if(gear===0)mesh(g,new THREE.BoxGeometry(.78,.3,.18),trim,0,1.1,.35);
  if(gear===1)for(const x of [-.47,.47])mesh(g,new THREE.BoxGeometry(.34,.22,.38),accent,x,1.36);
  if(gear===2)mesh(g,new THREE.OctahedronGeometry(.28),accent,0,1.12,.4);
  if(gear===3)mesh(g,new THREE.ConeGeometry(.25,.55,5),trim,0,1.25,-.43);
  if(gear===4)for(const x of [-.25,.25])mesh(g,new THREE.BoxGeometry(.12,.47,.08),accent,x,1.03,.31);
  if(/Skeleton|Corpse/.test(name)){for(const x of [-.2,.2])mesh(g,new THREE.BoxGeometry(.1,.42,.07),material(0xe6dbc4),x,1,.26);}
  if(/Slime|Experiment|Mandrake|Mandragora/.test(name))mesh(g,new THREE.DodecahedronGeometry(.39),accent,0,.93,.13);
  if(/Mech|Armor|Armored|Lead|Knight|Squire|Guard|Bulwark/.test(name))for(const x of [-.4,.4])mesh(g,new THREE.BoxGeometry(.26,.39,.34),trim,x,1.2);
  if(/Molten|Boomer|Hound/.test(name)){accent.emissive.copy(accent.color);accent.emissiveIntensity=.55;}
  if(/Boss|King|Warlord|Reaver|Zero|Digger/.test(name))mesh(g,new THREE.TorusGeometry(.45,.07,5,8),accent,0,2.27).rotation.x=Math.PI/2;
  if(enemy?.hidden){const ring=mesh(g,new THREE.TorusGeometry(.52,.055,5,16),material(0x9fe8f2),0,1.05,0);ring.rotation.x=Math.PI/2;}
  if(enemy?.flying){mesh(g,new THREE.SphereGeometry(.43,10,8),material(0xf2bd68),0,2.92);mesh(g,new THREE.CylinderGeometry(.014,.014,.55,5),material(0x66647a),0,2.35);g.userData.flying=true;}
  if(enemy?.leadProtection>0){const armor=new THREE.Group();g.add(armor);mesh(armor,new THREE.BoxGeometry(.78,.45,.18),material(0xb6c1c8),0,1.08,.35);for(const x of [-.38,.38])mesh(armor,new THREE.BoxGeometry(.23,.28,.27),material(0x879ba8),x,1.4);g.userData.armor=armor;}
  if(enemy?.splitInto)for(const x of [-.33,.33])mesh(g,new THREE.SphereGeometry(.2,7,5),material(0xe7a779),x,1.08,.28);
  if(enemy?.summons){mesh(g,new THREE.CylinderGeometry(.035,.035,1.5,5),material(0xa3a9ca),.6,1.25,.15);mesh(g,new THREE.OctahedronGeometry(.18),eye,.6,2.05,.15);}
  if(enemy?.boss){mesh(g,new THREE.ConeGeometry(.4,.55,6),material(0xc8a167),0,2.18);}
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
