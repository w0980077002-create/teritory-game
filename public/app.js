const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='territoryCompleteV1';
const defaults={route:'city',ria:170,bank:450,level:1,xp:30,hp:165,maxHp:165,energy:100,maxEnergy:100,str:10,def:8,agi:7,skill:2,weapon:null,armor:null,
inventory:[
{id:'baton',name:'Телескопическая дубинка',type:'weapon',qty:1,bonus:2},
{id:'jacket',name:'Кожаная куртка',type:'armor',qty:1,bonus:2},
{id:'med',name:'Аптечка',type:'med',qty:2},
{id:'lockpick',name:'Отмычка',type:'tool',qty:2}
],
missions:{courier:false,rat:false,debt:false,boss:false},
clan:{name:'Северный район',rank:'Боец',members:18,power:6210},
stats:{wins:0,losses:0,territories:1},
chat:[
['Серый','Сегодня после полуночи лучше не ходить через промзону.'],
['Марк','На рынке появился новый товар.'],
['Лиса','Кто идёт на окраину — пишите.']
],
globalChat:[
['Городской','Добро пожаловать в город.'],
['Марк','Кто знает, где сегодня работа?'],
['Лиса','На северном рынке появился новый товар.'],
['Седой','После полуночи в промзоне лучше быть осторожнее.']
],
log:['[СИСТЕМА] Добро пожаловать в город.','[ГОРОД] Улица тихая, но ненадолго.']};
let S=JSON.parse(localStorage.getItem(KEY)||'null')||defaults; S.chatTab=S.chatTab||'global';
let enemy={name:'Карманник',level:1,hp:50,maxHp:50,reward:35,xp:24,damage:8};
let target='Голова',block='Голова + Грудь';

