/* Territory VIP Quest — isolated module.
   Quest completion grants VIP for 10 days through window.territoryVIP.grant10().
   Does not modify Arena or systems-v145.js. */

(()=>{
  const KEY='territory_vip_quest_v1';

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}
    catch(e){return {}}
  }

  const data=Object.assign({
    completed:false,
    progress:0,
    target:1
  },read());

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(data))}
    catch(e){}
  }

  function toast(text){
    const t=document.getElementById('arenaToast');
    if(t){
      t.textContent=text;
      t.classList.add('show');
      clearTimeout(window.__vipQuestToast);
      window.__vipQuestToast=setTimeout(
        ()=>t.classList.remove('show'),
        2200
      );
    }else{
      alert(text);
    }
  }

  function ensure(){
    if(document.getElementById('vipQuestPanel')) return;

    const inv=document.getElementById('inventory');
    if(!inv) return;

    const el=document.createElement('section');
    el.id='vipQuestPanel';
    el.className='vip-quest-card';

    el.innerHTML=`
      <div class="vip-quest-head">
        <b>🎯 ЗАДАНИЕ: ПОЛУЧИТЬ VIP</b>
        <small id="vipQuestStatus">0 / 1</small>
      </div>
      <div class="vip-quest-text">
        Выполни задание и получи <b>VIP на 10 дней</b>.
      </div>
      <button id="vipQuestComplete">ВЫПОЛНИТЬ ЗАДАНИЕ</button>
    `;

    inv.insertBefore(el,inv.firstChild);
    el.querySelector('#vipQuestComplete').onclick=complete;
  }

  function render(){
    ensure();

    const status=document.getElementById('vipQuestStatus');
    const btn=document.getElementById('vipQuestComplete');
    if(!status || !btn) return;

    if(data.completed){
      status.textContent='1 / 1';
      btn.textContent='✅ VIP ПОЛУЧЕН';
      btn.disabled=true;
    }else{
      status.textContent='0 / 1';
      btn.textContent='ВЫПОЛНИТЬ ЗАДАНИЕ';
      btn.disabled=false;
    }
  }

  function complete(){
    if(data.completed) return;

    if(!window.territoryVIP || typeof window.territoryVIP.grant10!=='function'){
      toast('⚠️ Сначала подключи vip.js');
      return;
    }

    data.progress=1;
    data.completed=true;
    save();
    window.territoryVIP.grant10();
    render();
    toast('🎁 Задание выполнено! VIP на 10 дней получен.');
  }

  window.territoryVIPQuest={
    completed:()=>data.completed,
    complete,
    render
  };

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-screen="inventory"]')){
      setTimeout(render,0);
    }
  });

  setTimeout(render,0);
})();
