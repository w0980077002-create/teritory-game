/* Territory G73 — Party / Invite / Notification Foundation */
(function(){'use strict';
 const social=window.TerritorySocial; if(!social)return;
 const st=social.state;
 function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
 function open(){social.party();}
 function invite(name='Игрок Sdolars'){st.social=st.social||{};st.social.party=st.social.party||{id:null,name:'',members:[],invites:[]};st.social.party.invites=Array.isArray(st.social.party.invites)?st.social.party.invites:[];st.social.party.invites.push({from:name,at:Date.now()});if(st.social.party.invites.length>10)st.social.party.invites=st.social.party.invites.slice(-10);social.notify('Приглашение от '+name,'invite');try{social.open('notifications')}catch(e){}}
 function wire(){document.addEventListener('click',e=>{const b=e.target.closest('[data-ui="party"],[data-social="party"],[data-social="invite"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.social==='invite')invite();else open();},true);}
 wire(); window.TerritoryParty={open,invite,version:'G73'};
})();
