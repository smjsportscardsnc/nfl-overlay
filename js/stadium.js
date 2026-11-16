// Night-stadium artwork for the side panels (top.html, side-left.html, side-right.html).
// Painted illustrations (478 x 800) in assets/stadium/, built by tools/make_stadium_art.py.
// The panels rotate through this list: the left shows the 1st, 3rd, 5th... and the right
// the 2nd, 4th... so the first two (the floodlight towers) open the show as a pair.
// Add or remove a file name to change what shows. Sources: assets/stadium/CREDITS.txt.
window.SMJ_STADIUM_ART=[
  "01-floodlights.jpg",
  "02-light-tower.jpg",
  "03-football-night.jpg",
  "04-ballpark-lights.jpg",
  "05-stadium-skyline.jpg",
  "06-light-banks.jpg",
  "07-dome-lights.jpg",
  "08-roof-lights.jpg"
].map(f=>"assets/stadium/"+f);
