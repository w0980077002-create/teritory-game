/* Territory S94 — unified S92 + S93 battle controller
   One battle layer: scene, tactical selectors, result effects and turn flow.
*/
(()=>{'use strict';
const oldOpen=window.openTerritoryS92;
const scene=window.TerritoryS93;
if(!oldOpen)console.warn('S94: S92 controller not found yet; load S92 before S94');

const style=document.createElement('style');
style.textContent=`
#s94bar{position:fixed;left:50%;top:5px;transform:translateX(-50%);z-index:100003;display:none;
padding:7px 13px;border:1px solid #76572b;border-radius:10px;background:rgba(8,8,10,.9);font-weight:800;font-size:13px}
#s94result{position:fixed;left:50%;top:39%;transform:translate(-50%,-50%);z-index:100004;display:none;
font-size:clamp(32px,10vw,72px);font-weight:950;text-align:center;text-shadow:0 4px 16px #000;pointer-events:none}
`;
document.head.appendChild(style);
const bar=document.createElement('div');bar.id='s94bar';document.body.appendChild(bar);
const result=document.createElement('div');result.id='s94result';document.body.appendChild(result);

let current=null,lastLogLen=0;

function pulse(text){
 result.textContent=text;result.style.display='block';
 result.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.65)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.08)'},{opacity:0,transform:'translate(-50%,-65%) scale(1)'}],{duration:900,easing:'ease-out'});
 setTimeout(()=>result.style.display='none',900);
}
function handle(m){
 if(!m)return;
 current=m;
 bar.style.display='block';
 const my=window.TerritoryPlayerId;
 const myTurn=String(m.turn)===String(my);
 bar.textContent=m.status==='finished'?'Бой завершён':(myTurn?'ВАШ ХОД — выберите 1 атаку и 2 защиты':'ХОД СОПЕРНИКА');
 const logs=m.log||[];
 if(logs.length>lastLogLen){
   const x=logs[logs.length-1];
   if(x.type==='crit')pulse('⚡ КРИТИЧЕСКИЙ УДАР');
   else if(x.type==='dodge')pulse('💨 УКЛОНЕНИЕ');
   else if(x.type==='finish')pulse(m.winner===m.attacker.id?'🏆 ПОБЕДА':'☠ ПОРАЖЕНИЕ');
 }
 lastLogLen=logs.length;
 if(scene&&scene.open)scene.open(m);
}
window.TerritoryS94={
 open(m){lastLogLen=0;handle(m);if(oldOpen)oldOpen(m)},
 update(m){handle(m)},
 close(){bar.style.display='none';if(scene&&scene.close)scene.close()},
 current:()=>current
};
window.openTerritoryS94=window.TerritoryS94.open;

/* If S92 exists, wrap its open method so every battle automatically gets the
   unified state/scene controller while retaining the existing selectors. */
if(oldOpen){
 window.openTerritoryS92=(m)=>{oldOpen(m);handle(m)};
}
})();