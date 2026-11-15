const PATH="smjOverlay/current";
const DEFAULT={brand:"SMJ Sports Cards",title:"SMJ NFL BREAK",subtitle:"singles • rips • breaks",ticker:"Welcome to SMJ Sports Cards & Collectibles!",sold:{},buyers:{},prices:{},league:"nfl",lastSold:"",boardRows:3,currency:"$",priceTag:{label:"Free Respin",amount:"",show:false},socials:{}};
const TAKEOVER_MS=4200;
const TICKER_SPEED=110; // pixels per second

let state={...DEFAULT},previousSoldState={},firstSnapshot=true;
let takeoverQueue=[],takeoverTimer=null;

const panel=document.getElementById("scoreboardPanel"),
grid=document.getElementById("teamsGrid"),
remaining=document.getElementById("remaining"),
remainingCount=document.getElementById("remainingCount"),
remainingTotal=document.getElementById("remainingTotal"),
remainingLabel=document.getElementById("remainingLabel"),
progressSegs=document.getElementById("progressSegs"),
tickerText=document.getElementById("tickerText"),
breakTitle=document.getElementById("breakTitle"),
breakSubtitle=document.getElementById("breakSubtitle"),
leagueIndicator=document.getElementById("leagueIndicator"),
takeover=document.getElementById("takeover"),
takeoverLogo=document.getElementById("takeoverLogo"),
takeoverPattern=document.getElementById("takeoverPattern"),
takeoverCity=document.getElementById("takeoverCity"),
takeoverName=document.getElementById("takeoverName"),
takeoverBuyer=document.getElementById("takeoverBuyer"),
takeoverConfetti=document.getElementById("takeoverConfetti");

function currentLeague(){return window.SMJ_LEAGUES[state.league||"nfl"]||window.SMJ_LEAGUES.nfl}
function teams(){return currentLeague().teams}
function logo(abbr){const lg=currentLeague();return `https://a.espncdn.com/i/teamlogos/${lg.cdn}/500/${abbr}.png`}
function buyerFor(abbr){return (state.buyers&&state.buyers[abbr])||""}

function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}

// light team colours (Steelers gold, Raiders silver, Saints gold) get dark nameplate text
function isLight(hex){
  const n=parseInt((hex||"#000").slice(1),16);
  return (0.299*(n>>16)+0.587*(n>>8&255)+0.114*(n&255))/255>.6;
}

function logoPlate(team){
  const plate=el("div","logo-plate");
  const img=document.createElement("img");
  img.src=logo(team.abbr);
  img.alt=`${team.city} ${team.name}`;
  img.onerror=()=>plate.classList.add("logo-error");
  plate.append(img,el("span","fallback-initials",(team.abbr||"?").toUpperCase()));
  return plate;
}

// Shrink the break title until it fits next to the logo and counter
function fitTitle(){
  if(!breakTitle)return;
  breakTitle.style.fontSize="";
  const max=breakTitle.parentElement.clientWidth;
  let size=50;
  while(breakTitle.scrollWidth>max&&size>26){size-=1;breakTitle.style.fontSize=size+"px"}
}

// Same scroll speed no matter how long the message is
function fitTicker(){
  if(!tickerText)return;
  const win=tickerText.parentElement.offsetWidth;
  const dist=win+tickerText.scrollWidth;
  tickerText.style.setProperty("--tickerStart",win+"px");
  tickerText.style.setProperty("--tickerDuration",Math.max(8,dist/TICKER_SPEED).toFixed(1)+"s");
}

function render(){
  const lg=currentLeague(),list=teams();
  if(tickerText&&tickerText.textContent!==(state.ticker||DEFAULT.ticker)){tickerText.textContent=state.ticker||DEFAULT.ticker;fitTicker()}
  (window.SMJ_HOOKS||[]).forEach(fn=>{try{fn(state)}catch(e){console.error(e)}});
  if(!grid)return;
  const rows=document.body.classList.contains("src-strip")?2:([2,3,4].includes(+state.boardRows)?+state.boardRows:3);
  panel.dataset.rows=rows;
  if(breakTitle.textContent!==(state.title||DEFAULT.title)){breakTitle.textContent=state.title||DEFAULT.title}
  const sub=state.subtitle==null?DEFAULT.subtitle:state.subtitle;
  if(breakSubtitle){breakSubtitle.textContent=sub;breakSubtitle.hidden=!sub}
  if(leagueIndicator)leagueIndicator.textContent=lg.name;

  const soldN=list.filter(t=>!!state.sold?.[t.abbr]).length,left=list.length-soldN;
  remainingCount.textContent=left===0?"SOLD OUT":left;
  remainingTotal.textContent=`/${list.length}`;
  remainingLabel.textContent=left===0?"THANK YOU!":(left<=3?`LAST ${left}!`:"SPOTS LEFT");
  remaining.classList.toggle("sold-out",left===0);

  progressSegs.style.setProperty("--n",list.length);
  progressSegs.innerHTML="";
  for(let i=0;i<list.length;i++)progressSegs.appendChild(el("i",i<soldN?"on":""));

  const cols=Math.ceil(list.length/rows);
  grid.style.setProperty("--cols",cols);

  grid.innerHTML="";
  list.forEach((team,i)=>{
    const isSold=!!state.sold?.[team.abbr],wasSold=!!previousSoldState?.[team.abbr];
    const buyer=buyerFor(team.abbr);
    const box=el("div","team-box");
    if(isSold)box.classList.add("sold");
    if(isSold&&!buyer)box.classList.add("no-buyer");
    if(isSold&&!wasSold&&!firstSnapshot)box.classList.add("just-sold");
    if(isSold&&state.lastSold===team.abbr)box.classList.add("latest");
    box.style.setProperty("--teamColor",team.color);
    box.style.setProperty("--plateText",isLight(team.color)?"#111":"#fff");
    box.style.setProperty("--d",`${(i%8)*.15+Math.floor(i/8)*.08}s`);
    box.append(logoPlate(team));
    if(isSold)box.append(el("div","sold-stamp","SOLD"));
    box.append(el("div","nameplate",isSold&&buyer?buyer:team.abbr.toUpperCase()));
    grid.appendChild(box);
  });

  fitTitle();
}

