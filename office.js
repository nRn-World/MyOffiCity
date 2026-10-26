/* nRn Company – 3D-kontor. Bygger en byggnad (loft/kontor/hq) och placerar anställda vid skrivbord. */
const Office=(()=>{
const T3=THREE;
const TIERS={loft:{BW:12,floors:2},kontor:{BW:19,floors:3},hq:{BW:26,floors:4}};
// arkitektur per byggnad: loft = ljust furu + svart stål, hub = aluminium + ek, HQ = mörk titan + guld
const BSTYLES={
  loft:{frame:0x1d1e22,slab:0xd8b27c,wall:0xfbfaf7,win:0x1d1e22,roof:0x2a2b30,floors:['pine','pine']},
  kontor:{frame:0xb9c0c8,slab:0xe8e6e1,wall:0xfcfbf8,win:0xb9c0c8,roof:0xe4e0d8,floors:['wood','wood','wood']},
  hq:{frame:0x2a2c33,slab:0x2a2c33,wall:0xfaf7f0,win:0x2a2c33,roof:0x23252b,gold:0xc9a24a,floors:['tile','wood','wood','walnut']}};
let VAR=0,TIERK='kontor',OBST=[];
function obst(x,y,z,hw,hd,ry){OBST.push({x,y,z,hw,hd,ry});}   // halvbredd/halvdjup, rotation runt y
function pushOut(o){   // flyttar ut personen ur ett möbelhinder (glider längs kanten)
  for(const b of OBST){
    if(Math.abs(b.y-o.position.y)>1)continue;
    const c=Math.cos(b.ry),s=Math.sin(b.ry),dx=o.position.x-b.x,dz=o.position.z-b.z,lx=dx*c-dz*s,lz=dx*s+dz*c,px=b.hw+.32,pz=b.hd+.32;
    if(Math.abs(lx)<px&&Math.abs(lz)<pz){
      const ox=px-Math.abs(lx),oz=pz-Math.abs(lz);let nx=0,nz=0;if(ox<oz)nx=lx>=0?ox:-ox;else nz=lz>=0?oz:-oz;
      o.position.x+=nx*c+nz*s;o.position.z+=-nx*s+nz*c;
    }
  }
}
function safePt(x,z,y){   // flyttar en målpunkt ut ur möbler så att ingen försöker stå i dem
  for(let k=0;k<3;k++)for(const b of OBST){
    if(Math.abs(b.y-y)>1)continue;
    const c=Math.cos(b.ry),s=Math.sin(b.ry),dx=x-b.x,dz=z-b.z,lx=dx*c-dz*s,lz=dx*s+dz*c,px=b.hw+.5,pz=b.hd+.5;
    if(Math.abs(lx)<px&&Math.abs(lz)<pz){
      const ox=px-Math.abs(lx),oz=pz-Math.abs(lz);let nx=0,nz=0;if(ox<oz)nx=lx>=0?ox:-ox;else nz=lz>=0?oz:-oz;
      x+=nx*c+nz*s;z+=-nx*s+nz*c;
    }
  }
  return [x,z];
}
const PAL=[{},{wall:0xfbfaf7,slab:0xc9b99a,roof:0x2f6b55,frame:0x2c5a4a,win:0x2c5a4a},{wall:0xfbfaf7,slab:0xb98b5b,roof:0xa94a35,frame:0x7a3328,win:0x7a3328},{wall:0xfbfaf7,slab:0xa9b3bf,roof:0x3a62a8,frame:0x2f4b7a,win:0x2f4b7a},{wall:0xfbfaf7,slab:0xd2a590,roof:0xc9922f,frame:0xc08a2e,win:0xc08a2e},{wall:0xfbfaf7,slab:0x8fa88a,roof:0x7a5aa8,frame:0x6b5a8a,win:0x6b5a8a}];
const SIGNC=[['#1b2550','#0c1230','#ffd27a','#6fc8ff'],['#2a1a12','#120a06','#f0b07a','#ffb36b'],['#12332b','#06150f','#8fe0b8','#6fffd0'],['#2b1245','#12061f','#d9a7ff','#c58bff'],['#3a1216','#190508','#ffc4a0','#ff8f6f'],['#10283a','#06121c','#a7e0ff','#6fd0ff']];
const GROUNDC=[0x58a834,0x4f9d30,0x5fae38,0x4c9a2e,0x66b13c,0x55a533];
const LEAFC=[[0x3f7a26,0x4f8f30,0x2f6420],[0x5a7a2a,0x6b8f33,0x46611f],[0x6e7a2c,0x82903a,0x566024],[0x2f6b2a,0x3d8236,0x24551f],[0x4d7a2b,0x5f9136,0x3a5f20],[0x6b6f2a,0x7f8636,0x555a22]];
let STY=BSTYLES.kontor,frameM=null,winM=null,goldM=null,flames=[];
const BD=6.6,Z0=-5.4,Z1=1.2,ZC=-2.1,FH=5.2,WH=FH-.4;
// Fyra fasadstilar till staden bakom kontoret. Färgerna blandas mellan natt och dag
// i drawCity(), så fönstren tänds när det blir mörkt.
const CITY_STYLES=[
  {k:'glass',night:'#1a2b3a',day:'#c3cec2',frameN:'#111d28',frameD:'#7f8a74',winN:'#0c1a24',winD:'#5f8f8a',lit:['#ffd38a','#ffe9b5'],glass:true},
  {k:'stone',night:'#2b2927',day:'#dcc9a5',frameN:'#1b1a18',frameD:'#a58f6a',winN:'#111820',winD:'#4f747c',lit:['#ffcf87','#ffdda6']},
  {k:'brick',night:'#2a1d1b',day:'#b26e4f',frameN:'#1a1210',frameD:'#7d4a33',winN:'#10151c',winD:'#476a73',lit:['#ffd39a','#ffc37a']},
  {k:'steel',night:'#151c25',day:'#b6ad97',frameN:'#0c1118',frameD:'#7f7867',winN:'#0a1017',winD:'#6d97a4',lit:['#cfe7ff','#ffe2b0'],glass:true}
];
let BW=19,floors=3,LAWN=null;
/* Gräs: modellen "Grass" av MauroGonzalezA (CC BY 4.0, se CREDITS.md). Marken har en tät gräsmatta som sömlös bild fotad uppifrån ur modellen
   (grasscarpet.jpg), och ovanpå ligger låga tuvor av modellens riktiga strån (tre varianter, grassblades.bin) som en InstancedMesh. */
let GK=null,GK_TRIED=false,gpMat=null;
function loadGrassKit(){
  if(GK){applyCarpet();return;}
  if(GK_TRIED)return;GK_TRIED=true;
  Promise.all([
    new Promise((ok,no)=>new T3.TextureLoader().load('models/grasscarpet.jpg?v=2',ok,undefined,no)),
    fetch('models/grassblades.bin?v=3').then(r=>r.ok?r.arrayBuffer():Promise.reject())
  ]).then(([tex,buf])=>{
    tex.encoding=T3.sRGBEncoding;tex.wrapS=tex.wrapT=T3.RepeatWrapping;tex.repeat.set(110,110);tex.anisotropy=8;
    const dv=new DataView(buf),n=dv.getUint32(0,true),geos=[];let off=4;
    for(let i=0;i<n;i++){
      const nV=dv.getUint32(off,true),nI=dv.getUint32(off+4,true);off+=8;
      const pos=new Float32Array(buf,off,nV*3);off+=nV*12;const col=new Uint8Array(buf,off,nV*3);off+=Math.ceil(nV*3/4)*4;const idx=new Uint16Array(buf,off,nI);off+=Math.ceil(nI/2)*4;
      const g=new T3.BufferGeometry();g.setAttribute('position',new T3.BufferAttribute(pos,3));g.setAttribute('color',new T3.BufferAttribute(col,3,true));g.setIndex(new T3.BufferAttribute(idx,1));g.computeVertexNormals();g.computeBoundingSphere();geos.push(g);
    }
    GK={tex,geos,thin:geos.map(g=>thinGeo(g,4))};gpMat=new T3.MeshLambertMaterial({vertexColors:true,side:T3.DoubleSide});
    applyCarpet();if(root)placeGrass(root.userData.gpE);
  }).catch(()=>{});
}
function thinGeo(g,step){   // färre strån (varje strå = 7 hörn och 15 index): för långt avstånd
  const P=g.attributes.position.array,C=g.attributes.color.array,I=g.index.array,nb=P.length/21|0,pos=[],col=[],idx=[];let o=0;
  for(let b=0;b<nb;b+=step){for(let k=0;k<21;k++)pos.push(P[b*21+k]);for(let k=0;k<21;k++)col.push(C[b*21+k]);for(let k=0;k<15;k++)idx.push(I[b*15+k]-b*7+o);o+=7;}
  const t=new T3.BufferGeometry();t.setAttribute('position',new T3.Float32BufferAttribute(pos,3));t.setAttribute('color',new T3.BufferAttribute(new Uint8Array(col),3,true));t.setIndex(idx);t.computeVertexNormals();t.computeBoundingSphere();return t;
}
function applyCarpet(){if(!GK||!groundMat)return;groundMat.map=GK.tex;groundMat.needsUpdate=true;if(root)applyTime();}
const GK_XZ=1.5,GK_Y=2.4;
function placeGrass(e){
  if(!root)return;root.userData.gpE=e;
  if(!GK||root.userData.gp)return;root.userData.gp=1;
  // allt som är asfalt, trottoar, torg eller hus får inga strån; resten av den gröna marken har gräsmattan som marktextur
  const bl=-(e+AWL+.7),br=e+AWR+.7;
  const paved=(x,z)=>(x>bl&&x<br&&z>-6.7&&z<2.7)||(Math.abs(x)<e+15.2&&z>1.9&&z<5.3)||z<-7.1||(z>6.65&&z<11.75)||(STY.gold&&Math.abs(x)<e+9.4&&z>-10.6&&z<8.4);
  const coarse=matchMedia('(pointer:coarse)').matches,k=coarse?.5:1;
  const near=(x,z)=>Math.abs(x)<34&&z<16;
  const spots=[];   // [x,z,avstånd 0 nära | 1 mellan | 2 långt]
  const mid=(x,z)=>Math.abs(x)<56&&z<30;
  const fill=(x0,x1,z0,z1,dens,keep,tier)=>{const n=Math.round((x1-x0)*(z1-z0)*dens);for(let i=0;i<n;i++){const x=x0+Math.random()*(x1-x0),z=z0+Math.random()*(z1-z0);if(!paved(x,z)&&keep(x,z))spots.push([x,z,tier]);}};
  fill(-34,34,-7.2,16,5.5*k,near,0);                                            // nära: tätt
  fill(-56,56,-7.2,30,1.1*k,(x,z)=>!near(x,z),1);                              // mellan
  fill(-95,95,-7.2,75,1.5*k,(x,z)=>!mid(x,z),2);
  const far2=(x,z)=>Math.abs(x)<95&&z<75;
  fill(-140,140,-7.2,140,.4*k,(x,z)=>!far2(x,z),3);                         // yttersta kanten: glest men stora tuvor                              // långt: lätta tuvor, stora
  const bins=GK.geos.map(()=>[[],[],[],[]]);spots.forEach(p=>bins[Math.floor(Math.random()*bins.length)][p[2]].push(p));
  const m=new T3.Matrix4(),q=new T3.Quaternion(),up=new T3.Vector3(0,1,0),pos=new T3.Vector3(),sc=new T3.Vector3(),col=new T3.Color();
  GK.geos.forEach((geo,gi)=>{for(let tier=0;tier<4;tier++){
    const list=bins[gi][tier];if(!list.length)continue;
    const mesh=new T3.InstancedMesh(tier>=2?GK.thin[gi]:geo,gpMat,list.length);
    list.forEach(([x,z],i)=>{
      const r=[1,1.35,2.3,3.4][tier]*(.8+Math.random()*.4);
      pos.set(x,-.7,z);q.setFromAxisAngle(up,Math.random()*Math.PI*2);sc.set(GK_XZ*r,GK_Y*r*(.85+Math.random()*.3),GK_XZ*r);
      m.compose(pos,q,sc);mesh.setMatrixAt(i,m);const v=.78+Math.random()*.25;mesh.setColorAt(i,col.setRGB(v,v,v));
    });
    mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;root.add(mesh);
  }});
  applyTime();
}
function lawnTex(){   // mjukt klippt gräsmatta: band och korn ger marken liv i stället för platt färg
  if(LAWN)return LAWN;
  const c=cv(64,64),g=c.getContext('2d');
  g.fillStyle='#e4e4e4';g.fillRect(0,0,64,64);
  for(let y=0;y<64;y+=8){g.fillStyle=y%16?'rgba(0,0,0,.07)':'rgba(255,255,255,.06)';g.fillRect(0,y,64,4);}
  for(let i=0;i<800;i++){g.fillStyle=Math.random()>.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.07)';g.fillRect(Math.random()*64,Math.random()*64,1,1);}
  const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.repeat.set(64,64);t.anisotropy=4;
  return LAWN=t;
}
let renderer,scene,camera,root,canvas,overlay,fillL;
let screens=[],leds=[],holos=[],trails=[],packets=[],screenHits=[],onScreen=null;
let hemi,sunL,bgC,bgT,skyC,groundMat,lights=[],hourNow=12,cars=[],bikes=[],cityTex=[],cityFaces=[],cityMats=[],cityBeacons=[],onPick=null,onSign=null,onZoomOut=null,signGrp=null,lastF=0,movers=[],ELX=0,visiting=false,socializing=false,sceneGen=0,selId=null,beamMat,glowMat,tailMat;
const agents={};
let az=22*Math.PI/180,el=13*Math.PI/180,zoom=1;
const tgt=new T3.Vector3(0,7.6,-2.1);

const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const rnd=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);};
const ease=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
const hash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h;};
const M=(c,o={})=>new T3.MeshStandardMaterial(Object.assign({color:c,roughness:.65,metalness:.05},o));
function box(w,h,d,mat,x,y,z,p){const m=new T3.Mesh(new T3.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
function cyl(rt,rb,h,mat,x,y,z,p,seg=16){const m=new T3.Mesh(new T3.CylinderGeometry(rt,rb,h,seg),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m;}
function sph(r,mat,x,y,z,p,sx=1,sy=1,sz=1){const m=new T3.Mesh(new T3.SphereGeometry(r,20,16),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;p.add(m);return m;}
let dark,metal,wood,woodD,chairM,white,wall,trim;
let SKY,GT;

/* ---------- skärmar ---------- */
function makeScreen(type){
  const c=cv(256,160),tx=new T3.CanvasTexture(c);tx.encoding=T3.sRGBEncoding;const s={c,g:c.getContext('2d'),tex:tx,type,seed:Math.random()*50};
  screens.push(s);drawScreen(s,0);return s;
}
let statsData=null;
function drawStats(g,W,H){
  const d=statsData;g.fillStyle='#0b1220';g.fillRect(0,0,W,H);
  if(!d){g.fillStyle='#38d8ff';g.font='bold 14px Arial';g.fillText('…',10,20);return;}
  g.fillStyle='#1b2a4a';g.fillRect(0,0,W,16);g.fillStyle='#cfe3ff';g.font='bold 10px Arial';g.textBaseline='middle';g.fillText(d.title,6,8);g.textAlign='right';g.fillText(d.time,W-6,8);g.textAlign='left';
  d.kpis.forEach((k,i)=>{const x=4+(i%3)*84,y=20+Math.floor(i/3)*42;g.fillStyle='#14213d';g.fillRect(x,y,80,38);
    g.fillStyle='#8fa6c8';g.font='9px Arial';g.fillText(k.l.slice(0,16),x+4,y+9);g.fillStyle=k.c||'#ffffff';g.font='bold 13px Arial';g.fillText(k.v.slice(0,12),x+4,y+26);});
  const bx=4,by=108,bw=W-8,bh=48,mx=Math.max(1e-9,...d.bars.map(b=>Math.max(b.c,b.r)));g.fillStyle='#101a33';g.fillRect(bx,by,bw,bh);
  const n=d.bars.length,cw=(bw-10)/n;
  d.bars.forEach((b,i)=>{const x=bx+5+i*cw,hc=(bh-10)*b.c/mx,hr=(bh-10)*b.r/mx;g.fillStyle='#ff6b6b';g.fillRect(x,by+bh-4-hc,cw*.4,hc);g.fillStyle='#3fe08f';g.fillRect(x+cw*.45,by+bh-4-hr,cw*.4,hr);});
}
function drawScreen(s,t){
  const g=s.g,W=256,H=160;
  if(s.type==='stats'){drawStats(g,W,H);s.tex.needsUpdate=true;return;}
  if(s.type==='off'){g.fillStyle='#12151c';g.fillRect(0,0,W,H);}
  else if(s.type==='code'){
    g.fillStyle='#0e1320';g.fillRect(0,0,W,H);
    const pal=['#7ee787','#79c0ff','#ffa657','#d2a8ff','#ff7b72','#8b949e'];
    const sc=t*14,off=sc%11,row0=Math.floor(sc/11);
    for(let i=-1;i<15;i++){
      const r=rnd(row0+i+s.seed),ind=Math.floor(r*4)*14,len=25+rnd(r*9)*120;
      g.fillStyle=pal[Math.floor(rnd(r*5)*6)];g.fillRect(8+ind,i*11-off+14,len,5);
      if(r>.55){g.fillStyle=pal[Math.floor(rnd(r*7)*6)];g.fillRect(14+ind+len,i*11-off+14,20+rnd(r*3)*30,5);}
    }
  }else if(s.type==='chart'){
    g.fillStyle='#f6f7fb';g.fillRect(0,0,W,H);
    for(let i=0;i<7;i++){const h=30+(Math.sin(t*.8+i*1.3+s.seed)*.5+.5)*70;g.fillStyle=['#5b8cff','#ff8fb3','#ffc94a'][i%3];g.fillRect(14+i*22,140-h,16,h);}
    const cols=['#5b8cff','#ff8fb3','#3fe08f','#ffc94a'];let a=-Math.PI/2;
    [.4,.25,.2,.15].forEach((v,i)=>{g.fillStyle=cols[i];g.beginPath();g.moveTo(208,55);g.arc(208,55,36,a,a+v*Math.PI*2);g.fill();a+=v*Math.PI*2;});
  }else if(s.type==='dash'){
    g.fillStyle='#111729';g.fillRect(0,0,W,H);
    g.strokeStyle='#3fe0d0';g.lineWidth=3;g.beginPath();
    for(let x=0;x<=W;x+=8){const y=80+Math.sin(x*.05+t*1.5+s.seed)*28+Math.sin(x*.13+t)*10;x?g.lineTo(x,y):g.moveTo(x,y);}
    g.stroke();g.fillStyle='#1e2848';
    for(let i=0;i<3;i++)g.fillRect(10+i*82,118,72,32);
    g.fillStyle='#ffc94a';g.fillRect(14,124,40+Math.sin(t+1)*10,6);
  }else if(s.type==='design'){
    g.fillStyle='#f3eefc';g.fillRect(0,0,W,H);
    g.fillStyle='#7a5cff';g.fillRect(0,0,W,22);g.fillStyle='#fff';g.fillRect(10,8,50,6);
    ['#ffd1e0','#cfe8ff','#d6f5dc'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(12+i*80,34,72,60);g.fillStyle='#fff';g.fillRect(18+i*80,40,60,26);});
    g.fillStyle='#7a5cff';g.fillRect(12,106,70+Math.sin(t*2)*8,18);g.fillStyle='#ccc';g.fillRect(100,110,120,6);g.fillRect(100,121,80,6);
  }else if(s.type==='board'){
    g.fillStyle='#f4f1ea';g.fillRect(0,0,W,H);
    for(let c=0;c<3;c++){g.fillStyle='#e0dacd';g.fillRect(8+c*83,8,76,144);
      for(let n=0;n<3;n++){g.fillStyle=['#ffe27a','#ffb3c7','#9fe3ff','#b6f0b0'][(c+n)%4];g.fillRect(14+c*83,16+n*44+(c===1?Math.sin(t*2+n)*3:0),64,36);}}
  }else{
    g.fillStyle='#1b4fb0';g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;
    for(let x=0;x<W;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
    for(let y=0;y<H;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(30,26,196,108);g.strokeRect(30,26,70,50);g.strokeRect(120,70,106,64);
  }
  s.tex.needsUpdate=true;
}
function monitor(parent,x,y,z,type,o={}){
  const w=o.w||.9,h=o.h||.55,g=new T3.Group();
  g.position.set(x,y,z);g.rotation.y=o.ry||0;
  box(.07,.28,.07,dark,0,.14,0,g);box(.3,.03,.2,dark,0,.015,0,g);
  box(w+.06,h+.06,.04,dark,0,.28+h/2,0,g);
  const sc=makeScreen(type);
  const p=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:sc.tex}));
  p.position.set(0,.28+h/2,.022);g.add(p);parent.add(g);return g;
}

/* ---------- möbler ---------- */
function plant(x,y,z,s=1){
  const g=new T3.Group();g.position.set(x,y,z);g.scale.setScalar(s);
  cyl(.28,.22,.4,M(0xc9774a),0,.2,0,g);
  const gm=[M(0x075717),M(0x0d7a22),M(0x054111)];
  for(let i=0;i<9;i++){
    const a=i/9*Math.PI*2,l=sph(.16,gm[i%3],Math.cos(a)*.18,.8+(i%3)*.18,Math.sin(a)*.18,g,1,3.2,.55);
    l.rotation.set(Math.sin(a)*.45,0,-Math.cos(a)*.45);l.rotation.y=-a;
  }
  root.add(g);
}
function cooler(x,y,z){
  const g=new T3.Group();g.position.set(x,y,z);
  box(.7,1.0,.7,M(0xe8ecf2),0,.5,0,g);cyl(.3,.3,.7,M(0x8fd0ff,{transparent:true,opacity:.75}),0,1.35,0,g);
  box(.1,.1,.06,M(0x4a90e2),0,.8,.36,g);root.add(g);
}
function deskTop(parent,w,d,x,y,z,col=wood){
  box(w,.07,d,col,x,y-.035,z,parent);
  for(const sx of[-1,1])for(const sz of[-1,1])box(.07,y-.07,.07,metal,x+sx*(w/2-.1),(y-.07)/2,z+sz*(d/2-.1),parent);
}
function sofa(x,y,z,ry,col=0x8a6a52){obst(x,y,z,1.1,.45,ry);
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  const m=M(col);box(2.2,.45,.9,m,0,.3,0,g);box(2.2,.7,.25,m,0,.7,-.35,g);
  box(.25,.6,.9,m,-1.1,.5,0,g);box(.25,.6,.9,m,1.1,.5,0,g);
  box(.55,.3,.4,M(0xe58a3a),-.5,.65,-.1,g);root.add(g);
}
function armchair(x,y,z,ry,col=0x7b5d49){obst(x,y,z,.5,.45,ry);
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  const m=M(col);box(.95,.4,.9,m,0,.28,0,g);box(.95,.7,.22,m,0,.7,-.34,g);box(.2,.55,.9,m,-.5,.5,0,g);box(.2,.55,.9,m,.5,.5,0,g);root.add(g);
}
function chair(parent,x,z,ry=0,y=0){
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  cyl(.3,.3,.04,chairM,0,.06,0,g);cyl(.04,.04,.35,metal,0,.25,0,g);
  box(.62,.1,.56,chairM,0,.46,0,g);box(.56,.72,.09,chairM,0,.86,-.3,g);parent.add(g);return g;
}
function bookshelf(x,y,z,ry){
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  box(1.8,1.5,.45,M(0x4a3a30),0,.75,0,g);
  [.45,.9,1.35].forEach(h=>box(1.7,.04,.4,woodD,0,h,.02,g));
  const cs=[0xd9534f,0x5b8cff,0xffc94a,0x3fb866,0xa98bff];
  for(let r=0;r<3;r++)for(let i=0;i<7;i++)box(.1,.28+rnd(i+r)*.1,.28,M(cs[(i+r)%5]),-.7+i*.22,.19+r*.45+.14,.05,g);
  root.add(g);
}
function rack(x,y,z){
  const g=new T3.Group();g.position.set(x,y,z);
  for(let i=0;i<3;i++){box(.7,.3,.6,M(0x2a2e3a),0,.15+i*.33,0,g);
    for(let k=0;k<4;k++){leds.push(box(.05,.05,.02,new T3.MeshBasicMaterial({color:0x3fe08f}),-.22+k*.12,.15+i*.33,.31,g));}}
  root.add(g);
}
function holo(x,y,z,type,w,h,ry=0){
  const sc=makeScreen(type),g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  g.add(new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:sc.tex,transparent:true,opacity:.88,side:T3.DoubleSide})));
  g.add(new T3.LineSegments(new T3.EdgesGeometry(new T3.PlaneGeometry(w,h)),new T3.LineBasicMaterial({color:0x6fe0ff})));
  const fy=Math.floor((y-h/2)/FH)*FH,ph=y-h/2-fy;
  if(ph>.05){cyl(.05,.05,ph,metal,0,-h/2-ph/2,-.05,g,8);cyl(.3,.34,.05,dark,0,-h/2-ph,-.05,g,16);}
  root.add(g);
}
function glass(w,h,x,y,z,ry){
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=ry;
  g.add(new T3.Mesh(new T3.BoxGeometry(w,h,.05),new T3.MeshStandardMaterial({color:0xaee0ff,transparent:true,opacity:.28,roughness:.1})));
  const fr=winM||M(0x3a3f4a);
  box(w,.08,.1,fr,0,h/2,0,g);box(w,.08,.1,fr,0,-h/2,0,g);
  const n=Math.max(1,Math.round(w/2.5));
  for(let i=0;i<=n;i++)box(.06,h,.08,fr,-w/2+i*(w/n),0,0,g);
  root.add(g);
}
function pendant(x,y,z,len=1.6){
  const g=new T3.Group();g.position.set(x,y,z);
  cyl(.012,.012,len,dark,0,len/2+.3,0,g,6);
  cyl(.12,.45,.3,white,0,.3,0,g,20);
  const disc=new T3.Mesh(new T3.CircleGeometry(.4,20),new T3.MeshBasicMaterial({color:0xfff3c8}));
  disc.position.y=.14;disc.rotation.x=Math.PI/2;g.add(disc);
  root.add(g);
}

