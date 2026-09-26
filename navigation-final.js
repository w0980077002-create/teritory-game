(function(){
'use strict';
function closeLayers(){document.getElementById('runnerScreen')?.remove();try{window.ArenaGame?.close?.()}catch(_){};document.querySelectorAll('.forge-v2-overlay').forEach(e=>e.remove())}
function go(id){const map={market:'shop',casino:'games',districts:'quests'};id=map[id]||id;closeLayers();window.showScreen?.(id)}
function ensure(){
 let n=document.getElementById('hardMobileNav');
 if(!n){n=document.createElement('nav');n.id='hardMobileNav';n.innerHTML=[['home','⌂','Город'],['inventory','🎒','Инвентарь'],['hero','⚔','Герой'],['battle','⚔️','Бой'],['quests','📜','Квесты'],['games','🎲','Игры'],['clan','🛡','Клан']].map(x=>`<button type="button" data-global-nav="${x[0]}"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('');document.body.appendChild(n)}
 n.querySelectorAll('[data-global-nav]').forEach(b=>b.onclick=()=>{const id=b.dataset.globalNav;if(id==='battle')window.HomeRebuild?.startRunner?.(false);else go(id)})
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-global-nav]');if(b){e.preventDefault();e.stopImmediatePropagation();const id=b.dataset.globalNav;if(id==='battle')window.HomeRebuild?.startRunner?.(false);else go(id);return}
 const back=e.target.closest?.('[data-home]');if(back){e.preventDefault();go('home');return}
 const fj=e.target.closest?.('[data-fj-nav]');if(fj){e.preventDefault();go(fj.dataset.fjNav);return}
});
document.addEventListener('DOMContentLoaded',ensure);ensure();
})();