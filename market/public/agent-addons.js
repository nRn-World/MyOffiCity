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

(() => {
  const cityControls = {
    camera: null,
    controls: null,
    init() {
      this.setupKeyboardShortcuts();
      this.setupCityMap();
      this.setupCityInteractionTracking();
    },
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (!this.camera || !this.controls) return;

        // Rotation controls
        if (e.key === 'ArrowLeft') {
          this.camera.rotation.y += 0.1;
        } else if (e.key === 'ArrowRight') {
          this.camera.rotation.y -= 0.1;
        } else if (e.key === 'ArrowUp') {
          this.camera.rotation.x += 0.1;
        } else if (e.key === 'ArrowDown') {
          this.camera.rotation.x -= 0.1;
        }

        // Zoom controls
        if (e.key === '+' || e.key === '=') {
          this.camera.position.z -= 10;
        } else if (e.key === '-') {
          this.camera.position.z += 10;
        }

        // Movement controls
        if (e.key === 'w' || e.key === 'W') {
          this.camera.position.z -= 10;
        } else if (e.key === 's' || e.key === 'S') {
          this.camera.position.z += 10;
        } else if (e.key === 'a' || e.key === 'A') {
          this.camera.position.x -= 10;
        } else if (e.key === 'd' || e.key === 'D') {
          this.camera.position.x += 10;
        }

        // Reset view
        if (e.key === 'r' || e.key === 'R') {
          this.camera.position.set(0, 0, 100);
          this.camera.rotation.set(0, 0, 0);
        }
      });

      // Add keyboard shortcuts help
      const helpWrap = document.createElement('div');
      helpWrap.className = 'moc-chip-row';
      const shortcuts = [
        ['Piltangenter', 'Rotera'],
        ['+ / -', 'Zooma'],
        ['WASD', 'Flytta'],
        ['R', 'Återställ vy']
      ];

      shortcuts.forEach(([keys, action]) => {
        const p = document.createElement('p');
        p.textContent = `${keys}: ${action}`;
        helpWrap.appendChild(p);
      });

      window.MyOffiCityAddons.addTool('3D-stadsgenvägar', '🎮', helpWrap);
    },
    setupCityMap() {
      const mapContainer = document.createElement('div');
      mapContainer.id = 'moc-city-map';
      mapContainer.style.height = '300px';
      mapContainer.style.width = '100%';
      mapContainer.style.position = 'relative';

      const mapContent = document.createElement('div');
      mapContent.className = 'moc-map-content';

      // Add map controls
      const mapControls = document.createElement('div');
      mapControls.className = 'moc-map-controls';

      const zoomInBtn = document.createElement('button');
      zoomInBtn.type = 'button';
      zoomInBtn.className = 'moc-chip-btn';
      zoomInBtn.textContent = '+';
      zoomInBtn.addEventListener('click', () => {
        if (this.camera) this.camera.position.z -= 10;
      });

      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.type = 'button';
      zoomOutBtn.className = 'moc-chip-btn';
      zoomOutBtn.textContent = '-';
      zoomOutBtn.addEventListener('click', () => {
        if (this.camera) this.camera.position.z += 10;
      });

      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'moc-chip-btn';
      resetBtn.textContent = 'Återställ';
      resetBtn.addEventListener('click', () => {
        if (this.camera) {
          this.camera.position.set(0, 0, 100);
          this.camera.rotation.set(0, 0, 0);
        }
      });

      mapControls.appendChild(zoomInBtn);
      mapControls.appendChild(zoomOutBtn);
      mapControls.appendChild(resetBtn);

      mapContent.appendChild(mapControls);
      mapContainer.appendChild(mapContent);

      // Add markers for companies (simulated data)
      const companies = [
        { name: 'TechCorp', lat: 59.3293, lon: 18.0686 },
        { name: 'InnovateX', lat: 59.3326, lon: 18.0649 },
        { name: 'FutureWorks', lat: 59.3356, lon: 18.0612 },
        { name: 'DigitalSolutions', lat: 59.3386, lon: 18.0575 }
      ];

      companies.forEach(company => {
        const marker = document.createElement('div');
        marker.className = 'moc-map-marker';
        marker.title = company.name;
        marker.style.left = `${(company.lon - 18.05) * 1000}px`;
        marker.style.top = `${(59.34 - company.lat) * 1000}px`;
        mapContainer.appendChild(marker);
      });

      window.MyOffiCityAddons.addTool('3D-stadskarta', '🗺️', mapContainer);

      // Initialize Three.js camera and controls if available
      if (window.THREE) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 100;

        // Simulate controls (in a real implementation, this would be connected to your actual 3D scene)
        this.controls = {
          enabled: true,
          update: () => {}
        };
      }
    },
    setupCityInteractionTracking() {
      // Track city interactions
      const trackInteraction = (interaction) => {
        if (window.MyOffiCityAddons && window.MyOffiCityAddons.trackCityInteractions) {
          window.MyOffiCityAddons.trackCityInteractions(interaction);
        }
      };

      // Track camera movements
      if (this.camera) {
        let lastPosition = this.camera.position.clone();
        let lastRotation = this.camera.rotation.clone();

        setInterval(() => {
          if (!this.camera) return;

          // Check if camera has moved
          if (!this.camera.position.equals(lastPosition)) {
            trackInteraction('camera-move');
            lastPosition.copy(this.camera.position);
          }

          // Check if camera has rotated
          if (!this.camera.rotation.equals(lastRotation)) {
            trackInteraction('camera-rotate');
            lastRotation.copy(this.camera.rotation);
          }
        }, 1000);
      }

      // Track keyboard interactions
      document.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-', '=', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'r', 'R'].includes(e.key)) {
          trackInteraction('keyboard-interaction');
        }
      });
    }
  };

  // Initialize city controls
  cityControls.init();

  // Register city controls as a feature
  window.MyOffiCityAddons.register('3D-stadsinteraktion');
})();

