# SMJ Compact Scoreboard + Full-Screen Animated Break Overlay

This version separates the layout into two layers:

1. **Compact scoreboard** — fixed at 900px wide by 360px tall, matching the older Whatnot-safe design size.
2. **Full-screen animations** — Stash or Pass, Spin 2 Choose 1, Break Full, Giveaway Winner, and Big Hit fill the entire OBS browser-source canvas.

## OBS Setup

Use `index.html` as a Browser Source. Recommended OBS browser-source size:

- Width: `1920`
- Height: `1080`

The scoreboard is intentionally only 900x360 and is centered at the top. The animated graphics use the full 1920x1080 browser source.

## Control Page

Open `control.html` in a second browser window or on a tablet. You can:

- Update break title and ticker
- Assign buyer usernames to NFL teams
- Mark teams sold
- Trigger full-screen Stash or Pass
- Trigger full-screen Spin 2 Choose 1
- Trigger Break Full, Giveaway Winner, and Big Hit animations

## Team Logos

This package uses ESPN-hosted NFL logo URLs so the ZIP stays small. Internet access is required for logos to load. If you want fully offline logos, place PNGs in `assets/logos/` and update the `logoUrl()` function in `app.js`.

## Hosting

This can run locally, on GitHub Pages, or any static host. Firebase is stubbed in `firebase.js` for future cloud syncing, but local browser storage and BroadcastChannel are already wired in.
