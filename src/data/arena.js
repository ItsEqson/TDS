export const ARENA = Object.freeze({
  width: 28, depth: 20, roadWidth: 1.8
});
export const WAYPOINTS = Object.freeze([[-13,-6],[-7,-6],[-7,4],[0,4],[0,-4],[8,-4],[8,6],[12,6]].map(([x,z])=>Object.freeze({
  x,z
})));
export const SEGMENTS = Object.freeze(WAYPOINTS.slice(1).map((end,i)=>{
  const start=WAYPOINTS[i];
  return Object.freeze({
    start,end,length:Math.hypot(end.x-start.x,end.z-start.z)
  });
}));
export const PATH_LENGTH = SEGMENTS.reduce((sum,s)=>sum+s.length,0);
