
class SMJSwoop {
  constructor() {
    this.layer = document.getElementById("swoopLayer");
    this.title = document.getElementById("swoopTitle");
    this.subtitle = document.getElementById("swoopSubtitle");
    this.kicker = document.getElementById("swoopKicker");
    this.audio = document.getElementById("swoopAudio");

    this.configs = {
      hit: {
        kicker: "SMJ HIT ALERT",
        title: "MONSTER HIT",
        subtitle: "BOOM!",
        sound: "assets/sounds/hit.wav"
      },

      full: {
        kicker: "SMJ BREAK STATUS",
        title: "BREAK FULL",
        subtitle: "LET'S RIP",
        sound: "assets/sounds/full.wav"
      },

      stash: {
        kicker: "SMJ MINI GAME",
        title: "STASH OR PASS",
        subtitle: "KEEP IT OR MOVE IT",
        sound: "assets/sounds/swoosh.wav"
      },

      winner: {
        kicker: "SMJ GIVEAWAY",
        title: "WINNER",
        subtitle: "CONGRATS!",
        sound: "assets/sounds/winner.wav"
      }
    };
  }

  trigger(mode = "hit") {
    const cfg = this.configs[mode] || this.configs.hit;

    this.kicker.textContent = cfg.kicker;
    this.title.textContent = cfg.title;
    this.subtitle.textContent = cfg.subtitle;

    this.layer.classList.remove("hidden");

    void this.layer.offsetWidth;

    this.layer.classList.add("active");

    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = cfg.sound;

    this.audio.play().catch(() => {});

    setTimeout(() => {
      this.layer.classList.remove("active");
      this.layer.classList.add("hidden");
    }, 3200);
  }
}

window.SMJSwoop = new SMJSwoop();
