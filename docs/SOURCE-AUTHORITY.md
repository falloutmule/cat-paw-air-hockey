# Source Authority

Authority is established from the committed graduation lineage, current project contracts, accepted artifact-bound evidence, and the user's explicit Rapier and publication authorizations. Dates, filenames, file sizes, visual polish, and the currently deployed Pages file are not authority.

| Path or object | Classification | Authority basis | Current status | Relationship to canonical source | Action |
| --- | --- | --- | --- | --- | --- |
| `feature/cat-paw-rapier-001` with gameplay/source commit `6f256ac54ef85e6d14c7ec3def70e98feec4ad95` | Working product lineage | Descends from accepted commit `d034d16`; contains the verified Rapier implementation and artifact-bound Samsung PASS | VERIFIED | Reconciled with remote `main` by normal merge `5d9e47d680c17e32c480aeee2f27c990302772a9` | Publish through reviewed normal history after gates pass |
| `origin/main` predecessor at `918abbfd5261ab92613794498f56dfb6ba0d6f60` | Published predecessor | Existing default branch and successful Pages/quality history | VERIFIED | Reconciled into the working lineage; its direct-click fullscreen repair is retained | Preserve through normal history; never rewrite |
| `src/`, `tests/`, `public/`, `sfhs.project.json`, `one-shot/` | Readable project source and records | `AGENTS.md`, graduation lineage, matching SFHS manifest, and current tests | VERIFIED | Authoritative editable product | Preserve and build only from these records |
| `art/` and `tools/godot-*` | Authored visual inputs and deterministic producer tooling | Tracked manifests, validation records, and focused tests | VERIFIED | Authoritative asset source; not runtime network content | Preserve |
| `one-shot/SFHS-PIN.json` | Toolchain relationship | Project contract pins exact framework packages without vendoring | VERIFIED | SFHS commit `fce070a0a08a9b4e0fbebda75440eaee80bb95a9` is reachable from SFHS `main` merge `391ed3afe75fa47794e7e1e9f3477e3ec53ecb12` | Consume the exact pin in local and GitHub CI |
| Packer-produced `dist/index.html` | Generated canonical artifact | Only current SFHS pack plus exact verify establishes it | VERIFIED locally | Deployment input, never editable source | Regenerate in clean materialization; deploy exact bytes only |
| `test-results/CATPAW-RAPIER-001/phone/` | Ignored acceptance handoff | Exact hash matches the verified Rapier artifact and physical report | VERIFIED | Artifact/evidence duplicate, not source | Keep ignored locally through release verification |
| `one-shot/PHYSICAL-REPORT-CATPAW-RAPIER-001.json` | Current device evidence | User report bound to exact Rapier artifact | REPORTED | Current physical acceptance | Preserve unchanged |
| `one-shot/PHYSICAL-REPORT-PUCK-PAW-GODOT-001.json` | Immediately previous accepted generation | User report bound to exact custom-solver artifact | SUPERSEDED | Physical comparison baseline; acceptance does not transfer | Preserve unchanged |
| Other physical reports and `docs/expansion/` records | Milestone evidence | Artifact-bound successes/failures and design lineage | SUPERSEDED | Historical only; some contain unique accepted or failure evidence | Preserve as lightweight milestones |
| `releases/manifests/CURRENT.json` | Rapier release candidate identity | Exact local pack/verify identity and artifact-bound Samsung report | PROPOSED | Current publication candidate; no Pages run is claimed yet | Mark VERIFIED only after exact deployed-byte parity |
| `releases/manifests/PREVIOUS.json` | Published predecessor identity | Existing Pages run and exact deployed-byte comparison | SUPERSEDED | Immediately previous published generation | Preserve under current-plus-one retention |
| Current GitHub Pages bytes | Deployed generated artifact | Successful workflow on `origin/main` | SUPERSEDED | Published predecessor, not current source | Replace only after verified-main gates pass |
| Historical candidates and migration records | Source/evidence lineage | Graduation records and explicit supersession chain | SUPERSEDED | Not editable source or current artifact | Retain lightweight records; do not revive |
| `node_modules/`, materialized `.sfhs-grad-*`, `dist/`, local traces and logs | Generated execution material | Reproducible from pinned source/toolchain | UNTESTED | No source authority | Keep ignored; never publish |
| GitHub releases and tags | Remote release objects | Preflight found none | VERIFIED | No authority conflict | No action |

No plausible source contains unmerged unique current product work outside the two reconciled lineages above. The dirty primary SFHS checkout is unrelated user work and is excluded from this operation.
