TERRITORY — ARENA FIX

Source:
- arena.js: current Arena file from the GitHub main branch at the time of audit.
- follower-arena.js: current GitHub file, fixed.

Root cause fixed:
The old follower-arena.js installed a MutationObserver on document.body. Its callback called decorate(), which modified follower DOM nodes. Those DOM mutations triggered the observer again, creating a feedback loop and freezing the browser when an Arena battle was rendered.

Fix:
- Removed the MutationObserver loop.
- Arena's existing render() already calls window.FollowerArena.decorate() after rebuilding the battle DOM, so the observer was unnecessary.
- Added small change guards in syncWrap() so repeated decorate() calls do not write unchanged text.

IMPORTANT:
This is an ARENA FIX package, not a full mirror of the GitHub repository. Upload/replace ONLY these two files in the existing repository root:
  arena.js
  follower-arena.js
Do not delete the other project files.
