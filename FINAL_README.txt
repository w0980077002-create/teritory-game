TERITORY GAME — FINAL READY BUILD 10009

This folder is the clean runtime build audited from the current GitHub main branch.

Included runtime files are only those referenced by index.html, plus Docker/nginx config and approved game assets.
Unused legacy mobile navigation files and the old button-fix.js are intentionally excluded to prevent competing click handlers.

Checks performed:
- JavaScript syntax check: all runtime .js files
- index.html local asset reference check
- persistent global 7-button mobile navigation
- Arena duplicate bottom navigation disabled by the final router
- global back button routing
- HOME hitzone routing through window capture
- panel screens reserve space above bottom navigation
- local browser smoke test on mobile viewport