(() => {
  const agentMarket = {
    data: {
      popularAgents: [],
      agentTrends: {},
      agentStats: {}
    },
    init() {
      this.fetchAgentData();
      this.setupAgentMarketWidget();
      this.setupAgentTrendsWidget();
      this.setupAgentStatsWidget();
      this.startDataRefresh();
    },
    fetchAgentData() {
      // Simulate fetching agent data from an API
      this.data.popularAgents = [
        { name: 'Tomas', usage: 1200, rating: 4.9 },
        { name: 'Ebba', usage: 950, rating: 4.8 },
        { name: 'Kia', usage: 870, rating: 4.7 },
        { name: 'Manus', usage: 780, rating: 4.6 },
        { name: 'Laila', usage: 690, rating: 4.5 }
      ];

      this.data.agentTrends = {
        daily: { Tomas: 120, Ebba: 95, Kia: 87, Manus: 78, Laila: 69 },
        weekly: { Tomas: 840, Ebba: 665, Kia: 609, Manus: 546, Laila: 483 },
        monthly: { Tomas: 3360, Ebba: 2660, Kia: 2430, Manus: 2184, Laila: 1932 }
      };

      this.data.agentStats = {
        active: 5,
        total: 25,
        avgRating: 4.75,
        avgUsage: 840
      };

      this.updateWidgets();
    },
    setupAgentMarketWidget() {
      const marketWidget = document.createElement('div');
      marketWidget.id = 'moc-agent-market';
      marketWidget.className = 'moc-tool-card';
      marketWidget.innerHTML = `
        <div class="moc-tool-title">🤖 Populära AI-agenter</div>
        <div class="moc-agent-market-content">
          <div class="moc-agent-list" id="moc-agent-list"></div>
          <div class="moc-agent-stats" id="moc-agent-stats"></div>
        </div>
      `;
      window.MyOffiCityAddons.addTool('AI-agentmarknad', '🤖', marketWidget);
    },
    setupAgentTrendsWidget() {
      const trendsWidget = document.createElement('div');
      trendsWidget.id = 'moc-agent-trends';
      trendsWidget.className = 'moc-tool-card';
      trendsWidget.innerHTML = `
        <div class="moc-tool-title">📈 Agenttrender</div>
        <div class="moc-agent-trends-content">
          <div class="moc-trend-periods">
            <button class="moc-chip-btn on" data-period="daily">Daglig</button>
            <button class="moc-chip-btn" data-period="weekly">Veckovis</button>
            <button class="moc-chip-btn" data-period="monthly">Månatlig</button>
          </div>
          <div class="moc-trend-chart" id="moc-trend-chart"></div>
        </div>
      `;

      trendsWidget.querySelectorAll('.moc-trend-periods button').forEach(btn => {
        btn.addEventListener('click', () => {
          trendsWidget.querySelectorAll('.moc-trend-periods button').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          this.updateTrendChart(btn.dataset.period);
        });
      });

      window.MyOffiCityAddons.addTool('Agenttrender', '📈', trendsWidget);
      this.updateTrendChart('daily');
    },
    setupAgentStatsWidget() {
      const statsWidget = document.createElement('div');
      statsWidget.id = 'moc-agent-stats';
      statsWidget.className = 'moc-tool-card';
      statsWidget.innerHTML = `
        <div class="moc-tool-title">📊 Agentstatistik</div>
        <div class="moc-agent-stats-content" id="moc-agent-stats-content"></div>
      `;
      window.MyOffiCityAddons.addTool('Agentstatistik', '📊', statsWidget);
    },
    updateWidgets() {
      this.updateAgentList();
      this.updateAgentStats();
      this.updateTrendChart(document.querySelector('#moc-agent-trends .moc-chip-btn.on')?.dataset.period || 'daily');
    },
    updateAgentList() {
      const listEl = document.getElementById('moc-agent-list');
      if (!listEl) return;

      listEl.innerHTML = '';
      this.data.popularAgents.forEach(agent => {
        const agentEl = document.createElement('div');
        agentEl.className = 'moc-agent-item';
        agentEl.innerHTML = `
          <div class="moc-agent-name">${agent.name}</div>
          <div class="moc-agent-metrics">
            <span class="moc-agent-usage">Användning: ${agent.usage}</span>
            <span class="moc-agent-rating">Betyg: ${agent.rating}</span>
          </div>
        `;
        listEl.appendChild(agentEl);
      });
    },
    updateAgentStats() {
      const statsEl = document.getElementById('moc-agent-stats-content');
      if (!statsEl) return;

      statsEl.innerHTML = `
        <div class="moc-stat-item">
          <span class="moc-stat-label">Aktiva agenter:</span>
          <span class="moc-stat-value">${this.data.agentStats.active}</span>
        </div>
        <div class="moc-stat-item">
          <span class="moc-stat-label">Totala agenter:</span>
          <span class="moc-stat-value">${this.data.agentStats.total}</span>
        </div>
        <div class="moc-stat-item">
          <span class="moc-stat-label">Genomsnittligt betyg:</span>
          <span class="moc-stat-value">${this.data.agentStats.avgRating}</span>
        </div>
        <div class="moc-stat-item">
          <span class="moc-stat-label">Genomsnittlig användning:</span>
          <span class="moc-stat-value">${this.data.agentStats.avgUsage}</span>
        </div>
      `;
    },
    updateTrendChart(period) {
      const chartEl = document.getElementById('moc-trend-chart');
      if (!chartEl) return;

      chartEl.innerHTML = '';
      const trends = this.data.agentTrends[period] || {};

      Object.entries(trends).forEach(([agent, value]) => {
        const bar = document.createElement('div');
        bar.className = 'moc-trend-bar';
        bar.style.width = `${(value / Math.max(...Object.values(trends))) * 100}%`;
        bar.innerHTML = `
          <span class="moc-trend-agent">${agent}</span>
          <span class="moc-trend-value">${value}</span>
        `;
        chartEl.appendChild(bar);
      });
    },
    startDataRefresh() {
      setInterval(() => {
        this.fetchAgentData();
      }, 30000); // Refresh data every 30 seconds
    }
  };

  // Initialize agent market
  agentMarket.init();

  // Register agent market as a feature
  window.MyOffiCityAddons.register('AI-agentmarknad');
})();

(() => {
  const themeManager = {
    themes: {
      light: {
        '--bg-color': '#ffffff',
        '--text-color': '#333333',
        '--card-bg': '#f9f9f9',
        '--card-border': '#e0e0e0',
        '--header-color': '#444444',
        '--button-bg': '#e0e0e0',
        '--button-hover': '#d0d0d0',
        '--button-text': '#333333',
        '--button-active': '#c0c0c0',
        '--font-family': 'Arial, sans-serif',
        '--font-size': '14px',
        '--line-height': '1.5',
        '--border-radius': '4px',
        '--box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      dark: {
        '--bg-color': '#121212',
        '--text-color': '#e0e0e0',
        '--card-bg': '#1e1e1e',
        '--card-border': '#333333',
        '--header-color': '#b0b0b0',
        '--button-bg': '#333333',
        '--button-hover': '#444444',
        '--button-text': '#e0e0e0',
        '--button-active': '#222222',
        '--font-family': 'Georgia, serif',
        '--font-size': '14px',
        '--line-height': '1.6',
        '--border-radius': '4px',
        '--box-shadow': '0 2px 4px rgba(0, 0, 0, 0.3)'
      }
    },
    currentTheme: 'light',
    init() {
      this.loadTheme();
      this.setupThemeControls();
    },
    loadTheme() {
      const savedTheme = localStorage.getItem('moc.theme') || 'light';
      this.applyTheme(savedTheme);
    },
    applyTheme(themeName) {
      if (!this.themes[themeName]) return;

      this.currentTheme = themeName;
      const theme = this.themes[themeName];

      Object.entries(theme).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });

      localStorage.setItem('moc.theme', themeName);
    },
    setupThemeControls() {
      const themeWrap = document.createElement('div');
      themeWrap.className = 'moc-chip-row';

      Object.keys(this.themes).forEach(themeName => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'moc-chip-btn' + (this.currentTheme === themeName ? ' on' : '');
        b.textContent = themeName.charAt(0).toUpperCase() + themeName.slice(1);
        b.addEventListener('click', () => {
          this.applyTheme(themeName);
          themeWrap.querySelectorAll('button').forEach(btn => btn.classList.remove('on'));
          b.classList.add('on');
        });
        themeWrap.appendChild(b);
      });

      window.MyOffiCityAddons.addTool('Teman', '🎨', themeWrap);
    }
  };

  // Initialize theme manager
  themeManager.init();

  // Register theme manager as a feature
  window.MyOffiCityAddons.register('Teman');
})();