/* ---------- byggnad ---------- */
function texFloor(kind){
  const c=cv(256,256),g=c.getContext('2d');
  if(kind==='carpet'){
    g.fillStyle='#5f7186';g.fillRect(0,0,256,256);
    for(let i=0;i<3000;i++){g.fillStyle='rgba('+(rnd(i)>.5?'255,255,255':'0,0,0')+',.05)';g.fillRect(rnd(i*3)*256,rnd(i*7)*256,2,2);}
    g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=2;for(let i=0;i<=256;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke();}
  }else if(kind==='tile'){
    g.fillStyle='#dcd8d0';g.fillRect(0,0,256,256);g.strokeStyle='#bdb7ab';g.lineWidth=3;
    for(let i=0;i<=256;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke();}
  }else{
    const P={pine:['#d9b98a','#e2c49a','#cfae7e'],walnut:['#4a2f20','#553623','#3f281b']}[kind]||['#8a5632','#94603a','#835030'];
    g.fillStyle=P[0];g.fillRect(0,0,256,256);
    for(let i=0;i<8;i++){g.fillStyle=i%2?P[1]:P[2];g.fillRect(0,i*32,256,32);g.fillStyle='rgba(30,10,0,.4)';g.fillRect(0,i*32,256,2);g.fillRect((i*83)%256,i*32,2,32);}
  }
  const t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=renderer?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4;const k=kind==='carpet'?5:4;t.repeat.set(BW/k,BD/k);return t;
}
function slab(yTop,kind){
  const side=M(STY.slab,{metalness:STY.gold?.5:.05,roughness:.5}),top=new T3.MeshStandardMaterial({map:texFloor(kind),roughness:kind==='walnut'?.35:.8});
  const m=new T3.Mesh(new T3.BoxGeometry(BW+.6,.4,BD+.6),[side,side,top,side,side,side]);
  m.position.set(0,yTop-.2,ZC);m.receiveShadow=m.castShadow=true;root.add(m);
  box(BW+.7,.08,BD+.7,M(0x4a4f5a),0,yTop-.44,ZC,root);
}
function elevator(x,y){
  const g=new T3.Group();g.position.set(x,y,Z0+.06);
  box(2.4,3.2,.1,M(0x6a707c),0,1.6,0,g);
  const dm=M(0xc5cbd3,{metalness:.7,roughness:.3});
  box(.95,2.8,.06,dm,-.5,1.45,.07,g);box(.95,2.8,.06,dm,.5,1.45,.07,g);
  box(.5,.18,.04,new T3.MeshBasicMaterial({color:0x6fe0ff}),0,3.05,.07,g);
  root.add(g);
}
// vägg med riktiga fönsterhål och genomskinligt glas (man ser staden bakom)
let glassMat=null;
function holeWall(axis,c0,len,fixed,y,H,wins,ww,door){
  const lo=1.2,hi=3.8,ym=(lo+hi)/2;
  glassMat=glassMat||new T3.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.16,roughness:.05,metalness:.1,depthWrite:false});
  const raw=(a0,a1,y0,y1)=>{if(a1-a0<.01||y1-y0<.01)return;const l=a1-a0,m=(a0+a1)/2,yc=y+(y0+y1)/2,h=y1-y0;
    if(axis==='x')box(l,h,.3,wall,m,yc,fixed,root);else box(.3,h,l,wall,fixed,yc,m,root);};
  const seg=(a0,a1,y0,y1)=>{
    if(!door||y0>=door.h||a1<=door.c-door.w/2||a0>=door.c+door.w/2)return raw(a0,a1,y0,y1);
    const dl=door.c-door.w/2,dr=door.c+door.w/2;
    if(a0<dl)raw(a0,dl,y0,y1);if(a1>dr)raw(dr,a1,y0,y1);
    if(y1>door.h)raw(Math.max(a0,dl),Math.min(a1,dr),Math.max(y0,door.h),y1); // väggen ovanför dörren
  };
  const a0=c0-len/2,a1=c0+len/2;
  seg(a0,a1,0,lo);seg(a0,a1,hi,H);
  let pos=a0;[...wins].sort((a,b)=>a-b).forEach(c=>{seg(pos,c-ww/2,lo,hi);pos=c+ww/2;});seg(pos,a1,lo,hi);
  wins.forEach(c=>{
    const g=new T3.Mesh(new T3.BoxGeometry(axis==='x'?ww:.04,hi-lo,axis==='x'?.04:ww),glassMat);
    if(axis==='x')g.position.set(c,y+ym,fixed);else g.position.set(fixed,y+ym,c);root.add(g);
    const f=(w,h,dc,dy)=>axis==='x'?box(w,h,.36,winM||white,c+dc,y+dy,fixed,root):box(.36,h,w,winM||white,fixed,y+dy,c+dc,root);
    f(ww+.2,.1,0,lo);f(ww+.2,.1,0,hi);f(.1,hi-lo,-ww/2,ym);f(.1,hi-lo,ww/2,ym);f(.06,hi-lo,0,ym);
  });
}
function buildLevel(n,kind,lift){
  const y=n*FH,H=WH;
  slab(y,kind);
  box(BW,.18,.05,trim,0,y+.09,Z0+.03,root);box(.05,.18,BD,trim,-BW/2+.03,y+.09,ZC,root);
  const nw=Math.max(2,Math.floor((BW-3)/4.6)),wx=[];
  for(let i=0;i<nw;i++)wx.push(-BW/2+2.6+i*((BW-7.9)/(nw-1))); // slutar före hissen
  holeWall('x',0,BW,Z0-.15,y,H,wx,3.6);
  if(n===1)holeWall('z',ZC,BD,-BW/2-.15,y,WH,[-3.9],2.4,{c:-.3,w:1.3,h:2.5});else holeWall('z',ZC,BD,-BW/2-.15,y,WH,[-3.9,-.3],2.4);
  glass(BD,WH-.3,BW/2,y+WH/2,ZC,Math.PI/2);glass(BW,WH-.3,0,y+WH/2,Z1,0); // fram- och sidoglas i samma stil
  if(lift)elevator(BW/2-2.3,y);
  [[-BW/2+.1,Z1-.1],[BW/2-.1,Z1-.1],[BW/2-.1,Z0+.2]].forEach(([x,z])=>box(.45,WH,.45,frameM,x,y+WH/2,z,root));
  if(TIERK==='loft'){box(BW+.7,.3,.32,frameM,0,y-.2,Z1+.2,root);[-3,0,3].forEach(x=>box(.25,.3,BD,M(0xd8b27c),x,y+WH-.15,ZC,root));} // svart stålbalk + furubjälkar
  if(STY.gold)box(BW+.72,.08,.08,goldM,0,y-.05,Z1+.32,root); // guldlist längs bjälklaget
  const L=new T3.PointLight(0xffbd80,.5,26,1);L.position.set(0,y+3.8,ZC);root.add(L);lights.push(L);
}
function tree(x,z,s=1){if(VAR){const r=rnd(x*7.1+z*3.3+VAR*13);if(r<.2)return;x+=(rnd(x+VAR)-.5)*3;z+=(rnd(z+VAR*2)-.5)*2;s*=.75+rnd(x*z+VAR)*.7;}const g=new T3.Group();g.position.set(x,-.7,z);g.scale.setScalar(s);cyl(.18,.25,2,M(0x6b4a2b),0,1,0,g,8);
  const LC=LEAFC[VAR%LEAFC.length];sph(1.3,M(LC[0]),0,2.8,0,g);sph(1,M(LC[1]),.6,3.4,.2,g);sph(.9,M(LC[2]),-.6,3.2,-.3,g);root.add(g);}
function pine(x,z,s=1){if(VAR){if(rnd(x*5.3+z*2.1+VAR*7)<.2)return;x+=(rnd(x+VAR)-.5)*2;s*=.8+rnd(z+VAR)*.5;}const g=new T3.Group();g.position.set(x,-.7,z);g.scale.setScalar(s);
  const tr=cyl(.14,.24,2.4,M(0x5a3d27),0,1.2,0,g,8);tr.rotation.z=.18;
  [[.45,2.1,0,1.3],[-.6,2.7,.2,1.05],[.35,3.3,-.2,.85],[-.05,3.85,0,.6]].forEach(([dx,y,dz,r],i)=>sph(r,M(i%2?0x2d5a32:0x356b3a),dx,y,dz,g,1,.3,1));root.add(g);}
