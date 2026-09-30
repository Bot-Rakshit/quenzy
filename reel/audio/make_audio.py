"""Original soundtrack + sound design for the Quenzy reel, synthesized from scratch.

120 BPM (beat = 0.5s, bar = 2s), matching the visual timeline in src/scenes.js.
Reads build/cues.json (SFX hit list exported by the renderer) and writes
build/soundtrack.wav (48 kHz stereo).
"""
import json
import os

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 72.6
BEAT = 0.5
BAR = 2.0
N = int(SR * DUR)
rs = np.random.default_rng(7)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, 'build')


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(SR * d)) / SR


def filt(x, kind, f, order=2):
    if kind == 'band':
        sos = butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], btype='band', output='sos')
    else:
        sos = butter(order, f / (SR / 2), btype=kind, output='sos')
    return sosfilt(sos, x)


def env(n, a=0.005, d=0.2, s=0.0, r=0.05, hold=None):
    """ADSR-ish envelope of length n samples."""
    t = np.arange(n) / SR
    e = np.ones(n)
    if a > 0:
        e = np.minimum(e, t / a)
    dec = np.exp(-np.maximum(t - a, 0) / max(d, 1e-4)) * (1 - s) + s
    e = e * dec
    if r > 0:
        tail = (n / SR - t)
        e *= np.clip(tail / r, 0, 1)
    return e


def noise(n):
    return rs.uniform(-1, 1, n)


def saw(f, t):
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR) if np.ndim(f) else f * t
    return 2 * (ph % 1) - 1


def square(f, t, duty=0.5):
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR) if np.ndim(f) else f * t
    return np.where((ph % 1) < duty, 1.0, -1.0)


def tri(f, t):
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR) if np.ndim(f) else f * t
    return 2 * np.abs(2 * (ph % 1) - 1) - 1


def sine(f, t):
    ph = np.cumsum(np.broadcast_to(f, t.shape) / SR) if np.ndim(f) else f * t
    return np.sin(2 * np.pi * ph)


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, t0, sig, gain=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if i >= N:
            return
        if i < 0:
            sig = sig[-i:]
            i = 0
        sig = sig[: N - i]
        l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
        r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
        self.L[i:i + len(sig)] += sig * gain * l
        self.R[i:i + len(sig)] += sig * gain * r


# =============================== INSTRUMENTS ===============================
def kick(big=False):
    t = tt(0.45)
    f = 45 + 120 * np.exp(-t / 0.035) + (40 * np.exp(-t / 0.01) if big else 0)
    body = sine(f, t) * np.exp(-t / (0.22 if big else 0.16))
    click = filt(noise(len(t)), 'high', 2000) * np.exp(-t / 0.004) * 0.5
    return np.tanh((body + click) * 1.6)


def clap():
    t = tt(0.3)
    n = filt(noise(len(t)), 'band', (900, 5000))
    e = np.zeros(len(t))
    for k, d in enumerate([0, 0.011, 0.022]):
        e += (t >= d) * np.exp(-np.maximum(t - d, 0) / (0.006 if k < 2 else 0.09))
    return n * e * 0.9


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = filt(noise(len(t)), 'high', 7000)
    return n * np.exp(-t / (0.07 if open_ else 0.015))


def snare():
    t = tt(0.25)
    n = filt(noise(len(t)), 'band', (1500, 8000)) * np.exp(-t / 0.06)
    b = sine(190 * (1 + 0.3 * np.exp(-t / 0.01)), t) * np.exp(-t / 0.05)
    return n * 0.8 + b * 0.5


def bass_note(m, d, bright=1.0):
    t = tt(d)
    f = mtof(m)
    x = saw(f, t) * 0.6 + square(f / 2, t) * 0.4
    x = filt(x, 'low', 300 + 900 * bright)
    return np.tanh(x * 1.4) * env(len(t), 0.003, 0.25, 0.6, 0.03)


def supersaw(ms, d, cutoff=3000):
    t = tt(d)
    x = np.zeros(len(t))
    for m in ms:
        for det in (-0.12, -0.06, 0, 0.06, 0.12):
            x += saw(mtof(m + det), t + rs.uniform(0, 0.01))
    x = filt(x / (len(ms) * 5), 'low', cutoff)
    return x * env(len(t), 0.01, 1.0, 0.8, 0.08)


