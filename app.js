const state={crystals:1330,gold:1779,energy:191,lang:"ru"};
const $=s=>document.querySelector(s);
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),1700)}
function render(){ $("#crystals").textContent=state.crystals; $("#gold").textContent=state.gold; $("#energy").textContent=`${state.energy}/200`; }
function openModal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").hidden=false}
function buy(type,price,amount=1){
  if(type==="crystals"){state.gold-=price;state.crystals+=amount}
  if(type==="energy"){state.crystals-=price;state.energy=Math.min(200,state.energy+amount)}
  if(type==="gold"){state.crystals-=price;state.gold+=amount}
  render();toast("Покупка выполнена")
}
const actions={
  profile:()=>openModal("Профиль","<p>Глава 5 · Уровень 3</p><p>Опыт: 120 / 300</p><p>Свободные очки: 0</p>"),
  messages:()=>openModal("Сообщения","<div class='modal-list'><button>⚔ Новое сообщение от игрока</button><button>📢 Новости Sdolars</button></div>"),
  achievements:()=>openModal("Достижения","<div class='modal-list'><button>🏆 Первое сражение</button><button>🏆 Исследователь Sdolars</button></div>"),
  settings:()=>openModal("Настройки","<div class='modal-list'><button>🔊 Звук: Вкл</button><button>📱 Графика: Авто</button><button>🔔 Уведомления</button></div>"),
  language:()=>{state.lang=state.lang==="ru"?"en":"ru";toast(state.lang==="ru"?"Русский":"English")},
  quest:()=>openModal("Текущее задание","<h3>Поговори с кузнецом</h3><p>Отправляйся в кузницу Sdolars.</p><button class='buy-row' onclick='toast("Кузница открыта")'>Открыть кузницу</button>"),
  daily:()=>openModal("Ежедневный бонус","<h3>🎁 Сундук готовится!</h3><p>Откройте ежедневный бонус, когда таймер завершится.</p>"),
  bonuses:()=>openModal("Бонусы","<div class='modal-list'><button>🎁 Ежедневный сундук</button><button>🎁 Бонус за вход</button></div>"),
  events:()=>openModal("События","<div class='modal-list'><button>⚔ Турнир Sdolars</button><button>🛡 Групповой бой</button></div>"),
  vip:()=>openModal("VIP","<p>VIP-бонусы и дополнительные награды.</p>"),
  game:()=>openModal("Game","<div class='modal-list'><button>🎮 Мини-игры</button><button>🏹 Испытания</button></div>"),
  forge:()=>openModal("Кузница","<p>Здесь позже будет ремонт и улучшение экипировки.</p>"),
  tavern:()=>openModal("Таверна","<p>Отдых, задания и городские персонажи.</p>"),
  shop:()=>openModal("Магазин",`<div class="buy-row"><span>💎 100 камней</span><button onclick="buy('crystals',100,100)">Купить за 1000 🪙</button></div><div class="buy-row"><span>🪙 1000 золота</span><button onclick="buy('gold',100,1000)">Купить за 100 💎</button></div><div class="buy-row"><span>⚡ +20 энергии</span><button onclick="buy('energy',20,20)">Купить за 20 💎</button></div>`),
  fight:()=>openModal("Бой","<div class='modal-list'><button onclick='toast("Поиск соперника…")'>⚔ Быстрый бой</button><button onclick='actions.arena()'>🏟 Перейти на Арену</button></div>"),
  arena:()=>openModal("Арена","<div class='modal-list'><button onclick='toast("Создан бой 1×1")'>⚔ 1×1 бой</button><button onclick='toast("Открыт хаотичный бой")'>🔀 Хаотичный бой</button><button onclick='toast("Открыт групповой бой")'>👥 Групповой бой</button></div>"),
  inventory:()=>openModal("Инвентарь","<p>🎒 Инвентарь персонажа пуст в стартовой версии.</p>"),
  equipment:()=>openModal("Экипировка","<p>🛡 Здесь будет экипировка и характеристики предметов.</p>"),
  tasks:()=>openModal("Задания","<div class='modal-list'><button>📜 Поговори с кузнецом</button><button>📜 Подготовься к бою</button></div>"),
  map:()=>openModal("Карта","<p>🗺 Sdolars — карта города будет подключена следующим этапом.</p>")
};
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-action]");
  if(b && actions[b.dataset.action]) actions[b.dataset.action]();
  if(e.target.matches("[data-close]")||e.target===$("#modal")) $("#modal").hidden=true;
  const r=e.target.closest("[data-resource]");
  if(r) openModal(r.dataset.resource==="crystals"?"Камни":r.dataset.resource==="gold"?"Золото":"Энергия",
    `<p>Текущее количество: <b>${r.dataset.resource==="crystals"?state.crystals:r.dataset.resource==="gold"?state.gold:state.energy}</b></p>
     <div class="buy-row"><span>Пополнить ресурс</span><button onclick="toast('Магазин пополнения открыт')">+</button></div>`);
});
render();
let left=23*3600+45*60+12;
setInterval(()=>{left=Math.max(0,left-1);const h=String(Math.floor(left/3600)).padStart(2,"0"),m=String(Math.floor(left%3600/60)).padStart(2,"0"),s=String(left%60).padStart(2,"0");$("#dailyTimer").textContent=`${h}:${m}:${s}`},1000);
