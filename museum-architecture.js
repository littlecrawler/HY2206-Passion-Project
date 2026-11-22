import * as THREE from 'three';
import { Reflector } from './vendor/three/Reflector.js';
import { rooms } from './museum-data.js?v=20261122-money-through-time';

// Architectural surfaces only. Every object on display is a credited photograph.
export function buildArchitecture(scene, { renderer, box, writing, photograph, mats, resources, selectables }) {
  const hall = new THREE.Group(); scene.add(hall);
  function ring(parent, inner, outer, y, material, start = 0, length = Math.PI * 2) {
    const geometry = new THREE.RingGeometry(inner, outer, 128, 1, start, length);
    const mesh = new THREE.Mesh(geometry, material); mesh.rotation.x = -Math.PI / 2; mesh.position.y = y;
    parent.add(mesh); resources.push(geometry); return mesh;
  }
  const stoneCanvas = document.createElement('canvas'); stoneCanvas.width = stoneCanvas.height = 256;
  const context = stoneCanvas.getContext('2d'), data = context.createImageData(256,256);
  let seed = 121;
  for (let n=0;n<data.data.length;n+=4) { seed=(seed*16807)%2147483647;const shade=120+seed%25;data.data[n]=data.data[n+1]=data.data[n+2]=shade;data.data[n+3]=255; }
  context.putImageData(data,0,0);
  const grain = new THREE.CanvasTexture(stoneCanvas); grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(25,25); resources.push(grain);
  const floorMaterial = new THREE.MeshStandardMaterial({color:'#34434e',roughness:.64,metalness:.12,bumpMap:grain,bumpScale:.035,transparent:true,opacity:.95,depthWrite:false});resources.push(floorMaterial);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(34,128), floorMaterial); floor.rotation.x=-Math.PI/2;floor.position.y=.006;floor.receiveShadow=true;hall.add(floor);resources.push(floor.geometry);
  const mirror = new Reflector(new THREE.CircleGeometry(33.9,96),{textureWidth:innerWidth<781?512:1024,textureHeight:1024,color:0x53636f,clipBias:.004});
  mirror.rotation.x=-Math.PI/2;mirror.position.y=-.012;hall.add(mirror);resources.push({dispose(){mirror.geometry.dispose();mirror.dispose();}});
  ring(hall,16.3,16.34,.015,mats.metal);
  ring(hall,16.42,16.44,.018,mats.white);
  ring(hall,8.8,8.83,.015,mats.metal);
  for(let n=0;n<32;n++) { const a=n*Math.PI/16;const joint=box(hall,.014,.012,15.8,Math.sin(a)*24.3,.02,Math.cos(a)*24.3,mats.dark);joint.rotation.y=a; }

  // A recessed circular roof and a slim luminous oculus replace the low strip ceiling.
  const ceilingMat=new THREE.MeshStandardMaterial({color:'#15242e',roughness:.85,side:THREE.DoubleSide});resources.push(ceilingMat);
  ring(hall,8.5,33,11,ceilingMat);
  const oculus = ring(hall,8.5,8.7,10.83,mats.white);oculus.material.side=THREE.DoubleSide;
  ring(hall,9.1,9.16,10.86,mats.metal);
  ring(hall,17.2,17.28,10.84,mats.white);
  const skyMat=new THREE.MeshBasicMaterial({color:'#728f9c',side:THREE.DoubleSide,toneMapped:false});resources.push(skyMat);
  const sky=new THREE.Mesh(new THREE.CircleGeometry(8.5,96),skyMat);sky.rotation.x=Math.PI/2;sky.position.y=12.5;hall.add(sky);resources.push(sky.geometry);
  for(let n=0;n<24;n++) { const a=n*Math.PI/12;const rib=box(hall,.1,.2,8.5,Math.sin(a)*13.3,10.95,Math.cos(a)*13.3,mats.dark);rib.rotation.y=a; }

  const title=writing(hall,'Money Through Time',22,2.6,0,8.55,1,{size:150,color:'#d7edf3'});

  const portals=[];
  rooms.forEach((room,index)=>{
    const group=new THREE.Group();group.position.set(room.x,0,room.z);group.rotation.y=room.angle;scene.add(group);
    box(group,8.5,.3,12.2,0,-.18,0,mats.stone);
    box(group,8.5,9.2,.3,0,4.6,-6.1,mats.gallery);
    box(group,.25,9.2,12.3,-4.2,4.6,0,mats.gallery);
    box(group,.25,9.2,12.3,4.2,4.6,0,mats.gallery);
    box(group,8.5,.3,12.4,0,9.3,0,mats.dark);
    box(group,1.5,9.2,.5,-3.5,4.6,6,mats.wall);
    box(group,1.5,9.2,.5,3.5,4.6,6,mats.wall);
    box(group,5.5,2.65,.5,0,7.88,6,mats.wall);
    const light=new THREE.MeshBasicMaterial({color:'#93b1c0',toneMapped:false});resources.push(light);portals.push(light);
    for(const x of [-2.76,2.76]) {
      box(group,.14,6.55,.3,x,3.28,6.15,mats.metal);
      box(group,.032,6.5,.06,x,3.25,6.33,light);
    }
    box(group,5.65,.14,.3,0,6.55,6.15,mats.metal);
    box(group,5.5,.032,.06,0,6.53,6.33,light);
    box(group,5.4,.015,.65,0,.018,6.12,mats.metal);
    writing(group,room.label,5.5,.72,0,7.6,6.32,{size:140});
    writing(group,room.date,5.5,.45,0,6.94,6.32,{size:85,color:'#a9c0cd'});
    writing(group,String(index+1).padStart(2,'0'),.8,.5,-3.5,5.9,6.3,{size:260,color:'#b3cbd6'});
    const portal=new THREE.Mesh(new THREE.PlaneGeometry(5.5,6.5),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));portal.position.set(0,3.25,6.4);portal.userData.room=index;group.add(portal);selectables.push(portal);resources.push(portal.geometry,portal.material);
    box(group,6.7,.035,.14,0,8.25,-4.5,mats.white);
    for(const x of [-3.6,3.6])box(group,.03,7,.1,x,4.1,-5.91,mats.metal);
    if(room.id==='song') photograph(group,'songpaper',index,.5,3.65,-5.84,2.7,4.5);
    else photograph(group,room.photos[0],index,.5,3.65,-5.84);
    room.photos.slice(1).forEach((id,n)=>{const side=n%2?1:-1;photograph(group,id,index,side*4.04,3.35,-.6,3.5,3.6,-side*Math.PI/2);});
    const entryPhoto={0:'cowries',3:'tang',6:'ming'}[index];
    if(entryPhoto) photograph(group,entryPhoto,index,-3.5,2.9,6.34,1.1,entryPhoto==='ming'?1.8:1.1,0,true);
    const lightPool = new THREE.PointLight(0xc7dce9,38,12,2);lightPool.position.set(0,6,-2);group.add(lightPool);
  });
  for(const side of [-1,1]) {
    const bench=new THREE.Group();bench.position.set(side*11,.0,3);bench.rotation.y=side*-.5;hall.add(bench);
    box(bench,3.8,.2,1.15,0,.77,0,mats.stone);
    for(const x of [-1.4,1.4])box(bench,.15,.65,.85,x,.36,0,mats.dark);
  }
  return { title, highlight(index){portals.forEach((material,n)=>material.color.set(n===index?'#e8f7ff':'#93b1c0'));} };
}
