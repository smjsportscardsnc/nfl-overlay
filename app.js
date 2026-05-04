const NFL_TEAMS = [
  { name: 'Cardinals', city: 'Arizona', abbr: 'ari', color: '#97233F' },
  { name: 'Falcons', city: 'Atlanta', abbr: 'atl', color: '#A71930' },
  { name: 'Ravens', city: 'Baltimore', abbr: 'bal', color: '#241773' },
  { name: 'Bills', city: 'Buffalo', abbr: 'buf', color: '#00338D' },
  { name: 'Panthers', city: 'Carolina', abbr: 'car', color: '#0085CA' },
  { name: 'Bears', city: 'Chicago', abbr: 'chi', color: '#0B162A' },
  { name: 'Bengals', city: 'Cincinnati', abbr: 'cin', color: '#FB4F14' },
  { name: 'Browns', city: 'Cleveland', abbr: 'cle', color: '#311D00' },
  { name: 'Cowboys', city: 'Dallas', abbr: 'dal', color: '#041E42' },
  { name: 'Broncos', city: 'Denver', abbr: 'den', color: '#FB4F14' },
  { name: 'Lions', city: 'Detroit', abbr: 'det', color: '#0076B6' },
  { name: 'Packers', city: 'Green Bay', abbr: 'gb', color: '#203731' },
  { name: 'Texans', city: 'Houston', abbr: 'hou', color: '#03202F' },
  { name: 'Colts', city: 'Indianapolis', abbr: 'ind', color: '#002C5F' },
  { name: 'Jaguars', city: 'Jacksonville', abbr: 'jax', color: '#006778' },
  { name: 'Chiefs', city: 'Kansas City', abbr: 'kc', color: '#E31837' },
  { name: 'Raiders', city: 'Las Vegas', abbr: 'lv', color: '#000000' },
  { name: 'Chargers', city: 'Los Angeles', abbr: 'lac', color: '#0080C6' },
  { name: 'Rams', city: 'Los Angeles', abbr: 'lar', color: '#003594' },
  { name: 'Dolphins', city: 'Miami', abbr: 'mia', color: '#008E97' },
  { name: 'Vikings', city: 'Minnesota', abbr: 'min', color: '#4F2683' },
  { name: 'Patriots', city: 'New England', abbr: 'ne', color: '#002244' },
  { name: 'Saints', city: 'New Orleans', abbr: 'no', color: '#D3BC8D' },
  { name: 'Giants', city: 'New York', abbr: 'nyg', color: '#0B2265' },
  { name: 'Jets', city: 'New York', abbr: 'nyj', color: '#125740' },
  { name: 'Eagles', city: 'Philadelphia', abbr: 'phi', color: '#004C54' },
  { name: 'Steelers', city: 'Pittsburgh', abbr: 'pit', color: '#FFB612' },
  { name: '49ers', city: 'San Francisco', abbr: 'sf', color: '#AA0000' },
  { name: 'Seahawks', city: 'Seattle', abbr: 'sea', color: '#002244' },
  { name: 'Buccaneers', city: 'Tampa Bay', abbr: 'tb', color: '#D50A0A' },
  { name: 'Titans', city: 'Tennessee', abbr: 'ten', color: '#0C2340' },
  { name: 'Commanders', city: 'Washington', abbr: 'wsh', color: '#5A1414' }
];

