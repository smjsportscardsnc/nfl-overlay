SMJ Firebase Live-Control Overlay
=================================

OBS Browser Source:
- index.html
- Width: 1920
- Height: 1080

Control Panel:
- control.html
- Trigger fullscreen videos
- Mark teams sold/available
- Update break title, status, and ticker
- Reset sold teams

Firebase:
1. Open js/firebase.js
2. Paste your existing Firebase web app config.
3. Make sure Realtime Database is enabled.
4. Host the whole folder together, such as GitHub Pages.

Database path used:
smjOverlay/current

This version uses Firebase Realtime Database, not localStorage.