(() => {
  const officeManager = {
    init() {
      this.setupOfficeDashboard();
      this.setupBookingSystem();
      this.setupMessageCenter();
    },
    setupOfficeDashboard() {
      const dashboard = document.createElement('div');
      dashboard.id = 'moc-office-dashboard';
      dashboard.className = 'moc-tool-card';
      dashboard.innerHTML = `
        <div class="moc-tool-title">🏢 Kontorshantering</div>
        <div class="moc-office-content">
          <div class="moc-office-section">
            <h3>Kontorsinställningar</h3>
            <div class="moc-settings-form">
              <div class="moc-form-group">
                <label for="office-name">Kontorsnamn</label>
                <input type="text" id="office-name" placeholder="Ditt kontorsnamn">
              </div>
              <div class="moc-form-group">
                <label for="office-type">Kontorstyp</label>
                <select id="office-type">
                  <option value="startup">Startup Loft</option>
                  <option value="modern">Modern Tech Hub</option>
                  <option value="executive">Executive HQ</option>
                </select>
              </div>
              <div class="moc-form-group">
                <label for="logo-type">Logotypform</label>
                <select id="logo-type">
                  <option value="round">Rund</option>
                  <option value="triangle">Triangel</option>
                  <option value="square">Fyrkantig</option>
                </select>
              </div>
              <button id="save-settings" class="moc-chip-btn">Spara inställningar</button>
            </div>
          </div>
          <div class="moc-office-section">
            <h3>Bokningar</h3>
            <div id="moc-bookings-list"></div>
          </div>
          <div class="moc-office-section">
            <h3>Meddelanden</h3>
            <div id="moc-messages-list"></div>
          </div>
        </div>
      `;

      // Add event listeners for settings form
      dashboard.querySelector('#save-settings').addEventListener('click', () => {
        const name = dashboard.querySelector('#office-name').value;
        const type = dashboard.querySelector('#office-type').value;
        const logo = dashboard.querySelector('#logo-type').value;
        this.saveOfficeSettings(name, type, logo);
      });

      window.MyOffiCityAddons.addTool('Kontorshantering', '🏢', dashboard);
      this.loadOfficeSettings(dashboard);
      this.loadBookings(dashboard);
      this.loadMessages(dashboard);
    },
    saveOfficeSettings(name, type, logo) {
      // In a real implementation, this would save to a database
      console.log('Saving office settings:', { name, type, logo });
      alert(`Kontorsinställningar sparade!\nNamn: ${name}\nTyp: ${type}\nLogotyp: ${logo}`);
    },
    loadOfficeSettings(dashboard) {
      // In a real implementation, this would load from a database
      dashboard.querySelector('#office-name').value = 'Mitt kontor';
      dashboard.querySelector('#office-type').value = 'modern';
      dashboard.querySelector('#logo-type').value = 'round';
    },
    setupBookingSystem() {
      // This would be connected to a real booking system in a production environment
      setInterval(() => {
        const dashboard = document.getElementById('moc-office-dashboard');
        if (dashboard) {
          this.loadBookings(dashboard);
        }
      }, 30000); // Update bookings every 30 seconds
    },
    loadBookings(dashboard) {
      const bookingsList = dashboard.querySelector('#moc-bookings-list');
      if (!bookingsList) return;

      // In a real implementation, this would fetch from a database
      const mockBookings = [
        { id: 1, title: 'Möte med Kund A', date: '2023-11-15', time: '10:00-11:00' },
        { id: 2, title: 'Teammöte', date: '2023-11-16', time: '14:00-15:00' },
        { id: 3, title: 'Kundpresentation', date: '2023-11-17', time: '09:00-10:30' }
      ];

      bookingsList.innerHTML = '';
      mockBookings.forEach(booking => {
        const bookingEl = document.createElement('div');
        bookingEl.className = 'moc-booking-item';
        bookingEl.innerHTML = `
          <h4>${booking.title}</h4>
          <p>Datum: ${booking.date}</p>
          <p>Tid: ${booking.time}</p>
        `;
        bookingsList.appendChild(bookingEl);
      });
    },
    setupMessageCenter() {
      // This would be connected to a real messaging system in a production environment
      setInterval(() => {
        const dashboard = document.getElementById('moc-office-dashboard');
        if (dashboard) {
          this.loadMessages(dashboard);
        }
      }, 60000); // Update messages every 60 seconds
    },
    loadMessages(dashboard) {
      const messagesList = dashboard.querySelector('#moc-messages-list');
      if (!messagesList) return;

      // In a real implementation, this would fetch from a database
      const mockMessages = [
        { id: 1, sender: 'Kund A', subject: 'Förfrågan om offert', date: '2023-11-14', read: true },
        { id: 2, sender: 'Team', subject: 'Mötesminuter', date: '2023-11-13', read: false },
        { id: 3, sender: 'System', subject: 'Kontosaldot uppdaterat', date: '2023-11-12', read: true }
      ];

      messagesList.innerHTML = '';
      mockMessages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `moc-message-item ${message.read ? '' : 'unread'}`;
        messageEl.innerHTML = `
          <h4>${message.subject}</h4>
          <p>Från: ${message.sender}</p>
          <p>Datum: ${message.date}</p>
        `;
        messagesList.appendChild(messageEl);
      });
    }
  };

  // Initialize office manager
  officeManager.init();

  // Register office manager as a feature
  window.MyOffiCityAddons.register('Kontorshantering');
})();

