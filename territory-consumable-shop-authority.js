/* Territory — server-authoritative consumable shop bridge.
 * Intercepts the existing local consumable-shop click and routes purchases
 * through the Worker. No real payment logic is added here.
 */
(function(){
  'use strict';
  if(window.TerritoryConsumableShopAuthority08)return;
  const S=()=>window.TerritoryStore?.state||{};
  const A=()=>window.TerritoryTelegramAuth;
  const setMessage=(text)=>{const el=document.getElementById('merchantLog');if(el)el.textContent=text};
  async function buy(id){
    const auth=A();
    if(!auth||auth.state!=='authenticated'||typeof auth.api!=='function'){
      setMessage('Нужна авторизация Telegram для покупки.');
      return;
    }
    try{
      const d=await auth.api('/api/consumable/buy',{method:'POST',body:JSON.stringify({item_id:id})});
      if(d.state&&typeof d.state==='object')Object.assign(S(),d.state);
      if(d.player){
        S().coins=Math.max(0,Number(d.player.coins)||0);
        S().gems=Math.max(0,Number(d.player.gems)||0);
        S().redGems=Math.max(0,Number(d.player.red_gems)||0);
        S().level=Math.max(1,Number(d.player.level)||1);
        S().xp=Math.max(0,Number(d.player.xp)||0);
      }
      window.TerritoryStore?.saveNow?.('consumable-shop-authority08');
      window.CombatItems?.render?.();
      setMessage(`Куплено: ${id} ×1`);
    }catch(e){setMessage(e.message||'Покупка не выполнена.');}
  }
  document.addEventListener('click',function(e){
    const b=e.target?.closest?.('[data-buy-consumable]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    buy(String(b.dataset.buyConsumable||''));
  },true);
  window.TerritoryConsumableShopAuthority08={buy};
})();