function bike(x,z,col){
  const g=new T3.Group();g.position.set(x,-.62,z);g.rotation.y=Math.PI/2;const fm=M(col,{metalness:.4,roughness:.4});
  for(const sx of[-.5,.5]){const w=new T3.Mesh(new T3.TorusGeometry(.32,.03,8,24),dark);w.position.set(sx,.34,0);g.add(w);}
  const bar=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,c=cyl(.025,.025,Math.hypot(dx,dy),fm,(x1+x2)/2,(y1+y2)/2,0,g,6);c.rotation.z=-Math.atan2(dx,dy);};
  bar(-.5,.34,-.05,.42);bar(-.05,.42,-.15,.85);bar(-.15,.85,.38,.8);bar(-.05,.42,.38,.8);bar(.38,.8,.5,.34);bar(-.5,.34,-.15,.85);
  box(.22,.05,.1,dark,-.15,.88,0,g);box(.06,.05,.4,dark,.38,.95,0,g);root.add(g);
}
function laptop(parent,x,y,z,type){
  const g=new T3.Group();g.position.set(x,y,z);g.rotation.y=Math.PI;box(.42,.02,.3,M(0x9aa0ab,{metalness:.6}),0,.01,0,g);
  const sc=makeScreen(type),sm=new T3.Mesh(new T3.PlaneGeometry(.4,.26),new T3.MeshBasicMaterial({map:sc.tex}));sm.position.set(0,.15,-.14);sm.rotation.x=-.2;g.add(sm);
  box(.42,.28,.01,M(0x9aa0ab,{metalness:.6}),0,.15,-.147,g).rotation.x=-.2;parent.add(g);
}
function deskLamp(parent,x,y,z){cyl(.08,.08,.03,dark,x,y+.015,z,parent,10);cyl(.015,.015,.4,dark,x,y+.2,z,parent,6);const sh=cyl(.03,.11,.12,M(0xf2c14e),x,y+.42,z+.06,parent,12);sh.rotation.x=.6;}
function statsTV(x,y,z,w,h,fm){const sc=makeScreen('stats');const frame=box(w+.15,h+.15,.08,fm||dark,x,y,z,root);const tv=new T3.Mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:sc.tex}));tv.position.set(x,y,z+.05);tv.userData.statsScreen=true;frame.userData.statsScreen=true;root.add(tv);screenHits.push(tv,frame);}
function lamp(x,z){const g=new T3.Group();g.position.set(x,-.7,z);cyl(.06,.08,4,dark,0,2,0,g,8);box(.5,.1,.2,dark,.2,4,0,g);box(.3,.05,.15,new T3.MeshBasicMaterial({color:0xfff3c8}),.25,3.94,0,g);root.add(g);}
/* ---------- stadsbilden bakom kontoret ---------- */
function cityBuilding(o){
  const S=CITY_STYLES[o.style]||CITY_STYLES[0];
  const w=Math.max(4,o.w),d=Math.max(4,o.d),h=Math.max(7,o.h),plinth=1.5,towerH=Math.max(4,h-plinth);
  const face=cityFaces[o.style]||cityFaces[0];
  const t=face.t.clone(),tz=face.t.clone();
  t.repeat.set(Math.max(.6,w/12),Math.max(.6,towerH/24));
  tz.repeat.set(Math.max(.6,d/12),Math.max(.6,towerH/24));
  t.offset.set(rnd(o.seed)*.7,rnd(o.seed*3)*.7);tz.offset.set(rnd(o.seed*5)*.7,rnd(o.seed*7)*.7);
  t.needsUpdate=tz.needsUpdate=true;cityTex.push(t,tz);
  const mk=(map,rough,metal)=>new T3.MeshStandardMaterial({map,roughness:rough,metalness:metal,emissive:0xffffff,emissiveMap:map,emissiveIntensity:0});
  const fm=mk(t,S.glass?.24:.78,S.glass?.42:.06),sm=mk(tz,S.glass?.24:.78,S.glass?.42:.06);
  cityMats.push(fm,sm);
  const cb=(w2,h2,d2,mat,x2,y2,z2)=>{const m=box(w2,h2,d2,mat,x2,y2,z2,root);m.castShadow=m.receiveShadow=false;return m;};
  const plinthM=M(S.k==='brick'?0x8a5a44:S.k==='stone'?0xb3a78d:0x808878,{roughness:.92});
  const trim=M(S.glass?0x7f8674:S.k==='brick'?0x7b4a34:0x9d917b,{roughness:.72,metalness:.12});
  const roofM=M(S.glass?0x717867:S.k==='brick'?0x6d4534:0x8d8674,{roughness:.8});
  // sockel + torn med fönsterfasad
  cb(w+.9,plinth,d+.9,plinthM,o.x,-.7+plinth/2,o.z);
  cb(w,towerH,d,[sm,sm,roofM,roofM,fm,fm],o.x,-.7+plinth+towerH/2,o.z);
  const top=-.7+h;
  cb(w+.5,.3,d+.5,trim,o.x,top+.15,o.z);
  if(!o.far){
    // taklist, takräcke, hörnpelare och våningsband ger närbilden riktig fasadrytm
    cb(w,.44,.16,trim,o.x,top+.5,o.z+d/2-.08);cb(w,.44,.16,trim,o.x,top+.5,o.z-d/2+.08);
    cb(.16,.44,d,trim,o.x-w/2+.08,top+.5,o.z);cb(.16,.44,d,trim,o.x+w/2-.08,top+.5,o.z);
    for(const sx of[-1,1])for(const sz of[-1,1])cb(.22,towerH,.22,trim,o.x+sx*(w/2-.11),-.7+plinth+towerH/2,o.z+sz*(d/2-.11));
    if(h>20)[.34,.67].forEach(f=>cb(w+.3,.14,d+.3,trim,o.x,-.7+plinth+towerH*f,o.z));
    // riktiga spröjsar framför glaset bryter upp fasaden även på långt håll
    const cols=Math.max(2,Math.round(w/3.2));
    for(let i=0;i<=cols;i++)cb(.055,towerH,.07,trim,o.x-w/2+i*w/cols,-.7+plinth+towerH/2,o.z+d/2+.035);
  }
  // takpaviljong, hissmaskin och antenn
  const mw=w*(.24+.08*rnd(o.seed)),md=d*.28,mh=1.1+rnd(o.seed*3)*1.5;
  cb(mw,mh,md,trim,o.x,top+.3+mh/2,o.z);
  if(S.glass||h>27){
    const ax=o.x+w*.18,az=o.z-d*.12;
    const ant=cyl(.045,.075,4+rnd(o.seed*5)*5,metal,ax,top+2.4,az,root,6);ant.castShadow=false;
    const bm=new T3.MeshBasicMaterial({color:0xff4d5e,transparent:true,opacity:.9});
    const beacon=new T3.Mesh(new T3.SphereGeometry(.11,8,6),bm);beacon.position.set(ax,ant.position.y+ant.geometry.parameters.height/2,az);root.add(beacon);cityBeacons.push(bm);
  }
  if(!o.far&&!S.glass&&h>16){
    const wx=o.x+w*.18,wz=o.z-d*.1,wh=1.3+rnd(o.seed*7)*.7;
    for(const sx of[-.55,.55])cyl(.05,.05,.9,metal,wx+sx,top+.75,wz,root,6).castShadow=false;
    const tank=cyl(.78,.72,wh,M(0x5c4432,{roughness:.9}),wx,top+1.2+wh/2,wz,root,12);tank.castShadow=false;
    cyl(.06,.78,.28,M(0x3b2b20),wx,top+1.2+wh+.14,wz,root,12);
  }
  if(!o.far){
    // bottenvåning: glasad entré, skylt och entrétak
    const ew=Math.min(4.4,w*.55);
    cb(ew,1.25,.08,new T3.MeshStandardMaterial({color:0x0d1a22,emissive:0x1d3740,emissiveIntensity:.32,roughness:.18}),o.x,.35,o.z+d/2+.03);
    cb(ew+.7,.12,.9,trim,o.x,1.14,o.z+d/2+.38);
    cb(ew+.25,.2,.06,new T3.MeshBasicMaterial({color:0xffd9a0}),o.x,1.58,o.z+d/2+.46);
    if(S.k==='brick'){cb(ew+.4,.07,.65,M(0x8a3b3b),o.x,1.92,o.z+d/2+.3);cb(ew+.4,.07,.65,M(0xd8c9a8),o.x,1.7,o.z+d/2+.3);}
  }
}
function cityLayout(){
  const out=[],K=VAR%4,HS=[1,.5,1.45,.85][K],R=n=>rnd(n+VAR*31.7);   // K: 0 original, 1 lågt villaområde, 2 tät storstad, 3 blandad kvartersstad
  // närzonen: låg- och mellanhöga hus som ramar in kontoret
  for(let i=0;i<6;i++){
    out.push({x:-19-i*8.8-R(i*3)*2,z:-12-R(i*5)*8,w:6+R(i*2)*4,d:6+R(i*4)*4,h:(10+R(i*7)*16)*HS,style:(i+1+VAR)%4,seed:i*9+2});
    out.push({x:19+i*8.8+R(i*4)*2,z:-12-R(i*6)*8,w:6+R(i*5)*4,d:6+R(i*8)*4,h:(10+R(i*11)*16)*HS,style:(i+VAR)%4,seed:i*7+5});
  }
  // den täta stadssilhuetten längre bak
  for(let i=0;i<26;i++){
    if(K===1&&i%2)continue;
    out.push({x:-78+i*6.2+R(i*2)*2,z:-33-R(i*3)*17,w:4.5+R(i*5)*5.5,d:4.5+R(i*7)*5,h:(12+R(i*13)*30)*HS,style:(i+VAR)%4,seed:i*13+1,far:true});
  }
  // två landmärken som sticker upp över resten
  const lm=VAR%3-1;
  out.push({x:-44+lm*7,z:-27,w:11,d:9,h:43*HS,style:VAR%4,seed:101});
  out.push({x:40-lm*6,z:-29,w:10,d:8,h:37*HS,style:(3+VAR)%4,seed:102});
  return out;
}
function outside(){
  box(BW+1.2,.7,BD+1.2,M(0xb9b3a8),0,-.35,ZC,root);
  groundMat=M(GROUNDC[VAR%GROUNDC.length],{roughness:1,map:lawnTex()});const ground=new T3.Mesh(new T3.PlaneGeometry(260,260),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.7;ground.receiveShadow=true;root.add(ground);
  box(BW+30,.15,3.2,M(0xd2c5a6),0,-.62,3.6,root);
  box(150,.1,5,M(0x6b6559),0,-.66,9.2,root);
  for(let i=-9;i<=9;i++)box(1.6,.02,.18,M(0xfbf2dc),i*5,-.6,9.2,root);
  box(2.6,.15,2.4,M(0xcabf9f),0,-.6,2.4,root);
  const e=BW/2;loadGrassKit();placeGrass(e);
  if(STY.gold){ // granittorg, spegeldammar och formklippta japanska tallar
    box(BW+18,.06,BD+12,M(0xa79c84,{roughness:.6}),0,-.64,ZC+1,root);
    const water=M(0x4f8fa0,{metalness:.6,roughness:.05});
    for(const sx of[-1,1]){box(6.2,.1,3.4,M(0x9a9282),sx*(e+4.5+AW),-.6,ZC+1.5,root);box(5.8,.12,3,water,sx*(e+4.5+AW),-.57,ZC+1.5,root);
      box(4.2,.1,1.6,M(0x9a9282),sx*(e/2+1.5),-.6,Z1+1.4,root);box(3.9,.12,1.3,water,sx*(e/2+1.5),-.57,Z1+1.4,root);}
    [[-e-2-AW,-1],[e+2+AW,-1.5],[-e-4-AW,-6],[e+4+AW,-6.5],[-e-8-AW,4],[e+8+AW,4]].forEach(([x,z],i)=>pine(x,z,.9+rnd(i)*.3));
    [[-e-12,-10],[e+12,-11],[8,-17],[-6,-19]].forEach(([x,z],i)=>tree(x,z,1+rnd(i)*.4));
  }else[[-e-3-AW,4.4],[e+AW+6,3],[-e-7-AW,-2],[e+7+AW,-3],[-e-5-AW,-10],[e+6+AW,-11],[8,-17],[-6,-19]].forEach(([x,z],i)=>tree(x,z,.9+rnd(i)*.5));
  if(VAR)for(let i=0;i<1+VAR%4;i++){const sx=i%2?1:-1;tree(sx*(BW/2+AW+7+rnd(i*5+VAR)*15),3.5-rnd(i*3+VAR)*2,.9+rnd(i+VAR)*.5);}
  if(TIERK==='loft'){ // cykelställ med pendlingscyklar
    for(let i=0;i<4;i++)box(.05,.6,.05,metal,-4.2+i*.9,-.35,Z1+1.5,root);box(2.8,.05,.05,metal,-2.85,-.07,Z1+1.5,root);
    const BC=[0x2f6fe0,0xd62b3a,0x3fa56b,0xf2b632,0x8a56d6,0x1fb5c2],nb=VAR?1+VAR%4:3;for(let i=0;i<nb;i++)bike(-3.8+i*.9,Z1+1.6,BC[(i+VAR)%BC.length]);
  }
  if(TIERK==='kontor'){ // häckar och belysningspollare
    for(const sx of[-1,1]){box(e-2.5,.7,.7,M(0x11410b,{roughness:.9}),sx*(e/2+1.6),-.3,Z1+1.6,root);
      for(let i=0;i<3;i++){const bx=sx*(2.2+i*2.6);cyl(.09,.09,.8,dark,bx,-.3,Z1+2.3,root,8);cyl(.1,.1,.08,new T3.MeshBasicMaterial({color:0xfff3c8}),bx,.14,Z1+2.3,root,8);}}
  }
  [-e+1,e-1,-e-AW-1.5,e+AW+1.5].forEach(x=>lamp(x,5.2));
  for(const i of[-1,1])box(2.4,.4,.8,M(0x17400d),i*Math.min(5.5,e-3),-.5,Z1+1,root);
  // stad: asfalt, trottoar, körfält och en riktig stadsbild bakom kontoret
  const road=box(200,.06,64,M(0x5f5a4e,{roughness:.98}),0,-.685,-40,root);road.castShadow=road.receiveShadow=false;
  const walk=box(200,.08,2.2,M(0xdbd0b4,{roughness:.95}),0,-.64,-8.4,root);walk.castShadow=walk.receiveShadow=false;
  for(let i=-9;i<=9;i++){const dash=box(2.6,.02,.12,M(0xfaf0d8),i*4.4,-.62,-10.8,root);dash.castShadow=dash.receiveShadow=false;}
  for(let x=-42;x<=42;x+=14)lamp(x,-8.6);
  cityLayout().forEach(cityBuilding);
  // två körfält: färre fordon, men taxibilar och motorcyklar blandas in
  [[8.0,1],[10.4,-1]].forEach(([z,lane],i)=>{
    const seed=i===0?['taxi','sedan','sport']:['taxi','moto','small'];
    let x=-60+Math.random()*5;
    for(let k=0;k<(VAR?2+VAR%3:3);k++){const c=spawnCar(lane,z,x,seed[k%3]);cars.push(c);x+=c.len+26+Math.random()*22;}
  });
  // en egen cykelbana närmast byggnaden, med tre cyklister som passerar
  let bx=-58+Math.random()*5;
  for(let k=0;k<(VAR?1+VAR%4:3);k++){const b=spawnBike(1,6.95,bx);bikes.push(b);bx+=b.len+30+Math.random()*18;}
}

/* ---------- tillbyggnader: WC (vänster, helt tät, dörren sitter inne i kontoret) och stort inglasat kök (höger) ---------- */
const AWL=3.8,AWR=6.4,AW=AWR;
let kit=null;
function annexes(){
  const e=BW/2,H=FH-.2,side=M(STY.slab,{metalness:STY.gold?.5:.05,roughness:.5}),roofM=M(STY.roof),cap=STY.gold?goldM:M(0x3a4150);
  for(const sg of[-1,1]){
    const w=sg<0?AWL:AWR,cx=sg*(e+w/2);
    box(w+.6,.7,BD+1.2,M(0xb9b3a8),cx+sg*.15,-.35,ZC,root);
    box(w+.5,.4,BD+.6,side,cx,-.2,ZC,root);
    box(w+.7,.4,BD+.9,roofM,cx,FH-.2,ZC,root); // taket = balkonggolv i våning 2:s nivå
  }
  /* WC: helt tät, inga dörrar utåt (man går in från kontoret) */
  {
    const w=AWL,cx=-(e+w/2);
    box(w,H,.3,wall,cx,H/2,Z1,root);box(w,H,.3,wall,cx,H/2,Z0,root);box(.3,H,BD,wall,cx-w/2,H/2,ZC,root);
    for(const [x,z] of [[cx-w/2+.1,Z1-.1],[cx-w/2+.1,Z0+.1]])box(.4,H,.4,frameM,x,H/2,z,root);
    box(w,.18,.05,trim,cx,.09,Z1+.17,root);
    for(const dx of[-.9,.9])box(.75,.75,.05,M(0xdbe8ef,{roughness:.95}),cx+dx,3.4,Z1+.18,root); // frostade rutor, ogenomskinliga
  }
  /* Kök */
  {
    const w=AWR,cx=e+w/2,gx=e+w,bz=Z0+.6,cab=M(0xefece4),silver=M(0xdfe3e8,{metalness:.5,roughness:.35});
    glass(w,H-.1,cx,H/2,Z1,0);glass(BD,H-.1,gx,H/2,ZC,Math.PI/2);glass(w,H-.1,cx,H/2,Z0,0);
    for(const [x,z] of [[gx-.1,Z1-.1],[gx-.1,Z0+.1]])box(.4,H,.4,frameM,x,H/2,z,root);
    for(let i=1;i<3;i++)box(.12,H,.12,frameM,e+i*w/3,H/2,Z1-.02,root);
    box(w,.12,.12,frameM,cx,H,Z1-.05,root);box(w,.12,.12,frameM,cx,H,Z0+.05,root);box(.12,.12,BD,frameM,gx-.05,H,ZC,root);
    // dörröppning i husets glasvägg, vid z=-2.1
    box(.14,2.5,.14,frameM,e,1.25,-2.7,root);box(.14,2.5,.14,frameM,e,1.25,-1.5,root);box(.14,.14,1.34,frameM,e,2.5,-2.1,root);
    box(w,.02,BD,M(0xe9e4d8,{roughness:.85}),cx,.01,ZC,root);
    // bänk längs bakväggen: diskho, kaffemaskin, mikro
    const cl=4.4,ccx=e+.3+cl/2;
    box(cl,.95,.7,cab,ccx,.475,bz,root);box(cl+.06,.06,.78,M(0x5d5a56),ccx,.98,bz,root);
    box(cl,.8,.4,M(0xd9d4c8),ccx,2.35,Z0+.35,root);
    box(.8,.05,.5,metal,e+1.0,1.0,bz,root);cyl(.025,.025,.32,metal,e+1.0,1.17,bz-.2,root,8);box(.14,.04,.14,metal,e+1.0,1.34,bz-.12,root);
    for(let i=0;i<3;i++)cyl(.14,.14,.02,white,e+1.55+i*.04,1.03+i*.025,bz+.12,root,14); // disk som står och rinner av
    box(.45,.5,.4,dark,e+2.3,1.26,bz,root);box(.1,.1,.1,M(0xff5a3c),e+2.3,1.56,bz+.22,root);
    const mmat=new T3.MeshBasicMaterial({color:0x1a1a1a});
    box(.64,.38,.44,M(0xe8e8ea,{metalness:.4}),e+3.5,1.19,bz+.05,root);
    {const gl=new T3.Mesh(new T3.PlaneGeometry(.38,.24),mmat);gl.position.set(e+3.42,1.19,bz+.275);root.add(gl);}
    box(.12,.24,.02,M(0x3a3d44),e+3.7,1.19,bz+.275,root);
    // kylskåp med dörr som öppnas
    const fx=e+5.35;
    box(.95,2.1,.75,silver,fx,1.05,bz+.05,root);
    box(.85,1.96,.02,new T3.MeshBasicMaterial({color:0xeef6ff}),fx,1.05,bz+.05+.375-.005,root);
    const dg=new T3.Group();dg.position.set(fx-.475,1.05,bz+.05+.375+.03);root.add(dg);
    box(.93,2.06,.06,silver,.465,0,0,dg);box(.04,.5,.05,metal,.85,.25,.06,dg);
    // matbord med sex stolar
    const tx=e+3.7,tz=-.9;
    box(2.9,.08,1.1,M(0xcdb08a),tx,.78,tz,root);
    for(const [dx,dz] of [[-1.3,-.45],[1.3,-.45],[-1.3,.45],[1.3,.45]])cyl(.05,.05,.76,metal,tx+dx,.38,tz+dz,root,8);
    const seats=[];
    [-.85,0,.85].forEach(dx=>{
      chair(root,tx+dx,-1.95,0);seats.push({x:tx+dx,z:-1.95,ry:0,t:false});
      chair(root,tx+dx,.15,Math.PI);seats.push({x:tx+dx,z:.15,ry:Math.PI,t:false});
    });
    // fruktskål och mugg på bordet
    cyl(.18,.12,.1,M(0xd8c3a0),tx,.87,tz,root,14);sph(.07,M(0xd62b3a),tx-.05,.95,tz,root);sph(.07,M(0xffc94a),tx+.06,.95,tz+.03,root);
    plant(gx-.6,0,.5,1);plant(e+.6,0,.5,.9);
    [e+1.4,e+3.2,e+5.0].forEach((x,i)=>pendant(x,WH-.1,i%2?-.2:-2.4));
    const L=new T3.PointLight(0xffbd80,.55,14,1);L.position.set(cx,3.6,ZC);root.add(L);lights.push(L);
    kit={door:[e+.5,-2.1],inn:[e+1.7,-2.1],sink:[e+1.0,-3.8],coffee:[e+2.3,-3.8],micro:[e+3.5,-3.8],fridge:[fx,-3.8],seats,fd:{g:dg,k:0,t:0},mm:mmat,users:0};
  }
  /* Balkong ovanpå köket (våning 2:s nivå): trädäck, halvhög tät mur med glas ovanför, dörr från kontoret, utemöbler */
  {
    const w=AWR,gx=e+w,y0=FH,wood=M(0xb08a5a,{roughness:.8}),gm=new T3.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.2,roughness:.05,depthWrite:false});
    const xr=gx+.25,zf=Z1+.45,zb=Z0-.15;
    box(xr-e+.1,.05,zf-zb+.1,wood,(e+xr)/2,y0+.025,(zb+zf)/2,root);
    const rail=(x0,z0,x1,z1)=>{
      const alongX=Math.abs(x1-x0)>Math.abs(z1-z0),L=Math.hypot(x1-x0,z1-z0),mx=(x0+x1)/2,mz=(z0+z1)/2;
      if(alongX){box(L,.5,.12,wall,mx,y0+.3,mz,root);const g=new T3.Mesh(new T3.BoxGeometry(L,.62,.03),gm);g.position.set(mx,y0+.86,mz);root.add(g);box(L+.1,.06,.12,metal,mx,y0+1.17,mz,root);}
      else{box(.12,.5,L,wall,mx,y0+.3,mz,root);const g=new T3.Mesh(new T3.BoxGeometry(.03,.62,L),gm);g.position.set(mx,y0+.86,mz);root.add(g);box(.12,.06,L+.1,metal,mx,y0+1.17,mz,root);}
      const n=Math.max(1,Math.round(L/1.5));
      for(let i=0;i<=n;i++){const t=i/n;cyl(.04,.04,1.15,metal,x0+(x1-x0)*t,y0+.6,z0+(z1-z0)*t,root,8);}
    };
    rail(e,zf,xr,zf);rail(xr,zf,xr,zb);rail(xr,zb,e,zb);
    // dörr från kontoret ut på balkongen, vid z=-2.1
    box(.14,2.5,.14,frameM,e,y0+1.25,-2.7,root);box(.14,2.5,.14,frameM,e,y0+1.25,-1.5,root);box(.14,.14,1.34,frameM,e,y0+2.5,-2.1,root);
    // möbler: runt bord med två stolar, parasoll, bänk längs baksidan, växter
    const tx=e+3.0,tz=-2.6;
    cyl(.5,.5,.05,metal,tx,y0+.76,tz,root,18);cyl(.05,.05,.74,metal,tx,y0+.38,tz,root,8);
    chair(root,tx-.9,tz,Math.PI/2,y0);chair(root,tx+.9,tz,-Math.PI/2,y0);
    cyl(.035,.035,2.3,metal,tx,y0+1.15,tz,root,8);cyl(.02,1.35,.32,M(0xe8d6c0),tx,y0+2.38,tz,root,16);
    box(2.6,.4,.7,wood,e+4.3,y0+.25,Z0+.35,root);box(2.5,.14,.6,M(0x5b7c99),e+4.3,y0+.52,Z0+.35,root);box(2.6,.7,.12,wood,e+4.3,y0+.7,Z0+.04,root);
    plant(e+.5,y0,zf-.4,1);plant(xr-.5,y0,zf-.4,1.1);plant(xr-.5,y0,zb+.6,.9);
    const L2=new T3.PointLight(0xffe2b0,.45,10,1);L2.position.set(e+3,y0+2.4,-2.2);root.add(L2);lights.push(L2);
  }
  /* Balkong ovanpå WC (vänster): soffgrupp med soffbord där man kan sitta och prata */
  {
    const w=AWL,xl=-(e+w)-.25,zf=Z1+.45,zb=Z0-.15,y0=FH,wood=M(0xb08a5a,{roughness:.8}),gm=new T3.MeshStandardMaterial({color:0xcfe8ff,transparent:true,opacity:.2,roughness:.05,depthWrite:false});
    const mx0=(xl-e)/2;
    box(w+.35,.05,zf-zb+.1,wood,mx0,y0+.025,(zb+zf)/2,root);
    const rail=(x0,z0,x1,z1)=>{
      const alongX=Math.abs(x1-x0)>Math.abs(z1-z0),L=Math.hypot(x1-x0,z1-z0),mx=(x0+x1)/2,mz=(z0+z1)/2;
      if(alongX){box(L,.5,.12,wall,mx,y0+.3,mz,root);const g=new T3.Mesh(new T3.BoxGeometry(L,.62,.03),gm);g.position.set(mx,y0+.86,mz);root.add(g);box(L+.1,.06,.12,metal,mx,y0+1.17,mz,root);}
      else{box(.12,.5,L,wall,mx,y0+.3,mz,root);const g=new T3.Mesh(new T3.BoxGeometry(.03,.62,L),gm);g.position.set(mx,y0+.86,mz);root.add(g);box(.12,.06,L+.1,metal,mx,y0+1.17,mz,root);}
      const n=Math.max(1,Math.round(L/1.5));
      for(let i=0;i<=n;i++){const t=i/n;cyl(.04,.04,1.15,metal,x0+(x1-x0)*t,y0+.6,z0+(z1-z0)*t,root,8);}
    };
    rail(-e,zf,xl,zf);rail(xl,zf,xl,zb);rail(xl,zb,-e,zb);
    // glasdörr ut på balkongen (i fönstret vid z=-0,3)
    {
      const dx=-e-.15;
      box(.34,2.55,.12,frameM,dx,y0+1.275,-.95,root);box(.34,2.55,.12,frameM,dx,y0+1.275,.35,root);box(.34,.12,1.42,frameM,dx,y0+2.55,-.3,root);
      box(.5,.03,1.3,M(0x3a3d44),dx-.05,y0+.045,-.3,root); // tröskel/dörrmatta
      const leaf=new T3.Group();leaf.position.set(dx,y0,.33);leaf.rotation.y=1.3;root.add(leaf);
      box(.05,2.4,.08,frameM,0,1.2,0,leaf);box(.05,2.4,.08,frameM,0,1.2,-1.2,leaf);box(.05,.08,1.2,frameM,0,2.38,-.6,leaf);box(.05,.08,1.2,frameM,0,.04,-.6,leaf);
      const pane=new T3.Mesh(new T3.BoxGeometry(.03,2.3,1.12),gm);pane.position.set(0,1.2,-.6);leaf.add(pane);
      box(.08,.2,.04,metal,0,1.1,-1.05,leaf);
    }
    // soffgrupp: soffa mot baksidan, soffbord i mitten, två fåtöljer mitt emot varandra, matta
    const cx=-(e+w/2),tz=-2.4;
    box(2.9,.02,3.2,M(0xb55a4a),cx,y0+.06,tz-.1,root);
    sofa(cx,y0,Z0+.75,0,0x5b7c99);
    box(.5,.3,.18,M(0xe8d6c0),cx-.7,y0+.62,Z0+.55,root);box(.5,.3,.18,M(0xd8b27c),cx+.7,y0+.62,Z0+.55,root);
    box(1.3,.06,.8,M(0xcdb08a),cx,y0+.46,tz,root);box(1.2,.4,.7,M(0x8a6a52),cx,y0+.22,tz,root);
    cyl(.1,.08,.1,white,cx-.3,y0+.54,tz,root,12);cyl(.12,.12,.04,M(0xd8c3a0),cx+.3,y0+.51,tz+.05,root,14);
    armchair(xl+.75,y0,tz,Math.PI/2,0x7b5d49);armchair(-e-.75,y0,tz,-Math.PI/2,0x7b5d49);
    plant(-e-.45,y0,zf-.4,1);plant(xl+.45,y0,zf-.4,1.1);plant(xl+.45,y0,zb+.5,.9);
    // golvlampa
    cyl(.03,.03,1.5,metal,xl+.5,y0+.75,Z0+.9,root,8);sph(.2,new T3.MeshBasicMaterial({color:0xfff0c8}),xl+.5,y0+1.6,Z0+.9,root);
    const L3=new T3.PointLight(0xffe2b0,.45,10,1);L3.position.set(cx,y0+2.4,tz);root.add(L3);lights.push(L3);
  }
}
const CAR_COLORS=[0xd62b3a,0x2f6fe0,0xf2efe5,0x22252e,0xffc94a,0x3fa56b,0x9aa0ab,0xff7a1a,0x6a3fc9,0x0f6b6b,0xb8b8bd,0x8a1c2b];
const CAR_TYPES=['sedan','small','jeep','van','sport','taxi','moto'],CAR_SPEED={sport:12,van:6,jeep:8,small:7.5,sedan:9,taxi:8.5,moto:13};
const pickR=a=>a[Math.floor(Math.random()*a.length)];
let TAXI_TEX=null;
function taxiTex(){
  if(TAXI_TEX)return TAXI_TEX;
  const c=cv(128,48),g=c.getContext('2d');g.fillStyle='#121318';g.fillRect(0,0,128,48);
  g.fillStyle='#ffd34d';g.font='bold 30px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('TAXI',64,25);
  TAXI_TEX=new T3.CanvasTexture(c);TAXI_TEX.encoding=T3.sRGBEncoding;return TAXI_TEX;
}
function spawnCar(lane,z,s,forced){
  const type=forced||pickR(CAR_TYPES),c=type==='moto'?makeMoto(pickR(CAR_COLORS),lane):makeCar(type,pickR(CAR_COLORS),lane);
  const v0=CAR_SPEED[type]*(.8+Math.random()*.45);
  c.g.position.set(s*lane,-.62,z);root.add(c.g);
  return {...c,dir:lane,z,v0,cur:v0,type};
}
let BEAM_GEO=null,CONE_GEO=null,coneMat=null;
/* Bilmodeller: "Generic passenger car pack" av Comrade1280 (CC BY 4.0). Filen har tio bilar uppradade i en cirkel med
   inbakade positioner, så varje bil tas ut för sig (kaross, glas, lyktor, fyra hjul) och vrids så att fronten pekar mot +x. */