const logoUrl = abbr => `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;

const DEFAULT_STATE = {
  title: 'SMJ NFL Mixer Break',
  ticker: 'Welcome to SMJ Sports Cards & Collectibles!',
  teams: NFL_TEAMS.map(team => ({ ...team, buyer: '', sold: false })),
  event: null,
  spin: { active: false, a: 'Stash', b: 'Pass', winner: '' },
  nonce: 0
};

let state = loadState();
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('smj-overlay') : null;

function normalizeState(raw) {
  const byName = new Map((raw?.teams || []).map(t => [t.name, t]));
  return {
    ...DEFAULT_STATE,
    ...raw,
    teams: NFL_TEAMS.map(team => ({ ...team, buyer: byName.get(team.name)?.buyer || '', sold: Boolean(byName.get(team.name)?.sold) })),
    spin: { ...DEFAULT_STATE.spin, ...(raw?.spin || {}) }
  };
}

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem('smjOverlayState') || '{}')); }
  catch { return structuredClone(DEFAULT_STATE); }
}

function saveState(next) {
  state = normalizeState({ ...next, nonce: Date.now() });
  localStorage.setItem('smjOverlayState', JSON.stringify(state));
  channel?.postMessage(state);
  render();
}

channel?.addEventListener('message', event => {
  state = normalizeState(event.data);
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
    <div class="team-tile ${team.sold ? 'sold' : ''}" data-team-index="${i}" style="--team-color:${team.color}">
      <div class="logo-plate"><img src="${logoUrl(team.abbr)}" alt="${escapeAttr(team.city)} ${escapeAttr(team.name)} logo" /></div>
      <div class="team-copy">
        <div class="team-city">${escapeHtml(team.city)}</div>
        <div class="team-name">${escapeHtml(team.name)}</div>
        <div class="buyer-name">${escapeHtml(team.buyer || 'Available')}</div>
      </div>
    </div>
  `).join('');

  const sold = state.teams.filter(t => t.sold).length;
  $('#soldCount').textContent = `${sold}/32`;
  $('#statusText').textContent = sold === 32 ? 'Full' : 'Live';

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
    full: ['BREAK STATUS', 'BREAK FULL', 'Let’s rip!'],
    giveaway: ['SMJ GIVEAWAY', 'WINNER!', 'Congrats from SMJ!'],
    fire: ['SMJ HIT CAM', 'BIG HIT!', 'That one is going on the board!']
  }[state.event] || ['SMJ', String(state.event).toUpperCase(), 'Let’s go!'];

  $('#eventKicker').textContent = copy[0];
  $('#eventTitle').textContent = copy[1];
  $('#eventSubtitle').textContent = copy[2];
  layer.classList.remove('hidden');

  clearTimeout(window.__eventTimer);
  window.__eventTimer = setTimeout(() => {
    const current = loadState();
    if (current.event === state.event) saveState({ ...current, event: null });
  }, 5200);
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
  }, 2600);

  clearTimeout(window.__spinClearTimer);
  window.__spinClearTimer = setTimeout(() => {
    const current = loadState();
    if (current.spin?.active) saveState({ ...current, spin: { ...current.spin, active: false } });
  }, 7800);
}

function renderControl() {
  if (!$('#teamControls')) return;

  $('#titleInput').value = state.title;
  $('#tickerInput').value = state.ticker;
  $('#spinA').value = state.spin?.a || 'Stash';
  $('#spinB').value = state.spin?.b || 'Pass';

  $('#teamControls').innerHTML = state.teams.map((team, i) => `
    <div class="team-control" style="--team-color:${team.color}">
      <div class="team-control-title">
        <img src="${logoUrl(team.abbr)}" alt="" />
        <span>${escapeHtml(team.city)} ${escapeHtml(team.name)}</span>
        <input type="checkbox" data-sold="${i}" ${team.sold ? 'checked' : ''}>
      </div>
      <input placeholder="Buyer username" data-buyer="${i}" value="${escapeAttr(team.buyer)}">
    </div>
  `).join('');

  bindControlEvents();
}

function bindControlEvents() {
  $('#saveInfoBtn')?.addEventListener('click', () => saveState({ ...state, title: $('#titleInput').value, ticker: $('#tickerInput').value }));
  $('#resetBtn')?.addEventListener('click', () => saveState(structuredClone(DEFAULT_STATE)));
  $('#clearEventBtn')?.addEventListener('click', () => saveState({ ...state, event: null, spin: { ...state.spin, active: false } }));
  $('#spinBtn')?.addEventListener('click', () => saveState({ ...state, spin: { active: true, a: $('#spinA').value || 'Option A', b: $('#spinB').value || 'Option B', winner: '' } }));

  on('[data-event]', 'click', e => saveState({ ...state, event: e.currentTarget.dataset.event }));

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
