// Locker room side panels (top.html, side-left.html, side-right.html).
// Each panel is one locker stall with a legend's jersey hanging in it and a brass name
// plate above. Jerseys are generic: team colours, name and number only, no team logos.
(function(){
  // n name, no number, b body, num number colour, o number outline, t trim, t2 second trim, pin pinstripe
  const GREATS={
    nfl:[
      {n:"BRADY",no:"12",b:"#0b2240",num:"#ffffff",o:"#c60c30",t:"#c60c30"},
      {n:"MONTANA",no:"16",b:"#aa0000",num:"#ffffff",o:"#b3995d",t:"#b3995d"},
      {n:"PAYTON",no:"34",b:"#0b162a",num:"#ffffff",o:"#c83803",t:"#c83803"},
      {n:"RICE",no:"80",b:"#f2f1ec",num:"#aa0000",o:"#b3995d",t:"#aa0000"},
      {n:"BROWN",no:"32",b:"#311d00",num:"#ffffff",o:"#ff3c00",t:"#ff3c00"},
      {n:"TAYLOR",no:"56",b:"#0b2265",num:"#ffffff",o:"#a71930",t:"#a71930"},
      {n:"MANNING",no:"18",b:"#002c5f",num:"#ffffff",o:"#002c5f",t:"#ffffff"},
      {n:"SANDERS",no:"20",b:"#0076b6",num:"#ffffff",o:"#b0b7bc",t:"#b0b7bc"}
    ],
    nba:[
      {n:"JORDAN",no:"23",b:"#ce1141",num:"#ffffff",o:"#000000",t:"#000000"},
      {n:"BRYANT",no:"24",b:"#fdb927",num:"#552583",o:"#ffffff",t:"#552583"},
      {n:"JAMES",no:"23",b:"#6f263d",num:"#ffb81c",o:"#ffffff",t:"#ffb81c"},
      {n:"BIRD",no:"33",b:"#007a33",num:"#ffffff",o:"#007a33",t:"#ffffff"},
      {n:"ABDUL-JABBAR",no:"33",b:"#552583",num:"#fdb927",o:"#ffffff",t:"#fdb927"},
      {n:"RUSSELL",no:"6",b:"#f4f4f2",num:"#007a33",o:"#007a33",t:"#007a33"},
      {n:"JOHNSON",no:"32",b:"#f4f4f2",num:"#552583",o:"#fdb927",t:"#552583"},
      {n:"CURRY",no:"30",b:"#1d428a",num:"#ffc72c",o:"#ffffff",t:"#ffc72c"}
    ],
    wnba:[
      {n:"TAURASI",no:"3",b:"#201747",num:"#e56020",o:"#ffffff",t:"#e56020"},
      {n:"BIRD",no:"10",b:"#2c5235",num:"#fee11a",o:"#ffffff",t:"#fee11a"},
      {n:"PARKER",no:"21",b:"#702f8a",num:"#ffc72c",o:"#ffffff",t:"#ffc72c"},
      {n:"MOORE",no:"23",b:"#0c2340",num:"#ffffff",o:"#78be20",t:"#78be20"},
      {n:"LESLIE",no:"9",b:"#ffc72c",num:"#702f8a",o:"#ffffff",t:"#702f8a"},
      {n:"CATCHINGS",no:"24",b:"#002d62",num:"#e03a3e",o:"#fdbb30",t:"#e03a3e"},
      {n:"SWOOPES",no:"22",b:"#c8102e",num:"#ffffff",o:"#041e42",t:"#041e42"},
      {n:"CLARK",no:"22",b:"#002d62",num:"#ffffff",o:"#e03a3e",t:"#fdbb30"}
    ],
    mlb:[
      {n:"RUTH",no:"3",b:"#f6f4ee",num:"#1c2841",o:"#1c2841",t:"#1c2841",pin:"#1c2841"},
      {n:"AARON",no:"44",b:"#f6f4ee",num:"#13274f",o:"#ce1141",t:"#ce1141"},
      {n:"MAYS",no:"24",b:"#f3efe3",num:"#27251f",o:"#fd5a1e",t:"#fd5a1e"},
      {n:"ROBINSON",no:"42",b:"#f6f4ee",num:"#005a9c",o:"#005a9c",t:"#005a9c"},
      {n:"JETER",no:"2",b:"#f6f4ee",num:"#1c2841",o:"#1c2841",t:"#1c2841",pin:"#1c2841"},
      {n:"CLEMENTE",no:"21",b:"#f6f4ee",num:"#27251f",o:"#fdb827",t:"#fdb827"},
      {n:"GRIFFEY JR",no:"24",b:"#0c2c56",num:"#c4ced4",o:"#005c5c",t:"#005c5c"},
      {n:"GEHRIG",no:"4",b:"#f6f4ee",num:"#1c2841",o:"#1c2841",t:"#1c2841",pin:"#1c2841"}
    ],
    nhl:[
      {n:"GRETZKY",no:"99",b:"#041e42",num:"#ffffff",o:"#ff4c00",t:"#ff4c00",t2:"#ffffff"},
      {n:"LEMIEUX",no:"66",b:"#fcb514",num:"#111111",o:"#ffffff",t:"#111111",t2:"#ffffff"},
      {n:"ORR",no:"4",b:"#f4f4f2",num:"#111111",o:"#fcb514",t:"#111111",t2:"#fcb514"},
      {n:"HOWE",no:"9",b:"#ce1126",num:"#ffffff",o:"#ce1126",t:"#ffffff",t2:"#ce1126"},
      {n:"CROSBY",no:"87",b:"#111111",num:"#fcb514",o:"#ffffff",t:"#fcb514",t2:"#ffffff"},
      {n:"OVECHKIN",no:"8",b:"#c8102e",num:"#ffffff",o:"#041e42",t:"#041e42",t2:"#ffffff"},
      {n:"ROY",no:"33",b:"#af1e2d",num:"#ffffff",o:"#192168",t:"#192168",t2:"#ffffff"},
      {n:"MESSIER",no:"11",b:"#0038a8",num:"#ffffff",o:"#ce1126",t:"#ce1126",t2:"#ffffff"}
    ]
  };
  const SPORT={nfl:"football",nba:"basketball",wnba:"basketball",mlb:"baseball",nhl:"hockey"};

  // jersey backs, drawn with the hanger hook's apex at (0,-26)
  const SHAPES={
    football:{d:"M-16 0Q0 6 16 0L50 6Q70 10 76 24L82 56L58 64L55 60L54 168Q0 176-54 168L-55 60L-58 64L-82 56L-76 24Q-70 10-50 6Z",s:.86,name:"M-40 36Q0 28 40 36",numY:140,numSize:62,mesh:1},
    basketball:{d:"M-34 0L-18 0Q0 14 18 0L34 0C36 28 56 44 58 62L56 168Q0 176-56 168L-58 62C-56 44-36 28-34 0Z",s:.9,name:"M-34 48Q0 40 34 48",numY:140,numSize:58,mesh:1},
    baseball:{d:"M-15 0Q0 5 15 0L48 8Q60 12 70 22L84 52L62 62L58 56L57 170Q0 176-57 170L-58 56L-62 62L-84 52L-70 22Q-60 12-48 8Z",s:.86,name:"M-38 38Q0 30 38 38",numY:138,numSize:56},
    hockey:{d:"M-16 0Q0 6 16 0L52 6Q72 10 82 26L100 94L80 104L60 62L60 170Q0 176-60 170L-60 62L-80 104L-100 94L-82 26Q-72 10-52 6Z",s:.74,name:"M-40 40Q0 32 40 40",numY:136,numSize:58}
  };
  const DECO={
    football:g=>`<path d="M80 47L57 55M79 40L57 48M-80 47L-57 55M-79 40L-57 48" stroke="${g.t}" stroke-width="4" fill="none"/><path d="M-16 0Q0 6 16 0" stroke="${g.t}" stroke-width="6" fill="none"/>`,
    basketball:g=>`<path d="M-18 0Q0 14 18 0M34 0C36 28 56 44 58 62M-34 0C-36 28-56 44-58 62" stroke="${g.t}" stroke-width="7" fill="none"/><path d="M57 72V170M-57 72V170" stroke="${g.t}" stroke-width="8"/>`,
    baseball:g=>`<path d="M84 52L62 62M-84 52L-62 62" stroke="${g.t}" stroke-width="5" fill="none"/><path d="M-15 0Q0 5 15 0" stroke="${g.t}" stroke-width="5" fill="none"/>`,
    hockey:g=>`<rect x="-120" y="150" width="240" height="10" fill="${g.t}"/><rect x="-120" y="163" width="240" height="4" fill="${g.t2||"#fff"}"/><path d="M97 80L76 90M-97 80L-76 90" stroke="${g.t}" stroke-width="8"/><path d="M94 70L73 80M-94 70L-73 80" stroke="${g.t2||"#fff"}" stroke-width="3.5"/><path d="M-16 0Q0 6 16 0" stroke="${g.t}" stroke-width="7" fill="none"/>`
  };
  const FONT="'Big Shoulders Display',Impact,'Arial Narrow',sans-serif";
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function scene(g,sport,uid){
    const S=SHAPES[sport]||SHAPES.football,ty=112+26*S.s,id=k=>`${k}-${uid}`,name=esc(g.n),no=esc(g.no);
    const backFs=Math.min(13,88/(g.n.length*.52)).toFixed(1),plateFs=Math.min(16,96/(g.n.length*.5)).toFixed(1);
    const full=`x="-120" y="-10" width="240" height="200"`;
    const defs=`
      <linearGradient id="${id("wood")}" x1="0" x2="1"><stop offset="0" stop-color="#2e1c11"/><stop offset=".5" stop-color="#4a2f1d"/><stop offset="1" stop-color="#2a190f"/></linearGradient>
      <pattern id="${id("grain")}" width="14" height="348" patternUnits="userSpaceOnUse"><path d="M2 0V348M6.5 0V348M9 0V348M12.5 0V348" stroke="#140a05" stroke-width=".6" opacity=".35"/><path d="M4 0V348M11 0V348" stroke="#7a5034" stroke-width=".5" opacity=".25"/></pattern>
      <radialGradient id="${id("rec")}" cx="50%" cy="20%" r="85%"><stop offset="0" stop-color="#3a2c22"/><stop offset=".6" stop-color="#1b140f"/><stop offset="1" stop-color="#0c0907"/></radialGradient>
      <linearGradient id="${id("brass")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dd97"/><stop offset=".45" stop-color="#c9973e"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
      <linearGradient id="${id("chrome")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#9aa3ad"/><stop offset="1" stop-color="#e2e6ea"/></linearGradient>
      <radialGradient id="${id("spot")}" cx="50%" cy="18%" r="70%"><stop offset="0" stop-color="#ffe9c4" stop-opacity=".38"/><stop offset=".55" stop-color="#ffe9c4" stop-opacity=".06"/><stop offset="1" stop-color="#ffe9c4" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id("cone")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3dc" stop-opacity=".16"/><stop offset="1" stop-color="#fff3dc" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id("vig")}" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
      <linearGradient id="${id("side")}" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".16" stop-color="#000" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
      <linearGradient id="${id("drop")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id("cyl")}" gradientUnits="userSpaceOnUse" x1="-90" x2="90"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset=".78" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
      <linearGradient id="${id("vert")}" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="180"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
      <pattern id="${id("mesh")}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".6" fill="#000" opacity=".22"/></pattern>
      ${g.pin?`<pattern id="${id("pin")}" width="7" height="10" patternUnits="userSpaceOnUse"><rect x="3" width="1" height="10" fill="${g.pin}"/></pattern>`:""}
      <clipPath id="${id("clip")}"><path d="${S.d}"/></clipPath>
      <filter id="${id("blur")}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
      <filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
      <path id="${id("arc")}" d="${S.name}"/>`;

    const stall=`
      <rect width="208" height="348" fill="#0c0a09"/>
      <rect x="6" y="24" width="196" height="324" fill="url(#${id("wood")})"/>
      <rect x="6" y="24" width="196" height="324" fill="url(#${id("grain")})"/>
      <rect x="6" y="24" width="196" height="46" fill="#000" opacity=".25"/>
      <rect x="44" y="34" width="120" height="24" rx="3" fill="url(#${id("brass")})" stroke="#6b4c16" stroke-width="1"/>
      <circle cx="50" cy="46" r="1.6" fill="#6b4c16"/><circle cx="158" cy="46" r="1.6" fill="#6b4c16"/>
      <g font-family="${FONT}" font-weight="900" font-size="${plateFs}" letter-spacing="2" text-anchor="middle">
        <text x="104" y="52.2" fill="#fff4cf" opacity=".5">${name}</text>
        <text x="104" y="51.5" fill="#3b2708">${name}</text>
      </g>
      <rect x="18" y="70" width="172" height="232" fill="url(#${id("rec")})"/>
      <rect x="18" y="92" width="172" height="7" fill="#5a3b25"/><rect x="18" y="92" width="172" height="1.5" fill="#8a6244"/>
      <rect x="18" y="99" width="172" height="26" fill="url(#${id("drop")})"/>
      <rect x="18" y="70" width="172" height="232" fill="url(#${id("side")})"/>
      <path d="M22 112H186" stroke="#c3cad1" stroke-width="3" stroke-linecap="round"/><path d="M22 111H186" stroke="#f4f6f8" stroke-width="1" opacity=".7"/>
      <circle cx="22" cy="112" r="3" fill="#8a929b"/><circle cx="186" cy="112" r="3" fill="#8a929b"/>`;

    const jersey=`
      <g filter="url(#${id("soft")})" opacity=".55" transform="translate(6 10)"><path d="${S.d}" fill="#000"/></g>
      <path d="M-52 8L0-4L52 8" fill="none" stroke="url(#${id("chrome")})" stroke-width="3" stroke-linejoin="round"/>
      <path d="M0-4V-16Q0-26 8-26Q15-26 15-19" fill="none" stroke="url(#${id("chrome")})" stroke-width="2.6" stroke-linecap="round"/>
      <path d="${S.d}" fill="${g.b}"/>
      <g clip-path="url(#${id("clip")})">
        ${g.pin?`<rect ${full} fill="url(#${id("pin")})"/>`:""}
        ${(DECO[sport]||DECO.football)(g)}
        ${S.mesh?`<rect ${full} fill="url(#${id("mesh")})"/>`:""}
        <text font-family="${FONT}" font-weight="900" font-size="${backFs}" letter-spacing="1.2" fill="${g.num}" stroke="${g.o}" stroke-width="1.4" paint-order="stroke" stroke-linejoin="round"><textPath href="#${id("arc")}" startOffset="50%" text-anchor="middle">${name}</textPath></text>
        <g transform="translate(0 ${S.numY}) scale(1.3 1)" font-family="${FONT}" font-weight="900" font-size="${S.numSize}" text-anchor="middle">
          <text x=".8" y="1.6" fill="#000" opacity=".3">${no}</text>
          <text fill="${g.num}" stroke="${g.o}" stroke-width="3.4" paint-order="stroke" stroke-linejoin="round">${no}</text>
        </g>
        <rect ${full} fill="url(#${id("cyl")})"/>
        <rect ${full} fill="url(#${id("vert")})"/>
        <g filter="url(#${id("blur")})" fill="none" stroke-linecap="round">
          <path d="M28 14Q36 84 22 170" stroke="#000" stroke-opacity=".28" stroke-width="9"/>
          <path d="M-30 12Q-38 92-20 170" stroke="#000" stroke-opacity=".22" stroke-width="8"/>
          <path d="M10 22Q15 92 6 170" stroke="#fff" stroke-opacity=".1" stroke-width="7"/>
          <path d="M-48 66Q0 76 48 66" stroke="#000" stroke-opacity=".16" stroke-width="6"/>
        </g>
      </g>`;

    // the jersey swings in on its hanger, then sways a little
    const hung=`
      <g transform="translate(104 ${ty.toFixed(1)}) scale(${S.s})">
        <g><animateTransform attributeName="transform" type="rotate" values="0 0 -26;.8 0 -26;0 0 -26;-.8 0 -26;0 0 -26" dur="7s" begin="2.4s" repeatCount="indefinite"/>
          <g><animateTransform attributeName="transform" type="rotate" values="9 0 -26;-5 0 -26;2.5 0 -26;-1 0 -26;0 0 -26" keyTimes="0;.3;.55;.8;1" dur="2.4s" fill="freeze"/>
            ${jersey}
          </g>
        </g>
      </g>`;

    const bench=`
      <rect x="6" y="300" width="196" height="12" fill="#6a4529"/><rect x="6" y="300" width="196" height="2" fill="#9a6d48"/>
      <rect x="6" y="312" width="196" height="36" fill="#22160e"/>
      <rect x="6" y="312" width="196" height="10" fill="url(#${id("drop")})"/>`;
    const light=`
      <path d="M86 70H122L182 300H26Z" fill="url(#${id("cone")})"/>
      <rect width="208" height="348" fill="url(#${id("spot")})"/>
      <rect width="208" height="348" fill="url(#${id("vig")})"/>`;
    return `<svg viewBox="0 0 208 348" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs>${stall}${hung}${bench}${light}</svg>`;
  }

  window.SMJ_LOCKER={greats:GREATS,sport:SPORT,scene};
})();