(() => {
  // Interaktiv 3D-karta för navigering
  const createCityMap = () => {
    const mapContainer = document.createElement('div');
    mapContainer.id = 'moc-city-map';
    mapContainer.innerHTML = `
      <div class="moc-map-content">
        <div class="moc-map-controls">
          <button id="zoom-in" class="moc-chip-btn">+</button>
          <button id="zoom-out" class="moc-chip-btn">-</button>
          <button id="reset-view" class="moc-chip-btn">Återställ</button>
        </div>
      </div>
    `;

    // Skapa markörer för olika platser
    const locations = [
      { name: 'Huvudkontoret', x: 30, y: 50 },
      { name: 'Kaféet', x: 50, y: 30 },
      { name: 'Parkeringen', x: 70, y: 70 },
      { name: 'Biblioteket', x: 20, y: 20 }
    ];

    locations.forEach(location => {
      const marker = document.createElement('div');
      marker.className = 'moc-map-marker';
      marker.style.left = `${location.x}%`;
      marker.style.top = `${location.y}%`;
      marker.title = location.name;
      marker.addEventListener('click', () => {
        alert(`Navigerar till ${location.name}`);
        // Här skulle du implementera den faktiska navigeringen
      });
      mapContainer.querySelector('.moc-map-content').appendChild(marker);
    });

    // Hantera zoom och återställning
    const zoomInBtn = mapContainer.querySelector('#zoom-in');
    const zoomOutBtn = mapContainer.querySelector('#zoom-out');
    const resetBtn = mapContainer.querySelector('#reset-view');

    let zoomLevel = 1;

    zoomInBtn.addEventListener('click', () => {
      zoomLevel = Math.min(zoomLevel + 0.2, 2);
      mapContainer.style.transform = `scale(${zoomLevel})`;
    });

    zoomOutBtn.addEventListener('click', () => {
      zoomLevel = Math.max(zoomLevel - 0.2, 0.5);
      mapContainer.style.transform = `scale(${zoomLevel})`;
    });

    resetBtn.addEventListener('click', () => {
      zoomLevel = 1;
      mapContainer.style.transform = 'scale(1)';
    });

    return mapContainer;
  };

  // Lägg till kartan som ett verktyg
  const cityMap = createCityMap();
  window.MyOffiCityAddons.addTool('3D-karta', '🗺️', cityMap);
  window.MyOffiCityAddons.register('Interaktiv 3D-karta');
})();

(() => {
  // 3D Keyboard Navigation for City View
  const setup3DKeyboardControls = () => {
    if (!window.threeScene || !window.threeCamera) return;

    const moveSpeed = 0.5;
    const rotationSpeed = 0.02;

    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      q: false,
      e: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    };

    const handleKeyDown = (event) => {
      if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
      }
    };

    const handleKeyUp = (event) => {
      if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
      }
    };

    const updateCameraPosition = () => {
      if (keys.w || keys.ArrowUp) {
        window.threeCamera.position.z -= moveSpeed;
      }
      if (keys.s || keys.ArrowDown) {
        window.threeCamera.position.z += moveSpeed;
      }
      if (keys.a || keys.ArrowLeft) {
        window.threeCamera.position.x -= moveSpeed;
      }
      if (keys.d || keys.ArrowRight) {
        window.threeCamera.position.x += moveSpeed;
      }
      if (keys.q) {
        window.threeCamera.rotation.y += rotationSpeed;
      }
      if (keys.e) {
        window.threeCamera.rotation.y -= rotationSpeed;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Create a tool card for the keyboard controls
    const toolCard = document.createElement('div');
    toolCard.className = 'moc-tool-card';

    const toolTitle = document.createElement('h3');
    toolTitle.className = 'moc-tool-title';
    toolTitle.innerHTML = '⌨️ 3D Tangentbordsgenvägar';

    const controlsInfo = document.createElement('div');
    controlsInfo.innerHTML = `
      <p><strong>Flytta:</strong> W/A/S/D eller Piltangenter</p>
      <p><strong>Rotera:</strong> Q (vänster) / E (höger)</p>
    `;

    toolCard.appendChild(toolTitle);
    toolCard.appendChild(controlsInfo);

    // Add the tool card to the dock
    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('3D Tangentbordsgenvägar', '⌨️', toolCard);
      window.MyOffiCityAddons.register('3D Keyboard Controls');
    }

    // Animation loop for camera movement
    const animate = () => {
      requestAnimationFrame(animate);
      updateCameraPosition();
    };

    animate();
  };

  // Initialize when the city view is ready
  const init3DControls = () => {
    const checkCityView = setInterval(() => {
      if (window.threeScene && window.threeCamera) {
        clearInterval(checkCityView);
        setup3DKeyboardControls();
      }
    }, 500);
  };

  // Wait for the page to load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init3DControls();
  } else {
    document.addEventListener('DOMContentLoaded', init3DControls);
  }
})();

(() => {
  // AI Agent Market Widget
  const createAgentMarketWidget = () => {
    const widget = document.createElement('div');
    widget.id = 'moc-agent-market';
    widget.innerHTML = `
      <div class="moc-agent-market-content">
        <h2>AI Agent Market</h2>
        <div class="moc-agent-list">
          <!-- Agent items will be added here dynamically -->
        </div>
      </div>
    `;

    // Fetch and display popular agents
    const fetchPopularAgents = async () => {
      try {
        // In a real implementation, this would fetch from your API
        const mockAgents = [
          { id: 1, name: 'DesignGuru', category: 'Design', rating: 4.8, users: 1245, active: 98 },
          { id: 2, name: 'CodeMaster', category: 'Development', rating: 4.7, users: 1123, active: 87 },
          { id: 3, name: 'ContentPro', category: 'Content', rating: 4.6, users: 987, active: 76 },
          { id: 4, name: 'SEOExpert', category: 'Marketing', rating: 4.5, users: 876, active: 65 },
          { id: 5, name: 'TechSupport', category: 'Support', rating: 4.4, users: 765, active: 54 }
        ];

        const agentList = widget.querySelector('.moc-agent-list');
        agentList.innerHTML = '';

        mockAgents.forEach(agent => {
          const agentItem = document.createElement('div');
          agentItem.className = 'moc-agent-item';
          agentItem.innerHTML = `
            <div class="moc-agent-name">${agent.name}</div>
            <div class="moc-agent-metrics">
              <div class="moc-agent-stats">
                <div class="moc-stat-item">
                  <span class="moc-stat-label">Category:</span>
                  <span class="moc-stat-value">${agent.category}</span>
                </div>
                <div class="moc-stat-item">
                  <span class="moc-stat-label">Rating:</span>
                  <span class="moc-stat-value">${agent.rating} ★</span>
                </div>
              </div>
              <div class="moc-agent-stats">
                <div class="moc-stat-item">
                  <span class="moc-stat-label">Users:</span>
                  <span class="moc-stat-value">${agent.users}</span>
                </div>
                <div class="moc-stat-item">
                  <span class="moc-stat-label">Active:</span>
                  <span class="moc-stat-value">${agent.active}</span>
                </div>
              </div>
            </div>
            <div class="moc-chip-row">
              <button class="moc-chip-btn" data-action="chat">Chat</button>
              <button class="moc-chip-btn" data-action="hire">Hire</button>
              <button class="moc-chip-btn" data-action="review">Review</button>
            </div>
          `;

          // Add event listeners for quick actions
          const chatBtn = agentItem.querySelector('[data-action="chat"]');
          const hireBtn = agentItem.querySelector('[data-action="hire"]');
          const reviewBtn = agentItem.querySelector('[data-action="review"]');

          chatBtn.addEventListener('click', () => {
            console.log(`Starting chat with ${agent.name}`);
            // Implement chat functionality
          });

          hireBtn.addEventListener('click', () => {
            console.log(`Hiring ${agent.name}`);
            // Implement hiring functionality
          });

          reviewBtn.addEventListener('click', () => {
            console.log(`Reviewing ${agent.name}`);
            // Implement review functionality
          });

          agentList.appendChild(agentItem);
        });
      } catch (error) {
        console.error('Error fetching popular agents:', error);
      }
    };

    fetchPopularAgents();

    // Refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'moc-chip-btn';
    refreshBtn.textContent = 'Refresh Agents';
    refreshBtn.addEventListener('click', fetchPopularAgents);

    widget.querySelector('.moc-agent-market-content').appendChild(refreshBtn);

    return widget;
  };

  // Register the widget with MyOffiCityAddons
  if (window.MyOffiCityAddons) {
    const agentMarketWidget = createAgentMarketWidget();
    window.MyOffiCityAddons.addTool('AI Agent Market', '🤖', agentMarketWidget);
    window.MyOffiCityAddons.register('AI Agent Market Widget');
  }
})();

