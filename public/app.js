let S=JSON.parse(localStorage.getItem("sdolars_v2")||"null")||{gold:1779,gems:1330,energy:191.38,xp:180,hp:100,atk:38,def:24,claimed:false};
const save=()=>localStorage.setItem("sdolars_v2",JSON.stringify(S)); const $=s=>document.querySelector(s);
function toast(t){let x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>x.classList.remove("show"),1500)}
function openPanel(html){$("#panelBody").innerHTML=html;$("#panel").style.display="flex"} function closePanel(){$("#panel").style.display="none"}
function update(){["gold","gems","energy"].forEach(k=>$("#"+k).textContent=S[k]);document.querySelector(".xp i").style.width=(S.xp/3)+"%"}
function gain(k){S[k]+=k==="energy"?10:k==="gems"?50:100;save();update();toast("+"+(k==="energy"?10:k==="gems"?50:100))}
function claim(){if(S.claimed)return toast("Награда уже получена");S.claimed=true;S.gold+=250;S.gems+=25;save();update();toast("🎁 +250 золота, +25 алмазов")}
function page(id){
 if(id==="city"){closePanel();return}
 const pages={
 hero:`<h2>🧔 Герой — Викинг</h2><div class="cards"><div class="card">⭐ Уровень<br><b>3</b></div><div class="card">❤️ Здоровье<br><b>${S.hp}/100</b></div><div class="card">⚔️ Атака<br><b>${S.atk}</b></div><div class="card">🛡️ Защита<br><b>${S.def}</b></div></div>`,
 inventory:`<h2>🎒 Инвентарь</h2><div class="cards"><div class="card">🪓 Железный топор<br><b>+12 атаки</b><br><button onclick="toast('Топор надет')">Надеть</button> <button onclick="toast('Предмет выброшен')">Выбросить</button></div><div class="card">🧥 Волчья броня<br><b>+8 защиты</b><br><button onclick="toast('Броня надета')">Надеть</button></div><div class="card">⛑️ Шлем<br><b>+6 защиты</b><br><button onclick="toast('Шлем надет')">Надеть</button></div><div class="card">🧪 Зелье<br><b>+30 HP</b><br><button onclick="potion()">Использовать</button></div></div>`,
 equipment:`<h2>🛡️ Экипировка</h2><div class="cards"><div class="card">Голова<br><b>⛑️ Шлем викинга</b></div><div class="card">Оружие<br><b>🪓 Железный топор</b></div><div class="card">Броня<br><b>🧥 Волчья броня</b></div><div class="card">Амулет<br><b>🔱 Амулет Sdolars</b></div></div>`,
 quests:`<h2>📜 Задания</h2><div class="card"><b>Поговори с кузнецом</b><p>📍 Кузница</p><button onclick="quest()">Выполнить</button></div>`,
 shop:`<h2>👜 Магазин</h2><div class="cards"><div class="card">⚔️ Стальной меч<br><b>500 🪙 · +18 атаки</b><br><button onclick="buy(500,18)">Купить</button></div><div class="card">🛡️ Кольчуга<br><b>420 🪙 · +15 защиты</b><br><button onclick="buy(420,0)">Купить</button></div><div class="card">🧪 Зелье<br><b>160 🪙</b><br><button onclick="buy(160,0)">Купить</button></div></div>`,
 forge:`<h2>⚒️ Кузница</h2><div class="card">🪓 Железный топор<br><b>${S.atk} → ${S.atk+8} атаки</b><br><button onclick="upgrade()">Улучшить · 300 🪙</button></div>`,
 tavern:`<h2>🍺 Таверна</h2><div class="card">🧔 Наёмный воин<br><b>+8 к атаке</b><br><button onclick="hire()">Нанять · 600 🪙</button></div>`,
 messages:`<h2>✉️ Сообщения</h2><div class="card">Кузнец: «Заходи в мастерскую, воин!»</div><div class="card">Гильдия: «Новый рейд уже доступен.»</div>`,
 achievements:`<h2>🏆 Достижения</h2><div class="cards"><div class="card">⚔️ Первая победа<br>Получено</div><div class="card">💰 Богач<br>1200/5000</div></div>`,
 settings:`<h2>⚙️ Настройки</h2><div class="card">🔊 Звук <button onclick="toast('Настройка изменена')">Переключить</button></div><div class="card">♻️ Сброс прогресса <button onclick="localStorage.removeItem('sdolars_v2');location.reload()">Сбросить</button></div>`,
 bonuses:`<h2>🎁 Бонусы</h2><div class="card">Ежедневный сундук. Получите награду на главном экране.</div>`,
 events:`<h2>🗓️ События</h2><div class="card">⚔️ Турнир Арены<br><b>Скоро начало</b></div>`,
 vip:`<h2>👑 VIP</h2><div class="card">VIP-привилегии города Sdolars.</div>`,
 guild:`<h2>👥 Гильдия</h2><div class="card">«Северный ветер» · 18 участников</div>`,
 more:`<h2>☰ Ещё</h2><div class="cards"><div class="card">🎰 Казино</div><div class="card">💬 Чат</div><div class="card">🏅 Рейтинг</div><div class="card">🏪 Рынок</div></div>`
 };
 if(id==="battle"){battle();return} openPanel(pages[id]||"<h2>Sdolars</h2>")
}
function potion(){S.hp=Math.min(100,S.hp+30);save();toast("❤️ +30 HP")}
function buy(n,a){if(S.gold<n)return toast("Недостаточно золота");S.gold-=n;S.atk+=a;save();update();toast("Покупка совершена")}
function upgrade(){if(S.gold<300)return toast("Нужно 300 золота");S.gold-=300;S.atk+=8;save();update();toast("Оружие улучшено")}
function hire(){if(S.gold<600)return toast("Нужно 600 золота");S.gold-=600;S.atk+=8;save();update();toast("Герой нанят")}
function quest(){S.gold+=120;S.xp+=60;if(S.xp>=300){S.xp-=300}save();update();toast("📜 +120 золота");page("quests")}
function battle(){window.enemy=100;window.az=null;window.dz=[];openPanel(`<h2>⚔️ Бой против Бандита</h2><div class="fighters"><div><div class="fighter">🧔</div><b>Викинг</b><div class="hp"><i id="ph" style="width:${S.hp}%"></i></div></div><div><div class="fighter">🥷</div><b>Бандит</b><div class="hp"><i id="eh"></i></div></div></div><p><b>Атака: выберите 1 зону</b></p><div class="zones">${["Голова","Грудь","Живот","Пояс","Ноги"].map(x=>`<button onclick="az(this,'${x}')">${x}</button>`).join("")}</div><p><b>Защита: выберите 2 зоны</b></p><div id="defs" class="zones">${["Голова","Грудь","Живот","Пояс","Ноги"].map(x=>`<button onclick="dz(this,'${x}')">${x}</button>`).join("")}</div><p><button onclick="turn()" style="background:#087aca;padding:12px 20px;border-radius:10px;font-weight:bold">⚔️ ПРОВЕСТИ ХОД</button></p><p id="log">Выберите атаку и две защиты.</p>`)}
function az(b,z){document.querySelectorAll(".zones:first-of-type button").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");window.az=z}
function dz(b,z){if(b.classList.contains("sel")){b.classList.remove("sel");window.dz=window.dz.filter(x=>x!==z);return}if(window.dz.length>=2)return toast("Только 2 зоны");b.classList.add("sel");window.dz.push(z)}
function turn(){if(!window.az||window.dz.length!==2)return toast("Выберите атаку и 2 защиты");let dmg=S.atk+(window.az==="Голова"?8:0);window.enemy=Math.max(0,window.enemy-dmg);$("#eh").style.width=window.enemy+"%";if(window.enemy<=0){S.gold+=180;S.xp+=80;save();update();$("#log").textContent="🏆 Победа! +180 золота";return}let e=Math.floor(Math.random()*8)+4;if(window.dz.includes(["Голова","Грудь","Живот","Пояс","Ноги"][Math.floor(Math.random()*5)]))e=Math.ceil(e/2);S.hp=Math.max(0,S.hp-e);save();$("#ph").style.width=S.hp+"%";$("#log").textContent=`Удар в «${window.az}» -${dmg}. Бандит отвечает -${e} HP.`;window.az=null;window.dz=[];document.querySelectorAll(".zones button").forEach(x=>x.classList.remove("sel"))}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>page(b.dataset.page)));
let sec=85464;setInterval(()=>{sec--;let t=[Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(x=>String(x).padStart(2,"0")).join(":");$("#clock").textContent=t;$("#clock2").textContent=t},1000);update();
