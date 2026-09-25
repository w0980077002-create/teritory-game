(function(){
'use strict';
function ready(fn){if(window.TerritoryChapters?.length)fn();else window.addEventListener('territory:chapters-ready',fn,{once:true})}
ready(function(){
 const s=window.TerritoryChaptersAPI.state();
 if(s){s.chapterCount=240;window.TerritoryStore?.saveNow?.()}
 const mapBtn=document.getElementById('mapChapterSkull');if(mapBtn)mapBtn.onclick=()=>window.TerritoryUI?.show('map');
 window.dispatchEvent(new CustomEvent('territory:state-changed'));
});
})();
