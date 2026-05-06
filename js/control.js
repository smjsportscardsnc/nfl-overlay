const OVERLAY_PATH = "smjOverlay/current";
const VIDEO_COMMAND_PATH = "smjOverlay/videoCommand";
const DEFAULT_STATE = { title:"SMJ NFL MIXER BREAK", status:"Live", ticker:"Welcome to SMJ Sports Cards & Collectibles!", sold:{}, videoCommand:null };
let state = {...DEFAULT_STATE};
let ref = null;
let videoRef = null;

const teamControls = document.getElementById("teamControls");
const titleInput = document.getElementById("titleInput");
const statusInput = document.getElementById("statusInput");
const tickerInput = document.getElementById("tickerInput");
const connectionStatus = document.getElementById("connectionStatus");
const commandStatus = document.getElementById("commandStatus");

function setConn(text, cls){
  connectionStatus.textContent = text;
  connectionStatus.className = `connection ${cls}`;
}
function setCmd(text, cls="ok"){
  commandStatus.textContent = text;
  commandStatus.className = `command-status ${cls}`;
}
function logo(abbr){ return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`; }

function hydrate(){
  titleInput.value = state.title || DEFAULT_STATE.title;
  statusInput.value = state.status || DEFAULT_STATE.status;
  tickerInput.value = state.ticker || DEFAULT_STATE.ticker;
}

function renderTeams(){
  teamControls.innerHTML = "";
  window.SMJ_TEAMS.forEach(team => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `team-btn ${state.sold?.[team.abbr] ? "sold" : ""}`;
    btn.innerHTML = `<img src="${logo(team.abbr)}" alt="" /><span class="team-name"><strong>${team.name}</strong><span>${team.city}</span></span>`;
    btn.addEventListener("click", () => toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}

async function triggerVideo(key){
  if(!ref || !videoRef){
    setCmd("Firebase not connected. Command not sent.", "bad");
    return;
  }

  const label = key === "stash" ? "Stash or Pass" : "Spin 2 Choose 1";
  setCmd(`Sending ${label}...`, "warning");

  const cmd = { key, id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };

  try {
    await videoRef.set(cmd);
    await ref.child("videoCommand").set(cmd);
    setCmd(`Sent ${label} at ${new Date().toLocaleTimeString()}`, "ok");
  } catch(err) {
    console.error(err);
    setCmd("Firebase write failed. Check database rules.", "bad");
  }
}

function toggleSold(abbr){
  const sold = {...(state.sold || {})};
  sold[abbr] = !sold[abbr];
  state.sold = sold;
  renderTeams();
  if(ref) ref.child("sold").set(sold);
}

function resetSold(){
  if(!confirm("Reset all teams to available?")) return;
  state.sold = {};
  renderTeams();
  if(ref) ref.child("sold").set({});
}

function saveText(){
  const payload = {
    title: titleInput.value.trim() || DEFAULT_STATE.title,
    status: statusInput.value.trim() || DEFAULT_STATE.status,
    ticker: tickerInput.value.trim() || DEFAULT_STATE.ticker
  };
  state = {...state, ...payload};
  if(ref) ref.update(payload).then(() => setCmd("Overlay text updated.", "ok"));
}

document.getElementById("stashBtn").addEventListener("click", () => triggerVideo("stash"));
document.getElementById("chooseBtn").addEventListener("click", () => triggerVideo("choose"));
document.getElementById("saveTextBtn").addEventListener("click", saveText);
document.getElementById("resetAllBtn").addEventListener("click", resetSold);

hydrate();
renderTeams();

if(window.SMJFIREBASE_READY && window.smjDB){
  ref = window.smjDB.ref(OVERLAY_PATH);
  videoRef = window.smjDB.ref(VIDEO_COMMAND_PATH);
  setConn("Firebase connected", "ok");
  setCmd("Ready to send commands.", "ok");

  ref.once("value").then(snap => { if(!snap.exists()) return ref.set(DEFAULT_STATE); });
  ref.on("value", snap => {
    const data = snap.val();
    if(!data) return;
    state = {...DEFAULT_STATE, ...data, sold:{...(data.sold || {})}};
    hydrate();
    renderTeams();
  }, err => {
    console.error(err);
    setConn("Firebase listener error", "bad");
    setCmd("Firebase listener error.", "bad");
  });
} else {
  setConn("Firebase not connected", "bad");
  setCmd("Firebase not connected. Check js/firebase.js.", "bad");
}
