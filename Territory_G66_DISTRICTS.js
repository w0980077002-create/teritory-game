/* Territory G66 — Map / Districts Core
   One city map hub. City artwork stays locked. PvE and Arena stay separate.
*/
(function(){'use strict';
 const Store=window.TerritoryStore;
 if(!Store)return;
 const st=Store.state;
 const esc=s=>String(s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
 const districts=[
  {id:'center',icon:'🏙️',name:'Центр Sdolars',desc:'Главная площадь города. Здесь встречается Alex и появляются городские события.',req:1,reward:35,xp:8},
  {id:'forge',icon:'⚒️',name:'Кузница',desc:'Экипировка, прочность предметов и ремонт.',req:1,action:'repair'},
  {id:'tavern',icon:'🍺',name:'Таверна',desc:'Отдых и восстановление энергии. Здесь можно следить за голодом героя.',req:1,action:'tavern'},
  {id:'market',icon:'🛒',name:'Рынок',desc:'Покупка оружия и снаряжения.',req:1,action:'market'},
  {id:'arena',icon:'⚔️',name:'Арена',desc:'Отдельный PvP-раздел: 1×1, хаос и командные бои.',req:1,action:'arena'},
  {id:'gates',icon:'🛡️',name:'Ворота',desc:'Выход на городской путь и обычные PvE-сражения.',req:1,action:'pve'},
  {id:'port',icon:'⚓',name:'Старый порт',desc:'Городской район для будущих событий, сделок и специальных активностей.',req:2,reward:55,xp:12},
  {id:'ruins',icon:'🏚️',name:'Старые руины',desc:'Опасный район за стеной. Будущая зона для добычи и дополнительных встреч.',req:3,reward:75,xp:18}
 ];
 function level(){return Number(window.TerritoryProgression?.snapshot?.().cityLevel || st.cityLevel || 1)}
 function unlocked(id){return window.TerritoryProgression?.districtUnlocked ? window.TerritoryProgression.districtUnlocked(id) : level() >= (districts.find(x=>x.id===id)?.req||1)}
 function save(){try{Store.saveNow('districts')}catch(_){try{Store.save()}catch(e){}}}
 function open(){
  let old=document.getElementById('g66Map'); if(old){render(); old.classList.add('show');return;}
  old=document.createElement('div'); old.id='g66Map'; old.className='g66-map'; old.innerHTML='<div class="g66-card"><button class="g66-close" type="button" data-g66="close">✕</button><div class="g66-head"><small>SDOLARS · КАРТА ГОРОДА</small><h2>РАЙОНЫ</h2><span>Городской уровень: <b id="g66Level"></b></span></div><div class="g66-tools"><button type="button" data-g67-open="1">📈 Прогрессия</button></div><div class="g66-grid" id="g66Grid"></div><div class="g66-info" id="g66Info"></div><div class="g66-log" id="g66Log">Выбери район.</div></div>';
  document.body.appendChild(old); render(); old.classList.add('show');
 }
 function render(){
  const root=document.getElementById('g66Map'); if(!root)return;
  const lv=level(); const lvl=root.querySelector('#g66Level'); if(lvl)lvl.textContent=lv;
  const grid=root.querySelector('#g66Grid'); if(!grid)return;
  grid.innerHTML=districts.map(d=>{const locked=!unlocked(d.id);return `<button type="button" class="g66-point ${locked?'locked':''}" data-g66="select" data-id="${d.id}"><i>${d.icon}</i><b>${esc(d.name)}</b><small>${locked?'🔒 Ур. '+d.req:'ДОСТУПЕН'}</small></button>`}).join('');
  select('center');
 }
 function select(id){
  const d=districts.find(x=>x.id===id)||districts[0], root=document.getElementById('g66Map'); if(!root)return;
  root.querySelectorAll('.g66-point').forEach(b=>b.classList.toggle('selected',b.dataset.id===d.id));
  const locked=!unlocked(d.id);
  root.querySelector('#g66Info').innerHTML=`<small>${locked?'РАЙОН ЗАКРЫТ':'РАЙОН SDOLARS'}</small><h3>${d.icon} ${esc(d.name)}</h3><p>${esc(d.desc)}</p><button type="button" class="g66-go" data-g66="go" data-id="${d.id}" ${locked?'disabled':''}>${locked?'НУЖЕН УРОВЕНЬ '+d.req:(d.action?'ОТКРЫТЬ':'ОТПРАВИТЬСЯ')}</button>`;
 }
 function route(d){
  const root=document.getElementById('g66Map');
  if(d.action==='arena'&&window.openArena){root.classList.remove('show');window.openArena();return}
  if(d.action==='pve'&&window.pveOpen){root.classList.remove('show');window.pveOpen();return}
  if(d.action==='repair'&&window.TerritoryCore?.openRepair){root.classList.remove('show');window.TerritoryCore.openRepair();return}
  if(d.action==='tavern'&&window.TerritoryCore?.openTavern){root.classList.remove('show');window.TerritoryCore.openTavern();return}
  if(d.action==='market'){
   root.classList.remove('show'); const b=document.querySelector('[data-screen="market"]'); if(b)b.click(); return;
  }
  if(d.reward){st.coins=Number(st.coins||0)+d.reward;st.exp=Number(st.exp||0)+d.xp;st.cityRep=Number(st.cityRep||0)+1;while(st.exp>=100){st.exp-=100;st.level=Number(st.level||1)+1;}save();
   root.querySelector('#g66Log').textContent=`${d.name}: +${d.reward} 🪙 · +${d.xp} XP · +1 репутация города.`;
  }else root.querySelector('#g66Log').textContent=`Ты отправился в ${d.name}.`;
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-g66]'); if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  const act=b.dataset.g66;
  if(act==='close'){document.getElementById('g66Map')?.classList.remove('show');return;}
  if(act==='select'){select(b.dataset.id);return;}
  if(act==='go'){const d=districts.find(x=>x.id===b.dataset.id);if(d&&level()>=d.req)route(d);}
 },true);
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-screen="districts"]'); if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();open();
 },true);
 window.TerritoryDistricts={version:'G66',open,render,select,districts};
 const css=document.createElement('style');css.textContent=`
 .g66-map{position:fixed;inset:0;z-index:100000;background:rgba(4,7,12,.82);display:none;padding:12px;box-sizing:border-box;align-items:center;justify-content:center;touch-action:manipulation}
 .g66-map.show{display:flex}.g66-card{width:min(680px,100%);max-height:94vh;overflow:auto;border:1px solid rgba(255,255,255,.14);border-radius:22px;background:linear-gradient(180deg,#18202b,#0b1017);color:#fff;padding:14px;box-sizing:border-box;box-shadow:0 20px 70px rgba(0,0,0,.55)}
 .g66-close{float:right;width:42px;height:42px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:20px}.g66-head{padding:4px 4px 14px}.g66-head small{opacity:.65}.g66-head h2{margin:3px 0 2px;font-size:25px}.g66-tools{margin:-3px 0 9px}.g66-tools button{width:100%;border:1px solid #765d3b;background:#1a2226;color:#efd18e;border-radius:11px;padding:9px;font-weight:900}.g66-head span{opacity:.75}.g66-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.g66-point{min-height:94px;border:1px solid rgba(255,255,255,.12);border-radius:15px;background:rgba(255,255,255,.06);color:#fff;text-align:left;padding:11px;display:grid;grid-template-columns:38px 1fr;grid-template-rows:1fr auto;column-gap:8px}.g66-point i{font-style:normal;font-size:27px;grid-row:1/3;align-self:center;text-align:center}.g66-point b{font-size:14px;align-self:end}.g66-point small{opacity:.6;font-size:11px;margin-top:5px}.g66-point.selected{border-color:rgba(255,210,100,.7);background:rgba(255,190,60,.1)}.g66-point.locked{opacity:.48}.g66-info{margin-top:11px;padding:14px;border-radius:16px;background:rgba(0,0,0,.2)}.g66-info small{opacity:.6}.g66-info h3{margin:4px 0 5px}.g66-info p{margin:0 0 11px;opacity:.78;line-height:1.4}.g66-go{width:100%;height:46px;border:0;border-radius:12px;background:#d6a33a;color:#111;font-weight:800}.g66-go:disabled{opacity:.45}.g66-log{margin-top:9px;min-height:22px;opacity:.7;font-size:12px}
 @media(max-width:390px){.g66-grid{grid-template-columns:1fr 1fr}.g66-point{min-height:84px;padding:8px}.g66-point i{font-size:23px}.g66-point b{font-size:12px}}
 `;document.head.appendChild(css);
})();
