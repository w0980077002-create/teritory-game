import { DurableObject } from "cloudflare:workers";

const ZONES =;
const ATTACK_ZONES =;
const MAX_NAME = 40;
const START = {coins:1779, gems:1330, energy:100, hp:120, maxHp:120, level:3, exp:120, maxExp:150, strength:12, agility:9, freePoints:0, wins:0, losses:0, battles:0};

const DISTRICTS = [
  {id:'square',name:'Центральная площадь',level:1,cost:0,icon:'🏰'},
  {id:'forest',name:'Северный лес',level:3,cost:3,icon:'🌲'},
  {id:'harbor',name:'Порт Sdolars',level:8,cost:5,icon:'⚓'},
  {id:'industrial',name:'Промзона',level:12,cost:7,icon:'🏭'},
  {id:'fortress',name:'Старая крепость',level:18,cost:10,icon:'🏛️'}
];
const ADVENTURE_QUESTS = [
  {id:'forest_patrol',district:'forest',name:'Патруль... Поговори с кузнецом',goal:3,reward:180,xp:45,energy:8}
];
const ENEMIES = [
  {name:'Уличный боец',hp:90,damage:8,def:3,reward:90,xp:25},
  {name:'Ледяной тролль',hp:170,damage:14,def:9,reward:200,xp:50}
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'Content-Type,Authorization,X-Telegram-Init-Data,X-Guest-Id,X-Guest-Name'
    }
  });
}

function cleanId(v) { return String(v ?? '').replace(/[^a-zA-Z0-9_:@.-]/g, '').slice(0, 120); }
function safeName(v) { return String(v ?? 'Игрок').replace(/[<>]/g, '').slice(0, MAX_NAME) || 'Игрок'; }
function validMove(m) { const attack = Number(m.attack), defs = Array.isArray(m.defs) ? m.defs.map(Number) : []; return Number.isInteger(attack) && ATTACK_ZONES.includes(attack) && defs.length === 2 && defs[0] !== defs[1] && defs.every(x => Number.isInteger(x) && ZONES.includes(x)); }
function esc(s) { return String(s ?? '').replace(/[<>]/g, ''); }

