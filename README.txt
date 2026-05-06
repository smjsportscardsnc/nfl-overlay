SMJ Overlay - WebM Stingers with Embedded Sound

OBS:
- Use index.html
- Browser Source size: 1920x1080
- Enable "Control audio via OBS"
- Unmute browser source in OBS mixer
- Refresh browser source after replacing files

Fixes:
- Uses WebM stingers with embedded swoosh audio.
- Includes MP4 fallback stingers if WebM playback fails.
- Prevents stale Firebase commands from firing on page load.
- Stash or Pass should no longer appear immediately when the page loads.

Files:
- assets/stingers/stash-or-pass.webm
- assets/stingers/spin-2-choose-1.webm
- assets/stingers/stash-or-pass.mp4
- assets/stingers/spin-2-choose-1.mp4

If sound is still silent in OBS:
- Confirm the Browser Source audio is visible in the OBS mixer.
- Right-click Browser Source > Properties > enable Control audio via OBS.
- Make sure that source is not muted in Advanced Audio Properties.
