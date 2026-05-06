class SMJGraphicSwoosh {
  constructor(){
    this.layer = document.getElementById("graphicLayer");
    this.image = document.getElementById("graphicImage");
    this.audio = document.getElementById("graphicAudio");

    this.graphics = {
      stash: "assets/graphics/stash-or-pass.png",
      choose: "assets/graphics/spin-2-choose-1.png"
    };
  }

  trigger(key="stash"){
    const src = this.graphics[key] || this.graphics.stash;

    this.image.src = src + "?v=" + Date.now();
    this.layer.classList.remove("hidden");
    this.layer.classList.remove("active");

    void this.layer.offsetWidth;

    this.layer.classList.add("active");

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.play().catch(()=>{});

    clearTimeout(this.timer);
    this.timer = setTimeout(()=>{
      this.layer.classList.remove("active");
      this.layer.classList.add("hidden");
      this.image.removeAttribute("src");
    }, 3350);
  }
}

window.SMJGraphicSwoosh = new SMJGraphicSwoosh();