const CAR_GLB={sedan:'Sedan',small:'Compact',jeep:'Offroad',van:'minivan',sport:'Sport',taxi:'Wagon'};
let CARPACK=null,carPackTried=false;
function loadCarPack(){
  if(carPackTried||!T3.GLTFLoader)return;carPackTried=true;
  new T3.GLTFLoader().load('models/cars.glb',gl=>{
    try{CARPACK=buildCarTemplates(gl.scene);}catch(e){console.warn('bilpaket',e);return;}
    if(!root)return;   // byt ut redan körande bilar mot de nya modellerna
    cars.forEach((o,i)=>{if(o.type==='moto')return;const n=spawnCar(o.dir,o.z,0,o.type);n.g.position.x=o.g.position.x;n.cur=o.cur;n.v0=o.v0;root.remove(o.g);cars[i]=n;});
  },undefined,()=>{});
}
function buildCarTemplates(scene){
  scene.updateMatrixWorld(true);
  const meshes=[];scene.traverse(o=>{if(o.isMesh){o.userData.c=new T3.Box3().setFromObject(o).getCenter(new T3.Vector3());meshes.push(o);}});
  const wheels=meshes.filter(o=>/^Wheel/i.test(o.parent.name)),out={};
  meshes.filter(o=>/Body_0$/.test(o.name)&&!/Glass|Optics/.test(o.name)).forEach(b=>{
    const key=b.parent.name.replace(/_?body$/i,'').toLowerCase();
    const ws=wheels.map(w=>({w,d:w.userData.c.distanceTo(b.userData.c)})).sort((a,c)=>a.d-c.d).slice(0,4).map(x=>x.w);
    const cs=ws.map(w=>w.userData.c),cen=cs.reduce((a,c)=>a.add(c),new T3.Vector3()).multiplyScalar(.25);
    // paketets bilar står radiellt i en cirkel och alla har fronten mot cirkelns mitt: framåt = rakt mot mitten
    const yaw=Math.atan2(-cen.z,-cen.x);
    const g=new T3.Group(),inner=new T3.Group();g.add(inner);inner.position.set(-cen.x,0,-cen.z);
    const parts=[b,...b.parent.children.filter(c=>c.isMesh&&c!==b),...ws];
    const box=new T3.Box3();
    parts.forEach(m=>{const c=new T3.Mesh(m.geometry,m.material);m.matrixWorld.decompose(c.position,c.quaternion,c.scale);c.castShadow=true;inner.add(c);});
    g.rotation.y=yaw;g.updateMatrixWorld(true);box.setFromObject(g);
    const mid=box.getCenter(new T3.Vector3()),o=new T3.Group();g.position.set(-mid.x,0,-mid.z);o.add(g);   // mitten av bilen i origo, så längd och avstånd stämmer
    out[key]={g:o,len:box.max.x-box.min.x,top:box.max.y,body:b.material};
  });
  return out;
}

