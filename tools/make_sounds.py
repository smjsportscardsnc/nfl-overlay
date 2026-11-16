"""Builds the animation sound effects in assets/sounds.

  stomp.wav  - heavy stomp that hits when the graphic lands
  swoosh.wav - air swoosh for the fly-away at the end

Both are synthesized (no samples), so they are ours to use. Run:
  python3 tools/make_sounds.py
Needs numpy only.
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sounds")
rng = np.random.default_rng(7)


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


def hit(t, pitch=1.0):
    """One boot hitting a wooden stage, impact at t=0."""
    n = len(t)
    # deep boom with a fast pitch drop (kept short so it punches, not rumbles)
    f_sub = (46 + 80 * np.exp(-t / 0.03)) * pitch
    sub = 0.8 * np.sin(2 * np.pi * np.cumsum(f_sub) / SR) * np.exp(-t / 0.14)
    # chest punch in the range phone and laptop speakers can play
    f_body = (98 + 160 * np.exp(-t / 0.015)) * pitch
    body = 0.9 * np.sin(2 * np.pi * np.cumsum(f_body) / SR) * np.exp(-t / 0.06)
    # stage boards: two wooden resonances
    wood = rng.standard_normal(n)
    knock = (1.2 * svf_bandpass(wood, 185 * pitch, 3.0)
             + 0.8 * svf_bandpass(wood, 330 * pitch, 4.0)) * np.exp(-t / 0.075)
    # heel crack and the slap that gives it bite
    crack = 1.2 * onepole_lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.008)
    slap = 1.0 * svf_bandpass(rng.standard_normal(n), 1500 * pitch, 1.2) * np.exp(-t / 0.03)
    return sub + body + knock + crack + slap


def stomp():
    """A big stadium stomp: one heavy hit with a few others a hair behind it,
    then a short, dark arena tail. The impact is at t=0 so the page can time
    it to the moment the graphic lands."""
    t = t_axis(1.2)
    main = hit(t)
    left, right = main.copy(), main.copy()
    # a few extra feet landing within ~18ms makes it big without a flam
    for i in range(5):
        d = int(SR * rng.uniform(0.004, 0.018))
        h = 0.32 * hit(t, rng.uniform(0.92, 1.08))
        h = np.concatenate([np.zeros(d), h[:-d]])
        pan = rng.uniform(-0.8, 0.8)
        left += h * np.cos((pan + 1) * np.pi / 4) * 1.41
        right += h * np.sin((pan + 1) * np.pi / 4) * 1.41
    drive = 2.6
    left, right = np.tanh(drive * left / 3) , np.tanh(drive * right / 3)

    # dark arena tail
    tir = t_axis(1.0)
    decay = np.exp(-tir / 0.25)
    irl = onepole_lp(rng.standard_normal(len(tir)), 1600) * decay
    irr = onepole_lp(rng.standard_normal(len(tir)), 1600) * decay
    irl[: int(0.014 * SR)] = 0
    irr[: int(0.021 * SR)] = 0
    wl = fft_convolve(left, irl)
    wr = fft_convolve(right, irr)
    scale = 0.2 * max(np.max(np.abs(left)), np.max(np.abs(right))) / max(np.max(np.abs(wl)), np.max(np.abs(wr)))
    left = left + scale * wl
    right = right + scale * wr

    fade = np.clip((t[-1] - t) / 0.3, 0, 1)
    write("stomp.wav", left * fade, right * fade, -1.0)


def swoosh():
    """Air swoosh that passes left to right. Loudest at 0.38s, so the page
    starts it a little before the graphic flies off."""
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
    stomp()
    swoosh()
