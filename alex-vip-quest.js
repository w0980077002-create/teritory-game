/* Territory VIP — Alex quest
   Isolated module. Adds the VIP quest to Alex on the City screen.
   Requires vip.js to be loaded before this file.
   Does not modify Arena or systems-v145.js.
*/
(()=>{
  const KEY='territory_alex_vip_quest_v1';

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}
    catch(e){return {}}
  }
  const data=Object.assign({completed:false},read());

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(data))}
    catch(e){}
  }

  function toast(text){
    const t=document.getElementById('arenaToast');
    if(t){
      t.textContent=text;
      t.classList.add('show');
      clearTimeout(window.__alexVipToast);
      window.__alexVipToast=setTimeout(
        ()=>t.classList.remove('show'),2200
      );
    }else{
      alert(text);
    }
  }

  function getAlex(){
    return document.querySelector(
      '[data-action*="alex" i], [data-npc="alex" i], .alex-card, #alex, [onclick*="alex" i]'
    );
  }

  function openQuest(){
    if(document.getElementById('alexVipQuestModal')) return;

    const modal=document.createElement('div');
    modal.id='alexVipQuestModal';
    modal.className='alex-vip-modal';

    modal.innerHTML=`
      <div class="alex-vip-dialog">
        <button class="alex-vip-close" aria-label="Закрыть">×</button>
        <div class="alex-vip-title">👑 АЛЕКС</div>
        <div class="alex-vip-subtitle">Лорд-командующий</div>
        <div class="alex-vip-quest">
          <div class="alex-vip-quest-title">🎯 Особое задание</div>
          <div class="alex-vip-quest-text">
            Выполни задание Алекса и получи <b>VIP на 10 дней</b>.
          </div>
          <div class="alex-vip-reward">🎁 Награда: <b>VIP · 10 дней</b></div>
        </div>
        <button id="alexVipClaim" class="alex-vip-claim">
          ${data.completed?'✅ ЗАДАНИЕ ВЫПОЛНЕНО':'ПОЛУЧИТЬ VIP · 10 ДНЕЙ'}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.alex-vip-close').onclick=()=>modal.remove();
    modal.addEventListener('click',e=>{
      if(e.target===modal) modal.remove();
    });

    const claim=modal.querySelector('#alexVipClaim');
    if(data.completed){
      claim.disabled=true;
    }else{
      claim.onclick=complete;
    }
  }

  function complete(){
    if(data.completed) return;

    if(!window.territoryVIP ||
       typeof window.territoryVIP.grant10!=='function'){
      toast('⚠️ VIP-модуль ещё не подключён.');
      return;
    }

    data.completed=true;
    save();
    window.territoryVIP.grant10();
    toast('🎁 Алекс выдал тебе VIP на 10 дней!');

    const modal=document.getElementById('alexVipQuestModal');
    if(modal) modal.remove();
    render();
  }

  function createButton(){
    if(document.getElementById('alexVipQuestButton')) return;

    const button=document.createElement('button');
    button.id='alexVipQuestButton';
    button.className='alex-vip-quest-button';
    button.innerHTML=`
      <span class="alex-vip-icon">👑</span>
      <span class="alex-vip-button-text">
        <b>Задание Алекса</b>
        <small>${data.completed?'VIP получен · 10 дней':'Получить VIP · 10 дней'}</small>
      </span>
      <span class="alex-vip-arrow">›</span>
    `;
    button.onclick=openQuest;

    const alex=getAlex();

    if(alex && alex.parentElement){
      alex.parentElement.appendChild(button);
    }else{
      const main=document.querySelector('main') || document.body;
      main.appendChild(button);
    }
  }

  function render(){
    createButton();

    const b=document.getElementById('alexVipQuestButton');
    if(!b) return;

    const small=b.querySelector('small');
    if(small){
      small.textContent=data.completed
        ? 'VIP получен · 10 дней'
        : 'Получить VIP · 10 дней';
    }
  }

  window.territoryAlexVIPQuest={
    completed:()=>data.completed,
    open:openQuest,
    complete,
    render
  };

  document.addEventListener('click',e=>{
    const target=e.target.closest(
      '[data-screen="city"], [data-screen="home"], [data-screen="town"]'
    );
    if(target) setTimeout(render,100);
  });

  setTimeout(render,300);
})();
