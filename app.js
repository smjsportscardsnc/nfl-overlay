const NFL_TEAMS = [
  'Cardinals','Falcons','Ravens','Bills','Panthers','Bears','Bengals','Browns',
  'Cowboys','Broncos','Lions','Packers','Texans','Colts','Jaguars','Chiefs',
  'Raiders','Chargers','Rams','Dolphins','Vikings','Patriots','Saints','Giants',
  'Jets','Eagles','Steelers','49ers','Seahawks','Buccaneers','Titans','Commanders'
];

const DEFAULT_STATE = {
  title: 'SMJ NFL Mixer Break',
  ticker: 'Welcome to SMJ Sports Cards & Collectibles!',
  teams: NFL_TEAMS.map(name => ({ name, buyer: '', sold: false, chaser: false })),
  chasers: Array.from({ length: 9 }, (_, i) => ({ spot: i + 1, winner: '', team: '' })),
  event: null,
  spin: { active: false, a: 'Stash', b: 'Pass', winner: '' },
  nonce: 0
};

let state = loadState();
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('smj-overlay') : null;

function loadState() {
  try { return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem('smjOverlayState') || '{}') }; }
  catch { return structuredClone(DEFAULT_STATE); }
}

function saveState(next) {
  state = { ...next, nonce: Date.now() };
  localStorage.setItem('smjOverlayState', JSON.stringify(state));
  channel?.postMessage(state);
  render();
}

channel?.addEventListener('message', event => {
  state = { ...DEFAULT_STATE, ...event.data };
  localStorage.setItem('smjOverlayState', JSON.stringify(state));
  render();
});

window.addEventListener('storage', event => {
  if (event.key === 'smjOverlayState') {
    state = loadState();
    render();
  }
});

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const on = (selector, event, handler) => $$(selector).forEach(el => el.addEventListener(event, handler));

function renderOverlay() {
  const title = $('#breakTitle');
  if (!title) return;

  title.textContent = state.title;
  $('#tickerText').textContent = state.ticker;

  const grid = $('#teamsGrid');
  grid.innerHTML = state.teams.map((team, i) => `
    <div class="team-tile ${team.sold ? 'sold' : ''} ${team.chaser ? 'chaser' : ''}" data-team-index="${i}">
      <div class="team-name">${escapeHtml(team.name)}</div>
      <div class="buyer-name">${escapeHtml(team.buyer || 'Available')}</div>
    </div>
  `).join('');

  $('#soldCount').textContent = `${state.teams.filter(t => t.sold).length}/32`;
  $('#chaserCount').textContent = `${state.chasers.filter(c => c.winner || c.team).length}/9`;

  renderEventLayer();
  renderSpinnerLayer();
}

function renderEventLayer() {
  const layer = $('#eventLayer');
  if (!layer) return;
  if (!state.event) {
    layer.classList.add('hidden');
    return;
  }

  const copy = {
    stash: ['SMJ MINI GAME', 'STASH OR PASS', 'Lock it in or let it ride!'],
    chaser: ['CHASER ALERT', 'CHASER HIT', 'Winner pool just got spicy!'],
    full: ['BREAK STATUS', 'BREAK FULL', 'Let’s rip!'],
    giveaway: ['SMJ GIVEAWAY', 'WINNER!', 'Congrats from SMJ!']
  }[state.event] || ['SMJ', String(state.event).toUpperCase(), 'Let’s go!'];

  $('#eventKicker').textContent = copy[0];
  $('#eventTitle').textContent = copy[1];
  $('#eventSubtitle').textContent = copy[2];
  layer.classList.remove('hidden');

  clearTimeout(window.__eventTimer);
  window.__eventTimer = setTimeout(() => {
    if (loadState().event === state.event) saveState({ ...state, event: null });
  }, 5000);
}

function renderSpinnerLayer() {
  const layer = $('#spinnerLayer');
  if (!layer) return;
  if (!state.spin?.active) {
    layer.classList.add('hidden');
    return;
  }
  $('#spinOptionA').textContent = state.spin.a;
  $('#spinOptionB').textContent = state.spin.b;
  $('#spinWinner').textContent = state.spin.winner ? `Winner: ${state.spin.winner}` : 'Spinning...';
  layer.classList.remove('hidden');

  clearTimeout(window.__spinWinnerTimer);
  window.__spinWinnerTimer = setTimeout(() => {
    const current = loadState();
    if (current.spin?.active && !current.spin.winner) {
      const winner = Math.random() > 0.5 ? current.spin.a : current.spin.b;
      saveState({ ...current, spin: { ...current.spin, winner } });
    }
  }, 2300);

  clearTimeout(window.__spinClearTimer);
  window.__spinClearTimer = setTimeout(() => {
    const current = loadState();
    if (current.spin?.active) saveState({ ...current, spin: { ...current.spin, active: false } });
  }, 7000);
}

