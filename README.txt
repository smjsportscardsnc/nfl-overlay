SMJ ESPN CDN 32-Team Scoreboard + Videos
========================================

OBS Browser Source
------------------
Width: 1920
Height: 1080

Persistent scoreboard:
900px wide x 360px high

Included:
- All 32 NFL teams
- ESPN CDN logo loading
- Team color glow styling
- Compact scoreboard design
- No lower-third bar
- Fullscreen MP4 animation videos

Video files:
- assets/videos/stash-or-pass.mp4
- assets/videos/spin-2-choose-1.mp4
- assets/videos/break-full.mp4
- assets/videos/big-hit.mp4

Trigger videos from the overlay page with:
SMJOverlay.playVideo("stash")
SMJOverlay.playVideo("spin")
SMJOverlay.playVideo("full")
SMJOverlay.playVideo("hit")

Team logos are loaded from ESPN CDN:
https://a.espncdn.com/i/teamlogos/nfl/500/{abbr}.png
