import { WALK } from '../data/headquarters.js';
export function canWalk(x,z,obstacles){
  if(Math.abs(x)>WALK.bound||Math.abs(z)>WALK.bound)return false;
  for(const o of obstacles)if(Math.hypot(x-o.x,z-o.z)<o.radius+WALK.radius)return false;
  return true;
}
// Movement remains plain simulation data; the scene camera mirrors this pose.
export function moveWalker(pose,forward,right,dt,obstacles){
  const length=Math.hypot(forward,right)||1;forward/=length;right/=length;
  const dx=(right*Math.cos(pose.yaw)-forward*Math.sin(pose.yaw))*WALK.speed*dt;
  const dz=(-forward*Math.cos(pose.yaw)-right*Math.sin(pose.yaw))*WALK.speed*dt;
  if(canWalk(pose.x+dx,pose.z,obstacles))pose.x+=dx;
  if(canWalk(pose.x,pose.z+dz,obstacles))pose.z+=dz;
}
