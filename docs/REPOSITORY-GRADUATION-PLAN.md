# Repository Graduation Plan — CATPAW-RAPIER-001 verified-main-publish

Status: **PROPOSED until the publication gates complete**. The plan is additive and idempotent: a repeat run updates the same source, evidence, manifests, workflows, and Pages path without creating a competing structure.

## Authority and output

| Item | Decision | Status |
| --- | --- | --- |
| Editable source | `src/`, `tests/`, `public/`, `sfhs.project.json`, `one-shot/`, tracked authored art/tooling | VERIFIED |
| Working lineage | `feature/cat-paw-rapier-001`, merged normally with current `origin/main` | VERIFIED |
| Canonical branch | `main` | VERIFIED |
| Toolchain | SFHS commit `fce070a0a08a9b4e0fbebda75440eaee80bb95a9` | VERIFIED locally / PROPOSED remotely |
| Canonical output | Packer-created `dist/index.html`; never committed or hand-edited | VERIFIED locally |
| Publication | GitHub Actions Pages deployment from verified `main` only | PROPOSED |

## Migration and cleanup actions

- Preserve unchanged: product mechanics, controls, art direction, accepted physical reports, source lineage, rights, authored assets, and unrelated worktrees.
- Merge: current remote `main` into the Rapier branch through normal Git history, retaining the latest accepted direct-click fullscreen behavior.
- Move: no source files. The existing structure already conforms to the project contract.
- Consolidate: update `docs/EVIDENCE-RETENTION.md`, `one-shot/EVIDENCE-SUPERSESSION.json`, and `releases/manifests/{CURRENT,PREVIOUS}.json` as the single retention and release indexes.
- Regenerate: a disposable pinned-SFHS materialization and its ignored `dist/index.html`; never copy candidate HTML into source.
- Mark superseded: the current Pages artifact and current release manifest after exact Rapier deployment parity passes.
- Delete: nothing tracked. No stale heavy evidence meets all safe-deletion conditions; generated local material remains ignored.
- Required compatibility repair: publish the already-tested minimal SFHS position-kinematic contract so GitHub CI can fetch the exact pin.
- Workflows: preserve source tests before materialization; require full materialized tests, inspect, validate, proportional/full checks, repeated deterministic pack identity, exact verify, One-Shot audit, browser/network smoke, and least-privilege Pages deployment from `main` only.
- Documentation: refresh README, status, roadmap, architecture, testing, decisions, authority, evidence retention, release manifest, and final release evidence with exact deployed facts.
- Repository presentation: preserve public visibility and current name; retain the accurate description/homepage and normalize topics only if needed.

## Publication sequence

1. Publish and merge the bounded SFHS kinematic commit after its CI passes.
2. Update the product pin if the merge commit changes the reachable identity.
3. Merge `origin/main` into the product working branch and resolve only truth/evidence conflicts.
4. Run the complete local canonical matrix and a separate read-only audit.
5. Push the working branch, open a ready PR, require successful CI, and merge without force.
6. Observe the `main` Pages deployment, exercise the deployed game, download its bytes, and prove SHA-256 parity.
7. Commit the exact release/run record if needed, accept the resulting same-byte redeploy, and repeat parity verification.

## Rollback

All mutations use ordinary commits and non-force pushes. Revert the product merge commit or the specific release-record commit to restore source, and rerun the existing Pages workflow. The preceding published artifact identity remains in `releases/manifests/PREVIOUS.json`, `one-shot/EVIDENCE-SUPERSESSION.json`, and Git history. The SFHS capability is additive; revert its merge commit separately only if no published product still pins or consumes it.
