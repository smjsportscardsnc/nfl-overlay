// Small overlay widgets: price tag, break stats, socials, facecam frame.
// Each one only runs on a page that has its element, and is fed the shared
// overlay state by app.js (window.SMJ_HOOKS).
(function(){
  const $=id=>document.getElementById(id);
  const hooks=window.SMJ_HOOKS=window.SMJ_HOOKS||[];
  const money=(cur,n)=>{const v=Math.round(n*100)/100;return cur+(Number.isInteger(v)?v:v.toFixed(2))};
  const pop=el=>{el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")};
  const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  // social networks: name, fallback letters, brand colour (logos are in js/social-icons.js)
  const P={
    instagram:{n:"Instagram",i:"IG",c:"linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"},
    tiktok:{n:"TikTok",i:"TT",c:"linear-gradient(135deg,#25f4ee,#000 50%,#fe2c55)"},
    youtube:{n:"YouTube",i:"YT",c:"#ff0033"},
    x:{n:"X",i:"X",c:"#111"},
    facebook:{n:"Facebook",i:"FB",c:"#1877f2"},
    discord:{n:"Discord",i:"DC",c:"#5865f2"},
    twitch:{n:"Twitch",i:"TW",c:"#9146ff"}
  };
  const socialList=s=>Object.keys(P).map(k=>[k,String((s.socials||{})[k]||"").trim()]).filter(x=>x[1]);
  const socialIcon=k=>{const l=(window.SMJ_SOCIAL_ICONS||{})[k]||{};return l.path?`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${l.path}"/></svg>`:l.img?`<img src="${l.img}" alt=""/>`:esc(P[k].i)};

  // shrink a one-line text until it fits its box
  const fitText=(el,max,min)=>{let size=max;el.style.fontSize=size+"px";while(el.scrollWidth>el.clientWidth+1&&size>min){size-=2;el.style.fontSize=size+"px"}};

  // ---------- price tag ----------
  const pt=$("priceTag");
  if(pt){
    let last="";
    hooks.push(s=>{
      const t=s.priceTag||{},amt=String(t.amount||"").trim();
      $("ptLabel").textContent=t.label||"";
      $("ptKicker").textContent=t.kicker||"NOW RUNNING";
      $("ptAmount").textContent=amt?(/^[\d.]+$/.test(amt)?(s.currency||"$")+amt:amt):"";
      pt.classList.toggle("no-amount",!amt);
      const lb=$("ptLabel");lb.style.fontSize="";
      lb.style.width="max-content";
      const avail=lb.parentElement.getBoundingClientRect().width-2;
      let size=54;while(lb.getBoundingClientRect().width>avail&&size>28){size-=2;lb.style.fontSize=size+"px"}
      lb.style.width="";
      pt.classList.toggle("show",!!t.show);
      const key=[t.label,amt,t.show].join("|");
      if(last&&key!==last&&t.show)pop(pt);
      last=key;
    });
  }

  // ---------- break stats ----------
  const st=$("stats");
  if(st){
    let last="";
    hooks.push(s=>{
      const list=teams(),cur=s.currency||"$";
      const sold=list.filter(t=>s.sold&&s.sold[t.abbr]);
      const priced=sold.map(t=>parseFloat((s.prices||{})[t.abbr])).filter(n=>n>0);
      const total=priced.reduce((a,b)=>a+b,0);
      $("stAvg").textContent=priced.length?money(cur,total/priced.length):"—";
      $("stTotal").textContent=priced.length?money(cur,total):"—";
      $("stSold").textContent=sold.length;
      $("stOf").textContent="/"+list.length;
      $("stRing").style.setProperty("--p",list.length?sold.length/list.length*100:0);
      st.querySelectorAll(".st-v").forEach(v=>fitText(v,48,24));
      const key=[sold.length,total].join("|");
      if(last&&key!==last)pop(st);
      last=key;
    });
  }

  // ---------- socials (rotates through every handle you fill in) ----------
  const so=$("socials");
  if(so){
    let items=[],idx=0,timer=null;
    function show(){
      if(!items.length){so.classList.remove("show");return}
      const [k,h]=items[idx%items.length],p=P[k];
      so.classList.add("show");
      so.classList.remove("flip");void so.offsetWidth;so.classList.add("flip");
      const ic=$("soIcon"),logo=(window.SMJ_SOCIAL_ICONS||{})[k]||{};
      ic.style.background=p.c;
      ic.classList.toggle("dark",!!p.dark);
      if(logo.path)ic.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${logo.path}"/></svg>`;
      else if(logo.img)ic.innerHTML=`<img src="${logo.img}" alt=""/>`;
      else ic.textContent=p.i;
      $("soLabel").textContent=`FOLLOW ON ${p.n.toUpperCase()}`;
      $("soHandle").textContent=h;
      idx++;
    }
    hooks.push(s=>{
      const next=socialList(s);
      if(JSON.stringify(next)===JSON.stringify(items))return;
      items=next;idx=0;clearInterval(timer);show();
      if(items.length>1)timer=setInterval(show,6000);
    });
  }

  // ---------- sparkle on the stadium artwork ----------
  // A see-through canvas sits on top of each stadium picture and drifts with it. On it:
  // crowd lights that twinkle on and off, camera flashes popping in the stands, a slow
  // shimmer on the floodlights and a few specks floating in the haze. js/stadium.js says
  // where the stands and the light banks are in each picture.
  const sparkle=(()=>{
    const layers=[],R=Math.random,PI=Math.PI,rnd=(a,b)=>a+R()*(b-a);
    let clock=0,last=0,running=false,SPR=null;
    function sprites(){
      const make=(n,draw)=>{const c=document.createElement("canvas");c.width=c.height=n;draw(c.getContext("2d"),n/2);return c};
      // a soft round light: white-hot middle, coloured glow around it
      const dot=rgb=>make(48,(g,r)=>{
        const gr=g.createRadialGradient(r,r,0,r,r,r);
        gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.16,`rgba(${rgb},.95)`);
        gr.addColorStop(.42,`rgba(${rgb},.28)`);gr.addColorStop(1,`rgba(${rgb},0)`);
        g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);
      });
      // a four-point star flare: two thin streaks crossing a bright middle
      const star=rgb=>make(128,(g,r)=>{
        for(const a of [0,PI/2]){
          g.save();g.translate(r,r);g.rotate(a);g.scale(1,.06);
          const gr=g.createRadialGradient(0,0,0,0,0,r);
          gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.3,`rgba(${rgb},.5)`);gr.addColorStop(1,`rgba(${rgb},0)`);
          g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,PI*2);g.fill();g.restore();
        }
        const gr=g.createRadialGradient(r,r,0,r,r,r*.3);
        gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.4,`rgba(${rgb},.55)`);gr.addColorStop(1,`rgba(${rgb},0)`);
        g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);
      });
      // a wide, even glow with no hot middle (floodlight shimmer, haze specks)
      const haze=rgb=>make(64,(g,r)=>{
        const gr=g.createRadialGradient(r,r,0,r,r,r);
        gr.addColorStop(0,`rgba(${rgb},.9)`);gr.addColorStop(.45,`rgba(${rgb},.35)`);gr.addColorStop(1,`rgba(${rgb},0)`);
        g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);
      });
      return {
        crowd:["255,170,84","255,198,128","255,224,178","255,140,72","255,246,232","226,190,255"].map(dot),
        flash:dot("236,244,255"),flare:star("255,238,214"),warm:star("255,206,150"),haze:haze("255,196,140")
      };
    }
    function frame(now){
      if(!layers.length){running=false;return}
      requestAnimationFrame(frame);
      const dt=now-last;
      if(dt<30)return;                       // about 30 frames a second is plenty
      last=now;
      const step=Math.min(dt,100);           // after a pause, carry on instead of jumping ahead
      clock+=step;
      for(let i=layers.length-1;i>=0;i--){
        if(!layers[i].cv.isConnected){layers.splice(i,1);continue}
        layers[i].draw(clock,step);
      }
    }
    // el = the .stadium div, lay = that picture's line in SMJ_STADIUM_LAYOUT, iw x ih = picture size
    function add(el,lay,iw,ih){
      SPR=SPR||sprites();
      const cv=document.createElement("canvas"),g=cv.getContext("2d"),
            dpr=Math.min(window.devicePixelRatio||1,2),xc=lay.xc==null?.5:lay.xc,
            banks=lay.banks||[],bands=lay.bands||[],
            line=(x,c)=>c[0]+c[1]*(1-((x-xc)*2)**2)+(c[2]||0)*(x-.5),
            flip=x=>lay.mirror?1-x:x;
      let cw=0,ch=0,ox=0,oy=0,pw=0,ph=0;
      el.appendChild(cv);
      // a random seat between the roof line and the field (more of them low down), keeping
      // off the dark tier fronts and the floodlights
      function seat(){
        for(let i=0;i<10;i++){
          const x=R(),top=line(x,lay.roof)+.03,bot=lay.horizon-.01,y=top+(bot-top)*Math.pow(R(),.7);
          if(bot-top<.03)continue;
          if(bands.some(b=>{const c=line(x,b);return y>c-.004&&y<c+b[3]+.004}))continue;
          if(banks.some(b=>Math.abs(x-b[0])<b[2]+.04&&Math.abs(y-b[1])<b[3]+.03))continue;
          return [flip(x),y];
        }
        return [R(),lay.horizon-.02];
      }
      // crowd lights: fade up, hold a beat, fade away, then come back somewhere else
      const tw=[];
      function twinkle(p,t,first){
        const kind=R();
        if(kind<.12&&bands.length){           // a bulb in the string of lights on a tier front
          const b=bands[Math.floor(R()*bands.length)],x=R();
          p.x=flip(x);p.y=line(x,b)+b[3]*.55;
        }else if(kind<.2){p.x=R();p.y=lay.horizon+rnd(-.004,.004)}   // a light at the field edge
        else[p.x,p.y]=seat();
        if(R()<.4){                           // glitter: a tiny quick glint
          p.dur=rnd(240,560);p.a=rnd(.6,1);p.s=rnd(.02,.032);p.star=false;
          p.t0=first?t-R()*p.dur:t+rnd(0,500);
        }else{                                // a light that swells and fades
          p.dur=rnd(700,2600);
          p.a=Math.pow(R(),1.6)*.75+.25;      // most are faint, a few are bright
          p.s=rnd(.034,.07)*(.7+.6*p.a);      // size, as a share of the picture's width
          p.star=p.a>.72;
          p.t0=first?t-R()*p.dur:t+rnd(0,1100);
        }
        p.c=Math.floor(R()*SPR.crowd.length);
        return p;
      }
      for(let i=0;i<120;i++)tw.push(twinkle({},clock,true));
      // camera flashes
      const fl=[];
      let nextFlash=clock+rnd(200,900);
      // floodlights: each bank breathes slowly and a lamp or two glints
      const bk=banks.map(b=>({b,ph:R()*PI*2,sp:rnd(.0011,.0019),gl:[]}));
      function glint(o,t,first){
        const b=o.b,p={x:flip(b[0]+rnd(-b[2],b[2])*.85),y:b[1]+rnd(-b[3],b[3])*.85,dur:rnd(1300,3200)};
        p.t0=first?t-R()*p.dur:t+rnd(0,900);
        p.s=rnd(.2,.36)*Math.min(1,.55+b[2]*4);p.a=rnd(.35,.7);
        return p;
      }
      bk.forEach(o=>{const n=o.b[2]*o.b[3]>.004?3:o.b[2]>.09?2:1;for(let i=0;i<n;i++)o.gl.push(glint(o,clock,true))});
      // specks floating in the haze
      const mote=(t,first)=>{
        const p={x:R(),y:rnd(.16,.97),vx:rnd(-.006,.006),vy:rnd(-.014,-.003),dur:rnd(6000,12000),s:rnd(.022,.06),a:rnd(.1,.26)};
        p.t0=first?t-R()*p.dur:t;
        return p;
      };
      const mo=[];
      for(let i=0;i<12;i++)mo.push(mote(clock,true));
      const put=(img,x,y,s,a)=>{
        if(a<=.004)return;
        const d=s*pw;
        g.globalAlpha=a>1?1:a;
        g.drawImage(img,ox+x*pw-d/2,oy+y*ph-d/2,d,d);
      };
      function draw(t,step){
        const w=cv.clientWidth,h=cv.clientHeight;
        if(!w||!h)return;
        if(w!==cw||h!==ch){
          // the picture is shown "cover", so work out where it really sits in the panel
          cw=w;ch=h;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
          const k=Math.max(w/iw,h/ih);
          pw=iw*k;ph=ih*k;ox=(w-pw)/2;oy=(h-ph)/2;
        }
        g.setTransform(dpr,0,0,dpr,0,0);
        g.globalCompositeOperation="source-over";g.globalAlpha=1;
        g.clearRect(0,0,w,h);
        g.globalCompositeOperation="lighter";
        for(const o of bk){
          const b=o.b,br=.5+.5*Math.sin(t*o.sp+o.ph),gw=(b[2]*2+.22)*pw,gh=(b[3]*2+.11)*ph;
          g.globalAlpha=.05+.11*br;
          g.drawImage(SPR.haze,ox+flip(b[0])*pw-gw/2,oy+b[1]*ph-gh/2,gw,gh);
          for(let i=0;i<o.gl.length;i++){
            const p=o.gl[i],q=(t-p.t0)/p.dur;
            if(q>=1){o.gl[i]=glint(o,t);continue}
            if(q>0){const e=Math.sin(q*PI);put(SPR.warm,p.x,p.y,p.s*(.75+.25*e),p.a*e*e)}
          }
        }
        for(let i=0;i<mo.length;i++){
          const p=mo[i],q=(t-p.t0)/p.dur;
          if(q>=1){mo[i]=mote(t);continue}
          p.x+=p.vx*step/1000;p.y+=p.vy*step/1000;
          put(SPR.haze,p.x,p.y,p.s,p.a*Math.sin(q*PI));
        }
        for(const p of tw){
          const q=(t-p.t0)/p.dur;
          if(q>=1){twinkle(p,t);continue}
          if(q<=0)continue;
          const e=Math.sin(q*PI),a=p.a*e*e;
          put(SPR.crowd[p.c],p.x,p.y,p.s,a);
          if(p.star)put(SPR.warm,p.x,p.y,p.s*3.2,a*.6);    // the bright ones get a little star
        }
        if(t>=nextFlash){
          // usually one flash, now and then a little burst close together
          const n=R()<.22?2+Math.floor(R()*3):1,[sx,sy]=seat();
          for(let i=0;i<n;i++){
            const p=i?{x:sx+rnd(-.1,.1),y:sy+rnd(-.035,.035)}:{x:sx,y:sy};
            p.t0=t+i*rnd(60,170);p.dur=rnd(170,380);p.s=rnd(.06,.1);
            fl.push(p);
          }
          nextFlash=t+rnd(180,950);
        }
        for(let i=fl.length-1;i>=0;i--){
          const p=fl[i],q=(t-p.t0)/p.dur;
          if(q>=1){fl.splice(i,1);continue}
          if(q<0)continue;
          const a=q<.18?q/.18:Math.pow(1-(q-.18)/.82,2);   // snap on, die away
          put(SPR.flash,p.x,p.y,p.s,a);
          put(SPR.flare,p.x,p.y,p.s*2.8,a*.85);
        }
      }
      layers.push({cv,draw});
      if(!running){running=true;last=performance.now();requestAnimationFrame(frame)}
    }
    return {add};
  })();

  // ---------- stadium artwork beside the facecam ----------
  // Used by side-left.html / side-right.html and the two sides of top.html. Night-stadium
  // artwork (listed in js/stadium.js) that drifts slowly, sparkles and crossfades;
  // the left shows the 1st, 3rd, 5th... picture, the right the 2nd, 4th... and they
  // take turns changing. The right side of top.html can swap to "spots sold".
  const sides=[...document.querySelectorAll(".side")],ART=window.SMJ_STADIUM_ART||[],LAYOUT=window.SMJ_STADIUM_LAYOUT||{};
  if(sides.length){
    const ROTATE_MS=16000;
    sides.forEach(sd=>{
      const q=c=>sd.querySelector(c),right=sd.dataset.side==="right",box=q(".sd-art");
      let idx=right?1:0,shown=0,lastStats=null;
      function show(){
        if(!ART.length)return;
        const src=ART[idx%ART.length],img=new Image();
        idx+=2;
        // swap only once the picture has loaded, so there is never a blank panel
        img.onload=()=>{
          const el=document.createElement("div"),old=[...box.children];
          el.className="stadium"+(shown++%2?" alt":"");
          el.style.backgroundImage=`url("${src}")`;
          box.appendChild(el);
          if(LAYOUT[src])sparkle.add(el,LAYOUT[src],img.naturalWidth,img.naturalHeight);
          setTimeout(()=>old.forEach(o=>o.remove()),2000);
        };
        img.src=src;
      }
      show();
      // the right side changes halfway between the left side's changes
      if(ART.length>2)setTimeout(()=>{show();setInterval(show,ROTATE_MS)},right?ROTATE_MS*1.5:ROTATE_MS);
      hooks.push(s=>{
        // spots sold (no prices)
        if(!q(".sd-stats"))return;
        const on=!!s.topStats,list=teams(),sold=list.filter(t=>s.sold&&s.sold[t.abbr]).length,left=list.length-sold;
        q(".sd-sold").textContent=sold;
        q(".sd-of").textContent="/"+list.length;
        q(".sd-ring").style.setProperty("--p",list.length?sold/list.length*100:0);
        q(".sd-left").textContent=left===0?"SOLD OUT":left;
        q(".sd-left-k").textContent=left===0?"THANK YOU!":left<=3?"LAST "+left+"!":"SPOTS LEFT";
        if(lastStats!==null&&on!==lastStats){sd.classList.remove("swap");void sd.offsetWidth;sd.classList.add("swap")}
        sd.classList.toggle("stats-on",on);
        lastStats=on;
      });
    });
  }

  // ---------- facecam frame ----------
  // Setup > Facecam: "camera" = transparent frame with LIVE tag for your webcam,
  // "logo" (default) = no LIVE tag, the frame fills with a rotating logo reel.
  const fc=$("facecam");
  if(fc){
    const reel=$("fcReel"),dots=$("fcDots"),REEL_MS=7000;
    let scenes=[...fc.querySelectorAll(".scene")],sceneIdx=-1,reelTimer=null,socialKey="";
    function renderDots(){if(dots)dots.innerHTML=scenes.map(()=>"<i></i>").join("")}
    renderDots();
    // one extra scene per social handle filled in on Setup, after the logo scenes
    function setSocialScenes(list){
      const key=JSON.stringify(list);
      if(key===socialKey)return;
      socialKey=key;
      reel.querySelectorAll(".s-social").forEach(n=>n.remove());
      list.forEach(([k,h])=>{
        const sc=document.createElement("div");
        sc.className="scene s-social";
        sc.innerHTML=`<div class="soc-ic" style="background:${P[k].c}">${socialIcon(k)}</div><div class="soc-text"><small>FOLLOW US ON ${esc(P[k].n.toUpperCase())}</small><b>${esc(h)}</b></div>`;
        reel.insertBefore(sc,dots);
      });
      fitHandles();
      scenes=[...fc.querySelectorAll(".scene")];
      if(sceneIdx>=scenes.length)sceneIdx=-1;
      renderDots();
    }
    // shrink long handles so the whole name fits next to the logo
    function fitHandles(){
      reel.querySelectorAll(".s-social .soc-text b").forEach(b=>{
        let size=64;b.style.fontSize=size+"px";
        while(b.scrollWidth>b.clientWidth+1&&size>30){size-=2;b.style.fontSize=size+"px"}
      });
    }
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitHandles);
    function nextScene(){
      sceneIdx=(sceneIdx+1)%scenes.length;
      scenes.forEach((sc,i)=>sc.classList.toggle("active",i===sceneIdx));
      if(dots)[...dots.children].forEach((d,i)=>d.classList.toggle("on",i===sceneIdx));
    }
    function setMode(mode){
      if(fc.dataset.mode===mode&&(mode!=="logo"||reelTimer))return;
      fc.dataset.mode=mode;
      clearInterval(reelTimer);reelTimer=null;
      if(mode==="logo"&&scenes.length){sceneIdx=-1;nextScene();reelTimer=setInterval(nextScene,REEL_MS)}
    }
    setMode("logo");
    hooks.push(s=>{
      $("fcBrand").textContent=(s.brand||"SMJ Sports Cards").toUpperCase();
      if($("fcNowTitle"))$("fcNowTitle").textContent=s.title||"SMJ BREAK";
      if($("fcNowSub")){const sub=s.subtitle==null?"singles • rips • breaks":s.subtitle;$("fcNowSub").textContent=sub;$("fcNowSub").hidden=!sub}
      setSocialScenes(socialList(s));
      setMode(s.facecam==="camera"?"camera":"logo");
    });
  }
})();