def pluck(m, d, bright=4000):
    t = tt(d)
    f = mtof(m)
    x = square(f, t, 0.3) * 0.5 + saw(f * 1.005, t) * 0.5
    x = filt(x, 'low', bright)
    return x * np.exp(-t / 0.18) * env(len(t), 0.002, 10, 1, 0.02)


def pizz(m, d):
    t = tt(d)
    f = mtof(m)
    x = tri(f, t) * 0.7 + sine(2 * f, t) * 0.3
    return x * np.exp(-t / 0.09) * env(len(t), 0.002, 10, 1, 0.01)


def bassoon(m, d):
    t = tt(d)
    f = mtof(m)
    x = filt(square(f, t, 0.25), 'low', 600)
    return x * env(len(t), 0.01, 0.12, 0.3, 0.03)


def pad(ms, d):
    t = tt(d)
    x = np.zeros(len(t))
    for m in ms:
        x += sine(mtof(m), t) + 0.3 * tri(mtof(m) * 1.002, t)
    return filt(x / len(ms), 'low', 1800) * env(len(t), 0.4, 3, 0.9, 0.5)


def bell(f, d=1.2):
    t = tt(d)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / (dd)) for r, a, dd in
            [(1, 1, 0.8), (2.76, 0.5, 0.3), (5.4, 0.25, 0.15), (8.9, 0.12, 0.08)])
    return x * env(len(t), 0.001, 10, 1, 0.05)


# =============================== SFX ===============================
def sfx_crack():
    t = tt(1.4)
    snap = filt(noise(len(t)), 'high', 3000) * np.exp(-t / 0.006) * 1.2
    hiss = filt(noise(len(t)), 'band', (3000, 12000)) * (np.minimum(t / 0.02, 1) * np.exp(-t / 0.35)) * 0.7
    fizz = np.zeros(len(t))
    idx = rs.integers(0, len(t), 400)
    fizz[idx] = rs.uniform(-1, 1, 400) * np.exp(-t[idx] / 0.6)
    fizz = filt(fizz, 'high', 4000) * 2.2
    return snap + hiss + fizz


def sfx_slam():
    t = tt(0.7)
    boom = sine(40 + 80 * np.exp(-t / 0.05), t) * np.exp(-t / 0.25)
    thwack = filt(noise(len(t)), 'band', (200, 3000)) * np.exp(-t / 0.03)
    return np.tanh((boom * 1.2 + thwack * 0.8) * 1.5) * 0.9


def sfx_impact():
    t = tt(1.4)
    sub = sine(30 + 90 * np.exp(-t / 0.08), t) * np.exp(-t / 0.5)
    crash = filt(noise(len(t)), 'high', 2500) * np.exp(-t / 0.4) * 0.4
    thwack = filt(noise(len(t)), 'band', (150, 2500)) * np.exp(-t / 0.05)
    return np.tanh((sub * 1.4 + crash + thwack) * 1.4)


def sfx_whoosh(d=0.45):
    t = tt(d)
    n = noise(len(t))
    out = np.zeros(len(t))
    # sweep via chunked band-pass
    chunks = 24
    for k in range(chunks):
        a, b = k * len(t) // chunks, (k + 1) * len(t) // chunks
        fc = 300 * (12 ** (k / chunks))
        out[a:b] = filt(n, 'band', (fc * 0.6, fc * 1.6))[a:b]
    shape = np.sin(np.pi * t / d) ** 2
    return out * shape * 1.6


def sfx_pop():
    t = tt(0.12)
    f = 350 + 900 * (t / 0.12)
    return sine(f, t) * np.exp(-t / 0.03) * 0.8


def sfx_plop(n=0):
    t = tt(0.3)
    f = 1000 * np.exp(-t / 0.05) + 180 + n * 15
    body = sine(f, t) * np.exp(-t / 0.07)
    spl = filt(noise(len(t)), 'band', (800, 5000)) * np.exp(-np.maximum(t - 0.03, 0) / 0.05) * (t > 0.03) * 0.3
    return body + spl


def sfx_boing():
    t = tt(0.6)
    f = 180 + 220 * np.minimum(t / 0.12, 1) + 40 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.3)
    return sine(f, t) * np.exp(-t / 0.25) * 0.7


