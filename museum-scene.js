import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { Reflector } from './vendor/three/Reflector.js';
import { rooms } from './museum-data.js?v=20261122-atrium';
import { photos } from './exhibit-data.js';

const clamp = THREE.MathUtils.clamp;
const ease = t => t * t * (3 - 2 * t);
const vector = (...v) => new THREE.Vector3(...v);

// The architecture surrounds documentary photographs; no object replicas are generated.
export async function createMuseum(canvas, { onSelect, onRoom, onTravel, onReady, initialRoom = -1, reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 781 ? 1.3 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111922'); scene.fog = new THREE.Fog('#111922', 47, 95);
  const environment = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, .04);
  scene.environment = env.texture; scene.environmentIntensity = .5;
  environment.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(61, 1, .1, 130);
  scene.add(new THREE.HemisphereLight(0xd2e4ef, 0x293039, 1.55));
  const skylight = new THREE.DirectionalLight(0xeaf4fa, 1.5);
  skylight.position.set(-7, 14, 12); scene.add(skylight);
  const galleryLight = new THREE.PointLight(0xffe9d0, 180, 18, 1.8); scene.add(galleryLight);
  const mats = {
    wall: new THREE.MeshStandardMaterial({ color: '#36404a', roughness: .85 }),
    gallery: new THREE.MeshStandardMaterial({ color: '#29333e', roughness: .9 }),
    stone: new THREE.MeshStandardMaterial({ color: '#343d44', roughness: .45, metalness: .22 }),
    dark: new THREE.MeshStandardMaterial({ color: '#111820', roughness: .55, metalness: .35 }),
    metal: new THREE.MeshStandardMaterial({ color: '#7a8589', roughness: .32, metalness: .85 }),
    warm: new THREE.MeshBasicMaterial({ color: '#dccbb2', toneMapped: false }),
    white: new THREE.MeshBasicMaterial({ color: '#c4d4dc', toneMapped: false })
  };
  const cube = new THREE.BoxGeometry(1, 1, 1), resources = [], selectables = [];
  const textures = new Map(), photoTasks = [], loader = new THREE.TextureLoader();
  let current = initialRoom, paused = false, disposed = false, frame = 0, moving = null;
  let small = false, width = 1, height = 1, yaw = 0, pitch = 0, pointer = null;
  const pose = { position: vector(), target: vector() };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function box(parent, w, h, d, x, y, z, material = mats.wall) {
    const mesh = new THREE.Mesh(cube, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function writing(parent, lines, w, h, x, y, z, { color = '#e0e8eb', size = 70 } = {}) {
    const c = document.createElement('canvas'); c.width = 1536; c.height = Math.round(1536 * h / w);
    const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const values = Array.isArray(lines) ? lines : [lines];
    values.forEach((value, i) => {
      ctx.font = (i ? '400 ' : '500 ') + (i ? size * .58 : size) + 'px "Trebuchet MS","Microsoft JhengHei",sans-serif';
      ctx.fillText(value, c.width / 2, c.height * (i + .5) / values.length, c.width - 40);
    });
    const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; resources.push(map);
    const mat = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false }); resources.push(mat);
    const geo = new THREE.PlaneGeometry(w, h); resources.push(geo);
    const mesh = new THREE.Mesh(geo, mat); mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  function loadPhoto(id) {
    if (!textures.has(id)) textures.set(id, new Promise(resolve => {
      loader.load(photos[id].src, map => {
        map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        if (disposed) { map.dispose(); resolve(null); return; }
        resources.push(map); resolve(map); requestFrame();
      }, undefined, () => resolve(null));
    }));
    return textures.get(id);
  }
  function photograph(parent, id, roomIndex, x, y, z, w = 6.6, h = 4.5, angle = 0) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = angle; parent.add(group);
    box(group, w + .22, h + .22, .14, 0, 0, -.04, mats.metal);
    box(group, w, h, .18, 0, 0, 0, mats.dark);
    box(group, w + .05, .025, .12, 0, h / 2 + .26, .08, mats.warm);
    photoTasks.push(loadPhoto(id).then(map => {
      if (disposed || !map) return;
      const ratio = map.image.width / map.image.height;
      const pw = Math.min(w - .18, (h - .18) * ratio), ph = pw / ratio;
      const geo = new THREE.PlaneGeometry(pw, ph); resources.push(geo);
      const mat = new THREE.MeshBasicMaterial({ map, toneMapped: false }); resources.push(mat);
      const photo = new THREE.Mesh(geo, mat); photo.position.z = .101; photo.userData = { photo: id, room: roomIndex };
      group.add(photo); selectables.push(photo); requestFrame();
    }));
    writing(group, photos[id].title, w, .55, 0, -h / 2 - .55, .05, { size: 70 });
  }
  function localPoint(index, x, y, z) {
    const room = rooms[index];
    return vector(x, y, z).applyAxisAngle(vector(0, 1, 0), room.angle).add(vector(room.side * 16, 0, room.z));
  }

  // Four bays on each side are connected by a continuous central atrium.
  const hall = new THREE.Group(); scene.add(hall);
  box(hall, 21, .35, 54, 0, -.2, -2, mats.stone);
  const mirror = new Reflector(new THREE.PlaneGeometry(20.8, 53.8), {
    textureWidth: innerWidth < 781 ? 512 : 1024, textureHeight: 1024, color: 0x6b7c85, clipBias: .004
  });
  mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, -.013, -2); scene.add(mirror);
  const floorOverlay = new THREE.Mesh(new THREE.PlaneGeometry(20.8, 53.8), new THREE.MeshStandardMaterial({
    color: '#303c47', roughness: .38, metalness: .25, transparent: true, opacity: .83, depthWrite: false
  }));
  floorOverlay.rotation.x = -Math.PI / 2; floorOverlay.position.set(0, -.006, -2); scene.add(floorOverlay);
  resources.push(mirror.geometry, floorOverlay.geometry, floorOverlay.material);
  for (let z = -27; z <= 25; z += 2.75) box(hall, 20.7, .008, .018, 0, .003, z, mats.dark);
  for (let x = -8.25; x <= 8.25; x += 2.75) box(hall, .018, .008, 53.7, x, .004, -2, mats.dark);
  for (const side of [-1, 1]) {
    box(hall, .045, .014, 51, side * 8.8, .015, -1.5, mats.warm);
    box(hall, 1.5, 1.1, 54, side * 10.5, 8.9, -2, mats.stone);
    box(hall, .07, .06, 53, side * 9.55, 8.22, -2, mats.white);
    for (let z = -24.5; z <= 20; z += 11) {
      box(hall, .85, 8.3, .85, side * 9.8, 4.15, z, mats.stone);
      box(hall, .055, 7.3, .92, side * 9.34, 4.1, z, mats.metal);
    }
  }
  box(hall, 24, .5, 54, 0, 10.2, -2, mats.dark);
  box(hall, 8.4, .06, 52, 0, 9.89, -2, mats.white);
  for (let z = -27; z <= 25; z += 5.5) {
    box(hall, 21, .35, .22, 0, 9.1, z, mats.stone);
    box(hall, 8.4, .06, .1, 0, 9.84, z, mats.dark);
  }
  box(hall, 22, 10, .5, 0, 5, -27.5, mats.wall);
  writing(hall, ['Money in China', 'A history in eight galleries'], 13, 2.3, 0, 5.7, -27.23, { size: 140 });
  box(hall, 12, .035, .07, 0, 3.9, -27.15, mats.warm);
  for (const z of [-14, 8]) {
    box(hall, 4, .25, 1.3, 0, .8, z, mats.stone);
    box(hall, 3.5, .6, .6, 0, .38, z, mats.dark);
  }
  rooms.forEach((room, index) => {
    const group = new THREE.Group(); group.position.set(room.side * 16, 0, room.z); group.rotation.y = room.angle; scene.add(group);
    box(group, 9, .3, 12.2, 0, -.18, 0, mats.stone);
    box(group, 9, 8.4, .3, 0, 4.2, -6.1, mats.gallery);
    box(group, .3, 8.4, 12.3, -4.4, 4.2, 0, mats.gallery);
    box(group, .3, 8.4, 12.3, 4.4, 4.2, 0, mats.gallery);
    box(group, 9, .35, 12.4, 0, 8.5, 0, mats.dark);
    box(group, 1.75, 8.5, .6, -3.62, 4.25, 6, mats.wall);
    box(group, 1.75, 8.5, .6, 3.62, 4.25, 6, mats.wall);
    box(group, 5.5, 2, .6, 0, 7.5, 6, mats.wall);
    for (const x of [-2.76, 2.76]) box(group, .06, 6.5, .75, x, 3.25, 6.05, mats.warm);
    box(group, 5.55, .06, .75, 0, 6.49, 6.05, mats.warm);
    box(group, 4.7, .035, .9, 0, .015, 6.1, mats.metal);
    writing(group, room.label, 5.25, .66, 0, 7.25, 6.32, { size: 142 });
    writing(group, room.date, 5.3, .4, 0, 6.72, 6.32, { size: 80, color: '#bccbd2' });
    const portal = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 6.4), new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }));
    portal.position.set(0, 3.2, 6.4); portal.userData.room = index; group.add(portal); selectables.push(portal); resources.push(portal.geometry, portal.material);
    box(group, 6.7, .045, .12, 0, 7.75, -4.8, mats.white);
    photograph(group, room.photos[0], index, .5, 3.65, -5.84);
    room.photos.slice(1).forEach((id, n) => {
      const side = n % 2 ? 1 : -1;
      photograph(group, id, index, side * 4.2, 3.35, -.6, 3.5, 3.6, -side * Math.PI / 2);
    });
  });

  function destination(index) {
    if (index < 0) return { position: vector(0, small ? 4.4 : 5.1, small ? 27 : 24), target: vector(0, 4.1, -13) };
    const distance=8.5, framingX=.5-.3*distance*Math.tan(THREE.MathUtils.degToRad(25))*camera.aspect;
    return {
      position: localPoint(index, small ? .5 : framingX, small ? 3.5 : 3.6, small ? 5.4 : 2.65),
      target: localPoint(index, small ? .5 : framingX, small ? .8 : 3.5, -5.85)
    };
  }
  function cameraUpdate() {
    camera.position.copy(pose.position);
    const spherical = new THREE.Spherical().setFromVector3(pose.target.clone().sub(pose.position));
    spherical.theta += yaw; spherical.phi = clamp(spherical.phi + pitch, .35, Math.PI - .35);
    camera.lookAt(pose.position.clone().add(new THREE.Vector3().setFromSpherical(spherical)));
  }
  function setLight(index) {
    galleryLight.intensity = index < 0 ? 0 : 100;
    if (index >= 0) galleryLight.position.copy(localPoint(index, 0, 7, 1));
  }
  function show(index, animate = true) {
    const previous = current; current = index; yaw = pitch = 0;
    camera.fov=small?(index<0?76:68):(index<0?61:50);camera.updateProjectionMatrix();
    const end = destination(index); setLight(index);
    if (!animate || reducedMotion || previous === index) {
      moving = null; pose.position.copy(end.position); pose.target.copy(end.target); onTravel?.(false); requestFrame(); return;
    }
    // The route goes through the doorways, never directly through a gallery wall.
    const points = [pose.position.clone()];
    if (previous >= 0) {
      points.push(localPoint(previous, 0, 3.7, 4.8), localPoint(previous, 0, 3.9, 7.3));
      points.push(vector(rooms[previous].side * 5.6, 4.1, rooms[previous].z));
    }
    if (index >= 0) {
      points.push(vector(rooms[index].side * 5.6, 4.1, rooms[index].z));
      points.push(localPoint(index, 0, 3.9, 7.3), localPoint(index, 0, 3.7, 4.8));
    }
    points.push(end.position);
    const compact = points.filter((point, i) => !i || point.distanceTo(points[i - 1]) > .1);
    const distances = [0]; for (let i = 1; i < compact.length; i++) distances.push(distances.at(-1) + compact[i].distanceTo(compact[i - 1]));
    moving = { start: performance.now(), duration: Math.min(2800, 1200 + distances.at(-1) * 28), points: compact, distances, fromTarget: pose.target.clone(), end };
    onTravel?.(true); requestFrame();
  }
  function tick(now) {
    frame = 0; if (paused || disposed || document.hidden) return;
    if (moving) {
      const t = clamp((now - moving.start) / moving.duration, 0, 1), progress = ease(t), travelled = progress * moving.distances.at(-1);
      let segment = 1; while (segment < moving.distances.length - 1 && moving.distances[segment] < travelled) segment++;
      const start = moving.distances[segment - 1], span = moving.distances[segment] - start;
      pose.position.lerpVectors(moving.points[segment - 1], moving.points[segment], span ? (travelled - start) / span : 1);
      pose.target.lerpVectors(moving.fromTarget, moving.end.target, progress);
      if (t === 1) { pose.position.copy(moving.end.position); pose.target.copy(moving.end.target); moving = null; onTravel?.(false); }
    }
    cameraUpdate(); renderer.render(scene, camera); if (moving) requestFrame();
  }
  function requestFrame() { if (!frame && !paused && !disposed && !document.hidden) frame = requestAnimationFrame(tick); }
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height; small = width <= 780;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.fov = small ? (current<0?76:68) : (current<0?61:50); camera.updateProjectionMatrix();
    const end = destination(current); moving = null; pose.position.copy(end.position); pose.target.copy(end.target); onTravel?.(false); requestFrame();
  }
  function hit(event) {
    const rect = canvas.getBoundingClientRect(); ndc.set((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(selectables).find(result => current < 0 ? !result.object.userData.photo : (result.object.userData.photo && result.object.userData.room === current));
  }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || moving) return;
    pointer = { x: event.clientX, y: event.clientY, yaw, pitch, moved: false }; canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (moving) return;
    if (pointer) {
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
      if (Math.hypot(dx, dy) > 6) pointer.moved = true;
      yaw = clamp(pointer.yaw - dx * .0022, current < 0 ? -.8 : -.6, current < 0 ? .8 : .6);
      pitch = clamp(pointer.pitch - dy * .0017, -.32, .32); canvas.style.cursor = 'grabbing'; requestFrame();
    } else canvas.style.cursor = hit(event) ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointerup', event => {
    if (!pointer) return; const clicked = !pointer.moved; pointer = null; canvas.style.cursor = 'grab';
    if (!clicked || moving) return; const result = hit(event); if (!result) return;
    if (current < 0) onRoom?.(result.object.userData.room); else onSelect?.(result.object.userData.photo);
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestFrame(); }
  document.addEventListener('visibilitychange', visibility);
  const observer = new ResizeObserver(resize); observer.observe(canvas.parentElement);
  resize(); setLight(current); await Promise.all(photoTasks); requestFrame(); onReady?.();
  return {
    show,
    setPaused(value) { paused = value; if (value) { cancelAnimationFrame(frame); frame = 0; } else requestFrame(); },
    setReducedMotion(value) { reducedMotion = value; if (value && moving) show(current, false); },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
      resources.forEach(resource => resource.dispose()); Object.values(mats).forEach(mat => mat.dispose()); cube.dispose(); mirror.dispose(); env.dispose(); renderer.dispose();
    }
  };
}
