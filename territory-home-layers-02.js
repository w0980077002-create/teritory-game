/* TERRITORY — HOME LAYER FOUNDATION 02
   Goal:
   - keep the current composite home artwork visually unchanged;
   - make entity layers independently controllable;
   - provide one runtime API for replacing hero/follower/enemies later;
   - preserve all existing hit-zone classes and data-home-action hooks.
*/
(function(){
'use strict';

const DEFAULTS = {
  background: 'home-master.png',
  hero: '',
  follower: '',
  enemy1: '',
  enemy2: ''
};

const state = {
  assets: {...DEFAULTS},
  visible: {
    hero: true,
    follower: true,
    enemy1: true,
    enemy2: true
  }
};

function root(){
  return document.querySelector('#home .territory-home');
}

function entityLayer(){
  return root()?.querySelector('.territory-home-entity-layer');
}

function normalize(v){
  return v == null ? '' : String(v).trim();
}

function escapeAttr(v){
  return String(v ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function renderEntity(key, label, classes){
  const layer = entityLayer();
  if(!layer) return;

  let node = layer.querySelector(`[data-home-entity="${key}"]`);
  const src = normalize(state.assets[key]);

  if(!src){
    if(node) node.remove();
    return;
  }

  if(!node){
    node = document.createElement('img');
    node.className = `territory-home-entity ${classes}`;
    node.dataset.homeEntity = key;
    node.alt = '';
    node.setAttribute('aria-hidden','true');
    layer.appendChild(node);
  }

  node.src = src;
  node.style.display = state.visible[key] ? '' : 'none';
  node.dataset.entityLabel = label;
}

function renderAll(){
  renderEntity('hero','Главный герой','hero');
  renderEntity('follower','Последователь','follower');
  renderEntity('enemy1','Враг 1','enemy-1');
  renderEntity('enemy2','Враг 2','enemy-2');
}

function setAssets(next){
  if(!next || typeof next !== 'object') return {...state.assets};
  for(const key of Object.keys(DEFAULTS)){
    if(key in next) state.assets[key] = normalize(next[key]);
  }
  const bg = root()?.querySelector('.territory-home-background');
  if(bg && state.assets.background) bg.src = state.assets.background;
  renderAll();
  return {...state.assets};
}

function setVisible(key, value){
  if(!(key in state.visible)) return false;
  state.visible[key] = !!value;
  renderAll();
  return true;
}

function setPosition(key, css){
  const layer = entityLayer();
  const node = layer?.querySelector(`[data-home-entity="${key}"]`);
  if(!node || !css || typeof css !== 'object') return false;
  for(const [prop,val] of Object.entries(css)){
    if(typeof val === 'string' || typeof val === 'number'){
      node.style[prop] = String(val);
    }
  }
  return true;
}

function getState(){
  return {
    assets: {...state.assets},
    visible: {...state.visible}
  };
}

function boot(){
  renderAll();
}

window.TerritoryHomeLayers = {
  setAssets,
  setVisible,
  setPosition,
  getState,
  refresh: renderAll
};

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot, {once:true});
}else{
  boot();
}
})();