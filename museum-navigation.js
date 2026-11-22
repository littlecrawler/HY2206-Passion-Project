import * as THREE from 'three';
import { rooms } from './museum-data.js?v=20261122-museum-guide';

export function roomPoint(index, x, y, z) {
  const room = rooms[index];
  return new THREE.Vector3(x, y, z)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), room.angle)
    .add(new THREE.Vector3(room.x, 0, room.z));
}

// Round each turn within a small triangle around its waypoint. An unconstrained
// spline can overshoot a doorway even when all of its waypoints are inside it.
function roundedPath(points) {
  const path = new THREE.CurvePath();
  const distinct = points.filter((point, i) => !i || point.distanceTo(points[i - 1]) > .01);
  let last = distinct[0];
  for (let i = 1; i < distinct.length - 1; i++) {
    const corner = distinct[i];
    const radius = Math.min(.45, corner.distanceTo(distinct[i - 1]) * .2, corner.distanceTo(distinct[i + 1]) * .2);
    const before = corner.clone().addScaledVector(distinct[i - 1].clone().sub(corner).normalize(), radius);
    const after = corner.clone().addScaledVector(distinct[i + 1].clone().sub(corner).normalize(), radius);
    path.add(new THREE.LineCurve3(last, before));
    path.add(new THREE.QuadraticBezierCurve3(before, corner, after));
    last = after;
  }
  path.add(new THREE.LineCurve3(last, distinct.at(-1)));
  return path;
}

export function travelPath(start, previous, index, end) {
  const points = [start.clone()];
  const hallRadius = 18;
  const approach = room => roomPoint(room, 0, 3.6, 8.5);
  const bearing = room => {
    const door = approach(room);
    return Math.atan2(door.x, -door.z);
  };
  const aisle = angle => new THREE.Vector3(Math.sin(angle) * hallRadius, 3.6, -Math.cos(angle) * hallRadius);
  if (previous >= 0) {
    points.push(roomPoint(previous, 0, 3.6, 4.4), approach(previous), aisle(bearing(previous)));
  }
  if (index >= 0) {
    if (previous >= 0) {
      const from = bearing(previous), to = bearing(index), steps = Math.ceil(Math.abs(to - from) / .18);
      for (let i = 1; i < steps; i++) points.push(aisle(THREE.MathUtils.lerp(from, to, i / steps)));
    }
    points.push(aisle(bearing(index)), approach(index), roomPoint(index, 0, 3.6, 4.4));
  }
  points.push(end.clone());
  return roundedPath(points);
}