const enemies=[
{name:'Карманник',level:1,hp:50,reward:35,xp:24,damage:8},
{name:'Боец окраины',level:2,hp:82,reward:65,xp:42,damage:12},
{name:'Смотрящий',level:4,hp:130,reward:110,xp:72,damage:17},
{name:'Авторитет',level:7,hp:205,reward:190,xp:130,damage:23}
];
const nav=[['city','Город','⌂'],['character','Герой','Т'],['missions','Задания','!'],['chat','Чат','Ч'],['clan','Клан','♜'],['arena','Арена','X']];
function save(){localStorage.setItem(KEY,JSON.stringify(S));$('#money').textContent=S.ria}
function toast(t){let e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>e.classList.remove('show'),1700)}
function route(r){S.route=r;render();scrollTo({top:0,behavior:'smooth'})}
function xp(n){S.xp+=n;while(S.xp>=S.level*100){S.xp-=S.level*100;S.level++;S.maxHp+=12;S.hp=S.maxHp;S.skill++;S.str++;S.log.push('[УРОВЕНЬ] Повышение до '+S.level+'. Получено очко навыка.');toast('Новый уровень: '+S.level)}}
function stats(){return `<div class="status-grid">
<div class="status"><small>Здоровье</small><b>${S.hp}/${S.maxHp}</b><div class="meter"><i style="width:${S.hp/S.maxHp*100}%"></i></div></div>
<div class="status"><small>Энергия</small><b>${S.energy}/${S.maxEnergy}</b><div class="meter energy"><i style="width:${S.energy}%"></i></div></div>
<div class="status"><small>Опыт</small><b>${S.xp}/${S.level*100}</b><div class="meter xp"><i style="width:${S.xp/(S.level*100)*100}%"></i></div></div></div>`}
function city(){return `<h1 class="page-title">ГОРОД</h1><p class="lead">09 СЕНТЯБРЯ · НОЧНОЙ СЕКТОР</p>
<section class="panel hero"><div class="copy"><div style="color:#a77759;font-size:9px;letter-spacing:2px">РАЙОН 07 / ОКРАИНА</div><h1>Здесь каждый<br>знает цену улице.</h1><p>Работа. Долги. Стычки. Территории. Решай, кем ты станешь в этом городе.</p><button class="btn" style="margin-top:12px" onclick="route('arena')">Выйти на улицу</button></div><div class="street"><div class="house h1"></div><div class="house h2"></div><div class="house h3"></div><div class="lamp"></div><div class="person"></div></div></section>${stats()}
<div class="section"><div class="panel-head">РАЙОНЫ ГОРОДА</div><div class="panel-body city-grid">
<button class="place" onclick="district('Центр','Рынок, банк, NPC и новые контракты')"><span class="mark">01</span><b>Центр</b><small>рынок · банк · объявления</small><em class="state open">ОТКРЫТО</em></button>
<button class="place" onclick="route('missions')"><span class="mark">02</span><b>Северный район</b><small>задания · тайники · клан</small><em class="state open">ОТКРЫТО</em></button>
<button class="place" onclick="route('arena')"><span class="mark">03</span><b>Окраина</b><small>уличные бои · риск · добыча</small><em class="state open">ОТКРЫТО</em></button>
<button class="place" onclick="district('Промзона','Высокий риск. Доступна с 3 уровня')"><span class="mark">04</span><b>Промзона</b><small>контрабанда · редкие предметы</small><em class="state">${S.level>=3?'ОТКРЫТО':'LVL 3'}</em></button>
<button class="place" onclick="district('Порт','Торговцы и клановые операции')"><span class="mark">05</span><b>Порт</b><small>торговцы · операции</small><em class="state">${S.level>=5?'ОТКРЫТО':'LVL 5'}</em></button>
<button class="place" onclick="district('Старый город','Опасный район. Доступен с 7 уровня')"><span class="mark">06</span><b>Старый город</b><small>боссы · элитные контракты</small><em class="state">${S.level>=7?'ОТКРЫТО':'LVL 7'}</em></button>
</div></div>
<div class="columns"><section class="panel"><div class="panel-head">ГОРОДСКИЕ СЛУЖБЫ</div><div class="panel-body">
<div class="row" onclick="hospital()"><div class="row-left"><div class="iconbox">+</div><div><b>Больница</b><small>восстановить здоровье</small></div></div><span class="value">25 Ria</span></div>
<div class="row" onclick="bank()"><div class="row-left"><div class="iconbox">Б</div><div><b>Банк</b><small>счёт: ${S.bank} Ria</small></div></div><span class="value">→</span></div>
<div class="row" onclick="route('shop')"><div class="row-left"><div class="iconbox">М</div><div><b>Магазин</b><small>экипировка и расходники</small></div></div><span class="value">→</span></div>
</div></section><section class="panel"><div class="panel-head">СВОДКА</div><div class="panel-body">
<table class="table"><tr><td>Уровень</td><td class="num">${S.level}</td></tr><tr><td>Победы</td><td class="num">${S.stats.wins}</td></tr><tr><td>Поражения</td><td class="num">${S.stats.losses}</td></tr><tr><td>Территории</td><td class="num">${S.stats.territories}</td></tr></table>
</div></section></div>`}
function character(){return `<h1 class="page-title">ГЕРОЙ</h1><p class="lead">Профиль · характеристики · экипировка</p>
<section class="panel char-card"><div class="portrait"><div class="head"></div><div class="coat"></div><div class="stripe"></div><div class="scar"></div></div><div class="panel-body"><div style="color:#a77759;font-size:9px">ИГРОК</div><h2 style="font:600 22px Oswald;margin:3px 0">Странник</h2><div class="notice">Уровень ${S.level}. Репутация пока неизвестна.</div><div class="equip"><div class="slot"><small>ОРУЖИЕ</small><b>${S.weapon||'Не экипировано'}</b></div><div class="slot"><small>ОДЕЖДА</small><b>${S.armor||'Не экипировано'}</b></div></div></div></section>
<div class="section"><div class="panel-head">ХАРАКТЕРИСТИКИ · ${S.skill} ОЧК.</div><div class="panel-body">${[['Сила','str','урон'],['Защита','def','снижение урона'],['Ловкость','agi','уклонение']].map(x=>`<div class="row"><div><b>${x[0]}</b><small>${x[2]}</small></div><div><span class="value">${S[x[1]]}</span> <button class="btn secondary" style="padding:6px 9px" onclick="upgrade('${x[1]}')">+</button></div></div>`).join('')}</div></div>
<div class="section"><button class="btn secondary wide" onclick="route('inventory')">Открыть инвентарь</button></div>`}
function inventory(){return `<h1 class="page-title">ИНВЕНТАРЬ</h1><p class="lead">Предметы и экипировка</p><div class="panel"><div class="panel-head">СНАРЯЖЕНИЕ</div><div class="panel-body">${S.inventory.map((it,i)=>`<div class="row"><div class="row-left"><div class="iconbox">${it.type==='weapon'?'О':it.type==='armor'?'Д':it.type==='med'?'+':'И'}</div><div><b>${it.name}</b><small>${it.type==='weapon'?'оружие · +'+it.bonus+' сила':it.type==='armor'?'одежда · +'+it.bonus+' защита':it.type==='med'?'лечение · '+it.qty+' шт.':'инструмент · '+it.qty+' шт.'}</small></div></div>${it.type==='weapon'||it.type==='armor'?`<button class="btn secondary" style="padding:7px" onclick="equip(${i})">${(it.type==='weapon'?S.weapon:S.armor)===it.name?'Снять':'Надеть'}</button>`:''}</div>`).join('')}</div></div>
<button class="btn secondary wide" onclick="useMed()">Использовать аптечку</button>`}
const shopItems=[
['knife','Складной нож','О',85,'weapon',3],['vest','Бронежилет','Д',140,'armor',5],['medkit','Аптечка','+',35,'med',1],['lock','Набор отмычек','И',55,'tool',2],['pistol','Пистолет «Старт»','О',260,'weapon',7]
];
function shop(){return `<h1 class="page-title">МАГАЗИН</h1><p class="lead">Официальная витрина · наличный расчёт</p><div class="notice" style="margin-bottom:10px">Баланс: <span class="gold">${S.ria} Ria</span>. Некоторые товары требуют определённого уровня.</div><div class="list">${shopItems.map((it,i)=>`<div class="row"><div class="row-left"><div class="iconbox">${it[2]}</div><div><b>${it[1]}</b><small>${it[4]==='weapon'?'оружие · +'+it[5]+' сила':it[4]==='armor'?'броня · +'+it[5]+' защита':it[4]==='med'?'восстановление HP':'инструмент'}</small></div></div><div style="text-align:right"><div class="value">${it[3]} Ria</div><button class="btn secondary" style="padding:7px;margin-top:3px" onclick="buy(${i})">Купить</button></div></div>`).join('')}</div>`}
function missions(){let q=[['courier','Ночной курьер','Передай конверт в Северный район.',55,35],['rat','Зачистка двора','Победи первого уличного противника.',35,24],['debt','Старый долг','Собери 100 Ria любым способом.',80,50],['boss','Поставить точку','Победи Авторитета на арене.',190,130]];return `<h1 class="page-title">ЗАДАНИЯ</h1><p class="lead">Контракты города</p><div class="tabs"><button class="tab active">АКТИВНЫЕ</button><button class="tab" onclick="toast('Архив будет доступен после первых завершённых контрактов')">АРХИВ</button></div>${q.map(m=>`<article class="quest"><h3>${m[1]}</h3><p>${m[2]}</p><div class="quest-foot"><span class="reward">НАГРАДА: ${m[3]} Ria · ${m[4]} XP</span><button class="btn secondary" style="padding:7px 10px" onclick="mission('${m[0]}')">${S.missions[m[0]]?'Выполнено':'Начать'}</button></div></article>`).join('')}` }
function chat(){
  render();
if(S.route==='chat') loadChats();
  loadChats();
}
function chatTab(type){
  S.chatTab=type;
  render();
  loadChats();
}
function chatView(){
  const type=S.chatTab||'global';
  const title=type==='global'?'ОБЩИЙ ЧАТ':'КЛАНОВЫЙ ЧАТ';
  const arr=type==='global'?S.globalChat:S.chat;
  return `<h1 class="page-title">ЧАТ</h1>
  <p class="lead">Общий городской чат · клановый чат · онлайн</p>
  <div class="tabs">
    <button class="tab ${type==='global'?'active':''}" onclick="chatTab('global')">ОБЩИЙ</button>
    <button class="tab ${type==='clan'?'active':''}" onclick="chatTab('clan')">КЛАНОВЫЙ</button>
  </div>
  <section class="panel">
    <div class="panel-head">${title}<span id="chatStatus" class="chat-status">подключение...</span></div>
    <div class="panel-body">
      <div class="chat" id="onlineChat">${arr.map(x=>`<div class="msg"><b>${escapeHtml(x[0])}</b><p>${escapeHtml(x[1])}</p></div>`).join('')}</div>
      <div class="chatbar">
        <input id="onlineInput" placeholder="${type==='global'?'Написать всем игрокам...':'Сообщение участникам клана...'}" maxlength="240"
          onkeydown="if(event.key==='Enter'){event.preventDefault();sendOnlineChat()}">
        <button class="btn" onclick="sendOnlineChat()">Отправить</button>
      </div>
    </div>
  </section>`;
}
function escapeHtml(v){
  return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
async function api(path, options={}){
  const tg=window.Telegram?.WebApp;
  const headers=Object.assign({'Content-Type':'application/json'}, options.headers||{});
  if(tg?.initData) headers['X-Telegram-Init-Data']=tg.initData;
  const r=await fetch(path,Object.assign({},options,{headers}));
  if(!r.ok) throw new Error(await r.text());
  return r.json();
}
async function loadChats(){
  try{
    const [g,c]=await Promise.all([
      api('/api/chat/general?limit=60'),
      api('/api/chat/clan?limit=60')
    ]);
    S.globalChat=(g.messages||[]).map(m=>[m.name,m.text]);
    S.chat=(c.messages||[]).map(m=>[m.name,m.text]);
    save();
    const box=$('#onlineChat');
    if(box) box.innerHTML=(S.chatTab==='clan'?S.chat:S.globalChat).map(x=>`<div class="msg"><b>${escapeHtml(x[0])}</b><p>${escapeHtml(x[1])}</p></div>`).join('');
    const st=$('#chatStatus'); if(st) st.textContent='онлайн';
  }catch(e){
    const st=$('#chatStatus'); if(st) st.textContent='офлайн';
  }
}
async function sendOnlineChat(){
  const i=$('#onlineInput'); if(!i||!i.value.trim()) return;
  const text=i.value.trim(); i.value='';
  try{
    const path=(S.chatTab||'global')==='clan'?'/api/chat/clan':'/api/chat/general';
    await api(path,{method:'POST',body:JSON.stringify({text})});
    await loadChats();
    render();
    toast('Сообщение отправлено');
  }catch(e){
    toast('Не удалось отправить сообщение');
    i.value=text;
  }
}
function sendChat(){ S.chatTab='clan'; return sendOnlineChat(); }
function sendGlobalChat(){ S.chatTab='global'; return sendOnlineChat(); }
function sendClanChat(){ S.chatTab='clan'; return sendOnlineChat(); }
function sendClanInline(){ S.chatTab='clan'; route('chat'); }
function district(name,desc){openModal(`<div class="modalhead"><div><b style="font:500 19px Oswald">${name}</b><small style="display:block;color:#877b6d">${desc}</small></div><button class="close" onclick="closeModal()">X</button></div><div class="notice">Район является частью общей карты города. Здесь будут размещаться реальные NPC, магазины и события.</div><div class="section"><button class="btn wide" onclick="closeModal();route('missions')">Посмотреть задания</button><button class="btn secondary wide" onclick="closeModal();route('arena')">Идти на улицу</button></div>`)}
function openModal(h){$('#modal').innerHTML='<div class="modal">'+h+'</div>';$('#modal').classList.add('show')}
function closeModal(){$('#modal').classList.remove('show')}
window.route=route;window.toast=toast;window.upgrade=upgrade;window.equip=equip;window.useMed=useMed;window.buy=buy;window.chooseEnemy=chooseEnemy;window.setTarget=setTarget;window.setBlock=setBlock;window.attack=attack;window.defend=defend;window.pvp=pvp;window.mission=mission;window.hospital=hospital;window.bank=bank;window.deposit=deposit;window.withdraw=withdraw;window.capture=capture;window.chat=chat;window.chatTab=chatTab;window.sendChat=sendChat;window.sendGlobalChat=sendGlobalChat;window.sendClanChat=sendClanChat;window.sendClanInline=sendClanInline;window.district=district;window.openModal=openModal;window.closeModal=closeModal;
try{window.Telegram?.WebApp?.ready();window.Telegram?.WebApp?.expand()}catch(e){}
render();

let socket=null;
function connectChatSocket(){
  try{
    const proto=location.protocol==='https:'?'wss':'ws';
    socket=new WebSocket(proto+'://'+location.host+'/ws');
    socket.onopen=()=>{const s=$('#chatStatus');if(s)s.textContent='онлайн';};
    socket.onmessage=ev=>{
      try{
        const m=JSON.parse(ev.data);
        if(m.channel==='general') S.globalChat.push([m.name,m.text]);
        if(m.channel==='clan') S.chat.push([m.name,m.text]);
        if(S.globalChat.length>100) S.globalChat=S.globalChat.slice(-100);
        if(S.chat.length>100) S.chat=S.chat.slice(-100);
        save();
        if(S.route==='chat') render();
      }catch(_){}
    };
    socket.onclose=()=>{setTimeout(connectChatSocket,3000)};
  }catch(_){}
}
connectChatSocket();
