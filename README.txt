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

Animations:
- Control panel > Animations plays a full-screen fly-in (about 4.5 s) over the overlay:
  light streaks, the graphic slams in with a burst and sparks, holds, then flies out.
- Graphics and colors are listed in js/moments.js. To add one, put a transparent PNG
  in assets/graphics and add an entry there.
- Animation sound is off by default (Setup > Animation Sound turns the swoosh back on).
  If you turn it on, in OBS tick "Control audio via OBS"
  on the Browser Source so viewers hear it.

Gameday look (trading-card board + team takeover):
- Big Shoulders Display / Inter fonts (Google Fonts; falls back to Oswald/Impact).
- Board sits at x=36 y=170, full width (1008px), so it clears Whatnot's top bar.
- Each team is a trading-card tile: light card face, team-colour frame and
  nameplate, slow foil shine. Light team colours get dark nameplate text.
- Sold tiles go dark with a SOLD stamp and the buyer's name on a gold nameplate
  (or the abbreviation in grey if no buyer was typed).
- Every sale plays a team takeover over the board (~4.2s): team colour wash,
  logo pattern, rays, logo slam, confetti, team name and @buyer. Sales queue.
- Header: SMJ logo, break title, new "Break details" line, big spots-left
  counter and a segmented progress bar (one segment per team).
- Ticker is now a separate lower-third bar at y=1215, just above Whatnot chat.
- Control panel: new "Break details" field. Fixed the Animations buttons being
  added again every time Firebase updated.
- Test from the browser console: testTakeover("buf","@cardking88").
- New break animations, drawn in code in the Gameday style (no image files):
  Free Respin, Double Respin, Stash or Pass, Spin 2 Choose 1, See 3 Take 2,
  Last Spot. Colour bands slash in, a chrome-edged card flips in with a flash
  and confetti, the words drop in, two foil shines, then it flips out (~4.6s).
  Add or edit them in js/moments.js. Test: playMoment("free-respin").
  (assets/graphics PNGs are no longer used.)

Separate OBS sources (like Breakers Overlays):
Add only the ones you want as Browser Sources. All update live from control.html.
- board.html          1080 x 700   spot board + team takeover on each sale
- strip.html          1080 x 260   two-row landscape board + takeover
- animations.html     1080 x 1920  full-screen break animations
- ticker.html         1080 x 72    scrolling LIVE ticker
- price-tag.html       520 x 180   break type + price (show/hide from panel)
- stats.html           520 x 120   average spot, total, spots sold
- socials.html         420 x 80    rotates through your handles
- facecam.html         640 x 360   animated border, LIVE tag, brand chip
- index-1080x1920.html 1080 x 1920 all-in-one (board, ticker, takeover, animations)
The control panel lists every link with its size and a Copy button.
New Firebase fields: brand, prices {abbr: number}, currency, priceTag {label, amount, show}, socials {platform: handle}.
- Board size: Large / Medium / Small buttons in the control panel (Firebase field
  boardSize: "l" | "m" | "s", default "m"). Scales the board from its top centre on
  the all-in-one page and board.html; the strip keeps its own size.
- Board layout (replaces board size): 4 rows (original), 3 rows (default) or
  2 rows, from the control panel (Firebase field boardRows). 3 and 2 rows use a
  compact header; on the all-in-one page they sit just above the ticker so the
  facecam fits above. Heights: 4 rows 670px, 3 rows 373px, 2 rows 232px.

Whatnot auto-mark:
- New "Whatnot Auto-Mark" box in the control panel. When it's on, every auction
  sale marks its team sold with the buyer's username and price, and plays the takeover.
- The team comes from the end of the listing title ("... - Dallas Cowboys").
- Runs as a small free Cloudflare helper in the worker/ folder. Setup steps are
  in worker/README.md.

Control panel split into two pages:
- control.html = Live Show: teams, Whatnot auto-mark, animations (Spin 2 Choose 1,
  Stash or Pass; the list is SMJ_MOMENT_BUTTONS in js/moments.js) and
  break title/details/ticker. Everything you touch during a break.
- setup.html = Setup: OBS browser source links, board layout, brand name,
  currency and socials. Set once. Each page links to the other in the top bar.
