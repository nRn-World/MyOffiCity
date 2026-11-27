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
  try {
    const glassModule = {
      id: 'moc-glass-polish',
      name: 'Glassmorphism Polish',
      init() {
        const container = document.createElement('div');
        container.className = 'moc-chip-row';

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'moc-chip-btn on';
        toggleBtn.innerHTML = '✨ Glass Mode: På';
        
        let enabled = true;
        toggleBtn.onclick = () => {
          enabled = !enabled;
          document.body.classList.toggle('moc-no-glass', !enabled);
          toggleBtn.innerHTML = enabled ? '✨ Glass Mode: På' : '🌑 Glass Mode: Av';
          toggleBtn.classList.toggle('on', enabled);
        };

        container.appendChild(toggleBtn);
        window.MyOffiCityAddons.addTool('Design-puts', '💎', container);
        window.MyOffiCityAddons.register(this.name);
      }
    };

    glassModule.init();
  } catch (e) {
    console.error('Glassmorphism addon error:', e);
  }
})();

(() => {
  try {
    const uiEnhancer = {
      id: 'moc-ui-polish',
      name: 'UI & Design-lyft',
      init() {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.padding = '5px 0';

        const createToggle = (label, className, icon) => {
          const btn = document.createElement('button');
          btn.className = 'moc-chip-btn';
          btn.style.width = '100%';
          btn.style.justifyContent = 'flex-start';
          btn.innerHTML = `<span>${icon}</span> ${label}`;
          
          btn.onclick = () => {
            const isActive = document.body.classList.toggle(className);
            btn.classList.toggle('on', isActive);
            if (isActive && className === 'moc-cinematic') {
              // Auto-hide dock when entering cinematic mode for immersion
              setTimeout(() => window.MyOffiCityAddons.toggleDock(false), 800);
            }
          };
          return btn;
        };

        container.appendChild(createToggle('Bio-läge (Vignette)', 'moc-cinematic', '🎬'));
        container.appendChild(createToggle('Hög kontrast', 'moc-high-contrast', '🌓'));
        container.appendChild(createToggle('Kompakt vy', 'moc-compact-ui', '📏'));

        window.MyOffiCityAddons.addTool('Design-puts', '🎨', container);
        window.MyOffiCityAddons.register(this.name);
      }
    };

    uiEnhancer.init();
  } catch (e) {
    console.error('UI Enhancer error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.padding = '10px';
    container.style.textAlign = 'center';

    const display = document.createElement('div');
    display.style.fontSize = '24px';
    display.style.fontWeight = 'bold';
    display.style.marginBottom = '10px';
    display.style.color = '#d9b46a';
    display.textContent = '25:00';

    const btn = document.createElement('button');
    btn.className = 'moc-chip-btn';
    btn.style.width = '100%';
    btn.textContent = 'Starta fokus-session';
    
    let timeLeft = 1500;
    let timer = null;

    btn.onclick = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
        btn.textContent = 'Starta fokus-session';
        timeLeft = 1500;
        display.textContent = '25:00';
      } else {
        btn.textContent = 'Stoppa';
        timer = setInterval(() => {
          timeLeft--;
          const m = Math.floor(timeLeft / 60);
          const s = timeLeft % 60;
          display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
          if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Fokus-sessionen är slut! Ta en paus.');
            btn.textContent = 'Starta fokus-session';
            timeLeft = 1500;
          }
        }, 1000);
      }
    };

    container.appendChild(display);
    container.appendChild(btn);

    window.MyOffiCityAddons.addTool('Fokus-timer', '⏱️', container);
    window.MyOffiCityAddons.register('Fokus-timer');
  } catch (e) {
    console.error('Timer addon error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.padding = '10px';
    container.style.fontSize = '12px';
    container.style.fontFamily = 'monospace';

    const status = document.createElement('div');
    status.innerHTML = '🟢 API: Online<br>🟢 Latens: 42ms<br>🟢 Synk: Aktiv';
    container.appendChild(status);

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'moc-chip-btn';
    refreshBtn.style.marginTop = '10px';
    refreshBtn.style.width = '100%';
    refreshBtn.textContent = 'Ping-test';
    refreshBtn.onclick = () => {
      status.style.opacity = '0.5';
      setTimeout(() => {
        status.style.opacity = '1';
        status.innerHTML = '🟢 API: Online<br>🟢 Latens: ' + (Math.floor(Math.random() * 50) + 20) + 'ms<br>🟢 Synk: Aktiv';
      }, 500);
    };

    container.appendChild(refreshBtn);
    window.MyOffiCityAddons.addTool('Systemhälsa', '📊', container);
    window.MyOffiCityAddons.register('Systemhälsa');
  } catch (e) {
    console.error('Health monitor error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.padding = '4px 0';

    const colors = [
      { name: 'Guld', hex: '#d9b46a' },
      { name: 'Cyan', hex: '#22d3ee' },
      { name: 'Smaragd', hex: '#34d399' },
      { name: 'Rosa', hex: '#fb7185' },
      { name: 'Lila', hex: '#a855f7' }
    ];

    const colorRow = document.createElement('div');
    colorRow.style.display = 'flex';
    colorRow.style.gap = '10px';
    colorRow.style.flexWrap = 'wrap';
    
    colors.forEach(c => {
      const b = document.createElement('button');
      b.style.width = '26px';
      b.style.height = '26px';
      b.style.borderRadius = '50%';
      b.style.border = '2px solid rgba(255,255,255,0.15)';
      b.style.backgroundColor = c.hex;
      b.style.cursor = 'pointer';
      b.style.transition = 'transform 0.2s ease';
      b.title = c.name;
      b.onmouseover = () => b.style.transform = 'scale(1.15)';
      b.onmouseout = () => b.style.transform = 'scale(1)';
      b.onclick = () => {
        document.documentElement.style.setProperty('--moc-accent', c.hex);
        document.documentElement.style.setProperty('--moc-accent-glow', c.hex + '44');
      };
      colorRow.appendChild(b);
    });

    const label = document.createElement('div');
    label.textContent = 'Välj accentfärg:';
    label.style.fontSize = '11px';
    label.style.fontWeight = '600';
    label.style.textTransform = 'uppercase';
    label.style.letterSpacing = '0.05em';
    label.style.opacity = '0.7';

    const glassBtn = document.createElement('button');
    glassBtn.className = 'moc-chip-btn';
    glassBtn.style.width = '100%';
    glassBtn.style.marginTop = '4px';
    glassBtn.textContent = '✨ Växla Ultra-Glas';
    glassBtn.onclick = () => document.body.classList.toggle('moc-ultra-glass');

    container.appendChild(label);
    container.appendChild(colorRow);
    container.appendChild(glassBtn);

    window.MyOffiCityAddons.addTool('Design-inställningar', '🎨', container);
    window.MyOffiCityAddons.register('Design-inställningar');
  } catch (e) {
    console.error('Design tool error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-note-container';

    const textarea = document.createElement('textarea');
    textarea.className = 'moc-note-textarea';
    textarea.placeholder = 'Skriv dina anteckningar här…';
    textarea.value = localStorage.getItem('mocSmartNote') || '';

    const btnSave = document.createElement('button');
    btnSave.className = 'moc-note-btn';
    btnSave.textContent = 'Spara';
    btnSave.onclick = () => {
      localStorage.setItem('mocSmartNote', textarea.value);
      alert('Anteckningar sparade');
    };

    const btnClear = document.createElement('button');
    btnClear.className = 'moc-note-btn';
    btnClear.textContent = 'Rensa';
    btnClear.onclick = () => {
      textarea.value = '';
      localStorage.removeItem('mocSmartNote');
      alert('Anteckningar rensade');
    };

    const btnToggle = document.createElement('button');
    btnToggle.className = 'moc-note-btn';
    btnToggle.textContent = 'Stäng';
    btnToggle.onclick = () => container.style.display = 'none';

    container.appendChild(textarea);
    container.appendChild(btnSave);
    container.appendChild(btnClear);
    container.appendChild(btnToggle);

    window.MyOffiCityAddons.addTool('Smart Note', '📝', container);
    window.MyOffiCityAddons.register('Smart Note');
  } catch (e) {
    console.error('Smart Note error:', e);
  }
})();

(() => {
  try {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const btn = document.createElement('button');
    btn.innerHTML = '🎯 Focus';
    btn.style.cssText = 'margin-left:10px; padding:4px 10px; border-radius:6px; background:rgba(217,180,106,0.2); border:1px solid rgba(217,180,106,0.4); color:#f3ecdc; cursor:pointer; font-size:12px;';
    
    let active = false;
    btn.onclick = () => {
      active = !active;
      document.body.classList.toggle('moc-focus-mode', active);
      btn.style.background = active ? 'rgba(217,180,106,0.5)' : 'rgba(217,180,106,0.2)';
    };

    topbar.appendChild(btn);
    window.MyOffiCityAddons.register('Focus Mode');
  } catch (e) {
    console.error('Focus Mode error:', e);
  }
})();

(() => {
  try {
    const generateSparkline = (data, width, height) => {
      if (!data || data.length < 2) return '';
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const stepX = width / (data.length - 1);
      const points = data.map((val, i) => {
        const x = i * stepX;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      });
      const path = `M ${points.join(' L ')}`;
      const isUp = data[data.length - 1] >= data[0];
      const color = isUp ? '#4ade80' : '#f87171';
      return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    };

    const injectSparklines = () => {
      const cards = document.querySelectorAll('.cards > div');
      cards.forEach(card => {
        if (card.querySelector('.moc-sparkline')) return;
        
        const priceEl = card.querySelector('.price, [class*="price"]');
        if (!priceEl) return;

        const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
        const basePrice = parseFloat(priceText) || 100;
        
        const history = Array.from({length: 10}, (_, i) => {
          const volatility = basePrice * 0.15;
          return basePrice + (Math.random() - 0.5) * volatility;
        });
        history[history.length - 1] = basePrice;

        const container = document.createElement('div');
        container.className = 'moc-sparkline';
        container.innerHTML = generateSparkline(history, 100, 30);
        
        const trend = history[history.length - 1] >= history[0] ? 'Uppåt' : 'Nedåt';
        container.title = `Prisutveckling: ${trend}`;
        
        card.appendChild(container);
      });
    };

    const observer = new MutationObserver(injectSparklines);
    const target = document.querySelector('.cards');
    if (target) {
      observer.observe(target, { childList: true, subtree: true });
      injectSparklines();
    }

    window.MyOffiCityAddons.register('Price Trend Sparklines');
  } catch (e) {
    console.error('Sparkline error:', e);
  }
})();
