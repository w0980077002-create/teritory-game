(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let moveTimer=null;
function ready(fn){if(window.TerritoryChapters?.length)fn();else window.addEventListener('territory:chapters-ready',fn,{once:true})}
function state(){return window.TerritoryChaptersAPI?.state?.()||window.TerritoryStore?.state||{currentChapter:1,chapterStage:1,chapterProgress:0}}
function chapter(){return window.TerritoryChaptersAPI?.current?.()}
function nav(route){window.TerritoryUI?.show(route==='map'?'map':route)}
function render(){
 const s=state(), ch=chapter(); if(!ch)return;
 const stage=Math.min(5,Math.max(1,Number(s.chapterStage)||1)), pct=Math.min(100,Number(s.chapterProgress)||0);
 $('#fjordsPct').textContent=pct+'%';
 const top=$('.fjords-top b'); if(top)top.textContent=`ГЛАВА ${ch.id} · ${ch.name}`;
 const sub=$('.fjords-top small'); if(sub)sub.textContent=`Этап ${Math.min(stage,4)} / ${ch.stages}${pct>=100?' · БОСС ОТКРЫТ':''}`;
 const names=['Вход в локацию','Северный путь','Опасный перевал','Вражеский лагерь','Босс главы'];
 $$('.route-node').forEach((n,i)=>{const idx=i+1;n.classList.toggle('active',idx===stage);n.classList.toggle('done',idx<stage);n.classList.toggle('unlocked',idx<=stage || (idx===5&&pct>=100));});
 $('#fjordsStageLabel').textContent=stage===5?'БОСС ГЛАВЫ':`ЭТАП ${stage}`;
 $('#fjordsStageName').textContent=stage===5?`Босс · ${ch.name}`:`${names[stage-1]} · ${ch.name}`;
 $('#fjordsStageText').textContent=stage===5?'Глава пройдена на 100%. Босс открыт.':`Глава ${ch.id}: ${pct}% · осталось этапов: ${Math.max(0,ch.stages-(stage-1))}.`;
 const start=$('#fjordsStart');
 if(start){start.disabled=stage>=5||pct>=100;start.textContent=stage>=5?'БОСС ОТКРЫТ':'НАЧАТЬ ДВИЖЕНИЕ';}
 const enc=$('#fjordsEncounter');
 if(enc)enc.classList.toggle('hidden',stage>=5 || !$('.fjords-map')?.classList.contains('encounter'));
 const enemy=$('#fjordsEnemy'); if(enemy)enemy.textContent=stage===5?'👹':'👹';
 const fight=$('#fjordsFight'); if(fight)fight.textContent='В БОЙ';
}
function reset(){clearTimeout(moveTimer);const root=$('.fjords-map');if(!root)return;root.classList.remove('moving','encounter');$('#fjordsEncounter')?.classList.add('hidden');$('#fjordsStart')?.removeAttribute('disabled');}
function open(){reset();render();window.TerritoryUI?.show('map');}
function movement(){
 const s=state(), ch=chapter(); if(!ch||Number(s.chapterProgress)>=100)return;
 const root=$('.fjords-map');reset();root.classList.add('moving');$('#fjordsStart').disabled=true;$('#fjordsStart').textContent='ИДЁМ...';
 moveTimer=setTimeout(()=>{root.classList.remove('moving');root.classList.add('encounter');$('#fjordsEncounter').classList.remove('hidden');$('#fjordsStart').textContent='ВСТРЕЧА';setTimeout(()=>fight(),350);},1500);
}
function fight(){
 const s=state(),ch=chapter(); if(!ch)return;
 if(Number(s.chapterProgress)>=100){window.TerritoryUI?.show('bossBattle');return;}
 s.lastStageEncounter=true; s.currentChapterEnemy=ch.enemy; window.TerritoryStore?.saveNow?.();
 window.TerritoryUI?.show('pveBattle');
}
function boss(){if(Number(state().chapterProgress)>=100)window.TerritoryUI?.show('bossBattle')}
ready(()=>render());
$('#fjordsStart')?.addEventListener('click',movement);
$('#fjordsFight')?.addEventListener('click',fight);
$('.route-node.boss')?.addEventListener('click',boss);
$('#fjordsBack')?.addEventListener('click',()=>nav('home'));
$$('[data-fj-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.fjNav)));
window.addEventListener('territory:chapters-ready',render);window.addEventListener('territory:state-changed',render);
setInterval(()=>{if($('#map')?.classList.contains('active'))render()},700);
window.TerritoryMap240={open,movement,fight,render,boss};
})();