function makeCar(type,col,dir){
  const g=new T3.Group(),paint=M(type==='taxi'?0xf6c343:col,{metalness:.45,roughness:.3}),gl=M(0x1d2a3a,{metalness:.6,roughness:.15});
  // [längd, karosshöjd, bredd, hjulradie, hyttlängd, hytthöjd, hyttförskjutning]
  const [L,H,Wd,R,CL,CH,CO]={sedan:[3.9,.75,1.7,.36,2.1,.66,-.25],small:[3.0,.85,1.55,.32,2.0,.75,-.1],jeep:[4.1,1.1,1.85,.46,2.9,.85,-.4],van:[5.2,1.15,1.9,.4,4.3,1.15,-.35],sport:[4.3,.5,1.8,.33,1.6,.42,-.45],taxi:[3.9,.75,1.7,.36,2.1,.66,-.25]}[type];
  const by=R+H/2-.05;
  box(L,H,Wd,paint,0,by,0,g);
  box(CL,CH,Wd*.92,paint,CO*dir,by+H/2+CH/2,0,g);
  box(CL+.04,CH*.62,Wd*.94,gl,CO*dir,by+H/2+CH*.52,0,g);
  if(type==='sport')box(.25,.08,Wd*.9,dark,-(L/2-.15)*dir,by+H/2+.3,0,g);
  if(type==='jeep'){const sp=cyl(.38,.38,.22,dark,-(L/2+.1)*dir,by+.1,0,g,14);sp.rotation.z=Math.PI/2;box(L*.6,.06,Wd*.8,metal,CO*dir,by+H/2+CH+.06,0,g);}
  if(type==='taxi'){
    const sy=by+H/2+CH+.2;
    box(.8,.22,.34,M(0x15161a),0,sy,0,g);
    const sm=new T3.MeshBasicMaterial({map:taxiTex(),transparent:true});
    for(const sz of[-1,1]){const p=new T3.Mesh(new T3.PlaneGeometry(.72,.2),sm);p.position.set(0,sy,sz*.176);if(sz<0)p.rotation.y=Math.PI;g.add(p);}
    for(const sz of[-1,1])for(let i=0;i<4;i++)box(.24,.12,.02,M(i%2?0x15161a:0xf6c343),-L/2+.8+i*.42,by+.02,sz*(Wd/2+.012),g);
  }
  for(const sx of[-1,1])for(const sz of[-1,1]){const wh=cyl(R,R,.26,dark,sx*(L/2-.75),R,sz*(Wd/2-.05),g,16);wh.rotation.x=Math.PI/2;}
  let LL=L;
  const tp=CARPACK&&CARPACK[(CAR_GLB[type]||'').toLowerCase()];
  if(tp){   // riktig modell: göm de enkla klossarna och lägg in bilen (fronten pekar mot körriktningen)
    g.children.slice().forEach(ch=>{ch.visible=false;});
    const m=tp.g.clone(true),w=new T3.Group();w.add(m);if(dir<0)w.rotation.y=Math.PI;g.add(w);LL=tp.len;
    if(type==='taxi'){   // gul taxi med skylt på taket
      const y=new T3.MeshStandardMaterial({color:0xf6c343,metalness:.3,roughness:.4});
      m.traverse(o=>{if(o.isMesh&&o.material===tp.body)o.material=y;});
      const sy=tp.top+.12;box(.8,.22,.34,M(0x15161a),0,sy,0,w);
      const sm=new T3.MeshBasicMaterial({map:taxiTex(),transparent:true});
      for(const sz of[-1,1]){const p=new T3.Mesh(new T3.PlaneGeometry(.72,.2),sm);p.position.set(0,sy,sz*.176);if(sz<0)p.rotation.y=Math.PI;w.add(p);}
    }
  }

  for(const sz of[-.55,.55]){if(!tp){box(.08,.16,.3,new T3.MeshBasicMaterial({color:0xfff3c8}),(LL/2)*dir,by+.15,sz,g);box(.08,.16,.3,new T3.MeshBasicMaterial({color:0xff3030}),-(LL/2)*dir,by+.15,sz,g);}
    const hg=new T3.Sprite(glowMat);hg.scale.set(1.1,1.1,1);hg.position.set((LL/2+.1)*dir,by+.15,sz);g.add(hg);
    // ljuskägla ut från lampan, lätt nedåtlutad, och ljusfläck på vägen som börjar vid lampan
    const cn=new T3.Mesh(CONE_GEO,coneMat);cn.rotation.z=dir>0?Math.PI/2-.08:-(Math.PI/2-.08);cn.position.set((LL/2+2)*dir,by,sz);cn.renderOrder=3;g.add(cn);
    const bm=new T3.Mesh(BEAM_GEO,beamMat);bm.position.set((LL/2+3.5)*dir,.04,sz*1.1);bm.rotation.y=dir>0?0:Math.PI;bm.renderOrder=3;g.add(bm);
    const tg=new T3.Sprite(tailMat);tg.scale.set(.6,.6,1);tg.position.set(-(LL/2+.1)*dir,by+.15,sz);g.add(tg);}
  return {g,len:LL};
}
function makeMoto(col,dir){
  const g=new T3.Group(),b=new T3.Group();g.add(b);if(dir<0)b.rotation.y=Math.PI;
  const paint=M(col,{metalness:.6,roughness:.3}),black=M(0x16181d,{metalness:.4,roughness:.5}),chrome=M(0xb8bec8,{metalness:.8,roughness:.2}),light=M(0xfff3c8),red=M(0xff3030);
  for(const x of[-.66,.66]){const w=cyl(.33,.33,.14,black,x,.33,0,b,18);w.rotation.x=Math.PI/2;}
  box(.95,.18,.36,paint,0,.62,0,b);
  box(.5,.28,.3,paint,.02,.83,0,b);
  box(.5,.08,.3,black,-.2,.96,0,b);
  const fork=cyl(.035,.035,.62,chrome,.58,.68,0,b,8);fork.rotation.z=-.5;
  box(.07,.07,.64,black,.66,1.0,0,b);
  box(.1,.12,.17,light,.74,.91,0,b);box(.05,.1,.16,red,-.8,.64,0,b);
  // förare
  const jacket=M(0x2c3a4e),pants=M(0x22252e),skin=M(0xd9a06f),helmet=M(0x15161a);
  box(.34,.52,.27,jacket,0,1.17,0,b);
  for(const sz of[-.14,.14]){box(.11,.4,.12,pants,-.02,.82,sz,b);box(.13,.08,.18,black,-.02,.6,sz,b);}
  for(const sz of[-.17,.17]){const arm=cyl(.04,.035,.48,jacket,.27,1.18,sz,b,6);arm.rotation.z=-.95;}
  sph(.17,skin,0,1.51,0,b);sph(.19,helmet,0,1.55,0,b,1,.78,1);
  return {g,len:1.9};
}
function makeBicycle(col,dir){
  const g=new T3.Group(),b=new T3.Group();g.add(b);if(dir<0)b.rotation.y=Math.PI;
  const frame=M(col,{metalness:.5,roughness:.4}),black=M(0x1b1d22),pants=M(0x2b2f3a),skin=M(0xe0ac82),shirt=M(pickR([0xff7a1a,0x3fa56b,0x2f6fe0,0xd62b3a,0x8b8cf7])),helmet=M(0xf2efe5);
  for(const sx of[-.56,.56]){const w=new T3.Mesh(new T3.TorusGeometry(.34,.035,8,22),black);w.position.set(sx,.34,0);b.add(w);}
  const bar=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,c=cyl(.025,.025,Math.hypot(dx,dy),frame,(x1+x2)/2,(y1+y2)/2,0,b,7);c.rotation.z=-Math.atan2(dx,dy);};
  bar(-.56,.34,-.05,.44);bar(-.05,.44,-.18,.92);bar(-.18,.92,.4,.86);bar(-.05,.44,.4,.86);bar(.4,.86,.56,.34);bar(-.56,.34,-.18,.92);
  box(.24,.06,.11,black,-.2,.96,0,b);box(.07,.06,.42,black,.43,1.0,0,b);
  box(.07,.1,.14,M(0xfff3c8),.55,.82,0,b);box(.04,.08,.12,M(0xff3030),-.58,.72,0,b);
  // cyklist
  box(.3,.5,.25,shirt,0,1.05,0,b);
  for(const sz of[-.12,.12]){const leg=cyl(.065,.05,.5,pants,.02,.72,sz,b,6);leg.rotation.z=-.45;box(.14,.07,.18,black,.16,.48,sz,b);}
  for(const sz of[-.15,.15]){const arm=cyl(.035,.03,.42,shirt,.24,1.13,sz,b,6);arm.rotation.z=-1.0;}
  sph(.16,skin,0,1.38,0,b);sph(.19,helmet,0,1.42,0,b,1,.72,1);
  return {g,len:1.45};
}
function spawnBike(lane,z,s){
  const col=pickR([0x2f6fe0,0xd62b3a,0x3fa56b,0xffc94a,0x8b8cf7]);
  const b=makeBicycle(col,lane),v0=4.6+Math.random()*.4;
  b.g.position.set(s*lane,-.62,z);root.add(b.g);
  return {...b,dir:lane,z,v0,cur:v0};
}
function moveBikes(dt){
  for(const b of bikes){
    b.g.position.x+=b.cur*b.dir*dt;
    if(b.g.position.x*b.dir>62){b.g.position.x=-62*b.dir-Math.random()*8*b.dir;b.cur=4.6+Math.random()*.4;}
  }
}
function moveCars(dt){
  for(const lane of[1,-1]){
    const ls=cars.filter(c=>c.dir===lane);ls.forEach(c=>c.s=c.g.position.x*lane);
    ls.forEach(c=>{
      let gap=1e9,lead=null;
      ls.forEach(o=>{if(o===c)return;let d=o.s-c.s;if(d<0)d+=124;if(d>124)return;const gg=d-(o.len+c.len)/2;if(gg<gap){gap=gg;lead=o;}});
      let target=c.v0;if(lead&&gap<12)target=Math.max(0,Math.min(target,lead.cur+(gap-3)*.9));
      c.cur+=(target-c.cur)*Math.min(1,dt*4);
    });
    ls.forEach(c=>{
      c.g.position.x+=c.cur*lane*dt;
      if(c.g.position.x*lane>62){ // ut ur bild: en ny slumpad bil ställer sig sist i kön
        const others=ls.filter(o=>o!==c).map(o=>o.g.position.x*lane),back=others.length?Math.min(...others):62;
        root.remove(c.g);const n=spawnCar(lane,c.z,0,c.type);
        n.g.position.x=Math.min(-62,back-n.len-8-Math.random()*20)*lane;cars[cars.indexOf(c)]=n;
      }
    });
  }
}
function signBoardPlain(text,width){
  const W=1024,H=220,c=cv(W,H),g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,H);const SC=SIGNC[VAR%SIGNC.length];gr.addColorStop(0,SC[0]);gr.addColorStop(1,SC[1]);g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.strokeStyle=SC[2];g.lineWidth=10;g.strokeRect(10,10,W-20,H-20);
  for(let x=30;x<W-20;x+=40){g.fillStyle='#fff3c8';g.beginPath();g.arc(x,22,5,0,7);g.fill();g.beginPath();g.arc(x,H-22,5,0,7);g.fill();}
  g.textAlign='center';g.textBaseline='middle';let fs=120;const sf=()=>g.font='800 '+fs+'px Figtree,Inter,"Arial Black",Arial,sans-serif';sf();
  while(g.measureText(text).width>W-110&&fs>30){fs-=6;sf();}
  g.shadowColor=SC[3];g.shadowBlur=10;g.fillStyle='#ffffff';g.fillText(text,W/2,H/2+4);g.shadowBlur=0;g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.28)';g.strokeText(text,W/2,H/2+4);
  const h=width*H/W,grp=new T3.Group(),steel=M(0x8d939c,{metalness:.8,roughness:.35});
  box(width+.35,h+.35,.3,M(0x2a2f3a,{metalness:.6,roughness:.4}),0,0,-.05,grp);
  const st=new T3.CanvasTexture(c);st.encoding=T3.sRGBEncoding;if(renderer)st.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
  const face=new T3.Mesh(new T3.PlaneGeometry(width,h),new T3.MeshBasicMaterial({map:st}));face.position.z=.11;grp.add(face);
  const postH=1.2;
  for(const sx of[-.38,0,.38]){cyl(.09,.09,postH+h/2,steel,sx*width,-(postH+h/2)/2-h/2+h/2-.0,-.15,grp,10);}
  for(const sx of[-.38,.38]){const br=box(.08,.08,1.8,steel,sx*width,-h/2-postH*.55,-.9,grp);br.rotation.x=.55;}
  box(width+.35,.12,.12,steel,0,-h/2-.2,-.15,grp);
  return {grp,h,postH};
}
/* ---------- skylt med företagets logotyp: skyltens form följer logotypens (rund / triangel / fyrkant) ---------- */
const LOGOIMG={};   // url -> laddad bild
function preloadLogo(url){return new Promise(res=>{if(!url)return res(null);const c=LOGOIMG[url];if(c&&c.complete&&c.naturalWidth)return res(c);const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{LOGOIMG[url]=im;res(im);};im.onerror=()=>res(null);im.src=url;});}
function signPts(kind,W,H,m){   // skyltens kontur som punkter i canvas-koordinater, m = marginal
  const P=[],arc=(cx,cy,r,a0,a1,n)=>{for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
  if(kind==='round'){const R=H/2-m;arc(W-R-m,H/2,R,-Math.PI/2,Math.PI/2,28);arc(R+m,H/2,R,Math.PI/2,Math.PI*1.5,28);}
  else if(kind==='tri'){const cap=H*.92;P.push([m,H/2],[cap,m],[W-m-14,m]);arc(W-m-14,m+14,14,-Math.PI/2,0,6);P.push([W-m,H-m-14]);arc(W-m-14,H-m-14,14,0,Math.PI/2,6);P.push([cap,H-m]);}
  else{const r=26;arc(W-m-r,m+r,r,-Math.PI/2,0,8);arc(W-m-r,H-m-r,r,0,Math.PI/2,8);arc(m+r,H-m-r,r,Math.PI/2,Math.PI,8);arc(m+r,m+r,r,Math.PI,Math.PI*1.5,8);}
  return P;
}
function drawLogoSign(g,W,H,text,kind,img,SC){
  g.clearRect(0,0,W,H);
  const pts=signPts(kind,W,H,8),path=()=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();};
  path();const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,SC[0]);gr.addColorStop(1,SC[1]);g.fillStyle=gr;g.fill();
  g.save();path();g.clip();const sh=g.createLinearGradient(0,0,W,0);sh.addColorStop(0,'rgba(255,255,255,.12)');sh.addColorStop(.6,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(0,0,W,H/2);g.restore();
  path();g.strokeStyle=SC[2];g.lineWidth=9;g.stroke();
  const fit=(x,y,w,h)=>{if(!img)return;const k=Math.min(w/img.naturalWidth,h/img.naturalHeight),iw=img.naturalWidth*k,ih=img.naturalHeight*k;g.drawImage(img,x+(w-iw)/2,y+(h-ih)/2,iw,ih);};
  let tx0=60,tx1=W-60;
  if(kind==='round'){
    const r=H/2-24,cx=H/2+6,cy=H/2;g.save();g.beginPath();g.arc(cx,cy,r,0,7);g.fillStyle='rgba(255,255,255,.10)';g.fill();g.clip();fit(cx-r+8,cy-r+8,2*r-16,2*r-16);g.restore();
    g.beginPath();g.arc(cx,cy,r,0,7);g.strokeStyle=SC[2];g.lineWidth=5;g.stroke();tx0=H+16;tx1=W-H*.5;
  }else if(kind==='tri'){
    const cap=H*.92;g.save();g.beginPath();g.moveTo(24,H/2);g.lineTo(cap-16,26);g.lineTo(cap-16,H-26);g.closePath();g.fillStyle='rgba(255,255,255,.10)';g.fill();g.clip();fit(34,34,cap-58,H-68);g.restore();
    g.beginPath();g.moveTo(24,H/2);g.lineTo(cap-16,26);g.lineTo(cap-16,H-26);g.closePath();g.strokeStyle=SC[2];g.lineWidth=5;g.stroke();tx0=cap+26;tx1=W-50;
  }else{
    const sz=H-52;g.save();g.beginPath();g.roundRect?g.roundRect(34,26,sz,sz,18):g.rect(34,26,sz,sz);g.fillStyle='rgba(255,255,255,.10)';g.fill();g.clip();fit(34+10,26+10,sz-20,sz-20);g.restore();tx0=34+sz+34;tx1=W-50;
  }
  g.textAlign='center';g.textBaseline='middle';let fs=110;const f=()=>g.font='800 '+fs+'px Figtree,Inter,"Arial Black",Arial,sans-serif';f();
  while(g.measureText(text).width>tx1-tx0&&fs>26){fs-=6;f();}
  g.shadowColor=SC[3];g.shadowBlur=10;g.fillStyle='#ffffff';g.fillText(text,(tx0+tx1)/2,H/2+4);g.shadowBlur=0;g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.28)';g.strokeText(text,(tx0+tx1)/2,H/2+4);
}
function signBoard(text,width,logo){
  if(!logo||!logo.url)return signBoardPlain(text,width);
  const kind=logo.shape==='round'||logo.shape==='tri'?logo.shape:'rect',W=1024,H=256,c=cv(W,H),g=c.getContext('2d'),SC=SIGNC[VAR%SIGNC.length];
  const tex=new T3.CanvasTexture(c);tex.encoding=T3.sRGBEncoding;tex.anisotropy=renderer?Math.min(16,renderer.capabilities.getMaxAnisotropy()):8;
  const paint=im=>{drawLogoSign(g,W,H,text,kind,im,SC);tex.needsUpdate=true;};
  const cached=LOGOIMG[logo.url];paint(cached&&cached.naturalWidth?cached:null);
  if(!(cached&&cached.naturalWidth))preloadLogo(logo.url).then(im=>{if(im)paint(im);});
  const h=width*H/W,grp=new T3.Group(),steel=M(0x8d939c,{metalness:.8,roughness:.35});
  const sh=new T3.Shape();signPts(kind,W,H,0).map(([x,y])=>[x/W*width-width/2,(1-y/H)*h-h/2]).forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));sh.closePath();
  const body=new T3.Mesh(new T3.ExtrudeGeometry(sh,{depth:.3,bevelEnabled:false}),M(0x2a2f3a,{metalness:.6,roughness:.4}));body.position.z=-.2;body.castShadow=true;grp.add(body);
  const face=new T3.Mesh(new T3.PlaneGeometry(width,h),new T3.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.1}));face.position.z=.11;grp.add(face);
  const postH=1.2;
  for(const sx of[-.38,0,.38])cyl(.09,.09,postH+h/2,steel,sx*width,-(postH+h/2)/2,-.15,grp,10);
  for(const sx of[-.38,.38]){const br=box(.08,.08,1.8,steel,sx*width,-h/2-postH*.55,-.9,grp);br.rotation.x=.55;}
  box(width+.1,.12,.12,steel,0,-h/2-.2,-.15,grp);
  return {grp,h,postH};
}
/* ---------- personer ---------- */
function person(o){
  const g=new T3.Group(),skin=M(o.skin),cloth=M(o.shirt),pants=M(o.pants||0x2b2f3a),hairM=M(o.hair,{roughness:.9}),shoe=M(0x15161a);
  const base=o.standing?.9:.5,legs=[],knees=[];
  for(const s of[-1,1]){
    if(o.standing){const lg=new T3.Group();lg.position.set(s*.12,.9,0);box(.2,.45,.2,pants,0,-.225,0,lg);
      const kn=new T3.Group();kn.position.set(0,-.45,0);box(.19,.4,.19,pants,0,-.2,0,kn);box(.22,.1,.32,shoe,0,-.4,.06,kn);box(.23,.035,.33,M(0xf0f0f0),0,-.46,.06,kn);lg.add(kn);g.add(lg);legs.push(lg);knees.push(kn);}
    else{box(.2,.2,.52,pants,s*.13,.6,.24,g);box(.18,.5,.18,pants,s*.13,.3,.5,g);box(.2,.1,.3,shoe,s*.13,.05,.55,g);}
  }
  box(.52,.64,.3,cloth,0,base+.34,0,g);
  if(o.tie)box(.08,.36,.02,M(o.tie),0,base+.42,.16,g);
  if(o.hood)box(.46,.14,.2,cloth,0,base+.68,-.08,g);
  const arms=[];
  for(const s of[-1,1]){
    const sh=new T3.Group();sh.position.set(s*.34,base+.58,0);
    box(.15,.36,.15,cloth,0,-.17,0,sh);
    const el2=new T3.Group();el2.position.set(0,-.35,0);
    box(.13,.32,.13,cloth,0,-.15,0,el2);box(.12,.1,.14,skin,0,-.33,0,el2);
    sh.add(el2);g.add(sh);arms.push({sh,el:el2});
  }
  const head=new T3.Group();head.position.set(0,base+.93,0);g.add(head);
  sph(.27,skin,0,0,0,head);
  for(const s of[-1,1])sph(.035,M(0x15161a),s*.09,.02,.25,head);
  const hs=o.hairStyle;
  if(hs==='afro')sph(.36,hairM,0,.08,-.04,head,1,.95,1);
  else{
    sph(.29,hairM,0,.07,-.04,head,1,.8,1);
    if(hs==='long')box(.56,.62,.14,hairM,0,-.2,-.2,head);
    if(hs==='bob'){box(.1,.32,.3,hairM,-.27,-.04,-.02,head);box(.1,.32,.3,hairM,.27,-.04,-.02,head);box(.54,.4,.12,hairM,0,-.06,-.22,head);}
    if(hs==='bun'){sph(.14,hairM,0,.34,-.16,head);box(.1,.4,.1,hairM,0,-.1,-.27,head);}
  }
  if(o.glasses)for(const s of[-1,1]){const t=new T3.Mesh(new T3.TorusGeometry(.065,.012,8,16),M(0x111111));t.position.set(s*.09,.03,.265);head.add(t);}
  if(o.beard)sph(.25,hairM,0,-.1,.04,head,1,.55,1);
  if(o.headset){const hb=new T3.Mesh(new T3.TorusGeometry(.3,.025,8,20,Math.PI),M(0x222222));hb.position.y=.02;head.add(hb);
    for(const s of[-1,1])box(.09,.16,.12,M(0xff6b9a),s*.3,0,0,head);}
  let upper=null;
  if(o.standing){upper=new T3.Group();g.children.filter(c=>!legs.includes(c)).forEach(c=>upper.add(c));g.add(upper);}
  g.userData={arms,head,legs,knees,upper,standing:!!o.standing,walking:false,ph:0};
  return g;
}
function animPerson(p,t,busy,ph){
  const {arms,head,standing}=p.userData,k=busy?2.4:1;
  const {legs,knees,walking}=p.userData,wph=p.userData.ph;
  if(walking){
    // stegen följer sträckan (wph), knät böjs när benet svingar fram, armarna i motsatt takt
    const a=Math.sin(wph),c=Math.cos(wph);
    legs[0].rotation.x=-a*.55;legs[1].rotation.x=a*.55;
    knees[0].rotation.x=Math.max(0,c)*1.2;knees[1].rotation.x=Math.max(0,-c)*1.2;
    const up=p.userData.upper;if(up){up.position.y=Math.abs(c)*.07;up.rotation.z=a*.05;}
    arms[0].sh.rotation.set(a*.4,0,0);arms[1].sh.rotation.set(-a*.4,0,0);arms[0].el.rotation.x=arms[1].el.rotation.x=-.25;head.rotation.set(0,0,0);
  }else if(standing){
    if(legs){legs.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=0);}
    if(p.userData.upper){p.userData.upper.position.y=0;p.userData.upper.rotation.z=0;}
    arms[0].sh.rotation.x=-.1;arms[0].el.rotation.x=-.25;
    arms[1].sh.rotation.set(-1.25+Math.sin(t*2.2)*.15,0,-.35);arms[1].el.rotation.x=-.5+Math.sin(t*4.4)*.2;
    head.rotation.y=Math.sin(t*.9)*.25;
  }else{
    arms[0].sh.rotation.x=-.55+Math.sin(t*14+ph)*.05*k;arms[1].sh.rotation.x=-.55+Math.sin(t*13+ph+2)*.05*k;
    arms[0].el.rotation.x=-.95+Math.sin(t*17+ph)*.12*k;arms[1].el.rotation.x=-.95+Math.sin(t*15+ph+1)*.12*k;
    head.rotation.y=Math.sin(t*.7+ph)*(busy?.05:.14);head.rotation.x=busy?.12:0;
  }
}
// Samtal: stående, vända mot varandra, armarna gestikulerar när personen pratar och hon/han nickar när den andra pratar
const talk=new Map(),phoning=new Set(),poses=new Map(),walkSet=new Set();let phoneP=null;
function animTalk(p,t,sp){
  const {arms,head,legs,knees,upper}=p.userData,g=sp?1:.2;
  if(legs){legs.forEach(l=>l.rotation.x=0);knees.forEach(k=>k.rotation.x=0);}
  if(upper){upper.position.y=0;upper.rotation.z=0;}
  arms[0].sh.rotation.set(-.35+Math.sin(t*2.3)*.35*g,0,.12);arms[0].el.rotation.x=-.6+Math.sin(t*3.1)*.3*g;
  arms[1].sh.rotation.set(-.35+Math.sin(t*2.7+1)*.35*g,0,-.12);arms[1].el.rotation.x=-.6+Math.sin(t*3.4+1)*.3*g;
  head.rotation.set(sp?Math.sin(t*3)*.05:Math.sin(t*1.4)*.12,Math.sin(t*.8)*.07,0);
}
const SKINS=[0xf1c9a5,0xe0ac82,0xc68a62,0x8a5a3c,0x6b4430],HAIRS=[0x1a1210,0x3a2a22,0x8a5a33,0xb8863b,0x555555],
  SHIRTS=[0x4a78c9,0xc94a6e,0x3fa56b,0xd18a3a,0x7a5cc9,0x2e3a4a,0xe8d6c0],STYLES=['short','long','bob','bun','afro'];
const PRESET={
  tomas:{skin:0xe6bd9c,shirt:0x23304f,hair:0x4a3426,hairStyle:'short',glasses:true,beard:true},
  ebba:{skin:0xeebfa0,shirt:0x55585f,hair:0x7a4228,hairStyle:'bob'},
  kia:{skin:0x6e4630,shirt:0xe8d6c0,hair:0x1a1210,hairStyle:'long',headset:true},
  manus:{skin:0x7a5238,shirt:0x4d5058,hair:0x120d0b,hairStyle:'afro',hood:true},
  laila:{skin:0xd7a37c,shirt:0xc77882,hair:0x2a1912,hairStyle:'bun'}};
function look(e){
  if(e.look&&typeof e.look==='object')return e.look;
  const p=PRESET[(e.name||'').toLowerCase()];if(p)return e.age>52?{...p,hair:0x9a9a9a,beard:p.beard}:p;
  const h=hash(VAR?e.id+'#'+VAR:e.id);
  const o={skin:SKINS[h%5],hair:HAIRS[(h>>3)%5],shirt:SHIRTS[(h>>5)%7],hairStyle:STYLES[(h>>7)%5],glasses:(h>>9)%3===0,headset:(h>>11)%4===0};
  if(e.rank==='leader'){o.shirt=0x1d3f7a;o.tie=0xffffff;o.glasses=true;}
  if(e.age>52)o.hair=0x9a9a9a;
  return o;
}

/* ---------- agenter ---------- */
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function register(e,p,anchor,ringPos,seat,lk){
  const ring=new T3.Mesh(new T3.RingGeometry(.75,.95,40),new T3.MeshBasicMaterial({color:e.color,transparent:true,opacity:0,side:T3.DoubleSide,depthTest:false}));
  ring.rotation.x=-Math.PI/2;ring.renderOrder=5;ring.position.copy(ringPos);root.add(ring);
  const tag=document.createElement('div');tag.className='otag';tag.style.setProperty('--c',e.color);
  tag.innerHTML='<i></i><b>'+esc(e.name)+'</b><small>'+esc(e.title||'')+'</small>';overlay.appendChild(tag);
  tag.addEventListener('click',()=>onPick&&onPick(e.id));if(e.id===selId)tag.classList.add('on');
  const bub=document.createElement('div');bub.className='bub';bub.style.setProperty('--c',e.color);bub.innerHTML='<i>'+esc(e.name)+'</i><span></span>';overlay.appendChild(bub);
  agents[e.id]={id:e.id,name:e.name,rank:e.rank||'',kind:e.kind||'',anchor:anchor.clone(),p,ring,tag,bub,busy:0,glow:0,phase:hash(e.id)%7,timer:null,seat,look:lk,mover:null,away:null,socialWith:false};
}
function seated(parent,e,x,y,z,facing,w,mons,lkOver){
  const st=new T3.Group();st.position.set(x,y,z);root.add(st);
  const inn=new T3.Group();st.add(inn);if(facing==='n')inn.rotation.y=Math.PI;
  deskTop(inn,w,1.0,0,.72,1.05);
  mons.forEach(m=>m.laptop?laptop(inn,m.x,.72,.95,e?m.t:'off'):monitor(inn,m.x,.72,1.35,e?m.t:'off',{ry:Math.PI+(m.a||0),w:m.w||.85,h:m.h||.55}));
  chair(inn,0,0,e?0:.4);
  if(e){
    const lk=lkOver||look(e),pr=person(lk);inn.add(pr);box(.55,.02,.2,dark,0,.74,.7,inn);
    const wp=new T3.Vector3(x,0,z); // platsen ligger direkt under root utan rotation, så världsposition = (x,z)
    register(e,pr,new T3.Vector3(wp.x,y+2.6,wp.z),new T3.Vector3(wp.x,y+.03,wp.z),{x:wp.x,z:wp.z,y,rowZ:z,facing},lk);
  }
  return inn;
}
const MONS={dev:['code','code'],design:['design','blueprint'],finance:['chart','dash'],marketing:['chart','design'],lead:['dash','chart'],gen:['code','dash']};
const monsFor=e=>{const t=MONS[e.kind]||MONS.gen;return [{x:-.8,t:t[0],a:.15},{x:.8,t:t[1],a:-.15}];};

/* ---------- bygg hela scenen ---------- */
const OFF=[{x:-.8,t:'off'},{x:.8,t:'off'}];
function slotRows(y,people,perRow,x0,mons,w){ // två rader skrivbord, vända bort från kameran
  const slots=[];[-3.3,0].forEach(z=>{for(let i=0;i<perRow;i++)slots.push([x0+(i-(perRow-1)/2)*3.6,z]);});
  slots.forEach(([x,z],i)=>{const e=people[i];seated(root,e,x,y,z,'n',w||3.2,e?mons(e):OFF);pendant(x,y+WH-.1,z-1);});
}
function wcDoor(y){
  box(.08,2.2,1.05,M(0x8a6a52),-BW/2+.05,y+1.1,-2.1,root);box(.1,.1,.1,metal,-BW/2+.12,y+1.05,-1.75,root);
  const c=cv(64,64),g=c.getContext('2d');g.fillStyle='#2f6fe0';g.fillRect(0,0,64,64);g.fillStyle='#fff';g.font='bold 30px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('WC',32,34);
  const sgt=new T3.CanvasTexture(c);sgt.encoding=T3.sRGBEncoding;const sg=new T3.Mesh(new T3.PlaneGeometry(.45,.45),new T3.MeshBasicMaterial({map:sgt}));sg.position.set(-BW/2+.1,y+2.5,-2.1);sg.rotation.y=Math.PI/2;root.add(sg);
}
function whiteboard(x,y,z){ // mobil whiteboard med post-its
  box(1.8,1.1,.05,M(0xf7f7f4),x,y+1.75,z,root);box(1.9,.06,.08,metal,x,y+1.18,z,root);
  for(const sx of[-.8,.8])box(.05,1.2,.05,metal,x+sx,y+.6,z,root);
  ['#ffe27a','#ffb3c7','#9fe3ff','#b6f0b0','#ffe27a','#ffb3c7'].forEach((c,i)=>box(.22,.22,.02,M(c),x-.55+(i%3)*.3,y+1.95-Math.floor(i/3)*.3,z+.04,root));
  box(.5,.02,.02,M(0x2f6fe0),x+.45,y+1.6,z+.04,root);box(.4,.02,.02,M(0xd62b3a),x+.4,y+1.5,z+.04,root);
}
function coffeeBar(x,y,z){box(2.4,1,.6,M(0x6d4a32),x,y+.5,z,root);box(2.5,.06,.7,M(0xe8e4dc),x,y+1.03,z,root);box(.45,.5,.4,M(0x2a2c33,{metalness:.5}),x-.6,y+1.31,z,root);
  for(let i=0;i<3;i++){cyl(.2,.2,.05,dark,x-.7+i*.7,y+.75,z+.6,root,12);cyl(.03,.03,.75,metal,x-.7+i*.7,y+.37,z+.6,root,6);}}
