(function(){
'use strict';
function render(){
 const home=document.getElementById('home');if(!home||home.dataset.ready)return;home.dataset.ready='1';
 home.innerHTML=`<div class="home-reference-host">
  <img class="home-reference-image" src="home-master.png" alt="Territory">
  <div class="home-hit-layer" aria-label="Главное меню">
   <button class="home-hit top profile" data-home-action="hero" aria-label="Профиль"></button>
   <button class="home-hit top coins" data-home-action="coins" aria-label="Монеты"></button>
   <button class="home-hit top gems" data-home-action="gems" aria-label="Синие алмазы"></button>
   <button class="home-hit top redgems" data-home-action="redgems" aria-label="Красные алмазы"></button>
   <button class="home-hit top trophy" data-home-action="trophy" aria-label="Трофеи"></button>
   <button class="home-hit top mail" data-home-action="mail" aria-label="Почта"></button>
   <button class="home-hit top settings" data-home-action="settings" aria-label="Настройки"></button>
   <button class="home-hit energy" data-home-action="energy" aria-label="Энергия"></button>
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
   <button class="home-hit chapter" data-home-action="chapter" aria-label="Северные земли"></button>
   <button class="home-hit gear g1" data-home-action="gear1" aria-label="Оружие"></button>
   <button class="home-hit gear g2" data-home-action="gear2" aria-label="Шлем"></button>
   <button class="home-hit gear g3" data-home-action="gear3" aria-label="Броня"></button>
   <button class="home-hit gear g4" data-home-action="gear4" aria-label="Обувь"></button>
   <button class="home-hit gear g5" data-home-action="gear5" aria-label="Эликсир снаряжения"></button>
   <button class="home-hit gear g6" data-home-action="gear6" aria-label="Аксессуар"></button>
   <button class="home-hit elixir e1" data-home-action="elixir1" aria-label="Эликсир 1"></button>
   <button class="home-hit elixir e2" data-home-action="elixir2" aria-label="Эликсир 2"></button>
   <button class="home-hit elixir e3" data-home-action="elixir3" aria-label="Эликсир 3"></button>
   <button class="home-hit elixir e4" data-home-action="elixir4" aria-label="Эликсир 4"></button>
   <button class="home-hit locked l1" data-home-action="locked1" aria-label="Закрытая ячейка"></button>
   <button class="home-hit locked l2" data-home-action="locked2" aria-label="Закрытая ячейка"></button>
   <button class="home-hit locked l3" data-home-action="locked3" aria-label="Закрытая ячейка"></button>
   <button class="home-hit speed" data-home-action="speed" aria-label="Скорость x2"></button>
   <button class="home-hit auto" data-home-action="auto" aria-label="Автобой"></button>
   <button class="home-hit honor" data-home-action="honor" aria-label="Почётные звания"></button>
   <button class="home-hit blessing" data-home-action="blessing" aria-label="Благословение"></button>
   <button class="home-hit bottom b1" data-home-action="home" aria-label="Город"></button><button class="home-hit bottom b2" data-home-action="inventory" aria-label="Инвентарь"></button><button class="home-hit bottom b3" data-home-action="hero" aria-label="Герой"></button><button class="home-hit bottom b4" data-home-action="battle" aria-label="Бой"></button><button class="home-hit bottom b5" data-home-action="quests" aria-label="Квесты"></button><button class="home-hit bottom b6" data-home-action="games" aria-label="Игры"></button><button class="home-hit bottom b7" data-home-action="clan" aria-label="Клан"></button>
  </div></div>`;
}
function startRunner(){window.PvEFlow?.startRunner?.()}function openBoss(){window.PvEFlow?.openBoss?.()}window.HomeRebuild={render,startRunner,openBoss,refresh:render};document.addEventListener('DOMContentLoaded',render);
})();
