SMJ 9:16 Overlay - No Stingers + Large Ticker

OBS Browser Source:
- Use index-1080x1920.html
- Width: 1080
- Height: 1920

Changes:
- Removed all stinger/video trigger functionality.
- Removed stinger controls from control.html.
- Increased scoreboard height to 430px.
- Enlarged scrolling ticker text to 28px.
- Enlarged ticker bar.
- Kept scoreboard lowered for Whatnot UI.
- Kept uploaded SMJ logo and subdued watermark.
- Kept multi-league switching.
- Kept sold-team red X animation.

Files:
- index-1080x1920.html = OBS overlay
- control.html = control panel

- Reduced spacing between bottom team row and ticker.

- Removed the large gap between the bottom team row and ticker by positioning ticker at top:326px and reducing panel height.

- All teams for all leagues are now automatically sorted alphabetically by team name.

New look (scoreboard refresh):
- Oswald/Inter fonts (loaded from Google Fonts; falls back to Impact/Arial if offline).
- Team tiles show the logo plus the team abbreviation; WNBA uses wider tiles.
- Sold teams keep their logo and get a red SOLD ribbon plus the buyer's name.
- "Just sold" pop-up with team logo and buyer name for about 4 seconds on each sale.
- "LEFT" counter with a progress bar replaces the Sold x/y badge.
- Watermark toned down; light sweep now only plays when a team sells.
- Ticker scrolls at the same speed whatever the message length.
- Control panel: "Next buyer" box, active league highlighted, confirm before a
  league switch clears sold teams, confirm before un-selling a team.
- Firebase data adds two fields: buyers {abbr: name} and lastSold.
