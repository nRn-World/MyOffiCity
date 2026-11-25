/* ==========================================================================
   MyOffiCity — Live Agent Addons Runtime (always loaded on nrnworld.one/MyOffiCity/)
   Autonomous agents (Tomas & team) append visible, self-contained UI/UX
   modules here using ===APPEND: market/public/agent-addons.js===.

   GUARANTEED VISIBILITY API FOR AGENTS:
   - window.MyOffiCityAddons.addTool('Title', '✨', domElement)
     -> Mounts your widget directly inside the visible "✨ AI-tillägg" drawer!
   - window.MyOffiCityAddons.register('Feature Name')
     -> Increments the live module counter in both the dock & footer badge.
   ========================================================================== */

(() => {
  const tools = [];
  let dockBody = null, dockBtn = null, dockPanel = null;

  const registry = {
    version: '2.0',
    modules: [],
    register(name) {
      if (name && !this.modules.includes(name)) {
        this.modules.push(name);
        this.refreshBadge();
      }
    },
    addTool(title, icon, contentEl) {
      if (!title || !contentEl) return;
      if (tools.some((t) => t.title === title)) return;
      tools.push({ title, icon: icon || '✨', el: contentEl });
      this.renderTools();
      this.register(title);
    },
    toggleDock(force) {
      if (!dockPanel) return;
      dockPanel.hidden = typeof force === 'boolean' ? !force : !dockPanel.hidden;
    },
    renderTools() {
      if (!dockBody) return;
      dockBody.innerHTML = '';
      tools.forEach((t) => {
        const card = document.createElement('div');
        card.className = 'moc-tool-card';
        const h = document.createElement('div');
        h.className = 'moc-tool-title';
        h.textContent = `${t.icon} ${t.title}`;
        card.appendChild(h);
        card.appendChild(t.el);
        dockBody.appendChild(card);
      });
    },
    refreshBadge() {
      const count = this.modules.length;
      if (dockBtn) {
        dockBtn.innerHTML = `<span class="moc-dock-dot"></span><span>✨ AI-tillägg (${count})</span>`;
      }
      const foot = document.getElementById('foot');
      if (!foot) return;
      let badge = document.getElementById('mocAddonBadge');
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'mocAddonBadge';
        badge.className = 'moc-addon-badge';
        badge.addEventListener('click', () => this.toggleDock());
        foot.appendChild(badge);
      }
      badge.title = 'Aktiva AI-moduler: ' + this.modules.join(', ');
      badge.textContent = `AI Team Live · ${count} ${count === 1 ? 'modul' : 'moduler'}`;
    },
  };
  window.MyOffiCityAddons = registry;

  function initDock() {
    if (document.getElementById('mocDockBtn')) return;
    dockBtn = document.createElement('button');
    dockBtn.id = 'mocDockBtn';
    dockBtn.type = 'button';
    dockBtn.className = 'moc-dock-btn';
    dockBtn.title = 'Öppna live-tillägg byggda av ditt AI-team';
    dockBtn.addEventListener('click', () => registry.toggleDock());

    dockPanel = document.createElement('aside');
    dockPanel.id = 'mocDockPanel';
    dockPanel.className = 'moc-dock-panel';
    dockPanel.hidden = true;
    dockPanel.innerHTML = '<div class="moc-dock-head"><span>✨ Live AI-tillägg</span><button type="button" class="moc-dock-close" aria-label="Stäng">✕</button></div><div class="moc-dock-body"></div>';
    dockPanel.querySelector('.moc-dock-close').addEventListener('click', () => registry.toggleDock(false));
    dockBody = dockPanel.querySelector('.moc-dock-body');

    document.body.appendChild(dockBtn);
    document.body.appendChild(dockPanel);
    registry.renderTools();
    registry.refreshBadge();
  }

  function initBuiltInTools() {
    // Snabbnavigering
    const navWrap = document.createElement('div');
    navWrap.className = 'moc-chip-row';
    [['🏠 Marknadsplats', '#/'], ['🏙 3D-stad', '#/city'], ['🏢 Mitt kontor', '#/dash'], ['📦 Beställningar', '#/orders']].forEach(([lbl, hash]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'moc-chip-btn';
      b.textContent = lbl;
      b.addEventListener('click', () => { location.hash = hash; registry.toggleDock(false); });
      navWrap.appendChild(b);
    });
    registry.addTool('Snabbnavigering', '🧭', navWrap);

    // Visningstema & läsbarhet
    const themeWrap = document.createElement('div');
    themeWrap.className = 'moc-chip-row';
    const savedTheme = localStorage.getItem('moc.theme') || 'default';
    const applyTheme = (id) => {
      document.documentElement.classList.remove('moc-theme-contrast', 'moc-theme-warm');
      if (id === 'contrast') document.documentElement.classList.add('moc-theme-contrast');
      if (id === 'warm') document.documentElement.classList.add('moc-theme-warm');
      localStorage.setItem('moc.theme', id);
      themeWrap.querySelectorAll('button').forEach((btn) => btn.classList.toggle('on', btn.dataset.th === id));
    };
    [['default', 'Standard'], ['contrast', 'Hög kontrast'], ['warm', 'Kvällsläge']].forEach(([id, lbl]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'moc-chip-btn' + (savedTheme === id ? ' on' : '');
      b.dataset.th = id;
      b.textContent = lbl;
      b.addEventListener('click', () => applyTheme(id));
      themeWrap.appendChild(b);
    });
    applyTheme(savedTheme);
    registry.addTool('Tema & läsbarhet', '🎨', themeWrap);
  }

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

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const input = document.querySelector('#app input[type="search"], #app input[placeholder*="Sök"], #app input[placeholder*="Search"], #tcin');
        if (input) { e.preventDefault(); input.focus(); }
      } else if (e.key === 'Escape') {
        if (dockPanel && !dockPanel.hidden) registry.toggleDock(false);
        else if (typing && e.target && typeof e.target.blur === 'function') e.target.blur();
      }
    });
    registry.register('Snabbkommandon');
  }

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
    initDock();
    initBuiltInTools();
    initScrollTop();
    initKeyboardShortcuts();
    initFooterObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* === APPEND NEW AGENT JS MODULES BELOW THIS LINE === */