function renderControl() {
  if (!$('#teamControls')) return;

  $('#titleInput').value = state.title;
  $('#tickerInput').value = state.ticker;
  $('#spinA').value = state.spin?.a || 'Stash';
  $('#spinB').value = state.spin?.b || 'Pass';

  $('#teamControls').innerHTML = state.teams.map((team, i) => `
    <div class="team-control">
      <div class="team-control-title"><span>${escapeHtml(team.name)}</span><input type="checkbox" data-sold="${i}" ${team.sold ? 'checked' : ''}></div>
      <input placeholder="Buyer username" data-buyer="${i}" value="${escapeAttr(team.buyer)}">
      <label style="display:flex;gap:8px;align-items:center;margin-top:8px;"><input type="checkbox" data-chaser-team="${i}" ${team.chaser ? 'checked' : ''}> Chaser</label>
    </div>
  `).join('');

  $('#chaserControls').innerHTML = state.chasers.map((chaser, i) => `
    <div class="chaser-control">
      <strong>Chaser ${i + 1}</strong>
      <input placeholder="Winner" data-chaser-winner="${i}" value="${escapeAttr(chaser.winner)}">
      <select data-chaser-pick="${i}">
        <option value="">Select team</option>
        ${NFL_TEAMS.map(t => `<option ${chaser.team === t ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}
      </select>
    </div>
  `).join('');

  bindControlEvents();
}

function bindControlEvents() {
  $('#saveInfoBtn')?.addEventListener('click', () => saveState({ ...state, title: $('#titleInput').value, ticker: $('#tickerInput').value }));
  $('#resetBtn')?.addEventListener('click', () => saveState(structuredClone(DEFAULT_STATE)));
  $('#clearEventBtn')?.addEventListener('click', () => saveState({ ...state, event: null, spin: { ...state.spin, active: false } }));
  $('#spinBtn')?.addEventListener('click', () => saveState({ ...state, spin: { active: true, a: $('#spinA').value || 'Option A', b: $('#spinB').value || 'Option B', winner: '' } }));

  on('[data-event]', 'click', e => {
    const type = e.currentTarget.dataset.event;
    if (type === 'spin') {
      saveState({ ...state, spin: { active: true, a: $('#spinA').value || 'Option A', b: $('#spinB').value || 'Option B', winner: '' } });
    } else {
      saveState({ ...state, event: type });
    }
  });

  on('[data-buyer]', 'input', e => {
    const i = Number(e.currentTarget.dataset.buyer);
    const teams = [...state.teams];
    teams[i] = { ...teams[i], buyer: e.currentTarget.value };
    saveState({ ...state, teams });
  });

  on('[data-sold]', 'change', e => {
    const i = Number(e.currentTarget.dataset.sold);
    const teams = [...state.teams];
    teams[i] = { ...teams[i], sold: e.currentTarget.checked };
    saveState({ ...state, teams });
  });

  on('[data-chaser-team]', 'change', e => {
    const i = Number(e.currentTarget.dataset.chaserTeam);
    const teams = [...state.teams];
    teams[i] = { ...teams[i], chaser: e.currentTarget.checked };
    saveState({ ...state, teams });
  });

  on('[data-chaser-winner]', 'input', e => {
    const i = Number(e.currentTarget.dataset.chaserWinner);
    const chasers = [...state.chasers];
    chasers[i] = { ...chasers[i], winner: e.currentTarget.value };
    saveState({ ...state, chasers });
  });

  on('[data-chaser-pick]', 'change', e => {
    const i = Number(e.currentTarget.dataset.chaserPick);
    const chasers = [...state.chasers];
    chasers[i] = { ...chasers[i], team: e.currentTarget.value };
    let teams = state.teams.map(t => ({ ...t }));
    teams = teams.map(t => t.name === e.currentTarget.value ? { ...t, chaser: true, sold: true } : t);
    saveState({ ...state, chasers, teams });
  });
}

function render() {
  renderOverlay();
  renderControl();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

render();
