# SMJ Full Screen Animated Break Overlay

This package is a full-screen OBS browser-source overlay for SMJ Sports Cards & Collectibles Whatnot breaks.

## Files

- `index.html` — live overlay for OBS/browser source
- `control.html` — control panel for a tablet, laptop, or second browser window
- `style.css` — full-screen layout and animation styling
- `app.js` — team state, logo mapping, sold status, ticker, and animation triggers
- `firebase.js` — placeholder file for future Firebase sync

## OBS Setup

1. Add a Browser Source in OBS.
2. Choose `index.html` as a local file.
3. Set width to `1920` and height to `1080` for full-screen use.
4. If you are streaming vertical Whatnot video, crop or transform the browser source in OBS to fit your canvas.

## Control Page

Open `control.html` in Chrome. It controls the live overlay using local browser storage and BroadcastChannel.

Controls include:

- Break title
- Ticker text
- Sold team status
- Buyer usernames
- Full-screen Stash or Pass animation
- Full-screen Spin 2 Choose 1 animation
- Break Full animation
- Giveaway Winner animation
- Big Hit animation

## Team Logos

The overlay uses ESPN-hosted NFL team logo URLs. An internet connection is required for logos to load. If you want this to be fully offline, place logo PNGs in `assets/logos/` and update the `logoUrl()` function in `app.js`.

## Notes

- All references to chasers have been removed.
- Animations are CSS/HTML-based placeholders designed to behave like full-screen broadcast graphics.
- True transparent `.webm` animated videos can be added later by placing them in `assets/` and triggering them from the control page.
