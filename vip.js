/* Territory VIP — isolated module. Does not modify Arena or systems-v145. */
(()=>{
  const KEY='territory_vip_v1';
  const DAY=86400000;

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}
    catch(e){return {}}
  }

  const data=Object.assign({
    until:0,
    plan:'',
    claimed:false,
    history:[]
  },read());

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(data))}
    catch(e){}
  }

  function now(){return Date.now()}
  function active(){return Number(data.until)>now()}
  function daysLeft(){
    return active()?Math.max(1,Math.ceil((data.until-now())/DAY)):0;
  }

  function grant10(){
    const base=active()?Number(data.until):now();
    data.until=base+10*DAY;
    data.plan='vip10';
    data.claimed=true;
    data.history.unshift({
      at:now(),
      text:'VIP активирован на 10 дней'
    });
    data.history=data.history.slice(0,20);
    save();
    render();
    toast('👑 VIP активирован на 10 дней');
  }

  function ensure(){
    if(document.getElementById('vipPanel')) return;

    const inv=document.getElementById('inventory');
    if(!inv) return;

    const el=document.createElement('section');
    el.id='vipPanel';
    el.className='vip-card';

    el.innerHTML=`
      <div class="vip-head">
        <b>👑 TERRITORY VIP</b>
        <small id="vipStatus">Не активен</small>
      </div>
      <div class="vip-body">
        <div class="vip-benefits">
          <span>⚡ VIP-статус</span>
          <span>🎁 Ежедневный VIP-бонус</span>
          <span>✨ VIP-метка в профиле</span>
        </div>
        <button id="vip10Btn">АКТИВИРОВАТЬ VIP · 10 ДНЕЙ</button>
      </div>
    `;

    inv.insertBefore(el,inv.firstChild);
    el.querySelector('#vip10Btn').onclick=grant10;
  }

  function render(){
    ensure();

    const s=document.getElementById('vipStatus');
    const b=document.getElementById('vip10Btn');
    if(!s || !b) return;

    if(active()){
      s.textContent=`Активен · ${daysLeft()} дн.`;
      b.textContent='👑 VIP АКТИВЕН';
      b.disabled=true;
    }else{
      s.textContent='Не активен';
      b.textContent='АКТИВИРОВАТЬ VIP · 10 ДНЕЙ';
      b.disabled=false;
    }
  }

  function toast(text){
    const t=document.getElementById('arenaToast');
    if(t){
      t.textContent=text;
      t.classList.add('show');
      clearTimeout(window.__vipToast);
      window.__vipToast=setTimeout(
        ()=>t.classList.remove('show'),
        1800
      );
    }
  }

  window.territoryVIP={
    active,
    daysLeft,
    grant10,
    render
  };

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-screen="inventory"]')){
      setTimeout(render,0);
    }
  });

  setTimeout(render,0);
  setInterval(render,60000);
})();
