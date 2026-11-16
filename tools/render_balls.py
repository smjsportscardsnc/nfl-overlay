"""Renders the shaded, spinning ball and puck sprite sheets used by js/sport-art.js.

Each sheet is one row of FRAMES frames (a full turn), written to assets/balls/.
Run from the repo root:  python3 tools/render_balls.py
Needs numpy and Pillow.
"""
import numpy as np
from PIL import Image

OUT = "assets/balls"
FRAMES = 24
SS = 3                                   # supersampling for smooth edges
LIGHT = np.array([-0.55, 0.65, 0.75]); LIGHT /= np.linalg.norm(LIGHT)
HALF = LIGHT + np.array([0, 0, 1.0]); HALF /= np.linalg.norm(HALF)


def normalize(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-9)


def rot(axis, ang):
    x, y, z = np.asarray(axis, float) / np.linalg.norm(axis)
    c, s, C = np.cos(ang), np.sin(ang), 1 - np.cos(ang)
    return np.array([[c + x*x*C, x*y*C - z*s, x*z*C + y*s],
                     [y*x*C + z*s, c + y*y*C, y*z*C - x*s],
                     [z*x*C - y*s, z*y*C + x*s, c + z*z*C]])


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def grid(w, h, span=1.0):
    W, H = w * SS, h * SS
    xs = ((np.arange(W) + .5) / W * 2 - 1) * span
    ys = -((np.arange(H) + .5) / H * 2 - 1) * span * h / w
    return np.meshgrid(xs, ys)


def hash3(ix, iy, iz):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)
    h &= 0xffffffff
    h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff
    return (h & 0xffff) / 65535.0


def vnoise(p, f):
    q = p * f
    i = np.floor(q).astype(np.int64)
    u = q - i
    u = u * u * (3 - 2 * u)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (u[..., 0] if dx else 1 - u[..., 0]) * (u[..., 1] if dy else 1 - u[..., 1]) * (u[..., 2] if dz else 1 - u[..., 2])
                out = out + w * hash3(i[..., 0] + dx, i[..., 1] + dy, i[..., 2] + dz)
    return out


def bump(n, field, k):
    gy, gx = np.gradient(field)
    return normalize(n + k * np.dstack([-gx, gy, np.zeros_like(gx)]))


def shade(base, n, amb, spec_pow, spec_amt, ao=1.0):
    diff = np.clip(n @ LIGHT, 0, 1)[..., None]
    spec = (np.clip(n @ HALF, 0, 1) ** spec_pow * spec_amt)[..., None]
    return base * (amb + (1 - amb) * 1.05 * diff) * ao + spec


def finish(rgb, alpha, w, h):
    a = np.clip(alpha, 0, 1)[..., None]
    pre = np.dstack([np.clip(rgb, 0, 1) * a, a])
    im = Image.fromarray((pre * 255 + .5).astype(np.uint8), "RGBA").resize((w, h), Image.LANCZOS)
    arr = np.asarray(im).astype(np.float32) / 255
    al = arr[..., 3:4]
    rgb2 = np.where(al > 0, arr[..., :3] / np.maximum(al, 1e-6), 0)
    return Image.fromarray((np.dstack([np.clip(rgb2, 0, 1), al]) * 255 + .5).astype(np.uint8), "RGBA")


def sphere(size, R=0.94):
    X, Y = grid(size, size)
    r = np.sqrt(X * X + Y * Y)
    Z = np.sqrt(np.clip(R * R - r * r, 0, None))
    n = np.dstack([X, Y, Z]) / R
    alpha = 1 - smooth(R - 0.01, R + 0.004, r)
    ao = (0.55 + 0.45 * Z / R)[..., None]
    return n, alpha, ao


def basketball(f, size=128):
    n, alpha, ao = sphere(size)
    M = rot([0.35, 1, 0.15], 2 * np.pi * f / FRAMES) @ rot([1, 0, 0], 0.55)
    p = n @ M
    d = np.minimum.reduce([np.abs(p[..., 1]), np.abs(p[..., 0]), np.abs(np.abs(p[..., 0]) - 0.62)])
    w = 0.026
    seam = 1 - smooth(w * 0.55, w, d)
    halo = 1 - smooth(w, w * 2.4, d)
    peb = vnoise(p, 58)
    nb = bump(n, peb * (1 - seam), 0.9)
    base = np.array([0.86, 0.40, 0.11]) * (0.9 + 0.16 * vnoise(p, 5))[..., None]
    base = base * (0.86 + 0.22 * smooth(0.4, 0.8, peb))[..., None]
    leather = shade(base, nb, 0.2, 28, 0.22, ao)
    groove = shade(np.array([0.05, 0.035, 0.025]), n, 0.25, 20, 0.12, ao)
    rgb = leather * (1 - 0.4 * halo * (1 - seam))[..., None]
    rgb = rgb * (1 - seam[..., None]) + groove * seam[..., None]
    return finish(rgb, alpha, size, size)


