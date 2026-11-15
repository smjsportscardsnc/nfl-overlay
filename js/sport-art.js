// Artwork for the side panels next to the facecam (side-left.html / side-right.html).
// The panels pick a sport from the league chosen on the Live Show panel.
(function(){
  // points along a quadratic curve, with short ticks across it (baseball stitches)
  function stitches(x0,y0,cx,cy,x1,y1,n){
    let d="";
    for(let i=1;i<n;i++){
      const t=i/n,u=1-t;
      const x=u*u*x0+2*u*t*cx+t*t*x1,y=u*u*y0+2*u*t*cy+t*t*y1;
      const dx=2*u*(cx-x0)+2*t*(x1-cx),dy=2*u*(cy-y0)+2*t*(y1-cy),l=Math.hypot(dx,dy)||1;
      const nx=-dy/l*7,ny=dx/l*7,ax=dx/l*3,ay=dy/l*3;
      d+=`M${(x-nx-ax).toFixed(1)} ${(y-ny-ay).toFixed(1)}L${(x+ax).toFixed(1)} ${(y+ay).toFixed(1)}M${(x+nx-ax).toFixed(1)} ${(y+ny-ay).toFixed(1)}L${(x+ax).toFixed(1)} ${(y+ay).toFixed(1)}`;
    }
    return d;
  }
  const svg=(body,defs="")=>`<svg viewBox="0 0 200 200" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;

  const football=svg(`
    <g transform="rotate(-32 100 100)">
      <ellipse cx="100" cy="100" rx="90" ry="54" fill="url(#fb)" stroke="#2e1406" stroke-width="4"/>
      <path d="M34 66Q27 100 34 134M166 66Q173 100 166 134" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M68 80H132" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="M76 71V89M88 71V89M100 71V89M112 71V89M124 71V89" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="78" cy="78" rx="34" ry="12" fill="#fff" opacity=".12"/>
    </g>`,
    `<radialGradient id="fb" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#b8642f"/><stop offset=".6" stop-color="#7a3712"/><stop offset="1" stop-color="#4a1f08"/></radialGradient>`);

  const goalpost=svg(`
    <ellipse cx="100" cy="188" rx="46" ry="7" fill="#000" opacity=".35"/>
    <rect x="95" y="112" width="10" height="76" rx="3" fill="url(#gp)"/>
    <rect x="34" y="104" width="132" height="10" rx="4" fill="url(#gp)"/>
    <rect x="34" y="14" width="10" height="98" rx="4" fill="url(#gp)"/>
    <rect x="156" y="14" width="10" height="98" rx="4" fill="url(#gp)"/>
    <path d="M38 14V6M160 14V6" stroke="#e0222f" stroke-width="6" stroke-linecap="round"/>
    <g class="kick"><g transform="rotate(-20 100 56)">
      <ellipse cx="100" cy="56" rx="22" ry="13" fill="#7a3712" stroke="#2e1406" stroke-width="2.5"/>
      <path d="M88 52H112M94 48V56M100 48V56M106 48V56" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    </g></g>`,
    `<linearGradient id="gp" x1="0" x2="1"><stop offset="0" stop-color="#ffd54a"/><stop offset=".5" stop-color="#fff2a8"/><stop offset="1" stop-color="#e6b300"/></linearGradient>`);

  const basketball=svg(`
    <circle cx="100" cy="100" r="86" fill="url(#bb)" stroke="#2a1404" stroke-width="4"/>
    <path d="M100 14V186M14 100H186M44 36Q84 100 44 164M156 36Q116 100 156 164" stroke="#2a1404" stroke-width="5" fill="none"/>
    <ellipse cx="72" cy="62" rx="30" ry="18" fill="#fff" opacity=".14" transform="rotate(-30 72 62)"/>`,
    `<radialGradient id="bb" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#ffa04a"/><stop offset=".65" stop-color="#e2650f"/><stop offset="1" stop-color="#9c3f05"/></radialGradient>`);

  const hoop=svg(`
    <rect x="36" y="12" width="128" height="86" rx="8" fill="rgba(255,255,255,.92)" stroke="#e0222f" stroke-width="4"/>
    <rect x="76" y="50" width="48" height="36" fill="none" stroke="#e0222f" stroke-width="4"/>
    <rect x="94" y="98" width="12" height="10" fill="#555"/>
    <g class="swish">
      <path d="M68 112L80 172M84 114L90 172M100 114V172M116 114L110 172M132 112L120 172M72 130Q100 140 128 130M76 150Q100 158 124 150M80 170H120" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    <ellipse cx="100" cy="112" rx="34" ry="7" fill="none" stroke="#ff5a1f" stroke-width="6"/>`);

  const baseball=svg(`
    <circle cx="100" cy="100" r="86" fill="url(#bs)" stroke="#b9b9b9" stroke-width="3"/>
    <path d="M44 30Q90 100 44 170M156 30Q110 100 156 170" stroke="#d01f2f" stroke-width="3" fill="none"/>
    <path d="${stitches(44,30,90,100,44,170,13)}${stitches(156,30,110,100,156,170,13)}" stroke="#d01f2f" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
    `<radialGradient id="bs" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#ececec"/><stop offset="1" stop-color="#c4c4c4"/></radialGradient>`);

  const bat=`<path d="M95 14C90 14 87 20 87 30L93 150L93 170L107 170L107 150L113 30C113 20 110 14 105 14Z" fill="url(#bw)" stroke="#6b4419" stroke-width="2"/><ellipse cx="100" cy="174" rx="11" ry="5" fill="#8a5a26"/><path d="M93 136H107M93 142H107M93 148H107" stroke="#222" stroke-width="3"/>`;
  const bats=svg(`
    <g transform="rotate(-32 100 100)">${bat}</g>
    <g transform="rotate(32 100 100)">${bat}</g>
    <g class="kick"><circle cx="100" cy="46" r="20" fill="#fff" stroke="#bbb" stroke-width="1.5"/><path d="M88 32Q98 46 88 60M112 32Q102 46 112 60" stroke="#d01f2f" stroke-width="2" fill="none"/></g>`,
    `<linearGradient id="bw" x1="0" x2="1"><stop offset="0" stop-color="#c58a45"/><stop offset=".45" stop-color="#f0c88c"/><stop offset="1" stop-color="#a86e30"/></linearGradient>`);

  const puck=svg(`
    <ellipse cx="100" cy="128" rx="78" ry="26" fill="#000" opacity=".25"/>
    <path d="M24 92V116A76 25 0 0 0 176 116V92Z" fill="#0d0e11"/>
    <path d="M24 100H176" stroke="#2c2f36" stroke-width="2"/>
    <path d="M24 108H176" stroke="#2c2f36" stroke-width="2"/>
    <ellipse cx="100" cy="92" rx="76" ry="25" fill="url(#pk)" stroke="#3a3e47" stroke-width="2"/>
    <ellipse cx="100" cy="92" rx="48" ry="14" fill="none" stroke="#5b616d" stroke-width="2"/>`,
    `<radialGradient id="pk" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#4a4f59"/><stop offset="1" stop-color="#16181c"/></radialGradient>`);

  const stick=`<path d="M58 14L118 156Q122 166 134 166L176 166Q184 166 184 158Q184 152 176 152L136 150" stroke="url(#st)" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M146 152L176 159" stroke="#111" stroke-width="11" stroke-linecap="round"/>`;
  const sticks=svg(`
    <g>${stick}</g>
    <g transform="translate(200 0) scale(-1 1)">${stick}</g>
    <g class="kick"><ellipse cx="100" cy="178" rx="20" ry="7" fill="#111"/><path d="M80 174V178A20 7 0 0 0 120 178V174" fill="#000"/><ellipse cx="100" cy="174" rx="20" ry="7" fill="#2b2e35"/></g>`,
    `<linearGradient id="st" x1="0" x2="1"><stop offset="0" stop-color="#e8c38c"/><stop offset="1" stop-color="#b88446"/></linearGradient>`);

  window.SMJ_SPORT_ART={
    football:{word:"FOOTBALL",left:{art:football,tag:"GAME DAY"},right:{art:goalpost,tag:"TOUCHDOWN"}},
    basketball:{word:"BASKETBALL",left:{art:basketball,tag:"TIP-OFF"},right:{art:hoop,tag:"NOTHING BUT NET"}},
    baseball:{word:"BASEBALL",left:{art:baseball,tag:"FIRST PITCH"},right:{art:bats,tag:"PLAY BALL"}},
    hockey:{word:"HOCKEY",left:{art:puck,tag:"PUCK DROP"},right:{art:sticks,tag:"GAME ON"}}
  };
  window.SMJ_LEAGUE_SPORT={nfl:"football",nba:"basketball",wnba:"basketball",mlb:"baseball",nhl:"hockey"};
})();
