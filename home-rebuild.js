(function(){
'use strict';
function render(){
  const home=document.getElementById('home');
  if(!home||home.dataset.ready)return;
  home.dataset.ready='1';
  home.innerHTML=`<div class="home-reference-host">
    <img class="home-reference-image" src="home-master.png" alt="Territory">
    <div class="home-hit-layer" aria-label="Главное меню">
      <button class="home-hit top" style="left:0;width:27%" data-home-action="hero" aria-label="Профиль"></button>
      <button class="home-hit top" style="left:82%;width:9%" data-home-action="trophy" aria-label="Трофеи"></button>
      <button class="home-hit top" style="left:91%;width:5%" data-home-action="mail" aria-label="Почта"></button>
      <button class="home-hit top" style="left:96%;width:4%" data-home-action="settings" aria-label="Настройки"></button>

      <button class="home-hit left side1" data-home-action="events" aria-label="События"></button>
      <button class="home-hit left side2" data-home-action="daily" aria-label="Ежедневные награды"></button>
      <button class="home-hit left side3" data-home-action="quests" aria-label="Задания"></button>
      <button class="home-hit left side4" data-home-action="invite" aria-label="Пригласить друзей"></button>
      <button class="home-hit left side5" data-home-action="sea" aria-label="Морской набор"></button>

      <button class="home-hit right side1" data-home-action="shop" aria-label="Лавка"></button>
      <button class="home-hit right side2" data-home-action="forge" aria-label="Кузница"></button>
      <button class="home-hit right side3" data-home-action="trials" aria-label="Испытания"></button>
      <button class="home-hit right side4" data-home-action="capture" aria-label="Захват улиц"></button>
      <button class="home-hit right side5" data-home-action="arena" aria-label="Арена"></button>

      <button class="home-hit center" data-home-action="map" aria-label="Путь главы"></button>

      <button class="home-hit bottom b1" data-home-action="home" aria-label="Город"></button>
      <button class="home-hit bottom b2" data-home-action="inventory" aria-label="Инвентарь"></button>
      <button class="home-hit bottom b3" data-home-action="hero" aria-label="Герой"></button>
      <button class="home-hit bottom b4" data-home-action="battle" aria-label="Бой"></button>
      <button class="home-hit bottom b5" data-home-action="quests" aria-label="Квесты"></button>
      <button class="home-hit bottom b6" data-home-action="games" aria-label="Игры"></button>
      <button class="home-hit bottom b7" data-home-action="clan" aria-label="Клан"></button>
    </div>
  </div>`;
}
function startRunner(){window.PvEFlow?.startRunner?.();}
function openBoss(){window.PvEFlow?.openBoss?.();}
window.HomeRebuild={render,startRunner,openBoss,refresh:render};
document.addEventListener('DOMContentLoaded',render);
})();