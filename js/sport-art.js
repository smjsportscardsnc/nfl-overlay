// Animated graphics for the side panels (top.html and side-left/right.html).
// Balls and pucks are drawn with shading, texture and real seam or lace detail; each
// piece then moves itself with SMIL, so it runs as soon as it is on screen.
// Ids are unique per piece so two panels can share one page.
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

  // ----- realistic balls and puck, each drawn around (0,0) at radius 34 (puck 46 wide) -----
  const FB="M-44 0Q-30-27 0-25Q30-27 44 0Q30 27 0 25Q-30 27-44 0Z";
  function footballBall(id){
    return {
      defs:`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0632f"/><stop offset=".5" stop-color="#7a3a14"/><stop offset="1" stop-color="#3a1807"/></linearGradient>
        <radialGradient id="${id}h" cx="36%" cy="30%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <pattern id="${id}p" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#000" opacity=".35"/><circle cx="3" cy="3" r=".5" fill="#fff" opacity=".12"/></pattern>`,
      body:`<path d="${FB}" fill="url(#${id})" stroke="#24100a" stroke-width="1.2"/>
        <path d="${FB}" fill="url(#${id}p)"/>
        <path d="M-40-1Q-30-4-24-5M-40 1Q-30 4-24 5" fill="none" stroke="#f4eee4" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
        <path d="M-22 0H22" stroke="#f4eee4" stroke-width="3" stroke-linecap="round"/>
        <path d="M-18-5V5M-9-6V6M0-6V6M9-6V6M18-5V5" stroke="#f4eee4" stroke-width="2.2" stroke-linecap="round"/>
        <path d="${FB}" fill="url(#${id}h)"/>`
    };
  }
  function basketballBall(id){
    return {
      defs:`<radialGradient id="${id}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#ffb070"/><stop offset=".55" stop-color="#e2650f"/><stop offset="1" stop-color="#7a2a02"/></radialGradient>
        <pattern id="${id}p" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><circle cx="1.2" cy="1.2" r=".55" fill="#3a1100" opacity=".4"/></pattern>
        <radialGradient id="${id}h" cx="34%" cy="28%" r="40%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`,
      body:`<circle r="34" fill="url(#${id})"/>
        <circle r="34" fill="url(#${id}p)"/>
        <g fill="none" stroke="#1a0a02" stroke-width="2.6" stroke-linecap="round">
          <path d="M0-34V34M-34 0H34"/>
          <path d="M-24-24Q-2 0-24 24M24-24Q2 0 24 24"/>
        </g>
        <circle r="34" fill="url(#${id}h)"/>
        <circle r="33" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/>`
    };
  }
  function baseballBall(id){
    const seams="M-16-31C6-18 6-8-4 0C-14 8-14 18-6 31M16-31C-6-18-6-8 4 0C14 8 14 18 6 31";
    return {
      defs:`<radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#ebe7de"/><stop offset="1" stop-color="#aaa497"/></radialGradient>`,
      body:`<circle r="34" fill="url(#${id})" stroke="#9c978a" stroke-width="1.2"/>
        <path d="${seams}" fill="none" stroke="#c8242e" stroke-width="1.6" stroke-linecap="round"/>
        <path d="${seams}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="1 2.6"/>
        <circle r="34" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="5"/>`
    };
  }
  function hockeyPuck(id){
    return {
      defs:`<radialGradient id="${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#4a4f59"/><stop offset=".6" stop-color="#22252b"/><stop offset="1" stop-color="#0b0c0f"/></radialGradient>`,
      body:`<path d="M-46 0V6A46 13 0 0 0 46 6V0Z" fill="#0b0c0f"/>
        <ellipse rx="46" ry="13" fill="url(#${id})" stroke="#3a3e47" stroke-width="1.5"/>
        <ellipse rx="30" ry="8" fill="none" stroke="#5b616d" stroke-width="1.6"/>
        <path d="M-30-6Q-6-12 20-8" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.2" stroke-linecap="round"/>`
    };
  }

  // FOOTBALL, left: a spiral arcs across with a glowing trail
  const fbL=(()=>{const b=footballBall("gFbL");return svg(`
    <path id="fbPathL" d="M14 160Q92-4 186 52" fill="none"/>
    <path d="M14 160Q92-4 186 52" fill="none" stroke="#ffd54a" stroke-opacity=".75" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 14"><animate attributeName="stroke-dashoffset" from="0" to="-68" dur=".9s" repeatCount="indefinite"/></path>
    <circle cx="14" cy="160" r="4" fill="#fff"><animate attributeName="r" values="3;12;3" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="2.2s" repeatCount="indefinite"/></circle>
    <g filter="url(#glFbL)"><g>
      <animateMotion dur="2.2s" repeatCount="indefinite" rotate="auto"><mpath href="#fbPathL"/></animateMotion>
      <g transform="rotate(-32) scale(.85)">${b.body}</g>
    </g></g>`, glow("glFbL")+b.defs)})();

  // FOOTBALL, right: a kick through the uprights, the posts flash on the score
  const fbR=(()=>{const b=footballBall("gFbR");return svg(`
    <g filter="url(#glFbR)" fill="none" stroke="#ffd54a" stroke-linecap="round" stroke-width="7">
      <g><animate attributeName="opacity" values=".55;1;.55" dur="2.8s" repeatCount="indefinite"/>
        <path d="M40 18V70H160V18"/><path d="M100 70V180"/>
      </g>
    </g>
    <ellipse cx="100" cy="182" rx="36" ry="5" fill="#000" opacity=".45"/>
    <g filter="url(#glFbR)"><g>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.58;.62;1" dur="2.8s" repeatCount="indefinite"/>
      <g><animateMotion path="M22 178Q100-62 178 178" dur="2.8s" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear" repeatCount="indefinite"/>
        <g transform="rotate(-32) scale(.85)">${b.body}</g>
      </g>
    </g></g>
    ${sparks(100,50,16,20,46,"#ffd54a","1.7s","2.8s")}`, glow("glFbR",2)+b.defs)})();

  // BASKETBALL, left: a dribble, with a shockwave on each bounce
  const bbL=(()=>{const b=basketballBall("gBbL");return svg(`
    <ellipse cx="100" cy="166" rx="46" ry="7" fill="#000" opacity=".5"><animate attributeName="rx" values="46;24;46" keyTimes="0;.5;1" dur="1.2s" repeatCount="indefinite"/></ellipse>
    <circle cx="100" cy="166" r="8" fill="none" stroke="#ffb074" stroke-width="3"><animate attributeName="r" values="8;62" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="1.2s" repeatCount="indefinite"/></circle>
    <g filter="url(#glBbL)"><g>
      <animateTransform attributeName="transform" type="translate" values="0 0;0 -74;0 0" keyTimes="0;.5;1" calcMode="spline" keySplines=".33 0 .67 1;.33 0 .67 1" dur="1.2s" repeatCount="indefinite"/>
      <g transform="translate(100 132)"><g>
        <animateTransform attributeName="transform" type="rotate" values="0;200" dur="1.2s" repeatCount="indefinite"/>
        ${b.body}
      </g></g>
    </g></g>`, glow("glBbL")+b.defs)})();

  // BASKETBALL, right: the ball drops through the net, the net snaps back
  const bbR=(()=>{const b=basketballBall("gBbR");return svg(`
    <ellipse cx="100" cy="112" rx="36" ry="7" fill="none" stroke="#ff7a2a" stroke-width="5" filter="url(#glBbR)"><animate attributeName="opacity" values=".45;1;.45" dur="1.6s" repeatCount="indefinite"/></ellipse>
    <rect x="34" y="14" width="132" height="84" rx="8" fill="rgba(255,255,255,.93)" stroke="#ff7a2a" stroke-width="4"/>
    <rect x="76" y="48" width="48" height="34" fill="none" stroke="#ff7a2a" stroke-width="4"/>
    <g filter="url(#glBbR)"><g>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.4;.5;1" dur="2.4s" repeatCount="indefinite"/>
      <g>
        <animateMotion path="M0 0V126" dur="2.4s" keyPoints="0;1;1" keyTimes="0;.45;1" calcMode="linear" repeatCount="indefinite"/>
        <g transform="translate(100 22) scale(.44)">${b.body}</g>
      </g>
    </g></g>
    <g transform="translate(100 112)"><g>
      <animateTransform attributeName="transform" type="scale" values="1 1;1 1.14;1 1;1 1" keyTimes="0;.35;.6;1" dur="2.4s" repeatCount="indefinite"/>
      <path d="M-30 0L-18 58M-14 2L-8 58M0 2V58M14 2L8 58M30 0L18 58M-27 20Q0 30 27 20M-23 40Q0 50 23 40M-18 58H18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-opacity=".9"/>
    </g></g>
    ${sparks(100,112,10,38,52,"#ffb074","0.9s","2.4s")}`, glow("glBbR",2)+b.defs)})();

  // BASEBALL, left: a pitch crosses the plate and the strike zone lights up
  const bsL=(()=>{const b=baseballBall("gBsL");return svg(`
    <rect x="70" y="66" width="60" height="74" rx="4" fill="rgba(255,205,80,.06)" stroke="#ffd54a" stroke-width="2.5" stroke-dasharray="6 5"><animate attributeName="stroke-opacity" values=".35;1;.35" keyTimes="0;.6;1" dur="1.8s" repeatCount="indefinite"/></rect>
    <path d="M22 34Q96 26 102 104" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 12"><animate attributeName="stroke-dashoffset" from="0" to="-64" dur=".7s" repeatCount="indefinite"/></path>
    <g filter="url(#glBsL)"><g>
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.6;.66;1" dur="1.8s" repeatCount="indefinite"/>
      <g>
        <animateMotion path="M22 34Q96 26 102 104" dur="1.8s" keyPoints="0;1;1" keyTimes="0;.6;1" calcMode="linear" repeatCount="indefinite"/>
        <g transform="scale(.38)">${b.body}</g>
      </g>
    </g></g>`, glow("glBsL",2)+b.defs)})();

  // BASEBALL, right: a swing, a flash at contact, the ball leaves the bat
  const bsR=(()=>{const b=baseballBall("gBsB");return svg(`
    <path d="M-3 108A84 84 0 0 1 143 192" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round" stroke-dasharray="5 9"><animate attributeName="stroke-dashoffset" from="0" to="-56" dur="0.9s" repeatCount="indefinite"/></path>
    <g filter="url(#glBsR)"><g transform="translate(70 150)"><g>
      <animateTransform attributeName="transform" type="rotate" values="-150;-30;40;40" keyTimes="0;.5;.8;1" calcMode="spline" keySplines=".5 0 1 1;0 0 .5 1;0 0 1 1" dur="1.8s" repeatCount="indefinite"/>
      <path d="M0-4L20-6Q70-12 84-4Q92 0 84 4Q70 12 20 6L0 4Z" fill="url(#gBsR)" stroke="#6b4419" stroke-width="1.5"/>
    </g></g></g>
    <g transform="translate(146 106)"><g>
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.49;.5;.8;1" dur="1.8s" repeatCount="indefinite"/>
      <g><animateMotion path="M0 0L70-62" dur="1.8s" keyPoints="0;0;1" keyTimes="0;.5;1" calcMode="linear" repeatCount="indefinite"/>
        <g transform="scale(.36)">${b.body}</g>
      </g>
    </g></g>
    ${sparks(146,106,12,8,34,"#fff1b8","0.9s","1.8s")}`, glow("glBsR",2)+lin("gBsR","#c58a45","#f5d59a")+b.defs)})();

  // HOCKEY, left: the puck slides across the ice and throws spray
  const hkL=(()=>{const p=hockeyPuck("gHkL");return svg(`
    <path d="M8 146H192" stroke="#8fb3c9" stroke-width="2" stroke-opacity=".5"/>
    <path d="M8 158H192" stroke="#8fb3c9" stroke-width="1" stroke-opacity=".35"/>
    <g filter="url(#glHkL)"><g>
      <animateTransform attributeName="transform" type="translate" values="-70 0;70 0;70 0" keyTimes="0;.7;1" calcMode="spline" keySplines=".2 0 .4 1;0 0 1 1" dur="2s" repeatCount="indefinite"/>
      <g transform="translate(100 124)">${p.body}</g>
      <g fill="#e6f7ff">${spray}</g>
    </g></g>`, glow("glHkL",2)+p.defs)})();

  // HOCKEY, right: a slap shot from the wind-up, the puck flies off the blade
  const hkR=(()=>{const p=hockeyPuck("gHkR");return svg(`
    <g filter="url(#glHkR)">
      <g transform="translate(60 40)"><g>
        <animateTransform attributeName="transform" type="rotate" values="40;0;-30;-30" keyTimes="0;.5;.7;1" calcMode="spline" keySplines=".4 0 1 1;0 0 .6 1;0 0 1 1" dur="2s" repeatCount="indefinite"/>
        <path d="M0 0Q30 40 60 92" fill="none" stroke="url(#gStk)" stroke-width="11" stroke-linecap="round"/>
        <path d="M60 92H98" fill="none" stroke="#111" stroke-width="11" stroke-linecap="round"/>
      </g></g>
      <g transform="translate(120 132)"><g>
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.8;.9;1" dur="2s" repeatCount="indefinite"/>
        <g><animateMotion path="M0 0L70-18" dur="2s" keyPoints="0;0;1" keyTimes="0;.5;.85" calcMode="linear" repeatCount="indefinite"/>
          <g transform="scale(.42)">${p.body}</g>
        </g>
      </g></g>
    </g>
    ${sparks(120,132,12,8,30,"#9be7ff","1s","2s")}`, glow("glHkR",2)+lin("gStk","#e8c38c","#b88446")+p.defs)})();

  window.SMJ_SPORT_ART={
    football:{word:"FOOTBALL",left:{art:fbL,tag:""},right:{art:fbR,tag:""}},
    basketball:{word:"BASKETBALL",left:{art:bbL,tag:""},right:{art:bbR,tag:""}},
    baseball:{word:"BASEBALL",left:{art:bsL,tag:""},right:{art:bsR,tag:""}},
    hockey:{word:"HOCKEY",left:{art:hkL,tag:""},right:{art:hkR,tag:""}}
  };
  window.SMJ_LEAGUE_SPORT={nfl:"football",nba:"basketball",wnba:"basketball",mlb:"baseball",nhl:"hockey"};
})();
