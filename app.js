/* Territory Game — unified state/runtime */
(function(){
  'use strict';
  const VERSION=6;
  const defaults={schemaVersion:VERSION,profile:{displayName:'',telegramId:'',username:'',firstName:'',lastName:'',photoUrl:'',languageCode:'',platform:'unknown',premium:false},coins:1000,gems:25,redGems:0,level:1,exp:0,expToNext:100,hp:120,maxHp:120,energy:200,maxEnergy:200,strength:5,agility:5,defense:0,weapon:'Кулаки',bonusDamage:0,ownedWeapons:['Кулаки'],inventory:[],equipment:[],consumables:{},arena:{rating:1000,wins:0,losses:0,battles:0,history:[]},gameDice:10,gameRolls:0,gameSteps:0,gamePos:0,gameLap:0};
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function normalize(x){
    const s=Object.assign(clone(defaults),x||{}); s.schemaVersion=VERSION;
    s.profile=Object.assign(clone(defaults.profile),x?.profile||{});
    s.coins=Math.max(0,Number(s.coins)||0);s.gems=Math.max(0,Number(s.gems)||0);s.redGems=Math.max(0,Number(s.redGems)||0);
    s.level=Math.max(1,Math.floor(Number(s.level)||1));s.exp=Math.max(0,Number(s.exp)||0);s.expToNext=Math.max(1,Number(s.expToNext)||100);
    s.maxHp=Math.max(1,Number(s.maxHp)||120);s.hp=Math.max(0,Math.min(s.maxHp,Number(s.hp)||0));s.maxEnergy=Math.max(1,Number(s.maxEnergy)||200);s.energy=Math.max(0,Math.min(s.maxEnergy,Number(s.energy)||0));
    ['strength','agility'].forEach(k=>s[k]=Math.max(1,Number(s[k])||1));s.defense=Math.max(0,Number(s.defense)||0);s.bonusDamage=Math.max(0,Number(s.bonusDamage)||0);
    s.weapon=String(s.weapon||'Кулаки');s.ownedWeapons=Array.isArray(s.ownedWeapons)?[...new Set(s.ownedWeapons.map(String))]:['Кулаки'];if(!s.ownedWeapons.includes('Кулаки'))s.ownedWeapons.unshift('Кулаки');if(s.weapon!=='Кулаки'&&!s.ownedWeapons.includes(s.weapon))s.ownedWeapons.push(s.weapon);
    s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.equipment=Array.isArray(s.equipment)?s.equipment:[];s.consumables=(s.consumables&&typeof s.consumables==='object'&&!Array.isArray(s.consumables))?s.consumables:{};
    s.arena=Object.assign(clone(defaults.arena),s.arena||{});s.arena.rating=Math.max(0,Number(s.arena.rating)||1000);s.arena.wins=Math.max(0,Number(s.arena.wins)||0);s.arena.losses=Math.max(0,Number(s.arena.losses)||0);s.arena.battles=Math.max(0,Number(s.arena.battles)||0);s.arena.history=Array.isArray(s.arena.history)?s.arena.history:[];
    s.gameDice=Math.max(0,Math.floor(Number(s.gameDice)||0));s.gameRolls=Math.max(0,Math.floor(Number(s.gameRolls)||0));s.gameSteps=Math.max(0,Math.floor(Number(s.gameSteps)||0));s.gamePos=((s.gameSteps%27)+27)%27;s.gameLap=Math.floor(s.gameSteps/27);
    return s;
  }
  let state=normalize(null);
  try{state=normalize(JSON.parse(localStorage.getItem('territory_save_v1')||'null'));}catch(_){ }
  const save=(reason)=>{try{localStorage.setItem('territory_save_v1',JSON.stringify(state));}catch(_){};document.dispatchEvent(new CustomEvent('territory:state',{detail:{reason:reason||'save'}}));return state;};
  window.TerritoryStore={get state(){return state;},setState(v){state=normalize(v);return state;},normalize,saveNow:save,save,patch(p){state=normalize(Object.assign({},state,p||{}));return save('patch');},render(){document.dispatchEvent(new CustomEvent('territory:render'));}};
  window.addEventListener('pagehide',()=>save('pagehide'));
  window.addEventListener('storage',e=>{if(e.key==='territory_save_v1'&&e.newValue){try{state=normalize(JSON.parse(e.newValue));window.TerritoryStore.render();}catch(_){}}});
  window.showScreen=function(id){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));document.documentElement.dataset.screen=id;document.body.dataset.screen=id;if(id==='arena'&&window.ArenaGame?.open)window.ArenaGame.open();window.TerritoryStore.render();};
  window.addEventListener('click',e=>{const b=e.target.closest?.('[data-screen]');if(b){e.preventDefault();window.showScreen(b.dataset.screen);}});
  const coins=()=>document.querySelector('[data-coins]'),gems=()=>document.querySelector('[data-gems]'),dice=()=>document.querySelector('[data-dice]');
  function paint(){if(coins())coins().textContent=Math.floor(state.coins).toLocaleString('ru-RU');if(gems())gems().textContent=Math.floor(state.gems).toLocaleString('ru-RU');if(dice())dice().textContent=state.gameDice;}
  document.addEventListener('territory:render',paint);paint();
  // Lightweight Monopoly/event board. Rewards stay in TerritoryStore and combat items.
  const cells=[['🏁','СТАРТ'],['💎','20'],['❓','?'],['💧','50'],['📜','7'],['🧰','1'],['❓','?'],['🪙','750'],['💧','30'],['💜','5'],['🪙','160'],['❓','?'],['📜','10'],['💧','30'],['🪙','750'],['💎','5'],['❓','?'],['🪙','300'],['💎','20'],['💧','40'],['📜','5'],['🪙','500'],['❓','?'],['💎','10'],['🧰','1'],['💧','60'],['🏁','ФИНИШ']];
  function renderCasino(){const board=document.getElementById('casinoBoard');if(!board)return;board.innerHTML=cells.map((c,i)=>`<button class="casino-cell ${i===state.gamePos?'active':''}" data-cell="${i}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('');}
  function reward(){const i=state.gamePos,c=cells[i];if(c[0]==='🪙')state.coins+=Number(c[1])||0;else if(c[0]==='💎')state.gems+=Number(c[1])||0;else if(c[0]==='💧')state.energy=Math.min(state.maxEnergy,state.energy+(Number(c[1])||0));else if(c[0]==='🧰'&&window.CombatItems?.add)window.CombatItems.add('elixir_hp',1);else if(c[0]==='📜')state.exp+=Number(c[1])||0;else if(c[0]==='❓'){state.coins+=50;state.exp+=5;} }
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-roll]')){if(state.gameDice<=0)return;state.gameDice--;const n=1+Math.floor(Math.random()*6);state.gameRolls++;state.gameSteps+=n;state.gamePos=state.gameSteps%27;state.gameLap=Math.floor(state.gameSteps/27);reward();save('casino-roll');renderCasino();const out=document.querySelector('[data-roll-result]');if(out)out.textContent=`🎲 Выпало ${n}`;}});
  document.addEventListener('territory:render',renderCasino);document.addEventListener('DOMContentLoaded',()=>{renderCasino();if(location.hash==='#arena')showScreen('arena');});
})();