(() => {
  // Theme and readability toggles for dashboard
  const createThemeControls = () => {
    const themePanel = document.createElement('div');
    themePanel.className = 'moc-tool-card';
    themePanel.innerHTML = `
      <h3 class="moc-tool-title">Teman & Läsbarhet</h3>
      <div class="moc-chip-row">
        <button class="moc-chip-btn" data-theme="default">Standard</button>
        <button class="moc-chip-btn" data-theme="contrast">Kontrast</button>
        <button class="moc-chip-btn" data-theme="warm">Varm</button>
      </div>
      <div class="moc-chip-row">
        <button class="moc-chip-btn" data-font="default">Standard</button>
        <button class="moc-chip-btn" data-font="large">Stor</button>
        <button class="moc-chip-btn" data-font="dyslexic">Dyslexi</button>
      </div>
    `;

    // Apply theme
    themePanel.querySelectorAll('[data-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.documentElement.className = '';
        if (btn.dataset.theme !== 'default') {
          document.documentElement.classList.add(`moc-theme-${btn.dataset.theme}`);
        }
        themePanel.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
      });
    });

    // Apply font size
    themePanel.querySelectorAll('[data-font]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.body.className = '';
        if (btn.dataset.font !== 'default') {
          document.body.classList.add(`moc-font-${btn.dataset.font}`);
        }
        themePanel.querySelectorAll('[data-font]').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
      });
    });

    return themePanel;
  };

  // Add theme controls to dashboard
  const addThemeControlsToDashboard = () => {
    const dashboard = document.querySelector('#moc-analytics-dashboard, #moc-accessibility-dashboard, #moc-office-dashboard');
    if (dashboard) {
      const themeControls = createThemeControls();
      dashboard.prepend(themeControls);
    }
  };

  // Initialize theme controls when dashboard is ready
  const initThemeControls = () => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      addThemeControlsToDashboard();
    } else {
      document.addEventListener('DOMContentLoaded', addThemeControlsToDashboard);
    }
  };

  // Register the feature
  window.MyOffiCityAddons.register('Theme Controls');
  initThemeControls();
})();

(() => {
  // Kontorshanteringswidget
  const officeManagementWidget = () => {
    const widget = document.createElement('div');
    widget.id = 'moc-office-dashboard';
    widget.innerHTML = `
      <div class="moc-office-content">
        <div class="moc-office-section">
          <h3>Kontorsinställningar</h3>
          <form class="moc-settings-form">
            <div class="moc-form-group">
              <label for="office-name">Kontorsnamn</label>
              <input type="text" id="office-name" name="office-name" placeholder="Ditt kontorsnamn">
            </div>
            <div class="moc-form-group">
              <label for="office-address">Adress</label>
              <input type="text" id="office-address" name="office-address" placeholder="Kontorsadress">
            </div>
            <div class="moc-form-group">
              <label for="office-capacity">Kapacitet</label>
              <input type="number" id="office-capacity" name="office-capacity" placeholder="Antal platser">
            </div>
            <div class="moc-form-group">
              <label for="office-type">Kontorstyp</label>
              <select id="office-type" name="office-type">
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="virtual">Virtuellt</option>
              </select>
            </div>
            <button type="button" id="save-settings" class="moc-chip-btn">Spara inställningar</button>
          </form>
        </div>
        <div class="moc-office-section">
          <h3>Bokningar</h3>
          <div id="bookings-list">
            <!-- Bokningar kommer att visas här -->
          </div>
        </div>
        <div class="moc-office-section">
          <h3>Möten</h3>
          <div id="meetings-list">
            <!-- Möten kommer att visas här -->
          </div>
        </div>
      </div>
    `;

    // Lägg till händelselyssnare för knappen
    widget.querySelector('#save-settings').addEventListener('click', () => {
      alert('Inställningar sparade!');
    });

    return widget;
  };

  // Lägg till widgeten i verktygsdockan
  window.MyOffiCityAddons.addTool('Kontorshantering', '🏢', officeManagementWidget());
  window.MyOffiCityAddons.register('Office Management Widget');
})();

