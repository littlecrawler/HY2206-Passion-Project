import * as THREE from 'three';
import { photos } from './exhibit-data.js';

// Original interpretive display models; documentary photographs remain separate.
const bronze = new THREE.MeshStandardMaterial({color:0xb79350,metalness:.76,roughness:.32});
const iron = new THREE.MeshStandardMaterial({color:0x59616a,metalness:.8,roughness:.42});
const silver = new THREE.MeshStandardMaterial({color:0xc5d4de,metalness:.94,roughness:.19});
const dark = new THREE.MeshStandardMaterial({color:0x0c1823,metalness:.7,roughness:.23});
const textures = new Map();

function mesh(geometry, material) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function inscription(character, size = .5) {
  if (!textures.has(character)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#322d23';
    ctx.font = 'bold 185px "Microsoft JhengHei", "Noto Serif TC", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(character, 128, 134);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.set(character,map);
  }
  return new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:textures.get(character),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
}

function cashCoin(material = bronze, characters = []) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.absarc(0,0,1,0,Math.PI*2,false);
  const hole = new THREE.Path();
  hole.moveTo(-.24,-.24); hole.lineTo(-.24,.24); hole.lineTo(.24,.24); hole.lineTo(.24,-.24); hole.closePath();
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1,curveSegments:64});
  group.add(mesh(geometry,material));
  for (const z of [-.025,.165]) {
    const rim = mesh(new THREE.TorusGeometry(.91,.024,8,72),material);
    rim.position.z=z; group.add(rim);
  }
  const positions = characters.length===2 ? [[.58,0],[-.58,0]] : [[0,.58],[0,-.58],[.58,0],[-.58,0]];
  characters.forEach((character,i) => {
    const label = inscription(character,.48);
    label.position.set(positions[i][0],positions[i][1],.176);
    group.add(label);
  });
  return group;
}

function shell() {
  const group = new THREE.Group();
  const body = mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshPhysicalMaterial({color:0xe2dcc4,roughness:.26,metalness:.08,clearcoat:.7,clearcoatRoughness:.24}));
  body.scale.set(.62,.94,.43); group.add(body);
  const seam = mesh(new THREE.SphereGeometry(1,24,24),new THREE.MeshStandardMaterial({color:0x483b2a,roughness:.75}));
  seam.scale.set(.09,.73,.024); seam.position.z=.423; group.add(seam);
  const toothMaterial = new THREE.MeshStandardMaterial({color:0xc7ba93,roughness:.6});
  for(let i=0;i<11;i++) {
    const y=-.57+i*.113;
    for(const side of [-1,1]) {
      const tooth=mesh(new THREE.CapsuleGeometry(.022,.12,3,8),toothMaterial);
      tooth.rotation.z=Math.PI/2+side*.17; tooth.position.set(side*.1,y,.423); group.add(tooth);
    }
  }
  return group;
}

function spade() {
  const s=new THREE.Shape();
  [[-.13,1.17],[.13,1.17],[.13,.6],[.55,.34],[.51,-.78],[.22,-.78],[0,-.48],[-.22,-.78],[-.51,-.78],[-.55,.34],[-.13,.6]].forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y)); s.closePath();
  return mesh(new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:true,bevelSize:.026,bevelThickness:.02,bevelSegments:3}),new THREE.MeshStandardMaterial({color:0x75866c,metalness:.66,roughness:.43}));
}

function knife() {
  const s=new THREE.Shape();
  s.moveTo(-.08,-.8); s.bezierCurveTo(-.42,-.58,-.06,-.42,-.1,-.25); s.lineTo(-.38,.35); s.lineTo(-.45,1.04); s.quadraticCurveTo(-.15,1.55,.28,1.66); s.lineTo(.05,1.13); s.lineTo(-.04,.42); s.lineTo(.15,-.2); s.lineTo(.26,-.67); s.quadraticCurveTo(.2,-1.02,-.08,-.8);
  const hole=new THREE.Path(); hole.absarc(.06,-.65,.088,0,Math.PI*2,true); s.holes.push(hole);
  return mesh(new THREE.ExtrudeGeometry(s,{depth:.1,bevelEnabled:true,bevelSize:.017,bevelThickness:.018,bevelSegments:3}),new THREE.MeshStandardMaterial({color:0x7d9277,metalness:.72,roughness:.38}));
}

function roundedRectangle(width,height,radius) {
  const x=-width/2,y=-height/2,s=new THREE.Shape();
  s.moveTo(x+radius,y); s.lineTo(x+width-radius,y); s.quadraticCurveTo(x+width,y,x+width,y+radius);
  s.lineTo(x+width,y+height-radius); s.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
  s.lineTo(x+radius,y+height); s.quadraticCurveTo(x,y+height,x,y+height-radius);
  s.lineTo(x,y+radius); s.quadraticCurveTo(x,y,x+radius,y); return s;
}

