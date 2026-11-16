"""Builds the animation sound effects in assets/sounds.

  stomp.wav  - deep, heavy stomp that hits when the graphic lands
  swoosh.wav - air swoosh for the fly-away at the end

Both are synthesized (no samples), so they are ours to use. Run:
  python3 tools/make_sounds.py          (both)
  python3 tools/make_sounds.py stomp    (just one)
Needs numpy only.
"""
import os
import sys
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
rng = np.random.default_rng(7)  # each sound reseeds this, so they build independently


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def onepole_lp(x, hz):
    a = np.exp(-2 * np.pi * hz / SR)
    y = np.empty_like(x)
    s = 0.0
    for i, v in enumerate(x):
        s = (1 - a) * v + a * s
        y[i] = s
    return y


def svf_bandpass(x, hz, q):
    """TPT state-variable band-pass; hz may be an array (a sweep)."""
    hz = np.broadcast_to(np.asarray(hz, dtype=float), x.shape)
    g = np.tan(np.pi * np.clip(hz, 20, SR * 0.45) / SR)
    k = 1.0 / q
    y = np.empty_like(x)
    ic1 = ic2 = 0.0
    for i, v in enumerate(x):
        gi = g[i]
        a1 = 1.0 / (1.0 + gi * (gi + k))
        v1 = a1 * ic1 + gi * a1 * (v - ic2)
        v2 = ic2 + gi * v1
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        y[i] = v1
    return y


def fft_convolve(x, h):
    n = len(x) + len(h) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(h, size), size)[: len(x)]


def write(name, left, right, peak_db):
    st = np.stack([left, right], axis=1)
    st *= 10 ** (peak_db / 20) / np.max(np.abs(st))
    pcm = (st * 32767).astype("<i2")
    path = os.path.join(OUT, name)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {os.path.normpath(path)} ({len(left) / SR:.2f}s)")


def stomp():
    """A deep, heavy stomp: a big low boom with a dull thud on top and a
    dark rumble after it, like a giant foot landing in an arena. The impact
    is at t=0 so the page can time it to the moment the graphic lands."""
    global rng
    rng = np.random.default_rng(11)
    t = t_axis(1.6)
    n = len(t)
    # the boom: starts around 75Hz and sinks to 34Hz, rings for a while
    f_boom = 34 + 41 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f_boom) / SR) * np.exp(-t / 0.42)
    # chest punch an octave up so the hit has weight on smaller speakers
    f_punch = 64 + 90 * np.exp(-t / 0.025)
    punch = 0.85 * np.sin(2 * np.pi * np.cumsum(f_punch) / SR) * np.exp(-t / 0.12)
    f_body = 100 + 60 * np.exp(-t / 0.02)
    punch += 0.35 * np.sin(2 * np.pi * np.cumsum(f_body) / SR) * np.exp(-t / 0.05)
    # dull thud of the foot: dark noise, no crack
    thud = 0.9 * onepole_lp(onepole_lp(rng.standard_normal(n), 420), 420) * np.exp(-t / 0.035)
    thud /= np.max(np.abs(thud[:2000]))
    thud *= 0.55
    # low rumble that hangs after the hit
    rumble = onepole_lp(onepole_lp(rng.standard_normal(n), 110), 110)
    rumble *= 0.5 / np.max(np.abs(rumble)) * np.clip(t / 0.03, 0, 1) * np.exp(-t / 0.5)
    dry = boom + punch + thud + rumble
    # gentle warm saturation: adds overtones of the boom (so it is heard on
    # phones) while it still sounds low
    dry = np.tanh(2.2 * (dry + 0.35 * dry * dry)) / np.tanh(2.2)
    dry -= onepole_lp(dry, 18)  # keep it centered (no DC from the overtones)

    # very dark, big room
    tir = t_axis(1.4)
    decay = np.exp(-tir / 0.38)
    irl = onepole_lp(onepole_lp(rng.standard_normal(len(tir)), 700), 700) * decay
    irr = onepole_lp(onepole_lp(rng.standard_normal(len(tir)), 700), 700) * decay
    irl[: int(0.02 * SR)] = 0
    irr[: int(0.028 * SR)] = 0
    wl = fft_convolve(dry, irl)
    wr = fft_convolve(dry, irr)
    scale = 0.22 * np.max(np.abs(dry)) / max(np.max(np.abs(wl)), np.max(np.abs(wr)))
    left = dry + scale * wl
    right = dry + scale * wr

    fade = np.clip((t[-1] - t) / 0.4, 0, 1) * np.clip(t / 0.0005, 0, 1)
    write("stomp.wav", left * fade, right * fade, -1.0)


def swoosh():
    """Air swoosh that passes left to right. Loudest at 0.38s, so the page
    starts it a little before the graphic flies off."""
    global rng
    rng = np.random.default_rng(7)
    dur, tp = 0.95, 0.38
    t = t_axis(dur)
    env = np.where(t < tp, (t / tp) ** 2.2, np.exp(-(t - tp) / 0.14))
    # filter sweeps up as it approaches, then drops as it goes past
    rise = np.clip(t / tp, 0, 1)
    fall = np.clip((t - tp) / (dur - tp), 0, 1)
    center = np.where(t < tp, 320 + (2300 - 320) * rise ** 1.6, 2300 - (2300 - 700) * fall ** 0.6)
    noise = rng.standard_normal(len(t))
    air = (svf_bandpass(noise, center, 1.3)
           + 0.55 * svf_bandpass(noise, center * 0.45, 1.0)
           + 0.45 * svf_bandpass(noise, center * 0.18, 0.9))  # low wind body
    hiss = 0.12 * svf_bandpass(rng.standard_normal(len(t)), 6000, 0.8)
    mono = (air + hiss) * env

    # equal-power pan from left to right across the pass
    pan = np.clip(-0.7 + 1.4 * (t / dur) ** 0.9, -1, 1)
    ang = (pan + 1) * np.pi / 4
    left, right = mono * np.cos(ang), mono * np.sin(ang)
    fade = np.clip((dur - t) / 0.12, 0, 1) * np.clip(t / 0.01, 0, 1)
    write("swoosh.wav", left * fade, right * fade, -1.0)


if __name__ == "__main__":
    for name in sys.argv[1:] or ["stomp", "swoosh"]:
        {"stomp": stomp, "swoosh": swoosh}[name]()
