import { createConflictTracker } from '../conflicts/conflictTracker.js';

/** Preserve access to the briefing library when the interactive globe cannot boot. */
export function showConflictFallback() {
  // Cesium may leave its modal behind when construction throws before ownership
  // can be registered. Replace it with the actionable, accessible fallback.
  document
    .querySelectorAll('.cesium-widget-errorPanel')
    .forEach((panel) => panel.remove());
  const tracker = createConflictTracker({ mapless: true });
  tracker.setActive(true);
  document.getElementById('loading-screen')?.remove();
  const explore = document.querySelector('[data-mode="explore"]');
  explore.disabled = true;
  explore.setAttribute('aria-pressed', 'false');
  explore.title = 'The interactive globe is unavailable. Retry to explore.';
  const conflict = document.querySelector('[data-mode="conflicts"]');
  conflict.disabled = false;
  conflict.setAttribute('aria-pressed', 'true');
  const resetBriefing = () => tracker.closeSitrep();
  conflict.addEventListener('click', resetBriefing);
  const status = document.querySelector('.experience-status-label');
  if (status) status.textContent = 'REFERENCE MODE';
  const clock = document.querySelector('.experience-clock');
  if (clock) {
    const now = new Date().toISOString();
    clock.dateTime = now;
    clock.textContent = `${now.slice(11, 16)} UTC`;
  }
  document
    .querySelector('.experience-brand')
    ?.addEventListener('click', (event) => {
      event.preventDefault();
      location.reload();
    });
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'conflict-fallback-retry';
  retry.textContent = 'Retry globe';
  retry.addEventListener('click', () => location.reload());
  tracker.element.querySelector('.conflict-map-caption').appendChild(retry);
  window.addEventListener(
    'pagehide',
    () => {
      conflict.removeEventListener('click', resetBriefing);
      tracker.destroy();
    },
    { once: true },
  );
  return tracker;
}
