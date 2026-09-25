/* Territory Game — Followers canonical core */
(function(){
  'use strict';
  const MAX_LEVEL=100,AWAKENING_LEVEL=50;
  const CATALOG=Object.freeze({
    liabro:{id:'liabro',name:'Лиабро',role:'Крит',icon:'⚔️',base:{attack:8,defense:2,hp:80,speed:6,critChance:12,critDamage:150,dodge:3,heal:0,control:0},growth:{attack:1.1,defense:.3,hp:10,speed:.04,critChance:.1,critDamage:.6,dodge:.03,heal:0,control:0}},
    teralel:{id:'teralel',name:'Тералель',role:'Защита',icon:'🛡️',base:{attack:4,defense:8,hp:120,speed:4,critChance:3,critDamage:125,dodge:2,heal:0,control:0},growth:{attack:.55,defense:1.15,hp:14,speed:.02,critChance:.02,critDamage:.25,dodge:.02,heal:0,control:0}},
    king_cows:{id:'king_cows',name:'Король Коров',role:'Лечение',icon:'❤️',base:{attack:4,defense:4,hp:110,speed:4,critChance:3,critDamage:125,dodge:2,heal:12,control:0},growth:{attack:.5,defense:.55,hp:13,speed:.02,critChance:.02,critDamage:.25,dodge:.02,heal:.65,control:0}},
    mort:{id:'mort',name:'Морт',role:'Уворот',icon:'🌀',base:{attack:6,defense:3,hp:90,speed:8,critChance:7,critDamage:135,dodge:12,heal:0,control:0},growth:{attack:.8,defense:.35,hp:10,speed:.06,critChance:.06,critDamage:.4,dodge:.14,heal:0,control:0}},
    stone_face:{id:'stone_face',name:'Каменное Лицо',role:'Контроль',icon:'💀',base:{attack:5,defense:5,hp:105,speed:3,critChance:4,critDamage:125,dodge:2,heal:0,control:10},growth:{attack:.65,defense:.7,hp:12,speed:.015,critChance:.03,critDamage:.3,dodge:.02,heal:0,control:.12}}
  });
  const EMPTY={activeFollower:null,items:Object.keys(CATALOG).reduce((a,id)=>(a[id]={owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},a),{})};
  const clone=x=>JSON.parse(JSON.stringify(x));
  function ensure(){
    const store=window.TerritoryStore;if(!store?.state)return null;
    const root=store.state;
    root.followers=root.followers&&typeof root.followers==='object'?root.followers:clone(EMPTY);
    root.followers.items=root.followers.items&&typeof root.followers.items==='object'?root.followers.items:clone(EMPTY.items);
    Object.keys(CATALOG).forEach(id=>{
      const f=root.followers.items[id]=Object.assign(clone(EMPTY.items[id]),root.followers.items[id]||{});
      f.owned=Boolean(f.owned);f.level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(f.level)||1)));
      f.xp=Math.max(0,Number(f.xp)||0);f.awakened=Boolean(f.awakened);f.awakeningClaimed=Boolean(f.awakeningClaimed);
      if(f.level<AWAKENING_LEVEL){f.awakened=false;f.awakeningClaimed=false;}
    });
    if(!root.followers.items[root.followers.activeFollower]?.owned)root.followers.activeFollower=null;
    if(!root.followers.activeFollower){root.followers.items.liabro.owned=true;root.followers.activeFollower='liabro';}
    return root;
  }
  function save(reason){window.TerritoryStore?.saveNow?.(reason||'followers');window.TerritoryStore?.render?.();}
  function get(id){const s=ensure();return s?.followers?.items?.[id]||null;}
  function getActiveId(){return ensure()?.followers?.activeFollower||null;}
  function getActive(){const id=getActiveId(),f=id?get(id):null,c=id?CATALOG[id]:null;return f&&c?Object.assign({id},clone(c),{level:f.level,xp:f.xp,owned:f.owned,awakened:f.awakened}):null;}
  function getStats(id){
    const cfg=CATALOG[id],f=get(id);if(!cfg||!f)return null;
    const out={};
    Object.keys(cfg.base).forEach(k=>out[k]=Math.round((cfg.base[k]+Math.max(0,f.level-1)*cfg.growth[k])*100)/100);
    if(f.awakened){
      if(id==='liabro'){out.critChance+=5;out.critDamage+=15;}
      if(id==='teralel'){out.defense*=1.12;out.hp*=1.08;}
      if(id==='king_cows'){out.heal*=1.15;out.hp*=1.06;}
      if(id==='mort'){out.dodge+=5;out.speed+=.5;}
      if(id==='stone_face'){out.control+=5;out.defense*=1.06;}
    }
    return out;
  }
  function xpToNext(level){return 100+(Math.max(1,Math.min(MAX_LEVEL,Number(level)||1))-1)*25;}
  function getProgress(id){const f=get(id);if(!f)return null;const need=f.level>=MAX_LEVEL?0:xpToNext(f.level);return{level:f.level,maxLevel:MAX_LEVEL,xp:f.xp,xpToNext:need,percent:need?Math.min(100,Math.round(f.xp/need*100)):100,awakened:f.awakened,awakeningLevel:AWAKENING_LEVEL};}
  function select(id){if(!CATALOG[id]||!get(id)?.owned)return{ok:false,reason:'not_owned'};ensure().followers.activeFollower=id;save('follower-select');return{ok:true,id};}
  function addXp(id,amount){const f=get(id);if(!f?.owned)return{ok:false,reason:'not_owned'};let n=Math.max(0,Number(amount)||0);while(n>0&&f.level<MAX_LEVEL){const need=xpToNext(f.level)-f.xp,take=Math.min(n,need);f.xp+=take;n-=take;if(f.xp>=xpToNext(f.level)){f.xp=0;f.level++;}}if(f.level>=MAX_LEVEL)f.xp=0;save('follower-xp');return{ok:true,level:f.level,xp:f.xp};}
  function awaken(id){const f=get(id);if(!f?.owned)return{ok:false,reason:'not_owned'};if(f.level<AWAKENING_LEVEL)return{ok:false,reason:'level_50_required'};if(f.awakened)return{ok:false,reason:'already_awakened'};f.awakened=true;f.awakeningClaimed=true;save('follower-awakening');return{ok:true,id};}
  ensure();
  window.Followers={MAX_LEVEL,AWAKENING_LEVEL,CATALOG,get,isOwned:id=>Boolean(get(id)?.owned),getActiveId,getActive,getStats,getProgress,xpToNext,select,addXp,awaken};
})();
