/* Territory — Alex VIP Quest v4
   Load AFTER app.js and arena.js.
   Existing Alex button opens the quest directly.
*/
(()=>{
  'use strict';

  const VIP_KEY='territory_vip_v4';
  const QUEST_KEY='territory_alex_vip_quest_v4';
  const DAY=86400000;
  const TARGET_WINS=5;

  const read=(key,fallback)=>{
    try{
      const v=JSON.parse(localStorage.getItem(key)||'null');
      return v && typeof v==='object' ? v : fallback;
    }catch(e){ return fallback; }
  };
  const write=(key,value)=>{
    try{ localStorage.setItem(key,JSON.stringify(value)); }catch(e){}
  };

  const vip=Object.assign({until:0,history:[]},read(VIP_KEY,{}));
  const quest=Object.assign({
    startWins:0,
    accepted:false,
    completed:false,
    rewardClaimed:false
  },read(QUEST_KEY,{}));

  const getArenaWins=()=>{
    try{
      const s=JSON.parse(localStorage.getItem('territory_arena_v140')||'{}');
      return Math.max(0,Number(s.wins||0));
    }catch(e){ return 0; }
  };

  const active=()=>Number(vip.until)>Date.now();
  const daysLeft=()=>active()?Math.max(1,Math.ceil((vip.until-Date.now())/DAY)):0;

  function progress(){
    const current=getArenaWins();
    const start=Number(quest.startWins||0);
    return Math.min(TARGET_WINS,Math.max(0,current-start));
  }

  function save(){
    write(VIP_KEY,vip);
    write(QUEST_KEY,quest);
  }

  function toast(text){
    const t=document.getElementById('arenaToast');
    if(!t) return;
    t.textContent=text;
    t.classList.add('show');
    clearTimeout(window.__territoryVipToast);
    window.__territoryVipToast=setTimeout(()=>t.classList.remove('show'),2200);
  }

  function grantVIP10(){
    const base=active()?Number(vip.until):Date.now();
    vip.until=base+10*DAY;
    vip.history.unshift({at:Date.now(),text:'VIP получен за задание Алекса'});
    vip.history=vip.history.slice(0,20);
    save();
    toast('👑 Алекс наградил тебя VIP на 10 дней!');
  }

  function ensureCSS(){
    if(document.getElementById('territoryVipAlexCSS')) return;
    const s=document.createElement('style');
    s.id='territoryVipAlexCSS';
    s.textContent=`
      .territory-vip-modal{
        position:fixed;inset:0;z-index:100000;
        padding:16px;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.76);box-sizing:border-box;
      }
      .territory-vip-dialog{
        width:min(100%,390px);max-height:88vh;overflow:auto;
        padding:18px;box-sizing:border-box;border-radius:18px;
        border:1px solid rgba(255,215,90,.55);
        background:linear-gradient(180deg,#171b24,#0b0f15);
        color:#fff;box-shadow:0 15px 45px rgba(0,0,0,.6);
        position:relative;
      }
      .territory-vip-close{
        position:absolute;right:7px;top:5px;width:40px;height:40px;
        border:0;background:transparent;color:#fff;font-size:28px;
      }
      .territory-vip-title{font-size:22px;font-weight:800;padding-right:35px}
      .territory-vip-sub{opacity:.72;margin-top:2px}
      .territory-vip-box{
        margin:16px 0;padding:14px;border-radius:13px;
        background:rgba(255,255,255,.055);
      }
      .territory-vip-box p{line-height:1.4;margin:9px 0 12px}
      .territory-vip-progress{
        height:10px;margin:10px 0 7px;border-radius:99px;
        background:rgba(255,255,255,.12);overflow:hidden;
      }
      .territory-vip-progress i{
        display:block;height:100%;border-radius:99px;
        background:linear-gradient(90deg,#b88720,#ffe27a);
      }
      .territory-vip-reward{
        margin-top:12px;padding:12px;border-radius:12px;
        border:1px solid rgba(255,215,90,.28);
      }
      .territory-vip-list{margin:9px 0 0;padding-left:18px;line-height:1.55;font-size:13px}
      .territory-vip-claim{
        width:100%;min-height:48px;margin-top:14px;border:0;border-radius:12px;
        font-weight:800;cursor:pointer;
      }
      .territory-vip-claim:disabled{opacity:.55;cursor:default}
    `;
    document.head.appendChild(s);
  }

  function findAlex(){
    return document.querySelector('.guard-label[aria-label*="Alex"]') ||
           document.querySelector('[aria-label*="Alex"][aria-label*="Лорд-командующий"]');
  }

  function openQuest(){
    if(document.getElementById('territoryVipModal')) return;

    if(!quest.accepted && !quest.rewardClaimed){
      quest.accepted=true;
      quest.startWins=getArenaWins();
      save();
    }

    const p=progress();
    const completed=p>=TARGET_WINS || quest.completed;

    const m=document.createElement('div');
    m.id='territoryVipModal';
    m.className='territory-vip-modal';
    m.innerHTML=`
      <div class="territory-vip-dialog" role="dialog" aria-modal="true">
        <button class="territory-vip-close" type="button" aria-label="Закрыть">×</button>
        <div class="territory-vip-title">👑 Задание Алекса</div>
        <div class="territory-vip-sub">Лорд-командующий</div>

        <div class="territory-vip-box">
          <b>🎯 Задание</b>
          <p>Докажи свою силу на Арене: одержи <b>${TARGET_WINS} побед</b>.</p>
          <div class="territory-vip-progress">
            <i style="width:${Math.min(100,p/TARGET_WINS*100)}%"></i>
          </div>
          <div><b>${p}</b> / ${TARGET_WINS} побед</div>
        </div>

        <div class="territory-vip-reward">
          <b>🎁 Награда</b>
          <div style="margin-top:6px;font-size:18px">👑 VIP на 10 дней</div>
          <ul class="territory-vip-list">
            <li>VIP-статус</li>
            <li>VIP-метка профиля</li>
            <li>доступ к будущим VIP-привилегиям</li>
          </ul>
        </div>

        <button id="territoryVipClaim" class="territory-vip-claim" type="button"
          ${completed && !quest.rewardClaimed?'':'disabled'}>
          ${quest.rewardClaimed?'✅ VIP ПОЛУЧЕН':completed?'🎁 ПОЛУЧИТЬ VIP':'⚔️ СНАЧАЛА ОДЕРЖИ 5 ПОБЕД'}
        </button>
      </div>
    `;

    document.body.appendChild(m);
    m.querySelector('.territory-vip-close').onclick=()=>m.remove();
    m.addEventListener('click',e=>{if(e.target===m)m.remove()});

    const claim=m.querySelector('#territoryVipClaim');
    if(completed && !quest.rewardClaimed){
      claim.onclick=()=>{
        quest.completed=true;
        quest.rewardClaimed=true;
        grantVIP10();
        save();
        m.remove();
      };
    }
  }

  function hookAlex(){
    const alex=findAlex();
    if(!alex || alex.dataset.territoryVipHooked==='1') return;
    alex.dataset.territoryVipHooked='1';

    /* The screenshot already has a working Alex button.
       Use that exact button for the quest instead of adding another
       button that can fall off-screen or collide with the mobile HUD. */
    alex.addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openQuest();
    },true);
  }

  function refresh(){
    ensureCSS();
    hookAlex();

    if(!quest.rewardClaimed && quest.accepted && progress()>=TARGET_WINS){
      quest.completed=true;
      save();
    }
  }

  window.territoryVIP={active,daysLeft,grant10:grantVIP10,render:refresh};
  window.territoryAlexVIPQuest={
    open:openQuest,
    progress,
    target:TARGET_WINS,
    completed:()=>quest.completed,
    rewardClaimed:()=>quest.rewardClaimed
  };

  setTimeout(refresh,250);
  setInterval(refresh,1000);
})();
