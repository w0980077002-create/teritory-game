/* Territory G64 — Economy & Reward Core
   One wallet API for coins, gems, energy and combat stones.
   City visual, PvE scene and Arena visuals remain separate. */
(function(){'use strict';
 const st=window.TerritoryStore?.state||window.TerritoryCore?.getState?.()||{};
 const KEY='territory_save_v1';
 const clamp=(n,min=0,max=Infinity)=>Math.max(min,Math.min(max,Number(n)||0));
 function save(reason){try{window.TerritoryStore?.saveNow?.(reason||'economy')}catch(e){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){} } window.dispatchEvent(new CustomEvent('territory:economy',{detail:{reason:reason||'economy'}}));}
 function ensure(){st.coins=clamp(st.coins);st.gems=clamp(st.gems);st.energy=clamp(st.energy,0,200);st.combatStone=clamp(st.combatStone);}
 function balance(currency){ensure();return Number(st[currency]||0);}
 function canAfford(currency,amount){return balance(currency)>=Math.max(0,Number(amount)||0)}
 function spend(currency,amount,reason){amount=Math.max(0,Number(amount)||0);ensure();if(!canAfford(currency,amount))return {ok:false,currency,amount,balance:balance(currency)};st[currency]-=amount;save(reason||('spend:'+currency));return {ok:true,currency,amount,balance:balance(currency)};}
 function grant(currency,amount,reason){amount=Math.max(0,Number(amount)||0);ensure();st[currency]=Number(st[currency]||0)+amount;if(currency==='energy')st.energy=clamp(st.energy,0,200);save(reason||('grant:'+currency));return {ok:true,currency,amount,balance:balance(currency)};}
 function transfer(from,to,amount,reason){const a=spend(from,amount,reason||'transfer');if(!a.ok)return a;return grant(to,amount,reason||'transfer');}
 function price(base,merchantRep=0){const r=Number(merchantRep)||0;return r>=5?Math.floor(base*.9):r>=2?Math.floor(base*.95):Math.max(0,Math.floor(base));}
 function claimDaily(){const today=new Date().toISOString().slice(0,10);if(st.dailyClaim===today)return {ok:false,already:true};st.dailyClaim=today;st.daily=st.daily||{date:'',streak:0,claimed:false};st.daily.streak=Number(st.daily.streak||0)+1;const coins=100+Math.min(100,st.daily.streak*10);st.daily.date=today;st.daily.claimed=true;grant('coins',coins,'daily-bonus');grant('combatStone',5,'daily-bonus');return {ok:true,coins,combatStone:5,streak:st.daily.streak};}
 function reward(pack,reason){const result={};for(const [k,v] of Object.entries(pack||{})){if(['coins','gems','energy','combatStone'].includes(k))result[k]=grant(k,v,reason||'reward')}return result;}
 function transactionLog(){return Array.isArray(st.economyLog)?st.economyLog:[]}
 function log(type,currency,amount,reason){st.economyLog=transactionLog();st.economyLog.push({type,currency,amount:Number(amount)||0,reason:String(reason||''),at:Date.now()});if(st.economyLog.length>40)st.economyLog=st.economyLog.slice(-40);save('economy-log');}
 const api={version:'G64',state:st,balance,canAfford,spend,grant,transfer,price,claimDaily,reward,log,save,ensure};
 window.TerritoryEconomy=api;
 if(window.TerritoryCore){window.TerritoryCore.economy=api;window.TerritoryCore.grant=(c,n,r)=>grant(c,n,r);window.TerritoryCore.spend=(c,n,r)=>spend(c,n,r);window.TerritoryCore.reward=(p,r)=>reward(p,r);}
 ensure();
})();