def baseball(f, size=128):
    n, alpha, ao = sphere(size)
    M = rot([1, 0.25, 0.1], 2 * np.pi * f / FRAMES) @ rot([0.3, 1, 0], 0.7)
    p = n @ M
    a, b = 0.68, 0.32
    t = np.linspace(0, 2 * np.pi, 480, endpoint=False)
    C = np.stack([a * np.cos(t) + b * np.cos(3 * t), a * np.sin(t) - b * np.sin(3 * t), 2 * np.sqrt(a * b) * np.sin(2 * t)], 1)
    T = np.stack([-a * np.sin(t) - 3 * b * np.sin(3 * t), a * np.cos(t) - 3 * b * np.cos(3 * t), 4 * np.sqrt(a * b) * np.cos(2 * t)], 1)
    side_axis = normalize(np.cross(C, T))
    flat = p.reshape(-1, 3).astype(np.float32)
    idx = np.empty(len(flat), np.int64); best = np.empty(len(flat), np.float32)
    for s in range(0, len(flat), 20000):
        dots = flat[s:s + 20000] @ C.T.astype(np.float32)
        idx[s:s + 20000] = dots.argmax(1); best[s:s + 20000] = dots.max(1)
    dist = np.arccos(np.clip(best, -1, 1)).reshape(p.shape[:2])
    tn = t[idx].reshape(p.shape[:2])
    side = np.sign(np.einsum("ij,ij->i", flat, side_axis[idx])).reshape(p.shape[:2])
    groove = 1 - smooth(0.012, 0.022, dist)
    band = smooth(0.02, 0.03, dist) * (1 - smooth(0.07, 0.085, dist))
    phase = np.sin(108 * tn + side * dist * 55)
    stitch = band * smooth(0.15, 0.45, phase)
    base = np.array([0.95, 0.93, 0.88]) * (0.94 + 0.08 * vnoise(p, 9))[..., None]
    base = base * (1 - 0.18 * groove)[..., None]
    nb = bump(n, vnoise(p, 70) * 0.5 - groove * 0.8, 0.5)
    leather = shade(base, nb, 0.3, 18, 0.16, ao)
    red = shade(np.array([0.80, 0.07, 0.09]), nb, 0.3, 30, 0.25, ao)
    rgb = leather * (1 - stitch[..., None]) + red * stitch[..., None]
    return finish(rgb, alpha, size, size)


def football(f, size=128):
    X, Y = grid(size, size)
    a, b, k = 0.94, 0.53, 0.7
    xr = np.clip(X / a, -0.9999, 0.9999)
    rad = b * (1 - xr * xr) ** k
    inside = np.abs(Y) < rad
    Z = np.sqrt(np.clip(rad * rad - Y * Y, 0, None))
    drad = b * k * (1 - xr * xr) ** (k - 1) * (-2 * X / (a * a))
    n = normalize(np.dstack([-rad * drad, Y, Z]))
    edge = rad - np.abs(Y)
    alpha = smooth(-0.004, 0.012, edge) * (np.abs(X) < a)
    phi = 2 * np.pi * f / FRAMES
    th = np.arctan2(Z, Y) - phi + np.pi / 4
    u = X / a
    q = np.pi / 2
    dth = (th + q / 2) % q - q / 2                      # angle to the nearest panel seam
    arc = np.abs(dth) * rad
    seam = 1 - smooth(0.006, 0.012, arc)
    lace_seam = np.abs(((th - q / 2 + np.pi) % (2 * np.pi)) - np.pi) * rad   # distance to the laced seam
    lace_zone = np.abs(u) < 0.42
    bars = ((u + 0.42) / 0.84 * 8) % 1
    lace = lace_zone * (1 - smooth(0.05, 0.065, lace_seam)) * smooth(0.18, 0.26, bars) * (1 - smooth(0.62, 0.7, bars))
    lace = np.maximum(lace, (np.abs(u) < 0.46) * (1 - smooth(0.008, 0.014, lace_seam)))
    p3 = np.dstack([u * 2.2, np.cos(th), np.sin(th)])
    peb = vnoise(p3, 30)
    nb = bump(n, peb * (1 - lace) + lace * 1.5, 0.7)
    base = np.array([0.50, 0.23, 0.09]) * (0.86 + 0.24 * smooth(0.35, 0.8, peb))[..., None]
    base = base * (1 - 0.35 * smooth(0.6, 1.0, np.abs(u)))[..., None]
    ao = (0.55 + 0.45 * np.clip(Z / np.maximum(rad, 1e-3), 0, 1))[..., None]
    leather = shade(base, nb, 0.2, 26, 0.24, ao)
    dark = shade(np.array([0.12, 0.05, 0.02]), n, 0.25, 20, 0.1, ao)
    white = shade(np.array([0.97, 0.95, 0.91]), nb, 0.35, 30, 0.3, ao)
    rgb = leather * (1 - seam[..., None]) + dark * seam[..., None]
    rgb = rgb * (1 - lace[..., None]) + white * lace[..., None]
    return finish(rgb, alpha * inside, size, size)


