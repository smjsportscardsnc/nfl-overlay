const OVERLAY_PATH="smjOverlay/current";
const DEFAULT_STATE={title:"SMJ NFL MIXER BREAK",status:"Live",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},motionCommand:null};
let state={...DEFAULT_STATE};
let ref=null;

const teamControls=document.getElementById("teamControls");
const titleInput=document.getElementById("titleInput");
const statusInput=document.getElementById("statusInput");
const tickerInput=document.getElementById("tickerInput");
const connectionStatus=document.getElementById("connectionStatus");

function setStatus(text, mode){
  connectionStatus.textContent=text;
  connectionStatus.className=`connection ${mode}`;
}

function logo(abbr){return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`}

function hydrateInputs(){
  titleInput.value=state.title || DEFAULT_STATE.title;
  statusInput.value=state.status || DEFAULT_STATE.status;
  tickerInput.value=state.ticker || DEFAULT_STATE.ticker;
}

function renderTeamButtons(){
  teamControls.innerHTML="";
  window.SMJ_TEAMS.forEach(team=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className=`team-btn ${state.sold?.[team.abbr]?"sold":""}`;
    btn.innerHTML=`<img src="${logo(team.abbr)}" alt="" /><span class="team-name"><strong>${team.name}</strong><span>${team.city}</span></span>`;
    btn.addEventListener("click",()=>toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}

function updateLocal(next){
  state={...DEFAULT_STATE,...state,...next,sold:{...(next.sold ?? state.sold ?? {})}};
  hydrateInputs();
  renderTeamButtons();
}

async function firebaseUpdate(payload){
  if(!ref){
    alert("Firebase is not connected. Check js/firebase.js and make sure Realtime Database is enabled.");
    return;
  }
  await ref.update(payload);
}

function triggerMotion(key){
  firebaseUpdate({
    motionCommand:{
      key,
      id: Date.now()+"-"+Math.random().toString(16).slice(2)
    }
  });
}

function toggleSold(abbr){
  const nextSold={...(state.sold||{})};
  nextSold[abbr]=!nextSold[abbr];
  updateLocal({sold:nextSold});
  firebaseUpdate({sold:nextSold});
}

function resetSold(){
  if(!confirm("Reset all teams to available?")) return;
  updateLocal({sold:{}});
  firebaseUpdate({sold:{}});
}

function saveText(){
  const payload={
    title:titleInput.value.trim()||DEFAULT_STATE.title,
    status:statusInput.value.trim()||DEFAULT_STATE.status,
    ticker:tickerInput.value.trim()||DEFAULT_STATE.ticker
  };
  updateLocal(payload);
  firebaseUpdate(payload);
}

document.querySelectorAll("[data-motion]").forEach(btn=>{
  btn.addEventListener("click",()=>triggerMotion(btn.dataset.motion));
});
document.getElementById("saveTextBtn").addEventListener("click",saveText);
document.getElementById("resetAllBtn").addEventListener("click",resetSold);

hydrateInputs();
renderTeamButtons();

if(window.SMJFIREBASE_READY && window.smjDB){
  ref=window.smjDB.ref(OVERLAY_PATH);
  setStatus("Firebase connected", "ok");

  ref.once("value").then(snapshot=>{
    if(!snapshot.exists()) return ref.set(DEFAULT_STATE);
  });

  ref.on("value", snapshot=>{
    const data=snapshot.val();
    if(!data) return;
    state={...DEFAULT_STATE,...data,sold:{...(data.sold||{})}};
    hydrateInputs();
    renderTeamButtons();
  }, err=>{
    console.error(err);
    setStatus("Firebase listener error", "bad");
  });
} else {
  setStatus("Firebase not connected: check js/firebase.js", "bad");
  console.error("Firebase not ready:", window.SMJFIREBASE_ERROR);
}