// Night-stadium artwork for the side panels (top.html, side-left.html, side-right.html).
// Eight scenes in the look of the show thumbnails (warm floodlights, purple haze, glittering
// crowd), 478 x 800, in assets/stadium/. They are drawn by tools/make_stadium_art.py, not
// photographed. The panels rotate through this list: the left shows the 1st, 3rd, 5th...
// and the right the 2nd, 4th... so the first two open the show as a matching pair.
// Add or remove a file name to change what shows.
window.SMJ_STADIUM_ART=[
  "01-near-tower.jpg",
  "02-near-tower.jpg",
  "03-bowl-end.jpg",
  "04-light-rows.jpg",
  "05-corner.jpg",
  "06-corner.jpg",
  "07-twin-towers.jpg",
  "08-centre-bank.jpg"
].map(f=>"assets/stadium/"+f);
