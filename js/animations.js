// Full-screen animation player (animations.html).
// Listens for smjOverlay/current/moment {id, at, style} from the control panel.
const PATH="smjOverlay/current";

const stage=document.getElementById("stage"),
graphic=document.getElementById("graphic"),
img=document.getElementById("graphicImg"),
shine=document.getElementById("shine");


const swoosh=new Audio("assets/sounds/swoosh.wav");
swoosh.preload="auto";
function sound(volume,delay=0){
  setTimeout(()=>{try{const a=swoosh.cloneNode();a.volume=volume;a.play().catch(()=>{})}catch(e){}},delay);
}

// Preload every graphic so the first play is instant
Object.values(window.SMJ_MOMENTS||{}).forEach(m=>{const i=new Image();i.src=m.image});

const HOLD=2500; // ms the graphic stays on screen between entrance and exit

// Clean, broadcast-style motion: one smooth move in, a slow push while it holds,
// one smooth move out. No bounces.
const EXPO_OUT="cubic-bezier(.16,1,.3,1)",EXPO_IN="cubic-bezier(.7,0,.84,0)";
const STYLES={
  flip:{
    label:"Flip",
    in:{frames:[
      {transform:"translateZ(-220px) rotateX(10deg) rotateY(-80deg) scale(.82)",opacity:0,filter:"blur(14px)"},
      {transform:"translateZ(0) rotateX(0) rotateY(0) scale(1)",opacity:1,filter:"blur(0)"}],duration:950,easing:EXPO_OUT},
    out:{frames:[
      {transform:"translateZ(0) rotateX(0) rotateY(0) scale(1)",opacity:1,filter:"blur(0)"},
      {transform:"translateZ(-220px) rotateX(-6deg) rotateY(80deg) scale(.85)",opacity:0,filter:"blur(12px)"}],duration:600,easing:EXPO_IN}
  },
  reveal:{
    label:"Reveal",
    in:{frames:[
      {transform:"scale(1.2)",opacity:0,filter:"blur(20px)"},
      {transform:"scale(1)",opacity:1,filter:"blur(0)"}],duration:800,easing:EXPO_OUT},
    out:{frames:[
      {transform:"scale(1)",opacity:1,filter:"blur(0)"},
      {transform:"scale(.92)",opacity:0,filter:"blur(14px)"}],duration:500,easing:EXPO_IN}
  },
  slide:{
    label:"Slide",
    in:{frames:[
      {transform:"translateX(55vw) skewX(-10deg)",opacity:0,filter:"blur(16px)"},
      {transform:"translateX(0) skewX(0)",opacity:1,filter:"blur(0)"}],duration:750,easing:EXPO_OUT},
    out:{frames:[
      {transform:"translateX(0) skewX(0)",opacity:1,filter:"blur(0)"},
      {transform:"translateX(-55vw) skewX(10deg)",opacity:0,filter:"blur(16px)"}],duration:500,easing:EXPO_IN}
  }
};
window.SMJ_ANIM_STYLES=STYLES;

let running=[],timer=null;
function stopAll(){running.forEach(a=>a.cancel());running=[];clearTimeout(timer)}
function run(el,frames,opts){const a=el.animate(frames,{fill:"forwards",...opts});running.push(a);return a}

function play(id,styleName){
  const m=window.SMJ_MOMENTS&&window.SMJ_MOMENTS[id];
  if(!m)return;
  const st=STYLES[styleName]||STYLES.flip;
  stopAll();
  img.src=m.image;
  shine.style.setProperty("--img",`url("${m.image}")`);

  // entrance
  run(graphic,st.in.frames,{duration:st.in.duration});
  sound(1);

  // slow push-in for the whole time it's on screen (uses the separate scale property)
  run(graphic,[{scale:"1"},{scale:"1.035"}],{duration:st.in.duration+HOLD+st.out.duration,easing:"linear"});

  // one light sheen across the artwork as it settles
  run(shine,[{opacity:1,backgroundPosition:"120% 0"},{opacity:1,backgroundPosition:"-20% 0"}],{duration:1100,delay:st.in.duration*.45,easing:"cubic-bezier(.45,0,.2,1)"});

  // exit
  timer=setTimeout(()=>{
    run(graphic,st.out.frames,{duration:st.out.duration});
    sound(.5);
    setTimeout(stopAll,st.out.duration+50);
  },st.in.duration+HOLD);
}
window.playMoment=play; // for testing: playMoment("stash-or-pass","flip")

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
