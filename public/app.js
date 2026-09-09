const ITEMS=[
{id:"knife",name:"Ржавый нож",type:"weapon",stat:4,price:40,desc:"+4 атаки"},
{id:"sword",name:"Стальной меч",type:"weapon",stat:10,price:150,desc:"+10 атаки"},
{id:"jacket",name:"Кожаная куртка",type:"armor",stat:4,price:60,desc:"+4 защиты"},
{id:"vest",name:"Бронежилет",type:"armor",stat:10,price:180,desc:"+10 защиты"},
{id:"med",name:"Аптечка",type:"consumable",stat:35,price:35,desc:"+35 HP"}];
const EN={rat:{name:"Гигантская крыса",hp:35,atk:5,def:1,exp:25,coins:15},bandit:{name:"Бандит",hp:75,atk:11,def:4,exp:55,coins:45},boss:{name:"Босс руин",hp:150,atk:18,def:8,exp:140,coins:120}};
const SYM=["🍒","🍋","🔔","⭐","💎","7️⃣"];let p=null,ws=null,enemy=null,bet=10,busy=false;
const $=id=>document.getElementById(id);
async function api(url,data){let r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});return r.json()}
async function register(){let r=await api("/api/register",{name:$("authName").value.trim(),password:$("authPass").value});if(r.ok)enter(r.player);else $("authMsg").textContent=r.error}
async function login(){let r=await api("/api/login",{name:$("authName").value.trim(),password:$("authPass").value});if(r.ok)enter(r.player);else $("authMsg").textContent=r.error}
function enter(player){p=player;$("auth").classList.add("hidden");$("game").classList.remove("hidden");connect();render();online()}
function connect(){ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host);ws.onopen=()=>ws.send(JSON.stringify({type:"auth",name:p.name,player:p}));ws.onmessage=e=>{let m=JSON.parse(e.data);if(m.type==="chat")chat(m.name,m.text);if(m.type==="system")sys(m.text);if(m.type==="players")renderPlayers(m.players)}}
function persist(){if(ws?.readyState===1)ws.send(JSON.stringify({type:"save",player:p}));render()}
function logout(){persist();location.reload()}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));$(id).classList.remove("hidden");render()}
function atk(){return 4+(p.equipment.weapon?.stat||0)}function def(){return 1+(p.equipment.armor?.stat||0)}function need(){return p.level*100}
function render(){if(!p)return;$("playerName").textContent=p.name;$("level").textContent=p.level;$("coins").textContent=p.coins;$("hpText").textContent=`${p.hp}/${p.maxHp}`;$("expText").textContent=`${p.exp}/${need()}`;$("hpBar").style.width=p.hp/p.maxHp*100+"%";$("expBar").style.width=p.exp/need()*100+"%";$("cLevel").textContent=p.level;$("cAtk").textContent=atk();$("cDef").textContent=def();$("cMax").textContent=p.maxHp;$("bet").textContent=bet;
$("equip").innerHTML=slot("Оружие","weapon")+slot("Броня","armor");
$("inv").innerHTML=p.inventory.length?p.inventory.map((x,i)=>`<div class="item"><span><b>${x.name}</b><br><small>${x.desc}</small></span><span>${x.type==="consumable"?`<button onclick="use(${i})">Исп.</button>`:`<button onclick="equip(${i})">Надеть</button>`}<button onclick="drop(${i})">Выбросить</button></span></div>`).join(""):"<div class='item'>Пусто</div>";
$("shop").innerHTML=ITEMS.map(x=>`<div class="item"><span><b>${x.name}</b><br><small>${x.desc}</small></span><span>🪙 ${x.price} <button onclick="buy('${x.id}')">Купить</button></span></div>`).join("")}
function slot(n,t){let x=p.equipment[t];return `<div class="item"><span>${n}: <b>${x?x.name:"Пусто"}</b></span>${x?`<button onclick="unequip('${t}')">Снять</button>`:""}</div>`}
function buy(id){let x=ITEMS.find(a=>a.id===id);if(p.coins<x.price)return sys("Недостаточно монет.");p.coins-=x.price;p.inventory.push({...x});sys("Куплено: "+x.name);persist()}
function equip(i){let x=p.inventory[i];if(p.equipment[x.type])p.inventory.push(p.equipment[x.type]);p.equipment[x.type]=x;p.inventory.splice(i,1);persist()}
function unequip(t){p.inventory.push(p.equipment[t]);p.equipment[t]=null;persist()}
function drop(i){p.inventory.splice(i,1);persist()}
function use(i){let x=p.inventory[i];if(p.hp>=p.maxHp)return sys("HP уже максимальное.");p.hp=Math.min(p.maxHp,p.hp+x.stat);p.inventory.splice(i,1);persist()}
function fightStart(t){enemy={...EN[t],cur:EN[t].hp};$("enemy").innerHTML=`<div class="enemy" id="enemyBox">👹 ${enemy.name} — HP <b id="eh">${enemy.cur}</b>/${enemy.hp}</div>`;$("fightLog").textContent="Бой начался!";$("attack").classList.remove("hidden")}
function hit(){if(!enemy||busy)return;busy=true;let crit=Math.random()<.12,dmg=Math.max(1,atk()+rnd(-2,3)-enemy.def)*(crit?2:1);enemy.cur-=dmg;fx("-"+dmg,false);$("enemyBox").classList.add("win");setTimeout(()=>$("enemyBox").classList.remove("win"),500);let text=(crit?"💥 КРИТ! ":"")+`Удар: ${dmg}`;if(enemy.cur<=0){p.coins+=enemy.coins;p.exp+=enemy.exp;text+=`\\n🏆 Победа +${enemy.exp} EXP +${enemy.coins} монет`;enemy=null;$("attack").classList.add("hidden");levelCheck()}else{let taken=Math.max(1,enemy.atk+rnd(-2,2)-def());p.hp=Math.max(0,p.hp-taken);text+=`\\nПолучено: ${taken} урона`;if(!p.hp)text+="\\n☠ Вы проиграли."} $("fightLog").textContent=text;if(enemy)$("eh").textContent=enemy.cur;persist();setTimeout(()=>busy=false,250)}
function levelCheck(){while(p.exp>=need()){p.exp-=need();p.level++;p.maxHp+=20;p.hp=p.maxHp;sys("🎉 Новый уровень: "+p.level);fx("LEVEL UP",true)}}
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function betChange(n){bet=Math.max(10,Math.min(100,bet+n));render()}
function slots(){if(busy)return;if(p.coins<bet)return $("slotResult").textContent="Недостаточно монет.";busy=true;p.coins-=bet;render();let el=$("slots"),i=0;el.classList.add("spinning");let t=setInterval(()=>{el.textContent=`${SYM[rnd(0,5)]} | ${SYM[rnd(0,5)]} | ${SYM[rnd(0,5)]}`;if(++i>=12){clearInterval(t);el.classList.remove("spinning");let a=SYM[rnd(0,5)],b=SYM[rnd(0,5)],c=SYM[rnd(0,5)],win=0;if(a===b&&b===c)win=a==="💎"?bet*12:a==="7️⃣"?bet*10:bet*6;else if(a===b||b===c||a===c)win=bet*2;el.textContent=`${a} | ${b} | ${c}`;if(win){p.coins+=win;$("slotResult").textContent=`🎉 Выигрыш 🪙 ${win}`}else $("slotResult").textContent="Проигрыш";busy=false;persist()}},75)}
function dice(c){if(busy)return;if(p.coins<bet)return $("diceResult").textContent="Недостаточно монет.";busy=true;p.coins-=bet;let n=rnd(1,6);setTimeout(()=>{let ok=c==="even"?n%2===0:n%2!==0;if(ok){p.coins+=bet*2;$("diceResult").textContent=`🎲 ${n} — победа! +${bet*2}`}else $("diceResult").textContent=`🎲 ${n} — проигрыш`;busy=false;persist()},350)}
function chatSend(e){e.preventDefault();let i=$("chatInput"),t=i.value.trim();if(t&&ws?.readyState===1)ws.send(JSON.stringify({type:"chat",text:t}));i.value=""}
function chat(n,t){$("chatBox").insertAdjacentHTML("beforeend",`<div class="msg"><span class="chatname">${esc(n)}:</span> ${esc(t)}</div>`);$("chatBox").scrollTop=$("chatBox").scrollHeight}
function sys(t){$("chatBox").insertAdjacentHTML("beforeend",`<div class="msg system">${esc(t)}</div>`)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fx(t,good){let x=document.createElement("div");x.className="float";x.textContent=t;x.style.left="45%";x.style.top="40%";$("fx").append(x);setTimeout(()=>x.remove(),900)}
async function online(){let r=await fetch("/api/online").then(x=>x.json());$("online").textContent=r.online}
setInterval(online,5000);
