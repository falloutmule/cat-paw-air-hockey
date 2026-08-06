# Repository Graduation Plan — verified-main-publish

Status: **VERIFIED**. This plan is additive and idempotent: it documents and publishes the existing game without redesigning its behavior.

## Authority and output

| Item | Decision | Status |
| --- | --- | --- |
| Editable source | `src/`, `tests/`, `public/`, `sfhs.project.json`, and `one-shot/` on the current Cat Paw lineage | VERIFIED |
| Canonical branch | `main` | VERIFIED |
| Working lineage | `codex/fullscreen-menu-theme-001`, descendant of the settled source branch | VERIFIED |
| Toolchain | SFHS commit `5acd8fc9a24834d9416a6e615bb78b8012962e30` from `one-shot/SFHS-PIN.json` | VERIFIED |
| Canonical output | Packer-created `dist/index.html`; never committed or hand-edited | VERIFIED |
| Publication | GitHub Pages from verified `main` only | VERIFIED - workflow run `31099501221` deployed and byte-compared the canonical artifact |

## Changes

- Preserve the readable source, migration lineage, One-Shot packet, tests, and lightweight evidence records unchanged except where current artifact/release facts must be updated.
- Add a concise project front door, game/status/architecture/testing/roadmap/decision/authority records, rights statement, evidence-retention inventory, and lightweight release manifests.
- Add an action-based Pages workflow that materializes the pinned SFHS project, runs all canonical gates, deploys only the verified packed HTML, and records the deployment identity.
- Do not move or delete source, candidate lineage, physical reports, or current/previous lightweight verification records. No tracked heavy evidence qualifies for deletion in this repository.

## Rollback

Every change is an additive normal Git commit. Revert the publication commit or disable the Pages workflow; do not rewrite published history. The previous artifact identity remains in `one-shot/EVIDENCE-SUPERSESSION.json` and Git history.
