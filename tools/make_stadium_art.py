"""Builds the painted night-stadium artwork in assets/stadium (the side panels of the Top overlay).

Each picture starts from a free Unsplash photo (listed in SCENES and in assets/stadium/CREDITS.txt),
has any team or sponsor marks taken out, and is then repainted: layered brush strokes, a shared
navy / steel-blue / gold night palette, glow and streaks from the lights, and a little canvas grain.
So the panels read as one set of illustrations, not as photographs. Run:

  python3 tools/make_stadium_art.py            (all eight)
  python3 tools/make_stadium_art.py 03 07      (just those)

Needs numpy and OpenCV with the contrib modules: pip install opencv-contrib-python-headless
The source photos are downloaded once into a temp folder (or put them there yourself as <photo-id>.jpg).
"""
import os
import sys
import tempfile
import urllib.request

import cv2
import numpy as np

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "stadium")
SRC = os.path.join(tempfile.gettempdir(), "smj-stadium-src")
PW, PH = 478, 800          # final panel picture
WW, WH = PW * 2, PH * 2    # working size

# name, photo id, crop (left, top, height as fractions of the photo; mirror), retouch steps, grade options.
# Retouch steps use final-picture pixels:
#   ("smear", (x0, y0, x1, y1), thickness)  turns a ribbon board along that line into a streak of light
#   ("unmark", [(x, y), ...])               paints a logo off the turf inside that outline
#   ("fill", (x0, y0, x1, y1))              paints a small mark out with what surrounds it
SCENES = [
    ("01-floodlights", "photo-1509928015542-fcc9b3bcd048", (0.0, 0.0, 1.0, False), [], {}),
    ("02-light-tower", "photo-1671723204288-1b3794effd87", (0.10, 0.0, 1.0, True), [], {}),
    ("03-football-night", "photo-1584484530553-df6bbdc47c89", (0.559, 0.0, 0.70, False),
     [("smear", (0, 405, 478, 415), 30), ("smear", (230, 440, 478, 452), 30),
      ("unmark", [(96, 716), (144, 716), (176, 728), (176, 744), (118, 744), (96, 726)])], {"turf": 0.22}),
    ("04-ballpark-lights", "photo-1682384157113-47285026d285", (0.67, 0.07, 0.86, False),
     [("smear", (78, 480, 478, 480), 30), ("fill", (0, 0, 84, 30))], {}),
    ("05-stadium-skyline", "photo-1573838886533-c90767b6e60e", (0.126, 0.0, 1.0, False), [], {}),
    ("06-light-banks", "photo-1556764420-e37ef4cdfa5c", (0.543, 0.086, 0.39, False), [], {}),
    ("07-dome-lights", "photo-1787762001721-0f30c8b6af94", (0.50, 0.10, 0.90, False),
     [("smear", (60, 570, 250, 578), 22), ("smear", (340, 598, 478, 604), 24)], {"turf": 0.30}),
    ("08-roof-lights", "photo-1489944440615-453fc2b6a9a9", (0.80, 0.0, 1.0, False), [], {}),
]


def source(photo):
    """Path of the source photo, downloading it the first time."""
    os.makedirs(SRC, exist_ok=True)
    path = os.path.join(SRC, photo + ".jpg")
    if not os.path.exists(path):
        url = "https://images.unsplash.com/%s?fm=jpg&q=88&w=3000&fit=max" % photo
        print("  downloading", url)
        urllib.request.urlretrieve(url, path)
    return path


def load_crop(photo, left, top, hfrac, mirror=False):
    im = cv2.imread(source(photo))
    ih, iw = im.shape[:2]
    ch = hfrac * ih
    cw = ch * PW / PH
    x = int(round(max(0, min(left * iw, iw - cw))))
    y = int(round(max(0, min(top * ih, ih - ch))))
    im = im[y:y + int(round(ch)), x:x + int(round(cw))]
    im = cv2.resize(im, (WW, WH), interpolation=cv2.INTER_AREA if im.shape[1] >= WW else cv2.INTER_LANCZOS4)
    return im[:, ::-1].copy() if mirror else im


