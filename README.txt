SMJ Cinematic Motion Overlay
============================

OBS:
- Use index.html as Browser Source.
- Width: 1920
- Height: 1080.

Control:
- Open control.html.
- Trigger full-screen cinematic graphics.
- Mark teams sold/available.
- Update title, status, and ticker.
- Reset sold teams.

Preview:
- Open motion-preview.html to test the motion graphics without OBS or Firebase.

This version does NOT rely on MP4 playback.
It uses real-time canvas motion graphics:
- particles
- shockwaves
- stadium lighting
- chrome panels
- light sweeps
- kinetic broadcast title cards

Firebase:
- Your Firebase config is already included in js/firebase.js.
- Realtime Database path: smjOverlay/current.

Logo:
- Replace assets/logo.png with your real transparent SMJ logo if desired.