(() => {
  // AI Agent Market Widget
  const createAgentMarketWidget = () => {
    const widget = document.createElement('div');
    widget.id = 'moc-agent-market';
    widget.innerHTML = `
      <div class="moc-agent-market-content">
        <h2>AI Agent Market</h2>
        <div class="moc-agent-filters">
          <div class="moc-filter-group">
            <label for="category-filter">Category:</label>
            <select id="category-filter">
              <option value="all">All Categories</option>
              <option value="customer-support">Customer Support</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
            </select>
          </div>
          <div class="moc-filter-group">
            <label for="popularity-filter">Popularity:</label>
            <select id="popularity-filter">
              <option value="all">All Popularity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="moc-filter-group">
            <label for="price-filter">Price:</label>
            <select id="price-filter">
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
        <div class="moc-agent-list"></div>
      </div>
    `;

    // Sample agent data
    const agents = [
      { id: 1, name: 'SupportBot', category: 'customer-support', popularity: 'high', price: 'free', rating: 4.8, users: 1250, responses: 8500 },
      { id: 2, name: 'SalesPro', category: 'sales', popularity: 'medium', price: 'paid', rating: 4.5, users: 890, responses: 6200 },
      { id: 3, name: 'MarketingGenius', category: 'marketing', popularity: 'high', price: 'paid', rating: 4.7, users: 1100, responses: 7800 },
      { id: 4, name: 'CodeMaster', category: 'development', popularity: 'high', price: 'paid', rating: 4.9, users: 1500, responses: 9200 },
      { id: 5, name: 'DesignArtist', category: 'design', popularity: 'medium', price: 'free', rating: 4.3, users: 750, responses: 5100 },
      { id: 6, name: 'TechHelper', category: 'customer-support', popularity: 'low', price: 'free', rating: 4.1, users: 500, responses: 3200 }
    ];

    // Filter and display agents
    const filterAndDisplayAgents = () => {
      const categoryFilter = document.getElementById('category-filter').value;
      const popularityFilter = document.getElementById('popularity-filter').value;
      const priceFilter = document.getElementById('price-filter').value;

      const filteredAgents = agents.filter(agent => {
        return (categoryFilter === 'all' || agent.category === categoryFilter) &&
               (popularityFilter === 'all' || agent.popularity === popularityFilter) &&
               (priceFilter === 'all' || (priceFilter === 'free' && agent.price === 'free') || (priceFilter === 'paid' && agent.price === 'paid'));
      });

      const agentList = widget.querySelector('.moc-agent-list');
      agentList.innerHTML = '';

      filteredAgents.forEach(agent => {
        const agentItem = document.createElement('div');
        agentItem.className = 'moc-agent-item';
        agentItem.innerHTML = `
          <div class="moc-agent-name">${agent.name}</div>
          <div class="moc-agent-metrics">
            <div class="moc-agent-stats">
              <div class="moc-stat-item">
                <span class="moc-stat-label">Rating:</span>
                <span class="moc-stat-value">${agent.rating}</span>
              </div>
              <div class="moc-stat-item">
                <span class="moc-stat-label">Users:</span>
                <span class="moc-stat-value">${agent.users}</span>
              </div>
              <div class="moc-stat-item">
                <span class="moc-stat-label">Responses:</span>
                <span class="moc-stat-value">${agent.responses}</span>
              </div>
            </div>
          </div>
        `;
        agentList.appendChild(agentItem);
      });
    };

    // Set up event listeners for filters
    widget.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', filterAndDisplayAgents);
    });

    // Initial display
    filterAndDisplayAgents();

    return widget;
  };

  // Add the widget to the MyOffiCity addons system
  const agentMarketWidget = createAgentMarketWidget();
  window.MyOffiCityAddons.addTool('AI Agent Market', '🤖', agentMarketWidget);
  window.MyOffiCityAddons.register('AI Agent Market Widget');
})();

(() => {
  // Function to toggle theme
  function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
    const newTheme = currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    document.body.classList.remove(currentTheme);
    document.body.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // Create theme toggle button
  const themeToggleButton = document.createElement('button');
  themeToggleButton.className = 'moc-theme-toggle';
  themeToggleButton.textContent = 'Toggle Theme';
  themeToggleButton.addEventListener('click', toggleTheme);

  // Append theme toggle button to the document
  document.body.appendChild(themeToggleButton);

  // Load saved theme from local storage
  const savedTheme = localStorage.getItem('theme') || 'dark-theme';
  document.body.classList.add(savedTheme);

  // Function to adjust font size
  function adjustFontSize(size) {
    document.documentElement.style.setProperty('--theme-font-size', `${size}px`);
    localStorage.setItem('fontSize', size);
  }

  // Create font size control
  const fontSizeControl = document.createElement('div');
  fontSizeControl.className = 'moc-font-size-control';
  fontSizeControl.innerHTML = `
    <label for="fontSize">Font Size:</label>
    <input type="range" id="fontSize" name="fontSize" min="12" max="20" value="${localStorage.getItem('fontSize') || 14}">
  `;
  fontSizeControl.querySelector('#fontSize').addEventListener('input', (event) => {
    adjustFontSize(event.target.value);
  });

  // Append font size control to the document
  document.body.appendChild(fontSizeControl);

  // Load saved font size from local storage
  const savedFontSize = localStorage.getItem('fontSize') || 14;
  adjustFontSize(savedFontSize);

  // Register the feature
  window.MyOffiCityAddons.register('Tema och Läsbarhet');
})();

(() => {
  const createOfficeManagementWidget = () => {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'moc-office-management-widget';

    const content = `
      <div class="moc-office-management-content">
        <div class="moc-office-management-section">
          <h3>Kontorshantering</h3>
          <form id="moc-booking-form" class="moc-booking-form">
            <div class="moc-form-group">
              <label for="resource-type">Resurstyp:</label>
              <select id="resource-type">
                <option value="mötesrum">Mötesrum</option>
                <option value="möbler">Möbler</option>
                <option value="utrustning">Utrustning</option>
              </select>
            </div>
            <div class="moc-form-group">
              <label for="start-time">Starttid:</label>
              <input type="datetime-local" id="start-time" required>
            </div>
            <div class="moc-form-group">
              <label for="end-time">Sluttid:</label>
              <input type="datetime-local" id="end-time" required>
            </div>
            <button type="submit" id="book-resource">Boka Resurs</button>
          </form>
        </div>
        <div class="moc-office-management-section">
          <h3>Bokningar</h3>
          <div id="moc-bookings-list"></div>
        </div>
      </div>
    `;

    widgetContainer.innerHTML = content;

    const form = widgetContainer.querySelector('#moc-booking-form');
    const bookingsList = widgetContainer.querySelector('#moc-bookings-list');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const resourceType = form.querySelector('#resource-type').value;
      const startTime = form.querySelector('#start-time').value;
      const endTime = form.querySelector('#end-time').value;

      // Simulate booking
      const bookingItem = document.createElement('div');
      bookingItem.className = 'moc-resource-item';
      bookingItem.innerHTML = `
        <h4>${resourceType}</h4>
        <p>Starttid: ${startTime}</p>
        <p>Sluttid: ${endTime}</p>
      `;
      bookingsList.appendChild(bookingItem);

      form.reset();
    });

    return widgetContainer;
  };

  const officeManagementWidget = createOfficeManagementWidget();
  window.MyOffiCityAddons.addTool('Kontorshantering', '🏢', officeManagementWidget);
  window.MyOffiCityAddons.register('Kontorshantering');
})();

