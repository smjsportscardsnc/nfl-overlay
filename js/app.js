const OVERLAY_PATH = "smjOverlay/current";
const VIDEO_COMMAND_PATH = "smjOverlay/videoCommand";

const DEFAULT_STATE = {
  title: "SMJ NFL MIXER BREAK",
  status: "Live",
  ticker: "Welcome to SMJ Sports Cards & Collectibles!",
  sold: {},
  videoCommand: null,
  motionCommand: null
};

let state = {...DEFAULT_STATE};
let lastVideoId = null;

const grid = document.getElementById("teamsGrid");
const soldCount = document.getElementById("soldCount");
const statusText = document.getElementById("statusText");
const tickerText = document.getElementById("tickerText");
const breakTitle = document.getElementById("breakTitle");
const videoLayer = document.getElementById("videoLayer");
const overlayVideo = document.getElementById("overlayVideo");
const debugBadge = document.getElementById("debugBadge");

const videos = {
  stash: "assets/videos/stash-or-pass.mp4",
  choose: "assets/videos/spin-2-choose-1.mp4",
  spin: "assets/videos/spin-2-choose-1.mp4"
};

function showDebug(msg, ms = 3500){
  if(!debugBadge) return;
  debugBadge.textContent = msg;
  debugBadge.classList.remove("hidden");
  clearTimeout(window.__smjDebugTimer);
  window.__smjDebugTimer = setTimeout(() => debugBadge.classList.add("hidden"), ms);
}

function logo(abbr){
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
}

function render(){
  breakTitle.textContent = state.title || DEFAULT_STATE.title;
  statusText.textContent = state.status || DEFAULT_STATE.status;
  tickerText.textContent = state.ticker || DEFAULT_STATE.ticker;

  const soldTotal = window.SMJ_TEAMS.filter(t => !!state.sold?.[t.abbr]).length;
  soldCount.textContent = `${soldTotal}/32`;

  grid.innerHTML = "";
  window.SMJ_TEAMS.forEach(team => {
    const box = document.createElement("div");
    box.className = `team-box ${state.sold?.[team.abbr] ? "sold" : ""}`;
    box.style.setProperty("--teamColor", team.color);
    box.style.setProperty("--teamGlow", `${team.color}80`);
    box.title = `${team.city} ${team.name}`;
    box.innerHTML = `<div class="logo-plate"><img src="${logo(team.abbr)}" alt="${team.city} ${team.name}" /></div>`;
    grid.appendChild(box);
  });
}

async function playVideo(key){
  const src = videos[key];
  if(!src){
    showDebug(`No video for key: ${key}`);
    console.error("No video mapped for key:", key);
    return;
  }

  showDebug(`Received video command: ${key}`);

  videoLayer.classList.remove("hidden");
  overlayVideo.pause();
  overlayVideo.removeAttribute("src");
  overlayVideo.currentTime = 0;
  overlayVideo.muted = false;
  overlayVideo.volume = 1;
  overlayVideo.src = src + "?cache=" + Date.now();
  overlayVideo.load();

  overlayVideo.onloadeddata = () => showDebug(`Loaded video: ${key}`, 1800);
  overlayVideo.onerror = () => {
    showDebug(`Video error: ${key}`, 5000);
    console.error("Video element error:", overlayVideo.error);
    videoLayer.classList.add("hidden");
  };

  overlayVideo.onended = () => {
    showDebug(`Video ended: ${key}`, 1500);
    videoLayer.classList.add("hidden");
    overlayVideo.pause();
    overlayVideo.removeAttribute("src");
  };

  try {
    await overlayVideo.play();
    showDebug(`Playing: ${key}`, 2200);
  } catch(err) {
    console.warn("Playback with audio failed. Retrying muted.", err);
    try {
      overlayVideo.muted = true;
      overlayVideo.currentTime = 0;
      await overlayVideo.play();
      showDebug(`Playing muted: ${key}`, 2200);
    } catch(err2) {
      showDebug(`Playback failed: ${key}`, 6000);
      console.error("Muted playback failed:", err2);
      videoLayer.classList.add("hidden");
    }
  }
}

function handleVideoCommand(cmd, source="unknown"){
  if(!cmd || !cmd.id) return;
  if(cmd.id === lastVideoId) return;
  lastVideoId = cmd.id;
  showDebug(`Command from ${source}: ${cmd.key}`);
  playVideo(cmd.key);
}

render();

if(window.SMJFIREBASE_READY && window.smjDB){
  showDebug("Firebase ready");

  const ref = window.smjDB.ref(OVERLAY_PATH);
  const videoRef = window.smjDB.ref(VIDEO_COMMAND_PATH);

  ref.on("value", snapshot => {
    const data = snapshot.val();

    if(!data){
      ref.set(DEFAULT_STATE);
      return;
    }

    state = {
      ...DEFAULT_STATE,
      ...data,
      sold: {...(data.sold || {})}
    };

    render();
    handleVideoCommand(state.videoCommand, "current/videoCommand");
    handleVideoCommand(state.motionCommand, "current/motionCommand");
  }, err => {
    showDebug("Firebase current listener error", 6000);
    console.error("Firebase listener error:", err);
  });

  videoRef.on("value", snapshot => {
    handleVideoCommand(snapshot.val(), "videoCommand");
  }, err => {
    showDebug("Firebase video listener error", 6000);
    console.error("Firebase video command listener error:", err);
  });

} else {
  showDebug("Firebase not ready", 8000);
  console.error("Firebase not ready:", window.SMJFIREBASE_ERROR);
}

window.SMJOverlay = { playVideo };
