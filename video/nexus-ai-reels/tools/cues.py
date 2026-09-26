#!/usr/bin/env python3
"""Génère captions/<nom>.js (sous-titres mot à mot) à partir d'un texte + de l'audio, sans Whisper.

Usage :
  python3 tools/cues.py <video_ou_audio> <texte.txt> <sortie.js>

- Détecte les passages parlés dans l'audio (pauses < -28 dB pendant >= 100 ms).
- Un morceau peut commencer par [début-fin] (en secondes) pour forcer son calage, ex. « [3.38-4.9] tu fais tout ».
  Si tous les morceaux en ont, ces repères remplacent la détection automatique.
- Sinon, si le texte contient des « / », chaque morceau est calé sur un passage parlé (dans l'ordre).
  Sinon, les mots sont répartis sur toute la parole, au prorata de leur longueur.
- Regroupe les mots en cartons de 4 mots / 14 caractères max, sans chevaucher une pause.
Calage approximatif : à affiner à l'œil dans le Studio si besoin (ou refaire avec Whisper quand dispo).
"""
import json
import re
import math
import struct
import subprocess
import sys

THRESH_DB = -28
MIN_PAUSE = 0.10
WIN = 0.02
MAX_WORDS = 4
MAX_CHARS = 14
HOLD_GAP = 0.35
LAST_HOLD = 0.6


def speech_segments(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        check=True, capture_output=True,
    ).stdout
    n = len(raw) // 2
    samples = struct.unpack("<%dh" % n, raw)
    w = int(16000 * WIN)
    env = [math.sqrt(sum(x * x for x in samples[i:i + w]) / w) for i in range(0, n - w, w)]
    peak = max(env)
    loud = [20 * math.log10(max(v, 1) / peak) > THRESH_DB for v in env]
    segs, start = [], None
    quiet_run = 0
    for i, on in enumerate(loud + [False] * int(MIN_PAUSE / WIN + 1)):
        if on:
            if start is None:
                start = i
            quiet_run = 0
        elif start is not None:
            quiet_run += 1
            if quiet_run * WIN >= MIN_PAUSE:
                segs.append((start * WIN, (i - quiet_run + 1) * WIN))
                start, quiet_run = None, 0
    return [(round(a, 2), round(b, 2)) for a, b in segs if b - a >= 0.15]


def spread(words, a, b):
    weights = [len(wd) + 2 for wd in words]
    total = sum(weights)
    t, out = a, []
    for wd, wt in zip(words, weights):
        d = (b - a) * wt / total
        out.append({"w": wd.rstrip(".,;:"), "s": round(t, 2), "e": round(t + d, 2)})
        t += d
    return out


def main(media, text_path, out_path):
    text = open(text_path, encoding="utf-8").read().strip()
    segs = speech_segments(media)
    raw_chunks = [c.strip() for c in text.split("/")]
    anchors = [re.match(r"^\[([\d.]+)-([\d.]+)\]\s*(.*)$", c, re.S) for c in raw_chunks]
    chunks = [c.split() for c in raw_chunks] if "/" in text else None
    timed = []  # list of phrases, each a list of timed words
    if all(anchors):
        timed = [spread(m.group(3).split(), float(m.group(1)), float(m.group(2))) for m in anchors]
    elif chunks and len(chunks) == len(segs):
        timed = [spread(c, a, b) for c, (a, b) in zip(chunks, segs)]
    else:
        words = text.replace("/", " ").split()
        total = sum(b - a for a, b in segs)
        weights = [len(wd) + 2 for wd in words]
        idx = 0
        for a, b in segs:
            share = round(len(words) * (b - a) / total) if (a, b) != segs[-1] else len(words) - idx
            part = words[idx:idx + max(share, 0)]
            idx += len(part)
            if part:
                timed.append(spread(part, a, b))
    cues = []
    for phrase in timed:
        cur = []
        for wd in phrase:
            if cur and (len(cur) >= MAX_WORDS or len(" ".join(x["w"] for x in cur + [wd])) > MAX_CHARS):
                cues.append(cur)
                cur = []
            cur.append(wd)
        if cur:
            cues.append(cur)
    data = [{"start": c[0]["s"], "end": c[-1]["e"], "words": c} for c in cues]
    # Lisibilité : un carton reste affiché jusqu'au suivant si l'écart est court (< HOLD_GAP),
    # et le dernier reste LAST_HOLD s de plus.
    for cur, nxt in zip(data, data[1:]):
        if nxt["start"] - cur["end"] < HOLD_GAP:
            cur["end"] = nxt["start"]
    if data:
        data[-1]["end"] = round(data[-1]["end"] + LAST_HOLD, 2)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("// Généré par tools/cues.py — ne pas éditer à la main (relancer le script).\n")
        f.write("window.CAPTIONS = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print("passages parlés :", segs)
    for c in data:
        print(f'{c["start"]:5.2f}-{c["end"]:5.2f}  {" ".join(w["w"] for w in c["words"])}')


if __name__ == "__main__":
    main(*sys.argv[1:4])
