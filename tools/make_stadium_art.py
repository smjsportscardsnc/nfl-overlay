"""Builds the night-stadium artwork in assets/stadium (the side panels of the Top overlay).

The pictures are drawn from scratch, in the look of the SMJ show thumbnails: a dark indigo sky
with lit clouds, banks of warm peach-gold floodlights with glow and star flares, wine-coloured
stands full of amber crowd sparkle, mauve haze, and a dark grainy field lit from the far edge.
Nothing is photographed or downloaded, so the pictures are ours to use. Run:

  python3 tools/make_stadium_art.py            (all eight)
  python3 tools/make_stadium_art.py 03 07      (just those)

Needs numpy and OpenCV: pip install opencv-python-headless
Each scene is a short description in SCENES (where the lights, tiers and field edge sit) plus a
seed, so a scene always comes out the same and a new seed gives a new crowd and sky.
"""
import os
import sys

import cv2
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "stadium")
PW, PH = 478, 800          # final panel picture
W, H = PW * 2, PH * 2      # working size

# Sparkle colours: mostly amber and orange, a little cream, rose and lilac.
WARM = ["#ff8a2e", "#ffa64a", "#ffc27a", "#ff6f3a", "#ffdcae", "#f08f8f", "#c9a6ff"]

# Positions are fractions of the picture (x from the left, y from the top).
#   horizon  where the stands meet the field
#   roof     top edge of the stands: (y at the sides, how far it sags in the middle, tilt)
#   bands    dark fronts of the upper tiers, each with a string of lights: (y, sag, tilt, thickness)
#   rows     extra rows of small lights across the stands: (y, sag, tilt, spacing in px)
#   banks    floodlight banks: centre, lamps across and down, lamp spacing, optional slant and size
#   xc       where the middle of the bowl is (0.5 = straight ahead); hot = brightest spot at the field edge
#   mirror   flip the finished picture left to right
SCENES = [
    ("01-near-tower", 11, dict(
        horizon=0.78, roof=(0.42, 0.02, 0.10), xc=0.75, hot=0.7,
        bands=[(0.515, 0.02, 0.07, 0.024), (0.585, 0.02, 0.05, 0.022)],
        rows=[(0.455, 0.02, 0.09, 56), (0.64, 0.02, 0.03, 84)],
        banks=[dict(cx=0.27, cy=0.235, cols=6, rows=4, dx=0.056, dy=0.037, sky=0.006, r=0.014, power=1.1),
               dict(cx=0.86, cy=0.42, cols=5, rows=2, dx=0.027, dy=0.018, r=0.0072, power=0.9)])),
    ("02-near-tower", 12, dict(
        mirror=True,
        horizon=0.76, roof=(0.40, 0.025, 0.09), xc=0.8, hot=0.65,
        bands=[(0.50, 0.02, 0.065, 0.024), (0.57, 0.02, 0.045, 0.022)],
        rows=[(0.44, 0.02, 0.08, 60), (0.63, 0.02, 0.03, 80)],
        banks=[dict(cx=0.30, cy=0.25, cols=5, rows=4, dx=0.058, dy=0.038, sky=0.005, r=0.0145, power=1.1),
               dict(cx=0.84, cy=0.405, cols=6, rows=1, dx=0.027, dy=0.016, r=0.0072, power=0.9)])),
    ("03-bowl-end", 21, dict(
        horizon=0.74, roof=(0.335, 0.03, 0.0),
        bands=[(0.425, 0.035, 0.0, 0.024), (0.490, 0.035, 0.0, 0.022)],
        rows=[(0.352, 0.032, 0.0, 60), (0.385, 0.034, 0.0, 52), (0.56, 0.035, 0.0, 80)],
        banks=[dict(cx=0.085, cy=0.292, cols=6, rows=3, dx=0.030, dy=0.021, sky=0.0045, skx=-0.004),
               dict(cx=0.915, cy=0.292, cols=6, rows=3, dx=0.030, dy=0.021, sky=-0.0045, skx=0.004),
               dict(cx=0.5, cy=0.362, cols=9, rows=1, dx=0.031, dy=0.02, power=1.15)])),
    ("04-light-rows", 22, dict(
        horizon=0.71, roof=(0.30, 0.045, 0.0),
        bands=[(0.39, 0.045, 0.0, 0.022), (0.455, 0.045, 0.0, 0.022), (0.525, 0.04, 0.0, 0.02)],
        rows=[(0.33, 0.045, 0.0, 58), (0.60, 0.035, 0.0, 84)],
        banks=[dict(cx=0.5, cy=0.335, cols=13, rows=1, dx=0.034, dy=0.02, power=1.1),
               dict(cx=0.13, cy=0.262, cols=6, rows=2, dx=0.034, dy=0.022, sky=0.006),
               dict(cx=0.87, cy=0.262, cols=6, rows=2, dx=0.034, dy=0.022, sky=-0.006)])),
    ("05-corner", 31, dict(
        horizon=0.75, roof=(0.31, 0.07, 0.0), xc=0.95, hot=0.75,
        bands=[(0.40, 0.07, 0.0, 0.024), (0.47, 0.065, 0.0, 0.022)],
        rows=[(0.345, 0.07, 0.0, 58), (0.55, 0.06, 0.0, 82)],
        banks=[dict(cx=0.20, cy=0.20, cols=5, rows=3, dx=0.046, dy=0.031, sky=0.008, r=0.012),
               dict(cx=0.78, cy=0.335, cols=7, rows=2, dx=0.028, dy=0.019, sky=0.002, r=0.008)])),
    ("06-corner", 32, dict(
        mirror=True,
        horizon=0.73, roof=(0.30, 0.075, 0.0), xc=1.0, hot=0.8,
        bands=[(0.39, 0.075, 0.0, 0.024), (0.46, 0.07, 0.0, 0.022)],
        rows=[(0.335, 0.075, 0.0, 60), (0.54, 0.065, 0.0, 80)],
        banks=[dict(cx=0.24, cy=0.19, cols=4, rows=4, dx=0.048, dy=0.032, sky=0.007, r=0.012),
               dict(cx=0.80, cy=0.33, cols=8, rows=1, dx=0.028, dy=0.019, r=0.008)])),
    ("07-twin-towers", 41, dict(
        horizon=0.72, roof=(0.345, 0.02, 0.0),
        bands=[(0.435, 0.022, 0.0, 0.024), (0.505, 0.022, 0.0, 0.022)],
        rows=[(0.375, 0.02, 0.0, 60), (0.58, 0.022, 0.0, 80)],
        banks=[dict(cx=0.22, cy=0.255, cols=5, rows=4, dx=0.040, dy=0.027, sky=0.004, r=0.0105),
               dict(cx=0.78, cy=0.255, cols=5, rows=4, dx=0.040, dy=0.027, sky=-0.004, r=0.0105)])),
    ("08-centre-bank", 42, dict(
        horizon=0.75, roof=(0.37, 0.03, 0.0),
        bands=[(0.46, 0.032, 0.0, 0.024), (0.53, 0.032, 0.0, 0.022)],
        rows=[(0.40, 0.03, 0.0, 58), (0.60, 0.03, 0.0, 82)],
        banks=[dict(cx=0.5, cy=0.27, cols=8, rows=3, dx=0.040, dy=0.027, r=0.0105, power=1.1),
               dict(cx=0.07, cy=0.35, cols=4, rows=2, dx=0.030, dy=0.02, sky=0.004),
               dict(cx=0.93, cy=0.35, cols=4, rows=2, dx=0.030, dy=0.02, sky=-0.004)])),
]


