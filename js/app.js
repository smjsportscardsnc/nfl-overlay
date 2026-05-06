const OVERLAY_PATH = "smjOverlay/current";
const VIDEO_COMMAND_PATH = "smjOverlay/videoCommand";
const DEFAULT_STATE = { title:"SMJ NFL MIXER BREAK", status:"Live", ticker:"Welcome to SMJ Sports Cards & Collectibles!", sold:{}, videoCommand:null };
let state = {...DEFAULT_STATE};
let lastVideoId = null;

const grid = document.getElementById("teamsGrid");
const soldCount = document.getElementById("soldCount");
const statusText = document.getElementById("statusText");
const tickerText = document.getElementById("tickerText");
const breakTitle = document.getElementById("breakTitle");
const videoLayer = document.getElementById("videoLayer");
const videoStash = document.getElementById("videoStash");
const videoChoose = document.getElementById("videoChoose");
const debugBadge = document.getElementById("debugBadge");

const videoEls = { stash: videoStash, choose: videoChoose, spin: videoChoose };

function showDebug(msg, ms=3000){
  debugBadge.textContent = msg;
  debugBadge.classList.remove("hidden");
  clearTimeout(window.__debugTimer);
  window.__debugTimer = setTimeout(() => debugBadge.classList.add("hidden"), ms);
}

function logo(abbr){ return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`; }

function render(){
  breakTitle.textContent = state.title || DEFAULT_STATE.title;
  statusText.textContent = state.status || DEFAULT_STATE.status;
  tickerText.textContent = state.ticker || DEFAULT_STATE.ticker;
  soldCount.textContent = `${window.SMJ_TEAMS.filter(t => !!state.sold?.[t.abbr]).length}/32`;

  grid.innerHTML = "";
  window.SMJ_TEAMS.forEach(team => {
    const box = document.createElement("div");
    box.className = `team-box ${state.sold?.[team.abbr] ? "sold" : ""}`;
    box.style.setProperty("--teamColor", team.color);
    box.style.setProperty("--teamGlow", `${team.color}80`);
    box.innerHTML = `<div class="logo-plate"><img src="${logo(team.abbr)}" alt="${team.city} ${team.name}" /></div>`;
    grid.appendChild(box);
  });
}

async function playVideo(key){
  const v = videoEls[key];
  if(!v){ showDebug(`No video mapped for ${key}`, 6000); return; }

  showDebug(`Playing ${key}`);
  Object.values(videoEls).forEach(el => {
    el.pause();
    el.currentTime = 0;
    el.classList.remove("active");
  });

  videoLayer.classList.remove("hidden");
  v.classList.add("active");
  v.muted = true; // reliable autoplay in OBS browser source
  v.currentTime = 0;

  v.onended = () => {
    v.classList.remove("active");
    videoLayer.classList.add("hidden");
    showDebug(`${key} ended`, 1500);
  };

  v.onerror = () => {
    showDebug(`${key} video error`, 6000);
    v.classList.remove("active");
    videoLayer.classList.add("hidden");
  };

  try {
    await v.play();
    showDebug(`${key} playing`, 2000);
  } catch(err) {
    console.error(err);
    showDebug(`${key} playback blocked`, 6000);
    v.classList.remove("active");
    videoLayer.classList.add("hidden");
  }
}

function handleVideoCommand(cmd, source){
  if(!cmd || !cmd.id || cmd.id === lastVideoId) return;
  lastVideoId = cmd.id;
  showDebug(`Command received: ${cmd.key}`);
  playVideo(cmd.key);
}

render();

if(window.SMJFIREBASE_READY && window.smjDB){
  showDebug("Firebase ready");
  const ref = window.smjDB.ref(OVERLAY_PATH);
  const videoRef = window.smjDB.ref(VIDEO_COMMAND_PATH);

  ref.on("value", snap => {
    const data = snap.val();
    if(!data){ ref.set(DEFAULT_STATE); return; }

    state = {...DEFAULT_STATE, ...data, sold:{...(data.sold || {})}};
    render();
    handleVideoCommand(state.videoCommand, "current");
  }, err => {
    console.error(err);
    showDebug("Firebase listener error", 8000);
  });

  videoRef.on("value", snap => {
    handleVideoCommand(snap.val(), "videoCommand");
  });
} else {
  showDebug("Firebase not ready", 8000);
  console.error(window.SMJFIREBASE_ERROR);
}

window.SMJOverlay = { playVideo };
