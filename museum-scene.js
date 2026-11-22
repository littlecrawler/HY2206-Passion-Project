import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { rooms } from './museum-data.js';
import { photos } from './exhibit-data.js';
import { makeSculpture } from './museum-objects.js';

const SPACING=22;
const TAU=Math.PI*2;
const clamp=THREE.MathUtils.clamp;

export async function createMuseum(canvas, { onSelect, onReady, initialRoom=2, reducedMotion=false }) {
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<781?1.5:1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x070f1c); scene.fog=new THREE.Fog(0x070f1c,23,58);
  const environment=new RoomEnvironment();
  const pmrem=new THREE.PMREMGenerator(renderer);
  const envTarget=pmrem.fromScene(environment,.035);
  scene.environment=envTarget.texture;
  scene.environmentIntensity=.55;
  environment.dispose(); pmrem.dispose();
  const camera=new THREE.PerspectiveCamera(48,1,.1,100);
  const mainLight=new THREE.SpotLight(0xffe5bc,180,42,Math.PI*.28,.62,1.7);
  mainLight.castShadow=true; mainLight.shadow.mapSize.set(innerWidth<781?512:1024,innerWidth<781?512:1024);
  mainLight.shadow.bias=-.0004; mainLight.shadow.normalBias=.025;
  scene.add(mainLight,mainLight.target);
  const fill=new THREE.PointLight(0x8ccbe9,55,26,1.7); scene.add(fill);
  const edge=new THREE.PointLight(0x76e1d5,40,24,1.65); scene.add(edge);
  scene.add(new THREE.HemisphereLight(0x7da6cf,0x17191f,1.15));

  const textureLoader=new THREE.TextureLoader();
  const texturePromises=new Map();
  let disposed=false, paused=false, frame=0, current=initialRoom, renderedRoom=initialRoom;
  let moving=null, lastTime=0, idleTime=0, yaw=0, pitch=0, pointer=null;
  let small=innerWidth<=780, viewX=initialRoom*SPACING;
  const raycaster=new THREE.Raycaster(); const pointerNdc=new THREE.Vector2();
  const roomGroups=[], sculptures=[], selectables=[];
  const materialCache=new Map();
  const cube=new THREE.BoxGeometry(1,1,1);
  const blackMetal=new THREE.MeshStandardMaterial({color:0x111e2b,metalness:.68,roughness:.27});
  const wallMaterial=new THREE.MeshStandardMaterial({color:0x13202f,metalness:.35,roughness:.6});
  const floorMaterial=new THREE.MeshStandardMaterial({color:0x101b29,metalness:.68,roughness:.29});
  const edgingMaterial=new THREE.MeshStandardMaterial({color:0x506578,metalness:.85,roughness:.25});

  function material(color,glow=false) {
    const key=color+(glow?'g':'');
    if(!materialCache.has(key)) materialCache.set(key,glow?new THREE.MeshBasicMaterial({color}):new THREE.MeshStandardMaterial({color,metalness:.55,roughness:.4}));
    return materialCache.get(key);
  }
  function box(parent,w,h,d,x,y,z,mat=wallMaterial) {
    const m=new THREE.Mesh(cube,mat); m.scale.set(w,h,d); m.position.set(x,y,z); parent.add(m); return m;
  }
  function line(parent,points,color,opacity=1) {
    const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));
    const object=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity})); parent.add(object); return object;
  }
  function writing(value,width,height,{font=80,color='#b2c8d6',background=null,align='center'}={}) {
    const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=256;
    const ctx=canvas.getContext('2d'); if(background){ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);}
    ctx.fillStyle=color; ctx.font='500 '+font+'px "Trebuchet MS","Microsoft JhengHei",sans-serif'; ctx.textAlign=align; ctx.textBaseline='middle';
    ctx.fillText(value,align==='center'?512:30,128,980);
    const map=new THREE.CanvasTexture(canvas); map.colorSpace=THREE.SRGBColorSpace;
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false})); return plane;
  }
  function loadPhoto(id) {
    if(!texturePromises.has(id)) texturePromises.set(id,new Promise(resolve=>{
      textureLoader.load(photos[id].src,map=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());resolve(map);start();},undefined,()=>resolve(null));
    }));
    return texturePromises.get(id);
  }
  function photoPanel(parent,id,x,y,z,angle=0) {
    const group=new THREE.Group(); group.position.set(x,y,z); group.rotation.y=angle; parent.add(group);
    box(group,2.9,3.4,.16,0,0,0,blackMetal);
    box(group,3.01,.025,.2,0,1.75,0,material('#aecdd6',true));
    loadPhoto(id).then(map=>{
      if(disposed||!map)return;
      const aspect=map.image.width/map.image.height;
      const w=Math.min(2.55,2.65*aspect),h=w/aspect;
      const image=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}));
      image.position.set(0,.2,.09); image.userData.photo=id; group.add(image); selectables.push(image);
      const title=writing(photos[id].title,2.75,.55,{font:43,color:'#d5e3e8'});title.position.set(0,-1.35,.1);group.add(title);
    });
    return group;
  }

  rooms.forEach((room,index)=>{
    const group=new THREE.Group();group.position.x=index*SPACING;scene.add(group);roomGroups.push(group);
    const accent=material(room.accent,true),warm=material(room.warm,true);
    const floor=box(group,SPACING,.22,22,0,-.16,2,floorMaterial);floor.receiveShadow=true;
    box(group,18,8.6,.35,0,4.1,-6.5);
    box(group,.45,8.6,9,-9,4.1,-2.2);box(group,.45,8.6,9,9,4.1,-2.2);
    // Tall reveals, ceiling ribs and a shared front passage connect the galleries.
    for(const side of [-1,1]) {
      box(group,.32,7.8,.4,side*8.55,3.7,2.6,blackMetal);
      box(group,.045,6.9,.05,side*8.35,3.65,2.81,accent);
      box(group,.16,.11,13,side*7.65,.02,1.5,accent);
      box(group,.3,.4,13,side*8.4,7.5,-.6,blackMetal);
      for(let j=0;j<5;j++) box(group,.1,6.3,.25,side*(6.5+j*.37),3.2,-6.21,blackMetal);
    }
    for(let j=0;j<5;j++) {
      const z=-5+j*3.1;
      box(group,17.2,.22,.23,0,7.5,z,blackMetal);
      box(group,10.4,.022,.045,0,7.37,z,accent);
    }
    for(let x=-8;x<=8;x+=2) line(group,[[x,-.04,-6],[x,-.04,12]],'#3e5466',.35);
    for(let z=-5;z<13;z+=2) line(group,[[-9,-.04,z],[9,-.04,z]],'#3e5466',.28);
    const wallTitle=writing(room.wallTitle,11.2,2.3,{font:112,color:room.accent});wallTitle.position.set(.5,6.16,-6.25);group.add(wallTitle);
    const wallDate=writing(room.era+'  /  '+room.date,8.2,.7,{font:43,color:'#7b98ac'});wallDate.position.set(.5,4.9,-6.24);group.add(wallDate);
    const backRing=new THREE.Mesh(new THREE.TorusGeometry(2.55,.035,8,100),accent);
    backRing.position.set(1.8,3.3,-5.95);group.add(backRing);
    if(index===2||index===5) {backRing.visible=false;line(group,[[-.85,.7,-5.95],[-.85,5.8,-5.95],[4.45,5.8,-5.95],[4.45,.7,-5.95],[-.85,.7,-5.95]],room.accent,.8);}
    if(index===1) {backRing.scale.x=.67; const ring2=backRing.clone();ring2.position.x=-.1;group.add(ring2);}
    if(index===4) {backRing.visible=false;for(let j=0;j<5;j++)box(group,.028,3.8,.03,.4+j*.73,2.8,-6.0,accent);}
    if(index===7) {backRing.visible=false;for(let j=0;j<6;j++)line(group,[[-1.5+j*.8,1,-5.95],[-1.5+j*.8,4.6,-5.95],[3.8,4.6-j*.5,-5.95]],room.accent,.5);}
    // The plinth and floating sculpture remain separate from the museum photograph.
    const base=new THREE.Mesh(new THREE.CylinderGeometry(2.05,2.25,.25,64),blackMetal);base.position.set(1.8,.12,-.1);group.add(base);
    const middle=new THREE.Mesh(new THREE.CylinderGeometry(1.75,1.88,.82,64),blackMetal);middle.position.set(1.8,.66,-.1);middle.castShadow=true;middle.receiveShadow=true;group.add(middle);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.76,.13,64),edgingMaterial);top.position.set(1.8,1.12,-.1);top.receiveShadow=true;group.add(top);
    for(const [radius,y] of [[2.12,.25],[1.82,1.17],[3.1,-.015]]) {
      const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.016,8,96),y===1.17?warm:accent);ring.rotation.x=-Math.PI/2;ring.position.set(1.8,y,-.1);group.add(ring);
    }
    const sculpture=makeSculpture(room.sculpture,loadPhoto);sculpture.position.set(1.8,3.1,-.1);sculpture.scale.setScalar(1.14);group.add(sculpture);sculptures.push(sculpture);
    sculpture.traverse(object=>{if(object.isMesh){object.userData.exhibit=index;selectables.push(object);}});
    const label=writing(room.label,2.5,.6,{font:63,color:'#b8ced7'});label.position.set(1.8,.7,1.72);group.add(label);
    photoPanel(group,room.photos[0],6.1,3.1,-3.3,-.2);
    if(room.photos.length>1)photoPanel(group,room.photos[1],-4.9,3,-3.5,.16);
    else {
      const panel=box(group,2.8,4.4,.2,-4.9,2.6,-4.5,blackMetal);
      const term=writing(photos[room.photos[0]].title,2.65,.85,{font:57,color:'#a5bdca'});term.position.set(-4.9,3.5,-4.38);group.add(term);
      const number=writing(String(index+1).padStart(2,'0'),2.3,2.3,{font:180,color:room.accent});number.position.set(-4.9,2.1,-4.38);group.add(number);
    }
    if(room.photos.length>2)photoPanel(group,room.photos[2],-6.2,3.1,.3,.58);
    // Architectural light spill, not a full-screen bloom filter.
    const spillGeometry=new THREE.PlaneGeometry(6.4,6.4);
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;
    const glowCtx=glowCanvas.getContext('2d'),gradient=glowCtx.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,room.accent+'60');gradient.addColorStop(1,room.accent+'00');glowCtx.fillStyle=gradient;glowCtx.fillRect(0,0,128,128);
    const glowMap=new THREE.CanvasTexture(glowCanvas);glowMap.colorSpace=THREE.SRGBColorSpace;
    const glow=new THREE.Mesh(spillGeometry,new THREE.MeshBasicMaterial({map:glowMap,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
    glow.rotation.x=-Math.PI/2;glow.position.set(1.8,.005,-.1);group.add(glow);
  });

  const dustGeometry=new THREE.BufferGeometry();const dustPositions=new Float32Array(70*3);
  for(let i=0;i<70;i++){dustPositions[i*3]=(Math.random()-.5)*14;dustPositions[i*3+1]=1+Math.random()*6;dustPositions[i*3+2]=-5+Math.random()*10;}
  dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
  const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xb7d5e1,size:.025,transparent:true,opacity:.35,depthWrite:false}));scene.add(dust);

  function setLighting(index) {
    renderedRoom=index; const x=index*SPACING;
    mainLight.position.set(x+.3,8,3.5);mainLight.target.position.set(x+1.8,2.2,-.3);
    fill.position.set(x-3.8,4,4);fill.color.set(rooms[index].accent);
    edge.position.set(x+5,4.5,-3.5);edge.color.set(rooms[index].warm);
  }
  function setCamera() {
    if(small) {camera.position.set(viewX+1.8,3.9,11.7);camera.lookAt(viewX+1.8,1.45,-.3);}
    else {camera.position.set(viewX-2.2,3.65,10.3);camera.lookAt(viewX+.25,2.65,-.8);}
    dust.position.x=viewX;
  }
  function resize() {
    const rect=canvas.parentElement.getBoundingClientRect();small=rect.width<=780;
    renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.fov=small?54:48;camera.updateProjectionMatrix();setCamera();start();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();setLighting(initialRoom);
  function show(index,animate=true) {
    if(disposed)return;current=index;yaw=0;pitch=0;
    if(reducedMotion||!animate) {moving=null;viewX=index*SPACING;setLighting(index);setCamera();renderOnce();return;}
    moving={from:viewX,to:index*SPACING,start:performance.now(),duration:clamp(950+Math.abs(index-viewX/SPACING)*120,1000,1700)};
    start();
  }
  function renderOnce() { update(performance.now());renderer.render(scene,camera); }
  function update(now) {
    const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;
    if(moving) {
      const t=clamp((now-moving.start)/moving.duration,0,1), eased=t*t*(3-2*t);
      viewX=THREE.MathUtils.lerp(moving.from,moving.to,eased);
      const nearest=clamp(Math.round(viewX/SPACING),0,7);if(nearest!==renderedRoom)setLighting(nearest);
      if(t===1)moving=null;
    }
    const nearest=viewX/SPACING;roomGroups.forEach((g,i)=>{g.visible=Math.abs(i-nearest)<1.2;});
    if(!reducedMotion&&!pointer)idleTime+=dt;
    sculptures.forEach((model,i)=>{
      if(!roomGroups[i].visible)return;
      model.position.y=3.1+(reducedMotion?0:Math.sin(idleTime*.65+i)*.065);
      model.rotation.y=i===current?yaw+(reducedMotion?0:Math.sin(idleTime*.27)*.12):0;
      model.rotation.x=i===current?pitch:0;
    });
    setCamera();
  }
  function tick(now) {frame=0;if(disposed||paused||document.hidden)return;update(now);renderer.render(scene,camera);if(!reducedMotion||moving)frame=requestAnimationFrame(tick);}
  function start() {if(!frame&&!paused&&!disposed&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function pick(event) {
    const rect=canvas.getBoundingClientRect();pointerNdc.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointerNdc,camera);
    return raycaster.intersectObjects(selectables,false).find(hit=>{
      let p=hit.object;while(p){if(!p.visible)return false;p=p.parent;}return true;
    });
  }
  function down(event) {if(event.button!==0||moving)return;pointer={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,moved:false};canvas.setPointerCapture(event.pointerId);}
  function move(event) {
    if(!pointer)return;
    const dx=event.clientX-pointer.lastX,dy=event.clientY-pointer.lastY;
    if(Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>6)pointer.moved=true;
    if(pointer.moved){yaw+=dx*.009;pitch=clamp(pitch+dy*.006,-.55,.55);if(reducedMotion)renderOnce();}
    pointer.lastX=event.clientX;pointer.lastY=event.clientY;
  }
  function up(event) {
    if(!pointer)return;const clicked=!pointer.moved;pointer=null;
    if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);
    if(clicked) {const hit=pick(event);if(hit)onSelect(hit.object.userData.photo);}
  }
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>{pointer=null;});
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();}
  document.addEventListener('visibilitychange',visibility);
  await loadPhoto(rooms[initialRoom].photos[0]);
  renderOnce();start();onReady?.();
  return {
    show,
    setPaused(value){paused=value;if(value){cancelAnimationFrame(frame);frame=0;}else start();},
    setReducedMotion(value){reducedMotion=value;start();},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);envTarget.dispose();renderer.dispose();},
    diagnostics(){return {room:current,drawCalls:renderer.info.render.calls,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};}
  };
}
