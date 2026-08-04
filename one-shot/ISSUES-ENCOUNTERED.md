---
{"schema":"sfhs.one-shot-issue-log@1","status":"VERIFIED","facts":{"issues":["HIST-001 historical recovery blockers","SETTLE-001 Windows sandbox pnpm EPERM","SETTLE-002 legacy packet lacked current SFHS front matter"]}}
---
# Issues Encountered

| ID | Phase | Status | Severity | Observed / expected | Evidence | Attempts / resolution | Remaining risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| HIST-001 | Migration | SUPERSEDED | Critical | Historical Chat runs lacked a usable SFHS checkout and created only candidate evidence. | `docs/migration/history/LEGACY-RECOVERY-SUMMARY.md` | Current pinned workspace is available; candidates remain noncanonical. | None for canonical tooling. |
| SETTLE-001 | Toolchain | RESOLVED | Moderate | Sandboxed pnpm could not create a temporary file (`EPERM`). | Settlement command log. | Installed the exact locked workspace with approved environment access. | None known. |
| SETTLE-002 | One-Shot | RESOLVED | Major | Existing packet lacked current front matter and the current CLI therefore reported its files missing. | `pnpm sfhs one-shot inspect` initial result. | Replaced active packet with schema-valid current records; preserved historic claims separately. | Re-run current audit after settlement edits. |