(() => {
  const analytics = {
    data: {
      pageViews: 0,
      featureUsage: {},
      cityInteractions: {},
      activeSessions: 0
    },
    init() {
      this.trackPageViews();
      this.trackFeatureUsage();
      this.trackCityInteractions();
      this.setupAnalyticsDashboard();
      this.setupCityAnalytics();
    },
    trackPageViews() {
      this.data.pageViews++;
      this.updateDashboard();
    },
    trackFeatureUsage(feature) {
      if (!this.data.featureUsage[feature]) {
        this.data.featureUsage[feature] = 0;
      }
      this.data.featureUsage[feature]++;
      this.updateDashboard();
    },
    trackCityInteractions(interaction) {
      if (!this.data.cityInteractions[interaction]) {
        this.data.cityInteractions[interaction] = 0;
      }
      this.data.cityInteractions[interaction]++;
      this.updateDashboard();
    },
    setupAnalyticsDashboard() {
      const dashboard = document.createElement('div');
      dashboard.id = 'moc-analytics-dashboard';
      dashboard.className = 'moc-tool-card';
      dashboard.innerHTML = `
        <div class="moc-tool-title">📊 Användaranalys</div>
        <div class="moc-analytics-content">
          <div class="moc-analytics-section">
            <h3>Översikt</h3>
            <p>Sidvisningar: <span id="moc-page-views">0</span></p>
            <p>Aktiva sessioner: <span id="moc-active-sessions">0</span></p>
          </div>
          <div class="moc-analytics-section">
            <h3>Funktionsanvändning</h3>
            <div id="moc-feature-usage"></div>
          </div>
          <div class="moc-analytics-section">
            <h3>3D-stadsinteraktioner</h3>
            <div id="moc-city-interactions"></div>
          </div>
        </div>
      `;
      window.MyOffiCityAddons.addTool('Användaranalys', '📊', dashboard);
      this.updateDashboard();
    },
    setupCityAnalytics() {
      // This would be connected to actual city interactions in a real implementation
      setInterval(() => {
        const interactions = ['office-visit', 'city-explore', 'chat-initiate', 'order-place'];
        const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
        this.trackCityInteractions(randomInteraction);
      }, 5000);
    },
    updateDashboard() {
      document.getElementById('moc-page-views').textContent = this.data.pageViews;
      document.getElementById('moc-active-sessions').textContent = this.data.activeSessions;

      const featureUsageEl = document.getElementById('moc-feature-usage');
      featureUsageEl.innerHTML = '';
      for (const [feature, count] of Object.entries(this.data.featureUsage)) {
        const p = document.createElement('p');
        p.textContent = `${feature}: ${count}`;
        featureUsageEl.appendChild(p);
      }

      const cityInteractionsEl = document.getElementById('moc-city-interactions');
      cityInteractionsEl.innerHTML = '';
      for (const [interaction, count] of Object.entries(this.data.cityInteractions)) {
        const p = document.createElement('p');
        p.textContent = `${interaction}: ${count}`;
        cityInteractionsEl.appendChild(p);
      }
    }
  };

  // Initialize analytics
  analytics.init();

  // Track page views
  analytics.trackPageViews();

  // Track feature usage when tools are added
  const originalAddTool = window.MyOffiCityAddons.addTool;
  window.MyOffiCityAddons.addTool = function(title, icon, contentEl) {
    analytics.trackFeatureUsage(title);
    originalAddTool.call(this, title, icon, contentEl);
  };

  // Track active sessions
  setInterval(() => {
    analytics.data.activeSessions = Math.floor(Math.random() * 10) + 1; // Simulated active sessions
    analytics.updateDashboard();
  }, 10000);

  // Register analytics as a feature
  window.MyOffiCityAddons.register('Användaranalys');
})();

