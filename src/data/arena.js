export const ARENA = Object.freeze({
  width: 56, depth: 40, roadWidth: 2.6
});
export const WAYPOINTS = Object.freeze([[-26,-13],[-17,-13],[-17,11],[-5,11],[-5,-9],[11,-9],[11,13],[24,13]].map(([x,z])=>Object.freeze({
  x,z
})));
export const SEGMENTS = Object.freeze(WAYPOINTS.slice(1).map((end,i)=>{
  const start=WAYPOINTS[i];
  return Object.freeze({
    start,end,length:Math.hypot(end.x-start.x,end.z-start.z)
  });
}));
export const PATH_LENGTH = SEGMENTS.reduce((sum,s)=>sum+s.length,0);
