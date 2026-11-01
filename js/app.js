const PATH="smjOverlay/current";
const DEFAULT={title:"SMJ NFL BREAK",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},buyers:{},league:"nfl",lastSold:""};
const CALLOUT_MS=4200;
const TICKER_SPEED=110; // pixels per second

let state={...DEFAULT},previousSoldState={},firstSnapshot=true;
let calloutQueue=[],calloutTimer=null;

const panel=document.getElementById("scoreboardPanel"),
grid=document.getElementById("teamsGrid"),
remaining=document.getElementById("remaining"),
remainingCount=document.getElementById("remainingCount"),
remainingLabel=document.getElementById("remainingLabel"),
progressFill=document.getElementById("progressFill"),
tickerText=document.getElementById("tickerText"),
breakTitle=document.getElementById("breakTitle"),
leagueIndicator=document.getElementById("leagueIndicator"),
soldCallout=document.getElementById("soldCallout"),
calloutLogo=document.getElementById("calloutLogo"),
calloutMain=document.getElementById("calloutMain");

function currentLeague(){return window.SMJ_LEAGUES[state.league||"nfl"]||window.SMJ_LEAGUES.nfl}
function teams(){return currentLeague().teams}
function logo(abbr){const lg=currentLeague();return `https://a.espncdn.com/i/teamlogos/${lg.cdn}/500/${abbr}.png`}
function buyerFor(abbr){return (state.buyers&&state.buyers[abbr])||""}

function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}

function logoPlate(team){
  const plate=el("div","logo-plate");
  const img=document.createElement("img");
  img.src=logo(team.abbr);
  img.alt=`${team.city} ${team.name}`;
  img.onerror=()=>plate.classList.add("logo-error");
  plate.append(img,el("span","fallback-initials",(team.abbr||"?").toUpperCase()));
  return plate;
}

// Shrink the break title until it fits next to the badges
function fitTitle(){
  breakTitle.style.fontSize="";
  const max=900-36-72-document.querySelector(".right-badges").offsetWidth-24;
  let size=34;
  while(breakTitle.scrollWidth>max&&size>18){size-=1;breakTitle.style.fontSize=size+"px"}
}

// Same scroll speed no matter how long the message is
function fitTicker(){
  const win=tickerText.parentElement.offsetWidth;
  const dist=win+tickerText.scrollWidth;
  tickerText.style.setProperty("--tickerStart",win+"px");
  tickerText.style.setProperty("--tickerDuration",Math.max(8,dist/TICKER_SPEED).toFixed(1)+"s");
}

function render(){
  const lg=currentLeague(),list=teams();
  if(breakTitle.textContent!==(state.title||DEFAULT.title)){breakTitle.textContent=state.title||DEFAULT.title}
  if(tickerText.textContent!==(state.ticker||DEFAULT.ticker)){tickerText.textContent=state.ticker||DEFAULT.ticker;fitTicker()}
  leagueIndicator.textContent=lg.name;

  const soldN=list.filter(t=>!!state.sold?.[t.abbr]).length,left=list.length-soldN;
  remainingCount.textContent=left===0?"SOLD OUT":left;
  remainingLabel.textContent=left===0?"":(left<=3?`OF ${list.length} · LAST ${left}`:"LEFT");
  remaining.classList.toggle("sold-out",left===0);
  progressFill.style.width=`${list.length?soldN/list.length*100:0}%`;

  const cols=list.length>16?8:Math.ceil(list.length/4);
  grid.style.setProperty("--cols",cols);
  grid.classList.toggle("roomy",cols<8);

  grid.innerHTML="";
  list.forEach(team=>{
    const isSold=!!state.sold?.[team.abbr],wasSold=!!previousSoldState?.[team.abbr];
    const box=el("div","team-box");
    if(isSold)box.classList.add("sold");
    if(isSold&&!wasSold&&!firstSnapshot)box.classList.add("just-sold");
    if(isSold&&state.lastSold===team.abbr)box.classList.add("latest");
    box.style.setProperty("--teamColor",team.color);
    const text=el("div","team-text");
    text.append(el("div","team-abbr",team.abbr.toUpperCase()),el("div","team-buyer",buyerFor(team.abbr)));
    box.append(logoPlate(team),text);
    grid.appendChild(box);
  });

  fitTitle();
}

