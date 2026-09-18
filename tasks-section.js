/* Territory G33 — dedicated Tasks section */
(function(){
"use strict";

var KEY="territory_tasks_v33";
var TASKS=[
 {id:"alex_welcome",title:"Добро пожаловать в Sdolars",text:"Поговори с Герцогом Alex.",reward:"🪙 150 · ⭐ 40 XP",doneText:"Выполнено"},
 {id:"market",title:"Следы на торговой площади",text:"Сделай первую покупку в магазине снаряжения.",reward:"🪙 250 · ⭐ 60 XP",doneText:"Выполнено"},
 {id:"arena",title:"Проверка бойца",text:"Зайди на Арену Sdolars.",reward:"🪙 400 · ⭐ 100 XP",doneText:"Выполнено"},
 {id:"district",title:"Исследователь Sdolars",text:"Посети один из районов города.",reward:"🪙 200 · ⭐ 50 XP",doneText:"Выполнено"}
];

function read(){
 try{return JSON.parse(localStorage.getItem(KEY)||'{"done":[]}')}
 catch(e){return {done:[]}}
}
function write(v){localStorage.setItem(KEY,JSON.stringify(v))}
function style(){
 if(document.getElementById("g33TasksStyle"))return;
 var s=document.createElement("style");s.id="g33TasksStyle";
 s.textContent=`
 #g33Tasks{position:fixed;inset:0;z-index:100060;display:none;align-items:flex-end;background:rgba(2,8,20,.78);padding:10px;box-sizing:border-box}
 #g33Tasks.show{display:flex}
 .g33-card{width:100%;max-width:540px;max-height:88vh;margin:auto;background:linear-gradient(180deg,#142640,#07111f);color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:22px;overflow:hidden;box-shadow:0 15px 50px rgba(0,0,0,.65)}
 .g33-head{display:flex;align-items:center;gap:10px;padding:16px;border-bottom:1px solid rgba(255,255,255,.1)}
 .g33-head b{font-size:20px}.g33-head small{display:block;color:#9fb0c7;margin-top:3px}
 .g33-close{margin-left:auto;width:42px;height:42px;border:0;border-radius:12px;background:#263751;color:#fff;font-size:24px}
 .g33-body{padding:14px;overflow:auto}
 .g33-intro{padding:13px;border-radius:15px;background:rgba(255,255,255,.05);color:#c8d3e2;line-height:1.45;margin-bottom:12px}
 .g33-task{padding:13px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.1);margin-bottom:9px}
 .g33-task.current{border-color:rgba(224,194,103,.55);background:rgba(224,194,103,.07)}
 .g33-title{font-weight:900;font-size:15px}.g33-text{font-size:12px;color:#aebbd0;margin-top:5px;line-height:1.4}
 .g33-reward{font-size:12px;color:#e0c267;margin-top:8px}.g33-status{font-size:11px;color:#9fb0c7;margin-top:7px}
 .g33-progress{font-size:12px;color:#dbe5f2;margin-bottom:12px}
 `;
 document.head.appendChild(s);
}
function open(){
 style();
 var m=document.getElementById("g33Tasks");
 if(!m){
  m=document.createElement("div");m.id="g33Tasks";
  m.innerHTML='<div class="g33-card"><div class="g33-head"><div><b>📜 Задания</b><small>Путь героя Sdolars</small></div><button class="g33-close" type="button">×</button></div><div class="g33-body"></div></div>';
  document.body.appendChild(m);
  m.querySelector(".g33-close").onclick=close;
  m.addEventListener("click",function(e){if(e.target===m)close()});
 }
 render(m);
 m.classList.add("show");
}
function render(m){
 var p=read(),done=Array.isArray(p.done)?p.done:[];
 var body=m.querySelector(".g33-body");
 var completed=TASKS.filter(function(t){return done.indexOf(t.id)>=0}).length;
 body.innerHTML='<div class="g33-intro">Выполняй задания города, открывай новые возможности и получай награды.</div><div class="g33-progress">Прогресс: '+completed+' / '+TASKS.length+'</div>'+
 TASKS.map(function(t,i){
   var isDone=done.indexOf(t.id)>=0;
   var active=!isDone && (i===0 || done.indexOf(TASKS[i-1].id)>=0);
   return '<div class="g33-task '+(active?'current':'')+'"><div class="g33-title">'+(i+1)+'. '+t.title+'</div><div class="g33-text">'+t.text+'</div><div class="g33-reward">🎁 '+t.reward+'</div><div class="g33-status">'+(isDone?'✓ '+t.doneText:(active?'Текущее задание':'🔒 Сначала выполни предыдущее'))+'</div></div>';
 }).join("");
}
function close(){var m=document.getElementById("g33Tasks");if(m)m.classList.remove("show")}

function install(){
 var home=document.getElementById("home");
 if(!home)return;
 var btn=document.getElementById("g23-bottom5");
 if(btn){
  btn.removeAttribute("data-screen");
  btn.removeAttribute("data-action");
  btn.setAttribute("aria-label","Задания");
  if(btn.dataset.g33Tasks!=="1"){
   btn.dataset.g33Tasks="1";
   btn.addEventListener("click",function(e){
    e.preventDefault();e.stopImmediatePropagation();open();
   },true);
  }
 }
 /* Fallback: the baked city button is the fifth bottom slot. */
 if(!document.documentElement.dataset.g33Fallback){
  document.documentElement.dataset.g33Fallback="1";
  document.addEventListener("click",function(e){
   var t=e.target;
   if(!t || !home.contains(t))return;
   var r=t.getBoundingClientRect(),hr=home.getBoundingClientRect();
   var x=r.left-hr.left, y=r.top-hr.top;
   /* Do not use geometry fallback if an existing hit target handled it. */
   if(t.closest("#g23-bottom5"))return;
   if(x>=hr.width*.668 && x<=hr.width*.834 && y>=hr.height*.86){
    e.preventDefault();e.stopImmediatePropagation();open();
   }
  },true);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install);
else install();
setTimeout(install,150);setTimeout(install,500);setTimeout(install,1000);setTimeout(install,1800);
window.TerritoryTasks={open:open,close:close};
})();