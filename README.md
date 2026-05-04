# SMJ Animated Break Overlay

A self-contained OBS / Whatnot overlay package for SMJ Sports Cards & Collectibles.

## Files

- `index.html` — OBS browser-source overlay
- `control.html` — tablet/desktop control panel
- `style.css` — visual design and animations
- `app.js` — overlay state, team controls, ticker, and animation triggers
- `firebase.js` — optional Firebase config placeholder

## OBS Setup

1. Add a new **Browser Source** in OBS.
2. Choose **Local File**.
3. Select `index.html`.
4. Set width to **900** and height to **360**.
5. Position it at the top of your Whatnot layout.

## Control Setup

Open `control.html` in Chrome on the same computer. Changes will update the OBS overlay through local browser storage/BroadcastChannel.

For tablet control from another device, host the folder on GitHub Pages, Netlify, or Firebase Hosting and wire the Firebase config in `firebase.js`.

## Included Animated Moments

- Stash or Pass
- Spin 2 Choose 1
- Chaser Hit
- Break Full
- Giveaway Winner
- Sold/team pulse animation
- Animated ticker
- Rotating SMJ orb
- Broadcast-style event splash graphics

## Optional Real Video Overlays

You can add transparent `.webm` animation files later inside `/assets`, then replace the CSS event cards with video elements. Recommended names:

- `assets/stash-pass.webm`
- `assets/spin-2-choose-1.webm`
- `assets/chaser-hit.webm`
- `assets/break-full.webm`
- `assets/giveaway-winner.webm`

## Notes

This version intentionally uses CSS/HTML animations first so it runs light in OBS and does not require large video files.
