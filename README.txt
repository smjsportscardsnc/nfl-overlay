SMJ Firebase Overlay - Fixed Controls
====================================

OBS:
- Use index.html as browser source.
- Width: 1920
- Height: 1080.

Control:
- Open control.html.
- It now always renders:
  - Fullscreen graphic trigger buttons
  - Full 32-team sold/available grid
  - Break title control
  - Status control
  - Ticker control
  - Reset sold teams button

Firebase:
- Paste your existing Firebase web app config into js/firebase.js.
- Realtime Database must be enabled.
- Database path used: smjOverlay/current.

Important:
If the Firebase config is still placeholder text, the control page will still show the controls,
but the buttons will not affect OBS until js/firebase.js is filled in.


Polish update:
- assets/logo.png is now included and displayed in the scoreboard.
- Replace assets/logo.png with your real transparent SMJ logo when ready.
- Video playback is muted/preloaded and cache-busted for more reliable OBS triggering.
- NFL logos now sit on a bright circular backing plate so dark logos are easier to see.