def sfx_stamp():
    t = tt(0.35)
    thud = sine(90 + 60 * np.exp(-t / 0.02), t) * np.exp(-t / 0.08)
    sl = filt(noise(len(t)), 'low', 1500) * np.exp(-t / 0.02)
    return np.tanh((thud + sl) * 2) * 0.9


def sfx_groan():
    # sad trombone: wah wah wah wahhh
    notes = [(0.0, 62, 0.25), (0.28, 61, 0.25), (0.56, 60, 0.25), (0.84, 59, 0.6)]
    out = np.zeros(int(SR * 1.5))
    for s, m, d in notes:
        t = tt(d)
        vib = 1 + (0.02 * np.sin(2 * np.pi * 6 * t) if d > 0.5 else 0)
        f = mtof(m - 12) * vib
        x = saw(f, t)
        wah = 0.5 + 0.5 * np.sin(np.pi * np.minimum(t / d, 1))
        x = filt(x, 'low', 900) * wah * env(len(t), 0.02, 10, 1, 0.05)
        i = int(s * SR)
        out[i:i + len(x)] += x
    return out * 0.9


def sfx_gag():
    t = tt(0.55)
    f = 140 + 30 * np.sin(2 * np.pi * 11 * t)
    x = filt(saw(f, t) + 0.6 * noise(len(t)), 'low', 700 + 500 * np.sin(np.pi * t / 0.55).mean())
    return x * np.sin(np.pi * t / 0.55) * 0.8


def sfx_splash():
    t = tt(0.9)
    wash = filt(noise(len(t)), 'band', (500, 6000)) * np.exp(-t / 0.2) * 0.6
    drops = np.zeros(len(t))
    for _ in range(14):
        s = rs.uniform(0, 0.6)
        tt_ = tt(0.08)
        d = sine(rs.uniform(900, 2400) * (1 + 2 * tt_), tt_) * np.exp(-tt_ / 0.02)
        i = int(s * SR)
        drops[i:i + len(d)] += d * 0.35
    return wash + drops


def sfx_sparkle():
    out = np.zeros(int(SR * 1.2))
    for k, m in enumerate([84, 88, 91, 96, 100]):
        b = bell(mtof(m), 0.8) * 0.25
        i = int(k * 0.05 * SR)
        out[i:i + len(b)] += b
    return out


def sfx_aww():
    # soft harp glissando up
    out = np.zeros(int(SR * 1.8))
    for k, m in enumerate([60, 64, 67, 72, 76, 79, 84, 88]):
        t = tt(1.0)
        x = (tri(mtof(m), t) * 0.6 + sine(mtof(m) * 2, t) * 0.2) * np.exp(-t / 0.4)
        i = int(k * 0.06 * SR)
        out[i:i + len(x)] += x * 0.3
    return out


def sfx_swap():
    t = tt(0.18)
    return sine(300 + 2500 * (t / 0.18) ** 2, t) * np.sin(np.pi * t / 0.18) * 0.5


def sfx_scribble():
    t = tt(0.4)
    n = filt(noise(len(t)), 'band', (1500, 6000))
    return n * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * t)) ** 2 * 0.7


def sfx_tick():
    t = tt(0.03)
    return filt(noise(len(t)), 'high', 3000) * np.exp(-t / 0.004) + sine(2200, t) * np.exp(-t / 0.006) * 0.5


def sfx_ding():
    return bell(mtof(88), 1.6) * 0.6 + bell(mtof(95), 1.6) * 0.35


def sfx_riser(d):
    t = tt(d)
    k = t / d
    n = noise(len(t))
    out = np.zeros(len(t))
    chunks = 40
    for c in range(chunks):
        a, b = c * len(t) // chunks, (c + 1) * len(t) // chunks
        fc = 400 * (20 ** (c / chunks))
        out[a:b] = filt(n, 'band', (fc * 0.7, fc * 1.4))[a:b]
    tone = saw(150 * 2 ** (k * 3), t) * 0.15
    return (out * 0.8 + filt(tone, 'low', 3000)) * k ** 2


