// Full-screen animation player (animations.html).
// Listens for smjOverlay/current/moment {id, at, style} from the control panel.
const PATH="smjOverlay/current";

const stage=document.getElementById("stage"),
graphic=document.getElementById("graphic"),
img=document.getElementById("graphicImg"),
shine=document.getElementById("shine"),
glow=document.getElementById("glow"),
sparks=document.getElementById("sparks");

const swoosh=new Audio("assets/sounds/swoosh.wav");
swoosh.preload="auto";
function sound(volume,delay=0){
  setTimeout(()=>{try{const a=swoosh.cloneNode();a.volume=volume;a.play().catch(()=>{})}catch(e){}},delay);
}

// Preload every graphic so the first play is instant
Object.values(window.SMJ_MOMENTS||{}).forEach(m=>{const i=new Image();i.src=m.image});

const HOLD=2400; // ms the graphic stays on screen between entrance and exit

// Each style: entrance keyframes, a gentle idle while it holds, and an exit.
const OUT="cubic-bezier(.22,.9,.32,1)",INOUT="ease-in-out",IN="cubic-bezier(.55,0,.85,.35)";
const STYLES={
  pop:{
    label:"Pop",
    in:{frames:[
      {transform:"scale(0) rotate(-14deg)",opacity:0,easing:OUT},
      {transform:"scale(1.14) rotate(4deg)",opacity:1,offset:.55,easing:INOUT},
      {transform:"scale(.95) rotate(-1.5deg)",opacity:1,offset:.78,easing:INOUT},
      {transform:"scale(1) rotate(0)",opacity:1}],duration:700},
    out:{frames:[
      {transform:"scale(1) rotate(0)",opacity:1,easing:"ease-out"},
      {transform:"scale(1.08) rotate(-2deg)",opacity:1,offset:.3,easing:IN},
      {transform:"scale(0) rotate(12deg)",opacity:0}],duration:450}
  },
  drop:{
    label:"Drop",
    in:{frames:[
      {transform:"translateY(-110vh) rotate(-6deg)",opacity:1,easing:"cubic-bezier(.5,0,.9,.6)"},
      {transform:"translateY(0) rotate(0) scale(1.08,.88)",opacity:1,offset:.55,easing:OUT},
      {transform:"translateY(-5vh) scale(.98,1.03)",opacity:1,offset:.75,easing:INOUT},
      {transform:"translateY(0) scale(1)",opacity:1}],duration:850},
    out:{frames:[
      {transform:"translateY(0)",opacity:1,easing:"ease-out"},
      {transform:"translateY(-4vh)",opacity:1,offset:.3,easing:IN},
      {transform:"translateY(115vh) rotate(8deg)",opacity:1}],duration:650}
  },
  flip:{
    label:"Flip",
    in:{frames:[
      {transform:"rotateY(100deg) scale(.55)",opacity:0,easing:OUT},
      {transform:"rotateY(-18deg) scale(1.06)",opacity:1,offset:.6,easing:INOUT},
      {transform:"rotateY(6deg) scale(.99)",opacity:1,offset:.82,easing:INOUT},
      {transform:"rotateY(0) scale(1)",opacity:1}],duration:850},
    out:{frames:[
      {transform:"rotateY(0) scale(1)",opacity:1,easing:IN},
      {transform:"rotateY(-100deg) scale(.55)",opacity:0}],duration:500}
  }
};
window.SMJ_ANIM_STYLES=STYLES;

let running=[],timer=null;
function stopAll(){running.forEach(a=>a.cancel());running=[];clearTimeout(timer)}
function run(el,frames,opts){const a=el.animate(frames,{fill:"forwards",...opts});running.push(a);return a}

function burst(colors,delay){
  sparks.innerHTML="";
  const vmin=Math.min(innerWidth,innerHeight)/100;
  for(let i=0;i<22;i++){
    const s=document.createElement("div");s.className="spark";
    const ang=Math.random()*Math.PI*2,dist=(28+Math.random()*22)*vmin;
    s.style.setProperty("--s",`${(.8+Math.random()*1.4)*vmin}px`);
    s.style.setProperty("--c",colors[i%colors.length]);
    sparks.appendChild(s);
    run(s,[
      {transform:"translate(0,0) scale(1)",opacity:1},
      {transform:`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) scale(.2)`,opacity:0}
    ],{duration:900+Math.random()*300,delay,easing:"cubic-bezier(.1,.7,.3,1)"});
  }
}

function play(id,styleName){
  const m=window.SMJ_MOMENTS&&window.SMJ_MOMENTS[id];
  if(!m)return;
  const st=STYLES[styleName]||STYLES.pop;
  stopAll();
  img.src=m.image;
  shine.style.setProperty("--img",`url("${m.image}")`);
  glow.style.setProperty("--glow",m.colors[1]||"#ffd166");

  const land=st.in.duration*.55;
  const outAt=st.in.duration+HOLD;

  // entrance
  run(graphic,st.in.frames,{duration:st.in.duration});
  sound(1);

  // landing glow + sparks
  run(glow,[{opacity:0,transform:"scale(.5)"},{opacity:.55,transform:"scale(1)",offset:.25},{opacity:0,transform:"scale(1.25)"}],{duration:1100,delay:land,easing:"ease-out"});
  burst(m.colors,land);

  // gentle float while it holds, then one shine pass
  const idle=graphic.animate([{translate:"0 0"},{translate:"0 -1.2vh"},{translate:"0 0"}],{duration:1600,delay:st.in.duration,iterations:Infinity,easing:"ease-in-out"});
  running.push(idle);
  run(shine,[{opacity:1,backgroundPosition:"120% 0"},{opacity:1,backgroundPosition:"-20% 0"}],{duration:900,delay:st.in.duration+250,easing:"ease-in-out"});

  // exit
  timer=setTimeout(()=>{
    run(graphic,st.out.frames,{duration:st.out.duration});
    sound(.55);
    setTimeout(stopAll,st.out.duration+50);
  },outAt);
}
window.playMoment=play; // for testing: playMoment("stash-or-pass","drop")

let lastAt=null,first=true;
if(window.SMJFIREBASE_READY&&window.smjDB){
  window.smjDB.ref(PATH+"/moment").on("value",snap=>{
    const m=snap.val();
    const at=m&&m.at;
    // never replay an old animation when OBS reloads the page
    if(!first&&at&&at!==lastAt)play(m.id,m.style);
    lastAt=at||lastAt;first=false;
  },err=>console.error(err));
}else{
  console.error(window.SMJFIREBASE_ERROR);
}