(() => {
  const scene = window.MyOffiCity.scene;
  const camera = window.MyOffiCity.camera;
  const renderer = window.MyOffiCity.renderer;
  const controls = window.MyOffiCity.controls;

  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let moveUp = false;
  let moveDown = false;
  let isZoomingIn = false;
  let isZoomingOut = false;

  const onKeyDown = function(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        moveUp = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        moveDown = true;
        break;
      case 'Equal':
        isZoomingIn = true;
        break;
      case 'Minus':
        isZoomingOut = true;
        break;
    }
  };

  const onKeyUp = function(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
      case 'Space':
        moveUp = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        moveDown = false;
        break;
      case 'Equal':
        isZoomingIn = false;
        break;
      case 'Minus':
        isZoomingOut = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const animate = function() {
    requestAnimationFrame(animate);

    if (controls.isLocked === true) {
      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      direction.y = Number(moveUp) - Number(moveDown);
      direction.normalize();

      if (moveForward || moveBackward) velocity.z -= direction.z * 4.0 * 0.1;
      if (moveLeft || moveRight) velocity.x -= direction.x * 4.0 * 0.1;
      if (moveUp || moveDown) velocity.y -= direction.y * 4.0 * 0.1;

      velocity.x *= 0.98;
      velocity.y *= 0.98;
      velocity.z *= 0.98;

      controls.moveRight(-velocity.x);
      controls.moveForward(-velocity.z);
      controls.getObject().position.y += velocity.y;

      if (isZoomingIn) {
        controls.zoomIn(0.1);
      }
      if (isZoomingOut) {
        controls.zoomOut(0.1);
      }
    }

    renderer.render(scene, camera);
  };

  animate();

  const keyBindingsDiv = document.createElement('div');
  keyBindingsDiv.innerHTML = `
    <div class="moc-key-bindings">
      <h4>Tangentbordsgenvägar</h4>
      <ul>
        <li><strong>W / Piltangent upp:</strong> Flytta framåt</li>
        <li><strong>S / Piltangent ned:</strong> Flytta bakåt</li>
        <li><strong>A / Piltangent vänster:</strong> Flytta vänster</li>
        <li><strong>D / Piltangent höger:</strong> Flytta höger</li>
        <li><strong>Mellanslag:</strong> Flytta upp</li>
        <li><strong>Shift:</strong> Flytta ner</li>
        <li><strong>=:</strong> Zooma in</li>
        <li><strong>-:</strong> Zooma ut</li>
      </ul>
    </div>
  `;
  keyBindingsDiv.style.position = 'fixed';
  keyBindingsDiv.style.top = '10px';
  keyBindingsDiv.style.left = '10px';
  keyBindingsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  keyBindingsDiv.style.color = '#ffffff';
  keyBindingsDiv.style.padding = '10px';
  keyBindingsDiv.style.borderRadius = '5px';
  keyBindingsDiv.style.fontSize = '14px';
  keyBindingsDiv.style.zIndex = '1000';

  document.body.appendChild(keyBindingsDiv);

  window.MyOffiCityAddons.addTool('Tangentbordsgenvägar', '⌨️', keyBindingsDiv);
  window.MyOffiCityAddons.register('Tangentbordsgenvägar');
})();

(() => {
  // Skapa en interaktiv 3D-karta
  const mapContainer = document.createElement('div');
  mapContainer.style.position = 'fixed';
  mapContainer.style.top = '10px';
  mapContainer.style.right = '10px';
  mapContainer.style.width = '200px';
  mapContainer.style.height = '200px';
  mapContainer.style.border = '1px solid #ccc';
  mapContainer.style.borderRadius = '10px';
  mapContainer.style.padding = '10px';
  mapContainer.style.background = 'rgba(255, 255, 255, 0.5)';
  mapContainer.style.zIndex = '1000';

  const map = document.createElement('canvas');
  map.width = 200;
  map.height = 200;
  map.style.border = '1px solid #ccc';
  mapContainer.appendChild(map);

  const ctx = map.getContext('2d');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 0, map.width, map.height);

  // Lägg till platser på kartan
  const places = [
    { x: 50, y: 50, name: 'Receptionen' },
    { x: 100, y: 100, name: 'Mötesrummet' },
    { x: 150, y: 150, name: 'Kafeterian' },
  ];

  places.forEach((place) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(place.name, place.x, place.y);
  });

  // Lägg till klickhändelse för navigering
  map.addEventListener('click', (e) => {
    const x = e.clientX - map.offsetLeft;
    const y = e.clientY - map.offsetTop;
    const place = places.find((p) => Math.hypot(p.x - x, p.y - y) < 20);
    if (place) {
      // Navigera till platsen
      console.log(`Navigerar till ${place.name}`);
      // Anropa funktion för att navigera till platsen
    }
  });

  // Lägg till kartan till sidan
  document.body.appendChild(mapContainer);

  // Registrera kartan som ett verktyg
  window.MyOffiCityAddons.addTool('3D-karta', '', mapContainer);
  window.MyOffiCityAddons.register('3D-karta');
})();

(() => {
  // Skapa sökfältet och lägg till det i sidan
  const searchContainer = document.createElement('div');
  searchContainer.className = 'moc-search-container';
  searchContainer.innerHTML = `
    <input type="text" id="moc-search-input" placeholder="Sök...">
    <select id="moc-sort-select">
      <option value="name">Namn</option>
      <option value="type">Typ</option>
    </select>
    <button id="moc-search-button">Sök</button>
  `;
  document.body.appendChild(searchContainer);

  // Funktion för att filtrera och sortera resurser
  function filterAndSortResources(query, sortBy) {
    const resources = document.querySelectorAll('.moc-resource-item');
    resources.forEach(resource => {
      const name = resource.querySelector('h4').textContent.toLowerCase();
      const type = resource.querySelector('.moc-resource-type').textContent.toLowerCase();
      if (name.includes(query) || type.includes(query)) {
        resource.style.display = '';
      } else {
        resource.style.display = 'none';
      }
    });

    // Sortera resurser baserat på vald kategori
    const sortedResources = Array.from(resources).filter(resource => resource.style.display !== 'none');
    sortedResources.sort((a, b) => {
      const aValue = a.querySelector(`.${sortBy}`).textContent.toLowerCase();
      const bValue = b.querySelector(`.${sortBy}`).textContent.toLowerCase();
      return aValue.localeCompare(bValue);
    });

    const parent = resources[0].parentNode;
    sortedResources.forEach(resource => parent.appendChild(resource));
  }

  // Eventlyssnare för sökknappen
  document.getElementById('moc-search-button').addEventListener('click', () => {
    const query = document.getElementById('moc-search-input').value.toLowerCase();
    const sortBy = document.getElementById('moc-sort-select').value;
    filterAndSortResources(query, sortBy);
  });

  // Eventlyssnare för tangentbordsgenvägar (Ctrl + F för att fokusera på sökfältet)
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'f') {
      event.preventDefault();
      document.getElementById('moc-search-input').focus();
    }
  });

  // Registrera verktyget i MyOffiCityAddons
  window.MyOffiCityAddons.addTool('Sök', '🔍', searchContainer);
  window.MyOffiCityAddons.register('Förbättrad Sökfunktion');
})();

