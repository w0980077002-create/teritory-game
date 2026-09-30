TERRITORY CLIENT FINAL CUMULATIVE PATCH — AUTH / RE-ENTRY / FULL AUTHORITY CHAIN

Based on verified Fix 16 cumulative client patch.

Included cumulative fixes:
- Telegram auth bridge is loaded by index.html.
- Server hydration is guarded: applying authoritative state cannot immediately trigger a write-back.
- Re-entry/visibility refresh is throttled and pulls authoritative server state.
- PvE authority + elixir transcript trace.
- Server-authoritative consumable purchases.
- Server-authoritative forge upgrade/salvage.
- Server-authoritative daily/weekly/story/achievement rewards.
- Server-authoritative world/NPC reward claims.
- Live Arena bridge and follower/Arena protection.
- ForgeV2 opens the real forge UI instead of the legacy fake level-up action.

No battle formulas were changed in this patch.

IMPORTANT:
This is a cumulative OVERLAY patch. Upload/replace only the files in this ZIP in the existing client repository.
Do not delete other project files.
Server package must be deployed separately.
