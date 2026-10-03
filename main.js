import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport');
const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x080411,.055);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
camera.position.set(0,.25,8.3);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.2;
viewport.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.enablePan=false; controls.minDistance=5; controls.maxDistance=12;
controls.target.set(0,.1,0);

scene.add(new THREE.HemisphereLight(0xfff1c2,0x25103e,2.3));
const key=new THREE.DirectionalLight(0xffd75a,4); key.position.set(4,5,6); scene.add(key);
const rim=new THREE.PointLight(0x8d5cff,35,14); rim.position.set(-4,2,-1); scene.add(rim);

const gold=new THREE.MeshStandardMaterial({color:0xe8aa24,metalness:.55,roughness:.28});
const gold2=new THREE.MeshStandardMaterial({color:0xffcc45,metalness:.4,roughness:.3});
const glow=new THREE.MeshStandardMaterial({color:0xfff3a6,emissive:0xffd43b,emissiveIntensity:4,roughness:.2});
const dark=new THREE.MeshStandardMaterial({color:0x351b3f,metalness:.25,roughness:.45});

function headGeo(){
 const s=new THREE.Shape();
 s.moveTo(0,-1.12);
 s.bezierCurveTo(-.42,-1.1,-.72,-.78,-.74,-.43);
 s.bezierCurveTo(-.78,-.15,-1.18,.02,-1.58,.18);
 s.bezierCurveTo(-1.05,.32,-.78,.55,-.66,.82);
 s.bezierCurveTo(-.52,1.11,-.34,1.47,0,1.9);
 s.bezierCurveTo(.34,1.47,.52,1.11,.66,.82);
 s.bezierCurveTo(.78,.55,1.05,.32,1.58,.18);
 s.bezierCurveTo(1.18,.02,.78,-.15,.74,-.43);
 s.bezierCurveTo(.72,-.78,.42,-1.1,0,-1.12);
 return new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:true,bevelSegments:6,steps:1,bevelSize:.13,bevelThickness:.13,curveSegments:20});
}
const root=new THREE.Group(); scene.add(root);
const character=new THREE.Group(); root.add(character);
const headPivot=new THREE.Group(); headPivot.position.y=.9; character.add(headPivot);
const head=new THREE.Mesh(headGeo(),gold2); head.geometry.center(); head.scale.set(.92,.92,.92); headPivot.add(head);

const capsule=(r,l,mat)=>new THREE.Mesh(new THREE.CapsuleGeometry(r,l,8,16),mat);
const eyeL=capsule(.09,.26,glow),eyeR=capsule(.09,.26,glow);
eyeL.rotation.z=Math.PI/2; eyeR.rotation.z=Math.PI/2;
eyeL.position.set(-.38,.18,.39); eyeR.position.set(.38,.18,.39); headPivot.add(eyeL,eyeR);

const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.28,-.28,.41),new THREE.Vector3(0,-.5,.46),new THREE.Vector3(.28,-.28,.41));
const smile=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.035,8,false),glow); headPivot.add(smile);

const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.62,8,20),dark); torso.position.y=-1.05; character.add(torso);
const core=new THREE.Mesh(new THREE.SphereGeometry(.16,24,24),glow); core.position.set(0,-.92,.46); character.add(core);

function limb(x,y,rot=0){
 const p=new THREE.Group(); p.position.set(x,y,0); character.add(p);
 const a=capsule(.13,.64,gold); a.position.y=-.38; a.rotation.z=rot; p.add(a);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.19,20,20),gold2); h.position.set(Math.sin(-rot)*.68,-.73,0); p.add(h); return p;
}
const armL=limb(-.62,-.83,-.22),armR=limb(.62,-.83,.22);
function leg(x){const p=new THREE.Group();p.position.set(x,-1.52,0);character.add(p);const l=capsule(.15,.62,gold);l.position.y=-.38;p.add(l);return p}
const legL=leg(-.28),legR=leg(.28);

const halo=new THREE.Mesh(new THREE.TorusGeometry(1.55,.025,8,96),new THREE.MeshBasicMaterial({color:0xffd84c,transparent:true,opacity:.35}));
halo.rotation.x=Math.PI/2; halo.position.y=-2.05; scene.add(halo);

const stars=new THREE.BufferGeometry(); const pts=[];
for(let i=0;i<500;i++){const r=10+Math.random()*18,a=Math.random()*Math.PI*2,z=(Math.random()-.5)*18;pts.push(Math.cos(a)*r,(Math.random()-.5)*14,z+Math.sin(a)*r)}
stars.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffefb0,size:.035,transparent:true,opacity:.6})));

let mode='idle',waveStart=0,blinkAt=performance.now()+1800;
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b));if(mode==='wave')waveStart=performance.now()});
renderer.domElement.addEventListener('click',()=>{mode='wave';waveStart=performance.now();document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode==='wave'))});
document.querySelector('#export').style.display='none';

let px=0,py=0;
addEventListener('pointermove',e=>{px=(e.clientX/innerWidth-.5)*2;py=(e.clientY/innerHeight-.5)*2});
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate); const t=clock.getElapsedTime(),now=performance.now();
 root.position.y=Math.sin(t*1.4)*.12; character.rotation.z=Math.sin(t*.7)*.018;
 headPivot.rotation.y+=(px*.18-headPivot.rotation.y)*.035; headPivot.rotation.x+=(-py*.09-headPivot.rotation.x)*.035;
 armL.rotation.z=-.1+Math.sin(t*1.3)*.03; armR.rotation.z=.1-Math.sin(t*1.3)*.03;
 legL.rotation.z=Math.sin(t)*.018;legR.rotation.z=-Math.sin(t)*.018;
 if(mode==='wave'){const q=(now-waveStart)/1000;armL.rotation.z=-1.6+Math.sin(q*9)*.34;if(q>2.5){mode='idle';document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x.dataset.mode==='idle'))}}
 if(mode==='bounce')root.position.y+=Math.abs(Math.sin(t*4))*.34;
 if(mode==='spin')character.rotation.y+=.035;
 if(now>blinkAt){const p=(now-blinkAt)/180;const sy=p<1?Math.max(.06,Math.abs(p-.5)*2):1;eyeL.scale.y=sy;eyeR.scale.y=sy;if(p>1){eyeL.scale.y=eyeR.scale.y=1;blinkAt=now+2500+Math.random()*2600}}
 halo.rotation.z+=.0025;controls.update();renderer.render(scene,camera);
}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