function fireplace(x,y,z){box(2.6,1.5,.5,M(0x8b8680),x,y+.75,z,root);box(1.5,.8,.1,M(0x111111),x,y+.55,z+.21,root);
  const f=new T3.Mesh(new T3.PlaneGeometry(1.1,.5),new T3.MeshBasicMaterial({color:0xff8a2a,transparent:true,opacity:.9}));f.position.set(x,y+.45,z+.27);root.add(f);flames.push(f);
  const L=new T3.PointLight(0xff9a40,.8,6,2);L.position.set(x,y+.8,z+1);root.add(L);}
const leadMons=()=>[{x:-.8,t:'dash',a:.15},{x:.8,t:'chart',a:-.15}];
function leadStation(y,e,x){seated(root,e,x,y,-3.3,'n',3.2,e?leadMons():OFF);if(e){const st=cyl(.12,.12,.04,new T3.MeshBasicMaterial({color:0x3fe08f}),x,y+1.9,-4.6,root,16);st.rotation.x=Math.PI/2;}pendant(x,y+WH-.1,-4.3);}
function bossPerson(o,y,x,z,w){
  const lk=o.bossGender==='f'?{skin:0xefc6a6,shirt:0x3b2a5c,pants:0x2b2240,hair:0x6b3e22,hairStyle:'long'}:{skin:0xe0b090,shirt:0x1f2a5c,pants:0x1f2a5c,hair:0x3a2a22,tie:0xd62b3a,hairStyle:'short'};
  seated(root,{id:'boss',name:o.boss||'Boss',title:o.bossTitle||'Owner',color:'#ffc94a',kind:'lead'},x,y,z,'s',w,[{x:-.5,t:'chart',a:.2},{x:.6,t:'dash',a:-.2}],lk);
}
// Frigör GPU-resurser från förra bygget. Delade material (ljus, bilar, partiklar)
// och den gemensamma glödtexturen får leva vidare.
function disposeTree(obj){
  const keep=new Set([beamMat,coneMat,glowMat,tailMat].filter(Boolean));
  obj.traverse(o=>{
    if(o.geometry)o.geometry.dispose();
    const mats=Array.isArray(o.material)?o.material:[o.material];
    mats.forEach(m=>{
      if(!m||keep.has(m))return;
      if(m.map&&m.map!==GT)m.map.dispose();
      m.dispose();
    });
  });
}
function build(o){
  const tier=TIERS[o.tier]?o.tier:'kontor',cfg=TIERS[tier];BW=cfg.BW;floors=cfg.floors;VAR=Math.abs(o.variant|0)%12;TIERK=tier;STY=Object.assign({},BSTYLES[tier],PAL[VAR%PAL.length]);
  if(root){disposeTree(root);scene.remove(root);}
  glassMat=null;
  root=new T3.Group();scene.add(root);
  loadCarPack();screens=[];leds=[];holos=[];lights=[];cars=[];bikes=[];screenHits=[];cityTex=[];flames=[];OBST=[];
  cityFaces.forEach(f=>f.t.dispose());cityFaces=CITY_STYLES.map((_,i)=>makeCityFace(i));cityMats=[];cityBeacons=[];
  Object.values(agents).forEach(a=>{a.tag.remove();a.bub.remove();});for(const k in agents)delete agents[k];
  packets.forEach(p=>p.res());packets=[];trails=[];
  wall=M(STY.wall);frameM=M(STY.frame,{metalness:.6,roughness:.35});winM=M(STY.win,{metalness:.5,roughness:.4});goldM=M(STY.gold||0xc9a24a,{metalness:.9,roughness:.25});
  const staff=o.staff||[],leader=staff.find(e=>e.rank==='leader'),leads=staff.filter(e=>e.rank==='lead'),rest=staff.filter(e=>e.rank==='worker');
  ELX=BW/2-2.3;movers.forEach(m=>m.res());movers=[];visiting=false;socializing=false;sceneGen++;
  STY.floors.forEach((k,i)=>buildLevel(i,k,true));
  outside();annexes();
  const sx=-BW/2,topY=(floors-1)*FH;

  if(tier==='loft'){
    /* bottenvåning: öppen yta med laptops, whiteboards */
    slotRows(0,[...leads,...rest],2,0,e=>[{x:-.5,t:MONS[e.kind]?MONS[e.kind][0]:'code',laptop:true},{x:.6,t:'chart',laptop:true}],2.6);
    [-1.8,1.8].forEach(x=>{deskLamp(root,x+1,.72,-4.6);});
    whiteboard(-3.1,0,-4.95);whiteboard(.9,0,-4.95);
    cooler(sx+.7,0,-4.8);plant(sx+.6,0,-3.6,1.1);plant(BW/2-.7,0,.3,1);wcDoor(0);
    /* övervåning: ägare + teamledare vid höj/sänkbart skrivbord med ultrawide, sittsäckar, kaffehörna */
    const y=topY;
    seated(root,leader,BW/2-3.2,y,-3.7,'s',2.4,leader?[{x:0,t:'code',w:1.5,h:.5}]:[{x:0,t:'off',w:1.5,h:.5}]);
    [[sx+1.3,-3.6],[sx+2.4,-2.8]].forEach(([x,z])=>sph(.55,M(0xb98a5c,{roughness:.9}),x,y+.33,z,root,1,.62,1));
    box(1.2,.75,.5,M(0xd8b27c),-1.4,y+.37,-5.0,root);box(.3,.38,.3,dark,-1.6,y+.94,-5.0,root);cyl(.06,.05,.12,white,-1.2,y+.81,-5,root,10);
    plant(sx+.5,y,.3,1.2);plant(-.2,y,-5,1.1);pendant(-1.5,y+WH-.1,-2.3);
    bossPerson(o,y,sx+6.2,-3.9,2.2);
  }else if(tier==='kontor'){
    /* våning 1: utveckling & design */
    slotRows(0,rest,4,0,monsFor);
    rack(sx+.8,0,-.8);rack(sx+.8,0,.5);cooler(sx+.7,0,-4.8);cooler(BW/2-.7,0,.4);
    box(2.6,.9,.6,M(0xe6e1d6),BW/2-5.7,.45,-5.1,root);plant(sx+.6,0,-3.6,1.1);plant(BW/2-.7,0,-4.6,1.1);wcDoor(0);
    holo(sx+3.2,2.6,-1.6,'chart',1.5,.95,.5);holo(BW/2-2.5,2.6,-1.6,'blueprint',1.5,.95,-.5);
    /* våning 2: operations & QA – Ebba & Kia, akustikfilt, kaffebar */
    const y1=FH;[0,1].forEach(i=>leadStation(y1,leads[i],.6+i*3.6));
    [-1.3,2.4,6.0].forEach(x=>box(.08,1.4,1.8,M(0x5d636b,{roughness:1}),x,y1+.7,-3.6,root));
    coffeeBar(sx+3.2,y1,-4.8);glass(4.6,3.4,-2.9,y1+1.7,-2.9,Math.PI/2);plant(sx+.6,y1,.2,1.1);plant(BW/2-.7,y1,-4.6,1.1);
    /* våning 3: ledning & möten – teamledare med kurvade skärmar, glasat mötesrum, KPI-tavla */
    const y=topY;
    seated(root,leader,4.6,y,-3.9,'s',2.6,leader?[{x:-.8,t:'chart',a:.5},{x:.8,t:'dash',a:-.5}]:OFF);
    glass(3.8,3.4,-1.2,y+1.7,-3.5,Math.PI/2);glass(3.8,3.4,2.2,y+1.7,-3.5,Math.PI/2);glass(3.4,3.4,.5,y+1.7,-1.6,0);
    deskTop(root,2.2,1.1,.5,y+.74,-3.6,M(0xe6e1d6));[[-.2,-4.4,0],[1.2,-4.4,0],[-.2,-2.8,Math.PI],[1.2,-2.8,Math.PI]].forEach(([x,z,r])=>chair(root,x,z,r,y));
    statsTV(4.6,y+2.7,Z0+.35,2.75,1.6);
    sofa(sx+1,y,-3.4,Math.PI/2);armchair(sx+4,y,-.4,.5);box(.9,.4,.9,M(0xb8956a),sx+3.6,y+.2,-2.3,root);obst(sx+3.6,y,-2.3,.45,.45,0);box(5,.03,3.4,M(0xd9c6a0),sx+4.6,y+.015,-2.4,root);
    plant(sx+.4,y,.3,1.3);plant(BW/2-.5,y,-4.9,1.2);pendant(sx+4.5,y+WH-.1,-2.3);pendant(4.6,y+WH-.1,-2.6);
    bossPerson(o,y,sx+7.1,-3.9,1.8);
  }else{
    /* våning 1: engineering campus – 10 platser, glasad serverhall, loungecafé */
    slotRows(0,rest,5,-3,monsFor);
    const srx=7.9;glass(2.7,3.2,srx-1.35,1.6,-4.0,Math.PI/2);glass(2.7,3.2,srx+1.35,1.6,-4.0,Math.PI/2);glass(2.7,3.2,srx,1.6,-2.65,0);
    for(let i=0;i<3;i++){rack(srx-.9+i*.9,0,-4.6);const gl=new T3.Mesh(new T3.PlaneGeometry(.6,1),new T3.MeshBasicMaterial({color:0x35c6ff,transparent:true,opacity:.35}));gl.position.set(srx-.9+i*.9,.6,-4.29);root.add(gl);}
    sofa(7.9,0,.2,Math.PI);box(.9,.4,.9,M(0xb8956a),7.9,.2,-1.0,root);obst(7.9,0,-1.0,.45,.45,0);cooler(sx+.7,0,-4.8);plant(sx+.6,0,-3.6,1.1);wcDoor(0);
    /* våning 2: mission control – ledare framför statusvyer, träribbad akustikvägg */
    const y1=FH;[0,1].forEach(i=>leadStation(y1,leads[i],-1.5+i*3.6));
    for(let i=0;i<14;i++)box(.12,2.6,.12,M(0x8a5a36),-6+i*.4,y1+1.3,-4.95,root);
    [-4.5,5.6].forEach((x,i)=>holo(x,y1+2.4,-2.2,i?'dash':'chart',1.8,1.05,i?-.3:.3));
    plant(sx+.6,y1,.2,1.2);plant(BW/2-.7,y1,-4.6,1.1);
    /* våning 3: VP & styrelserum – 12-personers bord, videovägg, teamledarens arbetsplats */
    const y2=2*FH,bx0=sx+6.5;
    glass(5,3.4,bx0+5.2,y2+1.7,-3.0,Math.PI/2);
    deskTop(root,6,1.6,bx0,y2+.76,-2.9,M(0x3a2c26));
    for(let i=0;i<6;i++){chair(root,bx0-2.5+i,-4.1,0,y2);chair(root,bx0-2.5+i,-1.7,Math.PI,y2);}
    {const sc=makeScreen('dash');box(4.6,2.0,.1,dark,bx0,y2+2.5,Z0+.3,root);const vw=new T3.Mesh(new T3.PlaneGeometry(4.4,1.85),new T3.MeshBasicMaterial({map:sc.tex}));vw.position.set(bx0,y2+2.5,Z0+.36);root.add(vw);}
    seated(root,leader,4.0,y2,-3.9,'s',3.0,leader?[{x:-1,t:'chart',a:.4},{x:0,t:'dash'},{x:1,t:'chart',a:-.4}]:OFF);
    plant(BW/2-.7,y2,-4.6,1.2);plant(sx+.6,y2,.2,1.2);pendant(bx0,y2+WH-.1,-2.9);pendant(4,y2+WH-.1,-2.8);
    /* våning 4: penthouse – valnöt, skinnfåtöljer, öppen spis, gyllene telemetriskärm */
    const y=topY;
    box(BW-.4,1.2,.05,M(0x3f281b),0,y+.6,Z0+.03,root);
    fireplace(-1.5,y,Z0+.3);statsTV(-1.5,y+2.75,Z0+.35,3.2,1.6,goldM);
    const lea=0x4a2a1a;armchair(-3.2,y,-3.0,.6,lea);armchair(.2,y,-3.0,-.6,lea);box(1.2,.35,.8,M(0x2a1c14),-1.5,y+.18,-3.2,root);obst(-1.5,y,-3.2,.6,.4,0);box(5,.03,3.2,M(0x7a5a3a),-1.5,y+.015,-3.3,root);
    
    sofa(6.5,y,-3.6,0,lea);bookshelf(4.0,y,-5.1,0);
    plant(sx+.6,y,.2,1.3);plant(BW/2-.7,y,-4.6,1.3);plant(BW/2-.7,y,.2,1.1);pendant(-1.5,y+WH-.1,-1.8);pendant(sx+5,y+WH-.1,-3);
    for(let i=0;i<7;i++)box(.1,floors*FH,.1,goldM,-BW/2+1.6+i*(BW-3.2)/6,floors*FH/2-.2,Z1+.1,root); // guldribbor på fasaden
    bossPerson(o,y,sx+5,-4.6,3.2);
  }
  const ry=floors*FH;
  box(BW+1.8,.5,BD+1.8,M(STY.roof),0,ry+.05,ZC,root);box(BW+2,.12,BD+2,STY.gold?goldM:M(0x3a4150),0,ry+.36,ZC,root);
  if(VAR%3===1)for(let i=0;i<4;i++){const pn=box(2.2,.08,1.4,M(0x1c3350,{metalness:.5,roughness:.3}),-BW/2+2.5+i*2.6,ry+.7,ZC-.8,root);pn.rotation.x=-.35;}
  if(VAR%3===2){box(BW*.5,.35,1.8,M(0x4f8f48,{roughness:1}),-BW*.2,ry+.5,ZC-.9,root);}
  const sb=signBoard(o.company||'nRn Company',Math.min(BW*.62,11),o.logoUrl?{url:o.logoUrl,shape:o.logoShape}:null);sb.grp.position.set(0,ry+.42+sb.postH+sb.h/2,Z1-1.6);root.add(sb.grp);signGrp=sb.grp;
  applyTime();fit();
}

