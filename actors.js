import { atlas, box, line, oval, poly } from './scene-art.js';
import { drawDragonCloud, drawDragonWarning } from './dragon-art.js';

const beasts=['creeper','zombie','spider','slime','skeleton','drowned','guardian','elder_guardian','witch','enderman','ghast','magma_cube','blaze','wither_skeleton','ghost','pumpkin_guard','shulker'];
const family=['kirill','maxim','mom','dad','pasha'];
const lamp='#ffe9ad';

function note(c,x,y,size,color) {
  c.save();c.translate(x,y);c.scale(size,size);c.rotate(.14);
  line(c,color,.11,[0,0,0,-.75,.47,-.85,.47,-.2]);
  oval(c,-.11,0,.19,.135,color);oval(c,.36,-.20,.19,.135,color);c.restore();
}
function sparkle(c,x,y,r,col) {
  poly(c,col,[x,y-r,x+r*.22,y-r*.19,x+r*.76,y,x+r*.19,y+r*.18,x,y+r,x-r*.2,y+r*.17,x-r*.75,y,x-r*.2,y-r*.2]);
}
function shadow(c,x,y,w,h){oval(c,x,y,w,h,'rgba(12,19,30,.32)');}

function gem(c,p,s,o) {
  const u=p.unit*.13,turn=s.time*3.6+o.id*1.36,cy=p.y-u*(1.95+.16*Math.sin(turn));
  shadow(c,p.x,p.y,u*.49,u*.13);
  c.save();c.translate(p.x,cy);c.scale(u*(.77+.18*Math.cos(turn)),u);
  poly(c,'#184c44',[-.64,-.59,-.17,-1,.42,-.77,.71,-.44,.58,.52,.02,1.06,-.58,.57]);
  poly(c,'#a9ffe2',[-.55,-.51,-.15,-.87,.39,-.69,.58,-.43,.21,-.27,-.29,-.28]);
  poly(c,'#5ff2a7',[-.29,-.28,.21,-.27,.20,.51,-.01,.91,-.28,.45]);
  poly(c,'#31cb95',[-.58,-.45,-.29,-.28,-.28,.45,-.01,.91,-.5,.48]);
  poly(c,'#139775',[.21,-.27,.58,-.43,.46,.45,-.01,.91,.20,.51]);
  if(Math.cos(turn)>.1)sparkle(c,-.31,-.51,.28,'#f7fff0');c.restore();
}

function fret(c,y,w,dir,ink) {
  for(const s of [-1,1])line(c,ink,.026,[-w/2+s*.014,y-dir*.06,s*.014,y+dir*.06,w/2+s*.014,y-dir*.06]);
}
function arch(c,t,type) {
  const leg=.10,clear=.48;
  const ice=type==='water_slide',circus=type==='carousel', metal=type==='shelf'||type==='portcullis';
  for(const side of [-1,1]){
    const x=side*.42;
    box(c,x,0,.16,.072,.025,t.side,t.top,t.side);
    box(c,x,-.03,leg,clear+.22,.035,metal?t.top:t.wall,t.top,t.side);
    for(const h of [.18,.39])box(c,x,-h,leg+.018,.034,.026,ice?'#a0f3ed':t.edge,t.top,t.side);
  }
  box(c,0,-clear,.97,.25,.045,t.wall,t.top,t.side);
  if(circus) {
    poly(c,'#d65176',[-.52,-.69,0,-.91,.51,-.69]);
    for(const x of [-.41,-.15,.13,.36])poly(c,'#ffe2a6',[x,-.69,x+.105,-.69,x*.35,-.83]);
    for(let i=0;i<7;i++)oval(c,(i-3)*.135,-.5,.054,.04,i%2?'#ffba72':'#fff1cf');
  }else if(ice) {
    line(c,'#3fc6db',.107,[-.48,-.67,-.28,-.77,.05,-.72,.28,-.66,.49,-.72]);
    line(c,'#b3fff3',.021,[-.48,-.70,-.28,-.80,.05,-.75,.28,-.69,.49,-.75]);
  }else if(type==='shelf'){
    for(let i=0;i<4;i++)box(c,(i-1.5)*.211,-.70,.17,.14+(i%2)*.04,.023,'#a87c52','#e0b67c','#775636');
  }else if(type==='portcullis'){
    for(let i=0;i<6;i++)poly(c,'#c1b7b3',[-.40+i*.15,-.5,-.34+i*.15,-.5,-.37+i*.15,-.42]);
  }else {
    for(let i=0;i<5;i++)box(c,(i-2)*.19,-.70,.17,.065+(i%2)*.06,.02,t.top,t.edge,t.side);
  }
  box(c,0,-clear+.007,.28,.19,.014,'#285451','#64d9ce','#263f47');
  fret(c,-clear-.086,.14,1,'#baffee');
}

