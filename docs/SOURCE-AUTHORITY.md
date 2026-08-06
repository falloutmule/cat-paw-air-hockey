# Source Authority

| Path or object | Classification | Authority basis | Current status | Relationship to canonical source | Action |
| --- | --- | --- | --- | --- | --- |
| `src/`, `tests/`, `public/`, `sfhs.project.json`, `one-shot/` | Readable project source and records | Existing graduation intake selects `SOURCE-IDENTITY.json`; committed migration lineage and matching SFHS manifest | VERIFIED | Authoritative editable product | Preserve and build from it |
| `codex/fullscreen-menu-theme-001` | Later local source lineage | It descends from settled source commit `f11c363` and contains the user-authorized fullscreen/settings/return-speed work | VERIFIED | Current publication candidate | Verify and promote through normal Git history |
| Packer-produced `dist/index.html` | Generated canonical artifact | Only SFHS pack + exact verify may establish it | VERIFIED locally / PROPOSED for Pages | Deployment input, never source | Regenerate in CI and deploy only after verify |
| `one-shot/PHYSICAL-REPORT.json` and expansion report | Device evidence | Artifact-bound historical report | REPORTED / SUPERSEDED for current artifact | Evidence only | Preserve; do not transfer acceptance |
| Historical candidates, recovery records, and prior artifact identities | Migration evidence | Explicit lineage and supersession records | SUPERSEDED | Not editable source or current canonical output | Preserve lightweight records in Git history/docs |
| `.remote-*`, archive chunks, candidate HTML | Historical migration machinery | Removed from active branch during settlement | SUPERSEDED | None | Do not recreate |

Authority is not inferred from file dates, visual polish, Pages state, or a filename. The current local artifact changes from the earlier device-tested expansion artifact, so physical acceptance does not transfer.
