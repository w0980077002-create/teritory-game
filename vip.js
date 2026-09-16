/* Territory VIP bridge v4.1
   VIP/Alex quest is owned by arena.js in the stable build.
   Kept as a safe compatibility file so older index.html versions
   can still load vip.js without creating duplicate buttons/listeners.
*/
(()=>{'use strict';
const ready=()=>window.territoryAlexVIPQuest&&window.territoryVIP;
if(ready())return;
let n=0;
const timer=setInterval(()=>{
  if(ready()||++n>30){clearInterval(timer);return}
},500);
})();