def puck(f, w=128, h=96):
    X, Y = grid(w, h, span=1.06)
    hh = 0.33
    R = rot([1, 0, 0], np.radians(25))               # tilt so we look down onto the top face
    Rt = R.T
    o = np.dstack([X, Y, np.full_like(X, 5.0)]) @ Rt.T
    d = np.array([0, 0, -1.0]) @ Rt.T
    big = 1e9
    t_top = (hh - o[..., 1]) / d[1]
    q_top = o + t_top[..., None] * d
    r_top = np.sqrt(q_top[..., 0] ** 2 + q_top[..., 2] ** 2)
    t_top = np.where(r_top <= 1, t_top, big)
    A = d[0] ** 2 + d[2] ** 2
    B = 2 * (o[..., 0] * d[0] + o[..., 2] * d[2])
    Cq = o[..., 0] ** 2 + o[..., 2] ** 2 - 1
    disc = B * B - 4 * A * Cq
    t_side = (-B - np.sqrt(np.clip(disc, 0, None))) / (2 * A)
    q_side = o + t_side[..., None] * d
    t_side = np.where((disc >= 0) & (np.abs(q_side[..., 1]) <= hh), t_side, big)
    top = t_top <= t_side
    hit = np.minimum(t_top, t_side) < big
    q = np.where(top[..., None], q_top, q_side)
    n_obj = np.where(top[..., None], np.array([0, 1.0, 0]), normalize(np.dstack([q_side[..., 0], np.zeros_like(X), q_side[..., 2]])))
    n = n_obj @ R.T
    phi = 2 * np.pi * f / FRAMES
    th = np.arctan2(q[..., 2], q[..., 0]) + phi
    r = np.sqrt(q[..., 0] ** 2 + q[..., 2] ** 2)
    knurl = (0.5 + 0.5 * np.sin(th * 64)) * (np.abs(q[..., 1]) < hh * 0.72)
    ring = smooth(0.58, 0.6, r) * (1 - smooth(0.64, 0.66, r))
    rim = smooth(0.93, 0.99, r)
    g = np.where(top, 0.10 + 0.04 * ring + 0.10 * rim + 0.025 * vnoise(q, 40), 0.075 + 0.08 * knurl)
    base = np.dstack([g, g, g * 1.06])
    rgb = shade(base, n, 0.38, 10, 0.38)
    # soft anti-aliased silhouette from the hit mask
    alpha = hit.astype(float)
    return finish(rgb, alpha, w, h)


def sheet(name, fn, **kw):
    frames = [fn(i, **kw) for i in range(FRAMES)]
    w, h = frames[0].size
    out = Image.new("RGBA", (w * FRAMES, h))
    for i, fr in enumerate(frames):
        out.paste(fr, (i * w, 0))
    out.save(f"{OUT}/{name}.png", optimize=True)
    print(name, out.size)


if __name__ == "__main__":
    sheet("basketball", basketball)
    sheet("baseball", baseball)
    sheet("football", football)
    sheet("puck", puck)
