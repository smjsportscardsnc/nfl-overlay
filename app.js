const channel = new BroadcastChannel('smj-overlay');
const state = JSON.parse(localStorage.getItem('smjOverlayState') || '{}');
const sold = state.sold || {};
const hits = state.hits || [];
let countdownTimer = null;

function saveState(patch){ Object.assign(state, patch); localStorage.setItem('smjOverlayState', JSON.stringify(state)); }
function $(id){ return document.getElementById(id); }

function renderTeams(){
  const grid = $('teamGrid'); grid.innerHTML = '';
  window.SMJ_TEAMS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'team-card' + (sold[t.id]?.buyer ? ' sold' : '');
    const img = document.createElement('img'); img.className='team-logo'; img.src=t.logo; img.alt=t.name;
    img.onerror = () => { img.replaceWith(Object.assign(document.createElement('div'), {className:'logo-fallback', textContent:t.abbr})); };
    const info = document.createElement('div'); info.className='team-info';
    info.innerHTML = `<div class="team-abbr">${t.abbr}</div><div class="buyer">${sold[t.id]?.buyer || 'Available'}</div>`;
    card.append(img, info); grid.append(card);
  });
}
function renderInfo(){
  $('breakTitle').textContent = state.title || 'SMJ Sports Cards & Collectibles';
  $('breakSubtitle').textContent = state.subtitle || 'Singles • Rips • Breaks';
  $('ticker').innerHTML = `<span>${state.ticker || 'Welcome to SMJ Sports Cards & Collectibles!'}</span>`;
}
function renderHits(){
  const panel = $('recentHits'); const list = $('hitList'); list.innerHTML='';
  if(!hits.length){ panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  hits.slice(0,5).forEach(h=>{ const d=document.createElement('div'); d.className='hit-item'; d.textContent=h; list.append(d); });
}
function playSfx(name){
  const audio = new Audio(`assets/sfx/${name}.mp3`);
  audio.volume = 0.55;
  audio.play().catch(()=>{});
}
function trigger(name){
  const layer = $('animationLayer'); layer.className='animation-layer'; layer.innerHTML='';
  const copy = {
    'stash-pass':['STASH OR PASS','MAKE THE CALL','KEEP IT OR MOVE IT?','stash'],
    'spin-choose':['SPIN 2 CHOOSE 1','PICK YOUR SIDE','NO WHEEL — JUST THE DECISION','choose'],
    'big-hit':['BIG HIT','SMJ HEATER','LET’S GOOOO!','hit'],
    'giveaway':['GIVEAWAY','FOLLOW • BOOKMARK • SHARE','GOOD LUCK!','giveaway'],
    'break-full':['BREAK FULL','LOCKED & LOADED','TIME TO RIP!','full']
  }[name] || ['SMJ','SPORTS CARDS','COLLECTIBLES',''];
  layer.innerHTML = `<div class="splash ${copy[3]}"><div class="kicker">${copy[0]}</div><div class="main">${copy[1]}</div><div class="sub">${copy[2]}</div></div>`;
  playSfx(name);
  setTimeout(()=>layer.classList.add('hidden'), 4500);
}
function lower(title,text){
  $('lowerTitle').textContent = title || 'SMJ BREAKS'; $('lowerText').textContent = text || 'Follow @smjsportscardsnc';
  $('lowerThird').classList.remove('hidden');
  setTimeout(()=>$('lowerThird').classList.add('hidden'), 6000);
}
function startCountdown(seconds){
  clearInterval(countdownTimer);
  let remaining = Number(seconds)||30; const el=$('countdown'); el.classList.remove('hidden');
  const draw=()=>{ const m=String(Math.floor(remaining/60)).padStart(2,'0'); const s=String(remaining%60).padStart(2,'0'); el.textContent=`${m}:${s}`; };
  draw(); countdownTimer=setInterval(()=>{ remaining--; draw(); if(remaining<=0){ clearInterval(countdownTimer); trigger('big-hit'); setTimeout(()=>el.classList.add('hidden'),1000); }},1000);
}
function stopCountdown(){ clearInterval(countdownTimer); $('countdown').classList.add('hidden'); }

function handle(msg){
  if(msg.type==='info'){ saveState({title:msg.title,subtitle:msg.subtitle,ticker:msg.ticker}); renderInfo(); }
  if(msg.type==='team'){ sold[msg.id]={buyer:msg.buyer}; saveState({sold}); renderTeams(); }
  if(msg.type==='clearTeam'){ delete sold[msg.id]; saveState({sold}); renderTeams(); }
  if(msg.type==='trigger') trigger(msg.name);
  if(msg.type==='clear') $('animationLayer').classList.add('hidden');
  if(msg.type==='lower') lower(msg.title,msg.text);
  if(msg.type==='countdown') startCountdown(msg.seconds);
  if(msg.type==='stopCountdown') stopCountdown();
  if(msg.type==='hit'){ hits.unshift(msg.text); hits.splice(8); saveState({hits}); renderHits(); }
  if(msg.type==='clearHits'){ hits.length=0; saveState({hits}); renderHits(); }
}
channel.onmessage = e => handle(e.data);
renderInfo(); renderTeams(); renderHits();
