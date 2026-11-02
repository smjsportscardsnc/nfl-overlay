const PATH="smjOverlay/current";
const DEFAULT={title:"SMJ NFL BREAK",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},buyers:{},league:"nfl",lastSold:""};

let state={...DEFAULT},ref=null;

const teamControls=document.getElementById("teamControls"),
titleInput=document.getElementById("titleInput"),
tickerInput=document.getElementById("tickerInput"),
buyerInput=document.getElementById("buyerInput"),
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
    const buyer=state.buyers?.[team.abbr]||"";
    btn.innerHTML=`<img src="${logo(team.abbr)}" alt="" /><span class="team-name"><strong>${team.name}</strong><span></span></span>`;
    btn.querySelector(".team-name span").textContent=state.sold?.[team.abbr]?(buyer?`Sold to ${buyer}`:"Sold"):team.city;
    btn.addEventListener("click",()=>toggleSold(team.abbr));
    teamControls.appendChild(btn);
  });
}

function markActiveLeague(){
  document.querySelectorAll("[data-league]").forEach(b=>b.classList.toggle("active",b.dataset.league===(state.league||"nfl")));
}

function switchLeague(league){
  if(league===state.league)return;
  const soldN=Object.values(state.sold||{}).filter(Boolean).length;
  if(soldN&&!confirm(`Switching leagues clears the ${soldN} sold team${soldN===1?"":"s"}. Switch anyway?`))return;
  state.league=league;
  state.buyers={};
  state.sold={};
  const name=window.SMJ_LEAGUES[league].name,title=`SMJ ${name} BREAK`;
  titleInput.value=title;
  renderTeams();
  markActiveLeague();
  if(ref)ref.update({league,sold:{},buyers:{},lastSold:"",title});
  setCmd(`League switched to ${name}`,"ok");
}

function toggleSold(abbr){
  const nowSold=!state.sold?.[abbr];
  const team=teams().find(t=>t.abbr===abbr);
  if(!nowSold&&!confirm(`Mark ${team?team.name:abbr.toUpperCase()} as available again?`))return;
  const buyer=nowSold?buyerInput.value.trim():"";
  state.sold={...(state.sold||{}),[abbr]:nowSold};
  state.buyers={...(state.buyers||{}),[abbr]:buyer};
  if(nowSold){state.lastSold=abbr;buyerInput.value=""}
  else if(state.lastSold===abbr)state.lastSold="";
  renderTeams();
  // one write, so the overlay gets the team and buyer name together
  if(ref)ref.update({[`sold/${abbr}`]:nowSold,[`buyers/${abbr}`]:buyer,lastSold:state.lastSold});
  setCmd(nowSold?`${team?team.name:abbr} sold${buyer?` to ${buyer}`:""}.`:`${team?team.name:abbr} is available again.`,"ok");
}

function resetSold(){
  if(!confirm("Reset all teams to available?"))return;
  state.sold={};
  state.buyers={};
  state.lastSold="";
  renderTeams();
  if(ref)ref.update({sold:{},buyers:{},lastSold:""});
}

function saveText(){
  const payload={title:titleInput.value.trim()||DEFAULT.title,ticker:tickerInput.value.trim()||DEFAULT.ticker};
  state={...state,...payload};
  if(ref)ref.update(payload).then(()=>setCmd("Overlay text updated.","ok"));
}

const ANIM_STYLES=[["flip","Flip"],["reveal","Reveal"],["slide","Slide"]];
let animStyle="flip";
try{animStyle=localStorage.getItem("smjAnimStyle")||"flip"}catch(e){}
if(!ANIM_STYLES.some(([k])=>k===animStyle))animStyle="flip";
let momentCooldown=false;

function triggerMoment(id){
  if(momentCooldown)return;
  const m=window.SMJ_MOMENTS[id];
  const at=(window.firebase&&firebase.database&&firebase.database.ServerValue)?firebase.database.ServerValue.TIMESTAMP:Date.now();
  if(ref)ref.child("moment").set({id,at,style:animStyle}).then(()=>setCmd(`Playing ${m.label}`,"ok"));
  // stop double taps from queuing the same animation twice
  momentCooldown=true;
  document.querySelectorAll(".moment-btn").forEach(b=>b.disabled=true);
  setTimeout(()=>{momentCooldown=false;document.querySelectorAll(".moment-btn").forEach(b=>b.disabled=false)},4000);
}

function renderStyleButtons(){
  const wrap=document.getElementById("styleButtons");
  wrap.innerHTML="";
  ANIM_STYLES.forEach(([key,label])=>{
    const b=document.createElement("button");
    b.type="button";
    b.textContent=label;
    b.classList.toggle("active",key===animStyle);
    b.addEventListener("click",()=>{
      animStyle=key;
      try{localStorage.setItem("smjAnimStyle",key)}catch(e){}
      renderStyleButtons();
    });
    wrap.appendChild(b);
  });
}

function renderMomentButtons(){
  const wrap=document.getElementById("momentButtons");
  wrap.innerHTML="";
  Object.entries(window.SMJ_MOMENTS||{}).forEach(([id,m])=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="moment-btn";
    b.innerHTML=`<img src="${m.image}" alt=""/><span></span>`;
    b.querySelector("span").textContent=m.label;
    b.addEventListener("click",()=>triggerMoment(id));
    wrap.appendChild(b);
  });
}
renderStyleButtons();
renderMomentButtons();

document.querySelectorAll("[data-league]").forEach(b=>b.addEventListener("click",()=>switchLeague(b.dataset.league)));
document.getElementById("saveTextBtn").addEventListener("click",saveText);
document.getElementById("resetAllBtn").addEventListener("click",resetSold);

hydrate();
renderTeams();
markActiveLeague();

if(window.SMJFIREBASE_READY&&window.smjDB){
  ref=window.smjDB.ref(PATH);
  setConn("Firebase connected","ok");
  setCmd("Ready.","ok");

  ref.once("value").then(s=>{if(!s.exists())return ref.set(DEFAULT)});

  ref.on("value",snap=>{
    const data=snap.val();
    if(!data)return;
    state={...DEFAULT,...data,sold:{...(data.sold||{})},buyers:{...(data.buyers||{})}};
    hydrate();
    renderTeams();
    markActiveLeague();
  },err=>{
    console.error(err);
    setConn("Firebase error","bad");
  });
}else{
  setConn("Firebase not connected","bad");
  setCmd("Firebase not connected.","bad");
}
