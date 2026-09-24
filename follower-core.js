/* Territory Game — Followers core / STEP-04-A */
(function(){
  'use strict';

  const MAX_LEVEL=100;
  const AWAKENING_LEVEL=50;
  const CATALOG=Object.freeze({
    liabro:Object.freeze({id:'liabro',name:'Лиабро',role:'Крит',icon:'⚔️',priceCoins:null,awakening:'Усиленный критический эффект'}),
    teralel:Object.freeze({id:'teralel',name:'Тералель',role:'Защита',icon:'🛡️',priceCoins:null,awakening:'Усиленное снижение входящего урона'}),
    king_cows:Object.freeze({id:'king_cows',name:'Король-коров',role:'Лечение',icon:'❤️',priceCoins:null,awakening:'Усиленное лечение'}),
    mort:Object.freeze({id:'mort',name:'Морт',role:'Уворот',icon:'🌀',priceCoins:null,awakening:'Усиленный шанс уклонения'}),
    stone_face:Object.freeze({id:'stone_face',name:'Каменное Лицо',role:'Контроль',icon:'💀',priceCoins:null,awakening:'Усиленный контроль противника'})
  });

  const DEFAULTS={
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
    root.followers=root.followers&&typeof root.followers==='object'?root.followers:clone(DEFAULTS);
    root.followers.items=root.followers.items&&typeof root.followers.items==='object'?root.followers.items:clone(DEFAULTS.items);
    Object.keys(DEFAULTS.items).forEach(id=>{
      const f=root.followers.items[id]=Object.assign(clone(DEFAULTS.items[id]),root.followers.items[id]||{});
      f.owned=Boolean(f.owned);
      f.level=Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(f.level)||1)));
      f.xp=Math.max(0,Number(f.xp)||0);
      f.awakened=Boolean(f.awakened);
      f.awakeningClaimed=Boolean(f.awakeningClaimed);
      if(f.level<AWAKENING_LEVEL){f.awakened=false;f.awakeningClaimed=false;}
    });
    const active=root.followers.activeFollower;
    root.followers.activeFollower=(active&&root.followers.items[active]?.owned)?active:null;
    return root;
  }
  function xpToNext(level){return 100+((Math.max(1,Math.min(MAX_LEVEL,Math.floor(Number(level)||1)))-1)*25);}
  function get(id){const root=ensure();return root?.followers.items[id]||null;}
  function isOwned(id){return Boolean(get(id)?.owned);}
  function save(reason){window.TerritoryStore.save(reason);window.TerritoryStore.render();}

  function purchase(id){
    const cfg=CATALOG[id],follower=get(id);
    if(!cfg||!follower)return {ok:false,reason:'unknown_follower'};
    if(follower.owned)return {ok:false,reason:'already_owned'};
    if(cfg.priceCoins===null)return {ok:false,reason:'price_not_configured'};
    if(window.TerritoryStore.state.coins<cfg.priceCoins)return {ok:false,reason:'not_enough_coins'};
    window.TerritoryStore.state.coins-=cfg.priceCoins;
    follower.owned=true;
    if(!window.TerritoryStore.state.followers.activeFollower)window.TerritoryStore.state.followers.activeFollower=id;
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
      follower.xp+=take;gained-=take;
      if(follower.xp>=xpToNext(follower.level)){follower.xp=0;follower.level=Math.min(MAX_LEVEL,follower.level+1);}
    }
    if(follower.level>=MAX_LEVEL)follower.xp=0;
    save('follower-xp');
    return {ok:true,level:follower.level,xp:follower.xp,awakened:follower.awakened,remainingXp:gained};
  }

  function awaken(id){
    const follower=get(id);
    if(!follower||!follower.owned)return {ok:false,reason:'not_owned'};
    if(follower.level<AWAKENING_LEVEL)return {ok:false,reason:'level_50_required'};
    if(follower.awakened)return {ok:false,reason:'already_awakened'};
    follower.awakened=true;follower.awakeningClaimed=true;
    save('follower-awakening');
    return {ok:true,id:id};
  }

  function getActive(){const id=ensure()?.followers.activeFollower;return id?CATALOG[id]||null:null;}

  window.Followers={MAX_LEVEL,AWAKENING_LEVEL,CATALOG,get,isOwned,getActive,xpToNext,purchase,select,addXp,awaken};
  ensure();
})();
