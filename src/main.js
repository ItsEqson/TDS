import * as THREE from 'three';
import { Game } from './core/Game.js';
import { SceneRouter } from './core/SceneRouter.js';
const host=document.querySelector('#viewport');
const renderer=new THREE.WebGLRenderer({
  antialias:true
});
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
const canvas=renderer.domElement;
canvas.tabIndex=0;
canvas.setAttribute('aria-label','Copper Reach 3D world. WASD to move, right-drag or touch-drag to look, wheel to zoom, V to switch overhead and first person, E to interact. Battle: Space starts wave, R restarts.');
host.append(canvas);
const game=new Game(renderer,new SceneRouter(canvas),host);
game.start();
function onContextLost(event){
  event.preventDefault();
  game.dispose();
  host.textContent='WebGL context lost. Reload this page to restore the arena.';
  removeListeners();
}
function onPageHide(event){
  if(event.persisted)return;
  game.dispose();
  removeListeners();
}
function removeListeners(){
  canvas.removeEventListener('webglcontextlost',onContextLost);
  window.removeEventListener('pagehide',onPageHide);
}
canvas.addEventListener('webglcontextlost',onContextLost);
window.addEventListener('pagehide',onPageHide);
