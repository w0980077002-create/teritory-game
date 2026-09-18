/* Territory G59 — Canonical Game State Core
   One in-memory state object for City, PvE, Arena and progression modules.
   The visual City remains locked; this file contains data/state only.
*/
(function(){
  'use strict';
  const KEY='territory_save_v1', LEGACY='territory_save';
  const defaults={
    name:'SSS',level:1,exp:0,maxExp:100,hp:120,maxHp:120,enemyHp:100,coins:1000,gems:25,energy:100,combatStone:20,
    strength:5,agility:5,defense:0,endurance:12,weaponMastery:1,freePoints:0,weapon:'Кулаки',bonusDamage:0,
    inventory:['🪓'],equipped:{},equipmentSlots:{weapon:null,helmet:null,armor:null,gloves:null,boots:null},durability:{},
    pveProgress:0,cityLevel:1,pveWins:0,hunger:100,lang:'ru',dailyClaim:'',vipDays:0,alexQuest:0,cityRep:0,merchantRep:0,
    quests:[],achievements:[],daily:{date:'',streak:0,claimed:false},
    gameDice:47,gameRolls:0,gameSteps:0,gameEventVersion:1,gameTaskProgress:0,gameMilestones:[],gameTaskClaims:[],gamePanelClaims:[],gameJackpotClaims:[],gameGiftDate:'',gameEndsAt:0,gameLap:0,gamePos:0,gameSaveVersion:2
  };
  function read(){
    let a={},b={};
    try{a=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){a={}}
    try{b=JSON.parse(localStorage.getItem(LEGACY)||'{}')||{}}catch(_){b={}}
    const s={...defaults,...b,...a};
    s.inventory=Array.isArray(s.inventory)?s.inventory:[];
    s.equipped={...defaults.equipped,...(s.equipped||{})};
    s.equipmentSlots={...defaults.equipmentSlots,...(s.equipmentSlots||{})};
    s.durability={...(s.durability||{})};
    s.quests=Array.isArray(s.quests)?s.quests:[];
    s.achievements=Array.isArray(s.achievements)?s.achievements:[];
    s.daily={...defaults.daily,...(s.daily||{})};
    s.gameMilestones=Array.isArray(s.gameMilestones)?s.gameMilestones:[];
    s.gameTaskClaims=Array.isArray(s.gameTaskClaims)?s.gameTaskClaims:[];
    s.gamePanelClaims=Array.isArray(s.gamePanelClaims)?s.gamePanelClaims:[];
    s.gameJackpotClaims=Array.isArray(s.gameJackpotClaims)?s.gameJackpotClaims:[];
    return normalize(s);
  }
  function normalize(s){
    for(const k of ['coins','gems','energy','combatStone','strength','agility','defense','endurance','weaponMastery','freePoints','level','exp','maxExp','hp','maxHp','pveProgress','cityLevel','pveWins','hunger','alexQuest','cityRep','merchantRep','gameDice','gameRolls','gameSteps']){
      const n=Number(s[k]); if(!Number.isFinite(n)) s[k]=defaults[k];
    }
    s.coins=Math.max(0,s.coins); s.gems=Math.max(0,s.gems); s.energy=Math.max(0,Math.min(200,s.energy)); s.combatStone=Math.max(0,s.combatStone);
    s.level=Math.max(1,Math.floor(s.level)); s.maxExp=Math.max(1,s.maxExp); s.exp=Math.max(0,s.exp); s.maxHp=Math.max(1,s.maxHp); s.hp=Math.max(0,Math.min(s.maxHp,s.hp));
    s.pveProgress=Math.max(0,Math.min(100,s.pveProgress)); s.cityLevel=Math.max(1,Math.floor(s.cityLevel)); s.hunger=Math.max(0,Math.min(100,s.hunger));
    const cells=27; s.gameSteps=Math.max(0,Math.floor(s.gameSteps)); s.gameLap=Math.floor(s.gameSteps/cells); s.gamePos=((s.gameSteps%cells)+cells)%cells;
    s.name=String(s.name||'SSS'); s.lang=s.lang==='en'?'en':'ru'; s.gameSaveVersion=2;
    return s;
  }
  const state=read();
  let saveTimer=0;
  function save(reason){
    normalize(state);
    clearTimeout(saveTimer);
    const write=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(LEGACY,JSON.stringify(state));}catch(e){console.warn('Territory save failed',e)}; window.dispatchEvent(new CustomEvent('territory:state-saved',{detail:{reason:reason||'update'}}));};
    saveTimer=setTimeout(write,0);
    return state;
  }
  function saveNow(reason){normalize(state);try{localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem(LEGACY,JSON.stringify(state));}catch(e){console.warn('Territory save failed',e)}window.dispatchEvent(new CustomEvent('territory:state-saved',{detail:{reason:reason||'update'}}));return state;}
  window.TerritoryStore={version:'G59',key:KEY,state,defaults,getState:()=>state,save,saveNow,normalize};
  window.addEventListener('storage',e=>{if(e.key!==KEY||!e.newValue)return;try{const incoming=normalize(JSON.parse(e.newValue));Object.assign(state,incoming);window.dispatchEvent(new CustomEvent('territory:state-changed',{detail:{source:'storage'}}));}catch(_){} });
})();
