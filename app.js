(function(){
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduce) { var a = document.getElementById('sheen-anim'); if (a) a.remove(); }
var cv = document.getElementById('road'), ctx = cv.getContext('2d');
var W=0,H=0,dpr=1,off=0,last=0,px=0,tpx=0,running=true,lights=[];
function size(){
dpr = Math.min(2, window.devicePixelRatio || 1);
var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
ctx.setTransform(dpr,0,0,dpr,0,0);
lights = [];
for (var i=0;i<70;i++) lights.push({x:Math.random(), y:Math.random(), a:.25+Math.random()*.6, p:Math.random()*6.28, w:Math.random()<.25});
}
function vp(){ var m = W < 900; return { x:(m ? W*.55 : W*.7) + px, y: m ? H*.5 : H*.44 }; }
function P(v,d,lat){ var s = 1/d; return [v.x + lat*s*W*(W<900?.9:.55), v.y + (H - v.y)*s, s]; }
function quad(v,d0,d1,l0,l1,fill){
var a=P(v,d0,l0), b=P(v,d0,l1), c=P(v,d1,l1), e=P(v,d1,l0);
ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(e[0],e[1]); ctx.closePath(); ctx.fill();
}
function draw(t){
var v = vp();
var sky = ctx.createLinearGradient(0,0,0,v.y);
sky.addColorStop(0,'#0B0A0C'); sky.addColorStop(1,'#1A1216');
ctx.fillStyle = sky; ctx.fillRect(0,0,W,v.y+2);
var glow = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, Math.max(W,H)*.55);
glow.addColorStop(0,'rgba(227,36,43,.34)'); glow.addColorStop(.35,'rgba(179,21,31,.12)'); glow.addColorStop(1,'rgba(179,21,31,0)');
ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
for (var i=0;i<lights.length;i++){
var L = lights[i], lx = L.x*W, ly = v.y - 2 - L.y*10;
var al = L.a*(.6+.4*Math.sin(t*.0015 + L.p));
ctx.fillStyle = L.w ? 'rgba(255,244,230,'+al+')' : 'rgba(255,190,120,'+al*.8+')';
ctx.fillRect(lx, ly, 1.6, 1.6);
}
var g2 = ctx.createLinearGradient(0,v.y,0,H); g2.addColorStop(0,'#141114'); g2.addColorStop(1,'#0C0B0D');
ctx.fillStyle = g2; ctx.fillRect(0,v.y,W,H-v.y);
var rg = ctx.createLinearGradient(0,v.y,0,H); rg.addColorStop(0,'#1A1619'); rg.addColorStop(1,'#26211F');
quad(v, 120, .8, -1.55, 1.55, rg);
for (var d=.8; d<90; d*=1.12){
var d1 = d*1.12, fade = Math.min(1, 3/d);
quad(v,d,d1,-1.42,-1.36,'rgba(240,236,236,'+(.55*fade)+')');
quad(v,d,d1, 1.36, 1.42,'rgba(240,236,236,'+(.55*fade)+')');
}
var Pd = 7, dl = 3.2, o = off % Pd;
for (var k=0;k<22;k++){
var s0 = .8 + k*Pd - o, s1 = s0 + dl;
if (s1 < .8) continue; if (s0 < .8) s0 = .8;
var f2 = Math.min(1, 4/s0);
quad(v,s0,s1,-.035,.035,'rgba(245,214,138,'+(.85*f2)+')');
}
var Pp = 9, op = off % Pp;
for (var j=0;j<14;j++){
var dd = 1 + j*Pp - op; if (dd < 1) continue;
var sides = [-1.9, 1.9];
for (var q=0;q<2;q++){
var p = P(v,dd,sides[q]), s = p[2];
var hgt = s*H*.28, wd = Math.max(1, s*14);
ctx.fillStyle = 'rgba(210,205,205,'+Math.min(.5, s*1.4)+')';
ctx.fillRect(p[0]-wd/2, p[1]-hgt, wd, hgt);
var lit = Math.min(1, s*3.2);
var r = Math.max(1.2, s*11);
var gl = ctx.createRadialGradient(p[0], p[1]-hgt*.82, 0, p[0], p[1]-hgt*.82, r*4);
gl.addColorStop(0,'rgba(255,90,90,'+lit+')'); gl.addColorStop(.25,'rgba(227,36,43,'+(lit*.55)+')'); gl.addColorStop(1,'rgba(227,36,43,0)');
ctx.fillStyle = gl; ctx.fillRect(p[0]-r*4, p[1]-hgt*.82-r*4, r*8, r*8);
ctx.fillStyle = 'rgba(255,200,200,'+lit+')';
ctx.fillRect(p[0]-r*.5, p[1]-hgt*.82-r*.9, r, r*1.8);
}
}
ctx.globalCompositeOperation = 'lighter';
var hl = ctx.createRadialGradient(v.x - px, H*1.08, 0, v.x - px, H*1.08, W*.5);
hl.addColorStop(0,'rgba(255,226,180,.16)'); hl.addColorStop(1,'rgba(255,226,180,0)');
ctx.fillStyle = hl; ctx.fillRect(0,0,W,H);
ctx.globalCompositeOperation = 'source-over';
}
function frame(t){
if (!running) return;
var dt = last ? Math.min(.05, (t-last)/1000) : 0; last = t;
off += dt*10; px += (tpx - px)*.05;
draw(t);
requestAnimationFrame(frame);
}
size(); draw(0);
window.addEventListener('resize', function(){ size(); draw(performance.now()); });
if (!reduce){
requestAnimationFrame(frame);
document.querySelector('.hero').addEventListener('pointermove', function(e){ tpx = (e.clientX / W - .5) * -60; });
if ('IntersectionObserver' in window){
new IntersectionObserver(function(en){
var vis = en[0].isIntersecting;
if (vis && !running){ running = true; last = 0; requestAnimationFrame(frame); }
else if (!vis) running = false;
}).observe(cv);
}
}
document.querySelectorAll('.lit').forEach(function(el){
el.addEventListener('pointermove', function(e){
var r = el.getBoundingClientRect();
el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
el.style.setProperty('--my', (e.clientY - r.top) + 'px');
});
});
var links = {}; document.querySelectorAll('.nav a.lk').forEach(function(a){ links[a.getAttribute('href').slice(1)] = a; });
if ('IntersectionObserver' in window){
var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting){ Object.keys(links).forEach(function(k){ links[k].classList.toggle('on', k === e.target.id); }); } });
}, {rootMargin:'-45% 0px -50% 0px'});
['marca','publicacao','cuidados','acessos'].forEach(function(id){ var s = document.getElementById(id); if (s) io.observe(s); });
}
var boxes = [].slice.call(document.querySelectorAll('.items input'));
var segs = [].slice.call(document.querySelectorAll('.tape6 i'));
var meter = document.getElementById('meter'), n = document.getElementById('n'), msg = document.getElementById('msg');
function update(){
var c = boxes.filter(function(b){ return b.checked; }).length;
segs.forEach(function(s,i){ s.classList.toggle('on', i < c); });
n.textContent = c;
meter.classList.toggle('full', c === boxes.length);
var left = boxes.length - c;
msg.textContent = c === boxes.length
? 'Tudo certo. Pode publicar nos Stories da regional ou enviar à Nume.'
: (left === 1 ? 'Falta 1 item.' : 'Faltam ' + left + ' itens.') + ' Na dúvida, consulte a Gestão Digital ou a Nume.';
}
boxes.forEach(function(b){ b.addEventListener('change', update); });
document.getElementById('reset').addEventListener('click', function(){ boxes.forEach(function(b){ b.checked = false; }); update(); });
update();
var dw=document.querySelector('.device-wrap');
if(dw){var tilt=dw.querySelector('.device-tilt'),pimg=dw.querySelector('img'),sh=dw.querySelector('.device-sheen');
function setMask(){var u='url("'+pimg.currentSrc+'")';sh.style.webkitMaskImage=u;sh.style.maskImage=u;sh.classList.add('on');}
if(pimg.complete&&pimg.naturalWidth)setMask();else pimg.addEventListener('load',setMask);
if(!reduce){dw.addEventListener('pointermove',function(e){var r=dw.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.setProperty('--ry',(-12+x*22)+'deg');tilt.style.setProperty('--rx',(5-y*12)+'deg');});
dw.addEventListener('pointerleave',function(){tilt.style.removeProperty('--ry');tilt.style.removeProperty('--rx');});}}
})();
