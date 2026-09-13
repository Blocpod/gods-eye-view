import * as Cesium from 'cesium';

/** Create the standard globe viewer in caller-owned, visible containers. */
export function createApplicationViewer({ container, creditContainer }) {
  if (!container || !creditContainer)
    throw new TypeError('Viewer and credit containers are required');
  const viewer = new Cesium.Viewer(container, {
    timeline: false,
    animation: false,
    shouldAnimate: true,
    automaticallyTrackDataSourceClocks: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    vrButton: false,
    selectionIndicator: false,
    infoBox: false,
    baseLayer: false,
    creditContainer,
    msaaSamples: 4,
    contextOptions: { webgl: { preserveDrawingBuffer: true } },
  });
  try {
    viewer.targetFrameRate = 60;
    // An optional data layer loading must not stop the astronomical clock.
    viewer.allowDataSourcesToSuspendAnimation = false;
    viewer.scene.globe.show = false;
    viewer.scene.skyAtmosphere.show = true;
    // Cesium derives the Sun's Earth-fixed direction from this clock. Use wall
    // time, including after sleep, rather than a paused or accelerated timeline.
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK;
    viewer.scene.light = new Cesium.SunLight();
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.dynamicAtmosphereLighting = true;
    viewer.scene.globe.dynamicAtmosphereLightingFromSun = true;
    // Keep the terminator when zooming in; Cesium's default fades lighting to
    // uniform daylight near the surface. Distinct endpoints avoid division by 0.
    viewer.scene.globe.lightingFadeOutDistance = 0;
    viewer.scene.globe.lightingFadeInDistance = 1;
    viewer.scene.atmosphere.dynamicLighting =
      Cesium.DynamicAtmosphereLightingType.SUNLIGHT;
    viewer.scene.skyAtmosphere.atmosphereLightIntensity = 10;
    viewer.scene.skyAtmosphere.saturationShift = -0.12;
    viewer.scene.skyAtmosphere.brightnessShift = -0.08;
    return viewer;
  } catch (error) {
    viewer.destroy();
    throw error;
  }
}
