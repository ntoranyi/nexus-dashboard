# NEXUS AI — Reels/TikTok (1080x1920) — règles de montage

Style « Bureaucratic Alert » : noir + orange signal, motion design marqué, rythme dynamique.

Règles de montage définitives, ajoutées au fur et à mesure quand tu dis « garde ça en mémoire ».
À relire avant tout nouveau montage dans ce projet. Une règle = une ligne, datée.

## Sous-titres
- 2026-09-25 — Sous-titres en CAPITALES (Archivo Black, ~84 px, texte crème #f2ede4 contouré noir).
- 2026-09-25 — Mot actif surligné : fond orange #ff5a00, texte noir, synchronisé mot à mot sur la voix.
- 2026-09-25 — 4 mots max par ligne (et 14 caractères max, pour tenir sur une seule ligne). Voir `tools/cues.py` et `reel-01.html`.

## Sound design
- 2026-09-26 — Whoosh discret (`assets/audio/sfx-whoosh-soft.wav`, Pixabay, -11 dB) ~0,15 s avant chaque nouvelle phrase, ~13 dB sous la voix (≈ niveau de la musique).
- 2026-09-25 — Musique de fond discrète, ~15 dB sous la voix (voix ≈ -14 LUFS, musique ≈ -30 LUFS). Voir `tools/bgm_synth.py`.

## Règles de coupe

## Autres règles
- 2026-09-26 — CTA final « app-nexusai.com » sur les 2 dernières secondes : bandeau-tampon orange #ff5a00, texte noir Archivo Black ~64 px, contour noir + ombre portée, entrée en « claque » (zoom + rotation -2°), placé dans la bande floue du haut (y 270-390, hors zone UI et hors visage). Voir `reel-01.html`.
