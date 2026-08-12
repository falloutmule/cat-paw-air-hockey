# CATPAW-RAPIER-001 release evidence

Status: **VERIFIED** on 2026-08-12.

- Product PR: [#6](https://github.com/falloutmule/cat-paw-air-hockey/pull/6), merged normally.
- Release commit: `efdcabd2901a4ca2b595a3e4e219d836f860760c` on `main`.
- Gameplay/source identity: `6f256ac54ef85e6d14c7ec3def70e98feec4ad95`.
- SFHS pin: `fce070a0a08a9b4e0fbebda75440eaee80bb95a9`.
- Pages workflow: [run 31632172076](https://github.com/falloutmule/cat-paw-air-hockey/actions/runs/31632172076), passed build, exact verification, bounded browser boot, deployment, and served-byte parity.
- Pages URL: <https://falloutmule.github.io/cat-paw-air-hockey/>.
- Artifact: `cat-paw-air-hockey-b83bd150d75e`, 5,857,863 bytes.
- Local and deployed SHA-256: `827d1b6d1e3aa8877b206d2be5c89baaea89b5cd04e8643196b394b3f7789b1a`.
- Independent deployed-byte download: VERIFIED at the same byte size and SHA-256.
- Independent live browser: title and page loaded; one meaningful settings open/close interaction passed; one game canvas was present; no console errors were reported.
- Network/offline: the richer local canonical lane passed one-root-request and exact-file offline boot; Pages served-byte parity passed. No external runtime dependency is packaged or expected.
- Physical device: **REPORTED PASS** for this exact artifact. The user described it as snappier and more responsive and reported no regressions after the required Samsung session. Formal device/browser/thermal instrumentation was not supplied and is not inferred.

The preceding published artifact remains indexed in `releases/manifests/PREVIOUS.json` as **SUPERSEDED**. No release or tag was created.
