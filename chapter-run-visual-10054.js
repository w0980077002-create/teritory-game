/* 10054 — two bots move toward the hero together */
(function(){
'use strict';
function ensureRear(){
 const root=document.getElementById('runnerScreen');
 if(!root)return;
 const stage=root.querySelector('.runner-stage');
 if(!stage||stage.querySelector('.runner-enemy-rear'))return;
 const e=document.createElement('div');
 e.className='runner-enemy runner-enemy-rear';
 e.innerHTML='<img src="./opponent-viking-approved.png" alt="" draggable="false"><span>Бот 2</span>';
 stage.appendChild(e);
}
const mo=new MutationObserver(()=>ensureRear());
mo.observe(document.body,{childList:true,subtree:true});
setTimeout(ensureRear,100);
})();
