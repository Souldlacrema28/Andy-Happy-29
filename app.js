(function(){
'use strict';
var $ = function(s){return document.querySelector(s)};
var TRIGGER = 159.45;           // segundo del vídeo en el que se corta a negro (2:39)
var body = document.body;
var s1=$('#s1'), s2=$('#s2'), hero=$('#hero'), stage=$('#stage'), vid=$('#vid'), swipe=$('#swipe');
var aNote=$('#aNote'), aFlute=$('#aFlute'), aVoice=$('#aVoice');
var fired=false, unlocked=false;

/* ---------- COLLAGE ---------- */
(function buildCollage(){
  var c=$('#collage'); if(!c) return;
  var w=window.innerWidth, cols = w>1100?7 : w>800?6 : w>560?4 : 3;
  var list=[], i;
  for(i=1;i<=6;i++) list.push('u0'+i);
  var rest=[];
  for(i=1;i<=60;i++) rest.push('a'+('00'+i).slice(-3));
  for(i=rest.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=rest[i];rest[i]=rest[j];rest[j]=t;}
  list = list.concat(rest.slice(0,60));
  var colsArr=[]; for(i=0;i<cols;i++) colsArr.push([]);
  list.forEach(function(n,k){ colsArr[k%cols].push(n); });
  colsArr.forEach(function(arr){
    var col=document.createElement('div'); col.className='col';
    var all=arr.concat(arr); // duplicado para bucle continuo
    all.forEach(function(n){
      var d=document.createElement('div'); d.className='tile';
      var im=new Image(); im.src='assets/photos/'+n+'.jpg'; im.loading='lazy'; im.decoding='async'; im.alt='';
      d.appendChild(im);
      d.addEventListener('pointerdown',function(){d.classList.add('pop');setTimeout(function(){d.classList.remove('pop')},550)});
      col.appendChild(d);
    });
    c.appendChild(col);
  });
  window.addEventListener('pointermove',function(e){
    if(s1.classList.contains('playing')) return;
    var x=(e.clientX/window.innerWidth-.5)*14, y=(e.clientY/window.innerHeight-.5)*14;
    c.style.translate=(-x)+'px '+(-y)+'px';
  },{passive:true});
})();

/* ---------- NOMBRES ROTATIVOS ---------- */
(function names(){
  var sp=document.querySelectorAll('#names span'), k=0;
  setInterval(function(){
    sp[k].classList.remove('on'); k=(k+1)%sp.length; sp[k].classList.add('on');
  },2400);
})();

/* ---------- PLAY ---------- */
function prime(a){
  try{ a.muted=true; var p=a.play(); if(p&&p.then){p.then(function(){a.pause();a.currentTime=0;a.muted=false}).catch(function(){a.muted=false})} else {a.pause();a.currentTime=0;a.muted=false} }catch(e){}
}
$('#playBtn').addEventListener('click',function(){
  // desbloquear audios dentro del gesto del usuario
  prime(aNote); prime(aFlute); prime(aVoice);
  hero.classList.add('gone');
  s1.classList.add('playing');
  stage.classList.remove('hidden');
  vid.currentTime=0; vid.muted=false; vid.volume=1;
  var p=vid.play();
  if(p&&p.catch) p.catch(function(){ vid.muted=true; vid.play(); });
  requestAnimationFrame(watch);
});
var maxT=0;vid.addEventListener('timeupdate',function(){if(vid.currentTime>maxT)maxT=vid.currentTime});vid.addEventListener('seeking',function(){if(vid.currentTime>maxT+.6||vid.currentTime<maxT-.6){vid.currentTime=maxT}});
stage.addEventListener('click',function(){
  if(vid.paused){vid.play();stage.classList.remove('paused')} else {vid.pause();stage.classList.add('paused')}
});

function watch(){
  if(!fired && vid.currentTime>=TRIGGER){ fire(); }
  if(!fired || !vid.ended) requestAnimationFrame(watch);
}
vid.addEventListener('ended',function(){ if(!fired) fire(); showSwipe(); });
vid.addEventListener('timeupdate',function(){ if(!fired && vid.currentTime>=TRIGGER) fire(); });

function fire(){
  if(fired) return; fired=true;
  try{ aNote.currentTime=0; aNote.play(); }catch(e){}
  setTimeout(function(){
    try{ aFlute.currentTime=0; aFlute.volume=.85; aFlute.play(); }catch(e){}
    try{ aVoice.currentTime=0; aVoice.volume=1; aVoice.play(); }catch(e){}
  }, 900);
  setTimeout(showSwipe, 2600);
}
function showSwipe(){
  if(unlocked) return; unlocked=true;
  swipe.classList.remove('hidden');
  body.classList.remove('locked');
  stage.style.opacity=.55;
}

/* ---------- ESCENA 2 observer ---------- */
var started=false;
if('IntersectionObserver' in window){
  new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting && e.intersectionRatio>.45 && !started){ startChina(); } });
  },{threshold:[.45,.6]}).observe(s2);
} else { window.addEventListener('scroll',function(){ if(!started&&s2.getBoundingClientRect().top<innerHeight*.5) startChina(); }); }

