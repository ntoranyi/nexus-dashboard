#!/usr/bin/env python3
"""Petit carillon original (2 notes cristallines) pour l'apparition du CTA. Synthèse pure, déterministe.

Usage : python3 tools/sfx_chime.py <sortie.wav>
"""
import sys
import wave

import numpy as np

SR = 44100
dur = 1.6
t = np.arange(int(SR * dur)) / SR
x = np.zeros_like(t)
for start, f in ((0.0, 1318.5), (0.09, 1760.0)):  # Mi6 puis La6
    m = t >= start
    tt = t[m] - start
    x[m] += np.exp(-tt / 0.35) * (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(2 * np.pi * 2.76 * f * tt))
x *= np.minimum(1, t / 0.004)
x /= np.max(np.abs(x)) + 1e-9
x *= 0.8
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.stack([x, x], axis=1) * 32767).astype("<i2").tobytes())
print("ok", sys.argv[1])