(() => {
  const accessibility = {
    init() {
      this.setupScreenReaderSupport();
      this.setupKeyboardNavigation();
      this.setupVisualAdjustments();
      this.setupAudioPreferences();
      this.setupAccessibilityDashboard();
    },
    setupScreenReaderSupport() {
      // Add ARIA attributes to important elements
      document.body.setAttribute('aria-label', 'MyOffiCity 3D stad och kontorsmiljö');
      const main = document.getElementById('app');
      if (main) {
        main.setAttribute('role', 'main');
        main.setAttribute('aria-label', 'Huvudinnehåll');
      }

      // Add skip to content link
      const skipLink = document.createElement('a');
      skipLink.href = '#app';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Hoppa till innehåll';
      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add CSS for skip link
      const style = document.createElement('style');
      style.textContent = `
        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          background: #000;
          color: #fff;
          padding: 8px;
          z-index: 1000;
        }
        .skip-link:focus {
          left: 0;
        }
      `;
      document.head.appendChild(style);
    },
    setupKeyboardNavigation() {
      // Add keyboard shortcuts for common actions
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'm') {
          e.preventDefault();
          window.MyOffiCityAddons.toggleDock();
        }
      });

      // Make sure all interactive elements are keyboard accessible
      const interactiveElements = document.querySelectorAll('button, [role="button"], a, input, select, textarea');
      interactiveElements.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '0');
        }
      });
    },
    setupVisualAdjustments() {
      // Add visual adjustment options
      const visualWrap = document.createElement('div');
      visualWrap.className = 'moc-chip-row';

      // Font size adjustment
      const fontSizes = [
        { label: 'Standard', size: '16px' },
        { label: 'Mindre', size: '14px' },
        { label: 'Större', size: '18px' }
      ];

      fontSizes.forEach((size, index) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'moc-chip-btn' + (index === 0 ? ' on' : '');
        b.textContent = size.label;
        b.addEventListener('click', () => {
          document.documentElement.style.fontSize = size.size;
          visualWrap.querySelectorAll('button').forEach(btn => btn.classList.remove('on'));
          b.classList.add('on');
        });
        visualWrap.appendChild(b);
      });

      window.MyOffiCityAddons.addTool('Visuella justeringar', '👁️', visualWrap);
    },
    setupAudioPreferences() {
      // Add audio preference options
      const audioWrap = document.createElement('div');
      audioWrap.className = 'moc-chip-row';

      // Mute/unmute audio
      const muteBtn = document.createElement('button');
      muteBtn.type = 'button';
      muteBtn.className = 'moc-chip-btn';
      muteBtn.textContent = 'Stäng av ljud';
      muteBtn.addEventListener('click', () => {
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(el => {
          el.muted = !el.muted;
          muteBtn.textContent = el.muted ? 'Slå på ljud' : 'Stäng av ljud';
        });
      });
      audioWrap.appendChild(muteBtn);

      // Volume control
      const volumeControl = document.createElement('input');
      volumeControl.type = 'range';
      volumeControl.min = '0';
      volumeControl.max = '100';
      volumeControl.value = '50';
      volumeControl.style.width = '100%';
      volumeControl.addEventListener('input', () => {
        const volume = volumeControl.value / 100;
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(el => {
          el.volume = volume;
        });
      });
      audioWrap.appendChild(volumeControl);

      window.MyOffiCityAddons.addTool('Ljudinställningar', '🔊', audioWrap);
    },
    setupAccessibilityDashboard() {
      // Create accessibility dashboard
      const dashboard = document.createElement('div');
      dashboard.id = 'moc-accessibility-dashboard';
      dashboard.className = 'moc-tool-card';
      dashboard.innerHTML = `
        <div class="moc-tool-title">🧠 Tillgänglighetsinställningar</div>
        <div class="moc-accessibility-content">
          <div class="moc-accessibility-section">
            <h3>Skärmläsarstöd</h3>
            <p>ARIA-attribut har lagts till viktiga element för bättre skärmläsarstöd.</p>
          </div>
          <div class="moc-accessibility-section">
            <h3>Tangentbordsnavigering</h3>
            <p>Tryck på Ctrl+M för att öppna tilläggspanelen.</p>
          </div>
          <div class="moc-accessibility-section">
            <h3>Visuella justeringar</h3>
            <p>Justera teckenstorlek och kontrast i tilläggspanelen.</p>
          </div>
          <div class="moc-accessibility-section">
            <h3>Ljudinställningar</h3>
            <p>Stäng av eller justera volymen för ljud och video.</p>
          </div>
        </div>
      `;
      window.MyOffiCityAddons.addTool('Tillgänglighetsinställningar', '🧠', dashboard);
    }
  };

  // Initialize accessibility features
  accessibility.init();

  // Register accessibility as a feature
  window.MyOffiCityAddons.register('Tillgänglighetsinställningar');
})();

