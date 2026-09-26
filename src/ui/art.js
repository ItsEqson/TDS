import { TOWERS } from '../data/towers.js';
export const portrait=id=>id?`<img class="tower-portrait" src="assets/icons/towers/${id}.svg" alt="${TOWERS[id].name} portrait" loading="lazy">`:'';
export const icon=id=>`<img class="ui-icon" src="assets/icons/${id}.svg" alt="" aria-hidden="true">`;
