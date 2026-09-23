export const TOWER = Object.freeze({
  id:'prism-sentry',cost:100,radius:0.7,range:6.5,damage:5,intervalSeconds:0.65,beamSeconds:0.18
});
export const TOWERS=Object.freeze({
  'prism-sentry':Object.freeze({...TOWER,name:'Prism sentry',role:'Rapid defense',description:'Reliable pulses. Strong coverage around inner bends.',color:0x74d5be}),
  'longwatch':Object.freeze({...TOWER,id:'longwatch',name:'Longwatch',role:'Long range',description:'A slow precision beam with greater reach and impact.',cost:140,range:9,damage:12,intervalSeconds:1.5,color:0xffbb71})
});
