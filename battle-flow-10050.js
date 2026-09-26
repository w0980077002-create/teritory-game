(function(){'use strict';
const $=s=>document.querySelector(s);
let active=false, stage=0, timer=null, enemyTimer=null;
const S=()=>window.TerritoryStore?.state||{};
function ch(){return window.TerritoryChaptersAPI?.current?.()||{};}
function st(){return window.TerritoryChaptersAPI?.state?.()||S();}
function stones(){if(!Number.isFinite(Number(S().battleStones)))S().battleStones=30;return Number(S().battleStones);}
function save(){window.TerritoryStore?.saveNow?.('battle-flow-10050');}
function ensureNav(){const n=$('#hardMobileNav');if(n){n.style.display='grid';const b=n.querySelector('[data-global-nav="battle"] span');if(b)b.textContent='Карта';}}
function hideNav(){const n=$('#hardMobileNav');if(n)n.style.display='none';}
function build(){let x=$('#battleProgress10050');if(x)x.remove();x=document.createElement('div');x.id='battleProgress10050';x.innerHTML=`<div class="bf50-bg"></div><div class="bf50-top"><b>ГЛАВА <span data-bf50-ch>1</span></b><span data-bf50-stage>БОЙ 1 / 4</span><strong>💎 <i data-bf50-stones>${stones()}</i></strong></div><div class="bf50-route"><i class="done">1</i><i>2</i><i>3</i><i>4</i><b>☠️</b></div><div class="bf50-world"><div class="bf50-hero"><img src="player-viking-approved.png"><span>SSS</span></div><div class="bf50-follower">🛡️</div><div class="bf50-bot"><img src="opponent-viking-approved.png"><span data-bf50-name>БОТ</span></div></div><div class="bf50-status" data-bf50-status>БОЙ НАЧАЛСЯ</div><div class="bf50-hint">⚔️ Герой идёт навстречу противнику</div>`;document.body.appendChild(x);return x;}
function start(){if(active)return;if(st().chapterProgress>=100){return openBoss();}active=true;stage=Math.max(1,Number(st().chapterStage)||1);const root=build();ensureNav();document.body.classList.add('battle-flow-10050');root.classList.add('show');render();setTimeout(()=>moveToBot(root),500);}
function render(){const root=$('#battleProgress10050');if(!root)return;const c=ch(),s=st();root.querySelector('[data-bf50-ch]').textContent=c.id||s.currentChapter||1;root.querySelector('[data-bf50-stage]').textContent=`БОЙ ${Math.min(4,stage)} / 4`;root.querySelector('[data-bf50-stones]').textContent=stones();root.querySelectorAll('.bf50-route i').forEach((e,i)=>e.classList.toggle('done',i<stage));root.querySelector('[data-bf50-name]').textContent=(c.enemy?.name)||['Разбойник','Северный воин','Наёмник','Охотник'][stage-1]||'БОТ';}
function moveToBot(root){if(!active)return;root.classList.add('moving');setTimeout(()=>{if(!active)return;root.classList.remove('moving');root.classList.add('encounter');root.querySelector('[data-bf50-status]').textContent='⚔️ ВРАГ ВСТРЕЧЕН';setTimeout(()=>openPve(),650)},1800);}
function openPve(){if(!active)return;active=false;clearTimeout(timer);$('#battleProgress10050')?.remove();document.body.classList.remove('battle-flow-10050');hideNav();window.TerritoryUI?.show('pveBattle');}
function afterPveWin(done){if(done){window.TerritoryUI?.show('home');hideNav();active=false;return;}window.TerritoryUI?.show('home');setTimeout(()=>start(),180);}

function resumeAfterPve(){const s=st();const victory=$('#pveVictory');if(!victory||!$('#pveBattle')?.classList.contains('active'))return;const done=Number(s.chapterProgress)>=100;if(victory.dataset.bf50Handled)return;victory.dataset.bf50Handled='1';setTimeout(()=>{if(done){window.TerritoryUI?.show('home');hideNav();active=false;}else{window.TerritoryUI?.show('home');start();}},80);}
function openBoss(){const s=st();if(Number(s.chapterProgress)>=100){window.TerritoryUI?.show('bossBattle');}}
function patchPve(){const old=window.TerritoryUI?.show;if(!old||old.__bf50)return;const wrap=function(id){if(id==='map'&&active)return old.call(this,'home');return old.apply(this,arguments)};wrap.__bf50=true;window.TerritoryUI.show=wrap;}
window.addEventListener('territory:screen',e=>{if(e.detail==='pveBattle'){setTimeout(()=>{patchPve();},0);}if(e.detail==='home'&&!active){const s=st();if(Number(s.chapterProgress)>=100)ensureNav();}});
window.addEventListener('click',e=>{const n=e.target.closest?.('[data-global-nav="battle"]');if(n){e.preventDefault();e.stopImmediatePropagation();start();return;}const hz=e.target.closest?.('.hz');if(hz&&hz.dataset.action==='battle'){e.preventDefault();e.stopImmediatePropagation();start();return;}if(e.target.closest?.('#pveVictory')){setTimeout(resumeAfterPve,20);}},true);
function install(){patchPve();const nav=$('#hardMobileNav');if(nav){const b=nav.querySelector('[data-global-nav="battle"] span');if(b)b.textContent='Карта';}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.BattleFlow10050={start,openBoss,afterPveWin};
})();
