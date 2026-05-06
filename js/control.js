const PATH="smjOverlay/current",CMD="smjOverlay/stingerCommand",DEFAULT={title:"SMJ NFL BREAK",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},league:"nfl",stingerCommand:null};

let state={...DEFAULT},ref=null,cmdRef=null;

const teamControls=document.getElementById("teamControls"),
titleInput=document.getElementById("titleInput"),
tickerInput=document.getElementById("tickerInput"),
connectionStatus=document.getElementById("connectionStatus"),
commandStatus=document.getElementById("commandStatus");

function setConn(t,c){connectionStatus.textContent=t;connectionStatus.className=`connection ${c}`}
function setCmd(t,c="ok"){commandStatus.textContent=t;commandStatus.className=`command-status ${c}`}
function currentLeague(){return window.SMJ_LEAGUES[state.league||"nfl"]||window.SMJ_LEAGUES.nfl}
function teams(){return currentLeague().teams}
function logo(abbr){const lg=currentLeague();return `https://a.espncdn.com/i/teamlogos/${lg.cdn}/500/${abbr}.png`}

function hydrate(){
  titleInput.value=state.title||DEFAULT.title;
  tickerInput.value=state.ticker||DEFAULT.ticker;
}

function renderTeams(){
  teamControls.innerHTML="";
  teams().forEach(team=>{
    const btn=document.createElement("button");
    btn.type="button";
    btn.className=`team-btn ${state.sold?.[team.abbr]?"sold":""}`;
    btn.innerHTML=`<img src="${logo(team.abbr)}" alt="" /><span class="team-name"><strong>${team.name}</strong><span>${team.city}</span></span>`;
    btn.addEventListener("click",()=>toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}

async function trigger(key){
  if(!ref||!cmdRef){setCmd("Firebase not connected.","bad");return}

  const label=key==="stash"?"Stash or Pass":"Spin 2 Choose 1";
  const cmd={key,id:`${Date.now()}-${Math.random().toString(16).slice(2)}`};

  setCmd(`Sending ${label}...`,"warning");

  try{
    await cmdRef.set(cmd);
    await ref.child("stingerCommand").set(cmd);
    setCmd(`Sent ${label} at ${new Date().toLocaleTimeString()}`,"ok");
  }catch(e){
    console.error(e);
    setCmd("Firebase write failed.","bad");
  }
}

function switchLeague(league){
  state.league=league;
  state.sold={};

  const name=window.SMJ_LEAGUES[league].name,title=`SMJ ${name} BREAK`;
  titleInput.value=title;
  renderTeams();

  if(ref)ref.update({league,sold:{},title});
  setCmd(`League switched to ${name}`,"ok");
}

function toggleSold(abbr){
  const sold={...(state.sold||{})};
  sold[abbr]=!sold[abbr];
  state.sold=sold;
  renderTeams();
  if(ref)ref.child("sold").set(sold);
}

function resetSold(){
  if(!confirm("Reset all teams to available?"))return;
  state.sold={};
  renderTeams();
  if(ref)ref.child("sold").set({});
}

function saveText(){
  const payload={title:titleInput.value.trim()||DEFAULT.title,ticker:tickerInput.value.trim()||DEFAULT.ticker};
  state={...state,...payload};
  if(ref)ref.update(payload).then(()=>setCmd("Overlay text updated.","ok"));
}

document.querySelectorAll("[data-stinger]").forEach(b=>b.addEventListener("click",()=>trigger(b.dataset.stinger)));
document.querySelectorAll("[data-league]").forEach(b=>b.addEventListener("click",()=>switchLeague(b.dataset.league)));
document.getElementById("saveTextBtn").addEventListener("click",saveText);
document.getElementById("resetAllBtn").addEventListener("click",resetSold);

hydrate();
renderTeams();

if(window.SMJFIREBASE_READY&&window.smjDB){
  ref=window.smjDB.ref(PATH);
  cmdRef=window.smjDB.ref(CMD);

  setConn("Firebase connected","ok");
  setCmd("Ready.","ok");

  ref.once("value").then(s=>{if(!s.exists())return ref.set(DEFAULT)});

  ref.on("value",snap=>{
    const data=snap.val();
    if(!data)return;
    state={...DEFAULT,...data,sold:{...(data.sold||{})}};
    hydrate();
    renderTeams();
  },err=>{
    console.error(err);
    setConn("Firebase error","bad");
  });
}else{
  setConn("Firebase not connected","bad");
  setCmd("Firebase not connected.","bad");
}
