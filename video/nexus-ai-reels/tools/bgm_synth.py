#!/usr/bin/env python3
"""Compose un fond musical original et libre de droits (synthèse pure, aucun sample externe).

Usage : python3 tools/bgm_synth.py <sortie.wav> [durée_s=8] [bpm=120]
Pad chaud La mineur (Am – F – C – G, 1 accord / mesure), sub-basse pulsée en « pompe »
(effet sidechain), charley très discret sur les contretemps. Fondu d'entrée et de sortie.
Déterministe : même entrée → même fichier.
"""
import sys
import wave

import numpy as np

SR = 44100
out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 120.0
beat = 60.0 / bpm
bar = 4 * beat
t = np.arange(int(SR * dur)) / SR

def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)

# Accords (MIDI) : Am, F, C, G
chords = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]]
roots = [45, 41, 48, 43]

pad = np.zeros_like(t)
sub = np.zeros_like(t)
for i in range(int(np.ceil(dur / bar))):
    a, b = i * bar, min((i + 1) * bar, dur)
    m = (t >= a) & (t < b)
    tt = t[m] - a
    env = np.minimum(1, tt / 0.25) * np.minimum(1, (b - a - tt) / 0.15 + 0.0)
    env = np.clip(env, 0, 1)
    c = chords[i % 4]
    for n in c:
        f = hz(n)
        for det in (-0.12, 0.0, 0.12):  # léger désaccord = chaleur
            ff = f * 2 ** (det / 12)
            pad[m] += env * (np.sin(2 * np.pi * ff * tt) + 0.25 * np.sin(2 * np.pi * 2 * ff * tt)) / 3
    sub[m] += env * np.sin(2 * np.pi * hz(roots[i % 4] - 12) * tt)

# Filtre passe-bas simple (one-pole) sur le pad pour l'adoucir
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y

pad = lowpass(pad, 1800)

# « Pompe » rythmique sur chaque temps (façon sidechain)
phase = (t % beat) / beat
pump = 0.35 + 0.65 * np.clip(phase / 0.35, 0, 1) ** 0.8

# Charley discret sur les contretemps : bruit filtré, enveloppe courte, graine fixe
rng = np.random.default_rng(27)
noise = rng.standard_normal(len(t))
noise = noise - lowpass(noise, 6000)
off = ((t + beat / 2) % beat)
hat = noise * np.exp(-off / 0.025) * 0.08

mix = pad * pump * 0.55 + sub * pump * 0.45 + hat
fade = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.9)
mix *= np.clip(fade, 0, 1)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.8
st = np.stack([mix, mix], axis=1)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("ok", out, dur, "s")