def lum(f):
    return f[..., 0] * 0.114 + f[..., 1] * 0.587 + f[..., 2] * 0.299


def tone(im, mean=0.20):
    """Even out exposure so every scene sits in the same night range."""
    f = im.astype(np.float32) / 255.0
    hi = np.percentile(lum(f), 99.7)
    f = np.clip(f / max(hi, 0.5), 0, 1)
    m = float(lum(f).mean())
    g = float(np.clip(np.log(mean) / np.log(max(m, 1e-3)), 0.75, 1.9))
    return (np.clip(f ** g, 0, 1) * 255).astype(np.uint8)


def unmark(im, poly):
    """Inside the outline, everything that is not grass is filled back in from the grass around it."""
    k = WW / PW
    area = np.zeros(im.shape[:2], np.uint8)
    cv2.fillPoly(area, [np.array([[int(round(x * k)), int(round(y * k))] for x, y in poly], np.int32)], 255)
    b, g, r = [im[..., c].astype(np.int16) for c in range(3)]
    notgrass = ((g - np.maximum(r, b)) < 18).astype(np.uint8) * 255
    mask = cv2.dilate(cv2.bitwise_and(area, notgrass), np.ones((9, 9), np.uint8))
    mask = cv2.bitwise_and(mask, cv2.dilate(area, np.ones((5, 5), np.uint8)))
    return cv2.inpaint(im, mask, 7, cv2.INPAINT_TELEA)


def retouch(im, ops):
    """Take out team and sponsor marks before painting."""
    k = WW / PW
    for op in ops:
        if op[0] == "unmark":
            im = unmark(im, op[1])
            continue
        x0, y0, x1, y1 = [int(round(v * k)) for v in op[1]]
        mask = np.zeros(im.shape[:2], np.uint8)
        if op[0] == "smear":
            cv2.line(mask, (x0, y0), (x1, y1), 255, int(round(op[2] * k)))
            sm = cv2.blur(cv2.blur(im, (121, 3)), (121, 3))
            m = cv2.GaussianBlur(mask, (0, 0), 3).astype(np.float32)[..., None] / 255.0
            im = (im * (1 - m) + sm * m).astype(np.uint8)
        elif op[0] == "fill":
            cv2.rectangle(mask, (x0, y0), (x1, y1), 255, -1)
            im = cv2.inpaint(im, mask, 11, cv2.INPAINT_TELEA)
    return im


