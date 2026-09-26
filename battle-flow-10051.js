(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const state=()=>window.TerritoryChaptersAPI?.state?.()||S();
const chapter=()=>window.TerritoryChaptersAPI?.current?.()||{};
let running=false,runTimer=0;
function save(){window.TerritoryStore?.saveNow?.('battle-flow-10051')}
function pct(){return Number(state().chapterProgress)||0}
function show(id){window.TerritoryUI?.show?.(id)}
function setLabels(){document.querySelectorAll('.pve32-nav [data-pve-nav="map"] span,.fjords-nav [data-fj-nav="map"] span,.bf-nav [data-bf-nav="map"] span').forEach(e=>e.textContent='Карта')}
function resetScene(){const map=document.querySelector('#map .fjords-map');if(!map)return;map.classList.remove('moving','encounter');document.querySelector('#fjordsStart')?.setAttribute('hidden','hidden');document.querySelector('#fjordsEncounter')?.classList.add('hidden');const card=document.querySelector('.fjords-stage-card');if(card)card.style.display='none';const route=document.querySelector('.fjords-route');if(route)route.style.display='none'}
function updateScene(){const s=state(),ch=chapter(),top=document.querySelector('.fjords-top');if(top){const b=top.querySelector('b'),sm=top.querySelector('small');if(b)b.textContent='ГЛАВА '+(ch.id||s.currentChapter||1)+' · '+(ch.name||'Северный путь');if(sm)sm.textContent='Этап '+Math.min(4,Math.max(1,Number(s.chapterStage)||1))+' / 4'}const p=document.querySelector('#fjordsPct');if(p)p.textContent=Math.min(100,pct())+'%';}
function start(){if(running)return;if(pct()>=100){boss();return}running=true;clearTimeout(runTimer);show('map');setLabels();updateScene();resetScene();const map=document.querySelector('#map .fjords-map');if(!map){running=false;return}requestAnimationFrame(()=>map.classList.add('moving'));runTimer=setTimeout(()=>{if(!running)return;map.classList.remove('moving');map.classList.add('encounter');const enc=document.querySelector('#fjordsEncounter');if(enc){enc.classList.remove('hidden');enc.querySelector('b')?.replaceChildren(document.createTextNode('⚔️ ВРАГ НА ПУТИ'));enc.querySelector('span')?.replaceChildren(document.createTextNode(chapter().enemy?.name||'Противник'));const btn=enc.querySelector('button');if(btn)btn.style.display='none'}runTimer=setTimeout(()=>{running=false;document.querySelector('#fjordsEncounter')?.classList.add('hidden');map.classList.remove('moving','encounter');show('pveBattle')},650)},1850)}
function boss(){if(pct()<100)return;running=false;clearTimeout(runTimer);S().pve=S().pve||{};S().pve.bossPending=true;save();show('bossBattle')}
function victory(done){running=false;clearTimeout(runTimer);if(done){show('home');return}setTimeout(start,180)}
function install(){if(window.BattleFlow10050)window.BattleFlow10050.afterPveWin=victory;window.BattleFlow10051={start,victory,boss};setLabels();document.addEventListener('click',function(e){const hz=e.target.closest?.('.hz');if(hz&&hz.dataset.action==='battle'){e.preventDefault();e.stopImmediatePropagation();start();return}const skull=e.target.closest?.('#mapChapterSkull,#pveChapterMap');if(skull){e.preventDefault();e.stopImmediatePropagation();if(pct()>=100)boss();return}const startBtn=e.target.closest?.('#fjordsStart');if(startBtn){e.preventDefault();e.stopImmediatePropagation();start()}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();