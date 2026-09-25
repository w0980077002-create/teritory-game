
(function(){
'use strict';

const Store = window.TerritoryStore;
const UI = window.TerritoryUI;
let moveTimer = null;

function $(id){ return document.getElementById(id); }

function updateMapState(){
  const stage = Number(Store.state.stage || 1);
  $('mapStageTitle').textContent = `СЕВЕРНЫЕ ЗЕМЛИ · 2-${stage}`;
  $('mapStageName').textContent = stage >= 7 ? 'Заснеженный перевал' : `Северный путь ${stage}`;
  $('mapProgressFill').style.width = `${Math.max(10, Math.min(100, stage/7*100))}%`;
}

function resetScene(){
  const scene = $('mapScene');
  scene.classList.remove('is-moving','is-encounter');
  $('mapStart').hidden = false;
  $('mapStop').hidden = true;
  $('mapFight').hidden = true;
  $('mapBot').style.right = '-20%';
  $('mapHero').style.left = '23%';
  $('mapFollower').style.left = '16%';
  $('mapEncounterBanner').style.opacity = '0';
}

function openMap(){
  UI.show('map');
  updateMapState();
  resetScene();
}

function startMovement(){
  clearTimeout(moveTimer);
  const scene = $('mapScene');
  scene.classList.remove('is-encounter');
  scene.classList.add('is-moving');
  $('mapStart').hidden = true;
  $('mapStop').hidden = false;
  $('mapFight').hidden = true;

  // Hero advances right while the world moves left.
  $('mapHero').style.left = '34%';
  $('mapFollower').style.left = '27%';

  moveTimer = setTimeout(function(){
    if(!scene.classList.contains('is-moving')) return;
    $('mapBot').style.right = '40%';
    $('mapHero').style.left = '44%';
    $('mapFollower').style.left = '37%';

    setTimeout(function(){
      scene.classList.remove('is-moving');
      scene.classList.add('is-encounter');
      $('mapStop').hidden = true;
      $('mapFight').hidden = false;
      $('mapStart').hidden = true;
    }, 2100);
  }, 1800);
}

function stopMovement(){
  clearTimeout(moveTimer);
  resetScene();
}

function enterFight(){
  clearTimeout(moveTimer);
  // The existing Arena screen is the next block's destination.
  UI.show('arena');
}

$('mapStart').addEventListener('click', startMovement);
$('mapStop').addEventListener('click', stopMovement);
$('mapFight').addEventListener('click', enterFight);
$('mapBack').addEventListener('click', function(){ UI.home(); });

document.querySelectorAll('[data-map-nav]').forEach(function(btn){
  btn.addEventListener('click', function(){
    const route = btn.dataset.mapNav;
    if(route === 'map'){ openMap(); return; }
    if(route === 'home'){ UI.home(); return; }
    UI.show(route === 'quests' ? 'quests' : route);
  });
});

// Any existing roadmap entry can now open the real movement screen.
document.addEventListener('click', function(e){
  const target = e.target.closest?.('[data-open-map]');
  if(!target) return;
  e.preventDefault();
  openMap();
});

window.TerritoryMap = {
  open: openMap,
  start: startMovement,
  stop: stopMovement,
  encounter: function(){ $('mapScene').classList.add('is-encounter'); }
};
})();
