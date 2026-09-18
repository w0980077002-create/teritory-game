/* Territory G58 — Global Core Stabilization
   City visual is locked to sdolars_clean_scene.png.
   One visible City hit layer + one routing gateway. Existing gameplay modules remain intact.
*/
(function(){
  'use strict';
  const CORE='G58';
  const routes={
    profile:{ui:'profile'},gems:{ui:'gems'},coins:{ui:'coins'},energy:{ui:'energy'},combatStone:{ui:'combatStone'},
    messages:{ui:'messages'},achievements:{ui:'achievements'},settings:{ui:'settings'},language:{ui:'language'},
    bonuses:{ui:'bonuses'},events:{ui:'events'},vip:{ui:'vip'},tavern:{ui:'tavern'},repair:{ui:'repair'},
    game:{screen:'game'},forge:{screen:'inventory'},market:{screen:'market'},battle:{screen:'pve'},arena:{screen:'arena'},
    inventory:{screen:'inventory'},equipment:{screen:'inventory'},quests:{screen:'districts'},map:{screen:'districts'},home:{screen:'home'}
  };
  const zones=[
    ['profile','4.2%','1%','10.8%','7%'],['gems','39%','1%','15%','4.5%'],['coins','57%','1%','15%','4.5%'],['energy','75.8%','1%','18.8%','4.5%'],
    ['combatStone','39%','5%','15.5%','5.2%'],['messages','56%','5%','10.2%','5%'],['achievements','66%','5%','10.4%','5%'],['settings','77%','5%','10%','5%'],['language','87.5%','5%','10%','5%'],
    ['bonuses','1%','17%','12%','6%'],['events','1%','23.5%','12%','6%'],['vip','1%','30%','12%','6%'],['game','1%','36.8%','12%','6%'],
    ['forge',null,'24.3%','12.5%','6.5%'],['tavern',null,'31.5%','12.5%','6.5%'],['market',null,'38.5%','12.5%','6.5%'],
    ['battle','0','80%','16%','10%'],['arena','16%','80%','16%','10%'],['inventory','32%','80%','16%','10%'],['equipment','48%','80%','16%','10%'],
    ['quests','65%','80%','16%','10%'],['map','81%','80%','19%','10%'],
    ['alex','4%','44%','43%','37%']
  ];
  function boot(){
    const home=document.querySelector('#home .real-home');
    if(!home || home.dataset.g58Core==='1') return;
    home.dataset.g58Core='1';

    const style=document.createElement('style');
    style.id='territory-g58-core-css';
    style.textContent=`
      #home .g40-hit,#home .g40-ui-hit,#home .hotspot,#home .live-side-ui,#home .npc-label{display:none!important;pointer-events:none!important}
      #home .alex-hit{display:none!important;pointer-events:none!important}
      #territoryG58CityLayer{position:absolute;inset:0;z-index:120;pointer-events:none;touch-action:manipulation}
      #territoryG58CityLayer button{position:absolute;display:block;padding:0;margin:0;border:0;background:transparent;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
      #territoryG58CityLayer .g58-debug{display:none!important}
      @media(max-width:390px){#territoryG58CityLayer button{min-height:1px}}
    `;
    document.head.appendChild(style);

    const layer=document.createElement('div');
    layer.id='territoryG58CityLayer';
    layer.setAttribute('aria-label','Интерактивный город Territory');
    home.appendChild(layer);

    for(const [id,left,top,width,height] of zones){
      const b=document.createElement('button');
      b.type='button'; b.dataset.g58=id; b.setAttribute('aria-label',id==='alex'?'Поговорить с Alex':id);
      if(left!==null)b.style.left=left;
      else b.style.right='1%';
      b.style.top=top; b.style.width=width; b.style.height=height;
      layer.appendChild(b);
    }

    function proxyClick(selector){
      const el=document.querySelector(selector);
      if(el){ el.click(); return true; }
      return false;
    }
    function route(id){
      if(id==='alex'){
        if(typeof window.TerritoryAlexTalk==='function'){window.TerritoryAlexTalk();return;}
        const hit=document.querySelector('#home .alex-hit'); if(hit)hit.click();
        return;
      }
      const r=routes[id]; if(!r)return;
      if(r.ui){
        const el=document.querySelector('#home .g40-ui-hit[data-ui="'+r.ui+'"]');
        if(el){el.click();return;}
        if(typeof window.TerritoryUI==='object'&&typeof window.TerritoryUI.open==='function'){window.TerritoryUI.open(r.ui);return;}
      }
      if(r.screen){
        const el=document.querySelector('#home .g40-hit[data-screen="'+r.screen+'"]');
        if(el){el.click();return;}
        if(r.screen==='arena'&&typeof window.openArena==='function'){window.openArena();return;}
        if(r.screen==='pve'&&typeof window.pveOpen==='function'){window.pveOpen();return;}
        if(typeof window.showScreen==='function'){window.showScreen(r.screen);}
      }
    }

    // Capture only the new City layer. This prevents legacy city delegates from seeing the same tap twice.
    layer.addEventListener('click',function(e){
      const b=e.target.closest('[data-g58]'); if(!b)return;
      e.preventDefault(); e.stopPropagation();
      route(b.dataset.g58);
    },true);

    // Public core bridge for future systems. Existing modules can continue to coexist while we migrate them.
    window.TerritoryApp={
      version:CORE,
      city:{route},
      router:{go:route},
      isCityLocked:()=>!!document.querySelector('#home .real-home-image'),
      getState:()=>{try{return JSON.parse(localStorage.getItem('territory_save_v1')||localStorage.getItem('territory_save')||'null')}catch(_){return null}},
      saveState:(value)=>{try{localStorage.setItem('territory_save_v1',JSON.stringify(value));return true}catch(_){return false;}}
    };

    // Prevent accidental taps on old layers if they are revealed by another stylesheet.
    const observer=new MutationObserver(()=>{
      document.querySelectorAll('#home .g40-hit,#home .g40-ui-hit,#home .hotspot,#home .live-side-ui,#home .npc-label').forEach(el=>{
        el.style.pointerEvents='none';
      });
    });
    observer.observe(home,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
