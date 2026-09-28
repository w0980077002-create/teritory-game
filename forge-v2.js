(function(){'use strict';
window.ForgeV2={open:function(){const m=document.getElementById('modal'),b=document.getElementById('modalBody');if(!m||!b)return;b.innerHTML='<h2>🔨 Кузница</h2><p>Снаряжение усиливается здесь. Улучшение сохранится в TerritoryStore.</p><button class="gold-btn" id="forgeUpgrade">Улучшить</button>';m.classList.add('show');document.getElementById('forgeUpgrade').onclick=()=>{const s=window.TerritoryStore?.state||{};s.level=(s.level||1)+1;s.profile.level=s.level;window.TerritoryStore?.saveNow?.();m.classList.remove('show')}}};
})();
