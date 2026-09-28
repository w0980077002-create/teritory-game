TERRITORY — TOUCH CALIBRATION REPAIR v3

This overlay fixes the remaining home-screen touch zones using the supplied 689x1536 screenshot as the coordinate reference.

Added independent hit zones for:
- coins, blue gems, red gems, energy
- gear/equipment slots
- elixir slots and locked slots
- Northern Lands chapter banner
- x2 speed
- circular-arrow auto-battle control
- honor/crown
- blessing/star
- existing side menus and bottom navigation

Also replaces navigation.js so every new hit zone has an explicit route and no new button is silently ignored.

This is an OVERLAY package. Replace the three files in the existing repository:
  home-rebuild.js
  navigation.js
  navigation.css

Static JavaScript syntax checks should be run before upload. Full runtime testing in Telegram WebApp still needs to be done on the device.
