# Observatory interface and Conflict Tracker review

## Delivered behavior

The header offers Explore and Conflict Tracker. Explore retains the original live layers, camera tracking, cockpit, sensor styles, scenes, voice, provider setup, location search and context tools. Conflict Tracker temporarily hides unrelated chrome without changing persisted layer or visual preferences. Returning to Explore restores the previous camera view and original imagery settings. Entering a briefing deliberately releases follow/orbit camera ownership and cancels pending scene playback; it does not resume a previously tracked target or cinematic run automatically.

The conflict directory contains 28 reviewed briefings across five regions. Search, region and editorial priority filters control both the directory and map cohort. A real globe-marker click or keyboard directory selection opens the same SITREP. Each report contains background, key actors, humanitarian context, review date, source links and methodology. Closing a report restores directory focus. Source-linked briefings remain accessible if WebGL fails during startup.

## Verification

Environment: macOS, Chrome, Node 24.21.0. Use `TMPDIR=/private/tmp` on macOS to avoid the repository's existing `/var` versus `/private/var` test-fixture alias failures.

- Production build, package boundaries and adopted formatting checks passed.
- Full suite: 3,107 tests passed, one pre-existing skipped test. This includes the 14 Node 24 allocation-budget checks.
- `npm run qa:conflict-tracker`: all 29 checks passed. Tests exercise actual Cesium canvas picking, keyboard search and selection, Escape/focus restoration, filters/empty states, persisted preferences, camera restoration, orbit handoff, teardown, and forced WebGL failure.
- Existing `npm run qa:map-source-tray -- --keyless`: all 82 browser checks passed, covering map selection, sensor presets, voice-key arbitration, location disclosure, responsive focus rings and Data Layers transitions.
- Viewports: 1440×900, 1280×633, 390×844 and 320×568. Reports and directories stay within the viewport; lists and report bodies scroll independently. Reduced motion is verified.
- No uncaught browser errors in the new journey or forced-failure fallback.
- All 38 distinct catalog source URLs were opened during research.

Screenshots and machine-readable browser results are generated under the ignored `output/experience/` directory. The repeatable browser script is checked in. Provider keys are optional; keyed services and live voice sessions were not exercised with paid credentials.

## Design review

The review follows the immersive-web-design quality scorecard. The observable improvements are a stable navigation spine, a restrained ink/ivory/chartreuse system, larger editorial headings, quieter optical telemetry, readable reports, purposeful globe-to-location motion, and separately composed portrait sheets. The desktop report and directory share an alignment system; mobile prioritizes the report while preserving navigation and source attribution. The no-WebGL path reuses the same briefing renderer and exposes a retry action.

Visual failures found during iteration were corrected rather than averaged into a score: short-screen directory overflow, excessive surrounding chrome, tiny-screen list collapse, an obscuring Cesium error modal, scene/orbit camera ownership conflicts, mobile rail overlap and edge telemetry interfering with desktop panel height. Screenshots are evidence of the tested compositions, not an independent award assessment or a quantified “10×” claim.

## Limits and maintenance

- The catalog is a reviewed snapshot, not an exhaustive or live conflict feed. Markers are representative locations, not front lines or territorial boundaries. Priority is an editorial attention label, not an official risk score. See [Conflict data](CONFLICT-DATA.md).
- Update briefings by rechecking the cited sources and changing review dates only after review. No background updates or credentials were added.
- Existing share links continue to encode the original camera/layer/style state; this change does not add conflict-report serialization.
- The fallback handles startup failures. Runtime WebGL context loss remains governed by the original Cesium lifecycle.
- External tiles and optional live providers retain their original network, quota and key requirements. No production deployment or merge is part of this change.

See [Engineering loop](ENGINEERING-LOOP.md) for the researched methodology and acceptance criteria.
