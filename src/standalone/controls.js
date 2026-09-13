import { StyleManager } from '../ui.js';
import { showEarthOverview } from '../camera.js';
import { initCockpitCloudEffects } from '../cockpitCloudEffects.js';

/** Construct the existing controls and camera presentation. */
export function createStandaloneControls({
  scene: { viewer, mapStackController },
  loaderStatus,
  placeSearch,
  defer,
}) {
  // Initialize the style manager (post-processing, HUD, locations, share links)
  const styleManager = new StyleManager(viewer, {
    mapStackController,
    placeSearch,
  });
  defer(() => styleManager.orbitController.stop());
  defer(() => styleManager.hud.destroy());
  defer(() => styleManager.dispose());
  // The previous multi-canvas weather compositor remains disabled. Cockpit
  // clouds use a separate, capped low-resolution GPU pass that never attaches
  // Cesium fog or post-process stages and is fully stopped in map mode.
  const weatherEffects = null;
  const cockpitCloudEffects = initCockpitCloudEffects(viewer);
  defer(() => cockpitCloudEffects?.destroy());

  // Open on Earth; a shared link always keeps its saved camera.
  if (!styleManager.hasShareState) {
    loaderStatus.textContent = 'Bringing Earth into focus...';
    showEarthOverview(viewer);
  } else {
    loaderStatus.textContent = 'Restoring shared view...';
  }

  return { styleManager, weatherEffects, cockpitCloudEffects };
}
