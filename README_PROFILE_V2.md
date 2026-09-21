TERRITORY PROFILE V2

This build replaces the previous profile navigation with a standalone profile layer.
It does NOT depend on the legacy #inventory screen or the legacy showScreen router.

Replace the full frontend package in the repository root.

After Render deploy:
1. Close Telegram Mini App completely.
2. Open it again.
3. Test all three profile entry points:
   - top SSS card;
   - "Профиль →" on the city card;
   - bottom "Профиль" navigation.

The new profile opens as a full-screen RPG profile over the app and reads the current TerritoryStore state.
Arena/backend were not modified.