async function hmacHex(keyBytes, data) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function telegramAuth(initData, botToken, maxAge = 86400) {
  if (!initData || !botToken) return null;
  const p = new URLSearchParams(initData), hash = p.get('hash'); if (!hash) return null;
  const authDate = Number(p.get('auth_date') || 0); if (!authDate || Date.now() / 1000 - authDate > maxAge) return null;
  p.delete('hash'); const dataCheck = [...p.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secretBuf = await crypto.subtle.sign('HMAC', await crypto.subtle.importKey('raw', new TextEncoder().encode('WebAppData'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), new TextEncoder().encode(botToken));
  const calc = await hmacHex(secretBuf, dataCheck); if (calc !== hash) return null;
  let user; try { user = JSON.parse(p.get('user') || '{}'); } catch { return null; }
  if (!user?.id) return null;
  return { playerId: 'tg_' + String(user.id), name: safeName([user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Игрок'), telegramId: String(user.id), username: safeName(user.username || '') };
}

async function authRequest(request, env) {
  const init = request.headers.get('X-Telegram-Init-Data') || new URL(request.url).searchParams.get('initData');
  if (env.TELEGRAM_BOT_TOKEN) { return telegramAuth(init, env.TELEGRAM_BOT_TOKEN); }
  if (env.ALLOW_GUESTS === 'true') {
    const gid = cleanId(request.headers.get('X-Guest-Id') || 'guest_' + (crypto.randomUUID?.() || Math.random().toString(36).slice(2)));
    return { playerId: gid, name: safeName(request.headers.get('X-Guest-Name') || 'Игрок'), telegramId: null, username: '', guest: true };
  }
  return null;
}

const INDEX_HTML = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<script src="https://telegram.org"></script>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Territory — Sdolars</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%;overflow:hidden;background:#020914;color:#fff;font-family:Arial,sans-serif}
button{font:inherit;color:inherit;border:0;cursor:pointer}
#app{height:100dvh;width:100%;max-width:832px;margin:auto;display:flex;flex-direction:column;background:#031426;overflow:hidden}
.top{height:112px;flex:none;background:linear-gradient(#03182b,#031222);border-bottom:3px solid #0b8dd9;display:flex;padding:5px 8px;gap:5px}
.heroHead{width:42%;display:flex;align-items:center;gap:5px;min-width:0}
.avatar{width:64px;height:64px;border:2px solid #78d1ff;border-radius:12px;overflow:hidden;position:relative;flex:none}
.avatar img{width:100%;height:100%;object-fit:cover;object-position:center}
.lvl{position:absolute;left:-2px;bottom:-2px;background:#082744;border:2px solid #72ccff;border-radius:8px;padding:1px 6px;font-size:14px;font-weight:900}
.title{font-size:17px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px}
.chapter{font-size:12px;color:#76cbff;font-weight:900;margin-top:1px}
.xp{height:10px;max-width:155px;border:1px solid #237bb5;border-radius:8px;margin-top:3px;overflow:hidden;background:#071c2d}
.xp i{display:block;width:40%;height:100%;background:#10c8f1}
.xpt{font-size:10px;margin-top:1px}
.hud{flex:1;min-width:0}
.resources{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.res{height:34px;background:#061c31;border:2px solid #1b72ad;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;white-space:nowrap}
.res b{font-size:14px;margin-right:2px}.coin b{color:#ffd52d}.dia b{color:#4eeaff}.ene b{color:#ffd52d}
.tools{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-top:3px}
.tool{height:34px;background:#082540;border:2px solid #1b71ad;border-radius:8px;position:relative;font-size:15px;display:grid;place-items:center}
.badge{position:absolute;right:-5px;top:-7px;width:24px;height:24px;border-radius:50%;background:#ff3657;border:2px solid #ff9caf;display:grid;place-items:center;font-size:14px;font-weight:900;z-index:10}
.world{position:relative;flex:1;min-height:0;background:#071b2b;overflow:hidden}
.world:after{content:"";position:absolute;inset:0;background:rgba(0,8,15,.13);pointer-events:none}
.world>*{z-index:2}
.quest,.daily,.left,.right,.actions,.reward{position:absolute}
.quest{left:2%;top:2%;width:42%;height:74px;padding:6px 8px;text-align:left;border:2px solid #178bd8;border-radius:11px;background:#061d34ed}
.quest small{color:#ffd42b;font-size:11px;font-weight:900}
.quest strong{display:block;font-size:13px;margin-top:4px}.quest span{display:block;color:#a5cce7;font-size:9px;margin-top:4px}
.daily{right:2%;top:3%;width:35%;height:72px;border:2px solid #ffd129;border-radius:11px;background:#211044f2;text-align:center;padding:5px}
.daily .chest{font-size:20px;float:left}.daily b{display:block;color:#ffd42b;font-size:11px;margin-top:10px}.daily time{display:block;font-size:13px;font-weight:900;margin-top:5px}
.left{left:2%;top:27%;display:flex;flex-direction:column;gap:5px}
.smallBtn{width:50px;height:50px;border:2px solid #1688d5;border-radius:10px;background:#082b48;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:8px;font-weight:900;position:relative}
.smallBtn .icon{font-size:16px;line-height:16px;margin-bottom:1px}
.right{right:2%;top:29%;width:41%;display:flex;flex-direction:column;gap:5px}
.location{height:50px;border:2px solid #1688d5;border-radius:10px;background:#082b48;display:flex;align-items:center;gap:5px;padding:3px 5px;position:relative;text-align:left}
.location .icon{font-size:17px;width:22px;text-align:center;flex:none}
.location strong{font-size:11px}.location small{display:block;color:#a5cce7;font-size:8px;margin-top:1px}
.actions{left:2%;right:2%;bottom:13%;display:grid;z-index:12;position:absolute;grid-template-columns:repeat(4,1fr);gap:4px}
.action{height:58px;border-radius:10px;border:2px solid #148fe4;background:linear-gradient(#0a4d89,#071e3d);display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:11px;position:relative}
.action:nth-child(2){border-color:#f0a900;background:linear-gradient(#c77c00,#704000)}
.action:nth-child(3){border-color:#a646ff;background:linear-gradient(#5b18aa,#260b58)}
.action:nth-child(4){border-color:#13d895;background:linear-gradient(#087950,#06432f)}
.action .icon{font-size:17px;line-height:17px;margin-bottom:1px}
.reward{left:2%;right:2%;bottom:1%;height:46px;border:2px solid #1986ca;border-radius:10px;background:#061c32;display:flex;align-items:center;padding:3px 6px;gap:5px}
.reward .icon{font-size:19px}.rewardText{font-size:10px;font-weight:900;flex:1}.rewardText small{display:block;color:#a4cce6;font-size:8px;margin-top:1px}.rewardText b{color:#ffd42b}
.claim{height:34px;min-width:92px;border:2px solid #ffda5b;border-radius:9px;background:linear-gradient(#ffd955,#c47700);color:#160d00;font-size:13px;font-weight:900}
.bottom{height:62px;flex:none;background:#03182b;border-top:2px solid #124b71;display:grid;grid-template-columns:repeat(6,1fr)}
.bottom button{background:#03192d;border-right:1px solid #173f5a;color:#a0c1da;font-size:8px;font-weight:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.bottom button span:first-child{font-size:17px;line-height:17px}
.bottom .active{color:#ffd52a!important;background:#03192d!important;border:0!important;box-shadow:none!important;outline:0!important}
.modal{position:fixed;inset:0;background:#000b;z-index:30;display:none;align-items:flex-end}.modal.open{display:flex}
