(()=>{
const KEY='territory_s80_clan';
const tg=()=>window.Telegram&&Telegram.WebApp?Telegram.WebApp:null;
const me=()=>{const u=tg()?.initDataUnsafe?.user||{};return {id:u.id?String(u.id):'',name:[u.first_name,u.last_name].filter(Boolean).join(' ')||'Игрок'}};
const apiBase=()=>localStorage.getItem('territory_server_url')||'';
async function api(path,opt={}){const headers=Object.assign({'content-type':'application/json'},opt.headers||{});const t=tg();if(t?.initData)headers['X-Telegram-Init-Data']=t.initData;try{const r=await fetch(apiBase()+path,Object.assign({},opt,{headers}));return await r.json()}catch(e){return {ok:false,error:'server_unavailable'}}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function clan(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function save(c){localStorage.setItem(KEY,JSON.stringify(c))}
function panel(title,html){if(typeof window.panel==='function')return window.panel(title,html);if(typeof window.openSheet==='function')return window.openSheet(title,html)}
function openClanOnline(){render('home')}
async function render(tab='home'){
 let c=clan();const id=me().id;
 if(id){const r=await api('/api/clans?q=');if(r.ok&&c){const remote=r.clans.find(x=>x.id===c.id);if(remote){c=Object.assign(c,remote);save(c)}}}
 if(!c)return showJoin();
 const tabs=[['home','🏰','Штаб'],['members','👥','Участники'],['war','⚔️','Война'],['manage','⚙️','Управление']];
 let h='<div class="s80Hero"><b>🛡️ '+esc(c.name)+' ['+esc(c.tag)+']</b><small>Онлайн-клан · '+(c.members?.length||0)+'/50 участников</small></div><div class="s80Tabs">'+tabs.map(a=>`<button class="${tab===a[0]?'active':''}" data-s80tab="${a[0]}">${a[1]}<br>${a[2]}</button>`).join('')+'</div>';
 if(tab==='home')h+=home(c);else if(tab==='members')h+=members(c);else if(tab==='war')h+=war(c);else h+=manage(c);
 panel('🛡️ '+esc(c.name),h);bind();
}
function home(c){const count=c.members?.length||0;return `<div class="s80Grid"><div>🏰<b>${c.level||1}</b><small>Уровень</small></div><div>👥<b>${count}</b><small>Участники</small></div><div>💰<b>${c.treasury||0}</b><small>Казна</small></div><div>⭐<b>${c.reputation||0}</b><small>Репутация</small></div></div><div class="s80Card"><b>📡 Серверное состояние</b><p>Клан хранится на сервере и доступен участникам с разных устройств.</p><button class="s80Btn" data-s80="refresh">🔄 Обновить данные</button></div><div class="s80Card"><b>🎯 Что доступно</b><p>Участники и роли синхронизируются. Следующий слой — общая казна, боевой состав и реальные клановые события.</p></div>`}
function members(c){const arr=c.members||[];return `<div class="s80Card"><b>👥 Участники клана</b>${arr.map(m=>`<div class="s80Member"><span>⚔️ <b>${esc(m.name)}</b><small>${role(m.role)} · ур. ${m.level||1} · сила ${m.power||0}</small></span><strong>${m.id===c.ownerId?'👑':''}</strong></div>`).join('')}</div>`}
function role(r){return ({leader:'Глава',officer:'Офицер',scout:'Разведчик',warrior:'Воин'})[r]||'Воин'}
function war(c){return `<div class="s80Card"><b>⚔️ Клановая война</b><p>Синхронизированный состав клана готовится к общим боям.</p><div class="s80Grid"><div>🏆<b>${c.reputation||0}</b><small>Рейтинг</small></div><div>⚔️<b>${(c.members||[]).reduce((s,m)=>s+(m.power||0),0)}</b><small>Сила</small></div></div><button class="s80Btn" data-s80="refresh">🔄 Синхронизировать состав</button></div>`}
function manage(c){const owner=me().id===c.ownerId;return `<div class="s80Card"><b>⚙️ Управление</b><p>Создатель: ${esc((c.members||[]).find(m=>m.id===c.ownerId)?.name||'Глава')}</p>${owner?'<p>Глава может назначать роли участникам на сервере.</p>':''}<button class="s80Btn danger" data-s80="leave">🚪 Выйти из клана</button></div>`}
async function showJoin(){
 const r=await api('/api/clans');
 const list=r.ok?r.clans:[];
 let h=`<div class="s80Hero"><b>🛡️ Онлайн-кланы</b><small>Настоящая серверная база кланов</small></div>
 <div class="s80Card"><b>Создать новый клан</b>
 <input id="s80name" class="s80Input" placeholder="Название клана">
 <input id="s80tag" class="s80Input" placeholder="Тег 2–8 букв" maxlength="8">
 <button class="s80Btn" data-s80="create">➕ Создать клан</button></div>
 <div class="s80Card"><b>Найти клан</b>
 ${list.map(c=>`<div class="s80Clan"><span><b>${esc(c.name)} [${esc(c.tag)}]</b><small>👥 ${c.members?.length||0}/50 · ⭐ ${c.reputation||0}</small></span><button class="s80Btn" data-s80join="${c.id}">Вступить</button></div>`).join('')||'<p>Кланов пока нет.</p>'}
 </div>`;
 panel('🛡️ Кланы',h);bind()}

function bind(){setTimeout(()=>{document.querySelectorAll('[data-s80tab]').forEach(b=>b.onclick=e=>{e.preventDefault();render(b.dataset.s80tab)});document.querySelectorAll('[data-s80]').forEach(b=>b.onclick=async e=>{e.preventDefault();const a=b.dataset.s80;if(a==='create'){const name=document.getElementById('s80name')?.value||'',tag=document.getElementById('s80tag')?.value||'';const r=await api('/api/clan/create',{method:'POST',body:JSON.stringify({name,tag,playerName:me().name})});if(!r.ok)return alert('⚠️ '+(r.error||'Не удалось создать клан'));save(r.clan);render('home')}else if(a==='leave'){const r=await api('/api/clan/leave',{method:'POST',body:JSON.stringify({playerId:me().id})});if(!r.ok)return alert('⚠️ '+(r.error||'Не удалось выйти'));localStorage.removeItem(KEY);showJoin()}else if(a==='refresh'){render('home')}});document.querySelectorAll('[data-s80join]').forEach(b=>b.onclick=async e=>{const r=await api('/api/clan/join',{method:'POST',body:JSON.stringify({clanId:b.dataset.s80join,playerName:me().name})});if(!r.ok)return alert('⚠️ '+(r.error||'Не удалось вступить'));save(r.clan);render('home')})},0)}
window.s80Clan=()=>render('home');window.openClanOnline=window.s80Clan;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{const old=document.getElementById('clanButton');if(old){old.removeAttribute('onclick');old.onclick=()=>render('home')}},600));else setTimeout(()=>{const old=document.getElementById('clanButton');if(old){old.removeAttribute('onclick');old.onclick=()=>render('home')}},600);
})();
