# Board template provenance

`cat-paw-board-template.png` is the exact editable Board bitmap template for Cat Paw Air Hockey R2.

- Source implementation commit: `dfb8b330b0a64164bb280757d1bc82c8126d7b88`
- Generation method: `pnpm run generate:board-template` against the exact SFHS-packed artifact; the packed game downloads the Board-only procedural paint recipe
- Logical Board rectangle: x `0`, y `0`, width `540`, height `960`
- Bitmap scale: `2`
- Bitmap dimensions: `1080` x `1920`
- Bytes: `100563`
- SHA-256: `cd9fa2fcd5756c91b065199c8da863e45efad71a301426cca71f7455764a6630`
- Intended use: repaint this rectangle while preserving its exact pixel dimensions and overall geometry, then load it with **Replace Board PNG**

The image contains only the static table presentation. Dynamic goals and posts, cats, paws, puck, scores, messages, controls, and VFX remain separate runtime layers.
