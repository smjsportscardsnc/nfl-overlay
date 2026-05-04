
const ref = window.smjDB.ref("smjOverlay/current");

function triggerMotion(key){
  ref.update({
    motionCommand:{
      key:key,
      id: Date.now() + "-" + Math.random().toString(16).slice(2)
    }
  });
}

function saveOverlay(){
  ref.update({
    title: document.getElementById("titleInput").value,
    status: document.getElementById("statusInput").value,
    ticker: document.getElementById("tickerInput").value
  });
}
