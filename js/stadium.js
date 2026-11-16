// Stadium scenery for the side panels (top.html, side-left.html, side-right.html).
// One night-stadium scene for every league, drawn in code: light towers, a packed
// bowl with camera flashes, a glowing ribbon board and the field under the lights.
// The right panel is the mirror image of the left so the two frame the facecam.
(function(){
  const W=208,H=348;
  const r1=n=>+n.toFixed(1);
  function rng(seed){return()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  // crowd: rows of fans (head + shoulders) between two curves, bigger toward the
  // front. Drawn as one path per shirt colour so it stays light for OBS.
  const SHIRTS=["#2b3a5c","#7a2b2b","#3e5530","#6c707a","#1e2638","#8a6a2c","#4a3560","#9aa0aa","#26364a","#b33a3a","#d8d8d8","#2f5f7a","#c47a2a"];
  function crowd(rand,topY,botY,s0,s1){
    const bins=SHIRTS.map(()=>""),heads=["",""];
    let k=0;
    for(;;){
      // rows are spaced by the fan size, which grows toward the front
      const t=k/40,size=s0+(s1-s0)*Math.min(1,t);
      let any=false;
      for(let x=-2+rand()*size;x<W+2;x+=size*1.5+rand()*size*.5){
        const y=topY(x)+(botY(x)-topY(x))*0+k*size*2.1+size*1.9;
        if(y>botY(x)-size*.2)continue;
        any=true;
        if(rand()<.06)continue;
        const w=r1(size*1.2),h=r1(size*1.15),hx=r1(x+size*.25),hy=r1(y-h-size*.75),hs=r1(size*.7);
        bins[Math.floor(rand()*SHIRTS.length)]+=`M${r1(x)} ${r1(y-h)}h${w}v${h}h-${w}z`;
        heads[rand()<.55?0:1]+=`M${hx} ${hy}h${hs}v${hs}h-${hs}z`;
      }
      if(!any)break;
      k++;
    }
    return bins.map((d,i)=>d?`<path d="${d}" fill="${SHIRTS[i]}"/>`:"").join("")+
      `<path d="${heads[0]}" fill="#c89c7c"/><path d="${heads[1]}" fill="#6e4a32"/>`;
  }

  function scene(side,uid){
    const rand=rng(side==="right"?917:311),id=k=>`${k}-${uid}`;
    // stand outlines (left panel: the near corner is on the left, so it is taller)
    const top="M0 74Q104 96 208 122",           // top of the upper deck
          deck="M0 168Q104 174 208 184",        // ribbon board between the decks
          wall=228;                             // where the stands meet the field
    const yAt=(a,b,c,x)=>{const t=x/W;return (1-t)*(1-t)*a+2*(1-t)*t*b+t*t*c}; // quadratic, x≈t*W
    const topY=x=>yAt(74,96,122,x),deckY=x=>yAt(168,174,184,x);

    const defs=`
      <linearGradient id="${id("sky")}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#02040b"/><stop offset=".55" stop-color="#08112a"/><stop offset="1" stop-color="#1a2c5a"/></linearGradient>
      <radialGradient id="${id("glow")}"><stop offset="0" stop-color="#fff6dc" stop-opacity=".95"/><stop offset=".18" stop-color="#ffe9b8" stop-opacity=".45"/><stop offset=".5" stop-color="#9fb6ff" stop-opacity=".12"/><stop offset="1" stop-color="#9fb6ff" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id("beam")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d6" stop-opacity=".22"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id("ribbon")}" gradientUnits="userSpaceOnUse" x1="0" x2="70" spreadMethod="repeat">
        <stop offset="0" stop-color="#00b4ff"/><stop offset=".35" stop-color="#ffcc4d"/><stop offset=".55" stop-color="#ffffff"/><stop offset=".75" stop-color="#ffcc4d"/><stop offset="1" stop-color="#00b4ff"/>
        <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="70 0" dur="4s" repeatCount="indefinite"/></linearGradient>
      <linearGradient id="${id("depth")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040b" stop-opacity=".7"/><stop offset="1" stop-color="#02040b" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id("haze")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ff" stop-opacity="0"/><stop offset=".55" stop-color="#cfe0ff" stop-opacity=".1"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id("turf")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c6e33"/><stop offset="1" stop-color="#3f9a47"/></linearGradient>
      <radialGradient id="${id("pool")}" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#fffbe6" stop-opacity=".28"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id("flash")}"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id("fog")}"><stop offset="0" stop-color="#dfe8ff" stop-opacity=".09"/><stop offset="1" stop-color="#dfe8ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="${id("vig")}" cx="50%" cy="45%" r="78%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
      <clipPath id="${id("fieldClip")}"><rect y="${wall+7}" width="${W}" height="${H-wall-7}"/></clipPath>
      <linearGradient id="${id("upperShade")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b" stop-opacity=".78"/><stop offset="1" stop-color="#03050b" stop-opacity=".3"/></linearGradient>`;

    // night sky, a few stars
    let stars="";
    for(let i=0;i<18;i++){const x=rand()*W,y=rand()*64;if(x<80&&y<50)continue;stars+=`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(.4+rand()*.5)}" fill="#fff" opacity="${r1(.25+rand()*.45)}"/>`}
    const sky=`<rect width="${W}" height="${H}" fill="url(#${id("sky")})"/>${stars}`;

    // light towers: the big one on the outer edge, a smaller one across the stadium
    function tower(x,y,cols,rows,cell,tilt,glowR,poleTo){
      const w=cols*(cell+1.4)+1.4,h=rows*(cell*.7+1.4)+1.4;let cells="";
      for(let c=0;c<cols;c++)for(let r=0;r<rows;r++)cells+=`<rect x="${r1(1.4+c*(cell+1.4))}" y="${r1(1.4+r*(cell*.7+1.4))}" width="${cell}" height="${r1(cell*.7)}" rx=".6" fill="#fffbea"/>`;
      return `<rect x="${r1(x+w/2-1.2)}" y="${r1(y+h)}" width="2.4" height="${r1(poleTo-y-h)}" fill="#1a1f2b"/>
        <path d="M${r1(x+w/2-1.2)} ${r1(y+h)}L${r1(x+w/2-6)} ${poleTo}M${r1(x+w/2+1.2)} ${r1(y+h)}L${r1(x+w/2+6)} ${poleTo}" stroke="#141822" stroke-width=".8"/>
        <g transform="rotate(${tilt} ${r1(x+w/2)} ${r1(y+h/2)})"><rect x="${x}" y="${y}" width="${r1(w)}" height="${r1(h)}" rx="1.2" fill="#1d222e"/><g transform="translate(${x} ${y})">${cells}</g></g>
        <circle cx="${r1(x+w/2)}" cy="${r1(y+h/2)}" r="${glowR}" fill="url(#${id("glow")})">
          <animate attributeName="opacity" values="1;.9;1;.95;1" dur="${r1(5+rand()*3)}s" repeatCount="indefinite"/></circle>`;
    }
    const beams=`
      <path d="M26 26L54 30L208 300L118 348Z" fill="url(#${id("beam")})"><animate attributeName="opacity" values=".85;1;.9;1;.85" dur="6s" repeatCount="indefinite"/></path>
      <path d="M22 30L44 34L84 348L10 348Z" fill="url(#${id("beam")})" opacity=".7"/>
      <path d="M163 90L179 91L208 270L112 270Z" fill="url(#${id("beam")})" opacity=".4"/>`;
    const lights=tower(152,82,4,2,4.5,-4,36,124)+tower(10,14,5,3,7,6,74,84);

    // the bowl: upper deck, ribbon board, lower deck, wall
    const aisles=(y1,y2,n,skew)=>{let s="";for(let i=1;i<=n;i++){const x=i*W/(n+1);s+=`<path d="M${r1(x)} ${r1(y1(x))}L${r1(x+skew*(1-x/W))} ${r1(y2(x))}" stroke="#aab3c5" stroke-opacity=".16" stroke-width="1.2"/>`}return s};
    let roofLights="";for(let x=6;x<W;x+=9)roofLights+=`<circle cx="${x}" cy="${r1(topY(x)-1.5)}" r=".8" fill="#ffe7b0" opacity=".8"/>`;
    const stands=`
      <path d="${top}V${wall}H0Z" fill="#0c101a"/>
      ${crowd(rand,topY,x=>deckY(x)-1,.75,1.5)}
      ${aisles(topY,deckY,4,-14)}
      <path d="${top}V${wall}H0Z" fill="url(#${id("upperShade")})"/>
      <path d="${top}L208 116Q104 89 0 66Z" fill="#141925"/>
      <path d="${top}" stroke="#2c3446" stroke-width="1.2" fill="none"/>
      ${roofLights}
      <path d="${deck}L208 192Q104 182 0 176Z" fill="#05070d"/>
      <path d="M0 169.5Q104 175.5 208 185.5L208 190Q104 180 0 174Z" fill="url(#${id("ribbon")})" opacity=".95"/>
      <path d="M0 169.5Q104 175.5 208 185.5L208 190Q104 180 0 174Z" fill="url(#${id("ribbon")})" opacity=".35" transform="translate(0 3)" style="filter:blur(3px)"/>
      <path d="M0 176Q104 182 208 192V${wall}H0Z" fill="#0c101a"/>
      ${crowd(rand,x=>deckY(x)+7,()=>wall,1.7,2.3)}
      ${aisles(x=>deckY(x)+8,()=>wall,3,-10)}
      <rect y="${wall}" width="${W}" height="7" fill="#0a0d15"/><rect y="${wall}" width="${W}" height="1.2" fill="#3a4152"/>`;

    // camera flashes popping in the crowd
    let flashes="";
    for(let i=0;i<16;i++){
      const x=rand()*W,lower=rand()<.45,y=lower?deckY(x)+12+rand()*(wall-deckY(x)-16):topY(x)+6+rand()*(deckY(x)-topY(x)-10);
      const dur=r1(2.6+rand()*4.5),begin=r1(rand()*6),s=lower?1:.75;
      flashes+=`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(5*s)}" fill="url(#${id("flash")})" opacity="0"><animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.86;.88;.93;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
    }

    // the field under the lights: mowing stripes in perspective, a pool of light
    let stripes="";const fy=wall+7;
    for(let i=0;i<8;i++){
      const a=fy+(H-fy)*Math.pow(i/8,1.5),b=fy+(H-fy)*Math.pow((i+1)/8,1.5);
      if(i%2)stripes+=`<rect y="${r1(a)}" width="${W}" height="${r1(b-a)}" fill="#fff" opacity=".07"/>`;
    }
    // diagonal mowing passes, so the stripes cross into a checkerboard
    let passes="";const vx=300,vy=fy-40;
    for(let i=-6;i<6;i++){
      const x0=i*46,x1=x0+23;
      passes+=`<path d="M${r1(vx+(x0-vx)*.25)} ${r1(vy+(H-vy)*.25)}L${x0} ${H}H${x1}L${r1(vx+(x1-vx)*.25)} ${r1(vy+(H-vy)*.25)}Z" fill="#000" opacity=".06"/>`;
    }
    const field=`
      <rect y="${fy}" width="${W}" height="${H-fy}" fill="url(#${id("turf")})"/>${stripes}
      <g clip-path="url(#${id("fieldClip")})">${passes}</g>
      <path d="M0 ${fy+9}L${W} ${fy+12}" stroke="#f2f5f0" stroke-width="1.6" opacity=".75"/>
      <rect y="${fy}" width="${W}" height="16" fill="#cfe0ff" opacity=".08"/>
      <ellipse cx="120" cy="${fy}" rx="150" ry="120" fill="url(#${id("pool")})" clip-path="url(#${id("fieldClip")})"/>`;

    // drifting haze over the bowl
    const fog=`
      <rect y="90" width="${W}" height="160" fill="url(#${id("haze")})"/>
      <ellipse cx="60" cy="150" rx="120" ry="40" fill="url(#${id("fog")})"><animateTransform attributeName="transform" type="translate" values="0 0;30 4;0 0" dur="22s" repeatCount="indefinite"/></ellipse>
      <ellipse cx="170" cy="210" rx="110" ry="30" fill="url(#${id("fog")})"><animateTransform attributeName="transform" type="translate" values="0 0;-26 -3;0 0" dur="17s" repeatCount="indefinite"/></ellipse>`;

    const body=`${sky}${stands}${flashes}${field}${fog}${beams}${lights}<rect width="${W}" height="${H}" fill="url(#${id("vig")})"/>`;
    const flip=side==="right"?` transform="translate(${W} 0) scale(-1 1)"`:"";
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs><g${flip}>${body}</g></svg>`;
  }

  window.SMJ_STADIUM={scene};
})();
