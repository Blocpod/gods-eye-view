# Real-time solar lighting

The standard globe now enables Cesium SunLight, surface lighting and Sun-driven atmospheric scattering. The clock follows the computer's current UTC through `ClockStep.SYSTEM_CLOCK`; data sources cannot replace or suspend it. Correct time on the host remains a prerequisite. No accelerated timeline or decorative rotating shadow is used.

Near-surface lighting no longer fades to uniform daylight as the camera zooms in. The atmosphere uses a lower light intensity to reduce the uniformly bright halo. Existing basemaps, source selection, camera controls, sensor styles and conflict markers remain available. The change does not supply live weather, cloud imagery, city-light imagery or new terrain. Photorealistic 3D tiles retain their provider's captured/baked material lighting; this is not a relighting of those photographs.

Cesium computes the Sun direction each rendered frame. The idle render governor stays enabled with `maximumRenderTimeChange = Infinity`; a disposable ten-second refresh requests a single frame without acquiring a continuous-render hold. Ten seconds corresponds to approximately 0.042 degrees of Earth rotation. Hidden views request no frames, visibility restoration requests an immediate frame, and the next system-clock tick catches up after sleep.

## Verification

`npm run qa:solar-lighting` verifies the actual rendered Sun direction and image luminance using the real browser renderer. Fixed dates are test fixtures only; the application always starts on current UTC.

- Nine browser checks pass: current clock, surface/atmosphere configuration, equinox noon/midnight, seasonal tilt, rendered darkness, live-time restoration, idle policy and Conflict Tracker coexistence.
- Equinox Sun latitude: −0.043°; local-noon longitude: 1.864° east. Twelve hours later longitude is −178.173°.
- Solstice latitudes: +23.438° in June and −23.434° in December.
- Identical center-terrain samples measured luminance 115.45 by day and 22.47 by night.
- Unit coverage verifies refresh cadence, hidden pause, immediate resume, destroyed-viewer safety and idempotent teardown.

Artifacts are generated under ignored `output/solar/`. The timing/shading values are rendering checks, not claims that satellite imagery itself is live.

## References

- [Cesium Globe lighting and atmosphere](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html)
- [Cesium Clock and system-time behavior](https://cesium.com/learn/cesiumjs/ref-doc/Clock.html)

The integration was checked against the installed Cesium source as well as the official API documentation.
