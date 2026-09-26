/* Territory Game — single navigation owner, mobile-safe */
(function(){
'use strict';
const map={home:'home',inventory:'inventory',hero:'hero',battle:'battle',quests:'quests',games:'games',clan:'clan',market:'shop',casino:'games',districts:'quests'};
function closeLayers(){
 document.getElementById('runnerScreen')?.remove();
 try{window.HomeRebuild?.stopRunner?.()}catch(_){}
 try{window.ArenaGame?.close?.()}catch(_){}
 document.getElementById('arenaModal')?.classList.remove('show');
 document.querySelectorAll('.forge-v2-overlay').forEach(e=>e.remove());
}
function nav(id){
 id=map[id]||id;
 if(id==='battle'){
   closeLayers();
   window.HomeRebuild?.startRunner?.(false);
   sync();
   return;
 }
 closeLayers();
 window.showScreen?.(id);
 sync();
}
function ensure(){
 let n=document.getElementById('hardMobileNav');
 if(!n){
   n=document.createElement('nav');
   n.id='hardMobileNav';
   n.setAttribute('aria-label','Основная навигация');
   n.innerHTML=[
    ['home','⌂','Город'],['inventory','🎒','Инвентарь'],['hero','⚔','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🛡','Клан']
   ].map(x=>`<button type="button" data-global-nav="${x[0]}"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('');
   document.body.appendChild(n);
 }
 sync();
}
function sync(){
 const n=document.getElementById('hardMobileNav');
 if(!n)return;
 const screen=document.body.dataset.screen||'home';
 const overlay=!!document.getElementById('runnerScreen')||document.getElementById('arenaModal')?.classList.contains('show');
 n.style.display=(screen!=='home'||overlay)?'grid':'none';
 n.querySelectorAll('[data-global-nav]').forEach(b=>b.classList.toggle('active',b.dataset.globalNav===screen));
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-global-nav]');
 if(b){e.preventDefault();e.stopImmediatePropagation();nav(b.dataset.globalNav);return;}
 const back=e.target.closest?.('[data-home]');
 if(back){e.preventDefault();nav('home');return;}
 const fj=e.target.closest?.('[data-fj-nav]');
 if(fj){e.preventDefault();nav(fj.dataset.fjNav);return;}
},true);
document.addEventListener('DOMContentLoaded',ensure);
document.addEventListener('territory:screen',sync);
document.addEventListener('territory:render',sync);
window.addEventListener('resize',sync);
const st=document.createElement('style');
st.textContent=`
#hardMobileNav{
 position:fixed!important;left:0!important;right:auto!important;bottom:0!important;top:auto!important;
 width:100vw!important;max-width:none!important;height:auto!important;box-sizing:border-box!important;
 z-index:2147483000!important;display:none;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;
 padding:5px 4px calc(5px + env(safe-area-inset-bottom));
 background:#07111b;border-top:2px solid #b99548;box-shadow:0 -8px 28px #000b;
 pointer-events:auto!important;touch-action:manipulation!important;
}
#hardMobileNav button{
 box-sizing:border-box!important;min-width:0!important;width:auto!important;height:58px!important;margin:0!important;
 border:1px solid #435665;border-radius:10px;background:#10202c;color:#fff;padding:3px 1px;
 display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
 font-weight:900;font-size:18px;touch-action:manipulation!important;
}
#hardMobileNav button i{font-style:normal;font-size:18px;line-height:18px}
#hardMobileNav button span{font-size:8px;line-height:10px;white-space:nowrap}
#hardMobileNav button.active{border-color:#d1ad55;background:#2a2114;color:#f2d77d}
body[data-screen="home"] #hardMobileNav{display:none!important}
@media (max-width:480px){#hardMobileNav button{height:54px!important}#hardMobileNav button span{font-size:7px}}
`;
document.head.appendChild(st);
window.TerritoryNavigate=nav;
window.TerritoryNavigation={navigate:nav,sync};
})();
