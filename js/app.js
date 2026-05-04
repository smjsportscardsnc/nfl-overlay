
const ref = window.smjDB.ref("smjOverlay/current");

const breakTitle = document.getElementById("breakTitle");
const statusText = document.getElementById("statusText");
const tickerText = document.getElementById("tickerText");

let lastMotionId = null;

ref.on("value", snapshot => {
  const data = snapshot.val();
  if (!data) return;

  if (data.title) breakTitle.textContent = data.title;
  if (data.status) statusText.textContent = data.status;
  if (data.ticker) tickerText.textContent = data.ticker;

  const cmd = data.motionCommand;

  if(cmd && cmd.id && cmd.id !== lastMotionId){
    lastMotionId = cmd.id;
    window.SMJSwoop.trigger(cmd.key || "hit");
  }
});
