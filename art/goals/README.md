# Couch goal asset provenance

`cat-paw-couch-goal.png` is the small source-controlled pixel couch used by both dynamic goals.

- Runtime dimensions: 232 x 54 pixels
- Runtime use: Pixi v8 `NineSliceSprite`, 24-pixel left/right caps, nearest-neighbor sampling
- SHA-256: `1fe40042e022b3ce267a102824a2a8e817e680f14c8329609c6ae5010825f564`
- Image-generation tool: OpenAI ImageGen
- Working-source retention: ignored R3 evidence directory under `test-results/`
- Finishing method: chroma-key removal followed by local crop, resize, palette quantization, and symmetry cleanup; no runtime generation

ImageGen prompt:

> Create one cute front-facing symmetrical pixel-art couch as a small 2D game sprite reference for a nine-slice air-hockey goal. Chunky square left and right arms, two simple center seat cushions, and a clearly readable dark under-couch opening along the bottom. Crisp 16-bit-era hard pixel edges, limited neutral grayscale palette so the game can tint it teal or coral. Center it in a wide orthographic view with generous empty padding. Background must be perfectly flat solid #00ff00 edge to edge. Do not use #00ff00 in the couch. One couch only. No cats, toys, people, room, floor, cast shadow, reflection, text, logo, watermark, antialiasing, gradients, or background texture.

The couch bitmap is presentation only. The goal opening, scoring plane, posts, border, and label remain derived from mechanical state.
