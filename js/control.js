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
let ref = null;
let videoRef = null;

const teamControls = document.getElementById("teamControls");
const titleInput = document.getElementById("titleInput");
const statusInput = document.getElementById("statusInput");
const tickerInput = document.getElementById("tickerInput");
const connectionStatus = document.getElementById("connectionStatus");
const commandStatus = document.getElementById("commandStatus");

function setStatus(text, mode){
  connectionStatus.textContent = text;
  connectionStatus.className = `connection ${mode}`;
}

function setCommandStatus(text, mode = "info"){
  if(!commandStatus) return;
  commandStatus.textContent = text;
  commandStatus.dataset.mode = mode;
}

function logo(abbr){
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
}

function hydrateInputs(){
  titleInput.value = state.title || DEFAULT_STATE.title;
  statusInput.value = state.status || DEFAULT_STATE.status;
  tickerInput.value = state.ticker || DEFAULT_STATE.ticker;
}

function renderTeamButtons(){
  teamControls.innerHTML = "";

  window.SMJ_TEAMS.forEach(team => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `team-btn ${state.sold?.[team.abbr] ? "sold" : ""}`;
    btn.innerHTML = `
      <img src="${logo(team.abbr)}" alt="" />
      <span class="team-name">
        <strong>${team.name}</strong>
        <span>${team.city}</span>
      </span>
    `;
    btn.addEventListener("click", () => toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}

function updateLocal(next){
  state = {
    ...DEFAULT_STATE,
    ...state,
    ...next,
    sold: {...(next.sold ?? state.sold ?? {})}
  };
  hydrateInputs();
  renderTeamButtons();
}

async function firebaseUpdate(payload){
  if(!ref){
    setCommandStatus("Firebase is not connected. Command not sent.", "bad");
    alert("Firebase is not connected. Check the connection status indicator.");
    return false;
  }
  await ref.update(payload);
  return true;
}

async function triggerVideo(key){
  const label = key === "stash" ? "Stash or Pass" : "Spin 2 Choose 1";
  setCommandStatus(`Clicked: ${label}. Sending...`, "info");

  if(!ref || !videoRef){
    setCommandStatus("Firebase not connected. Video command not sent.", "bad");
    alert("Firebase is not connected. Check the connection status indicator.");
    return;
  }

  const cmd = {
    key,
    id: Date.now() + "-" + Math.random().toString(16).slice(2),
    sentAt: new Date().toISOString()
  };

  try {
    await Promise.all([
      videoRef.set(cmd),
      ref.child("videoCommand").set(cmd),
      ref.child("motionCommand").set(cmd)
    ]);

    setCommandStatus(`Sent: ${label} at ${new Date().toLocaleTimeString()}`, "ok");
  } catch(err){
    console.error("Video command failed:", err);
    setCommandStatus(`Failed to send ${label}. Check Firebase rules.`, "bad");
    alert("Video command failed. Check Firebase Realtime Database rules/permissions.");
  }
}

function toggleSold(abbr){
  const nextSold = {...(state.sold || {})};
  nextSold[abbr] = !nextSold[abbr];
  updateLocal({sold: nextSold});
  firebaseUpdate({sold: nextSold});
}

function resetSold(){
  if(!confirm("Reset all teams to available?")) return;
  updateLocal({sold: {}});
  firebaseUpdate({sold: {}});
}

function saveText(){
  const payload = {
    title: titleInput.value.trim() || DEFAULT_STATE.title,
    status: statusInput.value.trim() || DEFAULT_STATE.status,
    ticker: tickerInput.value.trim() || DEFAULT_STATE.ticker
  };
  updateLocal(payload);
  firebaseUpdate(payload).then(ok => {
    if(ok) setCommandStatus(`Overlay text updated at ${new Date().toLocaleTimeString()}`, "ok");
  });
}

document.getElementById("stashBtn").addEventListener("click", () => triggerVideo("stash"));
document.getElementById("chooseBtn").addEventListener("click", () => triggerVideo("choose"));
document.getElementById("saveTextBtn").addEventListener("click", saveText);
document.getElementById("resetAllBtn").addEventListener("click", resetSold);

hydrateInputs();
renderTeamButtons();

if(window.SMJFIREBASE_READY && window.smjDB){
  ref = window.smjDB.ref(OVERLAY_PATH);
  videoRef = window.smjDB.ref(VIDEO_COMMAND_PATH);
  setStatus("Firebase connected", "ok");
  setCommandStatus("Ready to send video commands.", "ok");

  ref.once("value").then(snapshot => {
    if(!snapshot.exists()){
      return ref.set(DEFAULT_STATE);
    }
  }).catch(err => {
    console.error("Firebase initial read/write failed:", err);
    setStatus("Firebase permission error", "bad");
    setCommandStatus("Firebase permission error. Check Realtime Database rules.", "bad");
  });

  ref.on("value", snapshot => {
    const data = snapshot.val();
    if(!data) return;

    state = {
      ...DEFAULT_STATE,
      ...data,
      sold: {...(data.sold || {})}
    };

    hydrateInputs();
    renderTeamButtons();
  }, err => {
    console.error(err);
    setStatus("Firebase listener error", "bad");
    setCommandStatus("Firebase listener error. Check rules.", "bad");
  });
} else {
  setStatus("Firebase not connected", "bad");
  setCommandStatus("Firebase not connected. Check js/firebase.js.", "bad");
  console.error("Firebase not ready:", window.SMJFIREBASE_ERROR);
}
