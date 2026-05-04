const teamsContainer = document.getElementById("teams");
const videoLayer = document.getElementById("videoLayer");
const animationVideo = document.getElementById("animationVideo");

const state = { buyers: {}, sold: {} };

const videos = {
  stash: "assets/videos/stash-or-pass.mp4",
  spin: "assets/videos/spin-2-choose-1.mp4",
  full: "assets/videos/break-full.mp4",
  hit: "assets/videos/big-hit.mp4"
};

function espnLogo(abbr) {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
}

function renderTeams() {
  teamsContainer.innerHTML = "";
  window.SMJ_TEAMS.forEach((team) => {
    const el = document.createElement("div");
    const key = team.abbr;
    el.className = `team ${state.sold[key] ? "sold" : ""}`;
    el.style.setProperty("--teamColor", team.color);
    el.style.setProperty("--teamGlow", `${team.color}99`);

    const buyer = state.buyers[key] || "Available";

    el.innerHTML = `
      <img src="${espnLogo(team.abbr)}" alt="${team.city} ${team.name} logo" />
      <div class="team-info">
        <div class="team-city">${team.city}</div>
        <div class="team-name">${team.name}</div>
        <div class="buyer">${buyer}</div>
      </div>
    `;

    teamsContainer.appendChild(el);
  });
}

function playVideo(key) {
  const src = videos[key];
  if (!src) return;

  animationVideo.pause();
  animationVideo.currentTime = 0;
  animationVideo.src = src;
  videoLayer.classList.remove("hidden");

  animationVideo.play().catch(() => {
    videoLayer.classList.add("hidden");
  });

  animationVideo.onended = () => {
    videoLayer.classList.add("hidden");
    animationVideo.removeAttribute("src");
  };
}

window.SMJOverlay = {
  setBuyer(abbr, buyer) {
    state.buyers[abbr] = buyer || "Available";
    renderTeams();
  },
  setSold(abbr, sold = true) {
    state.sold[abbr] = sold;
    renderTeams();
  },
  clearAll() {
    state.buyers = {};
    state.sold = {};
    renderTeams();
  },
  playVideo
};

renderTeams();
