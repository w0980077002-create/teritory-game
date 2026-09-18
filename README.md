# Territory G48 GLOBAL

G48 is a global PvE gameplay pass built from the verified G47 package.

## PvE now follows the observed/source-defined city loop
- City PvE is separate from Arena PvP.
- The hero advances to the right through sequential ordinary bots.
- Each bot requires manual player actions; there is no automatic progression.
- A visible 0–100% city progress track advances by 20% after each ordinary bot victory.
- At 100%, an isolated city-boss battle opens.
- The prototype boss has a 60-second timer.
- Boss victory grants a reward, opens the next city level and resets city progress to 0%.
- Boss defeat/time-out does not advance the city; the player remains on the current city and can prepare for another attempt.
- Defeat reduces hunger by 5%.
- Battle Stones are consumed by manual attacks; when they reach 0, attacks cannot continue.

## Combat presentation
- Player and enemy have separate HP bars.
- Player selects one attack zone and exactly two defense zones before each manual strike.
- The bot chooses two defensive zones for the response.
- The bot answers after the player's strike.
- The combat journal records the exchange and can be collapsed.
- Equipment durability decreases during combat.

## Preserved
- Sdolars City artwork, composition and interaction layer.
- Existing City buttons/hit areas.
- Forge, durability, five equipment slots, market and local save.
- Arena duel / chaos / group remains a separate PvP prototype.

## Changed files
- `Territory_G48_GLOBAL.js`
- `Territory_G48_GLOBAL.css`
- `index.html`
- `README.md`

## Unchanged base files
- `app.js`
- `arena.css`
- `arena.js`
- `game.css`
- `style.css`
- `sdolars_clean_scene.png`

## Prototype boundary
Cross-device multiplayer, authoritative economy, anti-cheat and server validation still require the separate SERVER/WebSocket implementation. Boss balance values in this prototype are tunable and are not claimed as final values from the reference video.

Do not upload this package to the SERVER repository.


G48: архитектурно разделены городской PvE-бой и Arena PvP. Городской «Бой» использует отдельный PvE-цикл: последовательные боты → 0–100% → отдельный босс с таймером → следующий город. PvE больше не использует командные/комнатные механики Arena. Arena оставлена отдельным PvP-модулем с собственными правилами.
