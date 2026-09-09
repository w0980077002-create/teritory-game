const $=s=>document.querySelector(s);
let S=JSON.parse(localStorage.getItem("territory_sdolars_1")||"null")||{gold:1779,gems:1330,energy:191.38,level:3,xp:120,hp:100,atk:38,def:24,claimed:false,questDone:false};
const save=()=>localStorage.setItem("territory_sdolars_1",JSON.stringify(S));
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window.t);window.t=setTimeout(()=>x.classList.remove("show"),1700)}
function openModal(h){$("#modalContent").innerHTML=h;$("#modal").style.display="flex"}
function closeModal(){$("#modal").style.display="none"}
$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()}

const screens={
city:null,
hero:()=>openModal(`<h2>🧔 Герой — Викинг</h2><div class="grid">
<div class="card">⭐ Уровень<br><b>${S.level}</b></div><div class="card">❤️ Здоровье<br><b>${S.hp}/100</b></div>
<div class="card">⚔️ Атака<br><b>${S.atk}</b></div><div class="card">🛡️ Защита<br><b>${S.def}</b></div></div>`),
inventory:()=>openModal(`<h2>🎒 Инвентарь</h2><div class="grid">
<div class="card">🪓 Железный топор<br><b>+12 атаки</b><br><button onclick="equip('топор')">Надеть</button><button onclick="dropItem('топор')">Выбросить</button></div>
<div class="card">🧥 Волчья шкура<br><b>+8 защиты</b><br><button onclick="equip('броню')">Надеть</button><button onclick="dropItem('броню')">Выбросить</button></div>
<div class="card">⛑️ Шлем<br><b>+6 защиты</b><br><button onclick="equip('шлем')">Надеть</button><button onclick="dropItem('шлем')">Выбросить</button></div>
<div class="card">🧪 Зелье<br><b>+30 здоровья</b><br><button onclick="usePotion()">Использовать</button></div></div>`),
equipment:()=>openModal(`<h2>🛡️ Экипировка</h2><div class="grid">
<div class="card">Голова<br><b>⛑️ Шлем викинга</b></div><div class="card">Оружие<br><b>🪓 Железный топор</b></div>
<div class="card">Броня<br><b>🧥 Волчья шкура</b></div><div class="card">Амулет<br><b>🔱 Амулет Сдоларса</b></div></div>`),
quests:()=>openModal(`<h2>📜 Задания</h2><div class="card"><b>${S.questDone?"Заказ кузнеца выполнен":"Поговори с кузнецом"}</b><p class="muted">📍 Кузница</p><button onclick="finishQuest()">${S.questDone?"Получено":"Продолжить"}</button></div>`),
shop:()=>openModal(`<h2>👜 Магазин</h2><div class="grid">
<div class="card">⚔️ Стальной меч<br><b>500 🪙 · +18 атаки</b><br><button onclick="buy(500,'меч')">Купить</button></div>
<div class="card">🛡️ Кольчуга<br><b>420 🪙 · +15 защиты</b><br><button onclick="buy(420,'кольчуга')">Купить</button></div>
<div class="card">🧪 Зелье<br><b>160 🪙</b><br><button onclick="buy(160,'зелье')">Купить</button></div></div>`),
forge:()=>openModal(`<h2>⚒️ Кузница</h2><div class="card">Железный топор<br><b>${S.atk} → ${S.atk+8} атаки</b><br><button onclick="upgrade()">Улучшить · 300 🪙</button></div>`),
tavern:()=>openModal(`<h2>🍺 Таверна</h2><div class="card">Наёмный воин<br><b>+8 к атаке</b><br><button onclick="hire()">Нанять · 600 🪙</button></div>`),
messages:()=>openModal(`<h2>✉️ Сообщения</h2><div class="card">Кузнец: «Заходи в мастерскую, воин!»</div><div class="card">Гильдия: «Новый рейд уже доступен.»</div>`),
achievements:()=>openModal(`<h2>🏆 Достижения</h2><div class="grid"><div class="card">⚔️ Первая победа<br>Получено</div><div class="card">💰 Богач<br>1200/5000</div></div>`),
settings:()=>openModal(`<h2>⚙️ Настройки</h2><div class="card">Звук <button onclick="toast('Звук переключён')">Переключить</button></div><div class="card">Сброс прогресса <button onclick="resetGame()">Сбросить</button></div>`),
bonuses:()=>openModal(`<h2>🎁 Бонусы</h2><div class="card">Ежедневный сундук готовится. Получи награду ниже.</div>`),
events:()=>openModal(`<h2>🗓️ События</h2><div class="card">⚔️ Турнир Арены<br><b>До начала: 4 часа</b></div>`),
vip:()=>openModal(`<h2>👑 VIP</h2><div class="card">VIP-статус<br><b>Доступны ежедневные привилегии.</b></div>`),
guild:()=>openModal(`<h2>👥 Гильдия</h2><div class="card">Гильдия «Северный ветер»<br>Участников: 18</div>`),
more:()=>openModal(`<h2>☰ Ещё</h2><div class="grid"><div class="card">🏪 Рынок</div><div class="card">🎰 Казино</div><div class="card">💬 Чат</div><div class="card">🏅 Рейтинг</div></div>`),
battle:()=>battle()
};

