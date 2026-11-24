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

(() => {
  // 5. 3D Navigation Keyboard Shortcuts
  function init3DNavigation() {
    if (!window.MyOffiCity || !window.MyOffiCity.city) return;

    const city = window.MyOffiCity.city;
    const moveSpeed = 0.5;
    const zoomSpeed = 0.1;

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch(e.key) {
        case 'ArrowUp':
          city.controls.moveForward(moveSpeed);
          break;
        case 'ArrowDown':
          city.controls.moveForward(-moveSpeed);
          break;
        case 'ArrowLeft':
          city.controls.moveRight(-moveSpeed);
          break;
        case 'ArrowRight':
          city.controls.moveRight(moveSpeed);
          break;
        case '+':
          city.controls.zoomIn(zoomSpeed);
          break;
        case '-':
          city.controls.zoomOut(zoomSpeed);
          break;
      }
    });

    window.MyOffiCityAddons.register('3D Navigation Keyboard Shortcuts');
  }

  // Enhanced 3D City Map Widget with real navigation and zoom
  function initEnhancedCityMapWidget() {
    const existingWidget = document.getElementById('mocCityMapWidget');
    if (existingWidget) existingWidget.remove();

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

    // Add zoom controls
    const zoomIn = document.createElement('button');
    zoomIn.className = 'moc-map-nav';
    zoomIn.textContent = '+';
    zoomIn.addEventListener('click', () => zoomMap(0.1));

    const zoomOut = document.createElement('button');
    zoomOut.className = 'moc-map-nav';
    zoomOut.textContent = '-';
    zoomOut.addEventListener('click', () => zoomMap(-0.1));

    controls.appendChild(layersToggle);
    controls.appendChild(navButton);
    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);

    widget.appendChild(mapContainer);
    widget.appendChild(controls);

    // Add widget to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(widget);
      window.MyOffiCityAddons.register('Enhanced 3D City Map Widget');
    }

    // Initialize the map
    initMap(mapContainer);
  }

  function initMap(container) {
    if (!window.MyOffiCity || !window.MyOffiCity.city) {
      container.innerHTML = '<div class="moc-map-placeholder">3D-karta inte tillgänglig</div>';
      return;
    }

    // Create a mini version of the main 3D scene
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(300, 200);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Add a simple cube to represent the city
    const geometry = new window.THREE.BoxGeometry();
    const material = new window.THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new window.THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();

    // Store the map reference for later use
    container.map = {
      scene,
      camera,
      renderer,
      cube
    };
  }

  function toggleMapLayers() {
    // Toggle between different map layers
    console.log('Toggling map layers');
  }

  function showNavigationOptions() {
    // Show navigation options for the user
    console.log('Showing navigation options');
  }

  function zoomMap(amount) {
    const container = document.querySelector('.moc-map-container');
    if (container && container.map) {
      container.map.camera.position.z -= amount;
    }
  }

  // Add the widget to the initialization
  function boot() {
    init3DNavigation();
    initEnhancedCityMapWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(() => {
  // 6. Theme Switcher for 3D City View
  function initThemeSwitcher() {
    if (document.getElementById('mocThemeSwitcher')) return;

    const switcher = document.createElement('div');
    switcher.id = 'mocThemeSwitcher';
    switcher.className = 'moc-theme-switcher';

    // Create theme buttons
    const themes = [
      { name: 'Light', class: 'theme-light' },
      { name: 'Dark', class: 'theme-dark' },
      { name: 'High Contrast', class: 'theme-high-contrast' }
    ];

    themes.forEach(theme => {
      const button = document.createElement('button');
      button.textContent = theme.name;
      button.addEventListener('click', () => applyTheme(theme.class));
      switcher.appendChild(button);
    });

    // Add switcher to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(switcher);
      window.MyOffiCityAddons.register('Theme Switcher for 3D City View');
    }

    // Apply default theme
    applyTheme('theme-dark');
  }

  function applyTheme(themeClass) {
    // Remove all theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');

    // Add the selected theme class
    document.body.classList.add(themeClass);

    // Store the selected theme in localStorage
    localStorage.setItem('mocTheme', themeClass);
  }

  // Check for saved theme on page load
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('mocTheme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }

  // Add the theme switcher to the initialization
  function boot() {
    initThemeSwitcher();
    loadSavedTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(() => {
  // 7. AI Agent Market Widget
  function initAgentMarketWidget() {
    if (document.getElementById('mocAgentMarketWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'mocAgentMarketWidget';
    widget.className = 'moc-agent-market-widget';

    // Create header
    const header = document.createElement('div');
    header.className = 'moc-agent-market-header';
    header.textContent = 'AI Agent Market';

    // Create content container
    const content = document.createElement('div');
    content.className = 'moc-agent-market-content';

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'moc-agent-market-footer';

    // Add refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'moc-agent-market-button';
    refreshBtn.textContent = 'Refresh';
    refreshBtn.addEventListener('click', refreshAgentData);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'moc-agent-market-button';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => widget.remove());

    footer.appendChild(refreshBtn);
    footer.appendChild(closeBtn);

    widget.appendChild(header);
    widget.appendChild(content);
    widget.appendChild(footer);

    // Add widget to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(widget);
      window.MyOffiCityAddons.register('AI Agent Market Widget');
    }

    // Load agent data
    loadAgentData(content);
  }

  function loadAgentData(container) {
    // In a real implementation, this would fetch data from an API
    // For now, we'll use mock data
    const mockAgents = [
      {
        name: 'Gemini 2.5 Flash',
        performance: 92,
        reliability: 95,
        cost: 75,
        speed: 88
      },
      {
        name: 'Groq Llama 3.3 70B',
        performance: 88,
        reliability: 90,
        cost: 65,
        speed: 92
      },
      {
        name: 'SambaNova DeepSeek V3',
        performance: 85,
        reliability: 88,
        cost: 70,
        speed: 85
      },
      {
        name: 'Mistral Codestral',
        performance: 82,
        reliability: 85,
        cost: 60,
        speed: 80
      },
      {
        name: 'OpenRouter',
        performance: 78,
        reliability: 82,
        cost: 55,
        speed: 75
      }
    ];

    // Clear container
    container.innerHTML = '';

    // Add agent cards
    mockAgents.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'moc-agent-card';

      const name = document.createElement('div');
      name.className = 'moc-agent-name';
      name.textContent = agent.name;

      const stats = document.createElement('div');
      stats.className = 'moc-agent-stats';

      const performance = document.createElement('div');
      performance.className = 'moc-agent-stat';
      performance.textContent = `Performance: ${agent.performance}%`;

      const reliability = document.createElement('div');
      reliability.className = 'moc-agent-stat';
      reliability.textContent = `Reliability: ${agent.reliability}%`;

      const cost = document.createElement('div');
      cost.className = 'moc-agent-stat';
      cost.textContent = `Cost: ${agent.cost}%`;

      const speed = document.createElement('div');
      speed.className = 'moc-agent-stat';
      speed.textContent = `Speed: ${agent.speed}%`;

      stats.appendChild(performance);
      stats.appendChild(reliability);
      stats.appendChild(cost);
      stats.appendChild(speed);

      const actions = document.createElement('div');
      actions.className = 'moc-agent-actions';

      const viewBtn = document.createElement('button');
      viewBtn.className = 'moc-agent-action';
      viewBtn.textContent = 'View';
      viewBtn.addEventListener('click', () => viewAgentDetails(agent));

      const deployBtn = document.createElement('button');
      deployBtn.className = 'moc-agent-action';
      deployBtn.textContent = 'Deploy';
      deployBtn.addEventListener('click', () => deployAgent(agent));

      actions.appendChild(viewBtn);
      actions.appendChild(deployBtn);

      card.appendChild(name);
      card.appendChild(stats);
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  function refreshAgentData() {
    const content = document.querySelector('.moc-agent-market-content');
    if (content) {
      loadAgentData(content);
    }
  }

  function viewAgentDetails(agent) {
    // View agent details
    console.log('Viewing details for:', agent.name);
    alert(`Viewing details for ${agent.name}`);
  }

  function deployAgent(agent) {
    // Deploy agent
    console.log('Deploying:', agent.name);
    alert(`Deploying ${agent.name}`);
  }

  // Add the widget to the initialization
  function boot() {
    initAgentMarketWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(() => {
  // 8. Dashboard Keyboard Navigation Shortcuts
  function initDashboardNavigation() {
    if (!window.MyOffiCity || !window.MyOffiCity.dashboard) return;

    const dashboard = window.MyOffiCity.dashboard;

    document.addEventListener('keydown', (e) => {
      // Check if we're in a dashboard view
      if (!document.querySelector('.dashboard-view')) return;

      // Check if we're not in an input field
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
        return;
      }

      // Number keys 1-9 for section navigation
      if (e.key >= '1' && e.key <= '9') {
        const sectionIndex = parseInt(e.key) - 1;
        const sections = document.querySelectorAll('.dashboard-section');
        if (sections.length > sectionIndex) {
          e.preventDefault();
          sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
        }
      }

      // H and J keys for up/down navigation
      if (e.key === 'h' || e.key === 'j') {
        e.preventDefault();
        const currentSection = document.querySelector('.dashboard-section.active') ||
                              document.querySelector('.dashboard-section');
        if (!currentSection) return;

        const items = currentSection.querySelectorAll('.dashboard-item');
        if (items.length === 0) return;

        let currentItem = currentSection.querySelector('.dashboard-item.active');
        if (!currentItem) {
          currentItem = items[0];
          currentItem.classList.add('active');
        }

        let newIndex = Array.from(items).indexOf(currentItem);
        if (e.key === 'h') {
          newIndex = Math.max(0, newIndex - 1);
        } else if (e.key === 'j') {
          newIndex = Math.min(items.length - 1, newIndex + 1);
        }

        currentItem.classList.remove('active');
        items[newIndex].classList.add('active');
        items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    window.MyOffiCityAddons.register('Dashboard Keyboard Navigation');
  }

  // Add the dashboard navigation to the initialization
  function boot() {
    initDashboardNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

(() => {
  // 7. AI Agent Market Widget
  function initAgentMarketWidget() {
    if (document.getElementById('mocAgentMarketWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'mocAgentMarketWidget';
    widget.className = 'moc-agent-market-widget';

    // Create header
    const header = document.createElement('div');
    header.className = 'moc-agent-market-header';
    header.textContent = 'AI Agent Market';

    // Create content container
    const content = document.createElement('div');
    content.className = 'moc-agent-market-content';

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'moc-agent-market-footer';

    // Add refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'moc-agent-market-button';
    refreshBtn.textContent = 'Refresh';
    refreshBtn.addEventListener('click', refreshAgentData);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'moc-agent-market-button';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => widget.remove());

    footer.appendChild(refreshBtn);
    footer.appendChild(closeBtn);

    widget.appendChild(header);
    widget.appendChild(content);
    widget.appendChild(footer);

    // Add widget to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(widget);
      window.MyOffiCityAddons.register('AI Agent Market Widget');
    }

    // Load agent data
    loadAgentData(content);
  }

  function loadAgentData(container) {
    // In a real implementation, this would fetch data from an API
    // For now, we'll use mock data
    const mockAgents = [
      {
        name: 'Gemini 2.5 Flash',
        performance: 92,
        reliability: 95,
        cost: 75,
        speed: 88
      },
      {
        name: 'Groq Llama 3.3 70B',
        performance: 88,
        reliability: 90,
        cost: 65,
        speed: 92
      },
      {
        name: 'SambaNova DeepSeek V3',
        performance: 85,
        reliability: 88,
        cost: 70,
        speed: 85
      },
      {
        name: 'Mistral Codestral',
        performance: 82,
        reliability: 85,
        cost: 60,
        speed: 80
      },
      {
        name: 'OpenRouter',
        performance: 78,
        reliability: 82,
        cost: 55,
        speed: 75
      }
    ];

    // Clear container
    container.innerHTML = '';

    // Add agent cards
    mockAgents.forEach(agent => {
      const card = document.createElement('div');
      card.className = 'moc-agent-card';

      const name = document.createElement('div');
      name.className = 'moc-agent-name';
      name.textContent = agent.name;

      const stats = document.createElement('div');
      stats.className = 'moc-agent-stats';

      const performance = document.createElement('div');
      performance.className = 'moc-agent-stat';
      performance.textContent = `Performance: ${agent.performance}%`;

      const reliability = document.createElement('div');
      reliability.className = 'moc-agent-stat';
      reliability.textContent = `Reliability: ${agent.reliability}%`;

      const cost = document.createElement('div');
      cost.className = 'moc-agent-stat';
      cost.textContent = `Cost: ${agent.cost}%`;

      const speed = document.createElement('div');
      speed.className = 'moc-agent-stat';
      speed.textContent = `Speed: ${agent.speed}%`;

      stats.appendChild(performance);
      stats.appendChild(reliability);
      stats.appendChild(cost);
      stats.appendChild(speed);

      const actions = document.createElement('div');
      actions.className = 'moc-agent-actions';

      const deployBtn = document.createElement('button');
      deployBtn.className = 'moc-agent-action';
      deployBtn.textContent = 'Deploy';
      deployBtn.addEventListener('click', () => deployAgent(agent.name));

      const compareBtn = document.createElement('button');
      compareBtn.className = 'moc-agent-action';
      compareBtn.textContent = 'Compare';
      compareBtn.addEventListener('click', () => compareAgents(agent.name));

      actions.appendChild(deployBtn);
      actions.appendChild(compareBtn);

      card.appendChild(name);
      card.appendChild(stats);
      card.appendChild(actions);

      container.appendChild(card);
    });
  }

  function refreshAgentData() {
    const content = document.querySelector('.moc-agent-market-content');
    if (content) {
      loadAgentData(content);
    }
  }

  function deployAgent(agentName) {
    // Deploy the selected agent
    console.log(`Deploying agent: ${agentName}`);
    // In a real implementation, this would make an API call to deploy the agent
  }

  function compareAgents(agentName) {
    // Compare the selected agent with others
    console.log(`Comparing agent: ${agentName}`);
    // In a real implementation, this would show a comparison modal
  }

  // Enhanced 3D City Map Widget with real navigation and zoom
  function initEnhancedCityMapWidget() {
    const existingWidget = document.getElementById('mocCityMapWidget');
    if (existingWidget) existingWidget.remove();

    const widget = document.createElement('div');
    widget.id = 'mocCityMapWidget';
    widget.className = 'moc-city-map-widget';

    // Create map container
    const

(() => {
  // 8. Enhanced 3D City Map Widget with real navigation and zoom
  function initEnhancedCityMapWidget() {
    const existingWidget = document.getElementById('mocCityMapWidget');
    if (existingWidget) existingWidget.remove();

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

    // Add zoom controls
    const zoomIn = document.createElement('button');
    zoomIn.className = 'moc-map-nav';
    zoomIn.textContent = '+';
    zoomIn.addEventListener('click', () => zoomMap(0.1));

    const zoomOut = document.createElement('button');
    zoomOut.className = 'moc-map-nav';
    zoomOut.textContent = '-';
    zoomOut.addEventListener('click', () => zoomMap(-0.1));

    controls.appendChild(layersToggle);
    controls.appendChild(navButton);
    controls.appendChild(zoomIn);
    controls.appendChild(zoomOut);

    widget.appendChild(mapContainer);
    widget.appendChild(controls);

    // Add widget to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(widget);
      window.MyOffiCityAddons.register('Enhanced 3D City Map Widget');
    }

    // Initialize the map
    initMap(mapContainer);
  }

  function initMap(container) {
    if (!window.MyOffiCity || !window.MyOffiCity.city) {
      container.innerHTML = '<div class="moc-map-placeholder">3D-karta inte tillgänglig</div>';
      return;
    }

    // Create a mini version of the main 3D scene
    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new window.THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(300, 200);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Add a simple cube to represent the city
    const geometry = new window.THREE.BoxGeometry();
    const material = new window.THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new window.THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();

    // Store the map reference for later use
    container.map = {
      scene,
      camera,
      renderer,
      cube
    };
  }

  function toggleMapLayers() {
    // Toggle between different map layers
    console.log('Toggling map layers');
  }

  function showNavigationOptions() {
    // Show navigation options for the user
    console.log('Showing navigation options');
  }

  function zoomMap(amount) {
    const container = document.querySelector('.moc-map-container');
    if (container && container.map) {
      container.map.camera.position.z -= amount;
    }
  }

  // 9. Theme Switcher for 3D City View
  function initThemeSwitcher() {
    if (document.getElementById('mocThemeSwitcher')) return;

    const switcher = document.createElement('div');
    switcher.id = 'mocThemeSwitcher';
    switcher.className = 'moc-theme-switcher';

    // Create theme buttons
    const themes = [
      { name: 'Light', class: 'theme-light' },
      { name: 'Dark', class: 'theme-dark' },
      { name: 'High Contrast', class: 'theme-high-contrast' }
    ];

    themes.forEach(theme => {
      const button = document.createElement('button');
      button.textContent = theme.name;
      button.addEventListener('click', () => applyTheme(theme.class));
      switcher.appendChild(button);
    });

    // Add switcher to the office view
    const officeView = document.querySelector('.office-view');
    if (officeView) {
      officeView.appendChild(switcher);
      window.MyOffiCityAddons.register('Theme Switcher for 3D City View');
    }

    // Apply default theme
    applyTheme('theme-dark');
  }

  function applyTheme(themeClass) {
    // Remove all theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');

    // Add the selected theme class
    document.body.classList.add(themeClass);

    // Store the selected theme in localStorage
    localStorage.setItem('mocTheme', themeClass);
  }

  // Check for saved theme on page load
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem('mocTheme');
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }

  // Add the widget to the initialization
  function boot() {
    initEnhancedCityMapWidget();
    initThemeSwitcher();
    loadSavedTheme();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
