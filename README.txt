TERRITORY FIX 02 — CANONICAL HOME + SERVER HUD

IMPORTANT: upload/extract these files into the ROOT of the teritory-game repository.
Do not put them inside another folder.

This package includes home-master.png because the repository did not contain that
canonical artwork. The previous blank Home was caused by the image being absent.

What this pass does:
- restores the exact canonical Home artwork and scene from home-master.png;
- removes only the procedural duplicate Home layer and global VIP overlay;
- overlays live Level/VIP/currency/progression values from the authenticated Telegram account;
- keeps profile details separate from the Home nameplate;
- keeps Telegram as the only identity source.
