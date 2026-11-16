// Shared by control.html (Live Show) and setup.html (Setup).
// Every section is optional: code only runs for the parts on the current page.
const PATH="smjOverlay/current";
const DEFAULT={brand:"SMJ Sports Cards",title:"SMJ NFL BREAK",subtitle:"singles • rips • breaks",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},buyers:{},prices:{},league:"nfl",lastSold:"",boardRows:3,currency:"$",priceTag:{label:"Free Respin",amount:"",show:false},socials:{}};

let state={...DEFAULT},ref=null;

const teamControls=document.getElementById("teamControls"),
titleInput=document.getElementById("titleInput"),
tickerInput=document.getElementById("tickerInput"),
subtitleInput=document.getElementById("subtitleInput"),
buyerInput=document.getElementById("buyerInput"),
priceInput=document.getElementById("priceInput"),
currencySelect=document.getElementById("currencySelect"),
brandInput=document.getElementById("brandInput"),
connectionStatus=document.getElementById("connectionStatus"),
commandStatus=document.getElementById("commandStatus");

function setConn(t,c){if(connectionStatus){connectionStatus.textContent=t;connectionStatus.className=`connection ${c}`}}
function setCmd(t,c="ok"){if(commandStatus){commandStatus.textContent=t;commandStatus.className=`command-status ${c}`}}
function setVal(el,v){if(el&&document.activeElement!==el)el.value=v}
function on(id,ev,fn){const el=document.getElementById(id);if(el)el.addEventListener(ev,fn)}
function currentLeague(){return window.SMJ_LEAGUES[state.league||"nfl"]||window.SMJ_LEAGUES.nfl}
function teams(){return currentLeague().teams}
function logo(abbr){const lg=currentLeague();return `https://a.espncdn.com/i/teamlogos/${lg.cdn}/500/${abbr}.png`}

function hydrate(){
  document.querySelectorAll("[data-rows]").forEach(b=>b.classList.toggle("active",+b.dataset.rows===(+state.boardRows||3)));
  const sound=state.animSound&&state.animSound!=="off"?"on":"off"; // "swoosh" is the old saved value for on
  document.querySelectorAll("[data-sound]").forEach(b=>b.classList.toggle("active",b.dataset.sound===sound));
  document.querySelectorAll("[data-facecam]").forEach(b=>b.classList.toggle("active",b.dataset.facecam===(state.facecam==="camera"?"camera":"logo")));
  document.querySelectorAll("[data-topstats]").forEach(b=>b.classList.toggle("active",b.dataset.topstats===(state.topStats?"on":"off")));
  setVal(titleInput,state.title||DEFAULT.title);
  setVal(tickerInput,state.ticker||DEFAULT.ticker);
  setVal(brandInput,state.brand||DEFAULT.brand);
  setVal(currencySelect,state.currency||"$");
  hydrateSocials();
  setVal(subtitleInput,state.subtitle==null?DEFAULT.subtitle:state.subtitle);
  renderProgress();
}

function renderProgress(){
  const el=document.getElementById("spotsLeft");
  if(!el)return;
  const total=teams().length,sold=teams().filter(t=>state.sold?.[t.abbr]).length;
  el.textContent=`${total-sold} of ${total} spots left`;
}

function renderTeams(){
  renderProgress();
  if(!teamControls)return;
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
  if(titleInput)titleInput.value=title;
  state.title=title;
  renderTeams();
  markActiveLeague();
  state.prices={};
  if(ref)ref.update({league,sold:{},buyers:{},prices:{},lastSold:"",title});
  setCmd(`League switched to ${name}`,"ok");
}

function toggleSold(abbr){
  const nowSold=!state.sold?.[abbr];
  const team=teams().find(t=>t.abbr===abbr);
  if(!nowSold&&!confirm(`Mark ${team?team.name:abbr.toUpperCase()} as available again?`))return;
  const buyer=nowSold&&buyerInput?buyerInput.value.trim():"";
  const price=nowSold&&priceInput?(parseFloat(priceInput.value.replace(/[^\d.]/g,""))||0):0;
  state.prices={...(state.prices||{}),[abbr]:price};
  state.sold={...(state.sold||{}),[abbr]:nowSold};
  state.buyers={...(state.buyers||{}),[abbr]:buyer};
  if(nowSold){state.lastSold=abbr;if(buyerInput)buyerInput.value="";if(priceInput)priceInput.value=""}
  else if(state.lastSold===abbr)state.lastSold="";
  renderTeams();
  // one write, so the overlay gets the team and buyer name together
  if(ref)ref.update({[`sold/${abbr}`]:nowSold,[`buyers/${abbr}`]:buyer,[`prices/${abbr}`]:price,lastSold:state.lastSold});
  setCmd(nowSold?`${team?team.name:abbr} sold${buyer?` to ${buyer}`:""}.`:`${team?team.name:abbr} is available again.`,"ok");
}

