// Night-stadium artwork for the side panels (top.html, side-left.html, side-right.html).
// WRITTEN BY tools/make_stadium_art.py - change the scenes there and run it again.
// Eight scenes in the look of the show thumbnails, 478 x 800, in assets/stadium/. The panels
// rotate through this list: the left shows the 1st, 3rd, 5th... and the right the 2nd, 4th...
// Delete a line to drop that picture.
window.SMJ_STADIUM_ART=[
  "assets/stadium/01-near-tower.jpg",
  "assets/stadium/02-near-tower.jpg",
  "assets/stadium/03-bowl-end.jpg",
  "assets/stadium/04-light-rows.jpg",
  "assets/stadium/05-corner.jpg",
  "assets/stadium/06-corner.jpg",
  "assets/stadium/07-twin-towers.jpg",
  "assets/stadium/08-centre-bank.jpg"
];
// Where the stands, tier fronts and light banks are in each picture (as fractions of the
// picture, before any mirroring), so js/widgets.js can twinkle the crowd and shimmer the
// floodlights in the right places. A picture with no line here simply does not sparkle.
window.SMJ_STADIUM_LAYOUT={
  "assets/stadium/01-near-tower.jpg":{"mirror":false,"xc":0.75,"horizon":0.78,"roof":[0.42,0.02,0.1],"bands":[[0.515,0.02,0.07,0.024],[0.585,0.02,0.05,0.022]],"banks":[[0.27,0.235,0.168,0.074],[0.86,0.42,0.0675,0.018]]},
  "assets/stadium/02-near-tower.jpg":{"mirror":true,"xc":0.8,"horizon":0.76,"roof":[0.4,0.025,0.09],"bands":[[0.5,0.02,0.065,0.024],[0.57,0.02,0.045,0.022]],"banks":[[0.3,0.25,0.145,0.076],[0.84,0.405,0.081,0.008]]},
  "assets/stadium/03-bowl-end.jpg":{"mirror":false,"xc":0.5,"horizon":0.74,"roof":[0.335,0.03,0.0],"bands":[[0.425,0.035,0.0,0.024],[0.49,0.035,0.0,0.022]],"banks":[[0.085,0.292,0.09,0.0315],[0.915,0.292,0.09,0.0315],[0.5,0.362,0.1395,0.01]]},
  "assets/stadium/04-light-rows.jpg":{"mirror":false,"xc":0.5,"horizon":0.71,"roof":[0.3,0.045,0.0],"bands":[[0.39,0.045,0.0,0.022],[0.455,0.045,0.0,0.022],[0.525,0.04,0.0,0.02]],"banks":[[0.5,0.335,0.221,0.01],[0.13,0.262,0.102,0.022],[0.87,0.262,0.102,0.022]]},
  "assets/stadium/05-corner.jpg":{"mirror":false,"xc":0.95,"horizon":0.75,"roof":[0.31,0.07,0.0],"bands":[[0.4,0.07,0.0,0.024],[0.47,0.065,0.0,0.022]],"banks":[[0.2,0.2,0.115,0.0465],[0.78,0.335,0.098,0.019]]},
  "assets/stadium/06-corner.jpg":{"mirror":true,"xc":1.0,"horizon":0.73,"roof":[0.3,0.075,0.0],"bands":[[0.39,0.075,0.0,0.024],[0.46,0.07,0.0,0.022]],"banks":[[0.24,0.19,0.096,0.064],[0.8,0.33,0.112,0.0095]]},
  "assets/stadium/07-twin-towers.jpg":{"mirror":false,"xc":0.5,"horizon":0.72,"roof":[0.345,0.02,0.0],"bands":[[0.435,0.022,0.0,0.024],[0.505,0.022,0.0,0.022]],"banks":[[0.22,0.255,0.1,0.054],[0.78,0.255,0.1,0.054]]},
  "assets/stadium/08-centre-bank.jpg":{"mirror":false,"xc":0.5,"horizon":0.75,"roof":[0.37,0.03,0.0],"bands":[[0.46,0.032,0.0,0.024],[0.53,0.032,0.0,0.022]],"banks":[[0.5,0.27,0.16,0.0405],[0.07,0.35,0.06,0.02],[0.93,0.35,0.06,0.02]]}
};
