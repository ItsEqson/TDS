import { INPUT_MAP } from './Input.js';
import { WALK } from '../data/headquarters.js';
export class WalkInput {
  constructor(canvas,scene,pad){
    this.canvas=canvas;this.scene=scene;this.pad=pad;this.keys=new Set();this.touch=new Map();this.look=null;
    this.key=this.key.bind(this);this.up=this.up.bind(this);this.down=this.down.bind(this);this.move=this.move.bind(this);this.release=this.release.bind(this);this.clear=this.clear.bind(this);
    canvas.addEventListener('keydown',this.key);window.addEventListener('keyup',this.up);
    canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.release);canvas.addEventListener('pointercancel',this.release);canvas.addEventListener('wheel',this.wheel,{passive:false});canvas.addEventListener('contextmenu',this.context);
    pad.addEventListener('pointerdown',this.down);pad.addEventListener('pointerup',this.release);pad.addEventListener('pointercancel',this.release);
    window.addEventListener('blur',this.clear);document.addEventListener('visibilitychange',this.clear);
    canvas.addEventListener('blur',this.clear);
  }
  key(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.code===INPUT_MAP.view){e.preventDefault();if(!e.repeat&&!this.scene.app.ui.isOpen)this.scene.toggleView();return;}
    if(Object.values(INPUT_MAP.walk).flat().includes(e.code)){e.preventDefault();this.keys.add(e.code);}
    if(e.code===INPUT_MAP.interact){e.preventDefault();if(!e.repeat)this.scene.interact();}
  }
  up(e){this.keys.delete(e.code);}
  down(e){
    if(e.button!==0&&e.button!==2)return;this.canvas.focus({preventScroll:true});
    const button=e.target.closest('[data-move]');
    if(button&&e.pointerType==='touch'){e.preventDefault();button.setPointerCapture(e.pointerId);this.touch.set(e.pointerId,button.dataset.move);}
    else if(!this.look&&(e.button===2||e.pointerType==='touch')){e.preventDefault();this.look={id:e.pointerId,x:e.clientX,y:e.clientY};this.canvas.setPointerCapture(e.pointerId);}
  }
  wheel=e=>{if(document.activeElement!==this.canvas||this.scene.app.ui.isOpen)return;e.preventDefault();this.scene.zoom(e.deltaY);};
  context=e=>{if(document.activeElement===this.canvas)e.preventDefault();};
  move(e){if(this.look?.id!==e.pointerId)return;const speed=WALK.sensitivity*this.scene.app.lookSensitivity;this.scene.look((e.clientX-this.look.x)*speed,(e.clientY-this.look.y)*speed);this.look.x=e.clientX;this.look.y=e.clientY;}
  release(e){this.touch.delete(e.pointerId);if(this.look?.id===e.pointerId)this.look=null;}
  held(name){for(const k of INPUT_MAP.walk[name])if(this.keys.has(k))return true;for(const direction of this.touch.values())if(direction===name)return true;return false;}
  axis(positive,negative){return Number(this.held(positive))-Number(this.held(negative));}
  clear(){this.keys.clear();this.touch.clear();this.look=null;}
  dispose(){this.clear();const c=this.canvas;c.removeEventListener('blur',this.clear);c.removeEventListener('keydown',this.key);window.removeEventListener('keyup',this.up);for(const [type,fn] of [['pointerdown',this.down],['pointermove',this.move],['pointerup',this.release],['pointercancel',this.release]])c.removeEventListener(type,fn);c.removeEventListener('wheel',this.wheel);c.removeEventListener('contextmenu',this.context);this.pad.removeEventListener('pointerdown',this.down);this.pad.removeEventListener('pointerup',this.release);this.pad.removeEventListener('pointercancel',this.release);window.removeEventListener('blur',this.clear);document.removeEventListener('visibilitychange',this.clear);}
}
