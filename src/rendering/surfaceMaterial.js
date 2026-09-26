import * as THREE from 'three';

// Small, deterministic, original surface maps. Each material owns its texture.
// Canvas only paints material detail; all playable surfaces remain 3D meshes.
export function surfaceMaterial(color, pattern='panel', repeat=1){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ddd';ctx.fillRect(0,0,128,128);
  if(pattern==='panel'){
    ctx.fillStyle='#a7adb5';ctx.fillRect(0,0,128,3);ctx.fillRect(0,0,3,128);
    ctx.fillStyle='#f5f7ff';ctx.fillRect(4,4,120,2);
    for(const x of [10,118])for(const y of [10,118]){ctx.fillStyle='#87919e';ctx.fillRect(x-2,y-2,4,4);}
    ctx.fillStyle='#c5cbd2';for(let y=48;y<80;y+=6)ctx.fillRect(48,y,32,2);
  }else{
    if(pattern==='terrain'){
      for(let i=0;i<24;i++){
        const x=(i*41)%128,y=(i*67)%128;
        ctx.fillStyle=i%2?'#ffffff20':'#163d3625';
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+17,y+3);ctx.lineTo(x+22,y+14);ctx.lineTo(x+4,y+20);ctx.fill();
        ctx.strokeStyle='#183f3538';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+5,y+12);ctx.lineTo(x+3,y+7);ctx.moveTo(x+5,y+12);ctx.lineTo(x+8,y+5);ctx.stroke();
      }
    }
    for(let i=0;i<650;i++){
      const x=(i*73+19)%128,y=(i*47+Math.floor(i/128)*31)%128;
      ctx.fillStyle=i%3===0?'#ffffff35':'#18223525';
      ctx.fillRect(x,y,pattern==='cloth'?1:2,pattern==='cloth'?5:2);
    }
    if(pattern==='cloth'){ctx.fillStyle='#ffffff20';for(let x=0;x<128;x+=8)ctx.fillRect(x,0,1,128);}
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(repeat,repeat);map.anisotropy=4;
  return new THREE.MeshStandardMaterial({color,map,roughness:pattern==='panel'?.48:.88,metalness:pattern==='panel'?.28:0});
}
