// Whatnot Auto-Mark panel: on/off switch and the latest sales the helper saw.
// The helper itself runs on Cloudflare (see worker/README.md) and writes to
// smjOverlay/whatnot in the same Firebase database.
(function(){
  const WN_PATH="smjOverlay/whatnot";
  const toggle=document.getElementById("wnToggle"),
  status=document.getElementById("wnStatus"),
  logBox=document.getElementById("wnLog");
  if(!toggle)return;
  if(!(window.SMJFIREBASE_READY&&window.smjDB)){status.textContent="Firebase not connected.";toggle.disabled=true;return}

  const wnRef=window.smjDB.ref(WN_PATH);
  let enabled=false;

  function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function money(n){const c=(typeof state!=="undefined"&&state.currency)||"$";return n?`${c}${Number(n).toFixed(2)}`:""}
  function time(ms){return new Date(ms).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}

  function renderToggle(){
    toggle.textContent=enabled?"Auto-mark is ON":"Auto-mark is off";
    toggle.classList.toggle("on",enabled);
    toggle.classList.toggle("ghost",!enabled);
  }

  toggle.addEventListener("click",()=>{
    const next=!enabled;
    // enabledAt stops old orders from being marked when you switch it on mid-show.
    wnRef.child("settings").update({enabled:next,enabledAt:next?Date.now():null})
      .then(()=>setCmd(next?"Whatnot auto-mark is on.":"Whatnot auto-mark is off.","ok"))
      .catch(e=>setCmd("Couldn't change auto-mark: "+e.message,"bad"));
  });

  wnRef.child("settings").on("value",s=>{
    enabled=!!(s.val()&&s.val().enabled);
    renderToggle();
  });

  const RESULT={marked:["marked","Marked sold"],"no match":["nomatch","Needs a tap"],"already sold":["already","Already sold"],skipped:["skipped","Skipped"],error:["error","Error"]};

  wnRef.child("log").orderByChild("at").limitToLast(12).on("value",s=>{
    const rows=Object.values(s.val()||{}).sort((a,b)=>b.at-a.at);
    status.textContent=rows.length?`Last sale seen ${time(rows[0].at)}.`:"No Whatnot sales seen yet.";
    if(!rows.length){logBox.innerHTML='<p class="wn-empty">Sales will show up here as they come in.</p>';return}
    logBox.innerHTML=rows.map(r=>{
      const [cls,label]=RESULT[r.result]||["skipped",r.result];
      const who=r.buyer?`@${esc(r.buyer)}`:"";
      const head=r.result==="marked"?`${esc(r.teamName)} · ${who} ${money(r.price)}`:`${label}${who?" · "+who:""} ${money(r.price)}`;
      const sub=[r.title,r.note].filter(Boolean).map(esc).join(" — ");
      const fill=(r.result==="no match"||r.result==="error")&&r.buyer?`<button type="button" class="ghost" data-buyer="${esc(r.buyer)}" data-price="${esc(r.price||"")}">Use buyer</button>`:"";
      return `<div class="wn-row ${cls}"><span class="wn-time">${time(r.at)}</span><div class="wn-main"><strong>${head}</strong>${sub?`<small>${sub}</small>`:""}</div>${fill}</div>`;
    }).join("");
  });

  // "Use buyer" fills the Next buyer and Price boxes so you just tap the team.
  logBox.addEventListener("click",e=>{
    const b=e.target.closest("button[data-buyer]");
    if(!b)return;
    buyerInput.value=b.dataset.buyer;
    priceInput.value=b.dataset.price;
    setCmd(`Buyer @${b.dataset.buyer} ready. Tap their team.`,"ok");
    document.getElementById("teamControls").scrollIntoView({behavior:"smooth",block:"center"});
  });
})();
