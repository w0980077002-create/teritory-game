/* Territory S98 server patch
   Adds safe inventory dropping. Run: node apply-s98.js
*/
const fs=require("fs");
const target="server.js";
let s=fs.readFileSync(target,"utf8");
if(!s.includes("S98 DROP INVENTORY")){
  fs.copyFileSync(target,target+".s97-backup");
  const marker="// S98 DROP INVENTORY";
  const route=`
// S98 DROP INVENTORY
if(req.method==="POST" && pathname==="/api/equipment/drop"){
  try{
    const body=JSON.parse(bodyText||"{}");
    const id=String(body.playerId||"");
    const itemId=String(body.itemId||"");
    const qty=Math.max(1,Math.floor(Number(body.quantity||1)));
    const p=db.players[id];
    if(!p) return sendJson(res,404,{error:"player not found"});
    p.inventory=p.inventory||[];
    p.equipment=p.equipment||{};
    if(p.equipment.weapon===itemId||p.equipment.armor===itemId||p.equipment.belt===itemId)
      return sendJson(res,400,{error:"unequip item before dropping"});
    const idx=p.inventory.findIndex(x=>(x.id||x.itemId||x.key)===itemId);
    if(idx<0) return sendJson(res,404,{error:"item not found"});
    const item=p.inventory[idx];
    const have=Number(item.quantity||item.qty||1);
    if(have>qty){
      if(item.quantity!=null)item.quantity=have-qty; else item.qty=have-qty;
    }else p.inventory.splice(idx,1);
    saveDb();
    return sendJson(res,200,{ok:true,inventory:p.inventory,equipment:p.equipment,coins:Number(p.coins||0)});
  }catch(e){return sendJson(res,400,{error:e.message||"bad request"});}
}
`;
  // Insert before the first route handler block if possible; fallback before final request processing.
  const candidates=[
    'if(req.method==="POST" && pathname==="/api/pvp/challenge")',
    'if (req.method === "POST" && pathname === "/api/pvp/challenge")',
    'if(pathname==="/api/pvp/challenge")'
  ];
  let pos=-1;
  for(const c of candidates){pos=s.indexOf(c);if(pos>=0)break;}
  if(pos<0) throw new Error("Could not find route insertion point");
  s=s.slice(0,pos)+route+s.slice(pos);
  fs.writeFileSync(target,s);
  console.log("S98 applied. Backup: "+target+".s97-backup");
}else console.log("S98 already applied.");
