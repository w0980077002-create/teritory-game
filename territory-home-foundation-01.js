/* Territory — Home Foundation PASS 01
   - Removes the old release-candidate router from runtime.
   - Keeps Home utility actions: mail / trophy / settings.
   - Makes server profile.vip authoritative when available.
   - Keeps guest/dev fallback.
   - Never grants paid VIP on the client.
*/
(function(){
'use strict';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const S=()=>window.TerritoryStore?.state||{};
const auth=()=>window.TerritoryTelegramAuth;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function info(title,text,action){
  const m=document.getElementById('modal'),b=document.getElementById('modalBody');
  if(!m||!b)return;
  b.innerHTML='<h2>'+title+'</h2><p>'+text+'</p>'+
    (action?'<button class="gold-btn wide" data-modal-action="'+esc(action)+'">ОТКРЫТЬ</button>':'')+
    '<button class="dark-btn wide" data-home-foundation-close>ЗАКРЫТЬ</button>';
  m.classList.add('show');
}
function api(){
  const a=auth();
  return a?.state==='authenticated'&&typeof a.api==='function'?a:null;
}
async function openMail(){
  const a=api();
  if(!a){info('✉️ Почта','Открой игру через Telegram, чтобы загрузить серверную почту.');return;}
  const m=document.getElementById('modal'),b=document.getElementById('modalBody');
  if(!m||!b)return;
  b.innerHTML='<h2>✉️ Почта</h2><p>Загрузка…</p><button class="dark-btn wide" data-home-foundation-close>ЗАКРЫТЬ</button>';
  m.classList.add('show');
  try{
    const d=await a.api('/api/mail');
    const rows=Array.isArray(d)?d:(d.mail||d.items||[]);
    if(!rows.length){
      b.innerHTML='<h2>✉️ Почта</h2><p>Новых сообщений нет.</p><button class="dark-btn wide" data-home-foundation-close>ЗАКРЫТЬ</button>';
      return;
    }
    b.innerHTML='<h2>✉️ Почта</h2><div class="territory-home-mail-list">'+
      rows.slice(0,30).map(x=>{
        const id=esc(x.mail_id||x.id||''), claimed=!!x.claimed;
        return '<article class="territory-home-mail-card"><b>'+esc(x.subject||'Сообщение')+'</b>'+
          '<p>'+esc(x.body||'')+'</p>'+
          '<small>🪙 '+Number(x.coins||0)+' · 💎 '+Number(x.gems||0)+'</small>'+
          '<button class="gold-btn wide" data-home-mail-claim="'+id+'" '+(claimed?'disabled':'')+'>'+
          (claimed?'✓ Получено':'ЗАБРАТЬ')+'</button></article>';
      }).join('')+'</div><button class="dark-btn wide" data-home-foundation-close>ЗАКРЫТЬ</button>';
    b.querySelectorAll('[data-home-mail-claim]').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        const id=btn.dataset.homeMailClaim;if(!id)return;
        btn.disabled=true;
        try{
          const r=await a.api('/api/mail/claim',{method:'POST',body:JSON.stringify({mail_id:id})});
          if(r.state)Object.assign(S(),r.state);
          if(r.player){
            S().coins=Number(r.player.coins)||0;
            S().gems=Number(r.player.gems)||0;
            S().redGems=Number(r.player.red_gems)||0;
            S().level=Math.max(1,Number(r.player.level)||1);
            S().xp=Number(r.player.xp)||0;
          }
          window.TerritoryStore?.saveNow?.('home-mail-claim');
          btn.textContent='✓ Получено';
        }catch(e){
          btn.disabled=false;
          alert(e.message||'Награда почты недоступна.');
        }
      });
    });
  }catch(e){
    b.innerHTML='<h2>✉️ Почта</h2><p>'+esc(e.message||'Не удалось загрузить почту.')+'</p><button class="dark-btn wide" data-home-foundation-close>ЗАКРЫТЬ</button>';
  }
}
function openTrophy(){
  const s=S(),a=s.arena||{};
  info('🏆 Трофеи','Арена: '+Number(a.rating||1000)+' рейтинга · '+Number(a.wins||0)+' побед · '+Number(a.losses||0)+' поражений.<br>'+
    'Пройдено глав: '+Number(s.totalChaptersCompleted||0)+' · Найдено предметов: '+Number(s.lootFound||0)+'.');
}
async function refreshServer(){
  const a=api();
  if(!a){info('⚙️ Настройки','Открой игру через Telegram, чтобы синхронизировать серверный профиль.');return;}
  info('⚙️ Настройки','Синхронизация с сервером…');
  try{
    const d=await a.refresh();
    info('⚙️ Настройки',d?'Профиль и прогресс синхронизированы.':'Сервер не ответил. Локальный прогресс сохранён.');
  }catch(e){
    info('⚙️ Настройки','Не удалось синхронизировать профиль: '+esc(e.message||'ошибка'));
  }
}
function serverVip(){
  const p=S().profile||{}, a=auth()?.player||{};
  const raw=p.vip ?? p.vipLevel ?? a.vip ?? a.vip_level;
  if(raw===undefined||raw===null||raw==='')return null;
  const n=Number(raw);
  return Number.isFinite(n)?clamp(n,0,10):null;
}
function patchVip(){
  const v10=window.TerritoryVIP10;
  if(v10&&!v10.__homeFoundationServerCanonical){
    const originalGet=v10.get?.bind(v10);
    if(typeof originalGet==='function'){
      v10.get=function(){
        const local=originalGet(), sv=serverVip();
        if(sv===null)return local;
        return Object.assign({},local,{level:sv,tier:v10.tiers?.[sv]||local.tier});
      };
    }
    const originalSet=v10.setEntitlement;
    if(typeof originalSet==='function'){
      v10.setEntitlement=function(level){
        const sv=serverVip();
        if(auth()?.state==='authenticated'&&sv!==null)return this.get();
        return originalSet.call(this,level);
      };
    }
    v10.__homeFoundationServerCanonical=true;
  }
  const v=window.TerritoryVIP;
  if(v&&!v.__homeFoundationServerCanonical){
    const originalGet=v.get?.bind(v);
    if(typeof originalGet==='function'){
      v.get=function(){
        const local=originalGet(), sv=serverVip();
        if(sv===null)return local;
        return Object.assign({},local,{level:sv});
      };
    }
    const originalSet=v.setLevel;
    if(typeof originalSet==='function'){
      v.setLevel=function(level){
        const sv=serverVip();
        if(auth()?.state==='authenticated'&&sv!==null)return this.get();
        return originalSet.call(this,level);
      };
    }
    v.__homeFoundationServerCanonical=true;
  }
}
function emitVipRefresh(){
  patchVip();
  const level=serverVip();
  if(level===null)return;
  const tier=window.TerritoryVIP10?.tiers?.[level]||null;
  window.dispatchEvent(new CustomEvent('territory:vip10-change',{detail:{level,tier}}));
  window.dispatchEvent(new CustomEvent('territory:vip-change',{detail:{level,tier}}));
}
function install(){
  patchVip();
  document.addEventListener('click',e=>{
    const close=e.target.closest?.('[data-home-foundation-close]');
    if(close){
      e.preventDefault();e.stopPropagation();
      document.getElementById('modal')?.classList.remove('show');
      return;
    }
    const hit=e.target.closest?.('#home.active [data-home-action],#home.active [data-action]');
    if(!hit)return;
    const action=hit.dataset.homeAction||hit.dataset.action;
    if(!['mail','trophy','settings'].includes(action))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(action==='mail')openMail();
    else if(action==='trophy')openTrophy();
    else refreshServer();
  },true);
  window.addEventListener('territory:state-changed',emitVipRefresh);
  window.addEventListener('territory:telegram-authenticated',emitVipRefresh);
  window.addEventListener('pageshow',()=>setTimeout(emitVipRefresh,150));
  setTimeout(emitVipRefresh,120);
}
window.TerritoryHomeFoundation01={openMail,openTrophy,refreshServer,getServerVip:serverVip,syncVip:emitVipRefresh};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();