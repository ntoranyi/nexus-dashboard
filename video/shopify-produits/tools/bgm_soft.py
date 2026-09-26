#!/usr/bin/env python3
"""Fond musical original, doux et lumineux, pour les vidéos produits (synthèse pure, libre de droits).

Usage : python3 tools/bgm_soft.py <sortie.wav> [durée_s=8] [bpm=72]
Nappe feutrée Fa majeur (Fmaj7 – Am7 – Dm7 – Sib maj7, 1 accord / 2 temps), pas de basse pulsée,
petite mélodie « kalimba » (sinus + décroissance rapide) sur les temps. Fondus doux. Déterministe.
"""
import sys
import wave

import numpy as np

SR = 44100
out = sys.argv[1]
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 8.0
bpm = float(sys.argv[3]) if len(sys.argv) > 3 else 72.0
beat = 60.0 / bpm
step = 2 * beat
t = np.arange(int(SR * dur)) / SR


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


chords = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]
melody = [72, 76, 69, 72, 74, 69, 70, 74]  # une note par temps

pad = np.zeros_like(t)
for i in range(int(np.ceil(dur / step))):
    a = i * step
    m = t >= a
    tt = t[m] - a
    env = np.clip(tt / 0.6, 0, 1) * np.exp(-np.clip(tt - step, 0, None) / 0.5)
    for n in chords[i % 4]:
        for det in (-0.08, 0.08):
            pad[m] += env * np.sin(2 * np.pi * hz(n) * 2 ** (det / 12) * tt) / 8

bell = np.zeros_like(t)
for k in range(int(dur / beat)):
    a = k * beat
    m = t >= a
    tt = t[m] - a
    f = hz(melody[k % len(melody)])
    bell[m] += np.exp(-tt / 0.45) * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * 0.18

mix = pad + bell
fade = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 1.2)
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
