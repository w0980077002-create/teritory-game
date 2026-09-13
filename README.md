# Territory S81 — REAL PVP CLAN WAR

S81 продолжает S80 и добавляет серверные PvP-бои между игроками.

## Что внутри
- index.html — клиент GitHub Pages;
- server.js — Node.js + WebSocket/HTTP API;
- s80-client.js — серверная база кланов клиента.

## S81 PvP API
- POST /api/pvp/challenge
- GET /api/pvp/incoming?id=...
- POST /api/pvp/accept
- GET /api/pvp/mine?id=...
- POST /api/pvp/action

Для настоящего онлайна сервер нужно разместить отдельно от GitHub Pages и указать его адрес в localStorage `territory_server_url`.