function barrier(c,t,type,time) {
  if(type==='fireball'){
    const phase=Math.sin(time*15);
    c.save();c.translate(0,-.25);
    poly(c,'#ef4b23',[-.18,.10,-.21,-.22,-.03,-.19,.08,-.4,.18,-.16,.25,-.27,.23,.06,.10,.20,-.10,.20]);
    oval(c,0,.03,.15,.13,'#ff9b27');oval(c,-.035,.04,.09+phase*.009,.08,'#fff2a0');c.restore();return;
  }
  if(type==='wave'||type==='lava') {
    const water=type==='wave',a=water?'#24899f':'#cc4827',b=water?'#8df8fa':'#ffb947';
    poly(c,a,[-.48,-.04,-.44,-.18,-.29,-.24,-.13,-.17,.03,-.28,.19,-.25,.33,-.17,.47,-.21,.47,-.02,.31,.016,-.40,.016]);
    for(let i=0;i<5;i++)line(c,b,.024,[-.42+i*.18,-.13,-.36+i*.18,-.19+.025*Math.sin(time*6+i),-.32+i*.18,-.17]);
  }else if(type==='sofa'){
    box(c,0,-.035,.80,.28,.055,'#bc6743','#ef9963','#805044');
    box(c,0,-.068,.72,.09,.035,'#df8654','#f6ad6a','#ad6846');
    for(const side of [-1,1])box(c,side*.40,0,.105,.22,.034,'#b56742','#fab67c','#8b503f');
  }else if(type==='pumpkins'){
    for(const [x,y,k] of [[-.28,-.02,.88],[.25,-.02,1],[0,.01,.96]]){
      oval(c,x,y-.13*k,.168*k,.142*k,'#bc5526');oval(c,x-.014,y-.14*k,.105*k,.136*k,'#f2933b');
      box(c,x,y-.26*k,.045,.052,.015,'#626d43','#9b9563','#514c3e');
      poly(c,'#ffe7a6',[x-.092,y-.14,x-.056,y-.19,x-.017,y-.14]);poly(c,'#ffe7a6',[x+.015,y-.14,x+.052,y-.19,x+.089,y-.14]);
    }
  }else if(type==='crystal'){
    for(let i=0;i<5;i++){const x=(i-2)*.14,h=.18+(i%3)*.095;poly(c,'#a475c9',[x-.088,-.02,x-.077,-h*.73,x-.006,-h,x+.087,-h*.72,x+.079,-.016]);poly(c,'#e3a8ff',[x-.006,-h,x+.087,-h*.72,x+.079,-.016,x+.013,-.032]);}
  }else if(type==='rubble'){
    box(c,-.22,0,.41,.17,.055,t.wall,t.top,t.side);box(c,.21,-.02,.42,.25,.055,t.wall,t.top,t.side);box(c,-.06,-.145,.29,.16,.04,t.top,t.edge,t.side);
    line(c,'#4d6051',.019,[.10,-.24,.16,-.19,.13,-.14,.17,-.13]);
  }else{
    box(c,0,-.03,.87,.25,.056,t.wall,t.top,t.side);
    for(let i=0;i<5;i++)poly(c,i%2?'#ffc98b':'#f1949d',[-.42+i*.166,-.26,-.34+i*.166,-.26,-.41+i*.166,-.15,-.49+i*.166,-.15]);
  }
  // Gold up markers distinguish low obstacles from upright gate lintels.
  box(c,0,-.015,.20,.14,.014,'#865d30','#e4ac62','#675335');
  fret(c,-.085,.11,-1,'#fff0b0');
}

