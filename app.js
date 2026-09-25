(function(){
'use strict';
const state={screen:'home',stage:7,equipment:0,auto:false,dice:10,pos:0,coins:45000,gems:4500,energy:125,followers:['Лиабро','Тералель','Король-коров','Морт','Каменное Лицо'],activeFollower:null};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function show(id){$$('.screen').forEach(x=>x.classList.toggle('active',x.id===id));state.screen=id;}
function home(){show('home')}
function addZone(cls,fn){const z=document.createElement('button');z.className='zone '+cls;z.type='button';z.onclick=fn;$('.zones').appendChild(z)}
function setupHome(){const z=$('.home-zones');z.innerHTML='';
[['arena',()=>show('arena')],['roadmap',()=>show('roadmap')],['inventory',()=>show('inventory')],['hero',()=>show('hero')],['battle',()=>show('arena')],['quests',()=>show('quests')],['games',()=>show('games')],['clan',()=>show('clan')],['shop',()=>show('shop')]].forEach(([c,f])=>{const b=document.createElement('button');b.className='zone '+c;b.onclick=f;z.appendChild(b)});
}
function setupArena(){const z=$('.arena-zones');z.innerHTML='';
[['home',home],['inventory',()=>show('inventory')],['hero',()=>show('hero')],['battle',()=>show('arena')],['quests',()=>show('quests')],['games',()=>show('games')],['clan',()=>show('clan')],['hit hit-left-1',()=>hit('Голова')],['hit hit-left-2',()=>hit('Грудь')],['hit hit-left-3',()=>hit('Пояс')],['hit hit-left-4',()=>hit('Ноги')],['hit hit-right-1',()=>defend('Голова')],['hit hit-right-2',()=>defend('Грудь')],['hit hit-right-3',()=>defend('Пояс')],['hit hit-right-4',()=>defend('Ноги')],['tactics',()=>message('Тактика: выбери зону атаки и защиты.')],['auto',()=>{state.auto=!state.auto;message('Авто-бой: '+(state.auto?'ВКЛ':'ВЫКЛ'))}],['attack',()=>hit('Удар')],['timer',()=>message('Таймер: ход игрока')],['follower',followersModal],['equip equip1',()=>equip(0)],['equip equip2',()=>equip(1)],['equip equip3',()=>equip(2)],['equip equip4',()=>equip(3)],['equip equip5',()=>equip(4)],['equip equip6',()=>equip(5)],['equip equip7',()=>equip(6)]].forEach(([c,f])=>{const b=document.createElement('button');b.className='zone '+c;b.onclick=f;z.appendChild(b)});
}
function hit(zone){message('SSS атакует: '+zone+'. Удар отправлен.');}
function defend(zone){message('Защита выбрана: '+zone+'.');}
function equip(i){state.equipment=(state.equipment+(i?1:1))%7;message('Экипировка выбрана. Слот '+(state.equipment+1)+' / 7');}
function message(t){const m=$('#modal');$('#modalBody').innerHTML='<h2>⚔️ Бой</h2><p>'+t+'</p><button class="gold" id="ok">OK</button>';m.classList.add('show');$('#ok').onclick=()=>m.classList.remove('show')}
function followersModal(){const m=$('#modal');$('#modalBody').innerHTML='<h2>Последователи</h2>'+state.followers.map((x,i)=>`<div class="follower"><div><b>${x}</b><span>${['Крит','Защита','Лечение','Уклонение','Контроль'][i]}</span></div><button class="gold" data-f="${i}">${state.activeFollower===i?'Выбран':'Выбрать'}</button></div>`).join('');m.classList.add('show');$$('[data-f]').forEach(b=>b.onclick=()=>{state.activeFollower=Number(b.dataset.f);m.classList.remove('show');message('Последователь выбран: '+state.followers[state.activeFollower])})}
function setupRoadmap(){const n=$('#nodes');n.innerHTML='';for(let i=1;i<=7;i++){const b=document.createElement('button');b.className='node '+(i<state.stage?'done ':'')+(i===state.stage?'current':'');b.style.top=((i-1)*48)+'px';b.textContent=i;b.onclick=()=>{state.stage=i;setupRoadmap();$('#stageTitle').textContent='2-'+i;};n.appendChild(b)}}
const items=[['🪓','Топор','Lv.102'],['🛡️','Шлем','Lv.98'],['🥋','Доспех','Lv.100'],['🩲','Пояс','Lv.95'],['🥾','Сапоги','Lv.95'],['💍','Кольцо','Lv.97'],['💎','Амулет','Lv.101'],['🧪','Эликсир HP','5/5']];
function cards(id,arr){$(id).innerHTML=arr.map(x=>`<div class="card"><div class="icon">${x[0]}</div><b>${x[1]}</b><span>${x[2]||''}</span></div>`).join('')}
function setupShop(){cards('#shopGrid',[['🧪','Зелье HP','5/5'],['🔵','Энергия','3/3'],['🔴','Атака','1/5'],['🟡','Защита','2/5'],['🟣','Адреналин','1/5'],['💠','Ускорение','1/5']])}
function setupInventory(){cards('#inventoryGrid',items)}
function setupGames(){const b=$('#board');b.innerHTML='';for(let i=0;i<25;i++){const c=document.createElement('button');c.className='cell '+(i===state.pos?'active':'');c.textContent=i+1;c.onclick=()=>{state.pos=i;setupGames()};b.appendChild(c)}$('#diceCount').textContent=state.dice}
$('#roll').onclick=()=>{if(!state.dice)return;state.dice--;const n=1+Math.floor(Math.random()*6);state.pos=(state.pos+n)%25;$('#rollLog').textContent='Выпало '+n+'. Позиция '+(state.pos+1);setupGames()};
$$('[data-home]').forEach(b=>b.onclick=home);$('#followersBtn').onclick=followersModal;$('#modalClose').onclick=()=>$('#modal').classList.remove('show');
setupHome();setupArena();setupRoadmap();setupInventory();setupShop();setupGames();
})();