def paint(im, coarse=9, mid=5, fine=2):
    """Layered brush work: broad dabs everywhere, finer strokes only where there is an edge worth keeping."""
    den = cv2.fastNlMeansDenoisingColored(im, None, 7, 7, 5, 15)
    base = cv2.edgePreservingFilter(den, flags=cv2.RECURS_FILTER, sigma_s=40, sigma_r=0.35)
    half = cv2.resize(base, (WW // 2, WH // 2), interpolation=cv2.INTER_AREA)
    big = cv2.resize(cv2.xphoto.oilPainting(half, coarse, 1), (WW, WH), interpolation=cv2.INTER_CUBIC)
    med = cv2.xphoto.oilPainting(base, mid, 1)
    fin = cv2.xphoto.oilPainting(base, fine, 1)
    g = cv2.cvtColor(base, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    e = cv2.magnitude(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))
    e = cv2.GaussianBlur(e, (0, 0), 5)
    m1 = np.clip(e / 0.10, 0, 1)[..., None]              # some structure: medium strokes
    m2 = np.clip((e - 0.14) / 0.20, 0, 1)[..., None]     # strong edges and lights: fine strokes
    out = big.astype(np.float32) * (1 - m1) + med.astype(np.float32) * m1
    out = out * (1 - m2) + fin.astype(np.float32) * m2
    return np.clip(out, 0, 255).astype(np.uint8)


def grade(im, sat=1.22, glow=1.0, tint=0.30, turf=0.16, seed=1):
    """Night grade: navy shadows, a shared blue-to-gold palette, bloom and light streaks, canvas grain."""
    f = im.astype(np.float32) / 255.0
    s = f * f * (3 - 2 * f)
    f = f * 0.65 + s * 0.35                                           # contrast
    L = lum(f)[..., None]
    f = np.clip(L + (f - L) * sat, 0, 1)                              # saturation
    # fields: pull yellow-green turf toward a deeper night green
    b, g_, r = f[..., 0], f[..., 1], f[..., 2]
    green = np.clip((g_ - np.maximum(r * 0.92, b)) / np.maximum(g_, 1e-3) / 0.22, 0, 1)
    f = np.stack([(b + green * 0.04 * g_) * (1 - turf * 0.6 * green), g_ * (1 - turf * green),
                  r * (1 - 0.42 * green) * (1 - turf * 0.6 * green)], -1)
    # shared palette (BGR): navy -> steel blue -> warm gold -> white, mixed in by `tint`
    L = lum(f)
    stops = np.array([0, 0.35, 0.75, 1.0], np.float32)
    pal = np.array([[0.085, 0.035, 0.012], [0.52, 0.30, 0.12], [0.62, 0.82, 0.98], [1, 1, 1]], np.float32)
    tri = np.stack([np.interp(L, stops, pal[:, c]) for c in range(3)], -1)
    f = f * (1 - tint) + tri * tint
    L = lum(f)[..., None]
    f = np.clip(f + (1 - L) ** 3 * np.array([0.06, 0.028, 0.008], np.float32), 0, 1)   # lift shadows to navy
    # bloom: only from real lights (very bright and close to white)
    mx = f.max(-1, keepdims=True)
    mn = f.min(-1, keepdims=True)
    white = 1 - np.clip((mx - mn) / np.maximum(mx, 1e-3) / 0.55, 0, 1)
    bright = f * np.clip((lum(f)[..., None] - 0.80) / 0.20, 0, 1) ** 1.5 * white
    b1 = cv2.GaussianBlur(bright, (0, 0), 9)
    b2 = cv2.GaussianBlur(bright, (0, 0), 34)
    b3 = cv2.GaussianBlur(bright, (0, 0), 100)
    streak = cv2.GaussianBlur(bright, (0, 0), sigmaX=170, sigmaY=2.0) * np.array([1.0, 0.82, 0.62], np.float32)
    add = (0.7 * b1 + 0.9 * b2 + 0.9 * b3 + 0.5 * streak) * glow
    f = 1 - (1 - f) * (1 - np.clip(add, 0, 1))
    rng = np.random.default_rng(seed)                                 # canvas grain
    grain = cv2.GaussianBlur(rng.standard_normal(f.shape[:2]).astype(np.float32), (0, 0), 1.1)
    f = f + grain[..., None] * 0.02
    return (np.clip(f, 0, 1) * 255).astype(np.uint8)


def finish(im):
    out = cv2.resize(im, (PW, PH), interpolation=cv2.INTER_AREA)
    blur = cv2.GaussianBlur(out, (0, 0), 1.2)
    return cv2.addWeighted(out, 1.35, blur, -0.35, 0)   # crisp the strokes


def render(photo, crop, ops=(), mean=0.20, **kw):
    return finish(grade(paint(retouch(tone(load_crop(photo, *crop), mean), ops)), **kw))


if __name__ == "__main__":
    only = sys.argv[1:]
    os.makedirs(OUT, exist_ok=True)
    for i, (name, photo, crop, ops, kw) in enumerate(SCENES):
        if only and name[:2] not in only:
            continue
        print(name)
        cv2.imwrite(os.path.join(OUT, name + ".jpg"), render(photo, crop, ops, seed=i + 1, **kw),
                    [cv2.IMWRITE_JPEG_QUALITY, 88])
