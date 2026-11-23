import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { CSS3DObject, CSS3DRenderer } from './vendor/three/CSS3DRenderer.js';
import { periods, photos } from './exhibit-data.js?v=20261123-pan-dismiss';
import { flashcardContent } from './mode-content.js?v=20261123-pan-dismiss';

const ease = t => t * t * (3 - 2 * t);
const settleEase = t => t * t * t * (t * (t * 6 - 15) + 10);
const clamp = THREE.MathUtils.clamp;
const colors = Array(8).fill('#bcd6df');

export async function createDeckScene(canvas, { initialIndex=0, photoId, backElement, onFlip, onFlipEnd, reducedMotion=false }) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,50);
  // The real, interactive back stays on the card throughout the turn.
  // Swapping a text texture for this DOM at the end caused a visible layout jump.
  const textRenderer=new CSS3DRenderer();
  textRenderer.domElement.className='deck-text-layer';
  canvas.parentElement.appendChild(textRenderer.domElement);
  const textScene=new THREE.Scene(),textCard=new THREE.Group();
  textCard.matrixAutoUpdate=false;textScene.add(textCard);
  const liveBack=new CSS3DObject(backElement);
  liveBack.position.z=-.026;liveBack.rotation.y=Math.PI;textCard.add(liveBack);
  backElement.style.pointerEvents='';backElement.style.userSelect='text';
  const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(env,.035);scene.environment=environment.texture;scene.environmentIntensity=.8;
  env.dispose();pmrem.dispose();
  const key=new THREE.SpotLight(0xe6f2ff,150,30,Math.PI/3,.65,1.7);
  key.position.set(-3,6,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0003;scene.add(key,key.target);
  const fill=new THREE.PointLight(0x8dbde7,40,20,1.6);fill.position.set(5,1,5);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xe9f4ff,0x516378,2));
  const rig=new THREE.Group();scene.add(rig);
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.ShadowMaterial({opacity:.28}));surface.position.z=-1.1;surface.receiveShadow=true;scene.add(surface);
  let current=initialIndex,selected=photoId||periods[current].photos[0],small=false,main;
  let frame=0,paused=false,disposed=false,lastTime=0,flipValue=0,targetSide=false;
  let turn=null,deal=null,dealX=0,dealY=0,dealZ=0,dealAngle=0,hoverX=0,hoverY=0,hoverTargetX=0,hoverTargetY=0,pointer=null;
  let stackMoves=[],bodyGeometry,faceGeometry;
  let width=6,height=3.75,buildVersion=0;
  const images=new Map();
  const cards=new Map();
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
    const lines=[];let line='';
    for(const word of value.split(' ')){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=word;}else line=next;}
    lines.push(line);
    if(lines.length>maxLines){lines.length=maxLines;let last=lines[maxLines-1];while(ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}
    lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));return y+lines.length*lineHeight;
  }
  function baseCanvas() { const c=document.createElement('canvas');c.width=(small?720:1400)*2;c.height=(small?1024:750)*2;c.getContext('2d').scale(2,2);return c; }
  async function frontTexture(index,id) {
    const portrait=small,c=baseCanvas(),ctx=c.getContext('2d'),w=c.width/2,h=c.height/2,p=periods[index],img=await loadImage(id);
    const bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#1b3549');bg.addColorStop(1,'#0b1828');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=colors[index]+'99';ctx.lineWidth=2;ctx.strokeRect(20,20,w-40,h-40);
    const x=portrait?42:48,y=portrait?230:130,boxW=portrait?w-84:590,boxH=portrait?365:530;
    ctx.fillStyle=photos[id].background||'#0c1821';ctx.fillRect(x,y,boxW,boxH);
    if(img){const padding=photos[id].background ? .82 : 1,ratio=Math.min(boxW/img.width,boxH/img.height)*padding;ctx.drawImage(img,x+(boxW-img.width*ratio)/2,y+(boxH-img.height*ratio)/2,img.width*ratio,img.height*ratio);}
    ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=colors[index];ctx.font='500 '+(portrait?30:30)+'px "Trebuchet MS",sans-serif';
    ctx.fillText(String(index+1).padStart(2,'0')+' / 08',portrait?46:50,portrait?70:72);
    ctx.fillStyle='#f0f4f1';ctx.font='500 '+(portrait?72:82)+'px "Trebuchet MS",sans-serif';
    let end=wrap(ctx,p.label,portrait?42:700,portrait?150:180,portrait?630:520,portrait?67:82,2);
    ctx.fillStyle=colors[index];ctx.font=(portrait?38:34)+'px "Trebuchet MS",sans-serif';ctx.fillText(p.date,portrait?44:704,portrait?204:end+12);
    ctx.fillStyle='#e1eaf0';ctx.font=(portrait?50:48)+'px "Times New Roman",serif';
    const questionEnd=wrap(ctx,p.question,portrait?44:704,portrait?665:end+90,portrait?625:500,portrait?58:56,3);
    ctx.fillStyle='#bcd1dd';ctx.font=(portrait?44:34)+'px "Times New Roman",serif';
    wrap(ctx,flashcardContent[p.id].intro,portrait?44:704,questionEnd+20,portrait?625:500,portrait?52:42,3);
    return texture(c);
  }
  function clearRig() {
    buildVersion++;rig.clear();cards.clear();bodyGeometry=faceGeometry=null;
    geometryResources.splice(0).forEach(g=>g.dispose());materialResources.splice(0).forEach(m=>m.dispose());textureResources.splice(0).forEach(t=>t.dispose());
  }
  function card(index) {
    if(cards.has(index))return cards.get(index);
    const group=new THREE.Group();
    if(!bodyGeometry){bodyGeometry=new THREE.ExtrudeGeometry(rounded(width,height,.17),{depth:.07,bevelEnabled:true,bevelSegments:3,bevelSize:.022,bevelThickness:.02,steps:1});geometryResources.push(bodyGeometry);faceGeometry=plane(width-.025,height-.025);}
    const edgeMat=new THREE.MeshStandardMaterial({color:0x7b9ba8,metalness:.82,roughness:.25});materialResources.push(edgeMat);
    const body=new THREE.Mesh(bodyGeometry,edgeMat);body.castShadow=true;body.receiveShadow=true;group.add(body);
    const mat=new THREE.MeshBasicMaterial({color:0x11212f,toneMapped:false});materialResources.push(mat);
    const face=new THREE.Mesh(faceGeometry,mat);face.position.z=.095;group.add(face);
    const reverse=new THREE.Mesh(faceGeometry,mat);reverse.position.z=-.025;reverse.rotation.y=Math.PI;group.add(reverse);
    const faceMaterial=new THREE.MeshBasicMaterial({color:0x11212f,toneMapped:false});materialResources.push(faceMaterial);face.material=faceMaterial;
    group.userData={index,faceMaterial,materials:[edgeMat,mat,faceMaterial]};cards.set(index,group);
    return group;
  }
  function releaseTexture(map){if(!map)return;map.dispose();const i=textureResources.indexOf(map);if(i!==-1)textureResources.splice(i,1);}
  function prepare(index,id=periods[index].photos[0]) {
    const group=card(index),data=group.userData,version=buildVersion;
    if(data.photoId===id)return data.ready;
    data.photoId=id;
    data.ready=frontTexture(index,id).then(map=>{
      if(disposed||version!==buildVersion||cards.get(index)!==group||data.photoId!==id){releaseTexture(map);return;}
      releaseTexture(data.faceMaterial.map);
      data.faceMaterial.map=map;data.faceMaterial.color.set(0xffffff);data.faceMaterial.needsUpdate=true;start();
    });
    return data.ready;
  }
  function setPhoto(id) {selected=id;return prepare(current,id);}
  function stackPose(i){return {x:(i%2?-.2:.22)*i,y:-.03*i,z:-.13*i,angle:(i%2?-1:1)*(.035+i*.025)};}
  function place(group,pose){group.position.set(pose.x,pose.y,pose.z);group.rotation.set(0,0,pose.angle);group.scale.setScalar(1);}
  function rebuild(enter=false) {
    // Keep the actual next card and its texture instead of replacing the deck
    // with newly built cards between the outgoing and incoming frames.
    const previous=new Map(rig.children.filter(c=>c!==main).map(c=>[c.userData.index,{x:c.position.x,y:c.position.y,z:c.position.z,angle:c.rotation.z}]));
    rig.clear();stackMoves=[];
    width=small?3.15:7;height=small?4.48:3.75;
    for(let i=Math.min(3,periods.length-current-1);i>=1;i--){
      const c=card(current+i),to=stackPose(i),from=enter&&previous.get(current+i)||to;
      place(c,from);rig.add(c);stackMoves.push({group:c,from,to});prepare(current+i,c.userData.photoId||periods[current+i].photos[0]);
    }
    main=card(current);rig.add(main);
    if(enter){const from=previous.get(current)||stackPose(1);dealX=from.x;dealY=from.y;dealZ=from.z-.38;dealAngle=from.angle+.018;}
    for(const [index,c] of cards){if(c.parent===rig)continue;releaseTexture(c.userData.faceMaterial.map);for(const m of c.userData.materials){m.dispose();materialResources.splice(materialResources.indexOf(m),1);}cards.delete(index);}
    setPhoto(selected);resizeCamera();
  }
  function resizeCamera() {
    const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;
    renderer.setSize(rect.width,rect.height,false);textRenderer.setSize(rect.width,rect.height);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
    const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2);
    const distance=Math.max(height/(2*tan)*1.15,width/(2*tan*camera.aspect)*(small?1.12:1.2))+.4;
    camera.position.set(0,0,distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
    const tl=new THREE.Vector3(-width/2,height/2,.475).project(camera),br=new THREE.Vector3(width/2,-height/2,.475).project(camera);
    const style=canvas.parentElement.style;
    style.setProperty('--card-left',((tl.x+1)/2*rect.width)+'px');
    style.setProperty('--card-top',((1-tl.y)/2*rect.height)+'px');
    style.setProperty('--card-width',((br.x-tl.x)/2*rect.width)+'px');
    style.setProperty('--card-height',((tl.y-br.y)/2*rect.height)+'px');
    liveBack.scale.set((width-.025)/((br.x-tl.x)/2*rect.width),(height-.025)/((tl.y-br.y)/2*rect.height),1);
    draw(performance.now());start();
  }
  function resize() {const next=canvas.parentElement.clientWidth<650;if(next!==small){small=next;clearRig();rebuild();}else resizeCamera();}
  function update(now) {
    const dt=clamp((now-lastTime)/1000,0,.04);lastTime=now;
    if(turn){const t=clamp((now-turn.start)/760,0,1);flipValue=THREE.MathUtils.lerp(turn.from,turn.to,ease(t));if(t===1)turn=null;}
    if(deal){const t=clamp((now-deal.start)/deal.duration,0,1);applyDeal(settleEase(t));deal.done=t===1;}
    const lift=Math.sin(flipValue),distance=camera.position.z-.475;
    const turnScale=distance/(distance+width*lift);
    main.scale.setScalar(turnScale);
    // Lift the whole edge clear of the next card, while keeping the turn in frame.
    main.position.set(dealX,dealY,.38+dealZ+(width*turnScale/2+.12)*lift+flipValue/Math.PI*.07);
    main.rotation.set(lift*.08,flipValue,dealAngle-(1-flipValue/Math.PI)*.018);
    const frontWeight=1-clamp(flipValue/(Math.PI*.25),0,1);
    if(!deal){const k=reducedMotion?1:1-Math.exp(-dt*16);hoverX=THREE.MathUtils.lerp(hoverX,hoverTargetX,k);hoverY=THREE.MathUtils.lerp(hoverY,hoverTargetY,k);if(!hoverMoving()){hoverX=hoverTargetX;hoverY=hoverTargetY;}}
    rig.rotation.set(-hoverY*.035*frontWeight,hoverX*.045*frontWeight,0);
  }
  // Rendering is already on demand. A visibility observer on the initially
  // hidden canvas could prevent a user-triggered flip from ever starting.
  function draw(now) {
    const wasTurning=!!turn;
    update(now);scene.updateMatrixWorld();textCard.matrix.copy(main.matrixWorld);
    liveBack.visible=flipValue>Math.PI/2;
    renderer.render(scene,camera);textRenderer.render(textScene,camera);
    if(wasTurning&&!turn)onFlipEnd?.();
    // Release navigation only after the final pose has actually been drawn.
    if(deal?.done){const resolve=deal.resolve;deal=null;stackMoves=[];resolve();}
  }
  function hoverMoving(){return Math.abs(hoverX-hoverTargetX)+Math.abs(hoverY-hoverTargetY)>.0001;}
  function tick(now) {frame=0;if(paused||disposed||document.hidden)return;draw(now);if(turn||deal||hoverMoving())frame=requestAnimationFrame(tick);}
  function start() {if(!frame&&!paused&&!disposed&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function cancel() {if(deal){deal.resolve();deal=null;}turn=null;stackMoves=[];dealX=dealY=dealZ=dealAngle=0;}
  function applyDeal(k){
    const lerp=(key)=>THREE.MathUtils.lerp(deal.from[key],deal.to[key],k);
    dealX=lerp('x');dealY=lerp('y');dealZ=lerp('z');dealAngle=lerp('angle');
    if(deal.settle)for(const {group,from,to} of stackMoves)place(group,{x:THREE.MathUtils.lerp(from.x,to.x,k),y:THREE.MathUtils.lerp(from.y,to.y,k),z:THREE.MathUtils.lerp(from.z,to.z,k),angle:THREE.MathUtils.lerp(from.angle,to.angle,k)});
  }
  function animateDeal(to,duration,settle=false) {
    paused=false;
    return new Promise(resolve=>{
      deal={from:{x:dealX,y:dealY,z:dealZ,angle:dealAngle},to,duration,settle,resolve,start:performance.now()};
      if(reducedMotion||document.hidden){applyDeal(1);deal.done=true;deal.start-=duration;draw(performance.now());return;}
      cancelAnimationFrame(frame);frame=0;
      start();
    });
  }
  function show(index,id,enter=false) {cancel();current=index;selected=id||periods[index].photos[0];flipValue=0;targetSide=false;paused=false;rebuild(enter&&!reducedMotion);start();}
  function flip(answer,immediate=false) {paused=false;targetSide=answer;const to=answer?Math.PI:0;if(immediate||reducedMotion){flipValue=to;turn=null;draw(performance.now());}else turn={from:flipValue,to,start:performance.now()};start();}
  canvas.addEventListener('pointermove',event=>{const r=canvas.getBoundingClientRect();hoverTargetX=(event.clientX-r.left)/r.width*2-1;hoverTargetY=(event.clientY-r.top)/r.height*2-1;if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>8)pointer.moved=true;start();});
  canvas.addEventListener('pointerleave',()=>{hoverTargetX=hoverTargetY=0;start();});
  canvas.addEventListener('pointerdown',event=>{if(event.button===0)pointer={x:event.clientX,y:event.clientY,moved:false};});
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('pointerup',event=>{if(!pointer)return;const clicked=!pointer.moved;pointer=null;if(!clicked||turn||deal||targetSide)return;const r=canvas.getBoundingClientRect();pointerNdc.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointerNdc,camera);if(raycaster.intersectObject(main,true).length)onFlip();});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;if(deal){deal.start=performance.now()-deal.duration;draw(performance.now());}}else start();}document.addEventListener('visibilitychange',visibility);
  small=canvas.parentElement.clientWidth<650;rebuild();await loadImage(selected);start();
  return {show,flip,setPhoto,cancel,prepare,
    dealOut(direction){return animateDeal({x:direction*width*1.5,y:0,z:.2,angle:direction*.36},480);},
    dealIn(){return animateDeal({x:0,y:0,z:0,angle:0},520,true);},
    setPaused(value){paused=value;if(value){cancelAnimationFrame(frame);frame=0;}else start();},
    setReducedMotion(value){reducedMotion=value;if(value){const wasTurning=!!turn;turn=null;flipValue=targetSide?Math.PI:0;if(deal)deal.start=performance.now()-deal.duration;draw(performance.now());if(wasTurning)onFlipEnd?.();}start();},
    dispose(){disposed=true;cancelAnimationFrame(frame);cancel();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);clearRig();environment.dispose();renderer.dispose();textRenderer.domElement.remove();}
  };
}