SFX = {
    'crack': (sfx_crack, 0.8), 'slam': (sfx_slam, 0.85), 'impact': (sfx_impact, 0.8), 'whoosh': (sfx_whoosh, 0.55),
    'pop': (sfx_pop, 0.5), 'boing': (sfx_boing, 0.55), 'stamp': (sfx_stamp, 0.8), 'groan': (sfx_groan, 0.55),
    'gag': (sfx_gag, 0.6), 'splash': (sfx_splash, 0.6), 'sparkle': (sfx_sparkle, 0.45), 'aww': (sfx_aww, 0.5),
    'plop': (sfx_plop, 0.6), 'swap': (sfx_swap, 0.5), 'scribble': (sfx_scribble, 0.5), 'tick': (sfx_tick, 0.5), 'ding': (sfx_ding, 0.6),
}


# =============================== ARRANGEMENT ===============================
def build_music():
    drums, bass, chords, lead, fx = Bus(), Bus(), Bus(), Bus(), Bus()
    kicks = []

    K, KB, CL, HC, HO, SN = kick(), kick(True), clap(), hat(), hat(True), snare()

    DROP = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]  # C G Am F
    DROP_ROOT = [36, 31, 33, 29]
    MIN = [(57, 60, 64), (53, 57, 60), (55, 60, 64), (55, 59, 62)]  # Am F C G
    MIN_ROOT = [33, 29, 36, 31]
    HOOK = [
        [(0, 72, .5), (.75, 74, .25), (1, 76, .5), (1.5, 79, .5), (2.5, 76, .5), (3, 74, .5), (3.5, 72, .5)],
        [(0, 74, .5), (.75, 76, .25), (1, 79, .75), (2, 81, .5), (2.5, 79, .5), (3, 76, 1)],
        [(0, 76, .5), (.5, 72, .5), (1, 76, .5), (1.5, 79, .5), (2.5, 84, .5), (3, 81, 1)],
        [(0, 79, .5), (.5, 77, .5), (1, 76, .5), (1.5, 74, .5), (2, 72, 1), (3.5, 74, .5)],
    ]
    HOOK_B = [  # variation for the flavour run
        [(0, 79, .5), (.5, 76, .25), (.75, 79, .25), (1, 84, .5), (2, 79, .5), (2.5, 76, .5), (3, 72, 1)],
        [(0, 74, .5), (.5, 79, .5), (1, 83, .5), (1.5, 81, .5), (2, 79, 1), (3.5, 74, .5)],
        [(0, 76, .5), (.5, 81, .5), (1, 84, .75), (2, 83, .5), (2.5, 81, .5), (3, 79, 1)],
        [(0, 77, .5), (.5, 81, .5), (1, 79, .5), (1.5, 77, .5), (2, 76, .5), (2.5, 74, .5), (3, 72, 1)],
    ]
    SNEAK = [
        [57, None, 60, None, 64, 62, 60, 59],
        [57, None, 60, None, 65, 64, 62, 60],
        [55, None, 60, None, 64, 62, 60, 64],
        [62, None, 67, None, 59, None, 62, None],
    ]

    def drop_bar(b, variant=0, lead_on=True, big=False):
        t0 = b * BAR
        ci = b % 4
        for q in range(4):
            tb = t0 + q * BEAT
            drums.add(tb, KB if (big and q == 0) else K, 0.9)
            kicks.append(tb)
            drums.add(tb + BEAT / 2, HO, 0.22, 0.2)
            for s in range(4):
                drums.add(tb + s * BEAT / 4, HC, 0.12 if s % 2 else 0.07, -0.3)
            if q in (1, 3):
                drums.add(tb, CL, 0.55, 0.05)
            # bass: offbeat octave bounce
            r = DROP_ROOT[ci]
            bass.add(tb, bass_note(r, 0.22, 0.6), 0.55)
            bass.add(tb + BEAT / 2, bass_note(r + 12, 0.2, 1.0), 0.45)
        chords.add(t0, supersaw([m + 12 * 0 for m in DROP[ci]] + [DROP[ci][0] + 12], BAR, 3500), 0.5)
        if lead_on:
            ph = (HOOK if variant == 0 else HOOK_B)[ci]
            for s, m, d in ph:
                lead.add(t0 + s * BEAT, pluck(m, d * BEAT + 0.15), 0.32, 0.15 * (1 if m % 2 else -1))

    def sneak_bar(b, dark=False):
        t0 = b * BAR
        ci = b % 4
        for q in range(4):
            tb = t0 + q * BEAT
            if q in (0, 2):
                drums.add(tb, K, 0.75)
                kicks.append(tb)
            if q in (1, 3):
                drums.add(tb, SN, 0.28 if dark else 0.35)
            drums.add(tb + BEAT / 2, HC, 0.1)
            drums.add(tb, HC, 0.06)
            bass.add(tb, bassoon(MIN_ROOT[ci] + 12, 0.3), 0.55)
        for k, m in enumerate(SNEAK[ci]):
            if m is not None:
                lead.add(t0 + k * BEAT / 2, pizz(m, 0.25), 0.4 if not dark else 0.25, -0.2 if k % 2 else 0.2)
        chords.add(t0, pad(MIN[ci], BAR), 0.14 if not dark else 0.1)

    # --- HOOK 0-4s: punchy drums + minor bass
    for b in (0, 1):
        t0 = b * BAR
        for q in range(4):
            tb = t0 + q * BEAT
            drums.add(tb, K, 0.85)
            kicks.append(tb)
            drums.add(tb + BEAT / 2, HC, 0.12)
            if q in (1, 3):
                drums.add(tb, CL, 0.5)
            bass.add(tb, bass_note([33, 29][b], 0.35, 0.7), 0.6)
        chords.add(t0, pad(MIN[b], BAR), 0.14)
    # --- EXHIBIT A 4-14s
    for b in range(2, 7):
        sneak_bar(b)
    # --- EXHIBIT B 14-22s (darker, then build)
    for b in range(7, 9):
        sneak_bar(b, dark=True)
    # build 18-21.75
    # accelerating snare roll: quarters -> 8ths -> 16ths
    roll_t = [18 + i * 0.25 for i in range(8)] + [20 + i * 0.125 for i in range(8)] + [21 + i * 0.0625 for i in range(12)]
    for i, tb in enumerate(roll_t):
        drums.add(tb, SN, 0.15 + 0.4 * i / len(roll_t))
    for i, tb in enumerate([18 + q * BEAT for q in range(6)]):
        drums.add(tb, K, 0.7)
        kicks.append(tb)
    fx.add(18.0, sfx_riser(3.75), 0.5)
    # --- DROP 22-40s (reveal + stats)
    for b in range(11, 20):
        drop_bar(b, 0, True, big=(b == 11))
    # --- FLAVOURS 40-58s
    for b in range(20, 29):
        drop_bar(b, 1, True, big=(b in (20, 23, 26)))
    # --- PROOF 58-64s breakdown
    for b in range(29, 32):
        t0 = b * BAR
        ci = b % 4
        chords.add(t0, pad([m + 12 for m in DROP[ci]], BAR), 0.22)
        bass.add(t0, bass_note(DROP_ROOT[ci], 1.8, 0.3), 0.4)
        if b >= 30:
            for q in (0, 2):
                drums.add(t0 + q * BEAT, K, 0.6)
                kicks.append(t0 + q * BEAT)
        for k, (s, m, d) in enumerate(HOOK[ci][:4]):
            lead.add(t0 + s * BEAT, pizz(m, 0.3), 0.3)
    fx.add(62.0, sfx_riser(2.0), 0.4)
    for i in range(8):
        drums.add(63.0 + i * 0.125, SN, 0.15 + 0.05 * i)
    # --- CTA 64-71s final drop
    for b in range(32, 35):
        drop_bar(b, 0, True, big=(b == 32))
    # bar 35: final hit at 71.0 and ring out
    drop_bar_t = 70.0
    for q in range(2):
        drums.add(drop_bar_t + q * BEAT, K, 0.9)
        kicks.append(drop_bar_t + q * BEAT)
        bass.add(drop_bar_t + q * BEAT, bass_note(31, 0.22), 0.55)
    chords.add(70.0, supersaw([55, 59, 62, 67], 1.0, 3500), 0.5)
    drums.add(71.0, KB, 1.0)
    chords.add(71.0, supersaw([60, 64, 67, 72, 76], 1.6, 4500), 0.6)
    bass.add(71.0, bass_note(36, 1.5, 0.5), 0.7)
    lead.add(71.0, pluck(84, 1.2), 0.3)

    # filters for dark section: low-pass the sneak section 14-18 (lead+chords)
    def lp_region(bus, a, b, fc):
        i, j = int(a * SR), int(b * SR)
        for ch in (bus.L, bus.R):
            ch[i:j] = filt(ch[i:j], 'low', fc)
    lp_region(lead, 14.0, 18.0, 1200)
    lp_region(chords, 14.0, 18.0, 900)
    # silence gap before the drop (tension)
    for bus in (drums, bass, chords, lead):
        i, j = int(21.78 * SR), int(22.0 * SR)
        bus.L[i:j] *= 0
        bus.R[i:j] *= 0

    # sidechain pump on chords/bass from kicks
    sc = np.ones(N)
    tvec = np.arange(N) / SR
    for kt in kicks:
        i = int(kt * SR)
        j = min(N, i + int(0.3 * SR))
        seg = tvec[i:j] - kt
        sc[i:j] = np.minimum(sc[i:j], 1 - 0.65 * np.exp(-seg / 0.09))
    for bus in (chords, bass):
        bus.L *= sc
        bus.R *= sc
    return drums, bass, chords, lead, fx


