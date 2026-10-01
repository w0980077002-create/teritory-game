/* Territory PvE Authority FINAL — server-state battle renderer.
   Authenticated PvE combat is now driven by the Worker/DO combat snapshot.
   Guest/demo PvE keeps the original local engine unchanged. */
(function(){
'use strict';
if(window.__territoryPveAuthorityFinal)return;
window.__territoryPveAuthorityFinal=true;

const A=()=>window.TerritoryTelegramAuth;
const P=()=>window.PvEBattle;
const T=()=>window.TerritoryPveTranscript08;
let busy=false, resultShown=false, winAt=0, autoTimer=null, currentSnap=null;

function authenticated(){
 const a=A(); return !!(a&&a.state==='authenticated'&&T()?.getSession?.());
}
function root(){return document.querySelector('.pve-battle.show')||document.querySelector('.pve-battle')}
function log(msg){
 const r=root();if(!r)return;
 const el=r.querySelector('#pveCombatLog');if(!el)return;
 const s=document.createElement('span');s.textContent=msg;el.prepend(s);
 while(el.children.length>3)el.lastElementChild.remove();
}
function setBusy(v){
 busy=!!v;
 const r=root();if(!r)return;
 r.querySelectorAll('#pveAttack,#pveSkill,#pveBossSkills [data-skill],[data-consumable]').forEach(b=>{
   if(!b.dataset.authorityDisabled)b.dataset.authorityDisabled=b.disabled?'1':'0';
   b.disabled=busy||b.dataset.authorityDisabled==='1';
 });
}
function clearAuthorityLocks(){
 const r=root();if(!r)return;
 r.querySelectorAll('[data-authority-disabled]').forEach(b=>{b.disabled=b.dataset.authorityDisabled==='1';delete b.dataset.authorityDisabled});
}
function paint(snap){
 currentSnap=snap||null;
 const r=root();if(!r||!snap)return;
 const enemyMax=Math.max(1,Number(snap.enemyMaxHp)||1),heroMax=Math.max(1,Number(snap.maxHp)||1);
 const eh=Math.max(0,Number(snap.enemyHp)||0),hh=Math.max(0,Number(snap.heroHp)||0);
 const ef=r.querySelector('#pveEnemyFill');if(ef)ef.style.width=Math.max(0,Math.min(100,eh/enemyMax*100))+'%';
 const et=r.querySelector('#pveEnemyHp');if(et)et.textContent=`${Math.ceil(eh).toLocaleString('ru-RU')} / ${enemyMax.toLocaleString('ru-RU')}`;
 const hf=r.querySelector('#pveHpFill');if(hf)hf.style.width=Math.max(0,Math.min(100,hh/heroMax*100))+'%';
 const ht=r.querySelector('#pveHpText');if(ht)ht.textContent=`${Math.floor(hh).toLocaleString('ru-RU')} / ${Math.floor(heroMax).toLocaleString('ru-RU')} HP`;
 const hm=r.querySelector('#pveHeroMiniHp');if(hm)hm.style.width=Math.max(0,Math.min(100,hh/heroMax*100))+'%';
 const bt=r.querySelector('#pveBossTimer');if(bt&&snap.bossTime!==null&&snap.bossTime!==undefined)bt.textContent=`⌛ ${snap.bossTime}s`;
 const skill=r.querySelector('#pveSkill');if(skill)skill.disabled=busy||!!snap.ended;
 const attack=r.querySelector('#pveAttack');if(attack)attack.disabled=busy||!!snap.ended;
 if(snap.result==='win'){showAuthorityResult(true);return}
 if(snap.result==='lose'){showAuthorityResult(false);return}
 if(snap.turn)log(`Ход ${snap.turn}`);
}
function actionName(a){
 return a==='attack'?'⚔ Атака':a.replace('skill:','✦ ');
}
async function send(action){
 if(!authenticated()||busy||resultShown)return;
 setBusy(true);
 try{
  const r=await T().sendAndGet(action);
  if(!r?.combat)throw new Error('Сервер не вернул состояние боя');
  paint(r.combat);
  if(!r.combat.ended)log(actionName(action));
  if(!r.combat.ended&&isAuto())scheduleAuto();
 }catch(e){
  log('⚠️ '+(e?.message||'Ошибка сервера'));
 }finally{
  if(!resultShown){setBusy(false);clearAuthorityLocks()}
 }
}
function isAuto(){
 const r=root();return !!r?.querySelector('#pveAuto')?.textContent?.includes('✓');
}
function scheduleAuto(){
 clearTimeout(autoTimer);
 if(!isAuto()||resultShown)return;
 autoTimer=setTimeout(()=>send('attack'),850);
}
function resultLayer(){
 let el=document.getElementById('territoryPveAuthorityResult');
 if(el)return el;
 el=document.createElement('div');el.id='territoryPveAuthorityResult';
 el.innerHTML='<div class="tpar-card"><div class="tpar-icon" data-i>⚔️</div><h2 data-t></h2><p data-x></p><div class="tpar-compare" data-c></div><div class="tpar-actions"><button data-equip>⚔ Надеть</button><button data-keep>🎒 Оставить</button><button data-next>▶ Продолжить</button></div></div>';
 const st=document.createElement('style');st.textContent='#territoryPveAuthorityResult{position:fixed;inset:0;z-index:200000;display:flex;align-items:center;justify-content:center;padding:18px;background:#0009;color:#fff;font-family:system-ui,sans-serif}#territoryPveAuthorityResult .tpar-card{width:min(92vw,520px);max-height:82vh;overflow:auto;background:#0a1720;border:1px solid #d7b85f;border-radius:16px;padding:18px;box-shadow:0 18px 60px #000b;text-align:center}#territoryPveAuthorityResult h2{margin:6px 0;font-size:24px}#territoryPveAuthorityResult p{opacity:.8}#territoryPveAuthorityResult .tpar-icon{font-size:42px}#territoryPveAuthorityResult .tpar-compare{margin:12px 0;padding:10px;border:1px solid #ffffff18;border-radius:10px;text-align:left;font-size:13px}#territoryPveAuthorityResult .tpar-actions{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:7px}#territoryPveAuthorityResult button{min-height:42px;border:1px solid #c9a950;border-radius:9px;background:#1a2a35;color:#fff;font-weight:800}#territoryPveAuthorityResult button[data-next]{background:linear-gradient(#e7c96c,#9a701e);color:#171107}';
 document.head.appendChild(st);document.body.appendChild(el);return el;
}
function latestPveLoot(){
 const s=window.TerritoryStore?.state||{},items=Array.isArray(s.inventoryItems)?s.inventoryItems:[];
 return items.find(x=>x&&x.source==='pve')||null;
}
function equipLoot(item){
 const s=window.TerritoryStore?.state||{},map={weapon:0,helmet:1,armor:2,belt:3,boots:4,ring:5,amulet:6},slot=map[item?.type];
 if(slot===undefined)return;
 s.equipment=Array.isArray(s.equipment)?s.equipment:Array(7).fill(null);while(s.equipment.length<7)s.equipment.push(null);
 const old=s.equipment[slot];s.equipment[slot]=item;s.inventoryItems=(Array.isArray(s.inventoryItems)?s.inventoryItems:[]).filter(x=>x!==item);if(old)s.inventoryItems.unshift(old);
 window.TerritoryStore?.saveNow?.('pve-final-equip');
}
function showAuthorityResult(win){
 if(resultShown)return;
 resultShown=true;clearTimeout(autoTimer);setBusy(true);winAt=Date.now();
 const box=resultLayer();
 box.querySelector('[data-i]').textContent=win?'🏆':'☠️';
 box.querySelector('[data-t]').textContent=win?'ПОБЕДА!':'ПОРАЖЕНИЕ';
 box.querySelector('[data-x]').textContent=win?'Сервер подтвердил победу. Нажми «Получить награду», чтобы завершить сессию и выдать серверный loot.':'Сервер завершил бой поражением.';
 box.querySelector('[data-c]').innerHTML='';
 box.querySelector('[data-equip]').style.display='none';
 box.querySelector('[data-keep]').style.display='none';
 box.querySelector('[data-next]').textContent=win?'▶ Получить награду':'↩ Вернуться';
 box.querySelector('[data-next]').onclick=()=>finish(win);
 // Keep the old seven-button navigation visually available behind the result,
 // but never allow navigation to bypass an uncommitted server result.
}
async function finish(win){
 if(busy&&resultShown&&Date.now()-winAt<1500)return;
 const authority=window.TerritoryPveAuthorityComplete08;
 if(!authority?.completeSession)return;
 const box=document.getElementById('territoryPveAuthorityResult'),btn=box?.querySelector('[data-next]');
 if(btn)btn.disabled=true;
 try{
  const wait=Math.max(0,1500-(Date.now()-winAt));
  if(wait)await new Promise(r=>setTimeout(r,wait));
  if(win){
   const result=await authority.completeSession();
   if(!result)throw new Error('Сервер не подтвердил награду');
   const s=window.TerritoryStore?.state||{},before=Number(s.currentChapter)||1,progress=Number(s.chapterProgress)||0,next=Number(s.chapterStage)||1;
   const loot=latestPveLoot();
   box?.remove();resultShown=false;busy=false;clearAuthorityLocks();
   window.TerritoryNavigation?.sync?.();
   if(loot){
     showRewardAfterComplete(loot,Number(s.currentChapter)>before||progress>=100,next);
   }else if(Number(s.currentChapter)>before||progress>=100){
     try{P()?.close?.(true)}catch(_){}
     window.TerritoryNavigation?.sync?.();
   }else{
     setTimeout(()=>{try{P()?.start?.(Math.max(1,Math.min(4,next)))}catch(e){console.warn('[Territory] next PvE:',e?.message||e)}},80);
   }
  }else{
   box?.remove();resultShown=false;busy=false;clearAuthorityLocks();try{P()?.close?.(true)}catch(_){}
   const s=window.TerritoryStore?.state;if(s){s.hp=Math.max(1,Math.floor((Number(s.maxHp)||100)*.35));window.TerritoryStore?.saveNow?.('pve-final-defeat')}
   window.TerritoryNavigation?.sync?.();
  }
 }catch(e){
  if(btn){btn.disabled=false;btn.textContent='↻ Повторить';}
  log('⚠️ '+(e?.message||'Не удалось завершить бой'));
  busy=false;clearAuthorityLocks();
 }
}
function showRewardAfterComplete(loot,chapterDone,nextStage){
 const box=resultLayer();
 box.querySelector('[data-i]').textContent='🎁';
 box.querySelector('[data-t]').textContent='НАГРАДА ПОЛУЧЕНА';
 box.querySelector('[data-x]').textContent='Сервер выдал предмет. Его можно надеть сейчас или оставить в инвентаре.';
 box.querySelector('[data-c]').innerHTML=`🎁 <b>${String(loot.name||'PvE предмет')}</b><br>Редкость: ${String(loot.rarity||'common')} · Уровень ${Number(loot.level)||1}`;
 box.querySelector('[data-equip]').style.display='';
 box.querySelector('[data-keep]').style.display='';
 box.querySelector('[data-next]').textContent=chapterDone?'▶ Вернуться':'▶ Следующий бой';
 box.querySelector('[data-equip]').onclick=()=>{equipLoot(loot);box.querySelector('[data-equip]').textContent='✓ Надето'};
 box.querySelector('[data-keep]').onclick=()=>{box.querySelector('[data-keep]').textContent='✓ Сохранено'};
 box.querySelector('[data-next]').onclick=()=>{
   box.remove();
   if(chapterDone){try{P()?.close?.(true)}catch(_){}window.TerritoryNavigation?.sync?.();return}
   setTimeout(()=>{try{P()?.start?.(Math.max(1,Math.min(4,nextStage)))}catch(e){console.warn('[Territory] next PvE:',e?.message||e)}},80);
 };
}
function wrap(){
 const p=P();if(!p||p.__authorityFinalWrapped)return;
 const oa=p.attack,os=p.skill;
 p.attack=function(){if(authenticated())return send('attack');return oa.apply(this,arguments)};
 p.skill=function(kind){if(authenticated())return send('skill:'+(kind||'power'));return os.apply(this,arguments)};
 p.__authorityFinalWrapped=true;
 // Capture consumables before pve-battle's private handler can mutate local state.
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('.pve-battle [data-consumable]');if(!b||!authenticated())return;
  e.preventDefault();e.stopImmediatePropagation();
  const key=String(b.dataset.consumable||'');if(/^elixir_(hp|energy|attack|guard)$/.test(key))send(key);
 },true);
}
function install(){
 const timer=setInterval(wrap,200);
 wrap();
 window.addEventListener('beforeunload',()=>clearTimeout(autoTimer));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
