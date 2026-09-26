/* 10053 — two-bot approach visual */
(function(){
'use strict';
function addRearBot(){
  const root=document.getElementById('runnerScreen');
  if(!root)return;
  const stage=root.querySelector('.runner-stage');
  if(!stage||stage.querySelector('.runner-enemy-rear'))return;
  const e=document.createElement('div');
  e.className='runner-enemy runner-enemy-rear';
  e.innerHTML='<img src="./opponent-viking-approved.png" alt="" draggable="false"><span>Второй противник</span>';
  stage.appendChild(e);
}
const mo=new MutationObserver(addRearBot);
mo.observe(document.body,{childList:true});
setTimeout(addRearBot,500);
window.addEventListener('territory:screen',()=>setTimeout(addRearBot,100));
})();
