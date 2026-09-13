/* Territory S93 — battle scene layer
   Uses s93-battle-scene.png as the visual battle-stage reference/background.
   The scene reacts to hit, crit, block and dodge events from the existing match log.
*/
(()=>{'use strict';
const css=`
#s93scene{position:fixed;inset:0;z-index:100000;display:none;background:#07080b center/cover no-repeat url('./s93-battle-scene.png');color:#fff;overflow:hidden;font-family:system-ui,sans-serif}
#s93shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.18) 55%,rgba(0,0,0,.72))}
#s93stage{position:absolute;inset:0;pointer-events:none}
.s93fighter{position:absolute;bottom:24%;width:30%;height:42%;border-radius:45% 45% 18% 18%;filter:drop-shadow(0 12px 18px #000);transition:transform .22s}
.s93fighter:before{content:"";position:absolute;left:20%;top:2%;width:60%;height:28%;border-radius:50%;background:linear-gradient(#b89a78,#6b4a35);border:2px solid #211b16}
.s93fighter:after{content:"";position:absolute;left:7%;top:25%;width:86%;height:62%;border-radius:35% 35% 18% 18%;background:linear-gradient(135deg,#4a392b,#161414);border:2px solid #2c261f}
#s93left{left:7%;transform:scaleX(1)}
#s93right{right:7%;transform:scaleX(-1)}
#s93left.hit{animation:s93left .35s}@keyframes s93left{50%{transform:translateX(-22px) rotate(-3deg)}}
#s93right.hit{animation:s93right .35s}@keyframes s93right{50%{transform:translateX(22px) rotate(3deg) scaleX(-1)}}
#s93fx{position:absolute;inset:0;pointer-events:none}
.s93text{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font-size:clamp(22px,7vw,52px);font-weight:900;text-shadow:0 3px 8px #000;animation:s93float .8s forwards}
@keyframes s93float{0%{opacity:0;transform:translate(-50%,10%) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(1.12)}}
#s93turn{position:absolute;top:8%;left:50%;transform:translateX(-50%);padding:8px 18px;border:1px solid #8d6a31;border-radius:12px;background:rgba(10,10,12,.82);font-weight:800}
#s93msg{position:absolute;left:5%;right:5%;bottom:8%;padding:10px 14px;border:1px solid #4b4131;border-radius:12px;background:rgba(7,8,10,.84);font-size:14px;text-align:center}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const root=document.createElement('div');root.id='s93scene';root.innerHTML=`<div id="s93shade"></div><div id="s93stage"><div id="s93left" class="s93fighter"></div><div id="s93right" class="s93fighter"></div></div><div id="s93turn">ХОД 1</div><div id="s93fx"></div><div id="s93msg">Ожидание боя…</div>`;
document.body.appendChild(root);

const L=root.querySelector('#s93left'),R=root.querySelector('#s93right'),fx=root.querySelector('#s93fx');
function effect(type,text){
 const e=document.createElement('div');e.className='s93text';e.textContent=text;
 fx.appendChild(e);setTimeout(()=>e.remove(),850);
 if(type==='left')L.classList.remove('hit'),void L.offsetWidth,L.classList.add('hit');
 if(type==='right')R.classList.remove('hit'),void R.offsetWidth,R.classList.add('hit');
}
function show(m){
 if(!m)return;
 root.style.display='block';
 root.querySelector('#s93turn').textContent='ХОД '+(m.round||1);
 const logs=m.log||[],last=logs[logs.length-1];
 if(last){
   root.querySelector('#s93msg').textContent=last.text||'';
   if(last.type==='crit')effect(m.turn===m.attacker.id?'left':'right','КРИТ!');
   else if(last.type==='dodge')effect(m.turn===m.attacker.id?'right':'left','УКЛОНЕНИЕ');
   else if(last.type==='attack'){
     effect(m.turn===m.attacker.id?'left':'right','УДАР');
   }
   if(last.type==='finish')effect('',m.winner===m.attacker.id?'ПОБЕДА!':'ПОРАЖЕНИЕ');
 }
}
window.TerritoryS93={open:show,close:()=>root.style.display='none'};
window.openTerritoryS93=show;
})();