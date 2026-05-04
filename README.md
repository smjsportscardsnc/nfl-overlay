# SMJ Advanced Whatnot Break Overlay

## OBS setup
Use `index.html` as a Browser Source at **1920 x 1080**.

The scoreboard remains compact at **900 x 360** near the top of the canvas, while triggered animations fill the full screen.

## Logo
Place your logo here:

```text
assets/logo.png
```

Name it exactly:

```text
logo.png
```

Recommended: transparent PNG, square, at least 1000x1000.

## Team logos
Put team logo PNGs in:

```text
assets/teams/
```

Use these exact lowercase file names:

```text
cardinals.png
falcons.png
ravens.png
bills.png
panthers.png
bears.png
bengals.png
browns.png
cowboys.png
broncos.png
lions.png
packers.png
texans.png
colts.png
jaguars.png
chiefs.png
raiders.png
chargers.png
rams.png
dolphins.png
vikings.png
patriots.png
saints.png
giants.png
jets.png
eagles.png
steelers.png
forty-niners.png
seahawks.png
buccaneers.png
titans.png
commanders.png
```

If a logo is missing, the overlay shows a clean initials placeholder automatically.

## Control panel
Open `control.html` on the same computer or tablet browser.

It uses browser localStorage BroadcastChannel syncing. For local OBS use, this works without Firebase.

## Included features
- Compact 900x360 scoreboard
- Full-screen animated graphics
- Automatic NFL team logo loading
- Metallic/glass scoreboard styling
- Lower-third announcement banner
- Touchscreen-friendly control page
- Auction countdown timer
- Recent hits panel
- Animated ticker
- Trigger buttons for:
  - Stash or Pass
  - Spin 2 Choose 1 graphic, without spinning wheel animation
  - Big Hit
  - Giveaway
  - Break Full
  - Lower Third
  - Countdown
  - Clear animations
- Sound-effect hooks in `assets/sfx/`

## Optional sound files
Add these if desired:

```text
assets/sfx/stash-pass.mp3
assets/sfx/spin-choose.mp3
assets/sfx/big-hit.mp3
assets/sfx/giveaway.mp3
assets/sfx/break-full.mp3
```

