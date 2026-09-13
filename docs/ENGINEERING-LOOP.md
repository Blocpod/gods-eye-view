# Experience engineering loop

## Direction

The visitor should feel composed situational awareness as they move from the global picture to a sourced local briefing, because God's Eye View makes public information explorable in context.

Preserve every existing capability. Add Conflict Tracker as a separate mode, with a visible return to Explore. The spatial metaphor is an observatory: the globe is the principal interaction surface, the directory provides orientation, and a situation report provides depth. Use restrained motion and readable editorial hierarchy rather than additional decorative effects.

## Research and adaptation

Karpathy's published [autoresearch](https://github.com/karpathy/autoresearch) and [program.md](https://github.com/karpathy/autoresearch/blob/master/program.md) describe a baseline → bounded experiment → measurement → keep/discard → repeat loop. The original evaluates ML training using a fixed time budget and validation bits per byte. This application adapts the workflow; it does not claim Karpathy published a UX-specific methodology or that subjective design quality is an objective benchmark.

1. Establish the unmodified baseline, including screenshots and failing tests.
2. Give each agent a bounded ownership area and explicit interfaces.
3. State a hypothesis, implement it, and verify the user journey.
4. Keep improvements that preserve existing behavior. Fix or remove unsuccessful changes without resetting another agent's work.
5. Record evidence and remaining limitations. Repeat against the same acceptance criteria.

## Acceptance criteria

- All original controls and capabilities remain accessible in Explore.
- Conflict Tracker has an explicit mode switch and first-run entry.
- Mapped representative locations and the keyboard-accessible directory open the same SITREP.
- Search, region filters, empty results, report dismissal, and return to Explore work.
- Briefings show provenance, review dates, and coverage limitations. Curated content is not labeled as a live feed, and location markers are not presented as front lines.
- Desktop and portrait mobile retain accessible navigation, readable report content, visible focus, and no horizontal overflow.
- Reduced-motion preferences are respected. No new continuous animation loop is added.
- Application startup, teardown, browser checks, production build, package boundaries, formatting scope, and existing tests are verified.

## Experiment record

| Experiment                  | Hypothesis                                                                                            | Evidence / decision                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline, `795ed68`         | Existing app is functional but has weak hierarchy and dense cyan HUD styling.                         | Browser loaded without uncaught errors; screenshot captured. Node 24 suite: 3,086 passed, 2 failed, 1 skipped. Both failures involve macOS `/var` vs `/private/var` temporary path aliases. |
| Additive navigation         | Persistent Explore / Conflict Tracker navigation makes task selection legible without removing tools. | Implementation and browser verification recorded in the final review.                                                                                                                       |
| Conflict directory + SITREP | A searchable, sourced directory makes map locations understandable and keyboard accessible.           | Catalog integrity tests and map/list interaction checks recorded in the final review.                                                                                                       |
| Observatory visual system   | Warm typography, restrained color, deliberate alignment and responsive panels improve legibility.     | Desktop/mobile screenshots and critical-failure review recorded in the final review.                                                                                                        |

The final review records actual checks; an award or a “10×” result is not a measurable claim established by this loop.
