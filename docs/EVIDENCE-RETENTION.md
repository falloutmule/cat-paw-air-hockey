# Evidence Retention Inventory

Policy: **current plus one previous heavy generation**, with lightweight release manifests and unique milestone, failure, physical, lineage, legal, and security evidence retained. SFHS-required current evidence remains in `one-shot/`; duplicating it into another hierarchy would create competing authority.

| Item | Build or source identity | Status | Decision and reason | Replacement or successor |
| --- | --- | --- | --- | --- |
| `one-shot/VERIFICATION-REPORT.md`, `one-shot/canonical-browser.json`, Rapier physical report/seed | `cat-paw-air-hockey-b83bd150d75e` / `827d1b…9b1a` | VERIFIED / REPORTED | Retain as current canonical and physical generation | None |
| `test-results/CATPAW-RAPIER-001/` | Same Rapier identity | VERIFIED locally | Keep ignored through release; contains current A/B, browser, guard, backup, and phone handoff proof | Durable summaries in `one-shot/` and release manifest |
| `one-shot/PHYSICAL-REPORT-PUCK-PAW-GODOT-001.json` and accepted baseline backup | `cat-paw-air-hockey-06998a9ce8bc` / `51b922…f42a` | SUPERSEDED / REPORTED | Retain as the immediately previous accepted physical generation and Rapier comparison baseline | Rapier physical report |
| Existing Pages release manifest | `cat-paw-air-hockey-64741220be29` / `0d1827…6b53` | SUPERSEDED | Retain as `releases/manifests/PREVIOUS.json` after deployment; lightweight rollback identity | Rapier `CURRENT.json` |
| Older physical success/failure reports and `one-shot/evidence/physical-reported-pass.jpg` | Identities recorded in each report and supersession chain | SUPERSEDED / REPORTED | Retain as unique milestone or failure evidence; do not transfer acceptance | Current and previous reports provide release claims, not historical diagnosis |
| `docs/migration/`, `SOURCE-IDENTITY.json`, graduation state and lineage | Legacy-to-authoritative source identities | VERIFIED / SUPERSEDED historical | Retain because they establish source authority and safe rollback | None |
| `one-shot/EVIDENCE-SUPERSESSION.json` | Full artifact chain | VERIFIED | Retain lightweight identity/treatment index | Updated in place |
| GitHub Actions browser artifacts | Current run plus immediate predecessor; 7–14 day retention | VERIFIED when workflow succeeds | Allow configured expiration; source and durable summaries remain tracked | Newer workflow generation |
| Local materializations, duplicate packed HTML, browser traces, temporary logs, caches, dependencies | Reproducible generated material | UNTESTED | Keep ignored; remove only as routine disposable workspace maintenance, never as authority cleanup | Regenerated from pinned source |

No tracked deletion is authorized by this inventory: the repository contains lightweight summaries and unique milestone evidence, while heavy generated output is already ignored or time-bounded in Actions. This satisfies the policy without moving SFHS packet files or manufacturing empty evidence directories.
