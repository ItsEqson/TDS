import * as THREE from 'three';
import { Game } from '../src/core/Game.js';
import { BattleScene } from '../src/scenes/BattleScene.js';
import { createEnemy } from '../src/gameplay/Enemy.js';
const html=await (await fetch('/')).text();
const fixture=new DOMParser().parseFromString(html,'text/html').querySelector('#game');
fixture.querySelector('#loading').remove();
document.querySelector('#fixture').append(fixture);
const host=fixture.querySelector('#viewport'),renderer=new THREE.WebGLRenderer({
  antialias:true
});
renderer.domElement.tabIndex=0;
host.append(renderer.domElement);
const scene=new BattleScene(renderer.domElement),game=new Game(renderer,scene,host);
const originalAdd=EventTarget.prototype.addEventListener;
let added=0;
EventTarget.prototype.addEventListener=function(...args){
  added++;
  return originalAdd.apply(this,args);
};
const results=[];
function assert(v,m){
  if(!v)throw Error(m);
}
function test(name,fn){
  try{
    fn();
    results.push('PASS — '+name);
  }
  catch(e){
    results.push('FAIL — '+name+': '+e.message);
  }
}
try{
  game.start();
  cancelAnimationFrame(game.frame);
  // Warm persistent preview resources before measuring transient entity cleanup.
  scene.ghost.visible=true;
  scene.range.visible=true;
  scene.render(renderer,1);
  scene.ghost.visible=false;
  scene.range.visible=false;
  const baselineGeometry=renderer.info.memory.geometries,baselineChildren=scene.scene.children.length,initialListeners=added;
  test('Three rendered restart cycles retain baseline GPU geometry, scene children and listener count',()=>{
    for(let cycle=0;cycle<3;cycle++){
      scene.place();
      scene.hasPoint=true;
      scene.x=-13;
      scene.z=0;
      scene.click();
      scene.start();
      for(let i=0;i<7200&&!scene.terminal;i++){
        scene.update(1/60);
        if(i%20===0)scene.render(renderer,1);
      }
      assert(scene.battle.state==='WON','Defended outcome');
      scene.restart();
      scene.render(renderer,1);
      assert(scene.battle.cash===200&&scene.battle.health===100&&scene.battle.remaining===10&&scene.battle.state==='PREP','HUD reset');
      assert(scene.enemyMeshes.size===0&&scene.towerMeshes.size===0,'Entity mesh cleanup');
      assert(renderer.info.memory.geometries===baselineGeometry,'GPU geometry leak: '+renderer.info.memory.geometries+' vs '+baselineGeometry);
      assert(scene.scene.children.length===baselineChildren,'Scene object leak');
      assert(added===initialListeners,'Duplicate listeners');
    }
  });
  test('Strategy camera stays finite at desktop and narrow aspect ratios',()=>{
    for(const [w,h] of [[1280,550],[390,550],[652,300]]){
      scene.resize(w,h);
      assert(scene.camera.aspect===w/h&&Number.isFinite(scene.camera.position.x)&&Number.isFinite(scene.camera.position.z),'Invalid camera');
    }
  });
  test('Enemy hover exposes current health and clears on pointer exit',()=>{
    const enemy=createEnemy(777),focusX=scene.walkX,focusZ=scene.walkZ;
    enemy.x=enemy.previousX=0;enemy.z=enemy.previousZ=0;
    scene.battle.enemies.push(enemy);scene.walkX=0;scene.walkZ=0;scene.updateCamera();scene.camera.updateMatrixWorld(true);scene.render(renderer,1);
    const screen=new THREE.Vector3(enemy.x,1,enemy.z).project(scene.camera),r=scene.canvas.getBoundingClientRect();
    scene.point(r.left+(screen.x+1)*r.width/2,r.top+(1-screen.y)*r.height/2);
    assert(scene.hoveredEnemy===enemy&&!scene.hud.enemyTip.hidden&&scene.hud.enemyTip.textContent.includes('10 / 10 HP'),`Enemy health missing: hovered ${scene.hoveredEnemy?.id}, meshes ${scene.enemyMeshes.size}, screen ${screen.x},${screen.y}, pointer ${scene.pointer.x},${scene.pointer.y}, tip ${scene.hud.enemyTip.textContent}`);
    scene.pointerOutside();assert(scene.hud.enemyTip.hidden,'Hover remained after exit');
    scene.battle.enemies.pop();scene.render(renderer,1);scene.walkX=focusX;scene.walkZ=focusZ;scene.updateCamera();
  });
  test('Touch movement and drag-look steer the strategy camera',()=>{
    const x=scene.walkX,yaw=scene.yaw;scene.input.touchDirections.set(99,'right');scene.update(.2);assert(scene.walkX>x,'Touch movement did not advance');scene.input.touchDirections.clear();
    scene.input.touchLook={id:77,x:100,y:100,startX:100,startY:100,moved:false};scene.input.onMove({pointerId:77,clientX:140,clientY:110});assert(scene.yaw!==yaw&&scene.input.touchLook.moved,'Touch drag did not turn');scene.input.onPointerUp({pointerId:77,type:'pointercancel'});assert(scene.input.touchLook===null);scene.walkX=x;scene.yaw=yaw;
  });
  test('Keyboard focus guards and browser defaults follow active bindings',()=>{
    const canvas=renderer.domElement;
    const key=code=>new KeyboardEvent('keydown',{code,bubbles:true,cancelable:true});
    document.querySelector('#place').focus();
    const outside=key('Space');canvas.dispatchEvent(outside);
    assert(scene.battle.state==='PREP'&&!outside.defaultPrevented,'Unfocused shortcut fired');
    canvas.focus();
    const inactive=key('KeyR');canvas.dispatchEvent(inactive);
    assert(!inactive.defaultPrevented,'Inactive restart consumed');
    scene.place();const cancel=key('Escape');canvas.dispatchEvent(cancel);
    assert(!scene.placing&&cancel.defaultPrevented&&scene.battle.cash===200,'Escape cancellation');
    const context=new MouseEvent('contextmenu',{cancelable:true});canvas.dispatchEvent(context);
    assert(context.defaultPrevented,'Focused right-look opened browser menu');
    const capture=canvas.setPointerCapture;canvas.setPointerCapture=()=>{};
    scene.place();canvas.dispatchEvent(new PointerEvent('pointerdown',{button:2,cancelable:true}));canvas.setPointerCapture=capture;
    const activeContext=new MouseEvent('contextmenu',{cancelable:true});canvas.dispatchEvent(activeContext);
    assert(scene.placing&&activeContext.defaultPrevented,'Right-drag look availability');scene.cancel();
    const start=key('Space');canvas.dispatchEvent(start);
    assert(scene.battle.state==='WAVE_ACTIVE'&&start.defaultPrevented,'Focused start');
  });
  test('Hidden frames do not simulate; a 60-second resume gap causes zero catch-up',()=>{
    const descriptor=Object.getOwnPropertyDescriptor(document,'hidden');
    try{
      scene.start();
      game.onFrame(1000);
      cancelAnimationFrame(game.frame);
      game.onFrame(1017);
      cancelAnimationFrame(game.frame);
      const elapsed=scene.battle.elapsed;
      Object.defineProperty(document,'hidden',{
        configurable:true,value:true
      });
      document.dispatchEvent(new Event('visibilitychange'));
      game.onFrame(61017);
      cancelAnimationFrame(game.frame);
      assert(scene.battle.elapsed===elapsed,'Hidden simulation advanced');
      Object.defineProperty(document,'hidden',{
        configurable:true,value:false
      });
      document.dispatchEvent(new Event('visibilitychange'));
      game.onFrame(121017);
      cancelAnimationFrame(game.frame);
      assert(scene.battle.elapsed===elapsed,'Resume jump');
      game.onFrame(122017);
      cancelAnimationFrame(game.frame);
      assert(scene.battle.elapsed-elapsed<=.100001,'Frame delta uncapped');
    }
    finally{
      if(descriptor)Object.defineProperty(document,'hidden',descriptor);
      else delete document.hidden;
    }
  });
  test('Dispose removes canvas and prevents any further animation frame work',()=>{
    game.dispose();
    assert(!game.running&&!renderer.domElement.isConnected,'Dispose failed');
    game.onFrame(200000);
  });
}
finally{
  EventTarget.prototype.addEventListener=originalAdd;
  if(game.running)game.dispose();
}
for(const result of results){
  const li=document.createElement('li');
  li.textContent=result;
  document.querySelector('#results').append(li);
}
document.querySelector('#summary').textContent=results.filter(r=>r.startsWith('PASS')).length+' / '+results.length+' lifecycle checks passed';