function resetSold(){
  if(!confirm("Reset all teams to available?"))return;
  state.sold={};
  state.buyers={};
  state.lastSold="";
  renderTeams();
  state.prices={};
  if(ref)ref.update({sold:{},buyers:{},prices:{},lastSold:""});
}

function saveText(){
  // only the boxes on this page
  const payload={};
  if(brandInput)payload.brand=brandInput.value.trim()||DEFAULT.brand;
  if(titleInput)payload.title=titleInput.value.trim()||DEFAULT.title;
  if(subtitleInput)payload.subtitle=subtitleInput.value.trim();
  if(tickerInput)payload.ticker=tickerInput.value.trim()||DEFAULT.ticker;
  state={...state,...payload};
  if(ref)ref.update(payload).then(()=>setCmd("Overlay text updated.","ok"));
}

let momentCooldown=false;
function triggerMoment(id){
  if(momentCooldown)return;
  const m=window.SMJ_MOMENTS[id];
  const at=(window.firebase&&firebase.database&&firebase.database.ServerValue)?firebase.database.ServerValue.TIMESTAMP:Date.now();
  if(ref)ref.child("moment").set({id,at}).then(()=>setCmd(`Playing ${m.label}`,"ok"));
  // stop double taps from queuing the same animation twice
  momentCooldown=true;
  document.querySelectorAll(".moment-btn").forEach(b=>b.disabled=true);
  setTimeout(()=>{momentCooldown=false;document.querySelectorAll(".moment-btn").forEach(b=>b.disabled=false)},4600);
}

function renderMomentButtons(){
  const wrap=document.getElementById("momentButtons");
  if(!wrap)return;
  // Only the animations listed in SMJ_MOMENT_BUTTONS (js/moments.js) get a button.
  const all=window.SMJ_MOMENTS||{},ids=window.SMJ_MOMENT_BUTTONS||Object.keys(all);
  ids.filter(id=>all[id]).map(id=>[id,all[id]]).forEach(([id,m])=>{
    const b=document.createElement("button");
    b.type="button";
    b.className="moment-btn";
    b.innerHTML=`<i class="moment-badge"></i><span></span>`;
    b.style.setProperty("--c1",m.colors[0]);b.style.setProperty("--c2",m.colors[1]);b.style.setProperty("--c3",m.colors[2]);
    b.querySelector("i").textContent=m.icon||"";
    b.querySelector("span").textContent=m.label;
    b.addEventListener("click",()=>triggerMoment(id));
    wrap.appendChild(b);
  });
}
renderMomentButtons();

document.querySelectorAll("[data-league]").forEach(b=>b.addEventListener("click",()=>switchLeague(b.dataset.league)));
on("saveTextBtn","click",saveText);
on("saveBrandBtn","click",saveText);
document.querySelectorAll("[data-rows]").forEach(b=>b.addEventListener("click",()=>{
  state.boardRows=+b.dataset.rows;hydrate();
  if(ref)ref.update({boardRows:state.boardRows}).then(()=>setCmd(`Board layout: ${b.textContent}`,"ok"));
}));

document.querySelectorAll("[data-sound]").forEach(b=>b.addEventListener("click",()=>{
  state.animSound=b.dataset.sound;hydrate();
  if(ref)ref.update({animSound:state.animSound}).then(()=>setCmd(`Animation sound: ${b.textContent}`,"ok"));
}));

// Plays the animation sounds on this page, spaced like they are in the animation.
on("hearSoundBtn","click",()=>{
  const play=name=>new Audio(`assets/sounds/${name}.wav`).play().catch(()=>{});
  play("stomp");
  setTimeout(()=>play("swoosh"),1800);
});

