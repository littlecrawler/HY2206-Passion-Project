import * as THREE from 'three';
import { rooms } from './museum-data.js?v=20261123-dates-redemption';

export function roomPoint(index, x, y, z) {
  const room = rooms[index];
  return new THREE.Vector3(x, y, z)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), room.angle)
    .add(new THREE.Vector3(room.x, 0, room.z));
}

// One continuous arc replaces the chain of short aisle and doorway turns.
// Collinear end controls keep the camera aligned while crossing each doorway.
class GalleryRoute extends THREE.Curve {
  constructor(start, previous, index, end) {
    super();
    const reach = THREE.MathUtils.clamp(start.distanceTo(end) * .4, 6, 15);
    const exit = previous < 0 ? end.clone().sub(start).normalize()
      : roomPoint(previous, .5, 3.6, 7.5).sub(start).normalize();
    const entry = index < 0 ? start.clone().sub(end).normalize()
      : roomPoint(index, 0, 0, 1).sub(roomPoint(index, 0, 0, 0));
    this.controls = [start.clone(), start.clone().addScaledVector(exit, reach),
      start.clone().addScaledVector(exit, reach * 2), end.clone().addScaledVector(entry, reach * 2),
      end.clone().addScaledVector(entry, reach), end.clone()];
    this.arcLengthDivisions = 600;
  }
  getPoint(t,target=new THREE.Vector3()) {
    target.set(0,0,0);
    const coefficients=[1,5,10,10,5,1];
    this.controls.forEach((point,i)=>target.addScaledVector(point,coefficients[i]*t**i*(1-t)**(5-i)));
    return target;
  }
}

export function travelPath(start, previous, index, end) {
  return new GalleryRoute(start, previous, index, end);
}

// Schedule by curvature and acceleration, rather than forcing every bend
// through at the same speed. The camera slows before a turn, then accelerates.
export function travelMotion(path) {
  const length=path.getLength(),count=Math.max(300,Math.ceil(length*20));
  const duration=THREE.MathUtils.clamp(2100+length*16,2700,3500);
  // Measure each interval: a Bezier parameter is not distance along the route.
  const points=Array.from({length:count+1},(_,i)=>path.getPoint(i/count));
  const lengths=points.map((point,i)=>i?point.distanceTo(points[i-1]):0);
  const speeds=points.map((point,i)=>{
    if(!i||i===count)return 0;
    const incoming=point.clone().sub(points[i-1]),outgoing=points[i+1].clone().sub(point);
    const curvature=incoming.angleTo(outgoing)/Math.max(.001,(lengths[i]+lengths[i+1])/2);
    return Math.min(18,Math.sqrt(8/Math.max(curvature,.0001)),1.05/Math.max(curvature,.0001));
  });
  const acceleration=22;
  for(let i=1;i<=count;i++)speeds[i]=Math.min(speeds[i],Math.sqrt(speeds[i-1]**2+2*acceleration*lengths[i]));
  for(let i=count-1;i>=0;i--)speeds[i]=Math.min(speeds[i],Math.sqrt(speeds[i+1]**2+2*acceleration*lengths[i+1]));
  const times=[0];
  for(let i=1;i<=count;i++)times.push(times[i-1]+2*lengths[i]/Math.max(.0001,speeds[i-1]+speeds[i]));
  return {
    duration,
    sample(elapsed){
      const seconds=THREE.MathUtils.clamp(elapsed/duration,0,1)*times[count];
      let lo=0,hi=count;
      while(hi-lo>1){const middle=(lo+hi)>>1;if(times[middle]<=seconds)lo=middle;else hi=middle;}
      const dt=seconds-times[lo],span=times[hi]-times[lo];
      const distance=speeds[lo]*dt+.5*(speeds[hi]-speeds[lo])/span*dt*dt;
      const progress=(lo+THREE.MathUtils.clamp(distance/Math.max(.0001,lengths[hi]),0,1))/count;
      return {position:path.getPoint(progress),progress};
    }
  };
}
