# Evidence retention inventory

The current SFHS-required evidence remains in `one-shot/`; duplicating it elsewhere would create competing evidence. This repository tracks lightweight identity and report records rather than large browser traces or generated artifacts.

| Item | Build/source identity | Status | Retention decision |
| --- | --- | --- | --- |
| `one-shot/VERIFICATION-REPORT.md`, `canonical-browser.json`, graduation report/state | `cat-paw-air-hockey-95ed3f8aa868` / `816c04…1adf` | VERIFIED locally | Current generation; retain and update only from real gates. |
| Prior expansion and settled-base identities | Listed in `one-shot/EVIDENCE-SUPERSESSION.json` | SUPERSEDED | Retain lightweight lineage and the only historical physical report. |
| Migration records in `docs/migration/` | Legacy source/candidate lineage | SUPERSEDED / VERIFIED historical | Retain because they establish authority. |
| Browser traces, temporary logs, materialized workspaces, and `dist/` | Generated local execution material | UNTESTED / ephemeral | Ignored; do not commit. Current-plus-one previous heavy retention is satisfied by retaining current/previous identities and only durable reports. |

No tracked heavy evidence is two or more canonical generations behind with a unique successor, so this run proposes no deletion. The full supersession chain is the source of truth for prior artifact status.