/* ---------- PAGODA ---------- */
function buildPagoda(){
  var svg=$('#pagoda'), ns='http://www.w3.org/2000/svg', parts=[];
  function add(tag,attrs,g){var e=document.createElementNS(ns,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);(g||svg).appendChild(e);return e;}
  var R='#c0272d',R2='#8f1a1d',G='#f2c14e';
  // base
  var g0=add('g',{class:'part'});
  add('rect',{x:40,y:520,width:320,height:22,fill:'#6e1215'},g0);
  add('rect',{x:60,y:500,width:280,height:22,fill:'#9b1d22'},g0);
  parts.push(g0);
  // pisos (de abajo arriba)
  var tiers=[{y:410,w:300,h:90},{y:325,w:250,h:85},{y:245,w:205,h:80},{y:170,w:165,h:75},{y:100,w:125,h:70}];
  tiers.forEach(function(t,i){
    var g=add('g',{class:'part'});
    var x=200-t.w/2, bw=t.w*0.72, bx=200-bw/2;
    // cuerpo
    add('rect',{x:bx,y:t.y,width:bw,height:t.h-22,fill:i%2?R:'#d1342f'},g);
    add('rect',{x:bx,y:t.y,width:bw,height:6,fill:G,opacity:.9},g);
    // columnas y ventanas
    var n=3+(tiers.length-1-i>2?1:0);
    for(var k=0;k<=n;k++){ add('rect',{x:bx+k*(bw-5)/n,y:t.y+6,width:5,height:t.h-28,fill:R2},g); }
    for(var k2=0;k2<n;k2++){ add('rect',{x:bx+k2*(bw-5)/n+12,y:t.y+22,width:(bw-5)/n-19,height:t.h-52,rx:3,fill:'#2a0a10',opacity:.85},g); }
    // alero curvado
    var rw=t.w+30, rx=200-rw/2, ry=t.y+t.h-26;
    add('path',{d:'M'+(rx-8)+' '+(ry+14)+' Q'+(rx+rw*.18)+' '+(ry+10)+' '+(rx+rw*.28)+' '+(ry-4)+' L'+(rx+rw*.72)+' '+(ry-4)+' Q'+(rx+rw*.82)+' '+(ry+10)+' '+(rx+rw+8)+' '+(ry+14)+' Q'+(rx+rw*.5)+' '+(ry+30)+' '+(rx-8)+' '+(ry+14)+' Z',fill:'#7d1114'},g);
    add('path',{d:'M'+(rx-8)+' '+(ry+14)+' Q'+(rx+rw*.5)+' '+(ry+30)+' '+(rx+rw+8)+' '+(ry+14),fill:'none',stroke:G,'stroke-width':3},g);
    parts.push(g);
  });
  // remate
  var gt=add('g',{class:'part'});
  add('path',{d:'M200 100 L200 40',stroke:G,'stroke-width':4},gt);
  add('circle',{cx:200,cy:70,r:8,fill:G},gt);
  add('circle',{cx:200,cy:52,r:6,fill:G},gt);
  add('path',{d:'M200 34 L190 52 L210 52 Z',fill:G},gt);
  parts.push(gt);
  parts.forEach(function(p,i){ p.style.animationDelay=(1.0+i*0.55)+'s'; });
  return parts.length;
}

/* ---------- FAROLILLOS ---------- */
function buildLanterns(){
  var box=$('#lanterns');
  var n=innerWidth>700?10:7;
  for(var i=0;i<n;i++){
    var l=document.createElement('div'); l.className='lan';
    var left=(i+.5)/n*100 + (Math.random()*4-2);
    var sz=24+Math.random()*20, len=30+Math.random()*(innerHeight*.12);
    l.style.cssText='left:'+left+'%;--sz:'+sz+'px;--len:'+len+'px;animation-delay:'+(-Math.random()*3)+'s;animation-duration:'+(2.8+Math.random()*1.8)+'s;transition-delay:'+(2.5+i*.12)+'s';
    l.innerHTML='<b></b><em></em>';
    box.appendChild(l);
  }
}

