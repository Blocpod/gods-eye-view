import * as Cesium from 'cesium';
import {
  CONFLICT_ZONES,
  CONFLICT_COVERAGE,
  CONFLICT_REGIONS,
  filterConflicts,
} from '../data/conflictCatalog.js';
import {
  registerPickOwner,
  unregisterPickOwner,
  resolvePickId,
} from '../data/pickRegistry.js';
import {
  CONFLICT_PICK_PREFIX,
  conflictIdFromPick,
  formatConflictCoordinates,
  formatReviewDate,
  safeSourceUrl,
} from './conflictPresentation.js';
import './conflictTracker.css';

const SEVERITY_COLORS = {
  critical: '#ff8278',
  high: '#e9b676',
  elevated: '#a8d8ff',
};
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        character
      ],
  );
let trackerSequence = 0;

/** A curated, source-linked conflict layer with an accessible directory and SITREPs. */
export function createConflictTracker({
  viewer,
  container = document.body,
  onActiveChange,
  onSelectionChange,
  beforeActivate,
  navigate,
  mapless = false,
} = {}) {
  if (!mapless && (!viewer?.scene || !viewer?.camera))
    throw new TypeError('A Cesium viewer is required');
  const mapAvailable = () => !mapless && viewer && !viewer.isDestroyed?.();
  const requestRender = () => {
    if (mapAvailable()) viewer.scene.requestRender();
  };
  const instanceId = `conflict-tracker-${++trackerSequence}`;
  const ownerId = instanceId;
  const dataSource = mapless ? null : new Cesium.CustomDataSource(instanceId);
  if (dataSource) dataSource.show = false;
  let handler = null;
  let removePreRender = () => {};
  let destroyed = false;
  let active = false;
  let selectedId = null;
  let savedCamera = null;
  let imagerySnapshot = [];
  let visibleIds = new Set(CONFLICT_ZONES.map((zone) => zone.id));
  let selectionOrigin = null;
  const entities = new Map();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const abortController = new AbortController();
  const listen = (element, name, listener) =>
    element.addEventListener(name, listener, {
      signal: abortController.signal,
    });
  const root = document.createElement('section');
  root.className = `conflict-tracker${mapless ? ' conflict-tracker--mapless' : ''}`;
  root.setAttribute('aria-label', 'Conflict tracker');
  root.hidden = true;
  root.innerHTML = `
    <aside class="conflict-directory" aria-labelledby="${instanceId}-title">
      <div class="conflict-directory__heading">
        <div class="conflict-eyebrow"><span class="conflict-square"></span> Global intelligence</div>
        <h2 id="${instanceId}-title">Conflict Tracker</h2>
        <p class="conflict-intro">Context for a changing world.</p>
        <div class="conflict-tally"><span><strong>${CONFLICT_ZONES.length.toString().padStart(2, '0')}</strong> briefings</span><span class="conflict-tally__separator" aria-hidden="true"></span><span class="conflict-muted">Curated reference</span></div>
      </div>
      <div class="conflict-directory__filters">
        <label class="conflict-search"><span class="conflict-search__icon" aria-hidden="true">⌕</span><input type="search" aria-label="Search conflict briefings" placeholder="Search a location or topic" autocomplete="off" spellcheck="false"><span class="conflict-search__hint" aria-hidden="true">↵</span></label>
        <div class="conflict-filter-row">
          <label class="conflict-select-label"><span class="conflict-sr-only">Filter by region</span><select aria-label="Filter conflicts by region"><option value="all">All regions</option>${CONFLICT_REGIONS.map((region) => `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`).join('')}</select></label>
          <label class="conflict-select-label"><span class="conflict-sr-only">Filter by severity</span><select aria-label="Filter conflicts by severity"><option value="all">All priorities</option><option value="critical">Critical</option><option value="high">High</option><option value="elevated">Elevated</option></select></label>
        </div>
        <div class="conflict-list-heading"><span>Situation index</span><span class="conflict-result-count" role="status" aria-live="polite"></span></div>
      </div>
      <div class="conflict-list" role="list" aria-label="Conflict briefings"></div>
      <footer class="conflict-directory__footer"><span class="conflict-review-date">Reviewed ${escapeHtml(formatReviewDate(CONFLICT_COVERAGE.updatedAt))}</span><button type="button" class="conflict-reset-view" aria-label="Show all conflict locations on the globe">Global view <span aria-hidden="true">↗</span></button><p>Curated coverage · Not a live or exhaustive feed</p></footer>
    </aside>
    <div class="conflict-map-caption"><span class="conflict-map-caption__dot"></span><span>${mapless ? 'Interactive globe unavailable. All sourced briefings remain available.' : 'Markers indicate reference locations, not territorial boundaries.'}</span></div>
    ${mapless ? `<div class="conflict-mapless-welcome"><span class="conflict-eyebrow">A broader perspective</span><h3>Understand the<br>world in context.</h3><p>Select a location to read its situation report, explore the key actors and humanitarian impact, and follow the original sources.</p><span class="conflict-muted">${CONFLICT_ZONES.length} curated briefings · Open-source reference</span></div>` : ''}
    <aside class="conflict-sitrep" aria-labelledby="${instanceId}-sitrep-title" hidden>
      <div class="conflict-sitrep__toolbar"><span class="conflict-eyebrow">Situation report <span class="conflict-sitrep__number"></span></span><button type="button" class="conflict-close" aria-label="Close situation report"><span aria-hidden="true">×</span></button></div>
      <div class="conflict-sitrep__body"></div>
    </aside>`;
  container.appendChild(root);
  const list = root.querySelector('.conflict-list');
  const count = root.querySelector('.conflict-result-count');
  const search = root.querySelector('input');
  const [regionSelect, severitySelect] = root.querySelectorAll('select');
  const sitrep = root.querySelector('.conflict-sitrep');
  const sitrepBody = root.querySelector('.conflict-sitrep__body');
  const closeButton = root.querySelector('.conflict-close');
  if (mapless) root.querySelector('.conflict-reset-view').hidden = true;

  if (!mapless) {
    for (const zone of CONFLICT_ZONES) {
      const color = Cesium.Color.fromCssColorString(
        SEVERITY_COLORS[zone.severity] || SEVERITY_COLORS.elevated,
      );
      entities.set(
        zone.id,
        dataSource.entities.add({
          id: `${CONFLICT_PICK_PREFIX}${zone.id}`,
          name: zone.title,
          position: Cesium.Cartesian3.fromDegrees(
            zone.longitude,
            zone.latitude,
            8000,
          ),
          point: {
            pixelSize: 11,
            color,
            outlineColor: color.withAlpha(0.2),
            outlineWidth: 7,
            scaleByDistance: new Cesium.NearFarScalar(1e5, 1.25, 3e7, 0.85),
          },
          label: {
            text: zone.title.toUpperCase(),
            font: '500 11px sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#f1f0e8'),
            outlineColor: Cesium.Color.fromCssColorString('#0b1216'),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -24),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              7e6,
            ),
          },
        }),
      );
    }
    // DataSourceCollection.add resolves asynchronously; destruction must also cover that race.
    Promise.resolve(viewer.dataSources.add(dataSource)).then(() => {
      if (destroyed && !viewer.isDestroyed())
        viewer.dataSources.remove(dataSource, true);
    });

    // Hide points on the far side even when the host uses 3D tiles without a globe.
    const occluder = new Cesium.EllipsoidalOccluder(
      Cesium.Ellipsoid.WGS84,
      viewer.camera.positionWC,
    );
    removePreRender = viewer.scene.preRender.addEventListener(() => {
      if (!active || destroyed) return;
      occluder.cameraPosition = viewer.camera.positionWC;
      for (const [id, entity] of entities) {
        entity.show =
          visibleIds.has(id) &&
          occluder.isPointVisible(
            entity.position.getValue(viewer.clock.currentTime),
          );
      }
    });
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      if (!active || destroyed) return;
      const id = conflictIdFromPick(
        resolvePickId(viewer.scene.pick(click.position)),
      );
      if (id && entities.has(id)) selectConflict(id, { origin: 'map' });
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  function renderList() {
    const zones = filterConflicts({
      query: search.value,
      region: regionSelect.value,
      severity: severitySelect.value,
    });
    visibleIds = new Set(zones.map((zone) => zone.id));
    if (selectedId && !visibleIds.has(selectedId))
      closeSitrep({ restoreFocus: false });
    count.textContent = `${zones.length.toString().padStart(2, '0')} / ${CONFLICT_ZONES.length}`;
    list.innerHTML = zones.length
      ? zones
          .map(
            (zone) => `
      <div role="listitem"><button type="button" class="conflict-item${selectedId === zone.id ? ' is-selected' : ''}" data-conflict-id="${escapeHtml(zone.id)}" aria-pressed="${selectedId === zone.id}">
        <span class="conflict-item__top"><span class="conflict-item__region">${escapeHtml(zone.region)}</span><span class="conflict-severity conflict-severity--${escapeHtml(zone.severity)}">${escapeHtml(zone.severity)}</span></span>
        <span class="conflict-item__title">${escapeHtml(zone.title)}<span class="conflict-item__arrow" aria-hidden="true">↗</span></span>
        <span class="conflict-item__status">${escapeHtml(zone.status || 'Conflict briefing')}</span>
      </button></div>`,
          )
          .join('')
      : '<div class="conflict-empty"><strong>No matching briefings.</strong><p>Try another location or reset your filters.</p><button type="button" data-reset-filters>Reset filters</button></div>';
    for (const [id, entity] of entities) entity.show = visibleIds.has(id);
    requestRender();
  }

  function runNavigation(operation) {
    if (mapless) return operation() !== false;
    if (!mapAvailable()) return false;
    let performed = false;
    const run = () => {
      performed = true;
      return operation() !== false;
    };
    const result = navigate ? navigate(run) : run();
    return performed && result !== false;
  }

  function flyGlobal() {
    if (!mapAvailable()) return;
    viewer.camera.cancelFlight();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(24, 18, 22000000),
      orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
      duration: reducedMotion.matches ? 0 : 1.5,
    });
  }

  function globalView() {
    return runNavigation(flyGlobal);
  }

  function restoreImagery() {
    for (const snapshot of imagerySnapshot) {
      if (snapshot.layer.isDestroyed?.()) continue;
      snapshot.layer.brightness = snapshot.brightness;
      snapshot.layer.saturation = snapshot.saturation;
    }
    imagerySnapshot = [];
  }

  function setActive(nextActive, { initialFlight = flyGlobal } = {}) {
    if (destroyed) return false;
    if (active === Boolean(nextActive)) return true;
    if (nextActive) {
      const snapshot = mapAvailable()
        ? {
            destination: Cesium.Cartesian3.clone(viewer.camera.positionWC),
            orientation: {
              direction: Cesium.Cartesian3.clone(viewer.camera.directionWC),
              up: Cesium.Cartesian3.clone(viewer.camera.upWC),
            },
          }
        : null;
      if (
        !runNavigation(() => {
          if (!mapless && beforeActivate?.() === false) return false;
          if (mapAvailable()) viewer.trackedEntity = undefined;
          initialFlight();
          return true;
        })
      )
        return false;
      savedCamera = snapshot;
      imagerySnapshot = [];
      for (
        let index = 0;
        index < (mapAvailable() ? viewer.imageryLayers?.length || 0 : 0);
        index++
      ) {
        const layer = viewer.imageryLayers.get(index);
        imagerySnapshot.push({
          layer,
          brightness: layer.brightness,
          saturation: layer.saturation,
        });
        layer.brightness = 0.55;
        layer.saturation = 0.75;
      }
      if (!mapless)
        registerPickOwner(ownerId, (id) => Boolean(conflictIdFromPick(id)));
    } else {
      if (
        savedCamera &&
        !runNavigation(() => {
          viewer.camera.cancelFlight();
          viewer.camera.flyTo({
            ...savedCamera,
            duration: reducedMotion.matches ? 0 : 1.1,
          });
        })
      )
        return false;
      closeSitrep({ restoreFocus: false });
      unregisterPickOwner(ownerId);
      restoreImagery();
    }
    active = Boolean(nextActive);
    root.hidden = !active;
    if (dataSource) dataSource.show = active;
    document.body.classList.toggle('conflict-mode-active', active);
    if (mapless)
      document.body.classList.toggle('conflict-mapless-active', active);
    onActiveChange?.(active);
    root.dispatchEvent(
      new CustomEvent('conflictmodechange', {
        detail: { active },
        bubbles: true,
      }),
    );
    requestRender();
    return true;
  }

  function selectConflict(id, { origin = 'programmatic', flyTo = true } = {}) {
    const zone = CONFLICT_ZONES.find((entry) => entry.id === id);
    if (destroyed || !zone) return false;
    const flyToZone = () => {
      if (!flyTo || !mapAvailable()) return;
      viewer.camera.cancelFlight();
      // A mobile report occupies the lower viewport; frame its location above the sheet.
      const latitude =
        zone.latitude -
        (window.matchMedia('(max-width: 760px)').matches ? 12 : 0);
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          zone.longitude,
          latitude,
          4200000,
        ),
        orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
        duration: reducedMotion.matches ? 0 : 1.4,
      });
    };
    // Claim camera authority before mutating filters, selection, or visible report.
    if (!active) {
      if (!setActive(true, { initialFlight: flyToZone })) return false;
    } else if (flyTo && !runNavigation(flyToZone)) return false;
    if (!visibleIds.has(id)) {
      search.value = '';
      regionSelect.value = 'all';
      severitySelect.value = 'all';
      renderList();
    }
    selectedId = id;
    selectionOrigin = origin === 'list' ? document.activeElement : null;
    const number = CONFLICT_ZONES.indexOf(zone) + 1;
    root.querySelector('.conflict-sitrep__number').textContent =
      `/ ${number.toString().padStart(2, '0')}`;
    const sources = zone.sources
      .map((source) => ({ ...source, href: safeSourceUrl(source.url) }))
      .filter((source) => source.href);
    sitrepBody.innerHTML = `
      <div class="conflict-sitrep__meta"><span>${escapeHtml(zone.region)}</span><span class="conflict-severity conflict-severity--${escapeHtml(zone.severity)}">${escapeHtml(zone.severity)} priority</span></div>
      <h2 id="${instanceId}-sitrep-title" tabindex="-1">${escapeHtml(zone.title)}</h2>
      <div class="conflict-coordinates">${escapeHtml(formatConflictCoordinates(zone.latitude, zone.longitude))}</div>
      <div class="conflict-sitrep__review"><span class="conflict-square"></span> Reviewed ${escapeHtml(formatReviewDate(zone.updatedAt))}<span>${escapeHtml(zone.status || 'Reference briefing')}</span></div>
      <p class="conflict-sitrep__summary">${escapeHtml(zone.summary)}</p>
      <section class="conflict-report-section"><h3><span>01</span> Situation overview</h3><p>${escapeHtml(zone.context)}</p></section>
      <section class="conflict-report-section"><h3><span>02</span> Key actors</h3><ul class="conflict-actors">${zone.actors.map((actor) => `<li>${escapeHtml(actor)}</li>`).join('')}</ul></section>
      <section class="conflict-report-section conflict-humanitarian"><h3><span>03</span> Humanitarian impact</h3><p>${escapeHtml(zone.humanitarian)}</p></section>
      <section class="conflict-report-section"><h3><span>04</span> Sources & further reading</h3><ol class="conflict-sources">${sources.map((source, index) => `<li><a href="${escapeHtml(source.href)}" target="_blank" rel="noopener noreferrer"><span class="conflict-source-index">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(source.name)}</span><span aria-hidden="true">↗</span><span class="conflict-sr-only"> (opens in a new tab)</span></a></li>`).join('')}</ol></section>
      <details class="conflict-methodology"><summary>Coverage & methodology</summary><p>${escapeHtml(CONFLICT_COVERAGE.disclaimer)}</p><p>${escapeHtml(CONFLICT_COVERAGE.markerNote)}</p><p>${escapeHtml(CONFLICT_COVERAGE.severityNote)}</p></details>
      <div class="conflict-report-end"><span>End of briefing</span><span aria-hidden="true">■</span></div>`;
    sitrep.hidden = false;
    root.classList.add('has-sitrep');
    sitrepBody.scrollTop = 0;
    for (const [entityId, entity] of entities) {
      const selected = entityId === id;
      entity.point.pixelSize = selected ? 18 : 11;
      entity.point.outlineWidth = selected ? 10 : 7;
      entity.label.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(
          0,
          selected ? Number.MAX_VALUE : 7e6,
        );
    }
    for (const button of list.querySelectorAll('[data-conflict-id]')) {
      const selected = button.dataset.conflictId === id;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    sitrepBody.querySelector('h2').focus({ preventScroll: true });
    onSelectionChange?.(zone);
    root.dispatchEvent(
      new CustomEvent('conflictselect', {
        detail: { conflict: zone },
        bubbles: true,
      }),
    );
    requestRender();
    return true;
  }

  function closeSitrep({ restoreFocus = true } = {}) {
    if (!selectedId) return;
    const previousId = selectedId;
    const selectedEntity = entities.get(previousId);
    selectedId = null;
    sitrep.hidden = true;
    root.classList.remove('has-sitrep');
    if (selectedEntity) {
      selectedEntity.point.pixelSize = 11;
      selectedEntity.point.outlineWidth = 7;
      selectedEntity.label.distanceDisplayCondition =
        new Cesium.DistanceDisplayCondition(0, 7e6);
    }
    for (const button of list.querySelectorAll('[data-conflict-id]')) {
      button.classList.remove('is-selected');
      button.setAttribute('aria-pressed', 'false');
    }
    if (restoreFocus) {
      const target = selectionOrigin?.isConnected
        ? selectionOrigin
        : [...list.querySelectorAll('[data-conflict-id]')].find(
            (button) => button.dataset.conflictId === previousId,
          );
      (target || search).focus({ preventScroll: true });
    }
    selectionOrigin = null;
    onSelectionChange?.(null);
    requestRender();
  }

  listen(search, 'input', renderList);
  listen(regionSelect, 'change', renderList);
  listen(severitySelect, 'change', renderList);
  listen(search, 'keydown', (event) => {
    if (event.key === 'Enter')
      list.querySelector('[data-conflict-id]')?.focus();
  });
  listen(list, 'click', (event) => {
    const button = event.target.closest('[data-conflict-id]');
    if (button) selectConflict(button.dataset.conflictId, { origin: 'list' });
    else if (event.target.closest('[data-reset-filters]')) {
      search.value = '';
      regionSelect.value = 'all';
      severitySelect.value = 'all';
      renderList();
      search.focus();
    }
  });
  listen(closeButton, 'click', () => closeSitrep());
  listen(root.querySelector('.conflict-reset-view'), 'click', () => {
    if (globalView()) closeSitrep();
  });
  listen(document, 'keydown', (event) => {
    if (event.key === 'Escape' && active && selectedId) {
      event.preventDefault();
      event.stopPropagation();
      closeSitrep();
    }
  });
  renderList();

  return {
    setActive,
    selectConflict,
    closeSitrep,
    getState: () => ({
      active,
      selectedId,
      filteredCount: visibleIds.size,
      totalCount: CONFLICT_ZONES.length,
      query: search.value,
      region: regionSelect.value,
      severity: severitySelect.value,
      mapless,
    }),
    get isActive() {
      return active;
    },
    get selectedId() {
      return selectedId;
    },
    get element() {
      return root;
    },
    destroy() {
      if (destroyed) return;
      if (active && (mapless || mapAvailable())) setActive(false);
      // A disposed host may refuse navigation; cleanup still restores appearance.
      restoreImagery();
      document.body.classList.remove('conflict-mode-active');
      if (mapless) document.body.classList.remove('conflict-mapless-active');
      active = false;
      selectedId = null;
      destroyed = true;
      abortController.abort();
      unregisterPickOwner(ownerId);
      handler?.destroy();
      removePreRender();
      if (mapAvailable()) viewer.dataSources.remove(dataSource, true);
      root.remove();
      entities.clear();
    },
  };
}
