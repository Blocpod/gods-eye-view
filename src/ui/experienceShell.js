/** Additive mode navigation; all original controls retain their own owners. */
export function createExperienceShell({
  tracker,
  documentRef = document,
  signal,
}) {
  const header = documentRef.querySelector('.experience-header');
  if (!header) return () => {};
  const buttons = [...header.querySelectorAll('[data-mode]')];
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const clock = header.querySelector('.experience-clock');
  const syncClock = () => {
    if (documentRef.hidden || !clock) return;
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = `${now.toISOString().slice(11, 16)} UTC`;
  };
  const syncMode = () => {
    const active = tracker.isActive;
    for (const button of buttons) {
      button.setAttribute(
        'aria-pressed',
        String((button.dataset.mode === 'conflicts') === active),
      );
    }
  };
  const chooseMode = (active) => {
    // Use the launcher's existing dismissal path so suppression remains opt-in.
    const launcher = documentRef.getElementById('first-run-launcher');
    if (launcher && !launcher.hidden)
      launcher.querySelector('[data-first-run-choice="explore"]')?.click();
    tracker.setActive(active);
    syncMode();
  };
  for (const button of buttons) {
    button.disabled = false;
    button.addEventListener(
      'click',
      () => chooseMode(button.dataset.mode === 'conflicts'),
      options,
    );
  }
  header.querySelector('.experience-brand')?.addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      chooseMode(false);
    },
    options,
  );
  documentRef
    .querySelector('[data-experience-conflicts]')
    ?.addEventListener('click', () => chooseMode(true), options);
  documentRef.addEventListener('visibilitychange', syncClock, options);
  documentRef.defaultView?.addEventListener(
    'gev:conflict-mode-change',
    syncMode,
    options,
  );
  documentRef.body.classList.add('experience-ready');
  syncClock();
  syncMode();
  const timer = setInterval(syncClock, 30000);
  const destroy = () => {
    clearInterval(timer);
    controller.abort();
    signal?.removeEventListener('abort', destroy);
    documentRef.body.classList.remove('experience-ready');
    for (const button of buttons) button.disabled = true;
  };
  signal?.addEventListener('abort', destroy, { once: true });
  return destroy;
}