export function makeSculpture(kind, loadPhoto) {
  const group=new THREE.Group();
  if(kind==='shells') {
    const a=shell(); a.position.set(-.65,.15,0); a.rotation.set(-.1,-.35,.24); group.add(a);
    const b=shell(); b.scale.setScalar(.85); b.position.set(.65,-.25,.2); b.rotation.set(.12,.3,-.3); group.add(b);
    const c=shell(); c.scale.setScalar(.52); c.position.set(.15,-.85,.55); c.rotation.set(.3,-.1,1.2); group.add(c);
  }
  if(kind==='shapes') {
    const a=spade(); a.position.set(-.7,0,.1); a.rotation.z=.08; group.add(a);
    const b=knife(); b.position.set(.8,-.2,0); b.rotation.z=-.13; group.add(b);
  }
  if(kind==='banliang'||kind==='tang') {
    const coin=cashCoin(bronze,kind==='tang'?['開','元','通','寶']:['半','兩']);
    coin.scale.setScalar(1.25); coin.rotation.y=-.22; group.add(coin);
  }
  if(kind==='song') {
    for(let i=0;i<3;i++) {
      const coin=cashCoin(iron); coin.scale.setScalar(.58); coin.position.set(-.85+i*.24,-.38+i*.19,i*.11); coin.rotation.set(.05,-.15,-.12+i*.1); group.add(coin);
    }
    const canvas=document.createElement('canvas'); canvas.width=384; canvas.height=512;
    const ctx=canvas.getContext('2d'); ctx.fillStyle='#abc7c5'; ctx.fillRect(0,0,384,512);
    ctx.strokeStyle='#324f53'; ctx.lineWidth=2; ctx.strokeRect(26,26,332,460);
    ctx.fillStyle='#27464a'; ctx.font='24px "Trebuchet MS",sans-serif'; ctx.textAlign='center'; ctx.fillText('JIAOZI',192,95);
    ctx.font='88px "Microsoft JhengHei",serif'; ctx.fillText('交子',192,253);
    ctx.font='21px "Times New Roman",serif'; ctx.fillText('A promise of payment',192,412);
    const map=new THREE.CanvasTexture(canvas); map.colorSpace=THREE.SRGBColorSpace;
    const plate=mesh(new THREE.BoxGeometry(1.3,1.85,.04),new THREE.MeshStandardMaterial({color:0xabc7c5,roughness:.4,metalness:.15}));
    const face=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.85),new THREE.MeshBasicMaterial({map})); face.position.z=.023; plate.add(face); plate.position.set(.72,.28,-.15); plate.rotation.y=-.15; group.add(plate);
  }
  if(kind==='yuan') {
    const plate=mesh(new THREE.BoxGeometry(1.8,2.65,.08),dark);
    loadPhoto('yuan').then(map=>{
      if(!map)return;
      const aspect=map.image.width/map.image.height;
      const w=Math.min(1.68,2.52*aspect), h=w/aspect;
      const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map})); face.position.z=.045; plate.add(face);
    });
    plate.rotation.y=-.15; group.add(plate);
  }
  if(kind==='silver') {
    const profile=[[0,-.23],[.5,-.2],[.85,-.02],[1.04,.4],[1.08,.6],[1,.59],[.8,.22],[.4,.08],[0,.06]].map(([x,y])=>new THREE.Vector2(x,y));
    const geometry=new THREE.LatheGeometry(profile,64);
    const pos=geometry.attributes.position;
    for(let i=0;i<pos.count;i++) { const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i); pos.setXYZ(i,x*1.6,y+.32*x*x,z*.73); }
    geometry.computeVertexNormals(); const ingot=mesh(geometry,silver); ingot.position.y=-.2; ingot.rotation.x=.15; group.add(ingot);
    const coin=cashCoin(bronze); coin.scale.setScalar(.56); coin.position.set(-1.25,.62,-.35); coin.rotation.set(.1,-.2,-.1); group.add(coin);
    const other=cashCoin(bronze); other.scale.setScalar(.49); other.position.set(1.15,.5,-.35); other.rotation.y=.23; group.add(other);
  }
  if(kind==='phone') {
    const phone=mesh(new THREE.ExtrudeGeometry(roundedRectangle(1.32,2.55,.17),{depth:.12,bevelEnabled:true,bevelSegments:4,bevelSize:.04,bevelThickness:.025}),dark);
    const screen=mesh(new THREE.ShapeGeometry(roundedRectangle(1.17,2.3,.11)),new THREE.MeshBasicMaterial({color:0xe5edec})); screen.position.z=.153; phone.add(screen);
    loadPhoto('paynow').then(map=>{ if(!map)return; const face=new THREE.Mesh(new THREE.PlaneGeometry(1.04,.59),new THREE.MeshBasicMaterial({map})); face.position.set(0,.15,.16); phone.add(face); });
    const speaker=mesh(new THREE.BoxGeometry(.35,.035,.015),dark); speaker.position.set(0,1.04,.17); phone.add(speaker);
    const bar=mesh(new THREE.BoxGeometry(.38,.026,.015),dark); bar.position.set(0,-1.04,.17); phone.add(bar);
    phone.rotation.set(.02,-.24,-.04); group.add(phone);
    for(const side of [-1,1]) {
      const block=mesh(new THREE.BoxGeometry(.45,.65,.45),new THREE.MeshPhysicalMaterial({color:side<0?0x89b4ed:0xaba0ed,metalness:.38,roughness:.17,transparent:true,opacity:.75}));
      block.position.set(side*1.2,-.28,-.3); block.rotation.set(.2,.5,.1); group.add(block);
    }
  }
  return group;
}