def reverb(x, secs=1.2, mix=0.2):
    n = int(secs * SR)
    ir = rs.standard_normal(n) * np.exp(-np.arange(n) / SR / (secs / 5))
    ir = filt(ir, 'low', 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x + wet * mix


def limiter(L, R, target_rms_db=-15.0, ceiling=0.93):
    """Makeup gain to a target RMS, then a 5ms look-ahead peak limiter."""
    rms = np.sqrt(np.mean((L ** 2 + R ** 2) / 2))
    g = 10 ** (target_rms_db / 20) / rms
    L, R = L * g, R * g
    look = int(0.005 * SR)
    pk = np.maximum(np.abs(L), np.abs(R))
    # running max over the look-ahead window
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(pk, size=2 * look + 1)
    gain = np.minimum(1.0, ceiling / np.maximum(pk, 1e-9))
    # smooth: instant attack (already look-ahead), ~80ms release
    rel = np.exp(-1 / (0.08 * SR))
    from scipy.signal import lfilter
    # release smoothing via min-hold then one-pole on the gain-reduction
    gr = 1 - gain
    gr_s = lfilter([1 - rel], [1, -rel], gr)
    gr = np.maximum(gr, gr_s)
    gain = 1 - gr
    L, R = L * gain, R * gain
    return np.clip(L, -ceiling, ceiling), np.clip(R, -ceiling, ceiling)


def main():
    cues = json.load(open(os.path.join(BUILD, 'cues.json')))
    drums, bass, chords, lead, fx = build_music()
    sfx = Bus()
    for c in cues:
        typ = c['type']
        if typ == 'riser':
            sfx.add(c['t'], sfx_riser(c['dur']), 0.35)
            continue
        fn, g = SFX[typ]
        sig = fn(c['n']) if typ == 'plop' else fn()
        pan = {'whoosh': -0.3, 'pop': 0.15, 'plop': -0.1}.get(typ, 0.0)
        sfx.add(c['t'], sig, g, pan)

    mL = drums.L * 0.9 + bass.L * 0.9 + reverb(chords.L, 1.6, 0.35) * 0.8 + reverb(lead.L, 1.2, 0.3) * 0.9 + fx.L
    mR = drums.R * 0.9 + bass.R * 0.9 + reverb(chords.R, 1.6, 0.35) * 0.8 + reverb(lead.R, 1.2, 0.3) * 0.9 + fx.R
    sL = reverb(sfx.L, 0.8, 0.12)
    sR = reverb(sfx.R, 0.8, 0.12)
    music_gain = 0.75
    L = mL * music_gain + sL * 0.9
    R = mR * music_gain + sR * 0.9
    # gentle high-pass to clean rumble, soft-clip master
    L = filt(L, 'high', 28)
    R = filt(R, 'high', 28)
    L, R = limiter(L, R, target_rms_db=-15.0, ceiling=0.93)
    # fade the tail
    fade = int(0.4 * SR)
    L[-fade:] *= np.linspace(1, 0, fade)
    R[-fade:] *= np.linspace(1, 0, fade)
    out = np.stack([L, R], 1)
    pcm = (out * 32767).astype(np.int16)
    import wave
    with wave.open(os.path.join(BUILD, 'soundtrack.wav'), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('wrote soundtrack', out.shape, 'rms', float(np.sqrt(np.mean(out ** 2))))


if __name__ == '__main__':
    main()