function block(c,t,type,time) {
  if(type==='cauldron'||type==='typhoon'){
    const pool=type==='typhoon',pot=pool?'#1c9cb6':'#4d5261';
    box(c,0,0,.68,.49,.07,pot,pool?'#79e8eb':'#a1a5a4',pool?'#267886':'#373d4b');
    oval(c,0,-.50,.4,.13,pool?'#1b677e':'#3e4550');oval(c,0,-.52,.355,.098,pool?'#74eee5':'#8cda57');
    for(let i=0;i<3;i++){const pulse=(time*.7+i/3)%1;oval(c,Math.sin(i*8+time)*.17,-.53-pulse*.20,.04*(1-pulse)+.01,.04*(1-pulse)+.01,pool?'#e3fffb':'#c5ffc0');}
  }else if(type==='claw_machine'){
    box(c,0,0,.63,.17,.075,'#b45c8b','#f7a1c2','#7d4975');
    box(c,0,-.17,.56,.46,.065,'#97dddd','#abf2f2','#5a9fa9');
    for(let i=0;i<3;i++)oval(c,(i-1)*.13,-.22+(i%2)*.03,.08,.065,['#fb9993','#a396d3','#f8cd72'][i]);
    line(c,'#46677d',.018,[.02,-.61,.02,-.43,-.045,-.36,.02,-.37,.085,-.36,.02,-.43]);
    box(c,0,-.64,.67,.17,.075,'#f38aa3','#ffd4b1','#ad5886');sparkle(c,0,-.725,.064,lamp);
  }else{
    const wood=type==='wardrobe';
    box(c,0,0,.64,.73,.09,wood?'#ab8055':t.wall,wood?'#d8ab77':t.top,wood?'#856345':t.side);
    if(wood){line(c,'#6a5748',.018,[0,-.71,0,-.018]);for(const x of [-.051,.051])oval(c,x,-.37,.012,.029,lamp);}
    else if(type==='totem'){
      for(const side of [-1,1])box(c,side*.17,-.38,.17,.12,.01,'#9ffcaa','#d7ffd0','#659e70');
      poly(c,'#304e44',[-.084,-.32,.09,-.32,.13,-.20,-.12,-.20]);
      box(c,0,-.73,.72,.095,.06,t.top,t.edge,t.side);
    }else{
      box(c,-.23,0,.17,.89,.04,t.side,t.top,t.wall);box(c,.2,0,.13,.95,.04,t.wall,t.top,t.side);
      line(c,t.trim,.018,[-.12,-.06,-.08,-.15,-.02,-.16,.02,-.26]);
    }
  }
}
function monster(c,s,o) {
  const sheet=atlas('runner-monsters'),row=beasts.indexOf(o.type);
  if(!sheet || row<0){box(c,0,0,.50,.6,.08,'#526e56','#90c995','#384839');return;}
  const t=s.time+(o.id||0)*.37,dance=o.dance>0,beat=Math.sin(t*7),stunned=o.stun>0;
  const pose=stunned?0:Math.floor(t*(dance?9:6))%8;
  const w=(o.type==='spider'||o.type==='elder_guardian'?1.29:1.18);
  c.save();
  if(dance){c.translate(beat*.12,-Math.abs(beat)*.11);c.rotate(beat*.16);}
  else if(stunned){c.rotate(.14);c.globalAlpha*=.74;}
  else if(o.flee>0){c.translate((o.lane<=0?-1:1)*(.32+.17*beat),-.04*Math.abs(beat));c.scale(-.8,.82);}
  const floater=['ghast','blaze','ghost'].includes(o.type);
  const bob=floater?.09+.04*Math.sin(t*3):o.type==='magma_cube'?.15*Math.abs(Math.sin(t*4)):0;
  c.drawImage(sheet,(pose+(dance?8:0))*120,row*120,120,120,-w/2,-w-bob,w,w);
  if(dance){note(c,.25,-.82-.10*Math.sin(t*5),.20,'#a9ffe9');note(c,-.28,-.65+.06*beat,.15,'#ffd3f2');}
  if(stunned)sparkle(c,.21,-.80,.105,'#fff2a1');
  c.restore();
}

