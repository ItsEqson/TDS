import { WALK } from '../data/headquarters.js';
export const INPUT_MAP=Object.freeze({
  cancel:'Escape',start:'Space',restart:'KeyR',place:0,cancelPointer:2,interact:'KeyE',
  walk:Object.freeze({forward:['KeyW'],back:['KeyS'],left:['KeyA'],right:['KeyD'],turnLeft:['ArrowLeft'],turnRight:['ArrowRight'],lookUp:['ArrowUp'],lookDown:['ArrowDown']})
});
export class Input {
  constructor(canvas,scene){
    this.canvas=canvas;
    this.scene=scene;
    this.onMove=this.onMove.bind(this);
    this.onDown=this.onDown.bind(this);
    this.onLeave=this.onLeave.bind(this);
    this.onKey=this.onKey.bind(this);
    this.onContext=this.onContext.bind(this);
    this.onUp=this.onUp.bind(this);this.onBlur=this.onBlur.bind(this);this.onPointerUp=this.onPointerUp.bind(this);this.onPadDown=this.onPadDown.bind(this);this.keys=new Set();this.lookDrag=null;this.touchLook=null;this.touchDirections=new Map();this.pad=document.querySelector('#battle-walk-pad');
    canvas.addEventListener('pointermove',this.onMove);
    canvas.addEventListener('pointerdown',this.onDown);
    canvas.addEventListener('pointerup',this.onPointerUp);canvas.addEventListener('pointercancel',this.onPointerUp);
    canvas.addEventListener('pointerleave',this.onLeave);
    canvas.addEventListener('keydown',this.onKey);
    window.addEventListener('keyup',this.onUp);canvas.addEventListener('blur',this.onBlur);window.addEventListener('blur',this.onBlur);document.addEventListener('visibilitychange',this.onBlur);
    canvas.addEventListener('contextmenu',this.onContext);
    this.onWheel=this.onWheel.bind(this);canvas.addEventListener('wheel',this.onWheel,{passive:false});
    this.pad?.addEventListener('pointerdown',this.onPadDown);
    this.pad?.addEventListener('pointerup',this.onPointerUp);
    this.pad?.addEventListener('pointercancel',this.onPointerUp);
  }
  onMove(e){
    const speed=WALK.sensitivity*(this.scene.app?.lookSensitivity||1);
    if(this.touchLook?.id===e.pointerId){const t=this.touchLook,dx=e.clientX-t.x,dy=e.clientY-t.y;if(Math.hypot(e.clientX-t.startX,e.clientY-t.startY)>6)t.moved=true;if(t.moved)this.scene.look(dx*speed,dy*speed);t.x=e.clientX;t.y=e.clientY;return;}
    if(this.lookDrag?.id===e.pointerId){this.scene.look((e.clientX-this.lookDrag.x)*speed,(e.clientY-this.lookDrag.y)*speed);this.lookDrag.x=e.clientX;this.lookDrag.y=e.clientY;return;}
    this.scene.point(e.clientX,e.clientY);
  }
  onPointerUp(e){
    this.touchDirections.delete(e.pointerId);
    if(this.lookDrag?.id===e.pointerId)this.lookDrag=null;
    if(this.touchLook?.id===e.pointerId){const t=this.touchLook;this.touchLook=null;if(!t.moved&&e.type==='pointerup'){this.scene.point(t.startX,t.startY);this.scene.click();}}
  }
  onPadDown(e){const button=e.target.closest('[data-battle-move]');if(!button)return;e.preventDefault();button.setPointerCapture(e.pointerId);this.touchDirections.set(e.pointerId,button.dataset.battleMove);}
  onDown(e){
    this.canvas.focus({
      preventScroll:true
    });
    if(e.button===INPUT_MAP.cancelPointer){
      this.lookDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
      this.canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      return;
    }
    if(e.pointerType==='touch'){this.touchLook={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};this.canvas.setPointerCapture(e.pointerId);return;}
    if(e.button===INPUT_MAP.place){
      this.scene.point(e.clientX,e.clientY);
      this.scene.click();
    }
  }
  onLeave(){
    this.scene.pointerOutside();
  }
  onKey(e){
    if(document.activeElement!==this.canvas||e.ctrlKey||e.metaKey||e.altKey)return;
    if(Object.values(INPUT_MAP.walk).flat().includes(e.code)){e.preventDefault();this.keys.add(e.code);return;}
    let action=null;
    if(e.code===INPUT_MAP.cancel&&this.scene.canCancel())action='cancel';
    if(e.code===INPUT_MAP.start&&this.scene.battle.state==='PREP')action='start';
    if(e.code===INPUT_MAP.restart&&this.scene.terminal)action='restart';
    if(action){
      e.preventDefault();
      if(!e.repeat)this.scene[action]();
    }
  }
  onUp(e){this.keys.delete(e.code);}
  onBlur(){this.keys.clear();this.lookDrag=null;this.touchLook=null;this.touchDirections.clear();}
  axis(positive,negative){const held=name=>{if(INPUT_MAP.walk[name].some(k=>this.keys.has(k)))return true;for(const direction of this.touchDirections.values())if(direction===name)return true;return false;};return Number(held(positive))-Number(held(negative));}
  onContext(e){
    if(document.activeElement===this.canvas){
      e.preventDefault();
      this.scene.cancelledContext=false;
    }
  }
  onWheel(e){if(document.activeElement!==this.canvas)return;e.preventDefault();this.scene.app?.setZoom((this.scene.app.zoom||0)+Math.sign(e.deltaY)*1.5);}
  dispose(){
    const c=this.canvas;
    c.removeEventListener('pointermove',this.onMove);
    c.removeEventListener('pointerdown',this.onDown);
    c.removeEventListener('pointerup',this.onPointerUp);c.removeEventListener('pointercancel',this.onPointerUp);
    c.removeEventListener('pointerleave',this.onLeave);
    c.removeEventListener('keydown',this.onKey);
    window.removeEventListener('keyup',this.onUp);c.removeEventListener('blur',this.onBlur);window.removeEventListener('blur',this.onBlur);document.removeEventListener('visibilitychange',this.onBlur);
    c.removeEventListener('contextmenu',this.onContext);
    c.removeEventListener('wheel',this.onWheel);
    this.pad?.removeEventListener('pointerdown',this.onPadDown);
    this.pad?.removeEventListener('pointerup',this.onPointerUp);
    this.pad?.removeEventListener('pointercancel',this.onPointerUp);
  }
}
