// Small overlay widgets: price tag, break stats, socials, facecam frame.
// Each one only runs on a page that has its element, and is fed the shared
// overlay state by app.js (window.SMJ_HOOKS).
(function(){
  const $=id=>document.getElementById(id);
  const hooks=window.SMJ_HOOKS=window.SMJ_HOOKS||[];
  const money=(cur,n)=>{const v=Math.round(n*100)/100;return cur+(Number.isInteger(v)?v:v.toFixed(2))};
  const pop=el=>{el.classList.remove("pop");void el.offsetWidth;el.classList.add("pop")};

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
      const key=[sold.length,total].join("|");
      if(last&&key!==last)pop(st);
      last=key;
    });
  }

  // ---------- socials (rotates through every handle you fill in) ----------
  const so=$("socials");
  if(so){
    const P={
      instagram:{n:"Instagram",i:"IG",c:"linear-gradient(135deg,#f58529,#dd2a7b,#8134af)"},
      tiktok:{n:"TikTok",i:"TT",c:"linear-gradient(135deg,#25f4ee,#000 50%,#fe2c55)"},
      youtube:{n:"YouTube",i:"YT",c:"#ff0033"},
      x:{n:"X",i:"X",c:"#111"},
      facebook:{n:"Facebook",i:"FB",c:"#1877f2"},
      discord:{n:"Discord",i:"DC",c:"#5865f2"},
      twitch:{n:"Twitch",i:"TW",c:"#9146ff"}
    };
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
      const next=Object.keys(P).map(k=>[k,String((s.socials||{})[k]||"").trim()]).filter(x=>x[1]);
      if(JSON.stringify(next)===JSON.stringify(items))return;
      items=next;idx=0;clearInterval(timer);show();
      if(items.length>1)timer=setInterval(show,6000);
    });
  }

  // ---------- facecam frame ----------
  // Setup > Facecam: "camera" = transparent frame with LIVE tag for your webcam,
  // "logo" (default) = no LIVE tag, the frame fills with a rotating logo reel.
  const fc=$("facecam");
  if(fc){
    const scenes=[...fc.querySelectorAll(".scene")],dots=$("fcDots"),REEL_MS=7000;
    let sceneIdx=-1,reelTimer=null;
    if(dots)dots.innerHTML=scenes.map(()=>"<i></i>").join("");
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
      setMode(s.facecam==="camera"?"camera":"logo");
    });
  }
})();
