
const teams = [
["Arizona Cardinals","22"],
["Atlanta Falcons","1"],
["Baltimore Ravens","33"],
["Buffalo Bills","2"],
["Carolina Panthers","29"],
["Chicago Bears","3"],
["Cincinnati Bengals","4"],
["Dallas Cowboys","6"]
];

const container = document.getElementById('teams');

teams.forEach(t => {
  const div = document.createElement('div');
  div.className = 'team';

  // ESPN CDN logos
  const logo = `https://a.espncdn.com/i/teamlogos/nfl/500/${t[1]}.png`;

  div.innerHTML = `
    <img src="${logo}">
    <div class="team-name">${t[0]}</div>
  `;

  container.appendChild(div);
});
