SMJ Restored Team Overlay with Uploaded Videos
=============================================

OBS Browser Source:
- index.html
- Width: 1920
- Height: 1080

Control Panel:
- control.html

Restored:
- Full team scoreboard in index.html
- Full 32-team sold/available control grid in control.html
- Firebase connection status indicator
- Break title, status, and ticker controls

Only video triggers:
- Stash or Pass = assets/videos/stash-or-pass.mp4
- Spin 2 Choose 1 = assets/videos/spin-2-choose-1.mp4

Firebase:
- Your Firebase config is included in js/firebase.js.
- Database path used: smjOverlay/current

Testing:
- Open preview.html to test the two uploaded videos directly.


Trigger fix:
- Control buttons now write to BOTH:
  smjOverlay/videoCommand
  smjOverlay/current/videoCommand
- Overlay listens to BOTH paths.
- Overlay retries video playback muted if OBS blocks autoplay with audio.
- Control panel now shows when a video command was sent.


Diagnostic trigger fix:
- Re-encoded both uploaded videos to H.264/AAC MP4 for browser/OBS compatibility.
- Control panel status updates immediately when a trigger button is clicked.
- Control panel reports Firebase success/failure.
- Overlay shows a temporary debug badge when it receives a command, loads a video, plays, fails, or ends.
- Overlay listens to:
  smjOverlay/videoCommand
  smjOverlay/current/videoCommand
  smjOverlay/current/motionCommand
