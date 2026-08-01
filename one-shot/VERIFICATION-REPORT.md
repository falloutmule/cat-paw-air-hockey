# Canonical verification report

Canonical artifact: `dist/index.html` in disposable materialization.

- Build ID: `cat-paw-air-hockey-e1a629b12b42`
- Bytes: `560146`
- SHA-256: `ecfd57a25c19c3347618cc72dca667a95d5a8c3206a4599bed2833e7af499f5e`
- Source SHA-256: `e1a629b12b425605c51d15b0a2df9ed770950d81c03df2724b702f2158ef0894`
- Toolchain pin: `68ef8f021eea2ab90a57ca6e2f608d8166a39859` (merged PR #10)
- Verifier: real `sfhs verify` — VERIFIED

The merged toolchain packed this exact identity twice deterministically and the real `sfhs verify` passed. Canonical browser evidence is `one-shot/canonical-browser.json`: one visible Pixi WebGL renderer, no page/console errors, no unexpected requests, independent pointer IDs 101 and 202, third-pointer rejection, audio unlock, landscape gate/pause, and portrait restoration. Physical status is **REPORTED PASS** for this exact artifact in `one-shot/PHYSICAL-REPORT.json`; missing formal device metadata remains explicitly recorded there.
