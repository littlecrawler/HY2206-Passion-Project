import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { buildArchitecture } from './museum-architecture.js?v=20261122-museum-directory';
import { rooms, hallViewZ } from './museum-data.js?v=20261122-museum-directory';
import { photos } from './exhibit-data.js?v=20261122-museum-directory';

const clamp = THREE.MathUtils.clamp;
const ease = t => t * t * (3 - 2 * t);
const vector = (...v) => new THREE.Vector3(...v);

// The architecture surrounds documentary photographs; no object replicas are generated.
export async function createMuseum(canvas, { onSelect, onRoom, onHover, onTravel, onReady, onObjectPositions, initialRoom = -1, reducedMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 781 ? 1.3 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1722'); scene.fog = new THREE.Fog('#0b1722', 40, 85);
  const environment = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, .04);
  scene.environment = env.texture; scene.environmentIntensity = .32;
  environment.dispose(); pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(61, 1, .1, 130);
  scene.add(new THREE.HemisphereLight(0xd2e4ef, 0x18222c, .95));
  const skylight = new THREE.DirectionalLight(0xeaf4fa, 2.4);
  skylight.position.set(-7, 16, 8);skylight.castShadow=true;skylight.shadow.mapSize.set(2048,2048);skylight.shadow.camera.left=-25;skylight.shadow.camera.right=25;skylight.shadow.camera.top=25;skylight.shadow.camera.bottom=-25;skylight.shadow.normalBias=.04;skylight.shadow.bias=-.0002;scene.add(skylight);
  const galleryLight = new THREE.PointLight(0xffe9d0, 180, 18, 1.8); scene.add(galleryLight);
  const mats = {
    wall: new THREE.MeshStandardMaterial({ color: '#253744', roughness: .85 }),
    gallery: new THREE.MeshStandardMaterial({ color: '#1e2c37', roughness: .9 }),
    stone: new THREE.MeshStandardMaterial({ color: '#343d44', roughness: .45, metalness: .22 }),
    dark: new THREE.MeshStandardMaterial({ color: '#111820', roughness: .55, metalness: .35 }),
    metal: new THREE.MeshStandardMaterial({ color: '#7a8589', roughness: .32, metalness: .85 }),
    warm: new THREE.MeshBasicMaterial({ color: '#c4d8dc', toneMapped: false }),
    white: new THREE.MeshBasicMaterial({ color: '#c4d4dc', toneMapped: false })
  };
  const cube = new THREE.BoxGeometry(1, 1, 1), resources = [], selectables = [];
  const textures = new Map(), photoTargets = new Map(), photoTasks = [], loader = new THREE.TextureLoader();
  let current = initialRoom, paused = false, disposed = false, frame = 0, moving = null;
  let small = false, width = 1, height = 1, yaw = 0, pitch = 0, pointer = null, focusedPhoto = null;
  const pose = { position: vector(), target: vector() };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function box(parent, w, h, d, x, y, z, material = mats.wall) {
    const mesh = new THREE.Mesh(cube, material); mesh.scale.set(w, h, d); mesh.position.set(x, y, z);mesh.castShadow=true;mesh.receiveShadow=true; parent.add(mesh); return mesh;
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
  function photograph(parent, id, roomIndex, x, y, z, w = 6.6, h = 4.5, angle = 0, hallPreview = false) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = angle; parent.add(group);
    const target = {group,w,h,side:Math.abs(angle)>.1};
    if(!hallPreview)photoTargets.set(roomIndex+':'+id,target);
    box(group, w + .22, h + .22, .14, 0, 0, -.04, mats.metal);
    box(group, w, h, .18, 0, 0, 0, mats.dark);
    box(group, w + .05, .025, .12, 0, h / 2 + .26, .08, mats.warm);
    photoTasks.push(loadPhoto(id).then(map => {
      if (disposed || !map) return;
      const ratio = map.image.width / map.image.height;
      const pw = Math.min(w - .18, (h - .18) * ratio), ph = pw / ratio;
      target.w=pw;target.h=ph;
      const geo = new THREE.PlaneGeometry(pw, ph); resources.push(geo);
      const mat = new THREE.MeshBasicMaterial({ map, toneMapped: false }); resources.push(mat);
      const photo = new THREE.Mesh(geo, mat); photo.position.z = .101; photo.userData = { photo: id, room: roomIndex, hallPreview };
      group.add(photo); selectables.push(photo); requestFrame();
      if(!hallPreview&&roomIndex===current&&focusedPhoto===id)focusPhoto(id,false);
    }));
    if(!hallPreview)writing(group, photos[id].title, w, .55, 0, -h / 2 - .55, .05, { size: 70 });
  }
  function localPoint(index, x, y, z) {
    const room = rooms[index];
    return vector(x, y, z).applyAxisAngle(vector(0, 1, 0), room.angle).add(vector(room.x, 0, room.z));
  }

  const architecture = buildArchitecture(scene, { renderer, box, writing, photograph, mats, resources, selectables });

  function objectViewport() {
    if(small)return {fraction:.42,offsetY:height*.17};
    const nav=document.getElementById('room-objects');
    const top=Math.max(145,(nav?.getBoundingClientRect().bottom||125)-canvas.getBoundingClientRect().top+22),bottom=height-112;
    return {fraction:Math.max(.2,Math.min(.7,(bottom-top)/height)),offsetY:height/2-(top+bottom)/2};
  }
  function destination(index) {
    if (index < 0) return { position: vector(0,small?5.3:5.4,hallViewZ), target: vector(0,small?2.3:3.9,-9) };
    if(focusedPhoto){
      const object=photoTargets.get(index+':'+focusedPhoto);
      if(object){
        const v=objectViewport().fraction,h=small?.86:.57;
        const need=Math.max((object.h+.7)/v,(object.w+.35)/(camera.aspect*h));
        const limit=object.side?7.2:10.3;
        camera.fov=Math.max(small?68:50,THREE.MathUtils.radToDeg(2*Math.atan(need/(2*limit))));
        camera.updateProjectionMatrix();
        const distance=need/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
        const target=object.group.localToWorld(vector(0,-.12,.12));
        const normal=vector(0,0,1).applyQuaternion(object.group.getWorldQuaternion(new THREE.Quaternion()));
        return {target,position:target.clone().addScaledVector(normal,distance)};
      }
    }
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
    const previous = current; current = index; yaw = pitch = 0; focusedPhoto=null;
    camera.fov=small?(index<0?68:68):(index<0?63:50);setFraming();camera.updateProjectionMatrix();
    const end = destination(index); setLight(index);
    if (!animate || reducedMotion || previous === index) {
      moving = null; pose.position.copy(end.position); pose.target.copy(end.target); onTravel?.(false); requestFrame(); return;
    }
    // The route goes through the doorways, never directly through a gallery wall.
    const points = [pose.position.clone()];
    if (previous >= 0) {
      points.push(localPoint(previous, 0, 3.7, 4.8), localPoint(previous, 0, 3.9, 7.3));
      points.push(vector(Math.sin(rooms[previous].theta)*11,4.1,-Math.cos(rooms[previous].theta)*11));
    }
    if (index >= 0) {
      if(previous>=0){const from=rooms[previous].theta,to=rooms[index].theta,steps=Math.ceil(Math.abs(to-from)/.18);for(let i=1;i<steps;i++){const a=THREE.MathUtils.lerp(from,to,i/steps);points.push(vector(Math.sin(a)*11,4.1,-Math.cos(a)*11));}}
      else {const side=rooms[index].theta<0?-1:1;points.push(vector(side*10,4.8,4));}
      points.push(vector(Math.sin(rooms[index].theta)*11,4.1,-Math.cos(rooms[index].theta)*11));
      points.push(localPoint(index, 0, 3.9, 7.3), localPoint(index, 0, 3.7, 4.8));
    }
    points.push(end.position);
    const compact = points.filter((point, i) => !i || point.distanceTo(points[i - 1]) > .1);
    const distances = [0]; for (let i = 1; i < compact.length; i++) distances.push(distances.at(-1) + compact[i].distanceTo(compact[i - 1]));
    moving = { start: performance.now(), duration: Math.min(2800, 1200 + distances.at(-1) * 28), points: compact, distances, curve:new THREE.CatmullRomCurve3(compact,false,'centripetal'), fromTarget: pose.target.clone(), end };
    onTravel?.(true); requestFrame();
  }
  function focusPhoto(id,animate=true) {
    if(current<0||!photoTargets.has(current+':'+id))return;
    focusedPhoto=id;yaw=pitch=0;setFraming();
    const end=destination(current);
    if(!animate||reducedMotion||pose.position.distanceTo(end.position)<.01){moving=null;pose.position.copy(end.position);pose.target.copy(end.target);onTravel?.(false);requestFrame();return;}
    const points=[pose.position.clone(),end.position],distance=points[0].distanceTo(points[1]);
    moving={start:performance.now(),duration:800,distances:[0,distance],curve:new THREE.CatmullRomCurve3(points,false,'centripetal'),fromTarget:pose.target.clone(),end};
    onTravel?.(true);requestFrame();
  }
  function positionObjectButtons() {
    if(current<0||!onObjectPositions)return;
    const positions=rooms[current].photos.map(id=>{
      const object=photoTargets.get(current+':'+id);
      const anchor=object.group.localToWorld(vector(0,-object.h*.3,.18));
      const normal=vector(0,0,1).applyQuaternion(object.group.getWorldQuaternion(new THREE.Quaternion()));
      const facing=normal.dot(camera.position.clone().sub(anchor))>0;
      const projected=anchor.project(camera),x=(projected.x+1)*width/2,y=(1-projected.y)*height/2;
      return {id,x,y,visible:!moving&&facing&&projected.z>-1&&projected.z<1&&x>65&&x<width-65&&y>155&&y<height-(small?330:120)};
    });
    onObjectPositions(positions);
  }
  function tick(now) {
    frame = 0; if (paused || disposed || document.hidden) return;
    if (moving) {
      const t = clamp((now - moving.start) / moving.duration, 0, 1), progress = ease(t), travelled = progress * moving.distances.at(-1);
      let segment = 1; while (segment < moving.distances.length - 1 && moving.distances[segment] < travelled) segment++;
      const start = moving.distances[segment - 1], span = moving.distances[segment] - start;
      pose.position.copy(moving.curve.getPointAt(progress));
      pose.target.lerpVectors(moving.fromTarget, moving.end.target, progress);
      if (t === 1) { pose.position.copy(moving.end.position); pose.target.copy(moving.end.target); moving = null; onTravel?.(false); }
    }
    cameraUpdate(); renderer.render(scene, camera);positionObjectButtons(); if (moving) requestFrame();
  }
  function requestFrame() { if (!frame && !paused && !disposed && !document.hidden) frame = requestAnimationFrame(tick); }
  function setFraming() {
    if(current<0&&!small)camera.setViewOffset(width,height,-Math.min(350,width*.25)/2,0,width,height);
    else if(focusedPhoto)camera.setViewOffset(width,height,small?0:-width*.14,objectViewport().offsetY,width,height);
    else camera.clearViewOffset();
  }
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height; small = width <= 780;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.fov = small ? 68 : (current<0?63:50);setFraming(); camera.updateProjectionMatrix();
    const end = destination(current); moving = null; pose.position.copy(end.position); pose.target.copy(end.target); onTravel?.(false); requestFrame();
  }
  function hit(event) {
    const rect = canvas.getBoundingClientRect(); ndc.set((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(selectables).find(result => current < 0 ? (!result.object.userData.photo||result.object.userData.hallPreview) : (result.object.userData.photo && result.object.userData.room === current));
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
    } else {const result=hit(event),index=current<0&&result?result.object.userData.room:-1;canvas.style.cursor=result?'pointer':'grab';architecture.highlight(index);const rect=canvas.getBoundingClientRect();onHover?.(index,event.clientX-rect.left,event.clientY-rect.top);requestFrame();}
  });
  canvas.addEventListener('pointerup', event => {
    if (!pointer) return; const clicked = !pointer.moved; pointer = null; canvas.style.cursor = 'grab';
    if (!clicked || moving) return; const result = hit(event); if (!result) return;
    if (current < 0) onRoom?.(result.object.userData.room); else onSelect?.(result.object.userData.photo);
  });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('pointerleave',()=>{architecture.highlight(-1);onHover?.(-1);requestFrame();});
  function visibility() { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else requestFrame(); }
  document.addEventListener('visibilitychange', visibility);
  const observer = new ResizeObserver(resize); observer.observe(canvas.parentElement);
  resize();setLight(current);cameraUpdate();renderer.render(scene,camera);onReady?.();
  Promise.all(photoTasks).then(requestFrame);
  return {
    show,focusPhoto,
    setPaused(value) { paused = value; if (value) { cancelAnimationFrame(frame); frame = 0; } else requestFrame(); },
    setReducedMotion(value) { reducedMotion = value; if (value && moving) {if(focusedPhoto)focusPhoto(focusedPhoto,false);else show(current, false);} },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
      resources.forEach(resource => resource.dispose()); Object.values(mats).forEach(mat => mat.dispose()); cube.dispose(); env.dispose(); renderer.dispose();
    }
  };
}
