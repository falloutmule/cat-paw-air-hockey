# Durable decisions

| ID | Status | Decision |
| --- | --- | --- |
| D-001 | VERIFIED | Portrait-first shared-phone play uses a deterministic 540×1200 fixed-contain rink; landscape shows a gate. |
| D-002 | REPORTED | Zero finger offset is retained from the historical accepted device experience. |
| D-003 | VERIFIED | Match flow is joint ready, countdown, first to five, and joint rematch. |
| D-004 | VERIFIED | SFHS owns the fixed-step loop; simulation stays renderer-neutral and Pixi presents one WebGL surface. |
| D-005 | VERIFIED | Only the pinned SFHS packer may create `dist/index.html`; generated output is ignored. |
| D-006 | VERIFIED | Return-speed settings are per hitter, apply once to a discrete paw hit, and activate at safe serve boundaries. |
| D-007 | SUPERSEDED | Goal-side controls remain split around the goal; the goal itself says `GOAL`, not a player label. |
| D-008 | PROPOSED | GitHub Pages deploys only verified `main` output and must prove local/deployed byte parity. |
| D-009 | VERIFIED | Exactly four shared controls occupy the center side edges: Mute upper-left, Pause/Capture lower-left, Menu upper-right, and Fullscreen lower-right. Defensive goal zones remain UI-free. |
| D-010 | VERIFIED | Reskinning uses one rectangular 1080×2400 Board bitmap derived from the 540×1200 presentation at the DPR-2 ceiling; adjustable goals and all actors/HUD remain separate above it. |
| D-011 | VERIFIED | The mandatory 2048×2048 atlas, generated theme guide authority, integrated control aprons, duplicated end controls, goal-side clusters, and artwork-baked controls/goals are rejected. Procedural/vector art remains fallback while later independent actor replacements are deferred. |
| D-012 | VERIFIED | Mechanical side walls are the visible Board edges at x=0 and x=540; no invisible rail recreates the removed inset. |
| D-013 | VERIFIED | Dynamic goals use persistent nearest-neighbor NineSlice couch sprites over mechanics-derived dual-contrast frames and outlined GOAL text. |
| D-014 | SUPERSEDED | Normal speeds were 75%; normal puck, paw, and goal sizes were 125%. |
| D-016 | VERIFIED | Normal speeds are 100%; normal puck, paw, and goal sizes are 200%. Speed ranges remain 70–130%; size ranges remain 25–200%. Each mirrored settings half uses one thin native scrollbar with an always-visible Close button; the duplicate outer scroll control is removed. |
| D-015 | VERIFIED | Puck palette ownership and paw/puck contact deformation are pure presentation derived from the existing last-hitter and authoritative `paw-hit` event. Reduced motion retains palette ownership and suppresses transforms. |
| D-017 | VERIFIED LOCALLY | Default paws and puck palettes use Godot 4.7.1 sheets exported by merged SFHS `@sfhs/godot-animation`. Seven synchronized contact frames replace the procedural default deformation; physics radii, scoring, settings, and saves remain unchanged. Static custom theme cells keep the transform fallback. |

The detailed historical decision log is retained at [one-shot/DECISIONS.md](../one-shot/DECISIONS.md).
