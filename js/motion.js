class SMJMotionEngine {
  constructor() {
    this.layer = document.getElementById("motionLayer");
    this.canvas = document.getElementById("motionCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.hud = document.getElementById("motionHud");
    this.kicker = document.getElementById("motionKicker");
    this.title = document.getElementById("motionTitle");
    this.subtitle = document.getElementById("motionSubtitle");
    this.active = false;
    this.startTime = 0;
    this.duration = 4300;
    this.mode = "hit";
    this.particles = [];
    this.lastFrame = 0;
    this.configs = {
      hit: { kicker:"SMJ HIT ALERT", title:"MONSTER HIT", subtitle:"BOOM!", a:"#ff3f2e", b:"#ffd84a", energy:1.25 },
      stash: { kicker:"SMJ MINI GAME", title:"STASH OR PASS", subtitle:"KEEP IT OR MOVE IT", a:"#00aaff", b:"#ff5050", energy:1.0 },
      choose: { kicker:"SMJ DECISION TIME", title:"CHOOSE 1", subtitle:"SPIN 2 • MAKE THE CALL", a:"#ff5050", b:"#00d2ff", energy:1.05 },
      full: { kicker:"SMJ BREAK STATUS", title:"BREAK FULL", subtitle:"LET'S RIP", a:"#00e676", b:"#00aaff", energy:.95 },
      giveaway: { kicker:"SMJ GIVEAWAY", title:"WINNER", subtitle:"CONGRATS!", a:"#a855f7", b:"#ffd84a", energy:1.05 },
      starting: { kicker:"SMJ LIVE", title:"STARTING SOON", subtitle:"GET READY", a:"#00aaff", b:"#8b5cf6", energy:.85 }
    };
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = 1920;
    this.canvas.height = 1080;
  }

  trigger(mode="hit") {
    this.mode = mode;
    const cfg = this.configs[mode] || this.configs.hit;
    this.kicker.textContent = cfg.kicker;
    this.title.textContent = cfg.title;
    this.subtitle.textContent = cfg.subtitle;
    this.subtitle.style.color = cfg.b;
    this.title.style.textShadow = `0 0 24px ${cfg.a}, 0 0 70px ${cfg.a}66`;
    this.layer.classList.remove("hidden");
    this.active = true;
    this.startTime = performance.now();
    this.lastFrame = this.startTime;
    this.seedParticles(cfg);
    requestAnimationFrame((now) => this.frame(now));
  }

  seedParticles(cfg) {
    this.particles = [];
    const count = Math.floor(170 * cfg.energy);
    for (let i=0;i<count;i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 12 * cfg.energy;
      this.particles.push({
        x: 960 + (Math.random()-.5)*180,
        y: 540 + (Math.random()-.5)*120,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed*.62,
        life: .6 + Math.random()*.95,
        age: 0,
        size: 1.5 + Math.random()*4,
        color: Math.random() > .45 ? cfg.a : cfg.b
      });
    }
  }

  hexToRgb(hex) {
    const h = hex.replace("#","");
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }

  rgba(hex, a) {
    const [r,g,b] = this.hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  easeOutCubic(t){ return 1 - Math.pow(1-t,3); }
  easeInOut(t){ return t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
  clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

  roundedRect(ctx,x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  drawBackground(ctx, p, cfg) {
    const W=1920,H=1080;
    ctx.clearRect(0,0,W,H);

    let g = ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,1050);
    g.addColorStop(0, this.rgba(cfg.a,.32));
    g.addColorStop(.35, "rgba(2,8,22,.96)");
    g.addColorStop(1, "rgba(0,0,0,.96)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.globalAlpha = .38;
    ctx.translate(W/2,H/2);
    ctx.rotate(-0.08 + p*.08);
    for(let x=-1800; x<1800; x+=190){
      const grad = ctx.createLinearGradient(x, -900, x+130, 900);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(.5, this.rgba(cfg.a,.28));
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(x + (p*900)%190, -900, 52, 1800);
    }
    ctx.restore();

    // stadium scan lines
    ctx.globalAlpha = .10;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for(let y=0; y<H; y+=34){
      ctx.beginPath();
      ctx.moveTo(0,y + Math.sin(p*12+y*.02)*4);
      ctx.lineTo(W,y + Math.sin(p*12+y*.02)*4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // light flares
    for(let i=0;i<6;i++){
      const x = 210 + i*310 + Math.sin(p*8+i)*55;
      const y = 110 + Math.sin(p*7+i)*28;
      const flare = ctx.createRadialGradient(x,y,0,x,y,190);
      flare.addColorStop(0,"rgba(255,255,255,.55)");
      flare.addColorStop(.22,this.rgba(i%2?cfg.a:cfg.b,.30));
      flare.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle = flare;
      ctx.beginPath(); ctx.arc(x,y,190,0,Math.PI*2); ctx.fill();
    }
  }

  drawChromePanel(ctx, p, cfg) {
    const slam = this.easeOutCubic(this.clamp((p-.08)/.25,0,1));
    const scale = .78 + .22*slam;
    const W = 1260*scale, H = 410*scale;
    const x = 960-W/2, y = 540-H/2+8;
    ctx.save();
    ctx.globalAlpha = this.clamp((p-.04)/.18,0,1);

    for(let i=0;i<6;i++){
      ctx.strokeStyle = this.rgba(cfg.a, .08*(6-i));
      ctx.lineWidth = 8+i*8;
      this.roundedRect(ctx,x-i*9,y-i*9,W+i*18,H+i*18,38+i*8);
      ctx.stroke();
    }

    const grad = ctx.createLinearGradient(x,y,x+W,y+H);
    grad.addColorStop(0,"rgba(9,20,45,.94)");
    grad.addColorStop(.42,"rgba(0,0,0,.82)");
    grad.addColorStop(.72,this.rgba(cfg.a,.28));
    grad.addColorStop(1,"rgba(15,28,56,.93)");
    ctx.fillStyle = grad;
    this.roundedRect(ctx,x,y,W,H,38);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = this.rgba(cfg.a,.95);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x+46,y+48); ctx.lineTo(x+W-46,y+48); ctx.stroke();
    ctx.strokeStyle = this.rgba(cfg.b,.82);
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x+46,y+H-48); ctx.lineTo(x+W-46,y+H-48); ctx.stroke();

    // cut-in chrome shards
    ctx.fillStyle = "rgba(255,255,255,.075)";
    ctx.beginPath();
    ctx.moveTo(x+60,y+80); ctx.lineTo(x+260,y+80); ctx.lineTo(x+170,y+H-80); ctx.lineTo(x-10,y+H-80); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x+W-260,y+80); ctx.lineTo(x+W-40,y+80); ctx.lineTo(x+W+10,y+H-80); ctx.lineTo(x+W-165,y+H-80); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  drawShockwaves(ctx, p, cfg) {
    for(let i=0;i<5;i++){
      const t = (p*2.1 + i*.22) % 1;
      const r = 120 + t*940;
      ctx.strokeStyle = this.rgba(i%2?cfg.a:cfg.b, (1-t)*.35);
      ctx.lineWidth = 5 + (1-t)*8;
      ctx.beginPath();
      ctx.ellipse(960,540,r,r*.52,0,0,Math.PI*2);
      ctx.stroke();
    }
  }

  drawParticles(ctx, dt, cfg) {
    for(const part of this.particles){
      part.age += dt/1000;
      part.x += part.vx * (dt/16);
      part.y += part.vy * (dt/16);
      part.vx *= .992;
      part.vy *= .992;
      const alpha = Math.max(0, 1 - part.age/part.life);
      ctx.fillStyle = this.rgba(part.color, alpha*.9);
      ctx.shadowColor = part.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  drawModeElements(ctx, p, cfg) {
    const W=1920,H=1080;
    if(this.mode==="stash"){
      this.drawSideCard(ctx, 120, 280, 260, 520, "STASH", cfg.a, p);
      this.drawSideCard(ctx, W-380, 280, 260, 520, "PASS", cfg.b, p);
    }
    if(this.mode==="choose"){
      this.drawSideCard(ctx, 120, 300, 310, 480, "1", cfg.a, p, 152);
      this.drawSideCard(ctx, W-430, 300, 310, 480, "2", cfg.b, p, 152);
    }
    if(this.mode==="full"){
      for(let i=0;i<10;i++){
        const x=170+i*175;
        const y=810+Math.sin(p*20+i)*18;
        ctx.fillStyle=this.rgba(cfg.a,.55);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+46,y+80);
        ctx.lineTo(x-46,y+80);
        ctx.closePath();
        ctx.fill();
      }
    }
    if(this.mode==="hit"){
      for(let i=0;i<70;i++){
        const a=(i/70)*Math.PI*2+p*4;
        const r=150+p*850;
        const x=960+Math.cos(a)*r;
        const y=540+Math.sin(a)*r*.55;
        ctx.strokeStyle=this.rgba(i%2?cfg.a:cfg.b, Math.max(0,.55-p*.5));
        ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(960,540); ctx.lineTo(x,y); ctx.stroke();
      }
    }
  }

  drawSideCard(ctx,x,y,w,h,label,color,p,size=48){
    ctx.save();
    ctx.globalAlpha = this.clamp((p-.12)/.25,0,1);
    ctx.fillStyle=this.rgba(color,.18);
    this.roundedRect(ctx,x,y,w,h,30); ctx.fill();
    ctx.strokeStyle=this.rgba(color,.95); ctx.lineWidth=5; ctx.stroke();
    ctx.font=`900 ${size}px Arial`;
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillStyle="white"; ctx.shadowColor=color; ctx.shadowBlur=22;
    ctx.fillText(label,x+w/2,y+h/2);
    ctx.restore();
  }

  frame(now) {
    if(!this.active) return;
    const elapsed = now - this.startTime;
    const dt = now - this.lastFrame;
    this.lastFrame = now;
    const p = this.clamp(elapsed / this.duration, 0, 1);
    const cfg = this.configs[this.mode] || this.configs.hit;
    const ctx = this.ctx;

    this.drawBackground(ctx,p,cfg);
    this.drawShockwaves(ctx,p,cfg);
    this.drawModeElements(ctx,p,cfg);
    this.drawParticles(ctx,dt,cfg);
    this.drawChromePanel(ctx,p,cfg);

    // HUD timing
    const inT = this.easeOutCubic(this.clamp((p-.10)/.28,0,1));
    const outT = this.easeInOut(this.clamp((p-.82)/.16,0,1));
    const scale = .82 + .18*inT - .08*outT;
    const alpha = this.clamp((p-.05)/.18,0,1) * (1-outT);
    this.hud.style.opacity = alpha;
    this.hud.style.transform = `translateY(${(-40+40*inT) - 30*outT}px) scale(${scale})`;

    // entrance/exit fade
    this.layer.style.opacity = p < .08 ? p/.08 : (p > .88 ? (1-p)/.12 : 1);

    if(elapsed >= this.duration){
      this.active = false;
      this.layer.classList.add("hidden");
      this.layer.style.opacity = 1;
      return;
    }
    requestAnimationFrame((n)=>this.frame(n));
  }
}

window.SMJMotion = new SMJMotionEngine();