/* ---------- tid på dygnet ---------- */
const lerpC=(a,b,t)=>new T3.Color(a).lerp(new T3.Color(b),t);
const hexOf=c=>'#'+c.getHexString();
function daylight(h){const r=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));return h<12?r(h,5,8):1-r(h,18,22);}
function drawSky(d,w){
  const g=skyC.getContext('2d'),gr=g.createLinearGradient(0,0,0,160);
  // Varm dag: mjuk himmelsblå upptill som möter en gräddgul horisont, och en
  // extra persika-ton kring solnedgången – samma färgkänsla som en stadskarta.
  gr.addColorStop(0,hexOf(lerpC('#0a1230','#6fb2e0',d).lerp(new T3.Color('#ffb277'),w*.42)));
  gr.addColorStop(.55,hexOf(lerpC('#16224a','#cfe8ee',d).lerp(new T3.Color('#ffd6a4'),w*.5)));
  gr.addColorStop(1,hexOf(lerpC('#1d2b52','#fbe9c8',d).lerp(new T3.Color('#ffc58a'),w*.7)));
  g.fillStyle=gr;g.fillRect(0,0,256,160);
  if(d>.3){g.fillStyle='rgba(255,247,233,'+(.9*d)+')';[[40,34,20],[62,38,16],[170,24,18],[196,30,14],[120,60,14]].forEach(([x,y,r])=>{g.beginPath();g.arc(x,y,r,0,7);g.fill();});}
  else{g.fillStyle='rgba(255,255,255,'+(.95-d*2)+')';for(let i=0;i<34;i++)g.fillRect(rnd(i)*256,rnd(i*3)*90,2,2);g.fillStyle='#f4f1d8';g.beginPath();g.arc(206,30,9,0,7);g.fill();}
  // Staden är riktig 3D nu – himlen hålls ren och får bara en mjuk horisontdimma.
  const hz=g.createLinearGradient(0,128,0,160);
  hz.addColorStop(0,'rgba(255,255,255,0)');hz.addColorStop(1,hexOf(lerpC('#141d36','#f4e0bb',d)));
  g.fillStyle=hz;g.fillRect(0,128,256,32);
  SKY.needsUpdate=true;
}
function makeCityFace(i){
  const c=cv(128,256),t=new T3.CanvasTexture(c);t.encoding=T3.sRGBEncoding;
  t.wrapS=t.wrapT=T3.RepeatWrapping;
  if(renderer)t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  return {c,t,style:i,seed:i*11.7+2.3};
}
// Fönsterfasaden ritas i en 128×256-textur. En ruta motsvarar ungefär 12×24 m,
// så ett 30 m-hus får tre våningar per texturupprepning i stället för fyra jättefönster.
function drawFacade(face,d){
  const S=CITY_STYLES[face.style]||CITY_STYLES[0],g=face.c.getContext('2d'),W=128,H=256;
  const base=hexOf(lerpC(S.night,S.day,d)),frame=hexOf(lerpC(S.frameN,S.frameD,d)),glass=hexOf(lerpC(S.winN,S.winD,d));
  g.fillStyle=base;g.fillRect(0,0,W,H);
  const sh=g.createLinearGradient(0,0,W,0);sh.addColorStop(0,'rgba(0,0,0,.20)');sh.addColorStop(.45,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(255,255,255,.06)');g.fillStyle=sh;g.fillRect(0,0,W,H);
  const cw=16,ch=32;
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const lit=d<.62&&rnd(face.seed+row*3.1+col*1.7+Math.floor(hourNow*2))>.52;
    const inset=S.glass?2:S.k==='brick'?5:4;
    const wx=col*cw+inset,wy=row*ch+5,ww=cw-inset*2,wh=ch-10;
    g.fillStyle=frame;g.fillRect(wx-1,wy-1,ww+2,wh+2);
    if(lit){
      const gr=g.createLinearGradient(0,wy,0,wy+wh);gr.addColorStop(0,S.lit[0]);gr.addColorStop(1,S.lit[1]);g.fillStyle=gr;
    }else g.fillStyle=glass;
    g.fillRect(wx,wy,ww,wh);
    if(!lit&&d>.45){g.fillStyle='rgba(255,255,255,'+(.05+.1*d)+')';g.fillRect(wx,wy,ww,2);}
    if(lit){g.fillStyle='rgba(72,42,18,.22)';g.fillRect(wx,wy+wh-3,ww,3);g.fillStyle='rgba(255,255,255,.20)';g.fillRect(wx,wy,ww,1);}
    g.fillStyle=frame;g.fillRect(wx+ww/2,wy,1,wh);g.fillRect(wx-1,wy+wh,ww+2,2);
    if(!S.glass&&row%2===0){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(col*cw+1,row*ch+ch-5,cw-2,2);}
  }
  for(let row=0;row<=8;row++){g.fillStyle=frame;g.fillRect(0,row*32-1,W,2);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,row*32+1,W,2);}
  g.fillStyle=frame;g.fillRect(0,0,2,H);g.fillRect(W-2,0,2,H);
  if(S.glass){g.save();g.globalAlpha=.10+.12*d;g.fillStyle='#dff4ff';g.beginPath();g.moveTo(-20,118);g.lineTo(72,-12);g.lineTo(108,-12);g.lineTo(16,118);g.closePath();g.fill();g.restore();}
}
function drawCity(d){
  cityFaces.forEach(f=>{drawFacade(f,d);f.t.needsUpdate=true;});
  cityTex.forEach(t=>t.needsUpdate=true);
  const glow=Math.max(0,1-d*1.55);
  cityMats.forEach(m=>{m.emissiveIntensity=glow*.16;});
}
/* ---------- väder: regn, snö, dimma och åska i kontorsscenen ---------- */
const WXCLEAR={kind:'clear',c:0,snow:0,wet:0,fog:0,int:0,wind:0,flash:0,nextFlash:0};
let WX=WXCLEAR,wxObj=null,wxData=null,wxHemi=0;
function wxBuild(){
  if(wxObj){scene.remove(wxObj);wxObj.geometry.dispose();wxObj.material.dispose();wxObj=null;wxData=null;}
  if(!['rain','thunder','snow'].includes(WX.kind))return;
  const snow=WX.kind==='snow',N=Math.round((snow?500:500)+(snow?1100:1400)*WX.int),D={n:N,x:new Float32Array(N),y:new Float32Array(N),z:new Float32Array(N),sp:new Float32Array(N),ph:new Float32Array(N)};
  for(let i=0;i<N;i++){D.x[i]=-34+Math.random()*68;D.y[i]=-.7+Math.random()*46;D.z[i]=-26+Math.random()*44;D.sp[i]=snow?.9+Math.random()*1.3:26+Math.random()*14;D.ph[i]=Math.random()*6.28;}
  const g=new T3.BufferGeometry();
  if(snow){g.setAttribute('position',new T3.BufferAttribute(new Float32Array(N*3),3));wxObj=new T3.Points(g,new T3.PointsMaterial({color:0xffffff,size:4.4*Math.min(2,devicePixelRatio||1),sizeAttenuation:false,transparent:true,opacity:.88,depthWrite:false}));}
  else{g.setAttribute('position',new T3.BufferAttribute(new Float32Array(N*6),3));wxObj=new T3.LineSegments(g,new T3.LineBasicMaterial({color:0xbfd3ff,transparent:true,opacity:.42,depthWrite:false}));}
  wxObj.frustumCulled=false;wxObj.renderOrder=9;wxData=D;scene.add(wxObj);wxStep(.016,0,0);
}
function wxStep(dt,t,now){
  if(WX.kind==='thunder'){
    if(now>WX.nextFlash){WX.flash=1;WX.nextFlash=now+6000+Math.random()*9000;}
    if(WX.flash>.02){WX.flash*=.9;if(hemi)hemi.intensity=wxHemi+WX.flash*1.5;}else if(WX.flash>0){WX.flash=0;if(hemi)hemi.intensity=wxHemi;}
  }
  if(!wxObj||!wxData||!wxObj.visible)return;
  const D=wxData,N=D.n,p=wxObj.geometry.attributes.position.array,wind=WX.wind,snow=WX.kind==='snow',top=46,bot=-.7;
  for(let i=0;i<N;i++){
    D.y[i]-=D.sp[i]*dt;D.x[i]+=(snow?wind*.6+Math.sin(t*.9+D.ph[i])*.5:wind)*dt;
    if(D.y[i]<bot){D.y[i]=top;D.x[i]=-34+Math.random()*68;D.z[i]=-26+Math.random()*44;}
    if(snow){const k=i*3;p[k]=D.x[i];p[k+1]=D.y[i];p[k+2]=D.z[i];}
    else{const k=i*6;p[k]=D.x[i];p[k+1]=D.y[i];p[k+2]=D.z[i];p[k+3]=D.x[i]-wind*.03;p[k+4]=D.y[i]+1.5;p[k+5]=D.z[i];}
  }
  wxObj.geometry.attributes.position.needsUpdate=true;
}
function wxLook(){   // molnighet, dimma, blöt mark och snötäcke ovanpå dygnsljuset
  if(!hemi)return;
  const c=WX.c,d=daylight(hourNow);
  if(c>0){
    hemi.intensity*=1-.32*c;sunL.intensity*=1-.9*c;
    const grey=lerpC('#1a2033','#aab3c0',d);
    if(scene.fog){scene.fog.color.lerp(grey,.75*c);scene.fog.near=105-70*WX.fog;scene.fog.far=230-150*WX.fog;}
    const g=bgC.getContext('2d');g.globalAlpha=.72*c;g.fillStyle=hexOf(grey);g.fillRect(0,0,4,256);g.globalAlpha=1;bgT.needsUpdate=true;
    if(groundMat){if(WX.snow)groundMat.color.lerp(new T3.Color('#eef3f9'),WX.snow);else if(WX.wet)groundMat.color.multiplyScalar(1-.28*WX.wet);}
  }else if(scene.fog){scene.fog.near=105;scene.fog.far=230;}
  wxHemi=hemi.intensity;
}
function setWeather(w){   // w: {kind:'clear'|'cloud'|'fog'|'rain'|'snow'|'thunder', intensity:0..1, wind:km/h} eller null
  const k=w&&w.kind||'clear',int=Math.max(.15,Math.min(1,(w&&w.intensity)||.5));
  const base={clear:0,cloud:.4,fog:.85,rain:.6+.3*int,snow:.65,thunder:1}[k];
  WX={kind:k,c:base===undefined?0:base,snow:k==='snow'?.85:0,wet:k==='rain'||k==='thunder'?.8:0,fog:k==='fog'?1:(k==='rain'||k==='snow'?.35:0),int,wind:Math.min(6,((w&&w.wind)||0)*.12),flash:0,nextFlash:0};
  wxBuild();if(root)applyTime();
}
function applyTime(){applyTimeBase();wxLook();}
function applyTimeBase(){
  if(!hemi)return;
  const d=daylight(hourNow),w=1-Math.abs(2*d-1),g=bgC.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,hexOf(lerpC('#050914','#6eb0dc',d).lerp(new T3.Color('#ff9a5a'),w*.45)));
  gr.addColorStop(.6,hexOf(lerpC('#101a3a','#dbe6df',d).lerp(new T3.Color('#ffb98a'),w*.6)));
  gr.addColorStop(1,hexOf(lerpC('#1a2547','#fdf0d6',d)));
  g.fillStyle=gr;g.fillRect(0,0,4,256);bgT.needsUpdate=true;
  drawSky(d,w);
  hemi.intensity=.11+.29*d;hemi.color.copy(lerpC('#7089d0','#fffaf1',d));hemi.groundColor.copy(lerpC('#28324c','#b4b8a6',d));
  fillL.intensity=.04+.11*d;fillL.color.copy(lerpC('#b9d4ff','#eef4fb',d));
  sunL.intensity=.72*d;sunL.color.copy(lerpC('#fffdf8','#ffb070',w));
  const a=Math.min(1,Math.max(0,(hourNow-6)/14))*Math.PI;sunL.position.set(-34*Math.cos(a),26*Math.max(.3,Math.sin(a)),30);
  lights.forEach(L=>{L.intensity=.06+.94*(1-d);});
  if(groundMat)groundMat.color.copy(lerpC('#050a07',GK?'#ffffff':'#'+new T3.Color(GROUNDC[VAR%GROUNDC.length]).getHexString(),d));
  if(gpMat)gpMat.color.copy(lerpC('#080d0a','#ffffff',Math.min(1,.12+d*.9)));
  drawCity(d);const nk=Math.max(0,1-d*1.4);beamMat.opacity=.75*nk;coneMat.opacity=.13*nk;glowMat.opacity=nk;tailMat.opacity=.85*nk;if(scene.fog)scene.fog.color.copy(lerpC('#101a3a','#cfdbe6',d).lerp(new T3.Color('#ffb98a'),w*.18));
}
function setHour(h){hourNow=h;if(root)applyTime();}

