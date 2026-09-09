const $=s=>document.querySelector(s);
let S=JSON.parse(localStorage.getItem("sdolars_exact")||"null")||{gold:1779,gems:1330,energy:191.38,lvl:3,xp:120,hp:100,atk:38,def:24,quest:false,claimed:false};
function save(){localStorage.setItem("sdolars_exact",JSON.stringify(S))}
function toast(t){let x=$("#toast");x.textContent=t;x.className="show";clearTimeout(window.t);window.t=setTimeout(()=>x.className="",2100)}
function open(html){$("#content").innerHTML=html;$("#modal").classList.add("show")}
function close(){$("#modal").classList.remove("show")}
$("#close").onclick=close;$("#modal").onclick=e=>{if(e.target.id==="modal")close()};
function hero(){open(`<h2>🧔 Герой — Викинг</h2><div class="grid"><div class="tile">⭐ Уровень<br><b>${S.lvl}</b></div><div class="tile">❤️ Здоровье<br><b>${S.hp}/100</b></div><div class="tile">⚔️ Атака<br><b>${S.atk}</b></div><div class="tile">🛡️ Защита<br><b>${S.def}</b></div></div><p class="muted">Это уже рабочий экран. Визуальная главная страница оставлена по твоему референсу.</p>`)}
function inv(){open(`<h2>🎒 Инвентарь</h2><div class="grid"><div class="tile">🪓 Железный топор<br><b>+12 ⚔️</b><br><button class="primary" onclick="toast('Топор экипирован')">Надеть</button></div><div class="tile">🧥 Волчья шкура<br><b>+8 🛡️</b><br><button class="primary" onclick="toast('Броня экипирована')">Надеть</button></div><div class="tile">⛑️ Шлем викинга<br><b>+6 🛡️</b><br><button class="primary" onclick="toast('Шлем экипирован')">Надеть</button></div><div class="tile">🧪 Зелье здоровья<br><b>+30 ❤️</b><br><button class="primary" onclick="S.hp=Math.min(100,S.hp+30);save();toast('Здоровье восстановлено')">Использовать</button></div></div>`)}
function quests(){open(`<h2>📜 Задания</h2><div class="tile"><b>${S.quest?"Отнеси заказ в таверну":"Поговори с кузнецом"}</b><p>📍 Кузница</p><button class="primary" id="doQuest">${S.quest?"Завершить задание":"Поговорить с кузнецом"}</button></div>`);$("#doQuest").onclick=()=>{S.quest=true;S.gold+=120;S.xp+=60;if(S.xp>=300){S.xp-=300;S.lvl++}save();toast("Задание выполнено!");quests()}}
function shop(){open(`<h2>👜 Магазин</h2><div class="grid"><div class="tile">⚔️ Стальной меч<br><b>500 🪙 · +18 ⚔️</b><br><button onclick="buy(500,'Стальной меч')">Купить</button></div><div class="tile">🥋 Кольчуга<br><b>420 🪙 · +15 🛡️</b><br><button onclick="buy(420,'Кольчуга')">Купить</button></div><div class="tile">🧪 Зелье<br><b>160 🪙</b><br><button onclick="buy(160,'Зелье')">Купить</button></div></div>`)}
function buy(n,name){if(S.gold<n)return toast("Недостаточно золота");S.gold-=n;save();toast("Куплено: "+name)}
function battle(){window.enemy=100;open(`<h2>⚔️ Бой против Бандита</h2><div class="tile"><div class="arena"><div><div class="fighter">🧔</div><b>Викинг</b><div class="hp"><i id="ph" style="width:${S.hp}%"></i></div></div><div><div class="fighter">🥷</div><b>Бандит</b><div class="hp"><i id="eh" style="width:100%"></i></div></div></div><div class="moves"><button data-m="fast">⚔️ Быстрый удар</button><button data-m="heavy">💥 Сильный удар</button><button data-m="def">🛡️ Защита</button><button data-m="heal">🧪 Зелье</button></div><p id="log" class="muted">Выберите действие.</p></div>`)}
document.addEventListener("click",e=>{
let id=e.target.id;
if(id==="settings")open("<h2>⚙️ Настройки</h2><p class='muted'>Настройки игры.</p><button class='primary' onclick='close()'>Закрыть</button>");
else if(id==="lang")toast("Язык: RU");
else if(["quest","quests","navquests"].includes(id))quests();
else if(["inventory","navinv"].includes(id))inv();
else if(["equipment","navhero"].includes(id))hero();
else if(id==="navcity")close();
else if(id==="battle")battle();
else if(id==="shop")shop();
else if(id==="forge")open("<h2>🔨 Кузница</h2><div class='tile'>Улучшение оружия<br><b>"+S.atk+" → "+(S.atk+8)+" ⚔️</b><br><button class='primary' onclick='upgrade()'>Улучшить · 300 🪙</button></div>");
else if(id==="tavern")open("<h2>🍺 Таверна</h2><div class='tile'>Нанять следопыта<br><b>+8 ⚔️</b><br><button class='primary' onclick='hire()'>Нанять · 600 🪙</button></div>");
else if(id==="claim"){if(S.claimed)return toast("Награда уже получена");S.claimed=true;S.gold+=250;S.gems+=25;save();toast("🎁 +250 золота и +25 алмазов")}
else if(id==="bonus")toast("🎁 Бонусы открыты");
else if(id==="events")toast("🗓️ События открыты");
else if(id==="vip")toast("👑 VIP");
else if(id==="navguild")open("<h2>👥 Гильдия</h2><p class='muted'>Гильдия будет добавлена следующим этапом.</p>");
else if(id==="navmore")open("<h2>☰ Ещё</h2><p class='muted'>Дополнительные разделы.</p>");
let m=e.target.closest("[data-m]");if(m){let log=$("#log");if(!log)return;if(m.dataset.m==="heal"){S.hp=Math.min(100,S.hp+30);log.textContent="Вы восстановили 30 здоровья."}else{let d=m.dataset.m==="heavy"?S.atk+8:S.atk;window.enemy=Math.max(0,window.enemy-d);log.textContent="Вы нанесли "+d+" урона."}if(window.enemy<=0){S.gold+=180;S.xp+=80;log.textContent+=" 🏆 Победа! +180 🪙";save();return}let d=Math.floor(Math.random()*8)+4;S.hp=Math.max(0,S.hp-d);log.textContent+=" Бандит наносит "+d+".";save();$("#ph").style.width=S.hp+"%";$("#eh").style.width=window.enemy+"%"}})
});
function upgrade(){if(S.gold<300)return toast("Нужно 300 золота");S.gold-=300;S.atk+=8;save();toast("Оружие улучшено")}
function hire(){if(S.gold<600)return toast("Нужно 600 золота");S.gold-=600;S.atk+=8;save();toast("Герой нанят")}

window.addEventListener("error",e=>{try{console.error(e.message)}catch(_){}},{capture:true});
