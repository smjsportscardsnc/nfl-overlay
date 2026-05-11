const PATH="smjOverlay/current";
const DEFAULT={title:"SMJ NFL BREAK",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},league:"nfl"};

let state={...DEFAULT},previousSoldState={};

const grid=document.getElementById("teamsGrid"),
soldCount=document.getElementById("soldCount"),
tickerText=document.getElementById("tickerText"),
breakTitle=document.getElementById("breakTitle"),
leagueIndicator=document.getElementById("leagueIndicator");

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

render();

if(window.SMJFIREBASE_READY&&window.smjDB){
  const ref=window.smjDB.ref(PATH);
  ref.on("value",snap=>{
    const data=snap.val();
    if(!data){ref.set(DEFAULT);return}
    if((data.league||DEFAULT.league)!==state.league)previousSoldState={};
    state={...DEFAULT,...data,sold:{...(data.sold||{})}};
    render();
  },err=>console.error(err));
}else{
  console.error(window.SMJFIREBASE_ERROR);
}
