const PATH="smjOverlay/current",CMD="smjOverlay/stingerCommand",DEFAULT={title:"SMJ NFL BREAK",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},league:"nfl",stingerCommand:null};

let state={...DEFAULT},lastId=null,previousSoldState={};
let currentReady=false;
let commandReady=false;

const grid=document.getElementById("teamsGrid"),
soldCount=document.getElementById("soldCount"),
tickerText=document.getElementById("tickerText"),
breakTitle=document.getElementById("breakTitle"),
leagueIndicator=document.getElementById("leagueIndicator"),
layer=document.getElementById("stingerLayer"),
video=document.getElementById("stingerVideo");

const stingers={
  stash:"assets/stingers/stash-or-pass.webm",
  choose:"assets/stingers/spin-2-choose-1.webm"
};

function currentLeague(){return window.SMJ_LEAGUES[state.league||"nfl"]||window.SMJ_LEAGUES.nfl}
function teams(){return currentLeague().teams}
function logo(abbr){const lg=currentLeague();return `https://a.espncdn.com/i/teamlogos/${lg.cdn}/500/${abbr}.png`}

function render(){
  const lg=currentLeague();
  breakTitle.textContent=state.title||DEFAULT.title;
  tickerText.textContent=state.ticker||DEFAULT.ticker;
  leagueIndicator.textContent=lg.name;
  soldCount.textContent=`${teams().filter(t=>!!state.sold?.[t.abbr]).length}/${teams().length}`;

  grid.innerHTML="";
  teams().forEach(team=>{
    const isSold=!!state.sold?.[team.abbr], wasSold=!!previousSoldState?.[team.abbr];
    const box=document.createElement("div");
    box.className=`team-box ${isSold?"sold":""} ${isSold&&!wasSold?"just-sold":""}`;
    box.style.setProperty("--teamColor",team.color);
    box.style.setProperty("--teamGlow",`${team.color}80`);
    const initials=(team.abbr||"?").toUpperCase();
    box.innerHTML=`<div class="logo-plate"><img src="${logo(team.abbr)}" alt="${team.city} ${team.name}" onerror="this.parentElement.classList.add('logo-error')" /><span class="fallback-initials">${initials}</span></div>`;
    grid.appendChild(box);
  });
  previousSoldState={...(state.sold||{})};
}

async function playStinger(key){
  const webm=stingers[key]||stingers.stash;
  const mp4=webm.replace(".webm",".mp4");

  layer.classList.remove("hidden");
  video.pause();
  video.removeAttribute("src");
  video.muted=false;
  video.volume=1;

  video.onended=()=>{
    layer.classList.add("hidden");
    video.pause();
    video.removeAttribute("src");
  };

  video.onerror=async()=>{
    console.warn("WebM failed, trying MP4 fallback");
    video.onerror=null;
    video.src=mp4+"?v="+Date.now();
    video.load();
    try{await video.play()}catch(e){
      console.error("MP4 fallback failed",e);
      layer.classList.add("hidden");
    }
  };

  video.src=webm+"?v="+Date.now();
  video.load();

  try{
    await video.play();
  }catch(e){
    console.warn("WebM playback was blocked or failed, trying MP4 fallback",e);
    video.onerror=null;
    video.src=mp4+"?v="+Date.now();
    video.load();
    try{await video.play()}catch(e2){
      console.error("Stinger playback failed",e2);
      layer.classList.add("hidden");
    }
  }
}

function handle(cmd){
  if(!cmd||!cmd.id||cmd.id===lastId)return;
  lastId=cmd.id;
  playStinger(cmd.key);
}

render();

if(window.SMJFIREBASE_READY&&window.smjDB){
  const ref=window.smjDB.ref(PATH), cmdRef=window.smjDB.ref(CMD);

  ref.on("value",snap=>{
    const data=snap.val();
    if(!data){ref.set(DEFAULT);return}

    if((data.league||DEFAULT.league)!==state.league)previousSoldState={};

    state={...DEFAULT,...data,sold:{...(data.sold||{})}};
    render();

    // Ignore stale command from current state on first page load.
    if(!currentReady){
      if(state.stingerCommand?.id) lastId=state.stingerCommand.id;
      currentReady=true;
      return;
    }

    handle(state.stingerCommand);
  },err=>console.error(err));

  cmdRef.on("value",snap=>{
    const cmd=snap.val();

    // Ignore stale dedicated command on first page load.
    if(!commandReady){
      if(cmd?.id) lastId=cmd.id;
      commandReady=true;
      return;
    }

    handle(cmd);
  });
}else{
  console.error(window.SMJFIREBASE_ERROR);
}
