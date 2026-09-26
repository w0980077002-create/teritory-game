/* Territory Game — deterministic navigation / touch routing */
(function(){
'use strict';
const map={home:'home',inventory:'inventory',hero:'hero',battle:'battle',quests:'quests',games:'games',clan:'clan',market:'shop',casino:'games',districts:'quests'};
let lastPointer=0;
function closeLayers(){
 document.getElementById('runnerScreen')?.remove();
 try{window.HomeRebuild?.stopRunner?.()}catch(_){ }
 try{window.ArenaGame?.close?.()}catch(_){ }
 document.getElementById('arenaModal')?.classList.remove('show');
 document.querySelectorAll('.forge-v2-overlay').forEach(e=>e.remove());
}
function nav(id){
 id=map[id]||id;
 if(id==='battle'){
   closeLayers();
   window.HomeRebuild?.startRunner?.(false);
 }else{
   closeLayers();
   window.showScreen?.(id);
 }
 sync();
}
function handle(el){
 if(!el)return false;
 const global=el.closest?.('[data-global-nav]');
 if(global){nav(global.dataset.globalNav);return true;}
 const back=el.closest?.('[data-home]');
 if(back){nav('home');return true;}
 const fj=el.closest?.('[data-fj-nav]');
 if(fj){nav(fj.dataset.fjNav);return true;}
 return false;
}
function ensure(){
 let n=document.getElementById('hardMobileNav');
 if(!n){
   n=document.createElement('nav');n.id='hardMobileNav';n.setAttribute('aria-label','Основная навигация');
   n.innerHTML=[['home','⌂','Город'],['inventory','🎒','Инвентарь'],['hero','⚔','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🛡','Клан']].map(x=>`<button type="button" data-global-nav="${x[0]}"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('');
   document.body.appendChild(n);
 }
 sync();
}
function sync(){
 const n=document.getElementById('hardMobileNav');if(!n)return;
 const screen=document.body.dataset.screen||'home';
 const overlay=!!document.getElementById('runnerScreen')||document.getElementById('arenaModal')?.classList.contains('show');
 n.style.display=(screen!=='home'||overlay)?'grid':'none';
 n.querySelectorAll('[data-global-nav]').forEach(b=>b.classList.toggle('active',b.dataset.globalNav===screen));
}
// pointerdown is intentional: it makes mobile navigation deterministic before any bubble handler can steal the tap.
document.addEventListener('pointerdown',e=>{
 if(Date.now()-lastPointer<180)return;
 if(handle(e.target)){lastPointer=Date.now();e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('click',e=>{
 if(handle(e.target)){e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('DOMContentLoaded',ensure);
document.addEventListener('territory:screen',sync);document.addEventListener('territory:render',sync);window.addEventListener('resize',sync);
const st=document.createElement('style');st.textContent=`
#hardMobileNav{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;width:100vw!important;height:auto!important;box-sizing:border-box!important;z-index:2147483000!important;display:none;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:5px 4px calc(5px + env(safe-area-inset-bottom));background:#07111b;border-top:2px solid #b99548;box-shadow:0 -8px 28px #000b;pointer-events:auto!important;touch-action:manipulation!important}
#hardMobileNav button{box-sizing:border-box!important;min-width:0!important;width:auto!important;height:58px!important;margin:0!important;border:1px solid #435665;border-radius:10px;background:#10202c;color:#fff;padding:3px 1px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-weight:900;font-size:18px;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
#hardMobileNav button i{font-style:normal;font-size:18px;line-height:18px}#hardMobileNav button span{font-size:8px;line-height:10px;white-space:nowrap}#hardMobileNav button.active{border-color:#d1ad55;background:#2a2114;color:#f2d77d}body[data-screen="home"] #hardMobileNav{display:none!important}@media(max-width:480px){#hardMobileNav button{height:54px!important}#hardMobileNav button span{font-size:7px}}
/* Panel controls must remain above backgrounds and always receive the tap. */
.screen.panel{z-index:2}.screen.panel header,.screen.panel button{position:relative;z-index:20;pointer-events:auto!important;touch-action:manipulation!important}
`;
document.head.appendChild(st);
window.TerritoryNavigate=nav;window.TerritoryNavigation={navigate:nav,sync};
})();
