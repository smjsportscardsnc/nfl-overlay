const OVERLAY_PATH = "smjOverlay/current";
const GRAPHIC_COMMAND_PATH = "smjOverlay/graphicCommand";
const DEFAULT_STATE = { title:"SMJ NFL MIXER BREAK", status:"Live", ticker:"Welcome to SMJ Sports Cards & Collectibles!", sold:{}, graphicCommand:null };
let state = {...DEFAULT_STATE};
let lastGraphicId = null;

const grid = document.getElementById("teamsGrid");
const soldCount = document.getElementById("soldCount");
const statusText = document.getElementById("statusText");
const tickerText = document.getElementById("tickerText");
const breakTitle = document.getElementById("breakTitle");

function logo(abbr){ return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`; }

function render(){
  breakTitle.textContent = state.title || DEFAULT_STATE.title;
  statusText.textContent = state.status || DEFAULT_STATE.status;
  tickerText.textContent = state.ticker || DEFAULT_STATE.ticker;
  soldCount.textContent = `${window.SMJ_TEAMS.filter(t => !!state.sold?.[t.abbr]).length}/32`;

  grid.innerHTML = "";
  window.SMJ_TEAMS.forEach(team => {
    const box = document.createElement("div");
    box.className = `team-box ${state.sold?.[team.abbr] ? "sold" : ""}`;
    box.style.setProperty("--teamColor", team.color);
    box.style.setProperty("--teamGlow", `${team.color}80`);
    box.innerHTML = `<div class="logo-plate"><img src="${logo(team.abbr)}" alt="${team.city} ${team.name}" /></div>`;
    grid.appendChild(box);
  });
}

function handleGraphicCommand(cmd){
  if(!cmd || !cmd.id || cmd.id === lastGraphicId) return;
  lastGraphicId = cmd.id;
  window.SMJGraphicSwoosh.trigger(cmd.key || "stash");
}

render();

if(window.SMJFIREBASE_READY && window.smjDB){
  const ref = window.smjDB.ref(OVERLAY_PATH);
  const graphicRef = window.smjDB.ref(GRAPHIC_COMMAND_PATH);

  ref.on("value", snap => {
    const data = snap.val();
    if(!data){ ref.set(DEFAULT_STATE); return; }
    state = {...DEFAULT_STATE, ...data, sold:{...(data.sold || {})}};
    render();
    handleGraphicCommand(state.graphicCommand);
    handleGraphicCommand(state.flyCommand);
    handleGraphicCommand(state.motionCommand);
  }, err => console.error(err));

  graphicRef.on("value", snap => handleGraphicCommand(snap.val()));
} else {
  console.error("Firebase not ready:", window.SMJFIREBASE_ERROR);
}

window.SMJOverlay = { triggerGraphic:(key)=>window.SMJGraphicSwoosh.trigger(key) };
