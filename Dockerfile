FROM nginx:alpine

# Territory / Render hotfix
# - Serve the SPA on Render's PORT (default 10000 for this project).
# - Disable stale HTML/JS/CSS caching so Telegram WebApp and mobile browsers
#   cannot keep the previous build after deploy.
# - Apply the game asset fallbacks at image build time without touching the
#   approved HOME foundation design.

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Apply runtime CSS fixes after the repository files are copied.
RUN cat /usr/share/nginx/html/game-runtime-fix.css >> /usr/share/nginx/html/game.css \
    && rm -f /usr/share/nginx/html/game-runtime-fix.css \
    && mkdir -p /usr/share/nginx/html/assets \
    && cp /usr/share/nginx/html/sdolars_clean_scene.png /usr/share/nginx/html/assets/sdolars_mobile_scene.png

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