document.querySelectorAll("[data-facecam]").forEach(b=>b.addEventListener("click",()=>{
  state.facecam=b.dataset.facecam;hydrate();
  if(ref)ref.update({facecam:state.facecam}).then(()=>setCmd(`Camera: ${b.textContent}`,"ok"));
}));
document.querySelectorAll("[data-topstats]").forEach(b=>b.addEventListener("click",()=>{
  state.topStats=b.dataset.topstats==="on";hydrate();
  if(ref)ref.update({topStats:state.topStats}).then(()=>setCmd(`Spots sold: ${b.textContent}`,"ok"));
}));

// ---------- OBS sources ----------
const SOURCES=[
  ["Top overlay","top.html",1080,360,"The facecam row: painted night-stadium artwork on both sides, your facecam or logo reel in the middle, and spots sold on the right when it's on. Switches are on the Live Show panel"],
  ["Spot board · 4 rows","board-4-rows.html",1080,680,"The full-size team board, always 4 rows"],
  ["Spot board · 3 rows","board-3-rows.html",1080,402,"Always 3 rows. Leaves room for the top overlay above it"],
  ["Spot board · 2 rows","board-2-rows.html",1080,252,"The compact board, always 2 rows"],
  ["Animations","animations.html",1080,1920,"The SOLD team takeover on every sale, plus Spin 2 Choose 1 and Stash or Pass, all in the middle of the screen. Put it on top of your other sources"],
  ["Ticker","ticker.html",1080,72,"Scrolling LIVE ticker"],
  ["Socials","socials.html",420,80,"Rotates through your handles"],
  ["All-in-one (phone)","index-1080x1920.html",1080,1920,"Board, ticker, takeover and animations together"]
];
(function renderSources(){
  const base=location.href.replace(/[^/]*([?#].*)?$/,"");
  const wrap=document.getElementById("sourceList");
  if(!wrap)return;
  SOURCES.forEach(([name,file,w,h,desc])=>{
    const url=base+file,row=document.createElement("div");
    row.className="source-row";
    row.innerHTML=`<div class="src-info"><strong></strong><span class="src-size">${w} × ${h}</span><small></small><code></code></div><button type="button" class="ghost">Copy</button>`;
    row.querySelector("strong").textContent=name;
    row.querySelector("small").textContent=desc;
    row.querySelector("code").textContent=url;
    row.querySelector("button").addEventListener("click",e=>{
      navigator.clipboard.writeText(url).then(()=>{e.target.textContent="Copied!";setTimeout(()=>e.target.textContent="Copy",1500)});
    });
    wrap.appendChild(row);
  });
})();

if(currencySelect)currencySelect.addEventListener("change",()=>{state.currency=currencySelect.value;if(ref)ref.update({currency:state.currency})});

// ---------- socials ----------
const SOCIALS=[["instagram","Instagram"],["tiktok","TikTok"],["youtube","YouTube"],["x","X / Twitter"],["facebook","Facebook"],["discord","Discord"],["twitch","Twitch"]];
SOCIALS.forEach(([k,n])=>{
  const l=document.createElement("label");l.textContent=n;
  const i=document.createElement("input");i.type="text";i.id=`social_${k}`;i.placeholder="@handle";i.autocomplete="off";
  const box=document.getElementById("socialInputs");if(box){l.appendChild(i);box.appendChild(l)}
});
function hydrateSocials(){SOCIALS.forEach(([k])=>{const i=document.getElementById(`social_${k}`);if(i&&document.activeElement!==i)i.value=(state.socials||{})[k]||""})}
on("saveSocialsBtn","click",()=>{
  const socials={};SOCIALS.forEach(([k])=>{socials[k]=document.getElementById(`social_${k}`).value.trim()});
  state.socials=socials;
  if(ref)ref.update({socials}).then(()=>setCmd("Socials saved.","ok"));
});
on("resetAllBtn","click",resetSold);

hydrate();
renderTeams();
markActiveLeague();

if(window.SMJFIREBASE_READY&&window.smjDB){
  ref=window.smjDB.ref(PATH);
  setConn("Firebase connected","ok");
  setCmd("Ready.","ok");

  ref.once("value").then(s=>{
    if(!s.exists())return ref.set(DEFAULT);
    // the price tag controls were removed, so don't leave an old one showing
    if(s.val().priceTag&&s.val().priceTag.show)ref.child("priceTag/show").set(false);
  });

  ref.on("value",snap=>{
    const data=snap.val();
    if(!data)return;
    state={...DEFAULT,...data,sold:{...(data.sold||{})},buyers:{...(data.buyers||{})},prices:{...(data.prices||{})}};
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
