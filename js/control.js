const OVERLAY_PATH="smjOverlay/current";
const DEFAULT_STATE={title:"SMJ NFL MIXER BREAK",status:"Live",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},videoCommand:null};
let state={...DEFAULT_STATE};
const ref=window.smjDB.ref(OVERLAY_PATH);

const teamControls=document.getElementById("teamControls");
const titleInput=document.getElementById("titleInput");
const statusInput=document.getElementById("statusInput");
const tickerInput=document.getElementById("tickerInput");

function logo(abbr){return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`}

ref.on("value", snapshot=>{
  const data=snapshot.val();
  if(!data){
    ref.set(DEFAULT_STATE);
    return;
  }
  state={...DEFAULT_STATE,...data,sold:{...(data.sold||{})}};
  titleInput.value=state.title;
  statusInput.value=state.status;
  tickerInput.value=state.ticker;
  renderTeamButtons();
});

document.querySelectorAll("[data-video]").forEach(btn=>{
  btn.addEventListener("click",()=>triggerVideo(btn.dataset.video));
});

document.getElementById("saveTextBtn").addEventListener("click",()=>{
  ref.update({
    title:titleInput.value.trim()||DEFAULT_STATE.title,
    status:statusInput.value.trim()||DEFAULT_STATE.status,
    ticker:tickerInput.value.trim()||DEFAULT_STATE.ticker
  });
});

document.getElementById("resetAllBtn").addEventListener("click",()=>{
  if(!confirm("Reset all teams to available?")) return;
  ref.child("sold").set({});
});

function triggerVideo(key){
  ref.child("videoCommand").set({
    key,
    id: Date.now() + "-" + Math.random().toString(16).slice(2)
  });
}

function toggleSold(abbr){
  ref.child("sold/"+abbr).set(!state.sold?.[abbr]);
}

function renderTeamButtons(){
  teamControls.innerHTML="";
  window.SMJ_TEAMS.forEach(team=>{
    const btn=document.createElement("button");
    btn.className=`team-btn ${state.sold?.[team.abbr]?"sold":""}`;
    btn.innerHTML=`<img src="${logo(team.abbr)}" alt="" /><span class="team-name"><strong>${team.name}</strong><span>${team.city}</span></span>`;
    btn.addEventListener("click",()=>toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}