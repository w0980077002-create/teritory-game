/* Territory VIP + Alex Quest — clean standalone module.
   One file only. Add after app.js and arena.js in index.html.
*/
(()=>{
  'use strict';

  const VIP_KEY='territory_vip_v2';
  const QUEST_KEY='territory_alex_vip_quest_v2';
  const DAY=86400000;
  const TARGET_WINS=5;

  const read=(key, fallback)=>{
    try{
      const v=JSON.parse(localStorage.getItem(key)||'null');
      return v && typeof v==='object' ? v : fallback;
    }catch(e){ return fallback; }
  };
  const write=(key,v)=>{
    try{localStorage.setItem(key,JSON.stringify(v));}catch(e){}
  };

  const vip=Object.assign({
    until:0,
    claimed:false,
    history:[]
  },read(VIP_KEY,{}));

  const quest=Object.assign({
    accepted:false,
    completed:false,
    rewardClaimed:false
  },read(QUEST_KEY,{}));

  function saveAll(){
    write(VIP_KEY,vip);
    write(QUEST_KEY,quest);
  }

  function active(){
    return Number(vip.until)>Date.now();
  }

  function daysLeft(){
    return active()?Math.max(1,Math.ceil((vip.until-Date.now())/DAY)):0;
  }

  function arenaWins(){
    try{
      const s=JSON.parse(localStorage.getItem('territory_arena_v140')||'{}');
      return Math.max(0,Number(s.wins||0));
    }catch(e){return 0;}
  }

  function progress(){
    return Math.min(TARGET_WINS,arenaWins());
  }

  function grantVIP10(){
    const base=active()?Number(vip.until):Date.now();
    vip.until=base+10*DAY;
    vip.claimed=true;
    vip.history.unshift({
      at:Date.now(),
      text:'VIP получен за выполнение задания Алекса'
    });
    vip.history=vip.history.slice(0,20);
    saveAll();
    renderAll();
    toast('👑 Алекс наградил тебя VIP на 10 дней!');
  }

  function toast(text){
    const t=document.getElementById('arenaToast');
    if(!t)return;
    t.textContent=text;
    t.classList.add('show');
    clearTimeout(window.__territoryVipToast);
    window.__territoryVipToast=setTimeout(
      ()=>t.classList.remove('show'),2200
    );
  }

  function injectCSS(){
    if(document.getElementById('territoryVipAlexCSS'))return;
    const s=document.createElement('style');
    s.id='territoryVipAlexCSS';
    s.textContent=`
      .territory-alex-vip-btn{
        width:min(92%,430px);min-height:58px;margin:10px auto;
        display:flex;align-items:center;gap:10px;padding:9px 13px;
        box-sizing:border-box;border:1px solid rgba(255,215,90,.55);
        border-radius:15px;background:linear-gradient(180deg,rgba(31,34,43,.98),rgba(12,16,23,.98));
        color:#fff;box-shadow:0 4px 14px rgba(0,0,0,.28);
        cursor:pointer;text-align:left;position:relative;z-index:20;
      }
      .territory-alex-vip-btn .ico{font-size:25px}
      .territory-alex-vip-btn .txt{display:flex;flex-direction:column;flex:1;gap:2px}
      .territory-alex-vip-btn b{font-size:14px}
      .territory-alex-vip-btn small{font-size:11px;opacity:.78}
      .territory-alex-vip-btn .arr{font-size:25px;opacity:.7}

      .territory-vip-modal{
        position:fixed;inset:0;z-index:10000;padding:18px;box-sizing:border-box;
        display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.72);
      }
      .territory-vip-dialog{
        width:min(100%,390px);max-height:90vh;overflow:auto;
        box-sizing:border-box;padding:18px;border-radius:18px;
        border:1px solid rgba(255,215,90,.5);
        background:linear-gradient(180deg,#171b24,#0b0f15);color:#fff;
        box-shadow:0 15px 45px rgba(0,0,0,.55);position:relative;
      }
      .territory-vip-close{
        position:absolute;right:9px;top:7px;width:38px;height:38px;
        border:0;background:transparent;color:#fff;font-size:28px;cursor:pointer;
      }
      .territory-vip-title{font-size:21px;font-weight:800}
      .territory-vip-sub{opacity:.7;margin-top:2px}
      .territory-vip-box{
        margin:16px 0;padding:13px;border-radius:13px;
        background:rgba(255,255,255,.055);
      }
      .territory-vip-progress{
        height:9px;margin:10px 0 7px;border-radius:99px;
        background:rgba(255,255,255,.12);overflow:hidden;
      }
      .territory-vip-progress i{
        display:block;height:100%;width:0;
        background:linear-gradient(90deg,#b88720,#ffe27a);
        border-radius:99px;
      }
      .territory-vip-reward{
        margin-top:12px;padding:12px;border-radius:12px;
        border:1px solid rgba(255,215,90,.28);
      }
      .territory-vip-claim{
        width:100%;min-height:46px;border:0;border-radius:12px;
        font-weight:800;cursor:pointer;
      }
      .territory-vip-claim:disabled{opacity:.55;cursor:default}
      .territory-vip-list{margin:9px 0 0;padding-left:18px;line-height:1.55;font-size:13px}
    `;
    document.head.appendChild(s);
  }

  function findAlexAnchor(){
    const all=[...document.querySelectorAll('button,a,section,article,div')];
    return all.find(el=>{
      const text=(el.textContent||'').replace(/\\s+/g,' ').trim();
      if(!text || text.length>180)return false;
      return /Алекс/i.test(text) && /Лорд-командующий/i.test(text);
    }) || null;
  }

  function ensureButton(){
    if(document.getElementById('territoryAlexVipButton'))return;

    const anchor=findAlexAnchor();
    if(!anchor)return;

    const btn=document.createElement('button');
    btn.id='territoryAlexVipButton';
    btn.className='territory-alex-vip-btn';
    btn.type='button';
    btn.onclick=openQuest;
    anchor.insertAdjacentElement('afterend',btn);
    updateButton();
  }

  function updateButton(){
    const btn=document.getElementById('territoryAlexVipButton');
    if(!btn)return;

    const p=progress();
    const sub=quest.rewardClaimed
      ? 'VIP получен · 10 дней'
      : `Победы на Арене: ${p}/${TARGET_WINS}`;

    btn.innerHTML=`
      <span class="ico">👑</span>
      <span class="txt"><b>Задание Алекса</b><small>${sub}</small></span>
      <span class="arr">›</span>
    `;
  }

  function openQuest(){
    if(document.getElementById('territoryVipModal'))return;

    const p=progress();
    const completed=p>=TARGET_WINS || quest.completed;

    const m=document.createElement('div');
    m.id='territoryVipModal';
    m.className='territory-vip-modal';
    m.innerHTML=`
      <div class="territory-vip-dialog">
        <button class="territory-vip-close" aria-label="Закрыть">×</button>
        <div class="territory-vip-title">👑 Алекс</div>
        <div class="territory-vip-sub">Лорд-командующий</div>

        <div class="territory-vip-box">
          <b>🎯 Задание</b>
          <p>Докажи свою силу на Арене: одержи <b>${TARGET_WINS} побед</b>.</p>
          <div class="territory-vip-progress"><i style="width:${Math.min(100,p/TARGET_WINS*100)}%"></i></div>
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

        <button id="territoryVipClaim" class="territory-vip-claim" ${completed?'':'disabled'}>
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
        quest.accepted=true;
        quest.completed=true;
        quest.rewardClaimed=true;
        saveAll();
        grantVIP10();
        m.remove();
        updateButton();
      };
    }
  }

  function refreshQuestState(){
    if(!quest.rewardClaimed && progress()>=TARGET_WINS){
      quest.completed=true;
      saveAll();
    }
    updateButton();
  }

  function renderAll(){
    injectCSS();
    ensureButton();
    refreshQuestState();
  }

  window.territoryVIP={
    active,
    daysLeft,
    grant10:grantVIP10,
    render:renderAll
  };

  window.territoryAlexVIPQuest={
    open:openQuest,
    progress,
    target:TARGET_WINS,
    completed:()=>quest.completed,
    rewardClaimed:()=>quest.rewardClaimed
  };

  const observer=new MutationObserver(()=>renderAll());
  observer.observe(document.documentElement,{childList:true,subtree:true});

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-screen="city"]') ||
       e.target.closest('[data-screen="home"]')){
      setTimeout(renderAll,120);
    }
  });

  setTimeout(renderAll,400);
  setInterval(refreshQuestState,5000);
})();
