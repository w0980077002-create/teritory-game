TERRITORY — S104 VIDEO ANALYSIS

The supplied gameplay video was inspected frame-by-frame around the combat scene.

Observed design/mechanics to carry into Territory:
- The fight is presented as a compact mobile arena rather than a large web form.
- Two combatants are visible simultaneously with strong HP/status information.
- Combat advances automatically in short repeated actions.
- A countdown timer communicates the battle window.
- Combat has a resource/energy concept that supports stronger abilities.
- Abilities are presented as compact action cards/buttons.
- Damage feedback is visual and immediate: numbers appear over the combatants and
  disappear with an upward motion.
- Critical/strong hits need stronger visual emphasis than ordinary hits.
- The battle ends in a clear result state with reward/progression information.
- Progression is visible through XP and level information, so the result of combat
  naturally leads into character growth.
- The interface is dark, compact and game-like; Territory's existing translucent
  menu style is therefore kept instead of replacing the whole UI.

S104 implementation mapping:
video timer          -> 30-second arena timer
auto attacks         -> player/enemy AI turn loop
HP/status            -> animated HP bars + numeric HP
resource             -> purple energy/rage bar
abilities            -> four compact skill cards
damage feedback      -> floating animated damage/heal numbers
critical hit         -> larger highlighted number + log entry
dodge                -> missed-hit log event
result               -> victory/end overlay
progression          -> XP bar + level-up calculation
next fight            -> next-opponent action

Next server-side step recommended:
Move the battle simulation and reward calculation to a server endpoint. The client
should only send an action/seed/request and receive an authoritative result. This
prevents players from modifying XP/rewards from browser JavaScript.