function battle(){window.enemy=100;window.atkZone=null;window.defZones=[];openModal(`<h2>⚔️ Бой против Бандита</h2>
<div class="fight"><div><div class="fighter">🧔</div><b>Викинг</b><div class="hp"><i id="ph" style="width:${S.hp}%"></i></div></div>
<div><div class="fighter">🥷</div><b>Бандит</b><div class="hp"><i id="eh" style="width:100%"></i></div></div></div>
<p><b>Атака — выбери зону</b></p><div class="zones">${["Голова","Грудь","Живот","Пояс","Ноги"].map(z=>`<button onclick="pickAtk(this,'${z}')">${z}</button>`).join("")}</div>
<p><b>Защита — выбери 2 зоны</b></p><div class="zones defzones">${["Голова","Грудь","Живот","Пояс","Ноги"].map(z=>`<button onclick="pickDef(this,'${z}')">${z}</button>`).join("")}</div>
<div class="moves"><button onclick="turn()">⚔️ Провести ход</button><button onclick="usePotion()">🧪 Зелье</button></div><p id="log" class="muted">Сначала выберите атаку и две зоны защиты.</p>`)}
function pickAtk(b,z){document.querySelectorAll(".zones:first-of-type button").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");window.atkZone=z}
function pickDef(b,z){if(b.classList.contains("sel")){b.classList.remove("sel");window.defZones=window.defZones.filter(x=>x!==z);return}if(window.defZones.length>=2)return toast("Можно блокировать только 2 зоны");b.classList.add("sel");window.defZones.push(z)}
function turn(){if(!window.atkZone||window.defZones.length!==2)return toast("Выберите атаку и 2 защиты");let dmg=S.atk+(window.atkZone==="Голова"?10:0);window.enemy=Math.max(0,window.enemy-dmg);let log=$("#log");log.textContent=`Удар в зону «${window.atkZone}»: -${dmg} HP. Защита: ${window.defZones.join(", ")}.`;
if(window.enemy<=0){S.gold+=180;S.xp+=80;save();log.textContent+=" 🏆 Победа! +180 🪙";update();return}
let enemyDmg=Math.floor(Math.random()*8)+4;if(window.defZones.includes(["Голова","Грудь","Живот","Пояс","Ноги"][Math.floor(Math.random()*5)]))enemyDmg=Math.floor(enemyDmg/2);S.hp=Math.max(0,S.hp-enemyDmg);save();$("#eh").style.width=window.enemy+"%";$("#ph").style.width=S.hp+"%";log.textContent+=` Бандит наносит ${enemyDmg}.`;window.atkZone=null;window.defZones=[];document.querySelectorAll(".zones button").forEach(x=>x.classList.remove("sel"))}
function usePotion(){if(S.gold<0)return;S.hp=Math.min(100,S.hp+30);save();update();toast("❤️ +30 здоровья")}
function equip(x){toast("Экипировано: "+x)}
function dropItem(x){toast("Выброшено: "+x)}
function buy(n,x){if(S.gold<n)return toast("Недостаточно золота");S.gold-=n;save();update();toast("Куплено: "+x)}
function upgrade(){if(S.gold<300)return toast("Нужно 300 золота");S.gold-=300;S.atk+=8;save();update();toast("Оружие улучшено")}
function hire(){if(S.gold<600)return toast("Нужно 600 золота");S.gold-=600;S.atk+=8;save();update();toast("Союзник нанят")}
function finishQuest(){if(S.questDone)return toast("Задание уже выполнено");S.questDone=true;S.gold+=120;S.xp+=60;if(S.xp>=300){S.xp-=300;S.level++}save();update();toast("Задание выполнено!");screens.quests()}
function claimReward(){if(S.claimed)return toast("Награда уже получена");S.claimed=true;S.gold+=250;S.gems+=25;save();update();toast("🎁 +250 золота +25 алмазов")}
function addGold(){S.gold+=100;save();update();toast("+100 золота")}
function addGem(){S.gems+=50;save();update();toast("+50 алмазов")}
function addEnergy(){S.energy+=10;save();update();toast("+10 энергии")}
function toggleLang(){toast("🇬🇧 English mode")}
function resetGame(){localStorage.removeItem("territory_sdolars_1");location.reload()}
function update(){["gold","gems","energy","level","xp"].forEach(k=>$("#"+k).textContent=S[k]);$("#xpbar").style.width=Math.min(100,S.xp/3)+"%"}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>{let id=b.dataset.open;if(id==="city"){closeModal();return}if(screens[id])screens[id]()||null}));
let sec=85512;setInterval(()=>{sec=Math.max(0,sec-1);let t=[Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,"0")).join(":");$("#timer").textContent=t;$("#timer2").textContent=t},1000);
update();
