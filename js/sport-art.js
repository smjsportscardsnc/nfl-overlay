// Animated motion graphics for the side panels (top.html and side-left/right.html).
// Each piece is inline SVG that animates itself with SMIL, so it runs as soon as it is
// on screen. Ids are unique per piece so two panels can share one page.
(function(){
  const svg=(body,defs="")=>`<svg viewBox="0 0 200 200" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
  const glow=(id,sd=3)=>`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  const grad=(id,c1,c2,c3)=>`<radialGradient id="${id}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="${c1}"/><stop offset=".6" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient>`;
  const lin=(id,c1,c2)=>`<linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  // short sparks flashing outward from (cx,cy), once per cycle
  const sparks=(cx,cy,n,r1,r2,color,begin,dur)=>{
    let s="";
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2+(i%2?0.18:0),c=Math.cos(a),d=Math.sin(a);
      s+=`<line x1="${(cx+c*r1).toFixed(1)}" y1="${(cy+d*r1).toFixed(1)}" x2="${(cx+c*r2).toFixed(1)}" y2="${(cy+d*r2).toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;.2;1" dur="${dur}" begin="${begin}" repeatCount="indefinite"/></line>`;
    }
    return s;
  };
  // ice spray thrown back from the puck
  const spray=[[60,128,14,110,0],[56,137,12,132,.25],[64,122,18,104,.45],[52,132,10,126,.15]].map(([x,y,tx,ty,b])=>
    `<circle cx="${x}" cy="${y}" r="2.4"><animate attributeName="cx" values="${x};${tx}" dur=".7s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="cy" values="${y};${ty}" dur=".7s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur=".7s" begin="${b}s" repeatCount="indefinite"/></circle>`).join("");
  const football=(id)=>`<g transform="rotate(-32)"><ellipse rx="34" ry="19" fill="url(#${id})" stroke="#2e1406" stroke-width="2"/><path d="M-22 0H22M-16-5V5M-8-7V7M0-7V7M8-7V7M16-5V5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>`;

  // FOOTBALL, left: a spiral arcs across with a glowing trail
  const fbL=svg(`
    <path id="fbPathL" d="M14 160Q92-4 186 52" fill="none"/>
    <path d="M14 160Q92-4 186 52" fill="none" stroke="#ffd54a" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 14"><animate attributeName="stroke-dashoffset" from="0" to="-68" dur=".9s" repeatCount="indefinite"/></path>
    <circle cx="14" cy="160" r="4" fill="#fff"><animate attributeName="r" values="3;12;3" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <g filter="url(#glFbL)"><g>
      <animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto"><mpath href="#fbPathL"/></animateMotion>
      ${football("gFbL")}
    </g></g>`, glow("glFbL")+grad("gFbL","#d9864a","#8a3f15","#3a1807"));

  // FOOTBALL, right: a kick through the uprights, the posts flash on the score
  const fbR=svg(`
    <g filter="url(#glFbR)" fill="none" stroke="#ffd54a" stroke-linecap="round" stroke-width="7">
      <g><animate attributeName="opacity" values=".55;1;.55" dur="2.8s" repeatCount="indefinite"/>
        <path d="M40 18V70H160V18"/><path d="M100 70V180"/>
      </g>
    </g>
    <ellipse cx="100" cy="182" rx="36" ry="5" fill="#000" opacity=".45"/>
    <g filter="url(#glFbR)"><g>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.58;.62;1" dur="2.8s" repeatCount="indefinite"/>
      <g><animateMotion path="M22 178Q100-62 178 178" dur="2.8s" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear" repeatCount="indefinite"/>
        ${football("gFbR")}
      </g>
    </g></g>
    ${sparks(100,50,16,20,46,"#ffd54a","1.7s","2.8s")}`, glow("glFbR",2)+grad("gFbR","#d9864a","#8a3f15","#3a1807"));

  // BASKETBALL, left: a dribble, with a shockwave on each bounce
  const bbL=svg(`
    <ellipse cx="100" cy="166" rx="46" ry="7" fill="#000" opacity=".5"><animate attributeName="rx" values="46;24;46" keyTimes="0;.5;1" dur="1.2s" repeatCount="indefinite"/></ellipse>
    <circle cx="100" cy="166" r="8" fill="none" stroke="#ffb074" stroke-width="3"><animate attributeName="r" values="8;62" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.2s" repeatCount="indefinite"/></circle>
    <g filter="url(#glBbL)"><g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -74;0 0" keyTimes="0;.5;1" calcMode="spline" keySplines=".33 0 .67 1;.33 0 .67 1" dur="1.2s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="0 100 132;200 100 132" dur="1.2s" repeatCount="indefinite"/>
        <circle cx="100" cy="132" r="34" fill="url(#gBbL)" stroke="#2a1404" stroke-width="2.5"/>
        <path d="M100 98V166M66 132H134M72 106Q100 132 72 158M128 106Q100 132 128 158" fill="none" stroke="#2a1404" stroke-width="3"/>
      </g>
    </g></g>`, glow("glBbL")+grad("gBbL","#ffa04a","#e2650f","#9c3f05"));

  // BASKETBALL, right: the ball drops through the net, the net snaps back
  const bbR=svg(`
    <ellipse cx="100" cy="112" rx="36" ry="7" fill="none" stroke="#ff7a2a" stroke-width="5" filter="url(#glBbR)"><animate attributeName="opacity" values=".45;1;.45" dur="1.6s" repeatCount="indefinite"/></ellipse>
    <rect x="34" y="14" width="132" height="84" rx="8" fill="rgba(255,255,255,.93)" stroke="#ff7a2a" stroke-width="4"/>
    <rect x="76" y="48" width="48" height="34" fill="none" stroke="#ff7a2a" stroke-width="4"/>
    <g filter="url(#glBbR)"><g>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.4;.5;1" dur="2.4s" repeatCount="indefinite"/>
      <g>
        <animateMotion path="M0 0V126" dur="2.4s" keyPoints="0;1;1" keyTimes="0;.45;1" calcMode="linear" repeatCount="indefinite"/>
        <circle cx="100" cy="22" r="15" fill="url(#gBbR)" stroke="#2a1404" stroke-width="2"/>
        <path d="M100 9V35M86 22H114" fill="none" stroke="#2a1404" stroke-width="2.2"/>
      </g>
    </g></g>
    <g transform="translate(100 112)"><g>
      <animateTransform attributeName="transform" type="scale" values="1 1;1 1.14;1 1;1 1" keyTimes="0;.35;.6;1" dur="2.4s" repeatCount="indefinite"/>
      <path d="M-30 0L-18 58M-14 2L-8 58M0 2V58M14 2L8 58M30 0L18 58M-27 20Q0 30 27 20M-23 40Q0 50 23 40M-18 58H18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".9"/>
    </g></g>
    ${sparks(100,112,10,38,52,"#ffb074","0.9s","2.4s")}`, glow("glBbR",2)+grad("gBbR","#ffa04a","#e2650f","#9c3f05"));

  // BASEBALL, left: a pitch crosses the plate and the strike zone lights up
  const bsL=svg(`
    <rect x="70" y="66" width="60" height="74" rx="4" fill="rgba(255,205,80,.06)" stroke="#ffd54a" stroke-width="2.5" stroke-dasharray="6 5"><animate attributeName="stroke-opacity" values=".35;1;.35" keyTimes="0;.6;1" dur="1.8s" repeatCount="indefinite"/></rect>
    <path d="M22 34Q96 26 102 104" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 12"><animate attributeName="stroke-dashoffset" from="0" to="-64" dur=".7s" repeatCount="indefinite"/></path>
    <g filter="url(#glBsL)"><g>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.6;.66;1" dur="1.8s" repeatCount="indefinite"/>
      <g>
        <animateMotion path="M22 34Q96 26 102 104" dur="1.8s" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear" repeatCount="indefinite"/>
        <circle r="13" fill="url(#gBsL)" stroke="#b9b9b9" stroke-width="1.5"/>
        <path d="M-7-10Q-2 0-7 10M7-10Q2 0 7 10" fill="none" stroke="#d01f2f" stroke-width="2"/>
      </g>
    </g></g>`, glow("glBsL",2)+grad("gBsL","#ffffff","#ececec","#bdbdbd"));

  // BASEBALL, right: a swing, a flash at contact, the ball leaves the bat
  const bsR=svg(`
    <path d="M-3 108A84 84 0 0 1 143 192" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 9"><animate attributeName="stroke-dashoffset" from="0" to="-56" dur="0.9s" repeatCount="indefinite"/></path>
    <g filter="url(#glBsR)"><g transform="translate(70 150)"><g>
      <animateTransform attributeName="transform" type="rotate" values="-150;-30;40;40" keyTimes="0;.5;.8;1" calcMode="spline" keySplines=".5 0 1 1;0 0 .5 1;0 0 1 1" dur="1.8s" repeatCount="indefinite"/>
      <path d="M0-4L20-6Q70-12 84-4Q92 0 84 4Q70 12 20 6L0 4Z" fill="url(#gBsR)" stroke="#6b4419" stroke-width="1.5"/>
    </g></g></g>
    <g transform="translate(146 106)"><g>
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.49;.5;.8;1" dur="1.8s" repeatCount="indefinite"/>
      <g><animateMotion path="M0 0L70-62" dur="1.8s" keyPoints="0;0;1" keyTimes="0;.5;1" calcMode="linear" repeatCount="indefinite"/>
        <circle r="12" fill="url(#gBsB)" stroke="#b9b9b9" stroke-width="1.2"/>
        <path d="M-6-9Q-1 0-6 9M6-9Q1 0 6 9" fill="none" stroke="#d01f2f" stroke-width="1.8"/>
      </g>
    </g></g>
    ${sparks(146,106,12,8,34,"#fff1b8","0.9s","1.8s")}`, glow("glBsR",2)+lin("gBsR","#c58a45","#f5d59a")+grad("gBsB","#ffffff","#ececec","#bdbdbd"));

  // HOCKEY, left: the puck slides across the ice and throws spray
  const hkL=svg(`
    <path d="M8 146H192" stroke="#8fb3c9" stroke-width="2" stroke-opacity=".5"/>
    <path d="M8 158H192" stroke="#8fb3c9" stroke-width="1" stroke-opacity=".35"/>
    <g filter="url(#glHkL)"><g>
      <animateTransform attributeName="transform" type="translate" values="-70 0;70 0;70 0" keyTimes="0;.7;1" calcMode="spline" keySplines=".2 0 .4 1;0 0 1 1" dur="2s" repeatCount="indefinite"/>
      <g>
        <ellipse cx="100" cy="130" rx="46" ry="13" fill="#050608"/>
        <ellipse cx="100" cy="124" rx="46" ry="13" fill="url(#gHkL)" stroke="#3a3e47" stroke-width="2"/>
        <ellipse cx="100" cy="124" rx="28" ry="7" fill="none" stroke="#5b616d" stroke-width="2"/>
        <path d="M70 118Q96 110 124 120" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <g fill="#e6f7ff">${spray}</g>
    </g></g>`, glow("glHkL",2)+grad("gHkL","#4a4f59","#23262c","#0b0c0f"));

  // HOCKEY, right: a slap shot from the wind-up, the puck flies off the blade
  const hkR=svg(`
    <g filter="url(#glHkR)">
      <g transform="translate(60 40)"><g>
        <animateTransform attributeName="transform" type="rotate" values="40;0;-30;-30" keyTimes="0;.5;.7;1" calcMode="spline" keySplines=".4 0 1 1;0 0 .6 1;0 0 1 1" dur="2s" repeatCount="indefinite"/>
        <path d="M0 0Q30 40 60 92" fill="none" stroke="url(#gStk)" stroke-width="11" stroke-linecap="round"/>
        <path d="M60 92H98" fill="none" stroke="#111" stroke-width="11" stroke-linecap="round"/>
      </g></g>
      <g transform="translate(120 132)"><g>
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.8;.9;1" dur="2s" repeatCount="indefinite"/>
        <g><animateMotion path="M0 0L70-18" dur="2s" keyPoints="0;0;1" keyTimes="0;.5;.85" calcMode="linear" repeatCount="indefinite"/>
          <ellipse rx="14" ry="6" fill="#0b0c0f" stroke="#444" stroke-width="1.2"/>
        </g>
      </g></g>
    </g>
    ${sparks(120,132,12,8,30,"#9be7ff","1s","2s")}`, glow("glHkR",2)+lin("gStk","#e8c38c","#b88446"));

  window.SMJ_SPORT_ART={
    football:{word:"FOOTBALL",left:{art:fbL,tag:"GAME DAY"},right:{art:fbR,tag:"TOUCHDOWN"}},
    basketball:{word:"BASKETBALL",left:{art:bbL,tag:"TIP-OFF"},right:{art:bbR,tag:"NOTHING BUT NET"}},
    baseball:{word:"BASEBALL",left:{art:bsL,tag:"FIRST PITCH"},right:{art:bsR,tag:"PLAY BALL"}},
    hockey:{word:"HOCKEY",left:{art:hkL,tag:"PUCK DROP"},right:{art:hkR,tag:"GAME ON"}}
  };
  window.SMJ_LEAGUE_SPORT={nfl:"football",nba:"basketball",wnba:"basketball",mlb:"baseball",nhl:"hockey"};
})();
