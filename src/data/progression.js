import { TOWERS } from './towers.js';

// Account levels are earned from total experience. Requirements are only assigned where the source ideas give one.
export const accountLevel=xp=>1+Math.floor(Math.max(0,xp)/100);
export const requiredTowerLevel=Object.freeze({'rotor-marshal':100,'siege-gunner':50,'crank-gunner':175});

const byRole=Object.fromEntries(Object.values(TOWERS).map(t=>[t.sourceRole,t.id]));
export const VARIANTS=Object.freeze(Object.fromEntries([
  ['Operator','Scout'],['Enforcer','Shotgunner'],['Kingpin','Crook Boss'],['Juggernaut','Minigunner'],
  ['Golden Scout','Scout'],['Golden Demoman','Demoman'],['Golden Soldier','Soldier'],
  ['Golden Pyromancer','Pyromancer'],['Golden Crook Boss','Crook Boss'],['Golden Cowboy','Cowboy'],
  ['Golden Snowballer','Snowballer']
].map(([form,base])=>[byRole[form],byRole[base]]).filter(([form,base])=>form&&base)));
export const GOLDEN_FORMS=Object.freeze(Object.keys(VARIANTS).filter(id=>TOWERS[id].tier==='Golden'&&TOWERS[id].sourceRole!=='Golden Snowballer'));
export const baseTower=id=>VARIANTS[id]||id;
export const towerForms=base=>Object.keys(VARIANTS).filter(id=>VARIANTS[id]===base&&TOWERS[id].sourceRole!=='Golden Snowballer');
export const activeTower=(base,forms={})=>TOWERS[forms[base]]||TOWERS[base];
