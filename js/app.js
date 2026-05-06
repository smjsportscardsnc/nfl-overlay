const OVERLAY_PATH = "smjOverlay/current";
const DEFAULT_STATE = {
  title: "SMJ NFL MIXER BREAK",
  status: "Live",
  ticker: "Welcome to SMJ Sports Cards & Collectibles!",
  sold: {},
  videoCommand: null
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

const videos = {
  stash: "assets/videos/stash-or-pass.mp4",
  choose: "assets/videos/spin-2-choose-1.mp4"
};

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

function playVideo(key){
  const src = videos[key];
  if(!src) return;

  videoLayer.classList.remove("hidden");
  overlayVideo.pause();
  overlayVideo.currentTime = 0;
  overlayVideo.src = src + "?v=" + Date.now();

  const p = overlayVideo.play();
  if(p && p.catch){
    p.catch(err => {
      console.error("Video playback blocked or failed:", err);
      videoLayer.classList.add("hidden");
    });
  }

  overlayVideo.onended = () => {
    videoLayer.classList.add("hidden");
    overlayVideo.removeAttribute("src");
  };
}

function handleVideoCommand(cmd){
  if(!cmd || !cmd.id || cmd.id === lastVideoId) return;
  lastVideoId = cmd.id;
  playVideo(cmd.key);
}

render();

if(window.SMJFIREBASE_READY && window.smjDB){
  const ref = window.smjDB.ref(OVERLAY_PATH);

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
    handleVideoCommand(state.videoCommand);
  }, err => {
    console.error("Firebase listener error:", err);
  });
} else {
  console.error("Firebase not ready:", window.SMJFIREBASE_ERROR);
}

window.SMJOverlay = { playVideo };
