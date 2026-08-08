# Board template provenance

`cat-paw-board-template.png` is the exact editable Board bitmap template for Cat Paw Air Hockey R3.

- Source implementation commit: `025849941bed487811fee553eb4152e9c9570264`
- Generation method: `pnpm run generate:board-template` against an SFHS-packed artifact; the packed game downloads the Board-only presentation generated from `src/board-art.ts`
- Logical Board rectangle: x `0`, y `0`, width `540`, height `1200`
- Bitmap scale: `2`
- Bitmap dimensions: `1080` x `2400`
- Bytes: `95863`
- SHA-256: `705ee60f29283b345b399bcae5fee0e59d115744911949101303bf250c34bdf6`
- Intended use: repaint this rectangle while preserving its exact pixel dimensions and overall geometry, then load it with **Replace Board PNG**

The image contains only the static Board presentation. Dynamic couch goals and posts, cats, paws, puck, scores, messages, controls, and VFX remain separate runtime layers.