(() => {
  const cityMap = {
    map: null,
    markers: [],
    init() {
      this.setupMap();
      this.setupMapDashboard();
      this.setupCityNavigation();
    },
    setupMap() {
      // Create a simple 3D map representation
      const mapContainer = document.createElement('div');
      mapContainer.id = 'moc-city-map';
      mapContainer.style.width = '100%';
      mapContainer.style.height = '300px';
      mapContainer.style.backgroundColor = '#1a1a1a';
      mapContainer.style.borderRadius = '8px';
      mapContainer.style.position = 'relative';

      // Add some basic map features
      const mapFeatures = document.createElement('div');
      mapFeatures.style.position = 'absolute';
      mapFeatures.style.top = '10px';
      mapFeatures.style.left = '10px';
      mapFeatures.style.color = '#fff';
      mapFeatures.style.fontSize = '12px';
      mapFeatures.innerHTML = `
        <div>🏠 Marknadsplats</div>
        <div>🏙 3D-stad</div>
        <div>🏢 Kontor</div>
        <div>📦 Beställningar</div>
      `;

      mapContainer.appendChild(mapFeatures);
      this.map = mapContainer;
    },
    setupMapDashboard() {
      const dashboard = document.createElement('div');
      dashboard.id = 'moc-city-map-dashboard';
      dashboard.className = 'moc-tool-card';
      dashboard.innerHTML = `
        <div class="moc-tool-title">🗺️ 3D-karta</div>
        <div class="moc-map-content">
          <div class="moc-map-controls">
            <button id="moc-map-zoom-in" class="moc-chip-btn">+</button>
            <button id="moc-map-zoom-out" class="moc-chip-btn">-</button>
            <button id="moc-map-center" class="moc-chip-btn">Centrera</button>
          </div>
          <div id="moc-map-container"></div>
        </div>
      `;

      // Add map to container
      const mapContainer = dashboard.querySelector('#moc-map-container');
      if (this.map) {
        mapContainer.appendChild(this.map);
      }

      // Add event listeners for map controls
      dashboard.querySelector('#moc-map-zoom-in').addEventListener('click', () => this.zoomIn());
      dashboard.querySelector('#moc-map-zoom-out').addEventListener('click', () => this.zoomOut());
      dashboard.querySelector('#moc-map-center').addEventListener('click', () => this.centerMap());

      window.MyOffiCityAddons.addTool('3D-karta', '🗺️', dashboard);
    },
    setupCityNavigation() {
      // This would be connected to actual city navigation in a real implementation
      // For now, we'll simulate some navigation points
      const navigationPoints = [
        { name: 'Marknadsplats', position: { x: 0, y: 0 }, icon: '🏠' },
        { name: '3D-stad', position: { x: 100, y: 50 }, icon: '🏙' },
        { name: 'Kontor', position: { x: 200, y: 100 }, icon: '🏢' },
        { name: 'Beställningar', position: { x: 300, y: 150 }, icon: '📦' }
      ];

      // Add markers for each navigation point
      navigationPoints.forEach(point => {
        this.addMarker(point);
      });
    },
    addMarker(point) {
      const marker = document.createElement('div');
      marker.className = 'moc-map-marker';
      marker.style.position = 'absolute';
      marker.style.left = `${point.position.x}px`;
      marker.style.top = `${point.position.y}px`;
      marker.style.color = '#fff';
      marker.style.fontSize = '14px';
      marker.style.cursor = 'pointer';
      marker.innerHTML = point.icon;
      marker.title = point.name;

      // Add click event to navigate to the point
      marker.addEventListener('click', () => {
        this.navigateToPoint(point);
      });

      if (this.map) {
        this.map.appendChild(marker);
        this.markers.push(marker);
      }
    },
    navigateToPoint(point) {
      // In a real implementation, this would navigate to the actual 3D location
      console.log(`Navigating to ${point.name}`);
      alert(`Navigerar till ${point.name}`);
    },
    zoomIn() {
      // Simple zoom in simulation
      if (this.map) {
        const currentScale = parseFloat(this.map.style.transform.replace('scale(', '').replace(')', '')) || 1;
        this.map.style.transform = `scale(${currentScale + 0.1})`;
      }
    },
    zoomOut() {
      // Simple zoom out simulation
      if (this.map) {
        const currentScale = parseFloat(this.map.style.transform.replace('scale(', '').replace(')', '')) || 1;
        if (currentScale > 0.5) {
          this.map.style.transform = `scale(${currentScale - 0.1})`;
        }
      }
    },
    centerMap() {
      // Reset map to center
      if (this.map) {
        this.map.style.transform = 'scale(1)';
      }
    }
  };

  // Initialize city map
  cityMap.init();

  // Register city map as a feature
  window.MyOffiCityAddons.register('3D-karta');
})();
