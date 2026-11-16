// Full-screen break animations the control panel can trigger.
// Each one is drawn in code (no image files), in the Gameday style.
// The card shows the SMJ logo and the title only. To add one, copy an entry:
// lines are the big title words (c = colour, small = a small connector word
// like "or"), icon is the symbol on its Live Show button.
// Animations that get a button on the Live Show panel, in this order.
// Add an id from the list below to bring one back.
window.SMJ_MOMENT_BUTTONS = ["spin-2-choose-1", "stash-or-pass"];

window.SMJ_MOMENTS = {
  "free-respin": {
    label: "Free Respin",
    lines: [{t:"FREE"},{t:"RESPIN",c:"#ffcc4d"}],
    icon: "↻",
    colors: ["#1f6bff", "#00d4ff", "#ffcc4d"]
  },
  "double-respin": {
    label: "Double Respin",
    lines: [{t:"DOUBLE"},{t:"RESPIN",c:"#ff6a3d"}],
    icon: "2×",
    colors: ["#ff2d55", "#ff6a3d", "#ffcc4d"]
  },
  "stash-or-pass": {
    label: "Stash or Pass",
    lines: [{t:"STASH",c:"#39d353"},{t:"or",small:true},{t:"PASS",c:"#ff2d55"}],
    icon: "?",
    colors: ["#39d353", "#ffcc4d", "#ff2d55"]
  },
  "spin-2-choose-1": {
    label: "Spin 2 Choose 1",
    lines: [{t:"SPIN 2"},{t:"CHOOSE 1",c:"#7cff3a"}],
    icon: "2→1",
    colors: ["#00b4ff", "#7cff3a", "#ffd60a"]
  },
  "see-3-take-2": {
    label: "See 3 Take 2",
    lines: [{t:"SEE 3"},{t:"TAKE 2",c:"#c77dff"}],
    icon: "3→2",
    colors: ["#7b2cbf", "#c77dff", "#ffcc4d"]
  },
  "last-spot": {
    label: "Last Spot",
    lines: [{t:"LAST"},{t:"SPOT!",c:"#ffcc4d"}],
    icon: "1",
    colors: ["#ff2d55", "#ffcc4d", "#ffffff"]
  }
};
