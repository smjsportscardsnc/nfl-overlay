// Night-stadium photos for the side panels (top.html, side-left.html, side-right.html).
// Real photos, cropped to the panel shape (478 x 800), in assets/stadium/. The panels
// rotate through this list: the left shows the 1st, 3rd, 5th... and the right the
// 2nd, 4th... so the first two (the floodlight towers) open the show as a pair.
// Add or remove a file name to change what shows. Sources: assets/stadium/CREDITS.txt.
window.SMJ_STADIUM_PHOTOS=[
  "01-floodlights-snow.jpg",
  "02-floodlight-tower.jpg",
  "03-packed-bowl.jpg",
  "04-ballpark-lights.jpg",
  "05-stadium-skyline.jpg",
  "06-light-banks.jpg",
  "07-misty-stadium.jpg",
  "08-roof-lights.jpg"
].map(f=>"assets/stadium/"+f);
