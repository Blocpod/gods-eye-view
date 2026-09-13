import { CONFLICT_ZONES } from '../data/conflictCatalog.js';
import './commandPalette.css';

/** A single keyboard entry point into the existing tools and sourced reports. */
export function createCommandPalette({ tracker, styleManager, signal }) {
  const trigger = document.querySelector('.experience-search-trigger');
  if (!trigger) return () => {};
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const dialog = document.createElement('dialog');
  dialog.className = 'command-palette';
  dialog.setAttribute('aria-labelledby', 'command-palette-title');
  dialog.innerHTML = `
    <header class="command-palette__header">
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <label id="command-palette-title" class="command-palette__sr" for="command-palette-input">Search places, tools and conflict briefings</label>
      <input id="command-palette-input" placeholder="Where would you like to go?" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-controls="command-palette-results" aria-expanded="true" />
      <button type="button" class="command-palette__close" aria-label="Close search">Esc</button>
    </header>
    <p class="command-palette__section">QUICK ACCESS</p>
    <div id="command-palette-results" role="listbox" aria-label="Search results"></div>
    <p class="command-palette__status" role="status" aria-live="polite"></p>
    <footer><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span>Places · Tools · Briefings</span></footer>`;
  document.body.append(dialog);
  const input = dialog.querySelector('input');
  const results = dialog.querySelector('[role="listbox"]');
  const status = dialog.querySelector('[role="status"]');
  let selected = 0;
  let visible = [];
  let previousFocus;
  const dismissWelcome = () => {
    const launcher = document.getElementById('first-run-launcher');
    if (launcher && !launcher.hidden)
      launcher.querySelector('[data-first-run-choice="explore"]')?.click();
  };
  const explore = () => {
    if (tracker.isActive) tracker.setActive(false);
    return !tracker.isActive;
  };
  const openPanel = (id, focusSelector) => {
    if (!explore()) return;
    styleManager.setPanelCollapsed(id, false, { explicit: true });
    document.querySelector(focusSelector || `#${id} button`)?.focus();
  };
  const actions = [
    {
      title: 'Find a place',
      detail: 'Search any city, landmark or coordinates',
      icon: 'travel_explore',
      keywords: 'location city address map',
      run: (query) => {
        openPanel('location-bar', '#location-search');
        const location = document.getElementById('location-search');
        if (query && location) {
          location.value = query;
          location.dispatchEvent(new Event('input', { bubbles: true }));
          location.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
          );
        }
      },
    },
    {
      title: 'Conflict Tracker',
      detail: '28 sourced briefings across the globe',
      icon: 'crisis_alert',
      keywords: 'war sitrep intelligence',
      run: () => tracker.setActive(true),
    },
    {
      title: 'Global overview',
      detail: 'Return to a view of the whole Earth',
      icon: 'public',
      keywords: 'earth home world reset',
      run: () => {
        if (explore()) return styleManager.resetToGlobeView();
      },
    },
    {
      title: 'Data layers',
      detail: 'Aircraft, vessels, satellites and more',
      icon: 'layers',
      keywords: 'contacts live traffic earthquake fires',
      run: () => openPanel('data-panel'),
    },
    {
      title: 'Visual styles',
      detail: 'Choose a different lens on the world',
      icon: 'auto_awesome',
      keywords: 'thermal anime noir retro style',
      run: () => openPanel('control-panel'),
    },
    {
      title: 'Scene director',
      detail: 'Explore curated scenes and camera sequences',
      icon: 'movie',
      keywords: 'cinematic scenes tour',
      run: () => openPanel('scene-panel'),
    },
  ];
  const briefings = CONFLICT_ZONES.map((zone) => ({
    title: zone.title,
    detail: `${zone.region} · Situation report`,
    icon: 'description',
    keywords: `${zone.region} ${zone.actors.join(' ')} sitrep briefing conflict`,
    run: () =>
      tracker.selectConflict(zone.id, { origin: 'search', flyTo: true }),
  }));
  const close = (restore = true) => {
    dialog.close();
    if (restore && previousFocus?.isConnected) previousFocus.focus();
  };
  const choose = (index) => {
    const action = visible[index];
    if (!action) return;
    const query = input.value.trim();
    close(false);
    Promise.resolve()
      .then(() => action.run(action.title === 'Find a place' ? query : ''))
      .catch((error) => {
        dialog.showModal();
        status.textContent = `Unable to open this view. ${error.message || 'Please try again.'}`;
        input.focus();
      });
  };
  const markSelected = () => {
    const rows = [...results.children];
    rows.forEach((row, index) =>
      row.setAttribute('aria-selected', String(index === selected)),
    );
    const row = rows[selected];
    if (row) {
      input.setAttribute('aria-activedescendant', row.id);
      row.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };
  const render = () => {
    const query = input.value.trim().toLocaleLowerCase();
    visible = query
      ? [...actions, ...briefings].filter((action) =>
          `${action.title} ${action.detail} ${action.keywords}`
            .toLocaleLowerCase()
            .includes(query),
        )
      : actions;
    // Place search is always available, including terms outside the catalog.
    if (query && !visible.includes(actions[0])) visible.push(actions[0]);
    selected = 0;
    results.replaceChildren();
    visible.forEach((action, index) => {
      const row = document.createElement('div');
      row.id = `command-result-${index}`;
      row.className = 'command-palette__result';
      row.setAttribute('role', 'option');
      const icon = document.createElement('span');
      icon.className = 'material-symbols-outlined';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = action.icon;
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent =
        action.title === 'Find a place' && query
          ? `Search places for “${input.value.trim()}”`
          : action.title;
      const detail = document.createElement('small');
      detail.textContent = action.detail;
      copy.append(title, detail);
      row.append(icon, copy);
      row.dataset.commandIndex = String(index);
      results.append(row);
    });
    dialog.querySelector('.command-palette__section').textContent = query
      ? 'SEARCH RESULTS'
      : 'QUICK ACCESS';
    status.textContent = `${visible.length} ${visible.length === 1 ? 'result' : 'results'}`;
    markSelected();
  };
  const open = () => {
    dismissWelcome();
    previousFocus = document.activeElement;
    input.value = '';
    dialog.showModal();
    render();
    input.focus();
  };
  trigger.disabled = false;
  trigger.addEventListener('click', open, options);
  input.addEventListener('input', render, options);
  results.addEventListener(
    'click',
    (event) => {
      const row = event.target.closest('[data-command-index]');
      if (row && results.contains(row))
        choose(Number(row.dataset.commandIndex));
    },
    options,
  );
  dialog
    .querySelector('.command-palette__close')
    .addEventListener('click', () => close(), options);
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    options,
  );
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close();
      }
    },
    options,
  );
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.isComposing || event.keyCode === 229) {
        if (dialog.open) event.stopImmediatePropagation();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (
          document.body.matches(
            '.cockpit-mode, .ui-clean-view, .recording-mode',
          )
        )
          return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (dialog.open) close();
        else open();
        return;
      }
      if (!dialog.open) return;
      // The modal owns keys before the map's existing global shortcuts.
      event.stopImmediatePropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        selected =
          (selected + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) %
          visible.length;
        markSelected();
      } else if (event.key === 'Enter' && event.target === input) {
        event.preventDefault();
        choose(selected);
      }
    },
    { ...options, capture: true },
  );
  const destroy = () => {
    controller.abort();
    signal?.removeEventListener('abort', destroy);
    dialog.remove();
    trigger.disabled = true;
  };
  signal?.addEventListener('abort', destroy, { once: true });
  return destroy;
}