// ---------- team takeover on each sale ----------
function queueTakeovers(newlySold){
  if(!takeover)return;
  newlySold.forEach(abbr=>{
    const team=teams().find(t=>t.abbr===abbr);
    if(team)takeoverQueue.push(team);
  });
  if(!takeoverTimer)nextTakeover();
}

function nextTakeover(){
  const team=takeoverQueue.shift();
  if(!team){takeoverTimer=null;return}
  showTakeover(team,buyerFor(team.abbr));
  takeoverTimer=setTimeout(nextTakeover,TAKEOVER_MS+200);
}

function showTakeover(team,buyer){
  takeover.style.setProperty("--teamColor",team.color);
  takeover.style.setProperty("--toMs",TAKEOVER_MS+"ms");
  takeoverLogo.replaceChildren(logoPlate(team));
  takeoverPattern.style.backgroundImage=`url("${logo(team.abbr)}")`;
  takeoverCity.textContent=team.city;
  takeoverName.textContent=team.name;
  takeoverBuyer.textContent=buyer||"";
  // shrink long team names to fit
  const tn=takeoverName.parentElement;tn.style.fontSize="";
  takeoverConfetti.innerHTML="";
  const colours=["#fff",team.color,"#ffcc4d"];
  for(let i=0;i<40;i++){
    const c=el("i");
    c.style.left=Math.random()*100+"%";
    c.style.background=colours[i%3];
    c.style.setProperty("--dl",(Math.random()*.8).toFixed(2)+"s");
    c.style.setProperty("--fd",(1.6+Math.random()).toFixed(2)+"s");
    takeoverConfetti.appendChild(c);
  }
  takeover.classList.remove("show");void takeover.offsetWidth;takeover.classList.add("show");
  const max=panel.clientWidth-60-300-40-60;let size=104;
  while(tn.scrollWidth>max&&size>56){size-=4;tn.style.fontSize=size+"px"}
}
window.SMJ_state=()=>state;
window.testTakeover=(abbr,buyer)=>{const t=teams().find(x=>x.abbr===abbr)||teams()[0];showTakeover(t,buyer||"@cardking88")};

// ---------- full-screen moments ----------
const MOMENT_MS=4600;
const momentEl=document.getElementById("moment"),
momentKicker=document.getElementById("momentKicker"),
momentTitle=document.getElementById("momentTitle"),
momentSub=document.getElementById("momentSub"),
momentBadge=document.getElementById("momentBadge"),
momentSparks=document.getElementById("momentSparks");
let momentTimer=null,lastMomentAt=null;
const swoosh=momentEl?new Audio("assets/sounds/swoosh.wav"):null;
if(swoosh)swoosh.preload="auto";

function playSound(volume){
  try{const a=swoosh.cloneNode();a.volume=volume;a.play().catch(()=>{})}catch(e){}
}

function playMoment(id){
  const m=window.SMJ_MOMENTS&&window.SMJ_MOMENTS[id];
  if(!m||!momentEl)return;
  clearTimeout(momentTimer);
  momentEl.classList.remove("play");
  m.colors.forEach((c,i)=>momentEl.style.setProperty(`--c${i+1}`,c));
  momentKicker.textContent=m.kicker||"";
  momentKicker.hidden=!m.kicker;
  momentTitle.replaceChildren(...(m.lines||[]).map(l=>{
    const s=el("span",l.small?"small":"",l.t);
    if(l.c)s.style.setProperty("--lc",l.c);
    return s;
  }));
  momentTitle.classList.toggle("long",(m.lines||[]).some(l=>!l.small&&l.t.length>6));
  momentSub.textContent=m.sub||"";
  momentBadge.textContent=m.badge||"";

  // sparks that burst out when the graphic lands
  momentSparks.innerHTML="";
  for(let i=0;i<44;i++){
    const a=Math.random()*Math.PI*2,r=420+Math.random()*420,s=el("div","m-spark");
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
    state={...DEFAULT,...data,sold:{...(data.sold||{})},buyers:{...(data.buyers||{})},prices:{...(data.prices||{})}};
    const newlySold=(firstSnapshot||leagueChanged)?[]:Object.keys(state.sold).filter(a=>state.sold[a]&&!previousSoldState[a]);
    render();
    if(newlySold.length)queueTakeovers(newlySold);
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
