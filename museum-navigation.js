import * as THREE from 'three';
import { rooms } from './museum-data.js?v=20261122-museum-title';

export function roomPoint(index, x, y, z) {
  const room = rooms[index];
  return new THREE.Vector3(x, y, z)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), room.angle)
    .add(new THREE.Vector3(room.x, 0, room.z));
}

// A quintic bend has zero curvature at both ends, so joining it to a straight
// aisle does not introduce the sudden steering of a short quadratic fillet.
class AisleBend extends THREE.Curve {
  constructor(before, corner, after) {
    super();
    this.controls = [before, before.clone().lerp(corner,.4), before.clone().lerp(corner,.8),
      after.clone().lerp(corner,.8), after.clone().lerp(corner,.4), after];
  }
  getPoint(t,target=new THREE.Vector3()) {
    target.set(0,0,0);
    const coefficients=[1,5,10,10,5,1];
    this.controls.forEach((point,i)=>target.addScaledVector(point,coefficients[i]*t**i*(1-t)**(5-i)));
    return target;
  }
}

function roundedPath(points) {
  const path = new THREE.CurvePath();
  const distinct = points.filter((point, i) => !i || point.position.distanceTo(points[i - 1].position) > .01);
  let last = distinct[0].position;
  for (let i = 1; i < distinct.length - 1; i++) {
    const corner = distinct[i].position, previous=distinct[i-1].position, next=distinct[i+1].position;
    const radius = Math.min(distinct[i].radius, corner.distanceTo(previous)*.42, corner.distanceTo(next)*.42);
    const before = corner.clone().addScaledVector(previous.clone().sub(corner).normalize(), radius);
    const after = corner.clone().addScaledVector(next.clone().sub(corner).normalize(), radius);
    path.add(new THREE.LineCurve3(last, before));
    path.add(new AisleBend(before, corner, after));
    last = after;
  }
  path.add(new THREE.LineCurve3(last, distinct.at(-1).position));
  return path;
}

export function travelPath(start, previous, index, end) {
  const waypoint = (position,radius=5.5) => ({position,radius});
  const points = [waypoint(start.clone())];
  const hallRadius = 18;
  const approach = (room,x=0) => roomPoint(room, x, 3.6, 9.5);
  const bearing = room => {
    const door = approach(room);
    return Math.atan2(door.x, -door.z);
  };
  const aisle = angle => new THREE.Vector3(Math.sin(angle) * hallRadius, 3.6, -Math.cos(angle) * hallRadius);
  if (previous >= 0) {
    points.push(waypoint(approach(previous),2.3),waypoint(aisle(bearing(previous))));
  }
  if (index >= 0) {
    if (previous >= 0) {
      const from = bearing(previous), to = bearing(index), steps = Math.ceil(Math.abs(to - from) / .18);
      for (let i = 1; i < steps; i++) points.push(waypoint(aisle(THREE.MathUtils.lerp(from, to, i / steps))));
    }
    // Align with the final viewing position before the doorway. In particular,
    // do not overshoot the mobile viewpoint and reverse inside the gallery.
    const localEnd=end.clone().sub(new THREE.Vector3(rooms[index].x,0,rooms[index].z))
      .applyAxisAngle(new THREE.Vector3(0,1,0),-rooms[index].angle);
    points.push(waypoint(aisle(bearing(index))),waypoint(approach(index,localEnd.x),2.3));
  }
  points.push(waypoint(end.clone()));
  return roundedPath(points);
}

// Schedule by curvature and acceleration, rather than forcing every bend
// through at the same speed. The camera slows before a turn, then accelerates.
export function travelMotion(path) {
  const count=Math.max(300,Math.ceil(path.getLength()*20));
  // CurvePath.getPoint already measures progress by distance along its curves.
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
    duration:times[count]*1000,
    sample(elapsed){
      const seconds=THREE.MathUtils.clamp(elapsed/1000,0,times[count]);
      let lo=0,hi=count;
      while(hi-lo>1){const middle=(lo+hi)>>1;if(times[middle]<=seconds)lo=middle;else hi=middle;}
      const dt=seconds-times[lo],span=times[hi]-times[lo];
      const distance=speeds[lo]*dt+.5*(speeds[hi]-speeds[lo])/span*dt*dt;
      const progress=(lo+THREE.MathUtils.clamp(distance/Math.max(.0001,lengths[hi]),0,1))/count;
      return {position:path.getPoint(progress),progress};
    }
  };
}