/* ---------- PÉTALOS ---------- */
var petalsOn=false;
function petals(){
  var cv=$('#petals'), cx=cv.getContext('2d'), W,H,dpr=Math.min(devicePixelRatio||1,2), arr=[];
  function rs(){W=cv.width=s2.clientWidth*dpr;H=cv.height=s2.clientHeight*dpr}
  rs(); addEventListener('resize',rs);
  for(var i=0;i<42;i++) arr.push({x:Math.random()*W,y:Math.random()*H,s:(5+Math.random()*9)*dpr,v:(.4+Math.random()*.9)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.05,sw:Math.random()*6,c:Math.random()>.5?'#ffd3dc':'#ff9fb3'});
  (function loop(){
    cx.clearRect(0,0,W,H);
    arr.forEach(function(p){
      p.y+=p.v; p.sw+=.02; p.x+=Math.sin(p.sw)*.7*dpr; p.r+=p.vr;
      if(p.y>H+20){p.y=-20;p.x=Math.random()*W}
      cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.globalAlpha=.85;
      cx.beginPath();cx.ellipse(0,0,p.s,p.s*.55,0,0,6.283);cx.fill();cx.restore();
    });
    requestAnimationFrame(loop);
  })();
}

/* ---------- INICIO CHINA ---------- */
function startChina(){
  if(started) return; started=true;
  buildLanterns(); var n=buildPagoda(); petals();
  s2.classList.add('go');
  setTimeout(function(){ s2.classList.add('lan-on'); },1200);
  // temblores y "boom" al caer cada piso
  for(var i=0;i<n;i++){ (function(i){ setTimeout(function(){ shake(); if(navigator.vibrate) navigator.vibrate(25); },(1.0+i*0.55)*1000+380); })(i); }
  var end=(1.0+n*0.55)*1000+700;
  setTimeout(function(){ burst(innerWidth/2,innerHeight*.45,90,['#ffd45a','#ff4d4d','#fff']); },end);
  setTimeout(function(){ $('#ctaA').classList.remove('hidden'); },end+700);
}
function shake(){ var st=$('#stepA'); st.classList.remove('shaking'); void st.offsetWidth; st.classList.add('shaking'); }

/* ---------- PULSA AQUÍ -> REGALO ---------- */
$('#pressBtn').addEventListener('click',function(){
  burst(innerWidth/2,innerHeight*.8,50,['#ffd45a','#ff4d4d']); s2.classList.add('night');
  var a=$('#stepA'); a.style.opacity=0; a.style.transform='scale(1.1)'; a.style.pointerEvents='none';
  setTimeout(function(){ a.classList.add('hidden'); },900);
  setTimeout(function(){ var b=$('#stepB'); b.classList.remove('hidden'); b.style.opacity=0; void b.offsetWidth; b.style.opacity=1; },700);
});

/* ---------- ABRIR ---------- */
$('#openBtn').addEventListener('click',function(){
  var b=$('#stepB'); if(b.classList.contains('open')) return;
  b.classList.add('open');
  shake(); if(navigator.vibrate) navigator.vibrate([40,40,120]);
  burst(innerWidth/2,innerHeight*.5,220,['#ffd45a','#ff4d4d','#ffffff','#ff9fb3','#f2c14e']);
  setTimeout(function(){ burst(innerWidth*.2,innerHeight*.4,80,null); burst(innerWidth*.8,innerHeight*.4,80,null); },350);
  setTimeout(function(){ burst(innerWidth/2,innerHeight*.3,120,null); },900);
  try{ aVoice.currentTime=0; aVoice.play(); }catch(e){}
});
$('#again').addEventListener('click',function(){
  try{ aVoice.currentTime=0; aVoice.play(); }catch(e){}
  burst(innerWidth/2,innerHeight*.5,60,['#ff4d4d','#ffd45a']);
});

/* ---------- CONFETI ---------- */
var cv=$('#confetti'), cx=cv.getContext('2d'), parts=[], running=false, dpr=Math.min(devicePixelRatio||1,2);
function rsz(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}
rsz(); addEventListener('resize',rsz);
function burst(x,y,n,cols){
  cols=cols||['#ffd45a','#ff4d4d','#ffffff','#ff9fb3','#f2c14e','#5d8fc9'];
  for(var i=0;i<n;i++){
    var a=Math.random()*6.283, v=(4+Math.random()*10)*dpr;
    parts.push({x:x*dpr,y:y*dpr,vx:Math.cos(a)*v,vy:Math.sin(a)*v-5*dpr,w:(5+Math.random()*7)*dpr,h:(3+Math.random()*5)*dpr,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[i%cols.length],l:1});
  }
  if(!running){running=true;requestAnimationFrame(tick)}
}
function tick(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts=parts.filter(function(p){return p.l>0&&p.y<cv.height+40});
  parts.forEach(function(p){
    p.vy+=.28*dpr; p.vx*=.992; p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; p.l-=.006;
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.globalAlpha=Math.max(p.l,0);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore();
  });
  if(parts.length) requestAnimationFrame(tick); else running=false;
}
})();
