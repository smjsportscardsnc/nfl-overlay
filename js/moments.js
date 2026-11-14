// Full-screen break animations the control panel can trigger.
// Each one is drawn in code (no image files), in the Gameday style.
// To add one, copy an entry: lines are the big title words (c = colour,
// small = a small connector word like "or"), badge is the stamp in the corner.
window.SMJ_MOMENTS = {
  "free-respin": {
    label: "Free Respin",
    kicker: "BREAK BONUS",
    lines: [{t:"FREE"},{t:"RESPIN",c:"#ffcc4d"}],
    sub: "Your next spot is on the house",
    badge: "↻",
    colors: ["#1f6bff", "#00d4ff", "#ffcc4d"]
  },
  "double-respin": {
    label: "Double Respin",
    kicker: "BREAK BONUS",
    lines: [{t:"DOUBLE"},{t:"RESPIN",c:"#ff6a3d"}],
    sub: "Two more spins coming up",
    badge: "2×",
    colors: ["#ff2d55", "#ff6a3d", "#ffcc4d"]
  },
  "stash-or-pass": {
    label: "Stash or Pass",
    kicker: "YOUR CALL",
    lines: [{t:"STASH",c:"#39d353"},{t:"or",small:true},{t:"PASS",c:"#ff2d55"}],
    sub: "Keep it or send it back",
    badge: "?",
    colors: ["#39d353", "#ffcc4d", "#ff2d55"]
  },
  "spin-2-choose-1": {
    label: "Spin 2 Choose 1",
    kicker: "BREAK BONUS",
    lines: [{t:"SPIN 2"},{t:"CHOOSE 1",c:"#7cff3a"}],
    sub: "Two spins, you pick the winner",
    badge: "2→1",
    colors: ["#00b4ff", "#7cff3a", "#ffd60a"]
  },
  "see-3-take-2": {
    label: "See 3 Take 2",
    kicker: "BREAK BONUS",
    lines: [{t:"SEE 3"},{t:"TAKE 2",c:"#c77dff"}],
    sub: "Three revealed, keep your best two",
    badge: "3→2",
    colors: ["#7b2cbf", "#c77dff", "#ffcc4d"]
  },
  "last-spot": {
    label: "Last Spot",
    kicker: "ALMOST SOLD OUT",
    lines: [{t:"LAST"},{t:"SPOT!",c:"#ffcc4d"}],
    sub: "Grab it before we rip",
    badge: "1",
    colors: ["#ff2d55", "#ffcc4d", "#ffffff"]
  }
};
