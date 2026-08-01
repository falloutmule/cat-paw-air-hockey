# Cat Paw Air Hockey

Two people place one phone between them and use one finger each, from opposite ends, to control cat-paw strikers. First to five goals wins.

The game is portrait-first. In landscape it deliberately pauses behind a rotate-to-portrait guide; this remains responsive to viewport and lifecycle changes under the current adaptive SFHS contract.

## Controls

Both players hold their ready paw to begin. During play, drag one finger on your own half of the rink. The top player uses the top half; the bottom player uses the bottom half. Each edge has mute, pause, and reduced-effects controls.

## Development

Authoritative source is this repository. The exact SFHS toolchain is pinned in [one-shot/SFHS-PIN.json](one-shot/SFHS-PIN.json). Run source regressions with `pnpm test`. Use the SFHS graduation materializer for canonical inspect, validate, pack, verify, and browser evidence; it creates a disposable workspace copy rather than modifying this source tree.

`dist/index.html` is produced only by the real SFHS packer. Historical Chat candidates are retained only by identity in the graduation records.

## Status

The current migration is expected to become canonical after SFHS verification and browser evidence. A fresh device session must test the exact new artifact before physical acceptance can be claimed.

Non-goals: AI, online play, progression systems, new art themes, and publication.
