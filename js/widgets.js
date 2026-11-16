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

  // ---------- stadium artwork beside the facecam ----------
  // Used by side-left.html / side-right.html and the two sides of top.html. Painted
  // night-stadium artwork (listed in js/stadium.js) that drift slowly and crossfade;
  // the left shows the 1st, 3rd, 5th... picture, the right the 2nd, 4th... and they
  // take turns changing. The right side of top.html can swap to "spots sold".
  const sides=[...document.querySelectorAll(".side")],ART=window.SMJ_STADIUM_ART||[];
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
