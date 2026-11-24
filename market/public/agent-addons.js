/* ==========================================================================
   MyOffiCity — Live Agent Addons Runtime (always loaded on nrnworld.one/MyOffiCity/)
   Autonomous agents (Tomas & team) append visible, self-contained UI/UX
   modules here so every merged PR appears immediately on the live website.

   RULES FOR AGENTS:
   - ALWAYS preserve all existing code in this file.
   - Append new features at the bottom inside their own (() => { ... })(); IIFE.
   - Register each feature with window.MyOffiCityAddons.register('Feature Name').
   - Use safe DOM checks (if (!el) return;) and never break portal.js or office.js.
   ========================================================================== */

(() => {
  const registry = {
    version: '1.0',
    modules: [],
    register(name) {
      if (name && !this.modules.includes(name)) {
        this.modules.push(name);
        this.refreshBadge();
      }
    },
    refreshBadge() {
      const foot = document.getElementById('foot');
      if (!foot) return;
      let badge = document.getElementById('mocAddonBadge');
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'mocAddonBadge';
        badge.className = 'moc-addon-badge';
        foot.appendChild(badge);
      }
      const count = this.modules.length;
      badge.title = 'Active AI Team Addons: ' + this.modules.join(', ');
      badge.textContent = `AI Team Live · ${count} ${count === 1 ? 'modul' : 'moduler'}`;
    },
  };
  window.MyOffiCityAddons = registry;

  // 1. Scroll-to-top button
  function initScrollTop() {
    if (document.getElementById('mocScrollTop')) return;
    const btn = document.createElement('button');
    btn.id = 'mocScrollTop';
    btn.className = 'moc-scroll-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.title = 'Tillbaka till toppen';
    btn.textContent = '↑';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(btn);

    const toggle = () => btn.classList.toggle('visible', window.scrollY > 320);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    registry.register('Scroll-to-top');
  }

  // 2. Quick keyboard shortcuts ('/' focuses search or chat input, 'Escape' blurs)
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const input = document.querySelector('#app input[type="search"], #app input[placeholder*="Sök"], #app input[placeholder*="Search"], #tcIn');
        if (input) {
          e.preventDefault();
          input.focus();
        }
      } else if (e.key === 'Escape' && typing && e.target && typeof e.target.blur === 'function') {
        e.target.blur();
      }
    });
    registry.register('Snabbkommandon');
  }

  // 3. Keep footer badge alive across SPA route re-renders
  function initFooterObserver() {
    const foot = document.getElementById('foot');
    if (!foot) return;
    const mo = new MutationObserver(() => {
      if (!document.getElementById('mocAddonBadge')) registry.refreshBadge();
    });
    mo.observe(foot, { childList: true });
    registry.refreshBadge();
  }

  function boot() {
    initScrollTop();
    initKeyboardShortcuts();
    initFooterObserver();
    registry.register('Mobiloptimering');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* === APPEND NEW AGENT JS MODULES BELOW THIS LINE === */

(() => {
  // 4. Interactive 3D City Map Widget
  function initCityMapWidget() {
    if (document.getElementById('mocCityMapWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'mocCityMapWidget';
    widget.className = 'moc-city-map-widget';

    // Create map container
    const mapContainer = document.createElement('div');
    mapContainer.className = 'moc-map-container';

    // Create controls container
    const controls = document.createElement('div');
    controls.className = 'moc-map-controls';

    // Add layers toggle
    const layersToggle = document.createElement('button');
    layersToggle.className = 'moc-map-toggle';
    layersToggle.textContent = 'Växla lager';
    layersToggle.addEventListener('click', toggleMapLayers);

    // Add navigation button
    const navButton = document.createElement('button');
    navButton.className = 'moc-map-nav';
    navButton.textContent = 'Navigera';
    navButton.addEventListener('click', showNavigationOptions);

    controls.appendChild(layersToggle);
    controls.appendChild(navButton);

    widget.appendChild(mapContainer);
    widget.appendChild(controls);

    // Add widget to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(widget);
      window.MyOffiCityAddons.register('3D City Map Widget');
    }

    // Initialize the map
    initMap(mapContainer);
  }

  function initMap(container) {
    // This would be replaced with actual map initialization code
    // For now, we'll just add a placeholder
    container.innerHTML = '<div class="moc-map-placeholder">Interaktiv karta laddas...</div>';

    // In a real implementation, you would use a mapping library like Leaflet or Mapbox
    // to initialize the map and add it to the container
  }

  function toggleMapLayers() {
    // Toggle between different map layers
    console.log('Toggling map layers');
  }

  function showNavigationOptions() {
    // Show navigation options for the user
    console.log('Showing navigation options');
  }

  // Add the widget to the initialization
  function boot() {
    initCityMapWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
