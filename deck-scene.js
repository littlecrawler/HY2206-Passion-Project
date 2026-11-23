import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { CSS3DObject, CSS3DRenderer } from './vendor/three/CSS3DRenderer.js';
import { periods, photos } from './exhibit-data.js?v=20261123-smooth-navigation';

const ease = t => t * t * (3 - 2 * t);
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
  let current=initialIndex,selected=photoId||periods[current].photos[0],small=false,main,frontMaterial;
  let frame=0,paused=false,disposed=false,lastTime=0,time=0,flipValue=0,targetSide=false;
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
    const mat=new THREE.MeshBasicMaterial({color:0x11212f,toneMapped:false});materialResources.push(mat);
    const face=new THREE.Mesh(plane(width-.025,height-.025),mat);face.position.z=.095;group.add(face);
    const reverse=new THREE.Mesh(plane(width-.025,height-.025),mat);reverse.position.z=-.025;reverse.rotation.y=Math.PI;group.add(reverse);
    const faceMaterial=new THREE.MeshBasicMaterial({color:0x11212f,toneMapped:false});materialResources.push(faceMaterial);face.material=faceMaterial;
    if(isMain) frontMaterial=faceMaterial;
    else {
      const version=buildVersion;
      frontTexture(index,periods[index].photos[0]).then(map=>{
        if(disposed||version!==buildVersion){map.dispose();return;}
        faceMaterial.map=map;faceMaterial.color.set(0xffffff);faceMaterial.needsUpdate=true;start();
      });
    }
    return group;
  }
  async function setPhoto(id) {
    selected=id;const version=buildVersion,material=frontMaterial;
    const map=await frontTexture(current,id);
    if(disposed||version!==buildVersion||id!==selected){map.dispose();return;}
    material.map=map;material.color.set(0xffffff);material.needsUpdate=true;draw(performance.now());start();
  }
  function rebuild() {
    buildVersion++;clearRig();
    width=small?3.15:7;height=small?4.48:3.75;
    for(let i=Math.min(3,periods.length-current-1);i>=1;i--){const c=card(current+i);c.position.set((i%2?-.2:.22)*i,-.03*i,-.13*i);c.rotation.z=(i%2?-1:1)*(.035+i*.025);rig.add(c);}
    main=card(current,true);rig.add(main);setPhoto(selected);resizeCamera();
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
  function resize() {const next=canvas.parentElement.clientWidth<650;if(next!==small){small=next;rebuild();}else resizeCamera();}
  function update(now) {
    const dt=Math.min((now-lastTime)/1000,.04);lastTime=now;if(!reducedMotion)time+=dt;
    if(turn){const t=clamp((now-turn.start)/760,0,1);flipValue=THREE.MathUtils.lerp(turn.from,turn.to,ease(t));if(t===1)turn=null;}
    if(deal){const t=clamp((now-deal.start)/deal.duration,0,1),k=ease(t);dealX=THREE.MathUtils.lerp(deal.from,deal.to,k);dealZ=THREE.MathUtils.lerp(deal.fromZ,0,k)+Math.sin(t*Math.PI)*.3;dealAngle=dealX*.075;if(t===1){const resolve=deal.resolve;clearTimeout(deal.timer);deal=null;resolve();}}
    const lift=Math.sin(flipValue),distance=camera.position.z-.475;
    const turnScale=distance/(distance+width*lift);
    main.scale.setScalar(turnScale);
    // Lift the whole edge clear of the next card, while keeping the turn in frame.
    main.position.set(dealX,0,.38+dealZ+(width*turnScale/2+.12)*lift+flipValue/Math.PI*.07);
    main.rotation.set(lift*.08,flipValue,dealAngle-(1-flipValue/Math.PI)*.018);
    const frontWeight=1-clamp(flipValue/(Math.PI*.25),0,1);
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
  }
  function tick(now) {frame=0;if(paused||disposed||document.hidden)return;draw(now);if(turn||deal)frame=requestAnimationFrame(tick);}
  function start() {if(!frame&&!paused&&!disposed&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(tick);}}
  function cancel() {if(deal){clearTimeout(deal.timer);deal.resolve();deal=null;}turn=null;dealX=dealZ=dealAngle=0;}
  function animateDeal(from,to,duration,fromZ=0) {
    paused=false;
    if(reducedMotion||document.hidden){dealX=0;return Promise.resolve();}
    return new Promise(resolve=>{
      const animation={from,to,fromZ,duration,resolve,start:performance.now()};deal=animation;
      // Page visibility or a missed frame must not leave navigation disabled.
      animation.timer=setTimeout(()=>{if(deal!==animation)return;dealX=to;dealZ=dealAngle=0;deal=null;resolve();start();},duration+150);
      cancelAnimationFrame(frame);frame=0;
      start();
    });
  }
  function show(index,id) {cancel();current=index;selected=id||periods[index].photos[0];flipValue=0;targetSide=false;paused=false;rebuild();start();}
  function flip(answer,immediate=false) {paused=false;targetSide=answer;const to=answer?Math.PI:0;if(immediate||reducedMotion){flipValue=to;turn=null;draw(performance.now());}else turn={from:flipValue,to,start:performance.now()};start();}
  canvas.addEventListener('pointermove',event=>{const r=canvas.getBoundingClientRect();hoverX=(event.clientX-r.left)/r.width*2-1;hoverY=(event.clientY-r.top)/r.height*2-1;if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>8)pointer.moved=true;start();});
  canvas.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
  canvas.addEventListener('pointerdown',event=>{if(event.button===0)pointer={x:event.clientX,y:event.clientY,moved:false};});
  canvas.addEventListener('pointercancel',()=>{pointer=null;});
  canvas.addEventListener('pointerup',event=>{if(!pointer)return;const clicked=!pointer.moved;pointer=null;if(!clicked||turn||deal||targetSide)return;const r=canvas.getBoundingClientRect();pointerNdc.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointerNdc,camera);if(raycaster.intersectObject(main,true).length)onFlip();});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();}document.addEventListener('visibilitychange',visibility);
  small=canvas.parentElement.clientWidth<650;rebuild();await loadImage(selected);start();
  return {show,flip,setPhoto,cancel,
    dealOut(direction){return animateDeal(0,direction*width*1.5,280);},
    dealIn(){return animateDeal(0,0,280,-.5);},
    setPaused(value){paused=value;if(value){cancelAnimationFrame(frame);frame=0;}else start();},
    setReducedMotion(value){reducedMotion=value;if(value){const wasTurning=!!turn;turn=null;flipValue=targetSide?Math.PI:0;draw(performance.now());if(wasTurning)onFlipEnd?.();}start();},
    dispose(){disposed=true;cancelAnimationFrame(frame);cancel();resizeObserver.disconnect();document.removeEventListener('visibilitychange',visibility);clearRig();environment.dispose();renderer.dispose();textRenderer.domElement.remove();}
  };
}