export function trackObject(c,v,s,t,o) {
  const dz=o.z-s.distance;
  const p=v.project(dz,o.lane);
  if(o.hit){
    if(o.kind==='gem' && dz<0 && dz>-5){
      for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,scale=-dz*.044*p.unit;
        sparkle(c,p.x+Math.cos(a)*scale,p.y-p.unit*.32+Math.sin(a)*scale,p.unit*.046*(1+dz/5),'#d4ffe6');}
    }return;
  }
  if(o.kind==='gem'){gem(c,p,s,o);return;}
  if(o.kind==='breath'){
    if(!o.active)drawDragonWarning(c,p.x,p.y,p.lane*.43,p.unit*.115,Math.max(0,1-dz/50),s.time);
    else drawDragonCloud(c,p.x,p.y-p.unit*.13,p.lane*.41,p.unit*.17,Math.min(2,Math.max(0,(14-dz)/14)),3,o.id);
    return;
  }
  shadow(c,p.x,p.y+.012*p.unit,p.lane*(o.kind==='monster'?.27:.445),p.unit*.071);
  c.save();c.translate(p.x,p.y);
  c.lineJoin='round';c.lineCap='round';
  c.scale(o.kind==='monster'?p.unit:p.lane,p.unit);
  if(o.kind==='monster')monster(c,s,o);
  if(o.kind==='barrier')barrier(c,t,o.type,s.time);
  if(o.kind==='arch')arch(c,t,o.type);
  if(o.kind==='block')block(c,t,o.type,s.time);
  c.restore();
}

function guitar(c,time,carried=false) {
  // The front view makes Pasha's picking hand and the guitar strings visible during the solo.
  c.save();c.translate(.026,-.39);c.rotate(-.34);
  line(c,'#402936',.075,[.025,-.025,.39,-.065]);
  line(c,'#bc8650',.046,[.025,-.032,.39,-.073]);
  for(let i=0;i<3;i++)line(c,'#b4b3bc',.007,[.12+i*.07,-.056,.126+i*.07,-.004]);
  poly(c,'#69412c',[.315,-.10,.424,-.14,.46,-.125,.46,-.087,.344,-.044]);
  for(let i=0;i<3;i++)oval(c,.36+i*.032,-.121-i*.011,.014,.014,'#b7bfaf');
  c.beginPath();c.moveTo(-.08,-.109);c.bezierCurveTo(-.01,-.151,.044,-.105,.089,-.093);c.bezierCurveTo(.17,-.115,.186,-.026,.113,.013);
  c.bezierCurveTo(.09,.041,.145,.093,.062,.135);c.bezierCurveTo(-.049,.189,-.153,.122,-.15,.042);c.bezierCurveTo(-.152,-.028,-.142,-.087,-.08,-.109);c.closePath();
  c.fillStyle='#e59644';c.fill();c.strokeStyle='#623c30';c.lineWidth=.02;c.stroke();
  oval(c,.027,-.012,.049,.049,'#f8d388');oval(c,.027,-.012,.033,.033,'#503b34');
  for(const y of [-.01,.003,.016])line(c,'#f5dfab',.004,[-.075,.02+y,.39,-.061+y]);
  if(!carried){
    const strum=Math.sin(time*18);line(c,'#9f682e',.084,[-.22,-.148,-.14,-.032,-.045,.006+strum*.060]);
    oval(c,-.042,.01+strum*.06,.041,.032,'#f1bd94');oval(c,.268,-.057,.045,.032,'#f1bd94');
  }
  c.restore();
}
function energy(c,s) {
  const time=s.time;
  if(s.heroId==='kirill'){
    for(let i=0;i<7;i++){const a=(time*2.8+i/7)%1,x=(i%2?1:-1)*(.20+i%3*.06);line(c,'#bbfaffbd',.010,[x,-.22+a*.33,x*1.22,.03+a*.37]);}
  }else if(s.heroId==='dad'||s.heroId==='pasha'){
    for(let i=0;i<2;i++){const a=(time*1.35+i/2)%1;c.save();c.globalAlpha*=1-a;c.beginPath();c.ellipse(0,-.28-a*.18,.25+a*.72,.09+a*.20,0,Math.PI*1.04,Math.PI*1.96);c.strokeStyle=s.heroId==='dad'?'#ffd49d':'#80ffda';c.lineWidth=.021;c.stroke();c.restore();}
  }else if(s.heroId==='maxim'){
    const phase=Math.abs(Math.sin(time*5));
    line(c,'#ffbc75',.036,[-.2,-.63,-.37,-.52,-.22,-.47]);
    line(c,'#ffe9b2',.023,[.20,-.54,.33+phase*.13,-.57,.23+phase*.13,-.48]);
  }else{
    for(let i=0;i<5;i++){const a=i*1.6+time*2;sparkle(c,Math.cos(a)*.35,-.5+Math.sin(a)*.44,.025,'#ead4ff');}
  }
}

