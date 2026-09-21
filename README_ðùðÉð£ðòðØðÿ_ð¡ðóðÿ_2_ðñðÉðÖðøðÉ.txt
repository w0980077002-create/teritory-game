TERITORY GAME — HOME FIX 02

БРО, В ЭТОЙ ВЕРСИИ Я ПОПРАВИЛ ПРИЧИНУ, ИЗ-ЗА КОТОРОЙ НА ТЕЛЕФОНЕ ОСТАВАЛСЯ СТАРЫЙ HOME.

ЗАМЕНИ НА GITHUB РОВНО 2 ФАЙЛА:

1) home-rebuild.js
2) nginx.conf

Оба файла лежат в этой папке и имеют те же имена, что в репозитории.
Ничего вручную в index.html менять НЕ НУЖНО.

После замены:
1. Commit changes.
2. Дождись нового Deploy на Render.
3. Открой Mini App заново.

nginx.conf теперь принудительно меняет версии home-rebuild.css и home-rebuild.js при выдаче index.html, чтобы Telegram WebView не взял старый HOME из кэша.
