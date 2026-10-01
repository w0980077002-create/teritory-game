/* Territory — Telegram Identity Gate 01.
   Prevents the game from looking like a real player when Telegram auth failed. */
(function(){
'use strict';
if(window.TerritoryTelegramGate01)return;

let box=null;
function css(){
 if(document.getElementById('tgGate01Css'))return;
 const s=document.createElement('style');s.id='tgGate01Css';
 s.textContent=`
#tgGate01{position:fixed;inset:0;z-index:1000000;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(2,8,13,.96);color:#fff;font-family:system-ui,sans-serif}
#tgGate01 .card{width:min(430px,94vw);padding:24px;border:1px solid #d8b85e;border-radius:18px;background:#0a1822;box-shadow:0 20px 70px #000b;text-align:center}
#tgGate01 h2{margin:0 0 10px;color:#e8c76b}
#tgGate01 p{color:#b9c5ca;line-height:1.5;font-size:14px}
#tgGate01 b{color:#fff}
#tgGate01 .err{margin:12px 0;padding:10px;border-radius:10px;background:#2a1515;border:1px solid #713b3b;color:#ffb5b5;font-size:12px}
`;
 document.head.appendChild(s);
}
function show(message){
 css();
 if(!box){box=document.createElement('div');box.id='tgGate01';document.body.appendChild(box)}
 box.innerHTML='<div class="card"><div style="font-size:42px">📱</div><h2>Вход через Telegram</h2><p>Игра должна видеть тебя как настоящего Telegram-игрока, чтобы прогресс сохранялся отдельно для каждого аккаунта.</p><div class="err">'+String(message||'Открой игру через Telegram Mini App.').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))+'</div><p>Если ты уже открыл игру внутри Telegram, закрой Mini App и запусти его снова через кнопку игры у <b>@TeritoryGameBot</b>.</p></div>';
}
function hide(){box?.remove();box=null}
function check(){
 const a=window.TerritoryTelegramAuth;
 if(a?.state==='authenticated'){hide();return}
 if(a?.state==='error'||a?.state==='guest')show(a.error||'Telegram авторизация не получена.');
}
function boot(){
 check();
 window.addEventListener('territory:telegram-authenticated',hide);
 window.addEventListener('territory:telegram-auth-failed',e=>show(e.detail?.message||'Telegram initData не получен.'));
 setTimeout(check,800);
 setTimeout(check,2500);
}
window.TerritoryTelegramGate01={check,show,hide};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
