# Baseline behavior matrix

| Feature | Source evidence | Browser evidence | Historical physical evidence | Current status |
| --- | --- | --- | --- | --- |
| Two pointer owners | 13 input scenarios | IDs 101/202 owned independently | REPORTED | VERIFIED |
| Independent release | Input scenario | Player 1 release preserves player 2 | REPORTED | VERIFIED |
| Pointer cancellation / lost capture | Input scenarios | Cancellation clears owner | REPORTED | VERIFIED |
| Third touch rejection | Input/physics scenarios | ID 303 rejected | REPORTED | VERIFIED |
| Legal-half confinement / resize mapping | Input/physics scenarios | Portrait mapping | REPORTED | VERIFIED |
| Ready ceremony / countdown | Match-flow scenarios | Joint ready reaches countdown | REPORTED | VERIFIED |
| Paw-puck / wall / post collision | 16 physics scenarios | Source scenario boundary | REPORTED smooth impacts | VERIFIED source / REPORTED physical |
| Exact-once goal / goal reset | Physics and match-flow scenarios | Source scenario boundary | REPORTED | VERIFIED source |
| First-to-five / winner / rematch | Match-flow scenarios | Source scenario boundary | REPORTED | VERIFIED source |
| Pause / resume | Match-flow scenario | Packed artifact pause and resume | REPORTED one sound | VERIFIED |
| Audio unlock / mute / background recovery | 6 audio scenarios and visibility resume path | Unlock reaches ready | REPORTED | VERIFIED source/browser; physical UNTESTED for current artifact |
| Reduced effects | Presentation source contract | Not separately automated | REPORTED | VERIFIED source |
| Portrait layout / landscape gate | Orientation comparison | Portrait → landscape gate → portrait | REPORTED | VERIFIED |
| One visible canvas / WebGL | Pixi v8 adapter source | Exactly one Pixi canvas | REPORTED | VERIFIED |
| Zero runtime requests | Manifest forbids external URLs | One canonical document request; none at runtime | REPORTED | VERIFIED |

Browser evidence is the exact packed artifact (`24d025…c216`) and does not claim an automated full-match goal. Deterministic physics and match-flow scenarios are the current authoritative automated proof for collision-to-winner flow.
