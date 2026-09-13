/* Territory S86 — Tactical battle client
   Sends exactly 1 attack zone + exactly 2 defense zones.
   Four zones: head / chest / belt / legs.
*/
(()=>{'use strict';
const Z=[
  ['head','Голова','Head'],
  ['chest','Грудь','Chest'],
  ['belt','Пояс','Belt'],
  ['legs','Ноги','Legs']
];
const S86={
  attack:null, defense:[], match:null,
  labels(){return location.pathname&&document.documentElement.lang==='en'},
  zoneName(z){const x=Z.find(a=>a[0]===z);return x?(this.labels()?x[2]:x[1]):z},
  valid(){return !!this.attack&&this.defense.length===2&&!this.defense.includes(this.attack)},
  payload(matchId){return {matchId,zone:this.attack,defenseZones:this.defense.slice(0,2)}}
};
window.TerritoryS86=S86;
window.TerritoryS86Zones=Z;
})();