(() => {
  const profileContainer = document.createElement('div');
  profileContainer.id = 'moc-profile-settings';
  profileContainer.style.position = 'fixed';
  profileContainer.style.top = '10px';
  profileContainer.style.right = '10px';
  profileContainer.style.zIndex = '1000';
  profileContainer.style.backgroundColor = 'rgba(12, 18, 34, 0.92)';
  profileContainer.style.color = '#f3ecdc';
  profileContainer.style.padding = '10px';
  profileContainer.style.borderRadius = '5px';
  profileContainer.style.boxShadow = '0 10px 28px rgba(0, 0, 0, 0.42)';
  profileContainer.style.backdropFilter = 'blur(10px)';
  profileContainer.style.display = 'none';
  profileContainer.innerHTML = `
    <h3>Profilinställningar</h3>
    <label for="profile-picture">Profilbild:</label>
    <input type="file" id="profile-picture" accept="image/*">
    <br><br>
    <label for="background-image">Bakgrundsbild:</label>
    <input type="file" id="background-image" accept="image/*">
    <br><br>
    <label for="profile-color">Färg:</label>
    <input type="color" id="profile-color">
    <br><br>
    <label for="profile-icon">Ikon:</label>
    <select id="profile-icon">
      <option value="👨‍💻">👨‍💻</option>
      <option value="👩‍💼">👩‍💼</option>
      <option value="👨‍💼">👨‍💼</option>
      <option value="👩‍🔬">👩‍🔬</option>
      <option value="👨‍🔬">👨‍🔬</option>
    </select>
    <br><br>
    <button id="save-profile">Spara</button>
  `;

  document.body.appendChild(profileContainer);

  const toggleProfileSettings = () => {
    profileContainer.style.display = profileContainer.style.display === 'none' ? 'block' : 'none';
  };

  const saveProfile = () => {
    const profilePicture = document.getElementById('profile-picture').files[0];
    const backgroundImage = document.getElementById('background-image').files[0];
    const profileColor = document.getElementById('profile-color').value;
    const profileIcon = document.getElementById('profile-icon').value;

    if (profilePicture) {
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem('profilePicture', e.target.result);
        document.getElementById('profile-icon-display').innerText = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.borderRadius = '50%';
        document.getElementById('profile-icon-display').appendChild(img);
      };
      reader.readAsDataURL(profilePicture);
    }

    if (backgroundImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem('backgroundImage', e.target.result);
        document.body.style.backgroundImage = `url(${e.target.result})`;
      };
      reader.readAsDataURL(backgroundImage);
    }

    localStorage.setItem('profileColor', profileColor);
    localStorage.setItem('profileIcon', profileIcon);

    document.getElementById('profile-icon-display').innerText = profileIcon;
    document.getElementById('profile-icon-display').style.color = profileColor;
  };

  document.getElementById('save-profile').addEventListener('click', saveProfile);

  window.MyOffiCityAddons.addTool('Profil', '👤', profileContainer);
  window.MyOffiCityAddons.register('Anpassningsbara Profiler');

  // Load saved settings
  const savedProfilePicture = localStorage.getItem('profilePicture');
  const savedBackgroundImage = localStorage.getItem('backgroundImage');
  const savedProfileColor = localStorage.getItem('profileColor');
  const savedProfileIcon = localStorage.getItem('profileIcon');

  if (savedProfilePicture) {
    document.getElementById('profile-icon-display').innerText = '';
    const img = document.createElement('img');
    img.src = savedProfilePicture;
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.borderRadius = '50%';
    document.getElementById('profile-icon-display').appendChild(img);
  }

  if (savedBackgroundImage) {
    document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
  }

  if (savedProfileColor) {
    document.getElementById('profile-icon-display').style.color = savedProfileColor;
  }

  if (savedProfileIcon) {
    document.getElementById('profile-icon-display').innerText = savedProfileIcon;
  }
})();

(() => {
  const notifications = [];

  function addNotification(message) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'moc-notification';
    notificationDiv.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    notifications.push(notificationDiv);
    document.querySelector('.moc-notifications').appendChild(notificationDiv);

    // Remove notification after 10 seconds
    setTimeout(() => {
      const index = notifications.indexOf(notificationDiv);
      if (index > -1) {
        notifications.splice(index, 1);
        notificationDiv.remove();
      }
    }, 10000);
  }

  // Example usage: addNotification('Ett nytt meddelande har anlänt!');
  window.addEventListener('keydown', (event) => {
    if (event.key === 'n' && event.ctrlKey) {
      addNotification('Ett nytt meddelande har anlänt via tangentbordsgenväg!');
    }
  });

  // Initialize notifications container
  const notificationsContainer = document.createElement('div');
  notificationsContainer.className = 'moc-notifications';
  document.body.appendChild(notificationsContainer);

  // Register the feature
  window.MyOffiCityAddons.register('Real-tidsmeddelanden');

  // Add tool to dock
  const notificationsButton = document.createElement('button');
  notificationsButton.className = 'moc-dock-btn';
  notificationsButton.innerHTML = '<span>🔔</span> Meddelanden';
  notificationsButton.onclick = () => {
    notificationsContainer.classList.toggle('visible');
  };
  window.MyOffiCityAddons.addTool('Meddelanden', '🔔', notificationsButton);
})();

(() => {
  const guideButton = document.createElement('button');
  guideButton.className = 'moc-dock-btn';
  guideButton.textContent = 'Kontorsguide';
  guideButton.addEventListener('click', toggleGuide);

  const guideOverlay = document.createElement('div');
  guideOverlay.id = 'moc-guide-overlay';
  guideOverlay.style.position = 'fixed';
  guideOverlay.style.top = '0';
  guideOverlay.style.left = '0';
  guideOverlay.style.width = '100%';
  guideOverlay.style.height = '100%';
  guideOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  guideOverlay.style.display = 'none';
  guideOverlay.style.justifyContent = 'center';
  guideOverlay.style.alignItems = 'center';
  guideOverlay.style.zIndex = '999';

  const guideContent = document.createElement('div');
  guideContent.style.backgroundColor = '#fff';
  guideContent.style.padding = '20px';
  guideContent.style.borderRadius = '8px';
  guideContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  guideContent.style.maxWidth = '80%';
  guideContent.style.maxHeight = '80%';
  guideContent.style.overflowY = 'auto';

  const guideText = `
    <h2>Kontorsguide</h2>
    <p>Här är några tips för att navigera i 3D-kontoret:</p>
    <ul>
      <li><strong>WASD</strong>: Flytta kameran.</li>
      <li><strong>Shift</strong>: Gå snabbare.</li>
      <li><strong>Space</strong>: Hoppa.</li>
      <li><strong>Mouse</strong>: Rotera kameran.</li>
      <li><strong>F</strong>: Fokusera på närmaste objekt.</li>
      <li><strong>G</strong>: Visa dolda element.</li>
      <li><strong>H</strong>: Dölj dolda element.</li>
    </ul>
    <p>Klicka utanför detta fönster för att stänga guiden.</p>
  `;
  guideContent.innerHTML = guideText;

  guideOverlay.appendChild(guideContent);
  document.body.appendChild(guideOverlay);

  guideOverlay.addEventListener('click', (event) => {
    if (event.target === guideOverlay) {
      toggleGuide();
    }
  });

  function toggleGuide() {
    guideOverlay.style.display = guideOverlay.style.display === 'flex' ? 'none' : 'flex';
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'G') {
      toggleGuide();
    }
  });

  window.MyOffiCityAddons.addTool('Kontorsguide', '📖', guideButton);
  window.MyOffiCityAddons.register('Interaktiv Kontorsguide');
})();
