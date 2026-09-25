/* Territory Game — unified state/runtime / Arena-PvE isolated rebuild */
(function(){
  'use strict';

  const VERSION=8;
  const TELEGRAM_BOT_USERNAME='TeritoryGameBot';
  const TELEGRAM_BOT_HANDLE='@TeritoryGameBot';
  const followerDefaults={
    activeFollower:null,
    items:{
      liabro:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      teralel:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      king_cows:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      mort:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      stone_face:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false}
    }
  };
  const defaults={
    schemaVersion:VERSION,
    profile:{displayName:'',telegramId:'',username:'',firstName:'',lastName:'',photoUrl:'',languageCode:'',platform:'unknown',premium:false},
    coins:1000,gems:25,redGems:0,level:1,exp:0,expToNext:100,
    hp:120,maxHp:120,energy:200,maxEnergy:200,
    strength:5,agility:5,defense:0,weapon:'Кулаки',bonusDamage:0,
    ownedWeapons:['Кулаки'],inventory:[],equipment:[],consumables:{},
    followers:followerDefaults,
    arena:{rating:1000,wins:0,losses:0,battles:0,history:[],loadout:'crit',combatSlotsUnlocked:3},
    pve:{chapter:1,progress:0,bossPending:false,bossActive:false,bossAttempts:0,bossDefeated:0},
    gameDice:10,gameRolls:0,gameSteps:0,gamePos:0,gameLap:0
  };
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function normalize(x){
    const s=Object.assign(clone(defaults),x||{});
    s.schemaVersion=VERSION;
    s.profile=Object.assign(clone(defaults.profile),x?.profile||{});
    for(const k of ['coins','gems','redGems'])s[k]=Math.max(0,Number(s[k])||0);
    s.level=Math.max(1,Math.floor(Number(s.level)||1));
    s.exp=Math.max(0,Number(s.exp)||0);
    s.expToNext=Math.max(1,Number(s.expToNext)||100);
    s.maxHp=Math.max(1,Number(s.maxHp)||120);
    s.hp=Math.max(0,Math.min(s.maxHp,Number(s.hp)||0));
    s.maxEnergy=Math.max(1,Number(s.maxEnergy)||200);
    s.energy=Math.max(0,Math.min(s.maxEnergy,Number(s.energy)||0));
    s.strength=Math.max(1,Number(s.strength)||1);
    s.agility=Math.max(1,Number(s.agility)||1);
    s.defense=Math.max(0,Number(s.defense)||0);
    s.bonusDamage=Math.max(0,Number(s.bonusDamage)||0);
    s.weapon=String(s.weapon||'Кулаки');
    s.ownedWeapons=Array.isArray(s.ownedWeapons)?[...new Set(s.ownedWeapons.map(String))]:['Кулаки'];
    if(!s.ownedWeapons.includes('Кулаки'))s.ownedWeapons.unshift('Кулаки');
    if(s.weapon!=='Кулаки'&&!s.ownedWeapons.includes(s.weapon))s.ownedWeapons.push(s.weapon);
    s.inventory=Array.isArray(s.inventory)?s.inventory:[];
    s.equipment=Array.isArray(s.equipment)?s.equipment:[];
    s.consumables=(s.consumables&&typeof s.consumables==='object'&&!Array.isArray(s.consumables))?s.consumables:{};
    s.followers=Object.assign(clone(followerDefaults),s.followers||{});
    s.followers.items=Object.assign(clone(followerDefaults.items),s.followers.items||{});
    Object.keys(followerDefaults.items).forEach(id=>{
      s.followers.items[id]=Object.assign(clone(followerDefaults.items[id]),s.followers.items[id]||{});
      s.followers.items[id].owned=Boolean(s.followers.items[id].owned);
      s.followers.items[id].level=Math.max(1,Math.min(100,Math.floor(Number(s.followers.items[id].level)||1)));
      s.followers.items[id].xp=Math.max(0,Number(s.followers.items[id].xp)||0);
      s.followers.items[id].awakened=Boolean(s.followers.items[id].awakened);
      s.followers.items[id].awakeningClaimed=Boolean(s.followers.items[id].awakeningClaimed);
    });
    if(!s.followers.items[s.followers.activeFollower]?.owned)s.followers.activeFollower=null;
    s.arena=Object.assign(clone(defaults.arena),s.arena||{});
    s.arena.rating=Math.max(0,Number(s.arena.rating)||1000);
    s.arena.wins=Math.max(0,Number(s.arena.wins)||0);
    s.arena.losses=Math.max(0,Number(s.arena.losses)||0);
    s.arena.battles=Math.max(0,Number(s.arena.battles)||0);
    s.arena.history=Array.isArray(s.arena.history)?s.arena.history:[];
    s.pve=Object.assign(clone(defaults.pve),s.pve||{});
    s.pve.chapter=Math.max(1,Math.floor(Number(s.pve.chapter)||1));
    s.pve.progress=Math.max(0,Math.min(100,Number(s.pve.progress)||0));
    s.pve.bossPending=Boolean(s.pve.bossPending);
    s.pve.bossActive=Boolean(s.pve.bossActive);
    s.pve.bossAttempts=Math.max(0,Math.floor(Number(s.pve.bossAttempts)||0));
    s.pve.bossDefeated=Math.max(0,Math.floor(Number(s.pve.bossDefeated)||0));
    s.gameDice=Math.max(0,Math.floor(Number(s.gameDice)||0));
    s.gameRolls=Math.max(0,Math.floor(Number(s.gameRolls)||0));
    s.gameSteps=Math.max(0,Math.floor(Number(s.gameSteps)||0));
    s.gamePos=((s.gameSteps%27)+27)%27;
    s.gameLap=Math.floor(s.gameSteps/27);
    return s;
  }

  let state=normalize(null);
  try{
    const raw=localStorage.getItem('teritory_save_v1');
    state=normalize(raw?JSON.parse(raw):null);
  }catch(_){}

  function save(reason){
    try{localStorage.setItem('teritory_save_v1',JSON.stringify(state));}catch(_){}
    document.dispatchEvent(new CustomEvent('territory:state',{detail:{reason:reason||'save'}}));
    return state;
  }
  function followerStats(){
    const id=state.followers?.activeFollower;
    const api=window.Followers;
    if(!id||!api?.getStats)return null;
    return api.getStats(id)||null;
  }
  function getDerivedStats(){
    const f=followerStats();
    return {
      strength:Math.max(0,Number(state.strength)||0)+(Number(f?.attack)||0),
      defense:Math.max(0,Number(state.defense)||0)+(Number(f?.defense)||0),
      maxHp:Math.max(1,Number(state.maxHp)||1)+(Number(f?.hp)||0),
      agility:Math.max(0,Number(state.agility)||0),
      bonusDamage:Math.max(0,Number(state.bonusDamage)||0),
      follower:f
    };
  }

  window.TerritoryStore={
    get state(){return state;},
    setState(v){state=normalize(v);return state;},
    normalize,saveNow:save,save,
    patch(p){state=normalize(Object.assign({},state,p||{}));return save('patch');},
    getDerivedStats,
    render(){document.dispatchEvent(new CustomEvent('territory:render'));},
    version:VERSION,telegramBotUsername:TELEGRAM_BOT_USERNAME,telegramBotHandle:TELEGRAM_BOT_HANDLE
  };

  window.addEventListener('pagehide',()=>save('pagehide'));
  window.addEventListener('storage',e=>{
    if(e.key==='teritory_save_v1'&&e.newValue){
      try{state=normalize(JSON.parse(e.newValue));window.TerritoryStore.render();}catch(_){}
    }
  });

  window.showScreen=function(id){
    const valid=['home','inventory','districts','market','casino','hero'];
    const target=valid.includes(id)?id:'home';
    document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===target));
    document.documentElement.dataset.screen=target;
    document.body.dataset.screen=target;
    if(target==='home'&&window.HomeRebuild?.refresh)window.HomeRebuild.refresh();
    window.TerritoryStore.render();
  };

  const cells=[['🏁','СТАРТ'],['💎','20'],['❓','?'],['💧','50'],['📜','7'],['🧰','1'],['❓','?'],['🪙','750'],['💧','30'],['💜','5'],['🪙','160'],['❓','?'],['📜','10'],['💧','30'],['🪙','750'],['💎','5'],['❓','?'],['🪙','300'],['💎','20'],['💧','40'],['📜','5'],['🪙','500'],['❓','?'],['💎','10'],['🧰','1'],['💧','60'],['🏁','ФИНИШ']];
  function renderCasino(){
    const board=document.getElementById('casinoBoard');if(!board)return;
    board.innerHTML=cells.map((c,i)=>`<button class="casino-cell ${i===state.gamePos?'active':''}" data-cell="${i}"><b>${c[0]}</b><span>${c[1]}</span></button>`).join('');
  }
  function reward(){
    const c=cells[state.gamePos],v=Number(c[1])||0;
    if(c[0]==='🪙')state.coins+=v;
    else if(c[0]==='💎')state.gems+=v;
    else if(c[0]==='💧')state.energy=Math.min(state.maxEnergy,state.energy+v);
    else if(c[0]==='🧰')state.consumables.elixir_hp=Number(state.consumables.elixir_hp||0)+1;
    else if(c[0]==='📜')state.exp+=v;
    else if(c[0]==='❓'){state.coins+=50;state.exp+=5;}
  }
  function paint(){
    const c=document.querySelector('[data-coins]'),g=document.querySelector('[data-gems]'),d=document.querySelector('[data-dice]');
    if(c)c.textContent=Math.floor(state.coins).toLocaleString('ru-RU');
    if(g)g.textContent=Math.floor(state.gems).toLocaleString('ru-RU');
    if(d)d.textContent=state.gameDice;
  }
  document.addEventListener('click',e=>{
    const roll=e.target.closest?.('[data-roll]');
    if(!roll)return;
    if(state.gameDice<=0)return;
    state.gameDice--;state.gameRolls++;
    const n=1+Math.floor(Math.random()*6);
    state.gameSteps+=n;state.gamePos=state.gameSteps%27;state.gameLap=Math.floor(state.gameSteps/27);
    reward();save('casino-roll');renderCasino();
    const out=document.querySelector('[data-roll-result]');if(out)out.textContent=`🎲 Выпало ${n}`;
  });
  document.addEventListener('territory:render',()=>{paint();renderCasino();});
  document.addEventListener('DOMContentLoaded',()=>{paint();renderCasino();});
})();