/* ---------- animation ---------- */
function send(from,to,color,dur=1500){
  return new Promise(res=>{
    let done=false;const finish=()=>{if(done)return;done=true;res();};
    // Om kontoret inte syns (ingen rendering) får flödet ändå inte fastna.
    setTimeout(finish,dur+400);
    const a=agents[from],b=agents[to];if(!a||!b){finish();return;}
    const mid=a.anchor.clone().add(b.anchor).multiplyScalar(.5);mid.y+=1.2;
    const curve=new T3.CatmullRomCurve3([a.anchor.clone(),mid,b.anchor.clone()]);
    const grp=new T3.Group();
    const glow=new T3.Sprite(new T3.SpriteMaterial({map:GT,color,transparent:true,blending:T3.AdditiveBlending,depthTest:false}));glow.scale.set(1.6,1.6,1);glow.renderOrder=7;
    const doc=new T3.Mesh(new T3.BoxGeometry(.34,.24,.05),new T3.MeshBasicMaterial({color:0xffffff,depthTest:false}));doc.renderOrder=8;
    grp.add(glow,doc);root.add(grp);
    const tube=new T3.Mesh(new T3.TubeGeometry(curve,40,.03,6),new T3.MeshBasicMaterial({color:0x6fe0ff,transparent:true,opacity:.5,depthTest:false}));tube.renderOrder=4;root.add(tube);
    trails.push({m:tube,t0:performance.now()+dur,life:2200});
    packets.push({grp,curve,t0:performance.now(),dur,res:finish,to});
  });
}
// Alla pratbubblor ska låta som vanligt tal: inga streck, stjärnor, listtecken, citattecken eller emojis
function speech(x){
  return String(x||'').replace(/[*_`#>~|]/g,'').replace(/^\s*(?:[-•·]+|\d+[.)])\s+/,'').replace(/\s+[–—-]+\s+/g,', ').replace(/[–—]/g,', ')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,'').replace(/^["“”'«»]+|["“”'«»]+$/g,'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').replace(/^[,\s]+/,'').trim();
}
function say(id,text,ms=3500){
  const a=agents[id];if(!a)return;
  a.bub.querySelector('span').textContent=speech(text);a.bub.classList.add('on');
  clearTimeout(a.timer);a.timer=setTimeout(()=>a.bub.classList.remove('on'),ms);
}
function busy(id,on){const a=agents[id];if(a)a.busy=Math.max(0,a.busy+(on?1:-1));}
const v=new T3.Vector3();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function walkTo(obj,pts,speed=1.4){
  walkSet.add(obj);
  return new Promise(res=>{obj.userData.walking=true;movers.push({obj,pts:pts.map(q=>{const p=safePt(q[0],q[1],obj.position.y);return new T3.Vector3(p[0],obj.position.y,p[1]);}),i:0,speed,res,blk:0});});
}
// Personer går inte genom varandra: de saktar in, viker undan åt sidan och skjuts isär om de kommer för nära
const AVOID=1.2;
function steer(o,ux,uz){
  pushOut(o);let ax=ux,az=uz,slow=1,blocked=false;
  for(const q of walkSet){
    if(q===o||!q.parent||q.visible===false||Math.abs(q.position.y-o.position.y)>1)continue;
    const rx=q.position.x-o.position.x,rz=q.position.z-o.position.z,dist=Math.hypot(rx,rz);
    if(dist>AVOID||dist<.001)continue;
    if(dist<.6){const f=(.6-dist)*.5;o.position.x-=rx/dist*f;o.position.z-=rz/dist*f;}
    const ahead=(rx*ux+rz*uz)/dist;
    if(ahead>.15){
      const cr=ux*rz-uz*rx,sg=cr>0?1:-1,wgt=(1-dist/AVOID)*2.2; // den andra till vänster: sväng höger, annars vänster
      ax+=uz*sg*wgt;az+=-ux*sg*wgt;
      slow=Math.min(slow,.35+.65*dist/AVOID);
      if(dist<.95&&ahead>.5)blocked=true;
    }
  }
  const l=Math.hypot(ax,az)||1;return {ax:ax/l,az:az/l,slow,blocked};
}
function moveWalkers(dt,t){
  for(const q of walkSet)if(!q.parent)walkSet.delete(q);
  for(let k=movers.length-1;k>=0;k--){
    const m=movers[k],o=m.obj,tg=m.pts[m.i];tg.y=o.position.y;
    const dx=tg.x-o.position.x,dz=tg.z-o.position.z,d=Math.hypot(dx,dz);
    let st=m.speed*dt,ax=d>.001?dx/d:0,az=d>.001?dz/d:0;
    const sv=d>.001?steer(o,ax,az):{ax,az,slow:1,blocked:false};
    m.blk=sv.blocked?m.blk+dt:Math.max(0,m.blk-dt*2);
    // har någon stått i vägen länge och målet är nära räknas punkten som nådd (ingen går igenom, ingen fastnar för alltid)
    if(m.blk>4&&d<1.3){m.blk=0;if(++m.i>=m.pts.length){o.userData.walking=false;movers.splice(k,1);m.res();}continue;}
    st*=sv.slow;
    o.userData.ph+=Math.min(st,d)*2*Math.PI/1.3; // ett helt stegpar ≈ 1,3 m
    if(d>.001)o.rotation.y=Math.atan2(sv.ax,sv.az);
    if(d<=st){o.position.copy(tg);if(++m.i>=m.pts.length){o.userData.walking=false;movers.splice(k,1);m.res();}}
    else{o.position.x+=sv.ax*st;o.position.z+=sv.az*st;}
    // Mover-objekten (toalettbesökare, hissresenärer) ligger utanför agents-loopen.
    // Animera dem här så att ben, knän och armar rör sig precis som bossens.
    if(o.userData&&o.userData.legs&&o.userData.legs.length)animPerson(o,t||performance.now()/1000,false,0);
    if(o.userData&&o.userData.phone){const a1=o.userData.arms[1];a1.sh.rotation.set(-1.3,0,-.35);a1.el.rotation.x=-1.45;}
  }
}
// personal på bottenvåningen går ibland på toa (dörr på vänster vägg) och kommer tillbaka
async function toilet(id){
  const a=agents[id];if(!a||!a.seat||a.away||a.socialWith||a.seat.y!==0)return;
  const s=a.seat,dx=-BW/2+.9,door=[-BW/2+.35,-2.1];
  const out=s.rowZ<-1?[[s.x,-2.2],[dx,-2.2],door]:[[s.x+1.8,.5],[s.x+1.8,-2.2],[dx,-2.2],door];
  a.away='wc';const w=person({...a.look,standing:true});w.position.set(s.x,0,s.z);root.add(w);a.p.visible=false;a.mover=w;
  await walkTo(w,out);w.visible=false;await pause(8000+Math.random()*8000);w.visible=true;
  await walkTo(w,[...out].reverse().slice(1).concat([[s.x,s.z]]));
  root.remove(w);a.p.visible=true;a.mover=null;a.away=null;
}
// Båda står upp, vänder sig mot varandra och pratar. Varje replik visas så länge att samtalet tar ca 1-2 minuter.
async function converse(vis,visId,T,lines,alive){
  const s=T.seat,tw=person({...T.look,standing:true}),prev=T.mover;
  tw.position.set(s.x,s.y,s.z);root.add(tw);walkSet.add(tw);T.p.visible=false;T.mover=tw;
  const turn=(a,b)=>{a.rotation.y=Math.atan2(b.position.x-a.position.x,b.position.z-a.position.z);};
  talk.set(vis,{sp:false});talk.set(tw,{sp:false});
  try{
    turn(tw,vis);turn(vis,tw);await pause(900);
    for(const [who,txt] of lines){
      if(!alive())return;
      const sv=who===visId;talk.get(vis).sp=sv;talk.get(tw).sp=!sv;
      const ms=Math.max(6500,Math.min(13000,String(txt).length*85));
      say(who,txt,ms+600);await pause(ms);
    }
    talk.get(vis).sp=false;talk.get(tw).sp=false;await pause(1000);
  }finally{talk.delete(vis);talk.delete(tw);root.remove(tw);T.p.visible=true;T.mover=prev||null;}
}
// Bossen har en egen plats men reser sig ofta och går av och an vid fönstret med telefonen mot örat
function phoneCall(){
  const B=agents.boss;
  if(!B||!B.seat||B.away||B.mover||B.socialWith||visiting||socializing||phoneP)return;
  const gen=sceneGen,alive=()=>gen===sceneGen,s=B.seat,e=BW/2,bal=Math.abs(s.y-FH)<.1&&Math.random()<.65,lim=BW/2-1.4,ax=Math.max(-lim,Math.min(lim,s.x-3)),bx=Math.max(-lim,Math.min(lim,s.x+3));
  B.away='phone';
  const w=person({...B.look,standing:true});w.position.set(s.x,s.y,s.z);w.userData.phone=true;root.add(w);B.p.visible=false;B.mover=w;phoning.add(w);
  phoneP=(async()=>{
    try{
      const go=async pts=>{if(!alive())throw 0;await walkTo(w,pts,1.0);};
      if(bal){
        await go([[s.x+1.9,s.z+.3],[s.x+1.9,-1.0],[e-.9,-2.1],[e+.7,-2.1],[e+2.0,-2.7]]);
        for(let k=0;k<3&&alive();k++){w.rotation.y=.25-.5*(k%2);await pause(8000+Math.random()*6000);await go([[k%2?e+2.0:e+4.4,-2.7]]);}
        await go([[e+.7,-2.1],[e-.9,-2.1],[s.x+1.9,-1.0],[s.x+1.9,s.z+.3],[s.x,s.z]]);return;
      }
      await go([[s.x+1.9,s.z+.3],[s.x+1.9,-.5],[ax,-.5]]);
      for(let k=0;k<3&&alive();k++){
        w.rotation.y=Math.PI*(k%2?.2:-.2);
        await pause(7000+Math.random()*6000);
        await go([[k%2?ax:bx,-.5]]);
      }
      await go([[s.x+1.9,-.5],[s.x+1.9,s.z+.3],[s.x,s.z]]);
    }catch{}
    finally{phoning.delete(w);root.remove(w);if(alive()){B.p.visible=true;}B.mover=null;B.away=null;phoneP=null;}
  })();
}
// personal på bottenvåningen går till köket (inglasat, syns genom glaset): fika, diska, öppna kylskåpet, värma mat och äta vid bordet
const poseCup=(o,t)=>{const {arms,head}=o.userData;arms[0].sh.rotation.set(-.1,0,.1);arms[1].sh.rotation.set(-1.3+Math.sin(t*.8)*.1,0,-.35);arms[1].el.rotation.x=-1.45;head.rotation.set(Math.sin(t*.7)*.1,0,0);};
const poseWash=(o,t)=>{const {arms,head}=o.userData;arms[0].sh.rotation.set(-1.0+Math.sin(t*6)*.18,0,.15);arms[0].el.rotation.x=-.9;arms[1].sh.rotation.set(-1.0+Math.sin(t*6+2)*.18,0,-.15);arms[1].el.rotation.x=-.9;head.rotation.set(.35,0,0);};
const poseFridge=(o,t)=>{const {arms,head}=o.userData;arms[1].sh.rotation.set(-1.15+Math.sin(t*2)*.08,0,-.15);arms[1].el.rotation.x=-.5;arms[0].sh.rotation.set(-.1,0,.1);head.rotation.set(.12,0,0);};
const poseEat=(o,t)=>{const {arms,head}=o.userData,k=Math.max(0,Math.sin(t*.9));arms[0].sh.rotation.set(-.6,0,.15);arms[0].el.rotation.x=-.9;arms[1].sh.rotation.set(-.7-1.0*k,0,-.2);arms[1].el.rotation.x=-.9-.8*k;head.rotation.set(.22*(1-k),Math.sin(t*.5)*.1,0);};
async function kitchen(id){
  const a=agents[id],K=kit;
  if(!K||!a||!a.seat||a.away||a.socialWith||a.busy>0||a.seat.y!==0||K.users>=2)return;
  const s=a.seat,e=BW/2,dx=e-1.0,gen=sceneGen,alive=()=>gen===sceneGen,L=e+1.7;
  const inPath=s.rowZ<-1?[[s.x,-2.2],[dx,-2.2],K.door,K.inn]:[[s.x+1.8,.5],[s.x+1.8,-2.2],[dx,-2.2],K.door,K.inn];
  K.users++;a.away='kitchen';
  const w=person({...a.look,standing:true});w.position.set(s.x,0,s.z);root.add(w);a.p.visible=false;a.mover=w;
  let sp=null,seat=null,at='inn';
  const go=async pts=>{if(!alive())throw 0;await walkTo(w,pts);if(!alive())throw 0;};
  const hold=ms=>pause(ms+Math.random()*ms*.4);
  const toCounter=async spot=>{
    if(at==='inn')await go([[L,-3.0],[spot[0],-3.0],spot]);
    else if(at==='counter')await go([spot]);
    at='counter';w.rotation.y=Math.PI;
  };
  const step={
    coffee:async()=>{await toCounter(K.coffee);poses.set(w,poseCup);await hold(9000);poses.delete(w);},
    wash:async()=>{await toCounter(K.sink);poses.set(w,poseWash);await hold(14000);poses.delete(w);},
    fridge:async()=>{await toCounter(K.fridge);poses.set(w,poseFridge);K.fd.t=1;await hold(4500);K.fd.t=0;await pause(1300);poses.delete(w);},
    micro:async()=>{await toCounter(K.micro);poses.set(w,poseFridge);K.mm.color.setHex(0xfff2b0);await hold(8000);K.mm.color.setHex(0x1a1a1a);poses.delete(w);},
    eat:async()=>{
      const free=K.seats.filter(q=>!q.t);if(!free.length)return;
      seat=free[Math.floor(Math.random()*free.length)];seat.t=true;
      if(at==='inn')await go([[L,seat.z],[seat.x,seat.z]]);
      else await go([[w.position.x,-3.0],[L,-3.0],[L,seat.z],[seat.x,seat.z]]);
      at='seat';w.visible=false;
      sp=person({...a.look});sp.position.set(seat.x,0,seat.z);sp.rotation.y=seat.ry;root.add(sp);walkSet.add(sp);poses.set(sp,poseEat);
      await hold(26000);
      poses.delete(sp);root.remove(sp);sp=null;w.visible=true;seat.t=false;seat=null;
    },
  };
  const plan=pickR([['coffee'],['wash'],['fridge','eat'],['micro','eat'],['fridge','micro','eat'],['eat'],['wash','coffee']]);
  try{
    await go(inPath.concat([]));at='inn';
    for(const st of plan){await step[st]();if(!alive())return;}
    if(at==='counter')await go([[w.position.x,-3.0],[L,-3.0],K.inn]);
    else if(at==='seat')await go([[L,w.position.z],K.inn]);
    await go([...inPath].reverse().slice(1).concat([[s.x,s.z]]));
  }catch{}
  finally{
    poses.delete(w);if(sp){poses.delete(sp);root.remove(sp);}root.remove(w);
    if(seat)seat.t=false;K.fd.t=0;K.mm.color.setHex(0x1a1a1a);K.users=Math.max(0,K.users-1);
    if(alive()){a.p.visible=true;}a.mover=null;a.away=null;
  }
}
// bossen tar hissen ner och hälsar på en anställd
async function visit(id,lines){
  if(phoneP)await phoneP;
  const B=agents.boss,a=agents[id];
  if(!B||!a||!a.seat||id==='boss'||visiting||socializing)return false;
  if(a.away)return 'away';
  if(a.socialWith)return false;
  visiting=true;B.away='visit';
  const bs=B.seat,bp=person({...B.look,standing:true}),home={x:bs.x,y:bs.y,z:bs.z,r:0},s=a.seat,same=s.y===home.y,EX=ELX+.9,LX=ELX+.4;
  bp.position.set(bs.x,bs.y,bs.z);root.add(bp);B.p.visible=false;B.mover=bp;
  const side=[[bs.x+1.9,bs.z+.3],[bs.x+1.9,-1.0]]; // runt det egna skrivbordet
  let pts;
  const stand=s.facing==='s'?[s.x+1.9,Math.min(s.z+.9,Z1-.6)]:[s.x,s.z+.9]; // bredvid skrivbordet för den som sitter vänd mot kameran (aldrig utanför glaset), annars bakom
  if(same)pts=[...side,[s.x,.6],stand];
  else{
    await walkTo(bp,[...side,[EX,-1.0],[EX,-4.4],[ELX,-4.9]]);
    bp.visible=false;await pause(1300);bp.position.set(ELX,s.y,-4.9);bp.visible=true;
    pts=s.y===0?(s.rowZ<-1?[[EX,-4.4],[EX,-2.2],[s.x,-2.2],[s.x,-2.5]]:[[EX,-4.4],[EX,-2.2],[s.x+1.8,-2.2],[s.x+1.8,.8],[s.x+.8,.8]])
       :[[LX,-4.4],[LX,.6],[s.x,.6],stand];
  }
  await walkTo(bp,pts);bp.rotation.y=Math.atan2(s.x-bp.position.x,s.z-bp.position.z);
  // dialogen hämtas först när bossen är framme, så svaret speglar läget just då
  await converse(bp,'boss',a,await lines(),()=>true);
  await pause(600);
  if(same)await walkTo(bp,[...pts].reverse().slice(1).concat([[home.x,home.z]]));
  else{
    await walkTo(bp,[...pts].reverse().slice(1).concat([[ELX,-4.9]]));
    bp.visible=false;await pause(1300);bp.position.set(ELX,home.y,-4.9);bp.visible=true;
    await walkTo(bp,[[EX,-4.4],[EX,-1.0],[bs.x+1.9,-1.0],[bs.x+1.9,bs.z+.3],[home.x,home.z]]);
  }
  root.remove(bp);B.p.visible=true;B.mover=null;B.away=null;visiting=false;return true;
}
// Tomas lämnar skrivbordet ibland och går bort till bossen eller en kollega
// för att hälsa och höra hur läget är. Han använder hissen mellan våningarna.
function standFor(a){
  const s=a.seat;return s.facing==='s'?[s.x+1.9,Math.min(s.z+.9,Z1-.6)]:[s.x,s.z+.9];
}
async function socialVisit(id,lines,fromId){
  const L=fromId?agents[fromId]:Object.values(agents).find(a=>a.rank==='leader'),T=id==='boss'?agents.boss:agents[id];
  if(!L||!T||L===T||!L.seat||!T.seat)return false;
  if(socializing||visiting||L.away||L.mover||T.away||T.mover||T.socialWith||L.busy>0)return false;
  const gen=sceneGen,alive=()=>gen===sceneGen,home={x:L.seat.x,y:L.seat.y,z:L.seat.z};
  const same=T.seat.y===home.y,stand=standFor(T),EX=ELX+.9,LX=ELX+.4;
  socializing=true;L.away='social';T.socialWith=true;
  const m=person({...L.look,standing:true});m.position.set(home.x,home.y,home.z);m.rotation.y=0;
  root.add(m);L.p.visible=false;L.mover=m;
  const go=async pts=>{if(!alive())throw 0;await walkTo(m,pts);if(!alive())throw 0;};
  let out=[],back=[];
  try{
    if(same){
      out=[[home.x+1.9,home.z+.3],[home.x+1.9,.6],[T.seat.x,.6],stand];back=[...out].reverse().slice(1).concat([[home.x,home.z]]);
      await go(out);
    }else{
      await go([[home.x+1.9,home.z+.3],[home.x+1.9,-1.2],[EX,-1.0],[EX,-4.4],[ELX,-4.9]]);
      m.visible=false;await pause(900+Math.random()*500);if(!alive())return false;
      m.position.set(ELX,T.seat.y,-4.9);m.visible=true;
      if(T.seat.y===0&&T.id!=='boss'){
        out=T.seat.rowZ<-1?[[EX,-4.4],[EX,-2.2],[T.seat.x,-2.2],[T.seat.x,-2.5]]
          :[[EX,-4.4],[EX,-2.2],[T.seat.x+1.8,-2.2],[T.seat.x+1.8,.8],[T.seat.x+.8,.8]];
      }else out=[[LX,-4.4],[LX,.6],[T.seat.x,.6],stand];
      back=[...out].reverse().slice(1).concat([[ELX,-4.9]]);
      await go(out);
    }
    if(!alive())return false;
    m.rotation.y=Math.atan2(T.seat.x-m.position.x,T.seat.z-m.position.z);
    // Dialogen hämtas först när han är framme, så svaret speglar läget just då.
    await converse(m,L.id,T,await lines(),alive);
    if(!alive())return false;
    await pause(500);
    if(same)await go(back);
    else{
      await go(back);
      m.visible=false;await pause(900);if(!alive())return false;
      m.position.set(ELX,home.y,-4.9);m.visible=true;
      await go([[EX,-4.4],[EX,-1.0],[home.x+1.9,-1.2],[home.x+1.9,home.z+.3],[home.x,home.z]]);
    }
    m.rotation.y=0;return true;
  }catch{return false;}
  finally{
    if(alive()){root.remove(m);L.p.visible=true;L.mover=null;L.away=null;T.socialWith=false;socializing=false;}
  }
}
function frame(now){
  // Rendera bara när kontoret faktiskt syns (och fliken är aktiv). Sparar GPU/CPU
  // när man sitter i chatten, ekonomin eller inställningarna.
  const visible=canvas.clientWidth>0&&canvas.clientHeight>0&&!document.hidden;
  if(!visible){lastF=now;requestAnimationFrame(frame);return;}
  const t=now/1000,dt=Math.min(.05,(now-(lastF||now))/1000);lastF=now;
  wxStep(dt,t,now);moveCars(dt);moveBikes(dt);moveWalkers(dt,t);talk.forEach((st,o)=>animTalk(o,t,st.sp));phoning.forEach(o=>{if(!o.userData.walking)animPerson(o,t,false,0);});
  poses.forEach((fn,o)=>{if(!o.userData.walking){animPerson(o,t,false,0);fn(o,t);}});
  if(kit&&kit.fd){const f=kit.fd;f.k+=(f.t-f.k)*.1;f.g.rotation.y=-1.8*f.k;}
  if(cityBeacons.length){const n=Math.max(0,1-daylight(hourNow)*1.8);cityBeacons.forEach((m,i)=>{m.opacity=n*(.18+.82*(Math.sin(t*1.7+i*1.9)>0?1:0));});}
  for(let i=packets.length-1;i>=0;i--){
    const p=packets[i],u=Math.min(1,(now-p.t0)/p.dur);
    p.grp.position.copy(p.curve.getPoint(ease(u)));p.grp.children[1].rotation.y=t*3;
    if(u>=1){root.remove(p.grp);packets.splice(i,1);if(agents[p.to])agents[p.to].glow=1;p.res();}
  }
  for(let i=trails.length-1;i>=0;i--){
    const tr=trails[i],k=(now-tr.t0)/tr.life;
    if(k>=1){root.remove(tr.m);trails.splice(i,1);}else if(k>0)tr.m.material.opacity=.5*(1-k);
  }
  const W=canvas.clientWidth,H=canvas.clientHeight;
  for(const id in agents){
    const a=agents[id],b=a.busy>0;animPerson(a.p,t,b,a.phase);
    a.glow=Math.max(0,a.glow-.016);
    a.ring.material.opacity=Math.max(a.glow*.9,b?.35+Math.sin(t*6)*.15:0);a.ring.scale.setScalar(1+a.glow*.35);
    if(a.mover)v.set(a.mover.position.x,a.mover.position.y+2.4,a.mover.position.z);else{v.copy(a.anchor);v.y-=.2;}v.project(camera);
    const x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*H;
    a.tag.style.transform='translate('+x+'px,'+y+'px) translate(-50%,0)';
    a.bub.style.transform='translate('+x+'px,'+(y-34-(a.id==='boss'&&a.mover?70:0))+'px) translate(-50%,-100%)';
  }
  if(now-(frame.ls||0)>110){frame.ls=now;screens.forEach(s=>{if(s.type!=='off')drawScreen(s,t);});leds.forEach((l,i)=>l.material.color.setHex(Math.sin(t*5+i*1.7)>.2?0x3fe08f:0x1a5a38));flames.forEach(f=>{f.scale.y=.8+Math.random()*.45;f.material.color.setHSL(.06+Math.random()*.03,1,.55);});}
  renderer.render(scene,camera);requestAnimationFrame(frame);
}

/* ---------- kamera ---------- */
function fit(){
  const asp=canvas.clientWidth/Math.max(1,canvas.clientHeight);
  const halfW=((BW+AWL+AWR)*Math.cos(az)+BD*Math.sin(az))/2+2.5,halfH=((floors*FH+3)*Math.cos(el)+BD*Math.sin(el))/2+1.5;
  const h=Math.max(halfH,halfW/asp)/zoom;
  tgt.set((AWR-AWL)/2,floors*FH/2+.3,ZC);
  camera.left=-h*asp;camera.right=h*asp;camera.top=h;camera.bottom=-h;
  camera.position.set(tgt.x+Math.sin(az)*Math.cos(el)*90,tgt.y+Math.sin(el)*90,tgt.z+Math.cos(az)*Math.cos(el)*90);
  camera.lookAt(tgt);camera.updateProjectionMatrix();
}
function resize(){
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);fit();
}
function init(c,ov){
  canvas=c;overlay=ov;
  renderer=new T3.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2.4));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T3.PCFSoftShadowMap;
  // Filmatisk färg: sRGB-utdata och mjuk tone mapping ger renare färger och
  // behåller detaljerna i både fönsterljus och skuggor.
  renderer.outputEncoding=T3.sRGBEncoding;
  renderer.toneMapping=T3.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
  scene=new T3.Scene();
  bgC=cv(4,256);bgT=new T3.CanvasTexture(bgC);bgT.encoding=T3.sRGBEncoding;scene.background=bgT;
  camera=new T3.OrthographicCamera(-10,10,10,-10,.1,500);
  hemi=new T3.HemisphereLight(0xffffff,0xb4b8a6,.95);scene.add(hemi);
  // Mjukt ljus framifrån så att glasfasaden och interiören aldrig blir en svart silhuett.
  fillL=new T3.DirectionalLight(0xd7e6ff,.3);fillL.position.set(26,18,42);scene.add(fillL);
  const sun=sunL=new T3.DirectionalLight(0xfff0d6,.8);sun.position.set(-12,34,22);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:140});sun.shadow.bias=-.0006;scene.add(sun);
  dark=M(0x22252e);metal=M(0x9aa0ab,{metalness:.5,roughness:.4});wood=M(0xc08850);woodD=M(0x7a4a2a);chairM=M(0x30343e);
  white=M(0xfdfcfa);wall=M(0xfdfcfa);trim=M(0xc8c3b7);
  { // strålkastarljus på vägen: ljus nära bilen, tonar ut framåt och åt sidorna
    const c=cv(256,128),g=c.getContext('2d');
    g.beginPath();g.moveTo(0,60);g.lineTo(256,8);g.lineTo(256,120);g.lineTo(0,68);g.closePath();g.clip();
    const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(255,240,200,0.8)');gr.addColorStop(.45,'rgba(255,235,190,0.3)');gr.addColorStop(1,'rgba(255,230,180,0)');
    g.fillStyle=gr;g.fillRect(0,0,256,128);
    const tx=new T3.CanvasTexture(c);
    beamMat=new T3.MeshBasicMaterial({map:tx,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false});
    BEAM_GEO=new T3.PlaneGeometry(7,2.4);BEAM_GEO.rotateX(-Math.PI/2);
    CONE_GEO=new T3.ConeGeometry(.75,4,18,1,true);coneMat=new T3.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide});
  }
  skyC=cv(256,160);SKY=new T3.CanvasTexture(skyC);SKY.encoding=T3.sRGBEncoding;scene.fog=new T3.Fog(0xcfdbe6,105,230);
  {const c2=cv(64,64),g2=c2.getContext('2d'),r=g2.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g2.fillStyle=r;g2.fillRect(0,0,64,64);GT=new T3.CanvasTexture(c2);}
  glowMat=new T3.SpriteMaterial({map:GT,color:0xfff1c8,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false});
  tailMat=new T3.SpriteMaterial({map:GT,color:0xff2a2a,transparent:true,opacity:0,blending:T3.AdditiveBlending,depthWrite:false});
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;az-=(e.clientX-drag.x)*.005;el=Math.min(1.2,Math.max(.08,el+(e.clientY-drag.y)*.004));az=Math.min(1.5,Math.max(-.6,az));drag={x:e.clientX,y:e.clientY};fit();});
  const ray=new T3.Raycaster(),mv=new T3.Vector2();let down=null;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointerup',e=>{drag=null;
    if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;
    const r=canvas.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,camera);
    if(screenHits.length&&ray.intersectObjects(screenHits,true).length){if(onScreen)onScreen('stats');return;}
    if(onSign&&signGrp&&ray.intersectObject(signGrp,true).length){onSign();return;}if(!onPick)return;
    const list=Object.values(agents),hit=ray.intersectObjects(list.map(a=>a.p),true)[0];
    for(let o=hit&&hit.object;o;o=o.parent){const a=list.find(x=>x.p===o);if(a)return onPick(a.id);}
  });
  // pekaren visar att statistikskärmarna går att klicka på
  canvas.addEventListener('pointermove',e=>{
    if(drag)return;
    const r=canvas.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,camera);
    canvas.style.cursor=(screenHits.length&&ray.intersectObjects(screenHits,true).length)||(onSign&&signGrp&&ray.intersectObject(signGrp,true).length)?'pointer':'';
  });
  canvas.addEventListener('pointerleave',()=>{canvas.style.cursor='';});
  canvas.addEventListener('wheel',e=>{e.preventDefault();const z=zoom*(e.deltaY>0?.92:1.09);if(z<.7&&e.deltaY>0&&onZoomOut&&zoom<=.71){onZoomOut();return;}zoom=Math.min(2.6,Math.max(.7,z));fit();},{passive:false});
  addEventListener('resize',resize);
  if(window.ResizeObserver)new ResizeObserver(resize).observe(canvas);
  setInterval(()=>{if(document.hidden||!canvas.clientWidth)return;if(Math.random()<.6)phoneCall();},25000);
  setInterval(()=>{if(document.hidden||!canvas.clientWidth||Math.random()>.6)return;const c=Object.values(agents).filter(a=>a.seat&&a.seat.y===0&&a.id!=='boss'&&!a.away&&!a.busy);if(c.length)kitchen(c[Math.floor(Math.random()*c.length)].id);},12000);
  setInterval(()=>{if(document.hidden||!canvas.clientWidth)return;const c=Object.values(agents).filter(a=>a.seat&&a.seat.y===0&&a.id!=='boss'&&!a.away&&!a.busy);if(c.length&&Math.random()<.6)toilet(c[Math.floor(Math.random()*c.length)].id);},20000);
  build({tier:'kontor',staff:[]});resize();requestAnimationFrame(frame);
}
/* förhandsbild av en byggnadstyp (för startskärmen) */
function snapshot(tier,staff,label,w=640,h=440,variant=0,logo=null){
  const wxKeep=WX;WX=WXCLEAR;if(wxObj)wxObj.visible=false;
  const old=[canvas.style.width,canvas.style.height],keep={zoom,az,el},h0=hourNow;hourNow=12;
  build({tier,staff:staff||[],company:label||'nRn Company',variant,logoUrl:logo&&logo.url,logoShape:logo&&logo.shape});
  renderer.setSize(w,h,false);
  const asp=w/h,cfg=TIERS[tier];
  const halfW=((cfg.BW+AWL+AWR)*Math.cos(az)+BD*Math.sin(az))/2+3,halfH=((cfg.floors*FH+3)*Math.cos(el)+BD*Math.sin(el))/2+2,hh=Math.max(halfH,halfW/asp);
  camera.left=-hh*asp;camera.right=hh*asp;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();
  renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/jpeg',.9);
  hourNow=h0;WX=wxKeep;if(wxObj)wxObj.visible=true;Object.assign({zoom,az,el},keep);resize();return url;
}
return {init,build,send,say,busy,snapshot,resize,setHour,daylight,pick:f=>{onPick=f;},phone:()=>phoneCall(),obst:()=>OBST,dbgCars:()=>({cars,pack:!!CARPACK,keys:CARPACK?Object.keys(CARPACK):[]}),setWeather,sign:f=>{onSign=f;},zoomOut:f=>{onZoomOut=f;},preloadLogo,screen:f=>{onScreen=f;},select:id=>{selId=id;for(const k in agents)agents[k].tag.classList.toggle('on',k===id);},setStats:d=>{statsData=d;},visit,socialVisit,away:id=>agents[id]&&agents[id].away,pos:id=>{const g=agents[id],o=g&&(g.mover||g.p);return o?[+o.position.x.toFixed(2),+o.position.y.toFixed(2),+o.position.z.toFixed(2),g.away||'',g.seat?[g.seat.x,g.seat.y,g.seat.z,g.seat.facing]:null]:null;},toilet,kitchen,has:id=>!!agents[id],TIERS};
})();
