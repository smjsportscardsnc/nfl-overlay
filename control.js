const channel = new BroadcastChannel('smj-overlay');
const state = JSON.parse(localStorage.getItem('smjOverlayState') || '{}');
const sold = state.sold || {};
function send(msg){ channel.postMessage(msg); }
function $(id){ return document.getElementById(id); }
function saveLocal(patch){ Object.assign(state, patch); localStorage.setItem('smjOverlayState', JSON.stringify(state)); }

$('breakTitleInput').value = state.title || $('breakTitleInput').value;
$('breakSubtitleInput').value = state.subtitle || $('breakSubtitleInput').value;
$('tickerInput').value = state.ticker || $('tickerInput').value;

$('saveInfo').onclick = () => {
  const msg = {type:'info', title:$('breakTitleInput').value, subtitle:$('breakSubtitleInput').value, ticker:$('tickerInput').value};
  saveLocal({title:msg.title,subtitle:msg.subtitle,ticker:msg.ticker}); send(msg);
};
document.querySelectorAll('[data-trigger]').forEach(b => b.onclick = () => send({type:'trigger', name:b.dataset.trigger}));
$('clearAll').onclick = () => send({type:'clear'});
$('showLower').onclick = () => send({type:'lower', title:$('lowerTitleInput').value, text:$('lowerTextInput').value});
$('startCountdown').onclick = () => send({type:'countdown', seconds:$('secondsInput').value});
$('stopCountdown').onclick = () => send({type:'stopCountdown'});
$('addHit').onclick = () => send({type:'hit', text:$('hitInput').value});
$('clearHits').onclick = () => send({type:'clearHits'});

const teamControls = $('teamControls');
window.SMJ_TEAMS.forEach(t => {
  const box=document.createElement('div'); box.className='team-control';
  box.innerHTML = `<div class="row"><img src="${t.logo}" onerror="this.style.display='none'"><strong>${t.name}</strong></div><input placeholder="Buyer username" value="${sold[t.id]?.buyer || ''}"><button class="soldBtn">Mark Sold</button><button class="clearBtn secondary">Clear</button>`;
  const input=box.querySelector('input');
  box.querySelector('.soldBtn').onclick=()=>{ sold[t.id]={buyer:input.value}; saveLocal({sold}); send({type:'team', id:t.id, buyer:input.value}); };
  box.querySelector('.clearBtn').onclick=()=>{ input.value=''; delete sold[t.id]; saveLocal({sold}); send({type:'clearTeam', id:t.id}); };
  teamControls.append(box);
});
