import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { periods, photos } from './exhibit-data.js?v=20261122-museum-directory';

const ease = t => t * t * (3 - 2 * t);
const clamp = THREE.MathUtils.clamp;
const colors = Array(8).fill('#bcd6df');

export async function createDeckScene(canvas, { initialIndex=0, photoId, onFlip, reducedMotion=false }) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,50);
  const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(env,.035);scene.environment=environment.texture;scene.environmentIntensity=.8;
  env.dispose();pmrem.dispose();
  const key=new THREE.SpotLight(0xe6f2ff,150,30,Math.PI/3,.65,1.7);
  key.position.set(-3,6,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;scene.add(key,key.target);
  const fill=new THREE.PointLight(0x8dbde7,40,20,1.6);fill.position.set(5,1,5);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xe9f4ff,0x516378,2));
  const rig=new THREE.Group();scene.add(rig);
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.ShadowMaterial({opacity:.28}));surface.position.z=-1.1;surface.receiveShadow=true;scene.add(surface);
  let current=initialIndex,selected=photoId||periods[current].photos[0],small=false,main,frontMaterial;
  let frame=0,paused=false,inView=true,disposed=false,lastTime=0,time=0,flipValue=0,targetSide=false;
  let turn=null,deal=null,dealX=0,dealZ=0,dealAngle=0,hoverX=0,hoverY=0,pointer=null;
  let width=6,height=3.75,buildVersion=0;
  const images=new Map();
  const geometryResources=[],materialResources=[],textureResources=[];
  const raycaster=new THREE.Raycaster(),pointerNdc=new THREE.Vector2();

  function loadImage(id) {
    if(!images.has(id))images.set(id,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=photos[id].src;}));
    return images.get(id);
  }
  function texture(canvas) { const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textureResources.push(t);return t; }
  function rounded(w,h,r) {
    const s=new THREE.Shape(),x=-w/2,y=-h/2;
    s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
  }
  function plane(w,h) {
    const g=new THREE.ShapeGeometry(rounded(w,h,.14),24),uv=g.attributes.uv,pos=g.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);
    geometryResources.push(g);return g;
  }
  function wrap(ctx,value,x,y,maxWidth,lineHeight,maxLines=4) {
    const words=value.split(' ');let line='',lines=0;
    for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word;lines++;if(lines>=maxLines-1)break;}else line=next;}
    ctx.fillText(line,x,y);return y+lineHeight;
  }
  function baseCanvas() { const c=document.createElement('canvas');c.width=(small?720:1400)*2;c.height=(small?1024:750)*2;c.getContext('2d').scale(2,2);return c; }
  function backTexture(index) {
    const c=baseCanvas(),ctx=c.getContext('2d'),w=c.width/2,h=c.height/2;
    ctx.fillStyle='#1b3345';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=colors[index]+'55';ctx.lineWidth=2;ctx.strokeRect(25,25,w-50,h-50);
    for(let i=-h;i<w;i+=42){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+h,h);ctx.strokeStyle=colors[index]+'14';ctx.stroke();}
    ctx.strokeStyle=colors[index];ctx.lineWidth=4;ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.19,0,Math.PI*2);ctx.stroke();
    const box=Math.min(w,h)*.12;ctx.strokeRect(w/2-box/2,h/2-box/2,box,box);
    ctx.fillStyle='#e1eced';ctx.textAlign='left';ctx.font='500 43px "Trebuchet MS",sans-serif';ctx.fillText(String(index+1).padStart(2,'0'),48,82);
    ctx.textAlign='right';ctx.font='500 34px "Trebuchet MS",sans-serif';ctx.fillText(periods[index].label,w-48,h-50);
    return texture(c);
  }
  async function frontTexture(index,id) {
    const portrait=small,c=baseCanvas(),ctx=c.getContext('2d'),w=c.width/2,h=c.height/2,p=periods[index],img=await loadImage(id);
    const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#1b3549');bg.addColorStop(1,'#0b1828');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=colors[index]+'99';ctx.lineWidth=2;ctx.strokeRect(20,20,w-40,h-40);
    const x=portrait?42:48,y=portrait?230:130,boxW=portrait?w-84:590,boxH=portrait?440:530;
    ctx.fillStyle='#0c1821';ctx.fillRect(x,y,boxW,boxH);
    if(img){const ratio=Math.min(boxW/img.width,boxH/img.height);ctx.drawImage(img,x+(boxW-img.width*ratio)/2,y+(boxH-img.height*ratio)/2,img.width*ratio,img.height*ratio);}
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=colors[index];ctx.font='500 '+(portrait?30:30)+'px "Trebuchet MS",sans-serif';
    ctx.fillText(String(index+1).padStart(2,'0')+' / 08',portrait?46:50,portrait?70:72);
    ctx.fillStyle='#f0f4f1';ctx.font='500 '+(portrait?72:82)+'px "Trebuchet MS",sans-serif';
    let end=wrap(ctx,p.label,portrait?42:700,portrait?150:205,portrait?630:520,portrait?67:82,2);
    ctx.fillStyle=colors[index];ctx.font=(portrait?38:34)+'px "Trebuchet MS",sans-serif';ctx.fillText(p.date,portrait?44:704,portrait?204:end+12);
    ctx.fillStyle='#e1eaf0';ctx.font=(portrait?54:53)+'px "Times New Roman",serif';
    wrap(ctx,p.question,portrait?44:704,portrait?740:end+99,portrait?625:500,portrait?62:65,4);
    return texture(c);
  }
  function clearRig() {
    rig.clear();geometryResources.splice(0).forEach(g=>g.dispose());materialResources.splice(0).forEach(m=>m.dispose());textureResources.splice(0).forEach(t=>t.dispose());
  }
  function card(index,isMain=false) {
    const group=new THREE.Group();
    const g=new THREE.ExtrudeGeometry(rounded(width,height,.17),{depth:.07,bevelEnabled:true,bevelSegments:3,bevelSize:.022,bevelThickness:.02,steps:1});geometryResources.push(g);
    const edgeMat=new THREE.MeshStandardMaterial({color:0x7b9ba8,metalness:.82,roughness:.25});materialResources.push(edgeMat);
    const body=new THREE.Mesh(g,edgeMat);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const mat=new THREE.MeshBasicMaterial({map:backTexture(index),toneMapped:false});materialResources.push(mat);
    const face=new THREE.Mesh(plane(width-.025,height-.025),mat);face.position.z=.095;group.add(face);
    const reverse=new THREE.Mesh(plane(width-.025,height-.025),mat);reverse.position.z=-.025;reverse.rotation.y=Math.PI;group.add(reverse);
    if(isMain) { frontMaterial=new THREE.MeshBasicMaterial({map:mat.map,toneMapped:false});materialResources.push(frontMaterial);face.material=frontMaterial; }
    return group;
  }
  async function setPhoto(id) {
    selected=id;const version=buildVersion,material=frontMaterial;
    const map=await frontTexture(current,id);
    if(disposed||version!==buildVersion||id!==selected){map.dispose();return;}
    material.map=map;material.needsUpdate=true;update(performance.now());renderer.render(scene,camera);start();
  }
  function rebuild() {
    buildVersion++;clearRig();
    width=small?3.15:7;height=small?4.48:3.75;
    for(let i=3;i>=1;i--){const c=card((current+i)%periods.length);c.position.set((i%2?-.1:.12)*i,-.025*i,-.105*i);c.rotation.z=(i%2?-1:1)*(.012+i*.009);rig.add(c);}
    main=card(current,true);rig.add(main);setPhoto(selected);resizeCamera();
  }
  function resizeCamera() {
    const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;
    renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
    const distance=Math.max(height/(2*tan)*1.15,width/(2*tan*camera.aspect)*(small?1.12:1.2))+.4;
    camera.position.set(0,0,distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    const tl=new THREE.Vector3(-width/2,height/2,.475).project(camera),br=new THREE.Vector3(width/2,-height/2,.475).project(camera);
    const style=canvas.parentElement.style;
    style.setProperty('--card-left',((tl.x+1)/2*rect.width)+'px');
    style.setProperty('--card-top',((1-tl.y)/2*rect.height)+'px');
    style.setProperty('--card-width',((br.x-tl.x)/2*rect.width)+'px');
    style.setProperty('--card-height',((tl.y-br.y)/2*rect.height)+'px');update(performance.now());renderer.render(scene,camera);start();
  }
  function resize() {const next=canvas.parentElement.clientWidth<650;if(next!==small){small=next;rebuild();}else resizeCamera();}
  function update(now) {
    const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(!reducedMotion)time+=dt;
    if(turn){const t=clamp((now-turn.start)/760,0,1);flipValue=THREE.MathUtils.lerp(turn.from,turn.to,ease(t));if(t===1)turn=null;}
    if(deal){const t=clamp((now-deal.start)/deal.duration,0,1),k=ease(t);dealX=THREE.MathUtils.lerp(deal.from,deal.to,k);dealZ=Math.sin(t*Math.PI)*.5;dealAngle=dealX*.06;if(t===1){const resolve=deal.resolve;clearTimeout(deal.timer);deal=null;resolve();}}
    main.position.set(dealX,0,.38+dealZ);
    main.rotation.set(0,flipValue,dealAngle);
    rig.rotation.set(0,0,0);
  }
  function tick(now) {frame=0;if(paused||disposed||document.hidden||!inView)return;update(now);renderer.render(scene,camera);if(turn||deal)frame=requestAnimationFrame(tick);}
  function start() {if(!frame&&!paused&&!disposed&&!document.hidden&&inView){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function cancel() {if(deal){clearTimeout(deal.timer);deal.resolve();deal=null;}turn=null;dealX=dealZ=dealAngle=0;}
  function animateDeal(from,to,duration) {
    paused=false;
    if(reducedMotion||document.hidden||!inView){dealX=0;return Promise.resolve();}
    return new Promise(resolve=>{
      const animation={from,to,duration,resolve,start:performance.now()};deal=animation;
      // Page visibility or a missed frame must not leave navigation disabled.
      animation.timer=setTimeout(()=>{if(deal!==animation)return;dealX=to;dealZ=dealAngle=0;deal=null;resolve();start();},duration+150);
      cancelAnimationFrame(frame);frame=0;
      start();
    });
  }
  function show(index,id) {cancel();current=index;selected=id||periods[index].photos[0];flipValue=0;targetSide=false;paused=false;rebuild();start();}
  function flip(answer,immediate=false) {paused=false;targetSide=answer;const to=answer?Math.PI:0;if(immediate||reducedMotion){flipValue=to;turn=null;}else turn={from:flipValue,to,start:performance.now()};start();}
  canvas.addEventListener('pointermove',event=>{const r=canvas.getBoundingClientRect();hoverX=(event.clientX-r.left)/r.width*2-1;hoverY=(event.clientY-r.top)/r.height*2-1;if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>8)pointer.moved=true;start();});
  canvas.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
  canvas.addEventListener('pointerdown',event=>{if(event.button===0)pointer={x:event.clientX,y:event.clientY,moved:false};});
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('pointerup',event=>{if(!pointer)return;const clicked=!pointer.moved;pointer=null;if(!clicked||turn||deal||targetSide)return;const r=canvas.getBoundingClientRect();pointerNdc.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointerNdc,camera);if(raycaster.intersectObject(main,true).length)onFlip();});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);
  const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)start();else {cancelAnimationFrame(frame);frame=0;}},{rootMargin:'150px'});visibilityObserver.observe(canvas);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();}document.addEventListener('visibilitychange',visibility);
  small=canvas.parentElement.clientWidth<650;rebuild();await loadImage(selected);start();
  return {show,flip,setPhoto,cancel,
    dealOut(direction){return animateDeal(0,direction*width*1.5,300);},
    dealIn(direction){return animateDeal(-direction*width*1.1,0,460);},
    setPaused(value){paused=value;if(value){cancelAnimationFrame(frame);frame=0;}else start();},
    setReducedMotion(value){reducedMotion=value;if(value){turn=null;flipValue=targetSide?Math.PI:0;}start();},
    dispose(){disposed=true;cancelAnimationFrame(frame);cancel();resizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibility);clearRig();environment.dispose();renderer.dispose();}
  };
}
