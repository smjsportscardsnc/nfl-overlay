class SMJGraphicSwoosh {
  constructor(){
    this.layer = document.getElementById("graphicLayer");
    this.image = document.getElementById("graphicImage");
    this.audio = document.getElementById("graphicAudio");

    this.graphics = {
      stash: "assets/graphics/stash-or-pass.png",
      choose: "assets/graphics/spin-2-choose-1.png"
    };

    // OBS/browser audio unlock
    this.audio.volume = 1.0;
    this.audio.muted = false;

    window.addEventListener("click", () => {
      try {
        this.audio.play().then(() => {
          this.audio.pause();
          this.audio.currentTime = 0;
        }).catch(()=>{});
      } catch(e){}
    }, { once:true });
  }

  trigger(key="stash"){
    const src = this.graphics[key] || this.graphics.stash;

    this.image.src = src + "?v=" + Date.now();
    this.layer.classList.remove("hidden");
    this.layer.classList.remove("active");

    void this.layer.offsetWidth;

    this.layer.classList.add("active");

    // Clone audio each trigger so rapid triggers still work
    try {
      const sfx = this.audio.cloneNode(true);
      sfx.volume = 1.0;
      sfx.muted = false;
      sfx.currentTime = 0;
      sfx.play().catch(err => console.warn("Audio playback blocked:", err));
    } catch(err){
      console.warn("Audio trigger failed:", err);
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      this.layer.classList.remove("active");
      this.layer.classList.add("hidden");
      this.image.removeAttribute("src");
    }, 3350);
  }
}

window.SMJGraphicSwoosh = new SMJGraphicSwoosh();
