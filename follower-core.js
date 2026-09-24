/* Territory Game — Followers core / STEP-04-C
   Progression + characteristics.
   Economy prices are intentionally not hard-coded here.
*/
(function(){
  'use strict';

  const MAX_LEVEL = 100;
  const AWAKENING_LEVEL = 50;

  const CATALOG = Object.freeze({
    liabro: Object.freeze({
      id:'liabro', name:'Лиабро', role:'Крит', icon:'⚔️',
      priceCoins:null, awakening:'Усиленный критический эффект',
      base:{attack:8,defense:2,hp:80,speed:6,critChance:12,critDamage:150,dodge:3,heal:0,control:0},
      growth:{attack:1.10,defense:.30,hp:10,speed:.04,critChance:.10,critDamage:.60,dodge:.03,heal:0,control:0}
    }),
    teralel: Object.freeze({
      id:'teralel', name:'Тералель', role:'Защита', icon:'🛡️',
      priceCoins:null, awakening:'Усиленное снижение входящего урона',
      base:{attack:4,defense:8,hp:120,speed:4,critChance:3,critDamage:125,dodge:2,heal:0,control:0},
      growth:{attack:.55,defense:1.15,hp:14,speed:.02,critChance:.02,critDamage:.25,dodge:.02,heal:0,control:0}
    }),
    king_cows: Object.freeze({
      id:'king_cows', name:'Король-коров', role:'Лечение', icon:'❤️',
      priceCoins:null, awakening:'Усиленное лечение',
      base:{attack:4,defense:4,hp:110,speed:4,critChance:3,critDamage:125,dodge:2,heal:12,control:0},
      growth:{attack:.50,defense:.55,hp:13,speed:.02,critChance:.02,critDamage:.25,dodge:.02,heal:.65,control:0}
    }),
    mort: Object.freeze({
      id:'mort', name:'Морт', role:'Уворот', icon:'🌀',
      priceCoins:null, awakening:'Усиленный шанс уклонения',
      base:{attack:6,defense:3,hp:90,speed:8,critChance:7,critDamage:135,dodge:12,heal:0,control:0},
      growth:{attack:.80,defense:.35,hp:10,speed:.06,critChance:.06,critDamage:.40,dodge:.14,heal:0,control:0}
    }),
    stone_face: Object.freeze({
      id:'stone_face', name:'Каменное Лицо', role:'Контроль', icon:'💀',
      priceCoins:null, awakening:'Усиленный контроль противника',
      base:{attack:5,defense:5,hp:105,speed:3,critChance:4,critDamage:125,dodge:2,heal:0,control:10},
      growth:{attack:.65,defense:.70,hp:12,speed:.015,critChance:.03,critDamage:.30,dodge:.02,heal:0,control:.12}
    })
  });

  const DEFAULTS = {
    activeFollower:null,
    items:{
      liabro:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      teralel:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      king_cows:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      mort:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false},
      stone_face:{owned:false,level:1,xp:0,awakened:false,awakeningClaimed:false}
    }
  };

  function clone(x){return JSON.parse(JSON.stringify(x));}

  function ensure(){
    const store=window.TerritoryStore;
    if(!store?.state)return null;
    const root=store.state;
    root.followers=root.followers&&typeof root.followers==='object'
      ?root.followers:clone(DEFAULTS);
    root.followers.items=root.followers.items&&typeof root.followers.items==='object'
      ?root.followers.items:clone(DEFAULTS.items);

    Object.keys(DEFAULTS.items).forEach(id=>{
      const f=root.followers.items[id]=Object.assign(
        clone(DEFAULTS.items[id]), root.followers.items[id]||{}
      );
      f.owned=Boolean(f.owned);
      f.level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(f.level)||1)));
      f.xp=Math.max(0,Number(f.xp)||0);
      f.awakened=Boolean(f.awakened);
      f.awakeningClaimed=Boolean(f.awakeningClaimed);
      if(f.level<AWAKENING_LEVEL){
        f.awakened=false;
        f.awakeningClaimed=false;
      }
    });

    const active=root.followers.activeFollower;
    root.followers.activeFollower=
      (active&&root.followers.items[active]?.owned)?active:null;
    return root;
  }

  function xpToNext(level){
    const lv=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)));
    return 100+((lv-1)*25);
  }

  function get(id){
    const root=ensure();
    return root?.followers.items[id]||null;
  }

  function isOwned(id){return Boolean(get(id)?.owned);}

  function save(reason){
    window.TerritoryStore.save(reason);
    window.TerritoryStore.render();
  }

  function round(value,digits=2){
    const p=10**digits;
    return Math.round(value*p)/p;
  }

  /* Characteristics scale by level.
     Awakening is a second progression stage: at 50 the follower gets
     a permanent role bonus, then levels 51–100 continue normally. */
  function getStats(id){
    const c=CATALOG[id], f=get(id);
    if(!c||!f)return null;

    const level=f.level;
    const stats={};
    Object.keys(c.base).forEach(k=>{
      stats[k]=round(c.base[k]+(Math.max(0,level-1)*c.growth[k]));
    });

    if(f.awakened){
      if(id==='liabro'){
        stats.critChance=round(stats.critChance+5);
        stats.critDamage=round(stats.critDamage+15);
      }else if(id==='teralel'){
        stats.defense=round(stats.defense*1.12);
        stats.hp=round(stats.hp*1.08);
      }else if(id==='king_cows'){
        stats.heal=round(stats.heal*1.15);
        stats.hp=round(stats.hp*1.06);
      }else if(id==='mort'){
        stats.dodge=round(stats.dodge+5);
        stats.speed=round(stats.speed+0.5);
      }else if(id==='stone_face'){
        stats.control=round(stats.control+5);
        stats.defense=round(stats.defense*1.06);
      }
    }
    return stats;
  }

  function getProgress(id){
    const f=get(id);
    if(!f)return null;
    const need=xpToNext(f.level);
    return {
      level:f.level,
      maxLevel:MAX_LEVEL,
      xp:f.xp,
      xpToNext:f.level>=MAX_LEVEL?0:need,
      percent:f.level>=MAX_LEVEL?100:Math.min(100,Math.round((f.xp/need)*100)),
      awakened:f.awakened,
      awakeningLevel:AWAKENING_LEVEL
    };
  }

  function purchase(id){
    const cfg=CATALOG[id], follower=get(id);
    if(!cfg||!follower)return {ok:false,reason:'unknown_follower'};
    if(follower.owned)return {ok:false,reason:'already_owned'};
    if(cfg.priceCoins===null)return {ok:false,reason:'price_not_configured'};
    if(window.TerritoryStore.state.coins<cfg.priceCoins)
      return {ok:false,reason:'not_enough_coins'};

    window.TerritoryStore.state.coins-=cfg.priceCoins;
    follower.owned=true;
    if(!window.TerritoryStore.state.followers.activeFollower)
      window.TerritoryStore.state.followers.activeFollower=id;
    save('follower-purchase');
    return {ok:true,id:id};
  }

  function select(id){
    if(!isOwned(id))return {ok:false,reason:'not_owned'};
    window.TerritoryStore.state.followers.activeFollower=id;
    save('follower-select');
    return {ok:true,id:id};
  }

  function addXp(id,amount){
    const follower=get(id);
    if(!follower||!follower.owned)return {ok:false,reason:'not_owned'};

    let gained=Math.max(0,Number(amount)||0);
    while(gained>0&&follower.level<MAX_LEVEL){
      const need=xpToNext(follower.level)-follower.xp;
      const take=Math.min(gained,need);
      follower.xp+=take;
      gained-=take;

      if(follower.xp>=xpToNext(follower.level)){
        follower.xp=0;
        follower.level=Math.min(MAX_LEVEL,follower.level+1);
      }
    }

    if(follower.level>=MAX_LEVEL)follower.xp=0;
    save('follower-xp');
    return {
      ok:true,level:follower.level,xp:follower.xp,
      awakened:follower.awakened,remainingXp:gained
    };
  }

  function awaken(id){
    const follower=get(id);
    if(!follower||!follower.owned)return {ok:false,reason:'not_owned'};
    if(follower.level<AWAKENING_LEVEL)return {ok:false,reason:'level_50_required'};
    if(follower.awakened)return {ok:false,reason:'already_awakened'};

    follower.awakened=true;
    follower.awakeningClaimed=true;
    save('follower-awakening');
    return {ok:true,id:id,stats:getStats(id)};
  }

  function getActive(){
    const id=ensure()?.followers.activeFollower;
    return id?CATALOG[id]||null:null;
  }

  window.Followers={
    MAX_LEVEL,AWAKENING_LEVEL,CATALOG,
    get,isOwned,getActive,xpToNext,getStats,getProgress,
    purchase,select,addXp,awaken
  };
  ensure();
})();