def hx(hexcolor):
    h = hexcolor.lstrip("#")
    return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32) / 255.0


def lum(f):
    return f[..., 0] * 0.114 + f[..., 1] * 0.587 + f[..., 2] * 0.299


def smooth(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def screen(a, b):
    return 1 - (1 - np.clip(a, 0, 1)) * (1 - np.clip(b, 0, 1))


def ramp(t, stops, colors):
    c = np.stack([hx(x) for x in colors])
    return np.stack([np.interp(t, np.array(stops, np.float32), c[:, k]) for k in range(3)], -1)


def fbm(rng, w, h, base=4, octaves=5, aspect=1.0):
    """Cloudy noise, 0..1. aspect < 1 stretches it sideways."""
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = rng.standard_normal((max(2, int(base * 2 ** o)), max(2, int(base * aspect * 2 ** o)))).astype(np.float32)
        out += cv2.resize(n, (w, h), interpolation=cv2.INTER_CUBIC) * amp
        total += amp
        amp *= 0.55
    out /= total
    return (out - out.min()) / (out.max() - out.min() + 1e-6)


def disc_kernel(r):
    n = int(np.ceil(r)) * 2 + 3
    c = n // 2
    yy, xx = np.mgrid[0:n, 0:n]
    d = np.hypot(xx - c, yy - c)
    return (np.clip(r + 0.5 - d, 0, 1) * (0.75 + 0.25 * np.clip(d / max(r, 1e-3), 0, 1))).astype(np.float32)


def splat(canvas, xs, ys, cols, r):
    """Add points of light (pixel positions, one colour each), drawn as soft discs of radius r."""
    imp = np.zeros_like(canvas)
    xi = np.clip(np.round(xs).astype(int), 0, W - 1)
    yi = np.clip(np.round(ys).astype(int), 0, H - 1)
    np.add.at(imp, (yi, xi), cols)
    if r < 1.2:
        imp = cv2.GaussianBlur(imp, (0, 0), max(r, 0.5)) * (2 * np.pi * max(r, 0.5) ** 2) ** 0.5
    else:
        imp = cv2.filter2D(imp, -1, disc_kernel(r))
    canvas += imp


def warm(rng, n, p=(0.30, 0.22, 0.10, 0.22, 0.05, 0.08, 0.03)):
    return np.stack([hx(c) for c in WARM])[rng.choice(len(WARM), n, p=p)]


LIGHTS = (0.45, 0.30, 0.15, 0.05, 0.05, 0, 0)   # colour mix for string lights: amber and cream only


def render(sc, seed=1):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    u, v = xx / W, yy / H
    xc = sc.get("xc", 0.5)
    hot = sc.get("hot", 0.5)
    hor = sc["horizon"]

    def curve(x, y0, sag, tilt=0.0):
        """Height of a tier line at x: it sags toward the middle of the bowl."""
        return y0 + sag * (1 - ((x - xc) * 2) ** 2) + tilt * (x - 0.5)

    roof = curve(u, *sc["roof"])

    # ---- sky: indigo, darker at the top, with clouds
    t = np.clip(v / np.maximum(roof, 1e-3), 0, 1)
    sky = ramp(t, [0, 0.3, 0.7, 1.0], ["#06050d", "#0f0f20", "#22233a", "#2f2f48"])
    cloud = smooth((fbm(rng, W, H, base=3, octaves=7, aspect=0.7) - 0.25) / 0.6)
    lit = cloud * smooth(t * 1.4)
    img = sky * (0.5 + 0.9 * lit[..., None])

    # ---- stands: wine-coloured, brighter toward the field, mottled
    st = smooth((v - roof) / 0.035) * smooth((hor + 0.004 - v) / 0.006)      # 1 inside the stands
    depth = np.clip((v - roof) / np.maximum(hor - roof, 1e-3), 0, 1)        # 0 top row, 1 at the field
    mott = fbm(rng, W, H, base=10, octaves=5, aspect=0.5)
    base = ramp(depth, [0, 0.35, 0.7, 1.0], ["#1c1020", "#1d0d18", "#34131a", "#6a2e2a"]) * (0.35 + 1.2 * mott[..., None])
    img = img * (1 - st[..., None]) + base * st[..., None]

    # ---- crowd sparkle: thousands of points, denser along the seat rows and toward the field
    glit = np.zeros((H, W, 3), np.float32)
    n = int(sc.get("crowd", 125000))
    px, py = rng.random(n) * W, (rng.random(n) ** 0.8) * H
    ok = st[py.astype(int), px.astype(int)] > 0.5
    px, py = px[ok], py[ok]
    d = depth[py.astype(int), px.astype(int)]
    keep = rng.random(len(px)) < (0.35 + 0.65 * d)
    px, py, d = px[keep], py[keep], d[keep]
    rw = fbm(rng, W, H, base=26, octaves=3, aspect=0.06)[py.astype(int), px.astype(int)]   # seat rows
    keep = rng.random(len(px)) < (0.25 + 0.9 * rw)
    px, py, d, rw = px[keep], py[keep], d[keep], rw[keep]
    clump = fbm(rng, W, H, base=7, octaves=4, aspect=0.35)[py.astype(int), px.astype(int)]
    br = ((rng.pareto(2.0, len(px)).astype(np.float32) + 0.15) * (0.48 + 0.85 * d ** 1.4)
          * (0.25 + 1.5 * rw) * (0.12 + 1.75 * clump ** 1.5) * sc.get("sparkle", 1.0))
    cols = warm(rng, len(px)) * np.clip(br, 0, 7)[:, None]
    size = rng.choice(4, len(px), p=(0.62, 0.27, 0.09, 0.02))
    for k, (r, gain) in enumerate([(1.0, 0.42), (1.9, 0.15), (3.4, 0.075), (6.0, 0.04)]):
        m = size == k
        splat(glit, px[m], py[m], cols[m] * gain, r)
    glit = glit + cv2.GaussianBlur(glit, (0, 0), 5) * 0.6 + cv2.GaussianBlur(glit, (0, 0), 22) * 0.9   # glow + warm air

    # ---- tier fronts: dark curved bands, each with a string of small lights
    for (y0, sag, tilt, th) in sc["bands"]:
        c = curve(u, y0, sag, tilt) + (mott - 0.5) * 0.004
        band = smooth((v - c) / 0.006) * smooth((c + th - v) / 0.008) * st
        img = img * (1 - 0.9 * band[..., None]) + hx("#150a16") * (0.8 + 0.5 * mott[..., None]) * 0.9 * band[..., None]
        glit *= 1 - 0.96 * band[..., None]
        m = int(W / 34)
        bx = (np.arange(m) + rng.random(m) * 0.5) / m
        by = curve(bx, y0, sag, tilt) + th * 0.55
        bc = warm(rng, m, LIGHTS) * (rng.random(m)[:, None] ** 2 * 7 + 0.6)
        splat(glit, bx * W, by * H, bc * 0.5, 2.2)
        splat(glit, bx * W, by * H, bc * 0.06, 8)
    for (y0, sag, tilt, spacing) in sc.get("rows", ()):
        m = int(W / spacing)
        bx = (np.arange(m) + rng.random(m) * 0.6) / m
        bx = bx[rng.random(m) < 0.7]
        by = curve(bx, y0, sag, tilt)
        bc = warm(rng, len(bx), LIGHTS) * (rng.random(len(bx))[:, None] ** 1.5 * 6 + 1.0)
        splat(glit, bx * W, by * H, bc * 0.5, 2.6)
        splat(glit, bx * W, by * H, bc * 0.05, 9)
    img = img + glit

    # ---- field: dark grainy surface, lit from the far edge
    dy = np.maximum(v - hor, 1e-4)
    n1 = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=1.1, sigmaY=0.6)
    n2 = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=2.0, sigmaY=1.1)
    near = smooth(dy / 0.22)
    grain = (n1 / n1.std() * (1 - 0.5 * near) + n2 / n2.std() * near) * smooth(dy / 0.02)   # finer far away
    sheen = fbm(rng, W, H, base=3, octaves=5, aspect=0.12)
    fall = np.exp(-dy / 0.068) * 0.9
    gl = np.clip(fall * (0.35 + 0.65 * np.exp(-((u - hot) / 0.55) ** 2)) * (0.45 + 1.1 * sheen), 0, 1)
    ground = ramp(gl, [0, 0.12, 0.35, 0.7, 1.0], ["#0a050c", "#170d1b", "#3d2439", "#875862", "#dba08c"])
    ground = ground * (1 + 0.30 * grain[..., None]) + 0.014 * np.clip(grain, 0, 3)[..., None] * hx("#c9a0a8")
    gmask = smooth((v - hor) / 0.004)[..., None]
    img = img * (1 - gmask) + ground * gmask

    # ---- lights along the field edge
    m = 24
    ex = (np.arange(m) + rng.random(m)) / m * W
    ey = np.full(m, hor * H) + rng.normal(0, 2.0, m)
    eb = (rng.random(m) ** 1.6 * 6 + 1.0) * (0.55 + 0.45 * np.exp(-((ex / W - hot) / 0.5) ** 2))
    ec = warm(rng, m, (0.4, 0.3, 0.2, 0.05, 0.05, 0, 0)) * eb[:, None]
    edge = np.zeros_like(img)
    splat(edge, ex, ey, ec * 0.6, 5.0)
    splat(edge, ex, ey, ec * 0.05, 13)
    img = img + edge + cv2.GaussianBlur(edge, (0, 0), 16) * 1.6 + cv2.GaussianBlur(edge, (0, 0), 50) * 2.2

    # ---- floodlight banks
    lamps = np.zeros((H, W, 3), np.float32)    # one bright pixel per lamp: the source for glow, flares and rays
    cores = np.zeros((H, W, 3), np.float32)
    for b in sc["banks"]:
        r = b.get("r", 0.0085) * W
        for j in range(b["rows"]):
            for i in range(b["cols"]):
                fx, fy = i - (b["cols"] - 1) / 2, j - (b["rows"] - 1) / 2
                x = (b["cx"] + fx * b["dx"] + fy * b.get("skx", 0)) * W
                y = (b["cy"] + fy * b["dy"] + fx * b.get("sky", 0)) * H
                p = b.get("power", 1.0) * (0.75 + 0.5 * rng.random())
                splat(cores, np.array([x]), np.array([y]), (hx("#ffe2ad") * p * 1.25)[None], r)
                splat(lamps, np.array([x]), np.array([y]), (hx("#ffd9b0") * p)[None], 0.8)
    core = cv2.GaussianBlur(cores, (0, 0), 1.6)

    def layer(sigma, peak):
        g = cv2.GaussianBlur(lum(lamps), (0, 0), sigma)
        return (g / max(float(g.max()), 1e-9) * peak)[..., None]

    halo = (layer(5, 0.45) * hx("#ffe2b0") + layer(16, 0.55) * hx("#ffb06a")
            + layer(48, 0.68) * hx("#f39672") + layer(130, 0.45) * hx("#b8707a"))
    halo = halo + layer(220, 1.0) * lit[..., None] * hx("#b98486") * 0.42          # clouds catch the light
    # star flares: thin spikes out of every lamp
    L = 160
    k = np.zeros((2 * L + 1, 2 * L + 1), np.float32)
    for ang in (0, 60, 120):
        for sgn in (-1, 1):
            for rr in range(2, L):
                kx = int(round(L + sgn * rr * np.cos(np.radians(ang))))
                ky = int(round(L + sgn * rr * np.sin(np.radians(ang))))
                k[ky, kx] += (1 - rr / L) ** 2.2 / (rr ** 0.55)
    flare = cv2.filter2D(lamps, -1, cv2.GaussianBlur(k, (0, 0), 0.7))
    flare = flare / max(float(np.percentile(flare, 99.9)), 1e-9) * 0.8
    # shafts of light spreading from each bank
    src = cv2.resize(cv2.GaussianBlur(lamps, (0, 0), 5), (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    src = src / max(float(src.max()), 1e-9)
    rays = np.zeros_like(src)
    for b in sc["banks"]:
        cx, cy = b["cx"] * W / 2, (b["cy"] - 0.02) * H / 2
        for q in range(26):
            s = 1 + q * 0.035
            rays += cv2.warpAffine(src, np.float32([[s, 0, cx * (1 - s)], [0, s, cy * (1 - s)]]), (W // 2, H // 2)) * (1 - q / 26) ** 0.8 / 26
    rays = np.maximum(rays, 0) ** 0.6 * (0.45 + 1.1 * fbm(rng, W // 2, H // 2, base=14, octaves=3, aspect=3.0)[..., None])
    rays = cv2.resize(rays, (W, H), interpolation=cv2.INTER_LINEAR)
    rays = rays / max(float(rays.max()), 1e-9) * hx("#ffc39c") * 0.6
    img = screen(screen(img, halo), rays)
    img = screen(screen(img, flare * hx("#ffe6cc")), core)

    # ---- haze, floating dust, finish
    hz = fbm(rng, W, H, base=3, octaves=4, aspect=0.6)
    hband = np.exp(-((v - sc.get("haze_y", (sc["roof"][0] + hor) / 2 - 0.1)) / 0.20) ** 2)
    img = screen(img, (hband * (0.5 + hz))[..., None] * hx("#8a5f70") * 0.27)
    low = np.exp(-((v - hor) / 0.05) ** 2) * np.exp(-((u - hot) / 0.6) ** 2)
    img = screen(img, low[..., None] * hx("#ffb98f") * 0.38)
    dust = np.zeros_like(img)
    dxs, dys, db = rng.random(260) * W, rng.random(260) * H, rng.random(260) ** 3
    for r, sel in ((3.5, db < 0.3), (7, (db >= 0.3) & (db < 0.8)), (13, db >= 0.8)):
        splat(dust, dxs[sel], dys[sel], warm(rng, int(sel.sum())) * (0.012 + 0.05 * db[sel, None]) * (3.5 / r) ** 1.2, r)
    img = screen(img, dust * smooth((v - 0.18) / 0.2)[..., None])
    img = img * 0.72 + cv2.GaussianBlur(img, (0, 0), 2.2) * 0.28                   # dreamy softness
    img = screen(img, cv2.GaussianBlur(np.clip(img - 0.7, 0, 1), (0, 0), 14) * 0.55)
    img = img * (1 - 0.62 * smooth((np.hypot((u - 0.5) * 1.15, (v - 0.48) * 0.95) - 0.42) / 0.5))[..., None]   # vignette
    img = np.clip(img, 0, 1)
    img = img * 0.7 + img * img * (3 - 2 * img) * 0.3                              # contrast
    img = img + cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), 0.9)[..., None] * 0.022
    out = cv2.resize((np.clip(img, 0, 1) * 255).astype(np.uint8), (PW, PH), interpolation=cv2.INTER_AREA)
    return out[:, ::-1].copy() if sc.get("mirror") else out


if __name__ == "__main__":
    only = sys.argv[1:]
    os.makedirs(OUT, exist_ok=True)
    for name, seed, scene in SCENES:
        if only and name[:2] not in only:
            continue
        print(name)
        cv2.imwrite(os.path.join(OUT, name + ".jpg"), render(scene, seed), [cv2.IMWRITE_JPEG_QUALITY, 90])
