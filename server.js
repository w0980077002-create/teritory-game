import "dotenv/config";
import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { Bot, InlineKeyboard } from "grammy";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null;

const memory = new Map();
const items = {
  sword: { name: "Клинок моря", price: 500, power: 5 },
  armor: { name: "Броня капитана", price: 700, power: 8 },
  potion: { name: "Энергия", price: 150, energy: 30 }
};

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  if (!pool) return;
  const fs = await import("node:fs/promises");
  await pool.query(await fs.readFile(path.join(__dirname, "schema.sql"), "utf8"));
}
function validateInitData(initData) {
  if (!initData || !process.env.BOT_TOKEN) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheckString = [...params.entries()].sort().map(([k,v]) => `${k}=${v}`).join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(process.env.BOT_TOKEN).digest();
  const calculated = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash))) return null;
  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now()/1000 - authDate > 86400) return null;
  try { return JSON.parse(params.get("user")); } catch { return null; }
}
async function getPlayer(id, user={}) {
  if (pool) {
    let r = await pool.query("SELECT * FROM players WHERE telegram_id=$1", [id]);
    if (!r.rowCount) {
      await pool.query("INSERT INTO players(telegram_id,username,first_name) VALUES($1,$2,$3)", [id,user.username||null,user.first_name||"Игрок"]);
      r = await pool.query("SELECT * FROM players WHERE telegram_id=$1", [id]);
    }
    return r.rows[0];
  }
  if (!memory.has(String(id))) memory.set(String(id), { telegram_id:id, username:user.username||"player", first_name:user.first_name||"Игрок", coins:1000,gems:50,energy:100,level:1,xp:0,power:10,territory:1 });
  return memory.get(String(id));
}
async function savePlayer(p) {
  if (!pool) { memory.set(String(p.telegram_id), p); return p; }
  await pool.query(`UPDATE players SET username=$2,first_name=$3,coins=$4,gems=$5,energy=$6,level=$7,xp=$8,power=$9,territory=$10,updated_at=NOW() WHERE telegram_id=$1`,
    [p.telegram_id,p.username,p.first_name,p.coins,p.gems,p.energy,p.level,p.xp,p.power,p.territory]);
  return p;
}
function auth(req) {
  const user = validateInitData(req.header("x-telegram-init-data") || req.body?.initData);
  return user || (process.env.DEV_MODE === "true" ? { id: 999999, first_name:"Demo", username:"demo" } : null);
}
app.get("/api/health", (_req,res)=>res.json({ok:true,game:"Teritory",https:true}));
app.get("/api/config", (_req,res)=>res.json({botUsername:process.env.BOT_USERNAME||null,webappUrl:process.env.WEBAPP_URL||null}));

app.get("/api/me", async (req,res)=>{
  const user=auth(req); if(!user) return res.status(401).json({error:"Telegram авторизация не найдена"});
  res.json({player:await getPlayer(user.id,user), items});
});
app.post("/api/battle", async (req,res)=>{
  const user=auth(req); if(!user) return res.status(401).json({error:"Unauthorized"});
  const p=await getPlayer(user.id,user);
  if(p.energy<5) return res.status(400).json({error:"Недостаточно энергии"});
  const damage=Math.max(1,Number(req.body.damage)||10);
  p.energy-=5;
  const enemyHp=Math.max(0,Number(req.body.enemyHp ?? 100)-damage);
  let victory=false, reward=0;
  if(enemyHp===0){ victory=true; reward=150+p.level*25; p.coins+=reward; p.xp+=50; p.gems+=2; p.territory=Math.min(10,p.territory+1); if(p.xp>=p.level*200){p.xp-=p.level*200;p.level++;p.power+=3;} }
  await savePlayer(p);
  res.json({player:p,enemyHp,victory,reward});
});
app.post("/api/shop/buy", async (req,res)=>{
  const user=auth(req); if(!user) return res.status(401).json({error:"Unauthorized"});
  const p=await getPlayer(user.id,user), item=items[req.body.itemId];
  if(!item) return res.status(404).json({error:"Товар не найден"});
  if(p.coins<item.price) return res.status(400).json({error:"Недостаточно монет"});
  p.coins-=item.price;
  if(item.energy) p.energy=Math.min(100,p.energy+item.energy);
  if(item.power) p.power+=item.power;
  await savePlayer(p);
  res.json({player:p});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

async function startBot() {
  if (!process.env.BOT_TOKEN) { console.log("BOT_TOKEN не задан — бот отключён."); return; }
  const bot = new Bot(process.env.BOT_TOKEN);
  const keyboard = new InlineKeyboard().webApp("🎮 Играть в Teritory", process.env.WEBAPP_URL || "https://example.com");
  bot.command("start", ctx => ctx.reply("Добро пожаловать в Teritory! Захватывай территории и развивай свою команду.", { reply_markup: keyboard }));
  bot.command("game", ctx => ctx.reply("Открывай игру:", { reply_markup: keyboard }));
  await bot.api.setMyCommands([{command:"start",description:"Запустить Teritory"},{command:"game",description:"Открыть игру"}]);
  bot.start();
  console.log("Telegram-бот запущен");
}
await initDb();
app.listen(PORT, ()=>console.log(`Teritory server on ${PORT}`));
startBot().catch(console.error);