function queueCallouts(newlySold){
  newlySold.forEach(abbr=>{
    const team=teams().find(t=>t.abbr===abbr);
    if(team)calloutQueue.push(team);
  });
  if(!calloutTimer)nextCallout();
}

function nextCallout(){
  const team=calloutQueue.shift();
  if(!team){calloutTimer=null;return}
  calloutLogo.replaceChildren(logoPlate(team));
  soldCallout.style.setProperty("--teamColor",team.color);
  const buyer=buyerFor(team.abbr);
  calloutMain.textContent=`${team.city} ${team.name}`.toUpperCase()+(buyer?` → ${buyer}`:"");
  soldCallout.classList.remove("show");void soldCallout.offsetWidth;soldCallout.classList.add("show");
  panel.classList.remove("sale-flash");void panel.offsetWidth;panel.classList.add("sale-flash");
  calloutTimer=setTimeout(nextCallout,CALLOUT_MS);
}

// ---------- full-screen moments ----------
const MOMENT_MS=4600;
const momentEl=document.getElementById("moment"),
momentImg=document.getElementById("momentImg"),
momentShine=document.getElementById("momentShine"),
momentSparks=document.getElementById("momentSparks");
let momentTimer=null,lastMomentAt=null;
const swoosh=new Audio("assets/sounds/swoosh.wav");
swoosh.preload="auto";

function playSound(volume){
  try{const a=swoosh.cloneNode();a.volume=volume;a.play().catch(()=>{})}catch(e){}
}

function playMoment(id){
  const m=window.SMJ_MOMENTS&&window.SMJ_MOMENTS[id];
  if(!m)return;
  clearTimeout(momentTimer);
  momentEl.classList.remove("play");
  m.colors.forEach((c,i)=>momentEl.style.setProperty(`--c${i+1}`,c));
  momentImg.src=m.image;
  momentShine.style.setProperty("--img",`url("${m.image}")`);

  // sparks that burst out when the graphic lands
  momentSparks.innerHTML="";
  for(let i=0;i<26;i++){
    const a=Math.random()*Math.PI*2,r=320+Math.random()*380,s=el("div","m-spark");
    s.style.setProperty("--x",`${Math.cos(a)*r}px`);
    s.style.setProperty("--y",`${Math.sin(a)*r*.75}px`);
    s.style.setProperty("--s",`${6+Math.random()*14}px`);
    s.style.setProperty("--d",`${Math.random()*.12}s`);
    s.style.setProperty("--sc",m.colors[i%m.colors.length]);
    momentSparks.appendChild(s);
  }

  void momentEl.offsetWidth;
  momentEl.classList.add("play");
  playSound(1);
  setTimeout(()=>playSound(.6),3650);
  momentTimer=setTimeout(()=>momentEl.classList.remove("play"),MOMENT_MS);
}
window.playMoment=playMoment; // handy for testing from the browser console

render();
fitTicker();

if(window.SMJFIREBASE_READY&&window.smjDB){
  const ref=window.smjDB.ref(PATH);
  ref.on("value",snap=>{
    const data=snap.val();
    if(!data){ref.set(DEFAULT);return}
    const leagueChanged=(data.league||DEFAULT.league)!==state.league;
    if(leagueChanged)previousSoldState={};
    state={...DEFAULT,...data,sold:{...(data.sold||{})},buyers:{...(data.buyers||{})}};
    const newlySold=(firstSnapshot||leagueChanged)?[]:Object.keys(state.sold).filter(a=>state.sold[a]&&!previousSoldState[a]);
    render();
    if(newlySold.length)queueCallouts(newlySold);
    previousSoldState={...state.sold};
    // play a moment when the control panel sends a new one (never on first load)
    const mAt=data.moment&&data.moment.at;
    if(mAt&&mAt!==lastMomentAt&&!firstSnapshot)playMoment(data.moment.id);
    lastMomentAt=mAt||lastMomentAt;
    firstSnapshot=false;
  },err=>console.error(err));
}else{
  console.error(window.SMJFIREBASE_ERROR);
}
