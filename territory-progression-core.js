/* Territory Progression Core — PASS 33
   One small progression layer, intentionally separate from combat math.
   Fast early unlocks, concise hints, immediate action.
*/
(function(){
'use strict';
const KEY='territory_progression_seen_v1';
const UNLOCKS={
  2:{title:'⚔️ Бой открыт',text:'Первый настоящий бой уже рядом. Нажми «В бой» и попробуй сам.',action:'battle',label:'⚔️ ПОПРОБОВАТЬ БОЙ'},
  3:{title:'👥 Спутник с тобой',text:'Спутник уже помогает в бою. Тапни по нему на главном экране.',action:'home',label:'👥 ПОСМОТРЕТЬ СПУТНИКА'},
  5:{title:'🧪 Эликсиры',text:'Теперь можно использовать эликсиры прямо в бою.',action:'shop',label:'🧪 ОТКРЫТЬ ЭЛИКСИРЫ'},
  10:{title:'🗺️ Следующая ступень',text:'Путь главы становится важнее: побеждай, собирай экипировку и открывай босса.',action:'map',label:'🗺️ ОТКРЫТЬ ПУТЬ'}
};
function state(){return window.TerritoryStore?.state||null}
function seen(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return{}}}
function saveSeen(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}}
function open(level){
 const cfg=UNLOCKS[level]; if(!cfg)return;
 let m=document.getElementById('territoryUnlockModal');
 if(!m){m=document.createElement('div');m.id='territoryUnlockModal';m.className='tpc-modal';document.body.appendChild(m)}
 m.innerHTML=`<div class="tpc-backdrop"></div><section class="tpc-card">
   <div class="tpc-glow">✦</div><small>НОВАЯ ВОЗМОЖНОСТЬ</small><h2>${cfg.title}</h2>
   <p>${cfg.text}</p>
   <button class="gold-btn wide" data-tpc-action="${cfg.action}">${cfg.label}</button>
   <button class="dark-btn wide" data-tpc-close>ПОЗЖЕ</button>
 </section>`;
 m.classList.add('show');
 m.onclick=e=>{
   if(e.target.closest('[data-tpc-close]')||e.target.classList.contains('tpc-backdrop'))m.classList.remove('show');
   const a=e.target.closest('[data-tpc-action]');
   if(a){m.classList.remove('show');window.TerritoryNavigation?.go?.(a.dataset.tpcAction)}
 };
}
function check(){
 const s=state();if(!s)return;
 const level=Math.max(1,Number(s.level||s.profile?.level)||1), marks=seen();
 Object.keys(UNLOCKS).map(Number).filter(x=>level>=x&&!marks[x]).sort((a,b)=>a-b).forEach((x,i)=>{
   marks[x]=true;saveSeen(marks);
   setTimeout(()=>open(x),500+i*250);
 });
}
function mount(){
 if(window.__territoryProgressionMounted)return;
 window.__territoryProgressionMounted=true;
 window.addEventListener('territory:level-up',()=>setTimeout(check,120));
 window.addEventListener('territory:state-changed',()=>setTimeout(check,80));
 setTimeout(check,700);
}
window.TerritoryProgressionCore={check,open,unlocks:UNLOCKS};
document.addEventListener('DOMContentLoaded',mount);
})();

/* TERRITORY PASS 35 — REAL HOME EQUIPMENT VISUALS
 * Uses the canonical TerritoryStore.equipment. No new equipment system.
 */
(function(){
'use strict';
const S=()=>window.TerritoryStore?.state||{};
const slots=['weapon','helmet','armor','belt','boots','ring','amulet'];
function text(item){return typeof item==='string'?item:[item?.name,item?.title,item?.type,item?.icon,item?.emoji,item?.id].filter(Boolean).join(' ').toLowerCase()}
function esc(v){return String(v??'').replace(/[<>&"]/g,'')}
function rarity(item){const t=text(item);return /legendary|легендар/.test(t)?'legendary':/epic|эпич/.test(t)?'epic':/rare|редк/.test(t)?'rare':/uncommon|необыч/.test(t)?'uncommon':'common'}
function weapon(item){const t=text(item);if(/bow|лук/.test(t))return'bow';if(/axe|топор/.test(t))return'axe';if(/hammer|молот|булав/.test(t))return'hammer';if(/spear|копь|пик/.test(t))return'spear';if(/dagger|кинжал/.test(t))return'dagger';return'sword'}
function mountGear(){
 const hero=document.querySelector('[data-life-hero]');if(!hero)return null;
 let rack=hero.querySelector('[data-home-gear]');
 if(!rack){rack=document.createElement('div');rack.className='home-gear-visual';rack.dataset.homeGear='1';rack.innerHTML='<i class="hg-helmet"></i><i class="hg-armor"></i><i class="hg-belt"></i><i class="hg-boots"></i><i class="hg-weapon"></i><i class="hg-ring"></i><i class="hg-amulet"></i><span class="hg-spark"></span>';hero.appendChild(rack)}
 return rack;
}
let lastKey='';
function apply(showToast){
 const rack=mountGear();if(!rack)return;
 const eq=Array.isArray(S().equipment)?S().equipment:Array(7).fill(null);
 const key=eq.map((x,i)=>x?[(x.id||x.name||x.title||i),rarity(x)].join(':'):'-').join('|');
 rack.dataset.weapon=eq[0]?weapon(eq[0]):'none';
 rack.dataset.rarity=eq.filter(Boolean).map(rarity).sort((a,b)=>['common','uncommon','rare','epic','legendary'].indexOf(b)-['common','uncommon','rare','epic','legendary'].indexOf(a))[0]||'common';
 slots.forEach((slot,i)=>rack.classList.toggle('has-'+slot,!!eq[i]));
 rack.querySelector('.hg-helmet').textContent=eq[1]?.icon||eq[1]?.emoji||'';
 rack.querySelector('.hg-armor').textContent=eq[2]?'◆':'';
 rack.querySelector('.hg-belt').textContent=eq[3]?'━':'';
 rack.querySelector('.hg-boots').textContent=eq[4]?'◆':'';
 rack.querySelector('.hg-ring').textContent=eq[5]?'✦':'';
 rack.querySelector('.hg-amulet').textContent=eq[6]?'◆':'';
 rack.querySelector('.hg-weapon').textContent=eq[0]?.icon||eq[0]?.emoji||'⚔';
 rack.querySelector('.hg-spark').textContent=rack.dataset.rarity==='legendary'?'✦ ✦':rack.dataset.rarity==='epic'?'✦':'';
 if(showToast&&lastKey&&key!==lastKey){
   const changed=eq.find((x,i)=>{const old=lastKey.split('|')[i]||'-';return x&&old!==key.split('|')[i]});
   if(changed){const layer=document.querySelector('.home-life');const t=layer?.querySelector('[data-life-toast]');if(t){t.textContent='⚔️ Надето: '+(changed.name||changed.title||'новое снаряжение');t.dataset.kind='reward';t.classList.remove('show');void t.offsetWidth;t.classList.add('show')}}
   document.querySelector('[data-life-hero]')?.classList.add('home-gear-changed');setTimeout(()=>document.querySelector('[data-life-hero]')?.classList.remove('home-gear-changed'),900);
 }
 lastKey=key;
}
function init(){apply(false);window.addEventListener('territory:state-changed',()=>setTimeout(()=>apply(true),30));setInterval(()=>apply(false),1200);}
window.TerritoryHomeEquipment={apply};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