// Eight anatomical rows relate the original rear views to the separately illustrated
// slide. Both textures meet on the same moving joints, so the head moves as one piece.
const slideFrames=new Map();
const bodyMarks=[
  {center:79,top:28,neck:101,hem:176,head:160,lowNeck:85},
  {center:73,top:7,neck:75,hem:164,head:155,lowNeck:77},
  {center:71,top:9,neck:78,hem:165,head:158,lowNeck:81},
  {center:67,top:8,neck:83,hem:157,head:154,lowNeck:82},
  {center:62,top:5,neck:75,hem:179,head:154,lowNeck:79},
];
const mix=(a,b,t)=>a+(b-a)*t;
function curve(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function slidePhase(remaining) {
  const age=.82-remaining;
  return {depth:curve(age/.165)*curve(remaining/.205),age};
}
function crouchY(y){
  if(y<85)return -140+(y-20)*.92;
  if(y<150)return -80.2+(y-85)*.54;
  if(y<205)return -45.1+(y-150)*.68;
  return -7.7+(y-205)*.34;
}
function bodyGrid(idx,depth) {
  const r=bodyMarks[idx];
  const startEdges=[0,r.center-47,r.center-24,r.center,r.center+23,r.center+46,150];
  const ys=[0,r.top,r.neck,(r.neck+r.hem)*.5,r.hem,203,239,250];
  const hx=r.head,topEdges=[0,hx-47,hx-25,hx,hx+25,hx+47,256];
  const endEdges=[topEdges,topEdges,topEdges,[0,64,107,140,165,192,256],[0,47,86,124,159,197,256],[0,45,73,107,137,193,256],[0,41,69,95,144,189,256],[0,41,69,95,144,189,256]];
  const n=r.lowNeck;
  const endRows=[[0,0,0,0,0,0,0],[20,20,20,20,20,20,20],[n,n,n,n,n,n,n],[111,117,112,110,117,122,122],
    [145,145,151,151,155,193,193],[195,195,191,178,184,213,216],[241,241,241,216,202,235,241],[244,244,244,244,244,244,244]];
  const grid=[];
  for(let row=0;row<ys.length;row++)for(let col=0;col<startEdges.length;col++){
    const a=[startEdges[col],ys[row]],b=[endEdges[row][col],endRows[row][col]];
    const shift=Math.sin(depth*Math.PI);
    const anchor=[mix(a[0]-75,(b[0]-132)*.94,depth)+3*shift*(1-row/8),mix(a[1]-250,crouchY(b[1]),depth)-2*shift*(1-row/8)];
    grid.push({a,b,anchor});
  }
  return grid;
}

// Map a source triangle affinely to three posed vertices. Each small clipped draw
// samples the original illustration, retaining the folds of the coat and the shoe soles.
function skinTriangle(c,img,offsetX,offsetY,key,tri) {
  const s0=tri[0][key],s1=tri[1][key],s2=tri[2][key];
  const [a,b,d]=tri.map(v=>v.anchor);
  const x1=s1[0]-s0[0],y1=s1[1]-s0[1],x2=s2[0]-s0[0],y2=s2[1]-s0[1];
  const det=x1*y2-x2*y1;if(Math.abs(det)<.01)return;
  const xx=((b[0]-a[0])*y2-(d[0]-a[0])*y1)/det,xy=(x1*(d[0]-a[0])-x2*(b[0]-a[0]))/det;
  const yx=((b[1]-a[1])*y2-(d[1]-a[1])*y1)/det,yy=(x1*(d[1]-a[1])-x2*(b[1]-a[1]))/det;
  c.save();c.beginPath();
  const center=[(a[0]+b[0]+d[0])/3,(a[1]+b[1]+d[1])/3];
  // A small overlap covers antialias seams between two texture fragments.
  for(const [i,v] of [a,b,d].entries()){
    const dx=v[0]-center[0],dy=v[1]-center[1],len=Math.hypot(dx,dy)||1;
    const x=v[0]+.60*dx/len,y=v[1]+.60*dy/len;
    if(i===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.closePath();c.clip();c.transform(xx,yx,xy,yy,a[0]-s0[0]*xx-s0[1]*xy,a[1]-s0[0]*yx-s0[1]*yy);
  const lx=Math.max(0,Math.floor(Math.min(s0[0],s1[0],s2[0]))-2),ly=Math.max(0,Math.floor(Math.min(s0[1],s1[1],s2[1]))-2);
  const w=Math.min(key==='a'?150:256,Math.ceil(Math.max(s0[0],s1[0],s2[0]))+2)-lx;
  const h=Math.min(key==='a'?250:244,Math.ceil(Math.max(s0[1],s1[1],s2[1]))+2)-ly;
  if(w>0&&h>0)c.drawImage(img,offsetX+lx,offsetY+ly,w,h,lx,ly,w,h);
  c.restore();
}

function poseFrame(index,frame,solo=false) {
  const k=(solo?6:index)*32+frame,known=slideFrames.get(k);if(known)return known;
  const standing=atlas('maze-figures'),crouch=atlas('runner-slide');if(!standing||!crouch)return null;
  const frameCount=16,p=frame/frameCount,grid=bodyGrid(index,p);
  const layers=[];
  for(const [sheet,key,ox,oy] of [[standing,'a',150*index,solo?0:250],[crouch,'b',256*index,0]]){
    const layer=document.createElement('canvas');layer.width=270;layer.height=274;
    const g=layer.getContext('2d');g.translate(135,254);
    for(let row=0;row<7;row++)for(let col=0;col<6;col++){
      const i=row*7+col,j=i+7;
      skinTriangle(g,sheet,ox,oy,key,[grid[i],grid[i+1],grid[j+1]]);
      skinTriangle(g,sheet,ox,oy,key,[grid[i],grid[j+1],grid[j]]);
    }
    layers.push(layer);
  }
  const out=document.createElement('canvas');out.width=270;out.height=274;const g=out.getContext('2d');
  const blend=curve((p-.43)/.20);
  g.globalAlpha=1-blend;g.drawImage(layers[0],0,0);g.globalCompositeOperation='lighter';g.globalAlpha=blend;g.drawImage(layers[1],0,0);
  slideFrames.set(k,out);return out;
}

function drawSlide(c,s,idx,slide,solo) {
  const art=poseFrame(idx,Math.round(slide.depth*16),solo);if(!art)return false;
  const depth=slide.depth,age=slide.age;
  c.save();c.rotate(depth*.014*Math.sin(age*9));c.drawImage(art,-135/250,-254/250,270/250,274/250);
  if(solo){
    // In the slide Pasha turns away and swings the instrument onto his shoulder strap.
    c.save();c.translate(-.075*depth,-.39+.084*depth);c.rotate(depth*(-.36+Math.sin(s.time*14)*.035));
    const k=1-depth*.34;c.scale(k,k);c.translate(0,.39);guitar(c,s.time,depth>.32);c.restore();
  }
  c.restore();return true;
}

export function runner(c,v,s) {
  const p=v.project(0,s.player.x),a=s.player.jump,sliding=s.player.slide>0, active=s.powerTime>0, solo=active&&s.heroId==='pasha';
  const h=p.unit*1.04, lift=a*h*.77, stride=Math.sin(s.distance*(active&&s.heroId==='kirill'?.94:.82)), lean=(s.player.lane-s.player.x);
  shadow(c,p.x,p.y-h*.015,h*(.245-a*.088),h*(.068-a*.022));
  c.save();c.translate(p.x,p.y-lift+h*.022);c.scale(h,h);c.lineJoin='round';c.lineCap='round';
  if(active)energy(c,s);
  if(s.invulnerable>.01)c.globalAlpha=.68+.32*(.5+.5*Math.sin(s.time*28));
  if(s.heroId==='mom'&&active)c.globalAlpha*=.38+.12*Math.sin(s.time*6);
  const sheet=atlas('maze-figures'),idx=family.indexOf(s.heroId);
  c.rotate(lean*.24+((a||sliding)?0:stride*.021));
  atlas('runner-slide');
  const slide=sliding?slidePhase(s.player.slide):null;
  c.translate(0,-(a||sliding?0:Math.abs(stride)*.021));
  if(sheet&&idx>=0){
    if(!(slide && drawSlide(c,s,idx,slide,solo))){
    c.save();
    const w=.6,sw=150,sh=250,sx=sw*idx,sy=solo?0:sh,split=.73;
    // Keep the head and coat intact; each trouser leg bends independently under its own hip.
    for(let side=0;side<2;side++){
      const swing=stride*(side?1:-1)*(a||sliding?.18:1);
      c.save();c.translate((side-.5)*w*.5,-(1-split));c.rotate(swing*.115+lean*.02);
      c.drawImage(sheet,sx+sw*side/2,sy+sh*split,sw/2,sh*(1-split),-w/4,-.002,w/2,(1-split)*(1-.28*Math.max(0,swing)));c.restore();
    }
    c.drawImage(sheet,sx,sy,sw,sh*split,-w/2,-1,w,split+.004);
    if(solo)guitar(c,s.time);c.restore();
    }
  } else {box(c,0,0,.31,.5,.045,'#147f87','#50c3be','#275258');box(c,0,-.45,.26,.24,.045,'#805638','#ab7b52','#553c33');}
  if(solo){
    for(let i=0;i<4;i++){const age=(s.time*.8+i*.25)%1;note(c,(i%2?1:-1)*(.24+age*.27),-.43-age*.72,.1+age*.045,i%2?'#9fffe4':'#ffd1ec');}
  }
  c.restore();
}

export function pursuer(c,v,s) {
  const actor=s.pursuer;
  if(!actor || actor.pressure<.20)return;
  const force=(actor.pressure-.2)/.8,sz=Math.min(v.height*.39,v.width*.42);
  const side=s.player.x<-.45?1:-1;
  const at=v.project(0,s.player.x);
  const x=Math.max(sz*.26,Math.min(v.width-sz*.26,at.x+side*v.lane*.72));
  c.save();c.translate(x,v.height+sz*(.86-.60*force));c.scale(sz,sz);
  monster(c,s,{id:1,type:actor.type,lane:side,dance:actor.dance,stun:actor.stun,flee:actor.flee});
  c.restore();
}
