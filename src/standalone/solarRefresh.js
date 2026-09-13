/** Repaint the real-time Sun while idle, without acquiring a continuous hold. */
export function installSolarRefresh({ viewer, documentRef }) {
  let destroyed = false;
  const refresh = () => {
    if (destroyed || documentRef.hidden || viewer.isDestroyed()) return;
    viewer.scene.requestRender();
  };
  // Earth's rotation advances only ~0.042 degrees in ten seconds. Interactive
  // frames use the live clock; an idle view never needs a 60fps solar animation.
  const timer = setInterval(refresh, 10000);
  documentRef.addEventListener('visibilitychange', refresh);
  refresh();
  return () => {
    if (destroyed) return;
    destroyed = true;
    clearInterval(timer);
    documentRef.removeEventListener('visibilitychange', refresh);
  };
}
