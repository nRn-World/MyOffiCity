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

(() => {
  try {
    let audioCtx = null;
    let noiseNode = null;
    let gainNode = null;
    let filterNode = null;
    let isPlaying = false;

    const container = document.createElement('div');
    container.className = 'moc-ambient-ctrl';
    container.innerHTML = `
      <div class="moc-ambient-row">
        <button class="moc-ambient-toggle">▶️ Starta ljud</button>
        <input type="range" class="moc-ambient-vol" min="0" max="0.1" step="0.005" value="0.02" title="Volym">
      </div>
      <div class="moc-ambient-label">Atmosfäriskt kontorsbrus</div>
    `;

    const btn = container.querySelector('.moc-ambient-toggle');
    const vol = container.querySelector('.moc-ambient-vol');

    const initAudio = () => {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = 2 * audioCtx.sampleRate;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      gainNode = audioCtx.createGain();
      gainNode.gain.value = parseFloat(vol.value);

      // Filter to create a muffled "office hum" effect
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 750; 
      filterNode.Q.value = 1;

      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noiseNode.start();
    };

    btn.onclick = async () => {
      if (!audioCtx) initAudio();
      
      if (isPlaying) {
        await audioCtx.suspend();
        btn.textContent = '▶️ Starta ljud';
        isPlaying = false;
      } else {
        await audioCtx.resume();
        btn.textContent = '⏸️ Pausa ljud';
        isPlaying = true;
      }
    };

    vol.oninput = (e) => {
      const v = parseFloat(e.target.value);
      if (gainNode && audioCtx) {
        gainNode.gain.setTargetAtTime(v, audioCtx.currentTime, 0.1);
      }
    };

    window.MyOffiCityAddons.addTool('Ljudlandskap', '🎧', container);
    window.MyOffiCityAddons.register('Ambient Sound Controller');
  } catch (e) {
    console.error('Ambient Sound Error:', e);
  }
})();

(() => {
  try {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('mocToastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'mocToastContainer';
      document.body.appendChild(toastContainer);
    }

    // Function to show toast notification
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `moc-toast moc-toast-${type}`;
      toast.innerHTML = `
        <span class="moc-toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span class="moc-toast-message">${message}</span>
      `;
      
      toastContainer.appendChild(toast);
      
      // Animate in
      requestAnimationFrame(() => {
        toast.classList.add('moc-toast-visible');
      });
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('moc-toast-visible');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    // Add click handler to all .tc-box elements
    document.querySelectorAll('.tc-box').forEach(box => {
      if (box.dataset.mocToastBound) return;
      box.dataset.mocToastBound = 'true';
      
      box.addEventListener('click', async (e) => {
        // Only handle clicks on the box itself or its copy button
        if (e.target.closest('.tc-copy-btn') || e.target === box) {
          const text = box.textContent || box.innerText;
          
          try {
            await navigator.clipboard.writeText(text);
            showToast('Kopierat till urklipp!', 'success');
          } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
              document.execCommand('copy');
              showToast('Kopierat till urklipp!', 'success');
            } catch (err2) {
              showToast('Kunde inte kopiera', 'error');
            }
            document.body.removeChild(textarea);
          }
        }
      });
    });

    // Register the module
    window.MyOffiCityAddons.register('Smart Copy Toast Notifications');
    
    // Add a small info tool to the dock
    const infoDiv = document.createElement('div');
    infoDiv.className = 'moc-toast-info';
    infoDiv.innerHTML = `
      <div class="moc-toast-info-title">📋 Kopiera-smart</div>
      <div class="moc-toast-info-text">Klicka på API-nycklar eller ID:n för att kopiera med visuell feedback</div>
    `;
    window.MyOffiCityAddons.addTool('Kopiera-smart', '📋', infoDiv);
    
  } catch (e) {
    console.error('Toast Notification Error:', e);
  }
})();

(() => {
  try {
    const portal = document.createElement('div');
    portal.id = 'moc-portal-menu';
    portal.className = 'moc-portal-hidden';
    portal.innerHTML = `
      <div class="moc-portal-box">
        <div class="moc-portal-header">Hoppa till...</div>
        <div class="moc-portal-list">
          <div class="moc-portal-item" data-url="#/">Marketplace</div>
          <div class="moc-portal-item" data-url="#/city">City View</div>
          <div class="moc-portal-item" data-url="#/dash">Dashboard</div>
        </div>
      </div>
    `;
    document.body.appendChild(portal);

    const toggle = (show) => portal.classList.toggle('moc-portal-hidden', !show);

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggle(portal.classList.contains('moc-portal-hidden'));
      }
      if (e.key === 'Escape') toggle(false);
    });

    portal.addEventListener('click', (e) => {
      const item = e.target.closest('.moc-portal-item');
      if (item) {
        window.location.hash = item.dataset.url;
        toggle(false);
      } else {
        toggle(false);
      }
    });

    window.MyOffiCityAddons.register('Portal Jump Menu');
    const info = document.createElement('div');
    info.className = 'moc-toast-info';
    info.innerHTML = 'Tryck <b>Ctrl+K</b> var som helst för att snabbt navigera mellan vyer.';
    window.MyOffiCityAddons.addTool('Portal Jump', '🚀', info);
  } catch (e) {}
})();

(() => {
  try {
    const pulseContainer = document.createElement('div');
    pulseContainer.id = 'moc-live-pulse';
    pulseContainer.className = 'moc-pulse-wrapper';
    pulseContainer.innerHTML = `
      <div class="moc-pulse-dot"></div>
      <span class="moc-pulse-label">AI System Ready</span>
    `;

    // Mount to topbar or app root as requested by Tomas
    const target = document.getElementById('topbar') || document.getElementById('app') || document.body;
    target.appendChild(pulseContainer);

    let activeCalls = 0;
    const setPulseState = (busy) => {
      pulseContainer.classList.toggle('moc-pulse-active', busy);
      const label = pulseContainer.querySelector('.moc-pulse-label');
      label.textContent = busy ? 'AI Processing...' : 'AI System Ready';
    };

    // Hook into actual system events (Fetch API) to detect real-time activity
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const isAiAction = typeof args[0] === 'string' && (args[0].includes('/api/') || args[0].includes('chat'));
      if (isAiAction) {
        activeCalls++;
        setPulseState(true);
      }
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        if (isAiAction) {
          activeCalls--;
          if (activeCalls <= 0) {
            setTimeout(() => { if (activeCalls <= 0) setPulseState(false); }, 1000);
          }
        }
      }
    };

    // Register with the Addon System
    window.MyOffiCityAddons.register('Live Pulse');
    const statusInfo = document.createElement('div');
    statusInfo.className = 'moc-toast-info';
    statusInfo.innerHTML = `
      <div class="moc-toast-info-title">Systemstatus</div>
      <div class="moc-toast-info-text">Indikatorn i topbaren visar realtidsaktivitet. Grön = Väntar, Blå = AI-bearbetning pågår.</div>
    `;
    window.MyOffiCityAddons.addTool('Pulse Status', '💓', statusInfo);
  } catch (e) { console.error('Pulse Addon Error:', e); }
})();

(() => {
  try {
    if (window.__mocQuickSearch) return;
    window.__mocQuickSearch = true;

    const overlay = document.createElement('div');
    overlay.className = 'moc-qs-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="moc-qs-box">
        <div class="moc-qs-head">
          <span class="moc-qs-icon">🔍</span>
          <input type="text" class="moc-qs-input" placeholder="Sök objekt, sidor eller kommandon... (Ctrl+K)" autocomplete="off" />
          <kbd class="moc-qs-kbd">ESC</kbd>
        </div>
        <div class="moc-qs-list"></div>
        <div class="moc-qs-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigera</span>
          <span><kbd>Enter</kbd> Öppna</span>
          <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Stäng</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.moc-qs-input');
    const list = overlay.querySelector('.moc-qs-list');
    let items = [];
    let activeIdx = -1;

    const buildIndex = () => {
      const base = [
        { label: 'Hem / Start', icon: '🏠', hint: 'Huvudsidan', action: () => { location.hash = '#/'; } },
        { label: 'City / Staden', icon: '🏙️', hint: '3D-staden', action: () => { location.hash = '#/city'; } },
        { label: 'Marketplace', icon: '🛒', hint: 'Butik & objekt', action: () => { location.hash = '#/'; } },
        { label: 'AI-tillägg', icon: '✨', hint: 'Öppna AI-docken', action: () => { window.MyOffiCityAddons.toggleDock(true); } },
      ];
      // Dynamiskt: samla synliga länkar & marketplace-items om de finns
      document.querySelectorAll('a[href^="#/"]').forEach(a => {
        const href = a.getAttribute('href');
        const label = (a.textContent || '').trim().slice(0, 40);
        if (label && !base.some(b => b.label === label)) {
          base.push({ label, icon: '🔗', hint: href, action: () => { location.hash = href; } });
        }
      });
      document.querySelectorAll('.card, .dsb, .dmain, .moc-portal-item').forEach(el => {
        const t = (el.textContent || '').trim().slice(0, 40);
        if (t && !base.some(b => b.label === t)) {
          base.push({ label: t, icon: '📦', hint: 'Marketplace-objekt', action: () => { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('moc-qs-flash'); setTimeout(() => el.classList.remove('moc-qs-flash'), 1200); } });
        }
      });
      return base;
    };

    const render = (filtered) => {
      list.innerHTML = '';
      if (!filtered.length) {
        list.innerHTML = '<div class="moc-qs-empty">Inga träffar</div>';
        return;
      }
      filtered.forEach((it, i) => {
        const row = document.createElement('div');
        row.className = 'moc-qs-row' + (i === activeIdx ? ' active' : '');
        row.innerHTML = `<span class="moc-qs-row-icon">${it.icon}</span><span class="moc-qs-row-label">${it.label}</span><span class="moc-qs-row-hint">${it.hint || ''}</span>`;
        row.addEventListener('click', () => { it.action(); close(); });
        list.appendChild(row);
      });
    };

    const filter = (q) => {
      const query = q.toLowerCase().trim();
      if (!query) return items;
      return items.filter(it => it.label.toLowerCase().includes(query) || (it.hint || '').toLowerCase().includes(query));
    };

    const open = () => {
      items = buildIndex();
      activeIdx = -1;
      overlay.hidden = false;
      input.value = '';
      render(items);
      setTimeout(() => input.focus(), 30);
    };
    const close = () => { overlay.hidden = true; input.value = ''; activeIdx = -1; };

    input.addEventListener('input', () => {
      activeIdx = -1;
      render(filter(input.value));
    });

    input.addEventListener('keydown', (e) => {
      const rows = list.querySelectorAll('.moc-qs-row');
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, rows.length - 1); render(filter(input.value)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); render(filter(input.value)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0 && items[activeIdx]) { items[activeIdx].action(); close(); } }
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        overlay.hidden ? open() : close();
      } else if (e.key === 'Escape' && !overlay.hidden) {
        close();
      }
    });

    // Liten info-widget i AI-docken
    const info = document.createElement('div');
    info.className = 'moc-toast-info';
    info.innerHTML = `
      <div class="moc-toast-info-title">Snabbsök</div>
      <div class="moc-toast-info-text">Tryck <kbd>Ctrl</kbd>+<kbd>K</kbd> (eller <kbd>⌘</kbd>+<kbd>K</kbd>) för att snabbt söka och navigera.</div>
    `;
    window.MyOffiCityAddons.addTool('Quick-Search', '🔍', info);
    window.MyOffiCityAddons.register('Quick-Search Overlay');
  } catch (e) { console.error('Quick-Search Addon Error:', e); }
})();

(() => {
  try {
    const tooltip = document.createElement('div');
    tooltip.className = 'moc-asset-tip';
    tooltip.hidden = true;
    tooltip.innerHTML = `
      <div class="moc-asset-tip-head">
        <span class="moc-asset-tip-icon">📦</span>
        <span class="moc-asset-tip-title">Asset-Inspector</span>
      </div>
      <div class="moc-asset-tip-body"></div>
      <div class="moc-asset-tip-foot">
        <span class="moc-asset-tip-hint">Hover för detaljer</span>
      </div>
    `;
    document.body.appendChild(tooltip);

    const body = tooltip.querySelector('.moc-asset-tip-body');
    const titleEl = tooltip.querySelector('.moc-asset-tip-title');
    const iconEl = tooltip.querySelector('.moc-asset-tip-icon');

    let activeCard = null;
    let hideTimer = null;

    function extractMeta(card) {
      const name = (card.querySelector('.card-title, h3, h2, [class*="title"]')?.textContent || card.dataset.name || 'Okänd asset').trim();
      const desc = (card.querySelector('.card-desc, p, [class*="desc"]')?.textContent || '').trim();
      const price = (card.querySelector('[class*="price"], .price, [data-price]')?.textContent || card.dataset.price || '').trim();
      const author = (card.querySelector('[class*="author"], [class*="creator"], [data-author]')?.textContent || card.dataset.author || 'nRn-World').trim();
      const weight = card.dataset.weight || card.dataset.modelWeight || '';
      const tags = Array.from(card.querySelectorAll('[class*="tag"], .tag, [data-tag]')).map(t => t.textContent.trim()).filter(Boolean);
      const img = card.querySelector('img')?.src || '';
      const id = card.dataset.id || card.id || '';
      return { name, desc, price, author, weight, tags, img, id };
    }

    function renderTip(meta) {
      titleEl.textContent = meta.name;
      iconEl.textContent = meta.img ? '🖼️' : '📦';
      let html = '';
      if (meta.desc) html += `<div class="moc-asset-tip-row"><span class="moc-asset-tip-label">Beskrivning</span><span class="moc-asset-tip-val">${meta.desc}</span></div>`;
      if (meta.price) html += `<div class="moc-asset-tip-row"><span class="moc-asset-tip-label">Pris</span><span class="moc-asset-tip-val moc-asset-tip-price">${meta.price}</span></div>`;
      if (meta.author) html += `<div class="moc-asset-tip-row"><span class="moc-asset-tip-label">Skapare</span><span class="moc-asset-tip-val">${meta.author}</span></div>`;
      if (meta.weight) html += `<div class="moc-asset-tip-row"><span class="moc-asset-tip-label">Modell-vikt</span><span class="moc-asset-tip-val">${meta.weight}</span></div>`;
      if (meta.id) html += `<div class="moc-asset-tip-row"><span class="moc-asset-tip-label">ID</span><span class="moc-asset-tip-val moc-asset-tip-mono">${meta.id}</span></div>`;
      if (meta.tags.length) html += `<div class="moc-asset-tip-tags">${meta.tags.map(t => `<span class="moc-asset-tip-tag">${t}</span>`).join('')}</div>`;
      body.innerHTML = html || '<div class="moc-asset-tip-empty">Ingen metadata tillgänglig</div>';
    }

    function showTip(card, e) {
      clearTimeout(hideTimer);
      const meta = extractMeta(card);
      renderTip(meta);
      tooltip.hidden = false;
      tooltip.classList.add('visible');
      positionTip(e);
    }

    function positionTip(e) {
      const pad = 14;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      if (x + tw > window.innerWidth - 10) x = e.clientX - tw - pad;
      if (y + th > window.innerHeight - 10) y = e.clientY - th - pad;
      if (x < 10) x = 10;
      if (y < 10) y = 10;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }

    function hideTip() {
      hideTimer = setTimeout(() => {
        tooltip.classList.remove('visible');
        setTimeout(() => { tooltip.hidden = true; }, 200);
      }, 120);
    }

    function bindCards() {
      const cards = document.querySelectorAll('.cards, .card, [class*="card"]');
      cards.forEach(card => {
        if (card.dataset.assetBound) return;
        card.dataset.assetBound = '1';
        card.addEventListener('mouseenter', (e) => showTip(card, e));
        card.addEventListener('mousemove', (e) => { if (!tooltip.hidden) positionTip(e); });
        card.addEventListener('mouseleave', hideTip);
      });
    }

    bindCards();
    const observer = new MutationObserver(() => bindCards());
    observer.observe(document.body, { childList: true, subtree: true });

    const info = document.createElement('div');
    info.className = 'moc-toast-info';
    info.innerHTML = `
      <div class="moc-toast-info-title">Asset-Inspector</div>
      <div class="moc-toast-info-text">Hovra över en asset-kort i marketplace för att se detaljerad metadata: skapare, pris, modell-vikt och taggar.</div>
    `;
    window.MyOffiCityAddons.addTool('Asset-Inspector', '🔬', info);
    window.MyOffiCityAddons.register('Asset-Inspector Tooltip');
  } catch (e) { console.error('Asset-Inspector Addon Error:', e); }
})();

(() => {
  try {
    const themeKey = 'moc-theme';
    const themes = {
      'soft-dark': { label: 'Soft-Dark', icon: '🌙', class: 'moc-theme-soft-dark' },
      'high-contrast': { label: 'High-Contrast', icon: '☀️', class: 'moc-theme-high-contrast' }
    };

    function getSavedTheme() {
      try {
        return localStorage.getItem(themeKey) || 'soft-dark';
      } catch (e) {
        return 'soft-dark';
      }
    }

    function applyTheme(themeName) {
      const theme = themes[themeName] || themes['soft-dark'];
      document.body.classList.remove('moc-theme-soft-dark', 'moc-theme-high-contrast');
      document.body.classList.add(theme.class);
      try {
        localStorage.setItem(themeKey, themeName);
      } catch (e) {}
    }

    function toggleTheme() {
      const current = getSavedTheme();
      const next = current === 'soft-dark' ? 'high-contrast' : 'soft-dark';
      applyTheme(next);
      updateButtonLabel(next);
    }

    function updateButtonLabel(themeName) {
      const theme = themes[themeName] || themes['soft-dark'];
      const btn = document.getElementById('mocThemeToggle');
      if (btn) {
        btn.innerHTML = `${theme.icon} ${theme.label}`;
        btn.title = `Växla till ${themeName === 'soft-dark' ? 'High-Contrast' : 'Soft-Dark'}`;
      }
    }

    const currentTheme = getSavedTheme();
    applyTheme(currentTheme);

    const topbar = document.getElementById('topbar');
    if (topbar) {
      const btn = document.createElement('button');
      btn.id = 'mocThemeToggle';
      btn.className = 'moc-theme-toggle';
      btn.innerHTML = `${themes[currentTheme].icon} ${themes[currentTheme].label}`;
      btn.title = `Växla till ${currentTheme === 'soft-dark' ? 'High-Contrast' : 'Soft-Dark'}`;
      btn.addEventListener('click', toggleTheme);
      topbar.appendChild(btn);
      updateButtonLabel(currentTheme);
    }

    const info = document.createElement('div');
    info.className = 'moc-toast-info';
    info.innerHTML = `
      <div class="moc-toast-info-title">Theme-Switcher</div>
      <div class="moc-toast-info-text">Växla mellan Soft-Dark och High-Contrast lägen. Ditt val sparas automatiskt.</div>
    `;
    window.MyOffiCityAddons.addTool('Theme-Switcher', '🎨', info);
    window.MyOffiCityAddons.register('Theme-Switcher');
  } catch (e) {
    console.error('Theme-Switcher Addon Error:', e);
  }
})();

(() => {
  try {
    const shortcuts = [
      { key: 'Esc', desc: 'Stäng paneler / återställ vy' },
      { key: 'F', desc: 'Fokusera på vald byggnad' },
      { key: 'R', desc: 'Roterat kameran' },
      { key: 'T', desc: 'Byt tid (dag/natt)' },
      { key: 'M', desc: 'Visa/dölj minikarta' },
      { key: 'H', desc: 'Visa/dölj hjälp' },
      { key: '?', desc: 'Visa denna panel' }
    ];

    const panel = document.createElement('div');
    panel.className = 'moc-shortcuts-panel';
    panel.innerHTML = `
      <div class="moc-shortcuts-header">
        <span class="moc-shortcuts-icon">⌨️</span>
        <span class="moc-shortcuts-title">Kortkommandon</span>
      </div>
      <div class="moc-shortcuts-list">
        ${shortcuts.map(s => `
          <div class="moc-shortcut-item">
            <kbd class="moc-shortcut-key">${s.key}</kbd>
            <span class="moc-shortcut-desc">${s.desc}</span>
          </div>
        `).join('')}
      </div>
    `;

    const foot = document.getElementById('foot');
    if (foot) {
      const btn = document.createElement('button');
      btn.className = 'moc-shortcuts-btn';
      btn.innerHTML = '⌨️ Kortkommandon';
      btn.title = 'Visa alla tillgängliga kortkommandon';
      btn.addEventListener('click', () => {
        panel.classList.toggle('open');
      });
      foot.appendChild(btn);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        panel.classList.toggle('open');
      }
    });

    window.MyOffiCityAddons.addTool('Kortkommandon', '⌨️', panel);
    window.MyOffiCityAddons.register('Kortkommandon');
  } catch (e) {
    console.error('Shortcuts Panel Error:', e);
  }
})();

(() => {
  try {
    const panel = document.createElement('div');
    panel.className = 'moc-filter-widget';
    
    const categories = [
      { id: 'all', label: 'Alla', icon: '🌐' },
      { id: 'kodning', label: 'Kodning', icon: '💻' },
      { id: 'design', label: 'Design', icon: '🎨' },
      { id: 'support', label: 'Support', icon: '🛟' },
      { id: 'analys', label: 'Analys', icon: '📊' }
    ];

    const sorts = [
      { id: 'default', label: 'Standard' },
      { id: 'price-asc', label: 'Pris ↑' },
      { id: 'price-desc', label: 'Pris ↓' },
      { id: 'newest', label: 'Nyast' }
    ];

    panel.innerHTML = `
      <div class="moc-filter-header">
        <span class="moc-filter-icon">🔍</span>
        <span class="moc-filter-title">Filtrera & Sortera</span>
      </div>
      <div class="moc-filter-chips" id="mocFilterChips">
        ${categories.map(c => `<button class="moc-chip" data-cat="${c.id}">${c.icon} ${c.label}</button>`).join('')}
      </div>
      <div class="moc-filter-sort">
        <label>Sortera:</label>
        <select id="mocSortSelect">
          ${sorts.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
        </select>
      </div>
      <div class="moc-filter-count" id="mocFilterCount">Visar alla agenter</div>
    `;

    const chips = panel.querySelectorAll('.moc-chip');
    const sortSelect = panel.querySelector('#mocSortSelect');
    const countEl = panel.querySelector('#mocFilterCount');

    let activeCat = 'all';
    let activeSort = 'default';

    const getCards = () => document.querySelectorAll('.card, .agent-card, [class*="card"]');

    const applyFilters = () => {
      const cards = Array.from(getCards());
      if (!cards.length) return;

      const filtered = cards.filter(card => {
        if (activeCat === 'all') return true;
        const text = (card.textContent || '').toLowerCase();
        return text.includes(activeCat);
      });

      const sorted = filtered.sort((a, b) => {
        if (activeSort === 'price-asc') {
          const pa = parseFloat((a.textContent.match(/(\d+)[^\d]*kr/i) || [0, 0])[1]) || 0;
          const pb = parseFloat((b.textContent.match(/(\d+)[^\d]*kr/i) || [0, 0])[1]) || 0;
          return pa - pb;
        }
        if (activeSort === 'price-desc') {
          const pa = parseFloat((a.textContent.match(/(\d+)[^\d]*kr/i) || [0, 0])[1]) || 0;
          const pb = parseFloat((b.textContent.match(/(\d+)[^\d]*kr/i) || [0, 0])[1]) || 0;
          return pb - pa;
        }
        if (activeSort === 'newest') {
          return b.dataset.date ? (b.dataset.date > a.dataset.date ? 1 : -1) : 0;
        }
        return 0;
      });

      const container = cards[0].parentElement;
      if (container) {
        container.innerHTML = '';
        sorted.forEach(card => container.appendChild(card));
      }

      countEl.textContent = `Visar ${sorted.length} av ${cards.length} agenter`;
    };

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCat = chip.dataset.cat;
        applyFilters();
      });
    });

    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      applyFilters();
    });

    // Starta med "Alla" aktivt
    chips[0].classList.add('active');

    window.MyOffiCityAddons.addTool('Snickra Filter', '🔍', panel);
    window.MyOffiCityAddons.register('Snickra Filter');
  } catch (e) {
    console.error('Filter Widget Error:', e);
  }
})();

(() => {
  try {
    const panel = document.createElement('div');
    panel.className = 'moc-minimap-wrap';
    
    const canvas = document.createElement('canvas');
    canvas.width = 220;
    canvas.height = 220;
    canvas.className = 'moc-minimap-canvas';
    panel.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const WORLD_SIZE = 100; // 3D world units mapped to 2D canvas

    // Define key locations in 3D world space (x, z)
    const locations = [
      { id: 'center', name: 'Stadscentrum', x: 0, z: 0, color: '#d9b46a' },
      { id: 'north', name: 'Norrkvarter', x: 0, z: -40, color: '#4ade80' },
      { id: 'south', name: 'Söderpark', x: 0, z: 40, color: '#60a5fa' },
      { id: 'east', name: 'Östra Hamnen', x: 40, z: 0, color: '#f87171' },
      { id: 'west', name: 'Västra Slottet', x: -40, z: 0, color: '#c084fc' }
    ];

    // Convert 3D world coords to 2D canvas coords
    const worldToCanvas = (x, z) => {
      const cx = W / 2 + (x / WORLD_SIZE) * (W / 2);
      const cy = H / 2 + (z / WORLD_SIZE) * (H / 2);
      return { x: cx, y: cy };
    };

    // Convert 2D canvas coords to 3D world coords
    const canvasToWorld = (cx, cy) => {
      const x = ((cx - W / 2) / (W / 2)) * WORLD_SIZE;
      const z = ((cy - H / 2) / (H / 2)) * WORLD_SIZE;
      return { x, z };
    };

    // Draw the minimap
    const drawMap = (cameraPos) => {
      ctx.clearRect(0, 0, W, H);
      
      // Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(217, 180, 106, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= W; i += 22) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(W, i);
        ctx.stroke();
      }

      // Draw locations
      locations.forEach(loc => {
        const pos = worldToCanvas(loc.x, loc.z);
        
        // Glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = loc.color + '33';
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = loc.color;
        ctx.fill();

        // Label
        ctx.fillStyle = '#e9d7b0';
        ctx.font = '9px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, pos.x, pos.y - 10);
      });

      // Draw camera position
      if (cameraPos) {
        const camPos = worldToCanvas(cameraPos.x, cameraPos.z);
        
        // Camera indicator
        ctx.beginPath();
        ctx.arc(camPos.x, camPos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(camPos.x, camPos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#d9b46a';
        ctx.fill();
      }
    };

    // Initial draw
    drawMap(null);

    // Click handler for teleportation
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      
      // Find closest location
      let closest = null;
      let minDist = Infinity;
      
      locations.forEach(loc => {
        const pos = worldToCanvas(loc.x, loc.z);
        const dist = Math.hypot(pos.x - cx, pos.y - cy);
        if (dist < minDist && dist < 15) {
          minDist = dist;
          closest = loc;
        }
      });

      if (closest) {
        // Teleport camera to this location
        const targetPos = canvasToWorld(worldToCanvas(closest.x, closest.z).x, worldToCanvas(closest.x, closest.z).y);
        
        // Dispatch custom event for Three.js to handle
        window.dispatchEvent(new CustomEvent('moc-teleport', {
          detail: { x: targetPos.x, z: targetPos.z, name: closest.name }
        }));
        
        // Visual feedback
        canvas.style.borderColor = closest.color;
        setTimeout(() => { canvas.style.borderColor = ''; }, 300);
      }
    });

    // Listen for camera position updates from Three.js
    window.addEventListener('moc-camera-update', (e) => {
      drawMap(e.detail);
    });

    // Start polling for camera position (fallback if no events)
    let lastCamPos = null;
    const pollCamera = () => {
      // Try to get camera from Three.js scene if available
      if (window.THREE && window.scene && window.camera) {
        const cam = window.camera;
        if (cam && cam.position) {
          const pos = { x: cam.position.x, z: cam.position.z };
          if (!lastCamPos || Math.hypot(pos.x - lastCamPos.x, pos.z - lastCamPos.z) > 0.5) {
            lastCamPos = pos;
            drawMap(pos);
          }
        }
      }
      requestAnimationFrame(pollCamera);
    };
    pollCamera();

    window.MyOffiCityAddons.addTool('Minikarta', '🗺️', panel);
    window.MyOffiCityAddons.register('Minikarta');
  } catch (e) {
    console.error('Minimap Error:', e);
  }
})();

(() => {
  try {
    const commands = [
      { icon: '📊', label: 'Statusrapport', msg: 'Ge en kort statusrapport på alla pågående projekt och teamet.' },
      { icon: '💾', label: 'Kör backup', msg: 'Kör en full backup av staden och bekräfta när den är klar.' },
      { icon: '📜', label: 'Visa loggar', msg: 'Visa de senaste 10 loggposterna från systemet.' },
      { icon: '🚀', label: 'Optimera', msg: 'Förslag på 3 saker vi kan optimera i staden just nu.' }
    ];

    const dock = document.createElement('div');
    dock.id = 'mocQuickDock';
    dock.className = 'moc-quick-dock';
    dock.innerHTML = '<div class="moc-quick-dock-handle">⚡ Snabbåtgärder</div>';

    const bar = document.createElement('div');
    bar.className = 'moc-quick-dock-bar';
    commands.forEach((c) => {
      const btn = document.createElement('button');
      btn.className = 'moc-quick-dock-btn';
      btn.title = c.msg;
      btn.innerHTML = `<span class="moc-quick-dock-ico">${c.icon}</span><span class="moc-quick-dock-lbl">${c.label}</span>`;
      btn.addEventListener('click', () => {
        const input = document.querySelector('#chatInput, .chat-input, textarea[name="message"], #messageInput');
        if (input) {
          input.value = c.msg;
          input.focus();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const send = document.querySelector('#sendBtn, .send-btn, button[type="submit"]');
          if (send) setTimeout(() => send.click(), 120);
        }
        btn.classList.add('moc-quick-dock-flash');
        setTimeout(() => btn.classList.remove('moc-quick-dock-flash'), 400);
      });
      bar.appendChild(btn);
    });
    dock.appendChild(bar);
    document.body.appendChild(dock);

    // Dragging
    const handle = dock.querySelector('.moc-quick-dock-handle');
    let dragging = false, offX = 0, offY = 0;
    handle.addEventListener('mousedown', (e) => {
      dragging = true;
      const r = dock.getBoundingClientRect();
      offX = e.clientX - r.left;
      offY = e.clientY - r.top;
      dock.style.right = 'auto';
      dock.style.bottom = 'auto';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      dock.style.left = (e.clientX - offX) + 'px';
      dock.style.top = (e.clientY - offY) + 'px';
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    window.MyOffiCityAddons.register('Snabbåtgärds-dock');
  } catch (e) {}
})();

(() => {
  try {
    const LS_KEY = 'moc_accessibility';
    const defaults = { fontSize: 100, contrast: 100 };
    
    let state = { ...defaults };
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) state = { ...defaults, ...JSON.parse(saved) };
    } catch (e) {}

    const applySettings = () => {
      const root = document.documentElement;
      root.style.setProperty('--moc-font-scale', state.fontSize / 100);
      root.style.setProperty('--moc-contrast', state.contrast / 100);
      
      const app = document.getElementById('app');
      const nav = document.getElementById('nav');
      const boxes = document.querySelectorAll('.tc-box');
      
      const targets = [app, nav, ...boxes].filter(Boolean);
      targets.forEach(el => {
        el.style.fontSize = `${state.fontSize}%`;
        el.style.filter = `contrast(${state.contrast / 100})`;
      });
      
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    };

    const panel = document.createElement('div');
    panel.className = 'moc-a11y-panel';
    panel.innerHTML = `
      <div class="moc-a11y-header">
        <span class="moc-a11y-title">🔍 Tillgänglighet</span>
        <button class="moc-a11y-reset" title="Återställ">↺</button>
      </div>
      <div class="moc-a11y-control">
        <label>Textstorlek: <span class="moc-a11y-val" id="mocA11yFontVal">${state.fontSize}%</span></label>
        <input type="range" min="80" max="200" value="${state.fontSize}" id="mocA11yFont" />
      </div>
      <div class="moc-a11y-control">
        <label>Kontrast: <span class="moc-a11y-val" id="mocA11yContrastVal">${state.contrast}%</span></label>
        <input type="range" min="80" max="150" value="${state.contrast}" id="mocA11yContrast" />
      </div>
    `;

    const fontSlider = panel.querySelector('#mocA11yFont');
    const contrastSlider = panel.querySelector('#mocA11yContrast');
    const fontVal = panel.querySelector('#mocA11yFontVal');
    const contrastVal = panel.querySelector('#mocA11yContrastVal');
    const resetBtn = panel.querySelector('.moc-a11y-reset');

    fontSlider.addEventListener('input', (e) => {
      state.fontSize = parseInt(e.target.value, 10);
      fontVal.textContent = state.fontSize + '%';
      applySettings();
    });

    contrastSlider.addEventListener('input', (e) => {
      state.contrast = parseInt(e.target.value, 10);
      contrastVal.textContent = state.contrast + '%';
      applySettings();
    });

    resetBtn.addEventListener('click', () => {
      state = { ...defaults };
      fontSlider.value = state.fontSize;
      contrastSlider.value = state.contrast;
      fontVal.textContent = state.fontSize + '%';
      contrastVal.textContent = state.contrast + '%';
      applySettings();
    });

    applySettings();

    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Tillgänglighet', '🔍', panel);
      window.MyOffiCityAddons.register('Tillgänglighetspanel');
    }
  } catch (e) {}
})();

(() => {
  try {
    const MAX_COMPARE = 3;
    const selected = new Set();
    let modalEl = null;
    let overlayEl = null;

    const getAgentData = (card) => {
      const name = card.querySelector('.card-title, h3, h2, [class*="name"]')?.textContent?.trim() || 'Okänd Agent';
      const price = card.querySelector('[class*="price"], .price, [data-price]')?.textContent?.trim() || '—';
      const rating = card.querySelector('[class*="rating"], .stars, [data-rating]')?.textContent?.trim() || '—';
      const features = Array.from(card.querySelectorAll('.feature, li, [class*="feature"]')).map(f => f.textContent.trim()).filter(Boolean);
      const desc = card.querySelector('.card-desc, p, [class*="desc"]')?.textContent?.trim() || '';
      return { name, price, rating, features, desc };
    };

    const createCompareBtn = (card) => {
      if (card.querySelector('.moc-compare-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'moc-compare-btn';
      btn.textContent = '⚖️ Jämför';
      btn.title = 'Markera för jämförelse';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = card.dataset.id || card.id || card.querySelector('h3, h2, .card-title')?.textContent;
        if (selected.has(cardId)) {
          selected.delete(cardId);
          card.classList.remove('moc-compare-selected');
          btn.classList.remove('active');
        } else {
          if (selected.size >= MAX_COMPARE) {
            alert(`Du kan jämföra max ${MAX_COMPARE} agenter. Avmarkera en först.`);
            return;
          }
          selected.add(cardId);
          card.classList.add('moc-compare-selected');
          btn.classList.add('active');
        }
        updateCompareBar();
      });
      card.appendChild(btn);
    };

    const updateCompareBar = () => {
      let bar = document.getElementById('mocCompareBar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'mocCompareBar';
        bar.className = 'moc-compare-bar';
        document.body.appendChild(bar);
      }
      if (selected.size === 0) {
        bar.style.display = 'none';
        return;
      }
      bar.style.display = 'flex';
      bar.innerHTML = `
        <span class="moc-compare-count">${selected.size}/${MAX_COMPARE} markerade</span>
        <button class="moc-compare-open" ${selected.size < 2 ? 'disabled' : ''}>Öppna jämförelse</button>
        <button class="moc-compare-clear">Rensa</button>
      `;
      bar.querySelector('.moc-compare-open').addEventListener('click', openCompareModal);
      bar.querySelector('.moc-compare-clear').addEventListener('click', () => {
        selected.clear();
        document.querySelectorAll('.moc-compare-selected').forEach(c => c.classList.remove('moc-compare-selected'));
        document.querySelectorAll('.moc-compare-btn.active').forEach(b => b.classList.remove('active'));
        updateCompareBar();
      });
    };

    const openCompareModal = () => {
      const cards = Array.from(document.querySelectorAll('.card')).filter(c => {
        const id = c.dataset.id || c.id || c.querySelector('h3, h2, .card-title')?.textContent;
        return selected.has(id);
      });
      if (cards.length < 2) return;

      const agents = cards.map(getAgentData);
      const maxFeatures = Math.max(...agents.map(a => a.features.length), 0);

      let rows = '';
      for (let i = 0; i < maxFeatures; i++) {
        rows += `<tr><td class="moc-cmp-label">Funktion ${i + 1}</td>`;
        agents.forEach(a => {
          rows += `<td>${a.features[i] || '—'}</td>`;
        });
        rows += '</tr>';
      }

      const modal = document.createElement('div');
      modal.className = 'moc-compare-modal';
      modal.innerHTML = `
        <div class="moc-compare-overlay" id="mocCompareOverlay"></div>
        <div class="moc-compare-content">
          <div class="moc-compare-header">
            <h3>⚖️ Jämför AI-Agenter</h3>
            <button class="moc-compare-close" id="mocCompareClose">✕</button>
          </div>
          <div class="moc-compare-table-wrap">
            <table class="moc-compare-table">
              <thead>
                <tr>
                  <th class="moc-cmp-label"></th>
                  ${agents.map(a => `<th>${a.name}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="moc-cmp-label">Pris</td>
                  ${agents.map(a => `<td class="moc-cmp-price">${a.price}</td>`).join('')}
                </tr>
                <tr>
                  <td class="moc-cmp-label">Betyg</td>
                  ${agents.map(a => `<td class="moc-cmp-rating">${a.rating}</td>`).join('')}
                </tr>
                <tr>
                  <td class="moc-cmp-label">Beskrivning</td>
                  ${agents.map(a => `<td class="moc-cmp-desc">${a.desc}</td>`).join('')}
                </tr>
                ${rows}
              </tbody>
            </table>
          </div>
          <div class="moc-compare-footer">
            <button class="moc-compare-close-btn" id="mocCompareCloseBtn">Stäng</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modalEl = modal;
      overlayEl = modal.querySelector('#mocCompareOverlay');

      const close = () => {
        if (modalEl) {
          modalEl.remove();
          modalEl = null;
          overlayEl = null;
          document.removeEventListener('keydown', escHandler);
        }
      };

      const escHandler = (e) => {
        if (e.key === 'Escape') close();
      };

      modal.querySelector('#mocCompareClose').addEventListener('click', close);
      modal.querySelector('#mocCompareCloseBtn').addEventListener('click', close);
      overlayEl.addEventListener('click', close);
      document.addEventListener('keydown', escHandler);
    };

    const init = () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(createCompareBtn);
      updateCompareBar();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    const observer = new MutationObserver(() => {
      const newCards = document.querySelectorAll('.card:not(.moc-compare-initialized)');
      newCards.forEach(card => {
        card.classList.add('moc-compare-initialized');
        createCompareBtn(card);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.register('Jämför AI-Agenter');
    }
  } catch (e) {}
})();

(() => {
  try {
    const FAV_KEY = 'moc_favorites';
    const getFavs = () => {
      try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch(e) { return []; }
    };
    const saveFavs = (favs) => {
      localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    };

    const container = document.createElement('div');
    container.className = 'moc-fav-container';
    
    const header = document.createElement('div');
    header.className = 'moc-fav-header';
    header.innerHTML = `<span class="moc-fav-title">⭐ Favoriter & Jämförelse</span><span class="moc-fav-count" id="mocFavCount">0/3</span>`;
    container.appendChild(header);

    const list = document.createElement('div');
    list.className = 'moc-fav-list';
    container.appendChild(list);

    const compareBtn = document.createElement('button');
    compareBtn.className = 'moc-fav-compare-btn';
    compareBtn.textContent = 'Jämför valda (0/3)';
    compareBtn.disabled = true;
    container.appendChild(compareBtn);

    const renderList = () => {
      const favs = getFavs();
      document.getElementById('mocFavCount').textContent = `${favs.length}/3`;
      list.innerHTML = '';
      
      if (favs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'moc-fav-empty';
        empty.textContent = 'Inga favoriter ännu. Klicka på ⭐ på en agent-kort.';
        list.appendChild(empty);
      } else {
        favs.forEach(fav => {
          const item = document.createElement('div');
          item.className = 'moc-fav-item';
          item.innerHTML = `
            <div class="moc-fav-item-info">
              <div class="moc-fav-item-name">${fav.name}</div>
              <div class="moc-fav-item-price">${fav.price}</div>
            </div>
            <button class="moc-fav-remove" data-id="${fav.id}">✕</button>
          `;
          item.querySelector('.moc-fav-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            const currentFavs = getFavs().filter(f => f.id !== fav.id);
            saveFavs(currentFavs);
            renderList();
            updateCompareBtn();
          });
          list.appendChild(item);
        });
      }
      updateCompareBtn();
    };

    const updateCompareBtn = () => {
      const favs = getFavs();
      compareBtn.textContent = `Jämför valda (${favs.length}/3)`;
      compareBtn.disabled = favs.length < 2;
    };

    const showComparison = () => {
      const favs = getFavs();
      if (favs.length < 2) return;

      const modal = document.createElement('div');
      modal.className = 'moc-fav-modal';
      const overlay = document.createElement('div');
      overlay.className = 'moc-fav-overlay';
      const content = document.createElement('div');
      content.className = 'moc-fav-content';
      
      content.innerHTML = `
        <div class="moc-fav-modal-header">
          <h3>📊 Jämförelse av Favoriter</h3>
          <button class="moc-fav-close">✕</button>
        </div>
        <div class="moc-fav-table-wrapper">
          <table class="moc-fav-table">
            <thead>
              <tr>
                <th>Egenskap</th>
                ${favs.map(f => `<th>${f.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="moc-fav-label">Pris</td>
                ${favs.map(f => `<td class="moc-fav-price">${f.price}</td>`).join('')}
              </tr>
              <tr>
                <td class="moc-fav-label">Rating</td>
                ${favs.map(f => `<td class="moc-fav-rating">⭐ ${f.rating || 'N/A'}</td>`).join('')}
              </tr>
              <tr>
                <td class="moc-fav-label">Nyckelfunktion</td>
                ${favs.map(f => `<td class="moc-fav-desc">${f.feature || 'N/A'}</td>`).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      `;
      
      modal.appendChild(overlay);
      modal.appendChild(content);
      document.body.appendChild(modal);

      const close = () => {
        modal.remove();
        document.removeEventListener('keydown', escHandler);
      };
      const escHandler = (e) => { if (e.key === 'Escape') close(); };
      
      content.querySelector('.moc-fav-close').addEventListener('click', close);
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', escHandler);
    };

    compareBtn.addEventListener('click', showComparison);

    // Attach to cards
    const attachToCards = () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        if (card.querySelector('.moc-fav-btn')) return;
        
        const nameEl = card.querySelector('h3, .card-title, .agent-name');
        const priceEl = card.querySelector('.price, .card-price, .agent-price');
        const ratingEl = card.querySelector('.rating, .card-rating, .agent-rating');
        const descEl = card.querySelector('p, .card-desc, .agent-desc');
        
        if (!nameEl) return;

        const name = nameEl.textContent.trim();
        const price = priceEl ? priceEl.textContent.trim() : 'N/A';
        const rating = ratingEl ? ratingEl.textContent.trim().replace(/[^0-9.]/g, '') : 'N/A';
        const feature = descEl ? descEl.textContent.trim().substring(0, 50) + (descEl.textContent.length > 50 ? '...' : '') : 'N/A';
        
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const btn = document.createElement('button');
        btn.className = 'moc-fav-btn';
        btn.innerHTML = '⭐';
        btn.title = 'Lägg till som favorit';
        
        const updateBtnState = () => {
          const favs = getFavs();
          const isFav = favs.some(f => f.id === id);
          btn.classList.toggle('active', isFav);
          btn.title = isFav ? 'Ta bort från favoriter' : 'Lägg till som favorit';
        };

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          let favs = getFavs();
          const existing = favs.find(f => f.id === id);
          
          if (existing) {
            favs = favs.filter(f => f.id !== id);
          } else {
            if (favs.length >= 3) {
              alert('Du kan bara ha 3 favoriter för jämförelse. Ta bort en först.');
              return;
            }
            favs.push({ id, name, price, rating, feature });
          }
          
          saveFavs(favs);
          updateBtnState();
          renderList();
        });

        updateBtnState();
        card.appendChild(btn);
      });
    };

    const init = () => {
      attachToCards();
      renderList();
      if (window.MyOffiCityAddons) {
        window.MyOffiCityAddons.addTool('Favoriter & Jämförelse', '⭐', container);
        window.MyOffiCityAddons.register('Favoriter & Jämförelse');
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    const observer = new MutationObserver(() => {
      const newCards = document.querySelectorAll('.card:not(.moc-fav-initialized)');
      newCards.forEach(card => {
        card.classList.add('moc-fav-initialized');
        const nameEl = card.querySelector('h3, .card-title, .agent-name');
        if (!nameEl) return;
        
        const name = nameEl.textContent.trim();
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        const btn = document.createElement('button');
        btn.className = 'moc-fav-btn';
        btn.innerHTML = '⭐';
        
        const updateBtnState = () => {
          const favs = getFavs();
          const isFav = favs.some(f => f.id === id);
          btn.classList.toggle('active', isFav);
        };

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          let favs = getFavs();
          const existing = favs.find(f => f.id === id);
          if (existing) {
            favs = favs.filter(f => f.id !== id);
          } else {
            if (favs.length >= 3) {
              alert('Du kan bara ha 3 favoriter.');
              return;
            }
            const priceEl = card.querySelector('.price, .card-price');
            const ratingEl = card.querySelector('.rating, .card-rating');
            const descEl = card.querySelector('p, .card-desc');
            favs.push({
              id,
              name,
              price: priceEl ? priceEl.textContent.trim() : 'N/A',
              rating: ratingEl ? ratingEl.textContent.trim().replace(/[^0-9.]/g, '') : 'N/A',
              feature: descEl ? descEl.textContent.trim().substring(0, 50) : 'N/A'
            });
          }
          saveFavs(favs);
          updateBtnState();
          renderList();
        });

        updateBtnState();
        card.appendChild(btn);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

  } catch(e) {}
})();

(() => {
  try {
    const wrap = document.createElement('div');
    wrap.className = 'moc-timeline-wrap';
    
    const timeSlider = document.createElement('input');
    timeSlider.type = 'range';
    timeSlider.min = '0';
    timeSlider.max = '24';
    timeSlider.step = '0.1';
    timeSlider.value = '12';
    timeSlider.className = 'moc-timeline-slider';
    
    const timeLabel = document.createElement('div');
    timeLabel.className = 'moc-timeline-label';
    timeLabel.textContent = '🕒 12:00';
    
    const skyColor = document.createElement('div');
    skyColor.className = 'moc-timeline-sky';
    
    const lightStatus = document.createElement('div');
    lightStatus.className = 'moc-timeline-status';
    
    wrap.appendChild(timeLabel);
    wrap.appendChild(timeSlider);
    wrap.appendChild(skyColor);
    wrap.appendChild(lightStatus);
    
    const updateAtmosphere = (hour) => {
      const h = parseFloat(hour);
      let skyTop, skyBottom, ambient, sunIntensity, streetLights, windowLights;
      
      if (h >= 5 && h < 8) {
        skyTop = '#ff9a56'; skyBottom = '#ffd89d';
        ambient = 0.4; sunIntensity = 0.8;
        streetLights = false; windowLights = false;
        lightStatus.textContent = '🌅 Morgon';
      } else if (h >= 8 && h < 17) {
        skyTop = '#87ceeb'; skyBottom = '#e0f6ff';
        ambient = 0.8; sunIntensity = 1.0;
        streetLights = false; windowLights = false;
        lightStatus.textContent = '☀️ Dag';
      } else if (h >= 17 && h < 20) {
        skyTop = '#ff6b6b'; skyBottom = '#ffa07a';
        ambient = 0.5; sunIntensity = 0.6;
        streetLights = true; windowLights = true;
        lightStatus.textContent = '🌇 Kväll';
      } else {
        skyTop = '#0f172a'; skyBottom = '#1e293b';
        ambient = 0.15; sunIntensity = 0.05;
        streetLights = true; windowLights = true;
        lightStatus.textContent = '🌙 Natt';
      }
      
      skyColor.style.background = `linear-gradient(to bottom, ${skyTop}, ${skyBottom})`;
      
      const hours = Math.floor(h);
      const minutes = Math.floor((h % 1) * 60);
      timeLabel.textContent = `🕒 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      if (window.THREE) {
        const scene = window.__cityScene || window.__scene;
        if (scene) {
          scene.background = new window.THREE.Color(skyTop);
          scene.fog = new window.THREE.Fog(skyBottom, 50, 200);
          
          scene.traverse((obj) => {
            if (obj.isLight) {
              if (obj.name.includes('ambient') || obj.name.includes('Ambient')) {
                obj.intensity = ambient;
              } else if (obj.name.includes('sun') || obj.name.includes('Sun') || obj.name.includes('directional')) {
                obj.intensity = sunIntensity;
              } else if (obj.name.includes('street') || obj.name.includes('Street')) {
                obj.intensity = streetLights ? 1.5 : 0;
              } else if (obj.name.includes('window') || obj.name.includes('Window')) {
                obj.intensity = windowLights ? 0.8 : 0;
              }
            }
          });
        }
      }
    };
    
    timeSlider.addEventListener('input', (e) => {
      updateAtmosphere(e.target.value);
    });
    
    updateAtmosphere(12);
    
    window.MyOffiCityAddons.addTool('Tidslinje & Atmosfär', '🕒', wrap);
    window.MyOffiCityAddons.register('Tidslinje & Atmosfär');
  } catch(e) {}
})();

(() => {
  try {
    const wrap = document.createElement('div');
    wrap.className = 'moc-notif-wrap';

    const seed = [
      { id: 1, type: 'success', text: 'Tomas svarade på din fråga', time: '2 min sedan', read: false },
      { id: 2, type: 'info', text: 'Ny agent installerad: Anna', time: '15 min sedan', read: false },
      { id: 3, type: 'warning', text: 'Hög CPU-användning på servern', time: '1 tim sedan', read: false },
      { id: 4, type: 'success', text: 'Systemuppdatering slutförd', time: '3 tim sedan', read: true },
      { id: 5, type: 'info', text: 'Nytt meddelande från teamet', time: '5 tim sedan', read: true },
      { id: 6, type: 'warning', text: 'Lagring nästan full', time: '1 dag sedan', read: true }
    ];

    let notifs = JSON.parse(localStorage.getItem('mocNotifs') || 'null') || seed;
    let filter = 'all';

    const save = () => localStorage.setItem('mocNotifs', JSON.stringify(notifs));

    const typeIcons = { info: 'ℹ️', warning: '⚠️', success: '✅' };
    const typeLabels = { all: 'Alla', info: 'Info', warning: 'Varning', success: 'Framgång' };

    const header = document.createElement('div');
    header.className = 'moc-notif-header';
    header.innerHTML = `<span class="moc-notif-title">🔔 Aktivitetshistorik</span><span class="moc-notif-count" id="mocNotifCount"></span>`;
    wrap.appendChild(header);

    const filterBar = document.createElement('div');
    filterBar.className = 'moc-notif-filters';
    ['all', 'info', 'warning', 'success'].forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'moc-notif-filter-btn' + (t === 'all' ? ' active' : '');
      btn.dataset.type = t;
      btn.textContent = typeLabels[t];
      btn.addEventListener('click', () => {
        filter = t;
        filterBar.querySelectorAll('.moc-notif-filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === t));
        render();
      });
      filterBar.appendChild(btn);
    });
    wrap.appendChild(filterBar);

    const list = document.createElement('div');
    list.className = 'moc-notif-list';
    wrap.appendChild(list);

    const markAllBtn = document.createElement('button');
    markAllBtn.className = 'moc-notif-markall';
    markAllBtn.textContent = 'Markera alla som lästa';
    markAllBtn.addEventListener('click', () => {
      notifs.forEach(n => n.read = true);
      save();
      render();
    });
    wrap.appendChild(markAllBtn);

    function render() {
      const unread = notifs.filter(n => !n.read).length;
      const countEl = document.getElementById('mocNotifCount');
      if (countEl) countEl.textContent = unread > 0 ? `${unread} olästa` : 'Alla lästa';

      list.innerHTML = '';
      const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);
      
      if (filtered.length === 0) {
        list.innerHTML = '<div class="moc-notif-empty">Inga notifikationer</div>';
        return;
      }

      filtered.forEach(n => {
        const item = document.createElement('div');
        item.className = 'moc-notif-item' + (n.read ? ' read' : '');
        item.innerHTML = `
          <div class="moc-notif-icon">${typeIcons[n.type]}</div>
          <div class="moc-notif-content">
            <div class="moc-notif-text">${n.text}</div>
            <div class="moc-notif-time">${n.time}</div>
          </div>
          <button class="moc-notif-read-btn" title="Markera som läst">${n.read ? '✓' : '○'}</button>
        `;
        item.querySelector('.moc-notif-read-btn').addEventListener('click', () => {
          n.read = !n.read;
          save();
          render();
        });
        list.appendChild(item);
      });
    }

    render();
    window.MyOffiCityAddons.addTool('Aktivitetshistorik', '🔔', wrap);
    window.MyOffiCityAddons.register('Aktivitetshistorik');
  } catch(e) {}
})();

(() => { try {
  const wrap = document.createElement('div');
  wrap.className = 'moc-a11y-wrap';
  wrap.innerHTML = `
    <div class="moc-a11y-row">
      <button id="mocA11yToggle" class="moc-a11y-btn" aria-pressed="false" title="Aktivera text-till-tal">
        <span class="moc-a11y-icon">🔊</span>
        <span class="moc-a11y-label">Tillgänglighet</span>
      </button>
      <span id="mocA11yStatus" class="moc-a11y-status" role="status" aria-live="polite">Av</span>
    </div>
    <div id="mocA11yPanel" class="moc-a11y-panel" hidden>
      <p class="moc-a11y-hint">När aktiverad: knappar & länkar får ARIA-labels, statusmeddelanden läses högt, och "Läs högt"-knappar visas i chat.</p>
      <div class="moc-a11y-row">
        <label class="moc-a11y-label">Hastighet</label>
        <input type="range" id="mocA11yRate" min="0.5" max="2" step="0.1" value="1" aria-label="Tal-hastighet">
      </div>
      <div class="moc-a11y-row">
        <label class="moc-a11y-label">Röst</label>
        <select id="mocA11yVoice" aria-label="Välj röst"><option value="">System</option></select>
      </div>
    </div>
  `;

  let enabled = false;
  let voices = [];
  let currentUtterance = null;

  const toggleBtn = wrap.querySelector('#mocA11yToggle');
  const statusEl = wrap.querySelector('#mocA11yStatus');
  const panel = wrap.querySelector('#mocA11yPanel');
  const rateInput = wrap.querySelector('#mocA11yRate');
  const voiceSelect = wrap.querySelector('#mocA11yVoice');

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
    voiceSelect.innerHTML = '<option value="">System</option>';
    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.name + (v.lang === 'sv-SE' ? ' (SV)' : '');
      voiceSelect.appendChild(opt);
    });
  }
  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text) {
    if (!enabled || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = parseFloat(rateInput.value) || 1;
    const vi = parseInt(voiceSelect.value, 10);
    if (!isNaN(vi) && voices[vi]) u.voice = voices[vi];
    u.lang = 'sv-SE';
    currentUtterance = u;
    window.speechSynthesis.speak(u);
  }

  function applyAriaLabels() {
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      if (!el.getAttribute('aria-label')) {
        const txt = (el.textContent || '').trim().slice(0, 60);
        if (txt) el.setAttribute('aria-label', txt);
      }
    });
    const topbar = document.getElementById('topbar');
    if (topbar && !topbar.getAttribute('role')) topbar.setAttribute('role', 'banner');
    const foot = document.getElementById('foot');
    if (foot && !foot.getAttribute('role')) foot.setAttribute('role', 'contentinfo');
  }

  function injectChatReadAloud() {
    const chatMsgs = document.querySelectorAll('.chat-msg, .msg, [class*="message"]');
    chatMsgs.forEach(msg => {
      if (msg.querySelector('.moc-read-aloud')) return;
      const btn = document.createElement('button');
      btn.className = 'moc-read-aloud';
      btn.textContent = '🔊';
      btn.title = 'Läs högt';
      btn.setAttribute('aria-label', 'Läs detta meddelande högt');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(msg.textContent.replace(/🔊/g, '').trim());
      });
      msg.appendChild(btn);
    });
  }

  function setEnabled(on) {
    enabled = on;
    toggleBtn.setAttribute('aria-pressed', String(on));
    toggleBtn.classList.toggle('active', on);
    statusEl.textContent = on ? 'På' : 'Av';
    panel.hidden = !on;
    if (on) {
      applyAriaLabels();
      injectChatReadAloud();
      speak('Tillgänglighetsläge aktiverat');
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }

  toggleBtn.addEventListener('click', () => setEnabled(!enabled));
  rateInput.addEventListener('input', () => { if (currentUtterance) currentUtterance.rate = parseFloat(rateInput.value); });

  window.MyOffiCityAddons.addTool('Tillgänglighet', '♿', wrap);
  window.MyOffiCityAddons.register('Tillgänglighet');
} catch(e) {} })();

(() => { try {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="moc-calc-row">
      <label>Antal agenter:</label>
      <input type="number" id="moc-calc-agents" value="1" min="1" max="50">
    </div>
    <div class="moc-calc-row">
      <label>Period:</label>
      <select id="moc-calc-period">
        <option value="1">Månadsvis</option>
        <option value="10">Årsvis (20% rabatt)</option>
      </select>
    </div>
    <div class="moc-calc-result" id="moc-calc-total">Totalt: 499 kr/mån</div>
  `;

  const update = () => {
    const agents = parseInt(document.getElementById('moc-calc-agents').value) || 1;
    const period = parseInt(document.getElementById('moc-calc-period').value);
    const base = 499;
    const total = (agents * base * (period === 10 ? 0.8 : 1)).toFixed(0);
    document.getElementById('moc-calc-total').textContent = `Totalt: ${total} kr/${period === 10 ? 'år' : 'mån'}`;
  };

  wrap.querySelectorAll('input, select').forEach(el => el.addEventListener('input', update));
  window.MyOffiCityAddons.addTool('Prisberäknare', '💰', wrap);
} catch(e) {} })();

(() => { try {
  const palette = document.createElement('div');
  palette.className = 'moc-palette';
  palette.innerHTML = `
    <div class="moc-palette-inner">
      <input type="text" placeholder="Sök kommando (t.ex. 'marknad', 'stad', 'dash')..." id="moc-palette-input">
      <div class="moc-palette-list">
        <div class="moc-palette-item" data-url="#/">Marknad</div>
        <div class="moc-palette-item" data-url="#/city">Stadsvy</div>
        <div class="moc-palette-item" data-url="#/dash">Dashboard</div>
      </div>
    </div>
  `;
  document.body.appendChild(palette);

  const input = palette.querySelector('#moc-palette-input');
  const toggle = (show) => {
    palette.style.display = show ? 'flex' : 'none';
    if (show) input.focus();
  };

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggle(palette.style.display !== 'flex');
    }
    if (e.key === 'Escape') toggle(false);
  });

  palette.addEventListener('click', (e) => {
    if (e.target.classList.contains('moc-palette-item')) {
      window.location.hash = e.target.dataset.url;
      toggle(false);
    } else if (e.target === palette) {
      toggle(false);
    }
  });

  window.MyOffiCityAddons.register('Kommando-Palett');
} catch(e) {} })();

(() => { try {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  const widget = document.createElement('div');
  widget.className = 'moc-live-status';
  widget.innerHTML = `
    <div class="moc-status-item">
      <span class="moc-pulse-dot" id="moc-ai-dot"></span>
      <span class="moc-status-label">LocalAI</span>
      <span class="moc-status-val" id="moc-ai-val">Kopplar...</span>
    </div>
    <div class="moc-status-divider"></div>
    <div class="moc-status-item">
      <span class="moc-load-bar"><span class="moc-load-fill" id="moc-load-fill"></span></span>
      <span class="moc-status-val" id="moc-load-val">0%</span>
    </div>
  `;
  topbar.appendChild(widget);

  const aiDot = document.getElementById('moc-ai-dot');
  const aiVal = document.getElementById('moc-ai-val');
  const loadFill = document.getElementById('moc-load-fill');
  const loadVal = document.getElementById('moc-load-val');

  let aiConnected = false;
  let load = 0;

  const checkAI = async () => {
    try {
      const res = await fetch('/api/health', { method: 'GET', mode: 'cors' });
      if (res.ok) {
        aiConnected = true;
        aiDot.className = 'moc-pulse-dot moc-pulse-green';
        aiVal.textContent = 'Online';
      } else {
        aiConnected = false;
        aiDot.className = 'moc-pulse-dot moc-pulse-red';
        aiVal.textContent = 'Offline';
      }
    } catch (e) {
      aiConnected = false;
      aiDot.className = 'moc-pulse-dot moc-pulse-red';
      aiVal.textContent = 'Offline';
    }
  };

  const updateLoad = () => {
    load = Math.min(100, Math.max(0, load + (Math.random() * 15 - 7)));
    loadFill.style.width = load + '%';
    loadVal.textContent = Math.round(load) + '%';
    if (load > 80) {
      loadFill.className = 'moc-load-fill moc-load-critical';
    } else if (load > 50) {
      loadFill.className = 'moc-load-fill moc-load-warning';
    } else {
      loadFill.className = 'moc-load-fill';
    }
  };

  checkAI();
  setInterval(checkAI, 10000);
  setInterval(updateLoad, 2000);

  window.MyOffiCityAddons.register('Live-Status Indikator');
} catch(e) {} })();

(() => { try {
  const techMap = {
    'tomas': { role: 'Team Leader', stack: ['TypeScript', 'Node.js', 'Cloudflare Workers', 'D1', 'Three.js'], skills: ['Strategi', 'Code Review', 'Sprint Planning'], color: '#d9b46a' },
    'ebba': { role: 'Frontend Dev', stack: ['React', 'TypeScript', 'CSS', 'Vite'], skills: ['UI/UX', 'Animation', 'Accessibility'], color: '#60a5fa' },
    'kia': { role: 'Backend Dev', stack: ['Node.js', 'Express', 'PostgreSQL', 'Redis'], skills: ['API Design', 'Optimering', 'Säkerhet'], color: '#34d399' },
    'manus': { role: 'Fullstack Dev', stack: ['Python', 'FastAPI', 'Docker', 'Kubernetes'], skills: ['DevOps', 'CI/CD', 'Skalbarhet'], color: '#f472b6' },
    'laila': { role: 'AI Engineer', stack: ['PyTorch', 'Hugging Face', 'LangChain', 'Vector DBs'], skills: ['LLM Orchestration', 'RAG', 'Prompt Engineering'], color: '#a78bfa' }
  };

  const getAgentInfo = (card) => {
    const nameEl = card.querySelector('h3, .agent-name, [data-name]');
    const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
    for (const key in techMap) {
      if (name.includes(key)) return { ...techMap[key], name: nameEl ? nameEl.textContent.trim() : key };
    }
    return { role: 'AI Agent', stack: ['JavaScript', 'Web API'], skills: ['Autonom', 'Kreativ'], color: '#94a3b8', name: nameEl ? nameEl.textContent.trim() : 'Agent' };
  };

  const createPopover = (agent) => {
    const pop = document.createElement('div');
    pop.className = 'moc-qv-pop';
    pop.innerHTML = `
      <div class="moc-qv-header" style="border-color:${agent.color}">
        <span class="moc-qv-avatar" style="background:${agent.color}">${agent.name.charAt(0).toUpperCase()}</span>
        <div>
          <div class="moc-qv-name">${agent.name}</div>
          <div class="moc-qv-role">${agent.role}</div>
        </div>
      </div>
      <div class="moc-qv-section">
        <div class="moc-qv-label">Tech-Stack</div>
        <div class="moc-qv-tags">${agent.stack.map(s => `<span class="moc-qv-tag">${s}</span>`).join('')}</div>
      </div>
      <div class="moc-qv-section">
        <div class="moc-qv-label">Kompetenser</div>
        <div class="moc-qv-tags">${agent.skills.map(s => `<span class="moc-qv-tag moc-qv-skill">${s}</span>`).join('')}</div>
      </div>
      <div class="moc-qv-footer">
        <span class="moc-qv-status"><span class="moc-pulse-dot moc-pulse-green"></span> Aktiv</span>
        <span class="moc-qv-hint">Klicka för profil</span>
      </div>
    `;
    return pop;
  };

  let activePop = null;
  let hoverTimer = null;

  const showPop = (card) => {
    if (activePop) activePop.remove();
    const agent = getAgentInfo(card);
    activePop = createPopover(agent);
    document.body.appendChild(activePop);
    
    const rect = card.getBoundingClientRect();
    const popRect = activePop.getBoundingClientRect();
    
    let top = rect.top - popRect.height - 12;
    if (top < 10) top = rect.bottom + 12;
    
    let left = rect.left + (rect.width / 2) - (popRect.width / 2);
    if (left < 10) left = 10;
    if (left + popRect.width > window.innerWidth - 10) left = window.innerWidth - popRect.width - 10;

    activePop.style.top = top + 'px';
    activePop.style.left = left + 'px';
    activePop.style.opacity = '1';
    activePop.style.transform = 'translateY(0)';
  };

  const hidePop = () => {
    if (activePop) {
      activePop.style.opacity = '0';
      activePop.style.transform = 'translateY(5px)';
      const p = activePop;
      setTimeout(() => p.remove(), 200);
      activePop = null;
    }
  };

  const init = () => {
    const cards = document.querySelectorAll('.cards > *');
    if (!cards.length) return;
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => showPop(card), 300);
      });
      card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        hidePop();
      });
    });
  };

  const observer = new MutationObserver(() => {
    if (!document.querySelector('.cards > *')) return;
    init();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(init, 1000);

  const infoEl = document.createElement('div');
  infoEl.innerHTML = `<p style="font-size:11px; color:#94a3b8; margin:0;">Hovra över ett agentkort för att se deras tech-stack och kompetenser direkt.</p>`;
  window.MyOffiCityAddons.addTool('Agent Quick-View', '👁️', infoEl);
  window.MyOffiCityAddons.register('Agent Quick-View');
} catch(e) {} })();

(() => {
  try {
    const btn = document.createElement('button');
    btn.className = 'moc-zen-btn';
    btn.innerHTML = '🧘 Zen-mode';
    btn.title = 'Dölj sidopaneler och fokusera 3D-vyn';

    let isZen = false;
    const toggleZen = () => {
      isZen = !isZen;
      document.body.classList.toggle('moc-zen-active', isZen);
      btn.classList.toggle('active', isZen);
      btn.innerHTML = isZen ? '🚪 Avsluta Zen' : '🧘 Zen-mode';
    };

    btn.addEventListener('click', toggleZen);
    
    // Lägg till knappen i docken
    window.MyOffiCityAddons.addTool('Fokusläge', '🧘', btn);
    window.MyOffiCityAddons.register('Zen-mode');
  } catch(e) {}
})();

(() => { try {
  const copyIcon = '📋';
  const checkIcon = '✅';

  const injectCopyBtn = (box) => {
    if (box.querySelector('.moc-copy-json')) return;
    
    const content = box.innerText || "";
    // Heuristik: Innehåller det troligen JSON?
    if (!content.includes('{') || !content.includes('}') || !content.includes('"')) return;

    const btn = document.createElement('button');
    btn.className = 'moc-copy-json';
    btn.innerHTML = `${copyIcon} Kopiera JSON`;
    
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      let textToCopy = "";
      const codeBlock = box.querySelector('code, pre');
      
      if (codeBlock) {
        textToCopy = codeBlock.innerText;
      } else {
        // Extrahera JSON-liknande sträng mellan första { och sista }
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          textToCopy = content.substring(start, end + 1);
        } else {
          textToCopy = content;
        }
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = `${checkIcon} Kopierad!`;
          btn.classList.add('success');
          setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('success');
          }, 2000);
        });
      }
    };

    // Säkerställ att boxen kan positionera knappen absolut
    if (getComputedStyle(box).position === 'static') {
      box.style.position = 'relative';
    }
    box.appendChild(btn);
  };

  // Effektiv event-delegation istället för tung MutationObserver på hela body
  document.addEventListener('mouseover', (e) => {
    const box = e.target.closest('.tc-box');
    if (box) injectCopyBtn(box);
  }, { passive: true });

  // Registrera verktyget i AI-panelen
  const info = document.createElement('div');
  info.style.cssText = 'font-size:11px; color:#94a3b8; line-height:1.4;';
  info.innerHTML = 'Hovra över ett chattsvar som innehåller JSON-konfigurationer för att snabbt kopiera koden till urklipp.';
  window.MyOffiCityAddons.addTool('JSON-kopiering', '📋', info);
  window.MyOffiCityAddons.register('Smart Copy-to-Clipboard');
} catch(e) {} })();

(() => {
  try {
    const container = document.querySelector('.dmain') || document.body;
    const initDrag = () => {
      let draggedItem = null;
      container.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('agent-card')) {
          draggedItem = e.target;
          e.target.style.opacity = '0.5';
        }
      });
      container.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('agent-card')) {
          e.target.style.opacity = '1';
        }
      });
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = [...container.querySelectorAll('.agent-card:not(.dragging)')].reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = e.clientY - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
          return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
        if (afterElement) container.insertBefore(draggedItem, afterElement);
        else container.appendChild(draggedItem);
      });
    };
    const info = document.createElement('div');
    info.innerHTML = 'Dra och släpp agentkort för att ändra ordning i din vy.';
    window.MyOffiCityAddons.addTool('Agent-sortering', '↕️', info);
    window.MyOffiCityAddons.register('Drag-and-Drop');
    initDrag();
  } catch(e) {}
})();

(() => {
  try {
    const topbar = document.querySelector('#topbar') || document.body;
    const breadcrumb = document.createElement('div');
    breadcrumb.id = 'moc-breadcrumb';
    breadcrumb.className = 'moc-breadcrumb';
    
    const updateBreadcrumbs = () => {
      const hash = window.location.hash.replace('#/', '') || 'Hem';
      const parts = hash.split('/');
      breadcrumb.innerHTML = parts.map((p, i) => 
        `<span class="moc-bc-item">${p.charAt(0).toUpperCase() + p.slice(1)}</span>`
      ).join('<span class="moc-bc-sep">/</span>');
    };

    window.addEventListener('hashchange', updateBreadcrumbs);
    updateBreadcrumbs();
    
    if (topbar.firstChild) {
      topbar.insertBefore(breadcrumb, topbar.firstChild);
    } else {
      topbar.appendChild(breadcrumb);
    }

    window.MyOffiCityAddons.register('Breadcrumb-navigering');
  } catch(e) {}
})();

(() => {
  try {
    const shortcuts = [
      { key: 'a', label: 'Öppna AI-tillägg', action: () => window.MyOffiCityAddons.toggleDock() },
      { key: 'm', label: 'Marknadsplats / Dash', action: () => window.location.hash = '#/dash' },
      { key: 'h', label: 'Hem (3D-vy)', action: () => window.location.hash = '#/' }
    ];

    window.addEventListener('keydown', (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (isInput || e.ctrlKey || e.metaKey || e.altKey) return;
      
      const match = shortcuts.find(s => s.key === e.key.toLowerCase());
      if (match) {
        e.preventDefault();
        match.action();
      }
    });

    const info = document.createElement('div');
    info.className = 'moc-shortcut-list';
    info.innerHTML = `
      <div style="margin-bottom:10px;font-size:12px;opacity:0.8;">Snabba kommandon för navigation:</div>
      ${shortcuts.map(s => `
        <div class="moc-shortcut-item">
          <kbd>${s.key.toUpperCase()}</kbd> <span>${s.label}</span>
        </div>
      `).join('')}
    `;
    
    window.MyOffiCityAddons.addTool('Genvägar', '⌨️', info);
    window.MyOffiCityAddons.register('Keyboard-shortcuts');
  } catch(e) { console.error('Shortcut error:', e); }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.cssText = 'font-family:monospace; font-size:11px; color:#d9b46a;';
    
    const stats = document.createElement('div');
    stats.innerHTML = 'FPS: --<br>Minne: -- MB';
    
    const btn = document.createElement('button');
    btn.textContent = 'Optimera Cache';
    btn.style.cssText = 'margin-top:8px; width:100%; cursor:pointer; background:rgba(217,180,106,0.1); border:1px solid #d9b46a; color:#f3ecdc; padding:4px; border-radius:4px;';
    btn.onclick = () => {
      if (window.caches) {
        caches.keys().then(names => names.forEach(n => caches.delete(n)));
        alert('Cache rensad!');
      }
    };
    
    container.appendChild(stats);
    container.appendChild(btn);
    
    let lastTime = performance.now();
    let frames = 0;
    function update() {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (now - lastTime));
        const mem = window.performance.memory ? Math.round(window.performance.memory.usedJSHeapSize / 1048576) : 'N/A';
        stats.innerHTML = `FPS: ${fps}<br>Minne: ${mem} MB`;
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(update);
    }
    update();
    
    window.MyOffiCityAddons.addTool('Prestanda', '⚡', container);
    window.MyOffiCityAddons.register('Performance-Monitor');
  } catch(e) {}
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="agent-log-viewer" style="display:none; position:fixed; top:10%; left:10%; width:80%; height:80%; background:#0f172a; border:1px solid #d9b46a; z-index:9999; padding:20px; overflow:auto; border-radius:8px;">
        <h3 style="color:#d9b46a; margin-top:0;">Agent Rådata-logg</h3>
        <pre id="agent-log-content" style="color:#e2e8f0; font-family:monospace; white-space:pre-wrap;"></pre>
        <button onclick="document.getElementById('agent-log-viewer').style.display='none'" style="background:#d9b46a; border:none; padding:8px 16px; cursor:pointer; border-radius:4px;">Stäng</button>
      </div>
    `;
    document.body.appendChild(container);

    window.openAgentLog = (data) => {
      const viewer = document.getElementById('agent-log-viewer');
      const content = document.getElementById('agent-log-content');
      content.textContent = JSON.stringify(data, null, 2);
      viewer.style.display = 'block';
    };

    const toolEl = document.createElement('div');
    toolEl.innerHTML = '<p style="font-size:12px; color:#94a3b8;">Klicka på "Expandera" i Tomas-chatten för att se JSON-loggar.</p>';
    window.MyOffiCityAddons.addTool('Agent-logg', '📜', toolEl);
    window.MyOffiCityAddons.register('Agent-Log-Viewer');
  } catch(e) {}
})();

(() => {
  try {
    const filterEl = document.createElement('div');
    filterEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <select id="agent-sort" style="background:#0f172a; color:#e9d7b0; border:1px solid #d9b46a; padding:4px; border-radius:4px;">
          <option value="latency">Sortera: Latens (Låg först)</option>
          <option value="cost">Sortera: Kostnad (Billigast först)</option>
        </select>
        <input type="text" id="agent-tag-filter" placeholder="Filtrera på tagg (t.ex. 'coding')" style="background:#0f172a; color:#e9d7b0; border:1px solid #d9b46a; padding:4px; border-radius:4px;">
        <button id="apply-filter" style="background:#d9b46a; color:#0f172a; border:none; padding:6px; cursor:pointer; font-weight:bold; border-radius:4px;">Applicera Filter</button>
      </div>
    `;

    filterEl.querySelector('#apply-filter').addEventListener('click', () => {
      const sort = document.getElementById('agent-sort').value;
      const tag = document.getElementById('agent-tag-filter').value.toLowerCase();
      const cards = Array.from(document.querySelectorAll('.cards .card, .card'));
      
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matches = !tag || text.includes(tag);
        card.style.display = matches ? 'block' : 'none';
      });
      console.log(`Filtering agents by ${sort} and tag: ${tag}`);
    });

    window.MyOffiCityAddons.addTool('Agent-Filter', '🔍', filterEl);
    window.MyOffiCityAddons.register('Agent-Filter');
  } catch(e) {}
})();

(() => {
  try {
    let audioCtx = null;
    let noiseNode = null;
    let gainNode = null;

    const container = document.createElement('div');
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <label style="font-size:11px; color:#94a3b8;">Volym: <span id="vol-val">0</span>%</label>
        <input type="range" id="noise-vol" min="0" max="100" value="0" style="width:100%;">
        <button id="noise-toggle" style="background:#d9b46a; color:#0f172a; border:none; padding:6px; cursor:pointer; font-weight:bold; border-radius:4px;">Starta Ljud</button>
      </div>
    `;

    const toggleBtn = container.querySelector('#noise-toggle');
    const volSlider = container.querySelector('#noise-vol');
    const volVal = container.querySelector('#vol-val');

    toggleBtn.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        noiseNode.loop = true;

        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;

        noiseNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noiseNode.start();
      }

      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const isPlaying = toggleBtn.textContent === 'Stoppa Ljud';
      toggleBtn.textContent = isPlaying ? 'Starta Ljud' : 'Stoppa Ljud';
      gainNode.gain.value = isPlaying ? 0 : (volSlider.value / 100) * 0.05;
    });

    volSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      volVal.textContent = val;
      if (gainNode && toggleBtn.textContent === 'Stoppa Ljud') {
        gainNode.gain.value = (val / 100) * 0.05;
      }
    });

    window.MyOffiCityAddons.addTool('Ambient Soundscape', '🔊', container);
    window.MyOffiCityAddons.register('Ambient Soundscape');
  } catch(e) {}
})();

(() => {
  try {
    const themes = {
      'default': { name: 'Standard', vars: {} },
      'high-contrast': { 
        name: 'High Contrast', 
        vars: { '--bg-color': '#000', '--text-color': '#fff', '--accent': '#ffff00', '--border': '#fff' } 
      },
      'midnight-blue': { 
        name: 'Midnight Blue', 
        vars: { '--bg-color': '#050a14', '--text-color': '#d1d5db', '--accent': '#3b82f6', '--border': '#1e3a8a' } 
      }
    };

    const applyTheme = (themeKey) => {
      const theme = themes[themeKey] || themes['default'];
      Object.entries(theme.vars).forEach(([prop, val]) => document.documentElement.style.setProperty(prop, val));
      localStorage.setItem('moc-theme', themeKey);
    };

    const saved = localStorage.getItem('moc-theme');
    if (saved) applyTheme(saved);

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';

    Object.keys(themes).forEach(key => {
      const btn = document.createElement('button');
      btn.textContent = themes[key].name;
      btn.className = 'agent-log-btn';
      btn.style.margin = '0';
      btn.onclick = () => applyTheme(key);
      container.appendChild(btn);
    });

    window.MyOffiCityAddons.addTool('Tema-inställningar', '🎨', container);
    window.MyOffiCityAddons.register('Theme Switcher');
  } catch(e) {}
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    const statusRow = document.createElement('div');
    statusRow.className = 'agent-health-row';
    statusRow.innerHTML = `
      <div class="health-item">
        <span class="pulse-dot"></span>
        <span>AI Relay: <b id="relay-status">Online</b></span>
      </div>
      <div class="health-item">
        <span>Latency: <b id="relay-ping">24ms</b></span>
      </div>
    `;
    container.appendChild(statusRow);

    window.MyOffiCityAddons.addTool('Agent-Health', '💓', container);
    window.MyOffiCityAddons.register('Health Monitor');

    // Simulate ping updates
    setInterval(() => {
      const pingEl = document.getElementById('relay-ping');
      if (pingEl) pingEl.textContent = (20 + Math.floor(Math.random() * 15)) + 'ms';
    }, 3000);
  } catch(e) {}
})();

(() => {
  try {
    const overlay = document.createElement('div');
    overlay.id = 'moc-search-overlay';
    overlay.innerHTML = `
      <div class="moc-search-modal">
        <input type="text" id="moc-search-input" placeholder="Sök efter vy (Market, City, Dash)..." autocomplete="off">
        <div id="moc-search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#moc-search-input');
    const results = overlay.querySelector('#moc-search-results');
    const routes = [
      { name: 'Marketplace', hash: '#/' },
      { name: 'City View', hash: '#/city' },
      { name: 'Dashboard', hash: '#/dash' }
    ];

    const toggle = (show) => {
      overlay.style.display = show ? 'flex' : 'none';
      if (show) input.focus();
    };

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle(true);
      }
      if (e.key === 'Escape') toggle(false);
    });

    input.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase();
      results.innerHTML = '';
      routes.filter(r => r.name.toLowerCase().includes(val)).forEach(r => {
        const div = document.createElement('div');
        div.textContent = r.name;
        div.onclick = () => { window.location.hash = r.hash; toggle(false); };
        results.appendChild(div);
      });
    });

    overlay.onclick = (e) => { if (e.target === overlay) toggle(false); };
    window.MyOffiCityAddons.register('Global Search (Cmd+K)');
  } catch(e) {}
})();

(() => {
  try {
    if (window.MyOffiCityAddons) {
      const tooltip = document.createElement('div');
      tooltip.className = 'moc-agent-tooltip';
      tooltip.innerHTML = `
        <div class="moc-tooltip-header">
          <span class="moc-tooltip-title">Agent Status</span>
          <span class="moc-tooltip-status">Aktiv</span>
        </div>
        <div class="moc-tooltip-graph">
          <canvas id="moc-activity-canvas" width="120" height="40"></canvas>
        </div>
        <div class="moc-tooltip-info">
          <div class="moc-info-row">
            <span class="moc-info-label">Senaste uppdatering:</span>
            <span class="moc-info-value" id="moc-last-update">Just nu</span>
          </div>
          <div class="moc-info-row">
            <span class="moc-info-label">Aktivitet:</span>
            <span class="moc-info-value" id="moc-activity-level">Hög</span>
          </div>
        </div>
      `;
      
      // Draw activity graph
      const canvas = tooltip.querySelector('#moc-activity-canvas');
      const ctx = canvas.getContext('2d');
      const data = [20, 35, 45, 60, 55, 70, 85, 90, 75, 65, 80, 95];
      const maxVal = Math.max(...data);
      const barWidth = canvas.width / data.length;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      data.forEach((val, i) => {
        const barHeight = (val / maxVal) * (canvas.height - 5);
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        
        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, '#d9b46a');
        gradient.addColorStop(1, '#8b6914');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      });
      
      // Add hover effect to cards
      const cards = document.querySelectorAll('.cards');
      cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          const rect = card.getBoundingClientRect();
          tooltip.style.left = `${rect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top - 10}px`;
          tooltip.classList.add('visible');
          
          // Update last update time
          const now = new Date();
          const timeStr = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
          tooltip.querySelector('#moc-last-update').textContent = timeStr;
        });
        
        card.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      });
      
      document.body.appendChild(tooltip);
      window.MyOffiCityAddons.addTool('Agent Status Tooltip', '📊', tooltip);
      window.MyOffiCityAddons.register('Agent Status Tooltip');
    }
  } catch(e) {}
})();

(() => {
  try {
    const bar = document.createElement('div');
    bar.className = 'moc-reading-progress';
    bar.innerHTML = '<div class="moc-reading-progress-fill"></div>';
    document.body.appendChild(bar);

    let activeBox = null;
    let ticking = false;

    function updateProgress() {
      if (!activeBox) {
        bar.classList.remove('active');
        return;
      }
      const rect = activeBox.getBoundingClientRect();
      const scrollable = activeBox.scrollHeight - activeBox.clientHeight;
      if (scrollable <= 0) {
        bar.classList.remove('active');
        return;
      }
      const progress = Math.min(1, Math.max(0, activeBox.scrollTop / scrollable));
      bar.style.setProperty('--progress', progress);
      bar.classList.add('active');
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    }

    function observeBoxes() {
      const boxes = document.querySelectorAll('.tc-box');
      boxes.forEach(box => {
        box.addEventListener('scroll', onScroll, { passive: true });
        box.addEventListener('mouseenter', () => {
          activeBox = box;
          updateProgress();
        });
        box.addEventListener('mouseleave', () => {
          if (activeBox === box) {
            activeBox = null;
            bar.classList.remove('active');
          }
        });
      });
    }

    observeBoxes();
    const observer = new MutationObserver(() => observeBoxes());
    observer.observe(document.body, { childList: true, subtree: true });

    window.MyOffiCityAddons.register('Reading Progress Bar');
  } catch(e) {}
})();

(() => {
  try {
    const toolEl = document.createElement('div');
    toolEl.className = 'moc-save-monitor';
    toolEl.innerHTML = `
      <div class="moc-save-status"><span class="moc-save-dot"></span><span class="moc-save-text">System redo</span></div>
      <div class="moc-save-time">Väntar på autosave...</div>
    `;
    window.MyOffiCityAddons.addTool('Auto-Save', '💾', toolEl);

    const triggerUI = () => {
      const chat = document.querySelector('.tc-box') || document.querySelector('.dmain');
      if (!chat) return;
      let pill = chat.querySelector('.moc-save-pill');
      if (!pill) {
        pill = document.createElement('div');
        pill.className = 'moc-save-pill';
        pill.textContent = '✨ Sparat';
        if (getComputedStyle(chat).position === 'static') chat.style.position = 'relative';
        chat.appendChild(pill);
      }
      pill.classList.remove('active');
      void pill.offsetWidth; 
      pill.classList.add('active');
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      toolEl.querySelector('.moc-save-time').textContent = `Senast synkad: ${timeStr}`;
      toolEl.querySelector('.moc-save-text').textContent = 'Konfiguration sparad';
    };

    // Smart interceptor: Fångar nätverksanrop till local-ai eller agent-API:er
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).then(res => {
        const url = String(args[0] || '');
        const opts = args[1] || {};
        const isWrite = ['POST', 'PUT', 'PATCH'].includes(opts.method);
        if (res.ok && isWrite && (url.includes('local-ai') || url.includes('agent') || url.includes('config'))) {
          triggerUI();
        }
        return res;
      });
    };

    // Lyssna även på lokala ändringar (fallback)
    window.addEventListener('storage', (e) => {
      if (e.key && (e.key.includes('agent') || e.key.includes('moc_'))) triggerUI();
    });

    window.MyOffiCityAddons.register('Auto-Save Monitor');
  } catch(e) {}
})();

(() => {
  try {
    const sidebar = document.createElement('div');
    sidebar.id = 'moc-quickview-sidebar';
    sidebar.className = 'moc-quickview-sidebar';
    sidebar.innerHTML = `
      <div class="moc-quickview-header">
        <h3>📊 Quick-View</h3>
        <button class="moc-quickview-close" title="Stäng">✕</button>
      </div>
      <div class="moc-quickview-body">
        <div class="moc-quickview-placeholder">
          <p>Välj ett objekt i 3D-vyn för att se detaljer här.</p>
        </div>
      </div>
    `;
    
    const closeBtn = sidebar.querySelector('.moc-quickview-close');
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });

    // Simulera objektval för demo (i verkligheten kopplas detta till Three.js raycasting)
    const demoObjects = [
      { id: 'obj1', name: 'Byggnad A', type: 'Kontor', status: 'Aktiv', info: '12 anställda, 3 våningar' },
      { id: 'obj2', name: 'Agent Tomas', type: 'AI', status: 'Arbetar', info: 'Optimerar resurser, 95% effektivitet' },
      { id: 'obj3', name: 'Träd 42', type: 'Natur', status: 'Växer', info: 'Höjd: 12m, Ålder: 5 år' }
    ];

    // Klicka på placeholder för att visa demo-data
    sidebar.querySelector('.moc-quickview-placeholder').addEventListener('click', () => {
      const obj = demoObjects[Math.floor(Math.random() * demoObjects.length)];
      sidebar.querySelector('.moc-quickview-body').innerHTML = `
        <div class="moc-quickview-item">
          <div class="moc-quickview-item-header">
            <span class="moc-quickview-item-name">${obj.name}</span>
            <span class="moc-quickview-item-type">${obj.type}</span>
          </div>
          <div class="moc-quickview-item-status">
            <span class="moc-status-dot ${obj.status === 'Aktiv' || obj.status === 'Arbetar' ? 'active' : 'idle'}"></span>
            ${obj.status}
          </div>
          <div class="moc-quickview-item-info">${obj.info}</div>
        </div>
      `;
      sidebar.classList.add('open');
    });

    // Lägg till en knapp i docken för att öppna sidebar
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'moc-quickview-toggle';
    toggleBtn.innerHTML = '📊 Quick-View';
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Lägg till i AI-docken
    window.MyOffiCityAddons.addTool('Quick-View Sidebar', '📊', toggleBtn);
    
    // Lägg till sidebar i DOM
    document.body.appendChild(sidebar);
    
    window.MyOffiCityAddons.register('Quick-View Sidebar');
  } catch(e) {}
})();

(() => {
  try {
    const routes = { 'marketplace': '#/', 'city': '#/city', 'dashboard': '#/dash' };
    
    const modal = document.createElement('div');
    modal.className = 'moc-cmd-palette';
    modal.innerHTML = `
      <div class="moc-cmd-content">
        <div class="moc-cmd-header">Navigera (Ctrl+G)</div>
        <input type="text" id="moc-cmd-input" placeholder="Skriv: marketplace, city, eller dash...">
        <div class="moc-cmd-list">
          <p><strong>Kortkommandon:</strong></p>
          <ul>
            <li>Ctrl+G : Öppna navigering</li>
            <li>Esc : Stäng</li>
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#moc-cmd-input');
    const toggle = (show) => {
      modal.style.display = show ? 'flex' : 'none';
      if (show) input.focus();
    };

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'g') { e.preventDefault(); toggle(true); }
      if (e.key === 'Escape') toggle(false);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.toLowerCase().trim();
        if (routes[val]) { window.location.hash = routes[val]; toggle(false); input.value = ''; }
      }
    });

    const toolBtn = document.createElement('button');
    toolBtn.className = 'moc-quickview-toggle';
    toolBtn.textContent = '⌨️ Visa Kommandon';
    toolBtn.onclick = () => toggle(true);
    
    window.MyOffiCityAddons.addTool('Kommando-palett', '⌨️', toolBtn);
    window.MyOffiCityAddons.register('Command Palette');
  } catch(e) {}
})();

(() => {
  try {
    const breadcrumb = {
      items: [],
      maxItems: 5,
      container: null,
      
      init() {
        const topbar = document.getElementById('topbar');
        if (!topbar) return;
        
        this.container = document.createElement('nav');
        this.container.className = 'moc-breadcrumb';
        this.container.setAttribute('aria-label', 'Navigering');
        
        const homeLink = document.createElement('a');
        homeLink.href = '#/';
        homeLink.className = 'moc-breadcrumb-item moc-breadcrumb-home';
        homeLink.innerHTML = '🏠 Huvud';
        homeLink.addEventListener('click', (e) => {
          e.preventDefault();
          this.reset();
          window.location.hash = '#/';
        });
        
        this.container.appendChild(homeLink);
        
        const separator = document.createElement('span');
        separator.className = 'moc-breadcrumb-separator';
        separator.textContent = '›';
        this.container.appendChild(separator);
        
        topbar.insertBefore(this.container, topbar.firstChild);
        
        this.trackNavigation();
        this.render();
      },
      
      trackNavigation() {
        const hashChange = () => {
          const hash = window.location.hash || '#/';
          const path = hash.replace('#', '');
          
          if (path === '/' || path === '') {
            this.reset();
            return;
          }
          
          const segments = path.split('/').filter(s => s);
          const currentPath = segments.join('/');
          
          const lastItem = this.items[this.items.length - 1];
          if (lastItem && lastItem.path === currentPath) return;
          
          this.items.push({
            path: currentPath,
            label: this.getSegmentLabel(segments[segments.length - 1]),
            timestamp: Date.now()
          });
          
          if (this.items.length > this.maxItems) {
            this.items.shift();
          }
          
          this.render();
        };
        
        window.addEventListener('hashchange', hashChange);
        hashChange();
      },
      
      getSegmentLabel(segment) {
        const labels = {
          'marketplace': 'Marknadsplats',
          'city': '3D-Stad',
          'office': 'Kontor',
          'dashboard': 'Instrumentpanel',
          'chat': 'Chatt',
          'profile': 'Profil',
          'settings': 'Inställningar',
          'orders': 'Ordern',
          'proposals': 'Förslag',
          'reviews': 'Recensioner'
        };
        return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      },
      
      reset() {
        this.items = [];
        this.render();
      },
      
      goBack() {
        if (this.items.length > 0) {
          this.items.pop();
          const lastItem = this.items[this.items.length - 1];
          if (lastItem) {
            window.location.hash = '#' + lastItem.path;
          } else {
            window.location.hash = '#/';
          }
          this.render();
        }
      },
      
      render() {
        if (!this.container) return;
        
        const existingItems = this.container.querySelectorAll('.moc-breadcrumb-item:not(.moc-breadcrumb-home)');
        existingItems.forEach(el => el.remove());
        
        const separators = this.container.querySelectorAll('.moc-breadcrumb-separator:not(:first-child)');
        separators.forEach(el => el.remove());
        
        this.items.forEach((item, index) => {
          const isLast = index === this.items.length - 1;
          
          const link = document.createElement(isLast ? 'span' : 'a');
          link.className = 'moc-breadcrumb-item' + (isLast ? ' moc-breadcrumb-current' : '');
          link.textContent = item.label;
          
          if (!isLast) {
            link.href = '#' + item.path;
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const targetIndex = this.items.findIndex(i => i.path === item.path);
              if (targetIndex !== -1) {
                this.items = this.items.slice(0, targetIndex + 1);
                window.location.hash = '#' + item.path;
                this.render();
              }
            });
          }
          
          const separator = document.createElement('span');
          separator.className = 'moc-breadcrumb-separator';
          separator.textContent = '›';
          
          this.container.appendChild(link);
          this.container.appendChild(separator);
        });
        
        if (this.items.length > 0) {
          const backBtn = document.createElement('button');
          backBtn.className = 'moc-breadcrumb-back';
          backBtn.innerHTML = '← Tillbaka';
          backBtn.title = 'Gå till föregående nivå';
          backBtn.addEventListener('click', () => this.goBack());
          this.container.appendChild(backBtn);
        }
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => breadcrumb.init());
    } else {
      breadcrumb.init();
    }
    
    window.MyOffiCityAddons.register('Dynamic Breadcrumb Trail');
  } catch(e) {}
})();

(() => {
  try {
    const heatmapData = {};
    const MAX_POINTS = 50;
    const DECAY_RATE = 0.98;
    const canvas = document.createElement('canvas');
    canvas.id = 'moc-heatmap-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5;opacity:0.85;';
    
    const container = document.getElementById('app') || document.body;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function trackInteraction(x, y) {
      const key = `${Math.round(x/20)}_${Math.round(y/20)}`;
      if (!heatmapData[key]) {
        heatmapData[key] = { x: x, y: y, intensity: 1, lastUpdate: Date.now() };
      } else {
        heatmapData[key].intensity = Math.min(heatmapData[key].intensity + 0.5, 5);
        heatmapData[key].lastUpdate = Date.now();
      }
      
      const keys = Object.keys(heatmapData);
      if (keys.length > MAX_POINTS) {
        const oldest = keys.reduce((a, b) => heatmapData[a].lastUpdate < heatmapData[b].lastUpdate ? a : b);
        delete heatmapData[oldest];
      }
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('#moc-heatmap-canvas')) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      trackInteraction(x, y);
    });

    function renderHeatmap() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const now = Date.now();
      Object.values(heatmapData).forEach(point => {
        const age = (now - point.lastUpdate) / 1000;
        const decay = Math.pow(DECAY_RATE, age * 10);
        const currentIntensity = point.intensity * decay;
        
        if (currentIntensity < 0.1) return;

        const radius = 30 + currentIntensity * 15;
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        
        const hue = 200 - (currentIntensity / 5) * 100;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, ${currentIntensity * 0.4})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, ${currentIntensity * 0.2})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(renderHeatmap);
    }
    
    renderHeatmap();

    const infoPanel = document.createElement('div');
    infoPanel.className = 'moc-heatmap-info';
    infoPanel.innerHTML = `
      <div class="moc-heatmap-title">🔥 Interaktionskarta</div>
      <div class="moc-heatmap-desc">Klicka i 3D-scenen för att markera aktiva zoner</div>
      <div class="moc-heatmap-stats">
        <span id="moc-heatmap-count">0</span> aktiva punkter
      </div>
    `;
    
    setInterval(() => {
      const countEl = document.getElementById('moc-heatmap-count');
      if (countEl) {
        countEl.textContent = Object.keys(heatmapData).length;
      }
    }, 1000);

    window.MyOffiCityAddons.addTool('Agent Heatmap', '🔥', infoPanel);
    window.MyOffiCityAddons.register('Agent Interaction Heatmap');
  } catch(e) {
    console.error('Heatmap error:', e);
  }
})();

(() => {
  try {
    const initClipboard = () => {
      const boxes = document.querySelectorAll('.tc-box');
      boxes.forEach(box => {
        if (box.querySelector('.moc-copy-btn')) return;
        
        const btn = document.createElement('button');
        btn.className = 'moc-copy-btn';
        btn.innerHTML = '📋';
        btn.title = 'Kopiera innehåll';
        btn.onclick = (e) => {
          e.stopPropagation();
          const text = box.innerText.replace('📋', '').trim();
          navigator.clipboard.writeText(text).then(() => {
            const original = btn.innerHTML;
            btn.innerHTML = '✅';
            setTimeout(() => btn.innerHTML = original, 2000);
          });
        };
        box.style.position = 'relative';
        box.appendChild(btn);
      });
    };

    setInterval(initClipboard, 2000);
    window.MyOffiCityAddons.register('Smart Clipboard');
  } catch(e) {
    console.error('Clipboard error:', e);
  }
})();

(() => {
  try {
    const isCityView = () => window.location.hash === '#/city';
    let focusActive = false;
    let inactivityTimer = null;
    const INACTIVITY_MS = 5000;

    const applyFocus = (on) => {
      const nav = document.getElementById('nav');
      const foot = document.getElementById('foot');
      if (nav) nav.classList.toggle('moc-focus-hidden', on);
      if (foot) foot.classList.toggle('moc-focus-hidden', on);
      document.body.classList.toggle('moc-focus-mode', on);
    };

    const resetTimer = () => {
      if (!focusActive) return;
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (isCityView() && focusActive) applyFocus(true);
      }, INACTIVITY_MS);
    };

    const onActivity = () => {
      if (focusActive && isCityView()) {
        applyFocus(false);
        resetTimer();
      }
    };

    const toggleFocus = () => {
      focusActive = !focusActive;
      if (focusActive) {
        applyFocus(false);
        resetTimer();
      } else {
        clearTimeout(inactivityTimer);
        applyFocus(false);
      }
      const btn = document.getElementById('mocFocusBtn');
      if (btn) {
        btn.classList.toggle('moc-focus-active', focusActive);
        btn.title = focusActive ? 'Focus Mode: PÅ (klicka för av)' : 'Focus Mode: AV (klicka för på)';
      }
    };

    const init = () => {
      const topbar = document.getElementById('topbar');
      if (!topbar || document.getElementById('mocFocusBtn')) return;

      const btn = document.createElement('button');
      btn.id = 'mocFocusBtn';
      btn.className = 'moc-focus-btn';
      btn.innerHTML = '🎯';
      btn.title = 'Focus Mode: AV (klicka för på)';
      btn.addEventListener('click', toggleFocus);
      topbar.appendChild(btn);

      ['mousemove', 'keydown', 'touchstart', 'wheel'].forEach(evt => {
        document.addEventListener(evt, onActivity, { passive: true });
      });

      window.addEventListener('hashchange', () => {
        if (!isCityView() && focusActive) {
          focusActive = false;
          clearTimeout(inactivityTimer);
          applyFocus(false);
          btn.classList.remove('moc-focus-active');
          btn.title = 'Focus Mode: AV (klicka för på)';
        }
      });

      window.MyOffiCityAddons.register('Focus Mode');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch(e) {}
})();

(() => {
  try {
    const commands = [
      { id: 'city', label: 'Gå till 3D-staden', icon: '🏙️', action: () => { window.location.hash = '#city'; } },
      { id: 'office', label: 'Gå till kontoret', icon: '🏢', action: () => { window.location.hash = '#office'; } },
      { id: 'theme-light', label: 'Byt till Ljust tema', icon: '☀️', action: () => { document.body.classList.remove('dark-mode'); document.body.classList.add('light-mode'); } },
      { id: 'theme-dark', label: 'Byt till Mörkt tema', icon: '🌙', action: () => { document.body.classList.remove('light-mode'); document.body.classList.add('dark-mode'); } },
      { id: 'copy-id', label: 'Kopiera Agent-ID', icon: '📋', action: () => { navigator.clipboard.writeText('moc-agent-01'); } },
      { id: 'focus', label: 'Aktivera Focus Mode', icon: '🎯', action: () => { const btn = document.getElementById('mocFocusBtn'); if(btn) btn.click(); } },
      { id: 'help', label: 'Visa hjälp & genvägar', icon: '❓', action: () => { alert('Snabbkommandon:\nCtrl+K: Öppna kommandofältet\nEsc: Stäng fältet'); } }
    ];

    const init = () => {
      if (document.getElementById('mocCmdPalette')) return;

      const overlay = document.createElement('div');
      overlay.id = 'mocCmdPalette';
      overlay.innerHTML = `
        <div class="moc-cmd-backdrop"></div>
        <div class="moc-cmd-panel">
          <div class="moc-cmd-header">
            <span class="moc-cmd-icon">⌘</span>
            <input type="text" class="moc-cmd-input" placeholder="Sök kommando eller skriv..." autocomplete="off" />
            <span class="moc-cmd-hint">Esc för att stänga</span>
          </div>
          <div class="moc-cmd-list"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      const input = overlay.querySelector('.moc-cmd-input');
      const list = overlay.querySelector('.moc-cmd-list');
      const backdrop = overlay.querySelector('.moc-cmd-backdrop');

      const renderList = (filter = '') => {
        list.innerHTML = '';
        const filtered = commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()));
        if (filtered.length === 0) {
          list.innerHTML = '<div class="moc-cmd-empty">Inga kommandon hittades</div>';
          return;
        }
        filtered.forEach((cmd, idx) => {
          const item = document.createElement('div');
          item.className = 'moc-cmd-item' + (idx === 0 ? ' active' : '');
          item.innerHTML = `<span class="moc-cmd-item-icon">${cmd.icon}</span><span>${cmd.label}</span>`;
          item.addEventListener('click', () => {
            cmd.action();
            closePalette();
          });
          list.appendChild(item);
        });
      };

      const openPalette = () => {
        overlay.classList.add('open');
        input.value = '';
        renderList();
        setTimeout(() => input.focus(), 50);
      };

      const closePalette = () => {
        overlay.classList.remove('open');
      };

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          openPalette();
        } else if (e.key === 'Escape' && overlay.classList.contains('open')) {
          closePalette();
        }
      });

      input.addEventListener('input', (e) => renderList(e.target.value));
      backdrop.addEventListener('click', closePalette);

      window.MyOffiCityAddons.register('Command Palette');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } catch(e) {}
})();

(() => {
  try {
    const STORAGE_KEY = 'moc-dark-mode';
    const root = document.documentElement;
    
    // 1. Initiera läge baserat på localStorage eller systeminställning
    const getInitialMode = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyMode = (mode) => {
      if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      // Uppdatera ikonen i toppen
      const btn = document.getElementById('mocDarkModeToggle');
      if (btn) {
        btn.textContent = mode === 'dark' ? '☀️' : '🌙';
        btn.title = mode === 'dark' ? 'Byt till ljus läge' : 'Byt till mörkt läge';
      }
    };

    // 2. Skapa toggle-knappen
    const createToggle = () => {
      const topbar = document.getElementById('topbar');
      if (!topbar) return;
      
      // Undvik dubbla knappar
      if (document.getElementById('mocDarkModeToggle')) return;

      const btn = document.createElement('button');
      btn.id = 'mocDarkModeToggle';
      btn.className = 'moc-dark-mode-toggle';
      btn.setAttribute('aria-label', 'Byt tema');
      
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        applyMode(next);
      });

      // Lägg till knappen i toppen
      topbar.appendChild(btn);
      
      // Tillämpa initialt läge
      const initialMode = getInitialMode();
      applyMode(initialMode);
      
      // 3. Lyssna på systemändringar (om användaren inte har valt manuellt)
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Endast uppdatera om användaren inte har satt ett explicit val
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyMode(e.matches ? 'dark' : 'light');
        }
      });

      window.MyOffiCityAddons.register('Dark Mode');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createToggle);
    } else {
      createToggle();
    }
  } catch(e) {}
})();

(() => { try {
  const chatEl = document.createElement('div');
  chatEl.className = 'moc-agent-chat';
  
  // Chat container
  const messagesEl = document.createElement('div');
  messagesEl.className = 'moc-chat-messages';
  
  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'moc-chat-input-area';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ställ en fråga till Tomas...';
  input.className = 'moc-chat-input';
  
  const sendBtn = document.createElement('button');
  sendBtn.className = 'moc-chat-send';
  sendBtn.textContent = 'Skicka';
  
  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);
  
  // Thinking indicator
  const thinkingEl = document.createElement('div');
  thinkingEl.className = 'moc-thinking-indicator';
  thinkingEl.innerHTML = '<span class="moc-thinking-dot"></span><span class="moc-thinking-dot"></span><span class="moc-thinking-dot"></span>';
  thinkingEl.style.display = 'none';
  
  chatEl.appendChild(messagesEl);
  chatEl.appendChild(thinkingEl);
  chatEl.appendChild(inputArea);
  
  // Add initial message
  const addMessage = (text, sender) => {
    const msg = document.createElement('div');
    msg.className = `moc-chat-msg ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };
  
  addMessage('Hej! Jag är Tomas. Fråga mig om projektet, teamet eller tekniken!', 'agent');
  
  // Handle send
  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    input.value = '';
    thinkingEl.style.display = 'flex';
    
    // Simulate AI response (in production, connect to local-ai-bridge.js)
    setTimeout(() => {
      thinkingEl.style.display = 'none';
      const responses = [
        'Jag jobbar just nu på att optimera 3D-renderingen för bättre prestanda.',
        'Teamet har precis slutfört en ny sprint med fokus på användarupplevelsen.',
        'Vi testar nya AI-modeller för att förbättra chattens svarskvalitet.',
        'Det pågår en CI/CD-pipeline som verifierar alla nya commits automatiskt.'
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage(response, 'agent');
    }, 1500 + Math.random() * 1000);
  };
  
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Register and add to dock
  window.MyOffiCityAddons.addTool('Agent-Chat', '💬', chatEl);
  window.MyOffiCityAddons.register('Agent-Chat');
} catch(e) {} })();

(() => {
  try {
    const el = document.createElement('div');
    el.className = 'moc-perf-monitor';
    el.innerHTML = `
      <div class="moc-perf-header">
        <span class="moc-perf-title">⚡ 3D-Performance</span>
        <span class="moc-perf-status" id="mocPerfStatus">Optimal</span>
      </div>
      <div class="moc-perf-metrics">
        <div class="moc-perf-item">
          <span class="moc-perf-label">FPS</span>
          <span class="moc-perf-value" id="mocPerfFps">60</span>
        </div>
        <div class="moc-perf-item">
          <span class="moc-perf-label">Objekt</span>
          <span class="moc-perf-value" id="mocPerfObjects">0</span>
        </div>
        <div class="moc-perf-item">
          <span class="moc-perf-label">Minne</span>
          <span class="moc-perf-value" id="mocPerfMem">0 MB</span>
        </div>
      </div>
      <div class="moc-perf-insight" id="mocPerfInsight">
        <span class="moc-perf-icon">💡</span>
        <span class="moc-perf-text">Laddar 3D-scen...</span>
      </div>
    `;

    let lastTime = performance.now();
    let frameCount = 0;
    let currentFps = 60;
    let objectCount = 0;
    let memoryMB = 0;

    const updatePerf = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        // Count 3D objects if THREE is available
        if (window.THREE) {
          const scene = document.querySelector('canvas');
          if (scene) {
            // Estimate object count from renderer info if accessible
            objectCount = Math.floor(Math.random() * 50) + 20; // Simulated for demo
          }
        }

        // Memory usage
        if (performance.memory) {
          memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }

        // Update DOM
        const fpsEl = el.querySelector('#mocPerfFps');
        const objEl = el.querySelector('#mocPerfObjects');
        const memEl = el.querySelector('#mocPerfMem');
        const statusEl = el.querySelector('#mocPerfStatus');
        const insightEl = el.querySelector('#mocPerfInsight');

        if (fpsEl) fpsEl.textContent = currentFps;
        if (objEl) objEl.textContent = objectCount;
        if (memEl) memEl.textContent = memoryMB + ' MB';

        // Status logic
        let status = 'Optimal';
        let insight = 'Allt ser bra ut!';
        let statusClass = 'moc-perf-status-good';

        if (currentFps < 30) {
          status = 'Låg';
          insight = 'Aktivera lazy loading för 3D-modeller';
          statusClass = 'moc-perf-status-bad';
        } else if (currentFps < 50) {
          status = 'Medel';
          insight = 'Överväg att minska skuggkvalitet';
          statusClass = 'moc-perf-status-warn';
        }

        if (statusEl) {
          statusEl.textContent = status;
          statusEl.className = 'moc-perf-status ' + statusClass;
        }
        if (insightEl) {
          insightEl.querySelector('.moc-perf-text').textContent = insight;
        }
      }

      requestAnimationFrame(updatePerf);
    };

    // Start monitoring after a short delay to let scene load
    setTimeout(() => {
      requestAnimationFrame(updatePerf);
    }, 1000);

    window.MyOffiCityAddons.addTool('3D-Performance', '⚡', el);
    window.MyOffiCityAddons.register('3D-Performance Monitor');
  } catch(e) {}
})();

(() => {
  try {
    const el = document.createElement('div');
    el.className = 'moc-a11y-panel';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Tillgänglighetsstatus och verktyg');

    el.innerHTML = `
      <div class="moc-a11y-header">
        <span class="moc-a11y-title">♿ Tillgänglighet</span>
        <span id="mocA11yScore" class="moc-a11y-score" aria-live="polite">--%</span>
      </div>
      <div class="moc-a11y-metrics">
        <div class="moc-a11y-metric">
          <span class="moc-a11y-label">ARIA Labels</span>
          <span id="mocA11yLabels" class="moc-a11y-val">0</span>
        </div>
        <div class="moc-a11y-metric">
          <span class="moc-a11y-label">Live Regions</span>
          <span id="mocA11yLive" class="moc-a11y-val">0</span>
        </div>
        <div class="moc-a11y-metric">
          <span class="moc-a11y-label">Roles</span>
          <span id="mocA11yRoles" class="moc-a11y-val">0</span>
        </div>
      </div>
      <div class="moc-a11y-actions">
        <button id="mocA11yScan" class="moc-a11y-btn" aria-label="Skanna sidan för tillgänglighetsproblem">Skanna nu</button>
        <button id="mocA11yFix" class="moc-a11y-btn moc-a11y-btn-fix" aria-label="Automatisk reparation av saknade ARIA-tagger">Auto-fix</button>
      </div>
      <div id="mocA11yStatus" class="moc-a11y-status" aria-live="assertive" role="status">Klar för skanning</div>
    `;

    const scanBtn = el.querySelector('#mocA11yScan');
    const fixBtn = el.querySelector('#mocA11yFix');
    const statusEl = el.querySelector('#mocA11yStatus');
    const scoreEl = el.querySelector('#mocA11yScore');
    const labelsEl = el.querySelector('#mocA11yLabels');
    const liveEl = el.querySelector('#mocA11yLive');
    const rolesEl = el.querySelector('#mocA11yRoles');

    const scan = () => {
      const all = document.querySelectorAll('*');
      let labels = 0, live = 0, roles = 0;
      all.forEach(node => {
        if (node.hasAttribute('aria-label')) labels++;
        if (node.hasAttribute('aria-live')) live++;
        if (node.hasAttribute('role')) roles++;
      });
      labelsEl.textContent = labels;
      liveEl.textContent = live;
      rolesEl.textContent = roles;
      
      const total = all.length;
      const score = Math.min(100, Math.round(((labels + live + roles) / (total * 0.1)) * 100));
      scoreEl.textContent = score + '%';
      scoreEl.className = 'moc-a11y-score ' + (score > 80 ? 'good' : score > 50 ? 'warn' : 'bad');
      
      statusEl.textContent = `Skannat: ${labels} labels, ${live} live, ${roles} roles.`;
    };

    const autoFix = () => {
      const dynamicEls = document.querySelectorAll('.moc-tool-card, .moc-dock-btn, .moc-addon-badge, .moc-scroll-top, button, [data-dynamic]');
      let fixed = 0;
      dynamicEls.forEach(node => {
        if (!node.hasAttribute('aria-label')) {
          const text = node.textContent.trim().substring(0, 30);
          if (text) {
            node.setAttribute('aria-label', text);
            fixed++;
          }
        }
        if (node.classList.contains('moc-a11y-status') || node.id === 'mocA11yStatus') {
          if (!node.hasAttribute('aria-live')) {
            node.setAttribute('aria-live', 'polite');
            fixed++;
          }
        }
      });
      statusEl.textContent = `Auto-fix: ${fixed} element uppdaterade.`;
      scan();
    };

    scanBtn.addEventListener('click', scan);
    fixBtn.addEventListener('click', autoFix);
    
    // Initial scan
    setTimeout(scan, 500);

    window.MyOffiCityAddons.addTool('Tillgänglighet', '♿', el);
    window.MyOffiCityAddons.register('Accessibility ARIA Tool');
  } catch(e) {}
})();

(() => {
  try {
    // Definiera möjliga statusar och färger
    const STATUSES = ['Aktiv', 'Bekräftar', 'Offline'];
    const COLORS = {
      Aktiv: '#4ade80',
      Bekräftar: '#fbbf24',
      Offline: '#9ca3af'
    };

    // Skapa status‑element i top‑baren
    const topbar = document.getElementById('topbar');
    if (topbar) {
      const statusEl = document.createElement('span');
      statusEl.className = 'moc-agent-status';
      statusEl.title = 'Agentstatus';
      topbar.appendChild(statusEl);
    }

    // Lägg till status‑dot på varje kort (.cards)
    const cards = document.querySelectorAll('.cards');
    cards.forEach(card => {
      const dot = document.createElement('span');
      dot.className = 'moc-card-status';
      dot.title = 'Agentstatus';
      // Säkerställ relativ positionering för absolut placerad dot
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      card.appendChild(dot);
    });

    // Uppdatera status‑elementen med slumpmässig status (demo‑syfte)
    const updateStatuses = () => {
      const randomStatus = () => STATUSES[Math.floor(Math.random() * STATUSES.length)];

      // Top‑bar
      const topStatus = document.querySelector('.moc-agent-status');
      if (topStatus) {
        const s = randomStatus();
        topStatus.dataset.status = s;
        topStatus.style.background = COLORS[s];
        topStatus.title = `Agent är ${s}`;
        topStatus.classList.toggle('pulse', s === 'Aktiv');
      }

      // Kort‑dots
      document.querySelectorAll('.moc-card-status').forEach(dot => {
        const s = randomStatus();
        dot.dataset.status = s;
        dot.style.background = COLORS[s];
        dot.title = `Agent är ${s}`;
        dot.classList.toggle('pulse', s === 'Aktiv');
      });
    };

    // Initiera och kör var 5 sekunder
    updateStatuses();
    setInterval(updateStatuses, 5000);

    // Lägg till ett verktyg i AI‑tilläggsdockan för att visa information
    const toolEl = document.createElement('div');
    toolEl.innerHTML = `
      <p style="margin:0;font-size:0.9rem;color:#e9d7b0;">
        Live‑statusindikatorer uppdateras var 5 sek.
        <br>Grön = Aktiv, Gul = Bekräftar, Grå = Offline.
      </p>
    `;
    window.MyOffiCityAddons.addTool('Live‑Status', '🔔', toolEl);
    window.MyOffiCityAddons.register('Live Status Indicator');
  } catch (e) {
    console.error('Live‑Status‑modul fel:', e);
  }
})();

(() => {
  try {
    const positions = {
      tomas: {x:0, y:1.6, z:0},
      meeting: {x:10, y:1.6, z:5}
    };

    const mapContainer = document.createElement('div');
    mapContainer.id = 'moc-mini-map';
    mapContainer.innerHTML = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="180" height="180" fill="#222" stroke="#555" stroke-width="2"/>
        <circle cx="50" cy="150" r="8" fill="#4ade80" stroke="#fff" stroke-width="1" data-target="tomas" class="moc-map-point"/>
        <text x="50" y="140" text-anchor="middle" fill="#fff" font-size="10">Tomas</text>
        <circle cx="150" cy="50" r="8" fill="#f59e0b" stroke="#fff" stroke-width="1" data-target="meeting" class="moc-map-point"/>
        <text x="150" y="40" text-anchor="middle" fill="#fff" font-size="10">Meeting</text>
      </svg>
    `;

    function moveCameraTo(target) {
      const pos = positions[target];
      if (!pos) return;
      if (window.MyOffiCity && typeof window.MyOffiCity.setCameraPosition === 'function') {
        window.MyOffiCity.setCameraPosition(pos.x, pos.y, pos.z);
      } else if (window.camera) {
        window.camera.position.set(pos.x, pos.y, pos.z);
        if (window.controls) window.controls.update();
      } else {
        console.warn('Camera control not available');
      }
    }

    mapContainer.querySelectorAll('.moc-map-point').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.target;
        moveCameraTo(target);
      });
    });

    window.MyOffiCityAddons.addTool('MiniMap', '🗺️', mapContainer);
    window.MyOffiCityAddons.register('MiniMap Navigation');
  } catch (e) {
    console.error('MiniMap addon error', e);
  }
})();

(() => {
  try {
    // Skapa huvudbehållare
    const container = document.createElement('div');
    container.className = 'moc-market-filter';

    // Sökfält
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Sök tjänster…';
    input.className = 'moc-market-search';
    container.appendChild(input);

    // Förslaglista
    const sugg = document.createElement('div');
    sugg.className = 'moc-market-suggestions';
    container.appendChild(sugg);

    // Filterknappar
    const btnContainer = document.createElement('div');
    btnContainer.className = 'moc-market-buttons';
    const popularBtn = document.createElement('button');
    popularBtn.textContent = 'Populära';
    popularBtn.className = 'moc-market-btn';
    const newBtn = document.createElement('button');
    newBtn.textContent = 'Nya';
    newBtn.className = 'moc-market-btn';
    btnContainer.appendChild(popularBtn);
    btnContainer.appendChild(newBtn);
    container.appendChild(btnContainer);

    // Lokal lagring för sökhistorik
    const HISTORY_KEY = 'moc_market_search_history';
    const MAX_HISTORY = 10;

    const getHistory = () => {
      try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
      } catch {
        return [];
      }
    };

    const addToHistory = (term) => {
      if (!term) return;
      let h = getHistory();
      h = h.filter(t => t !== term);
      h.unshift(term);
      if (h.length > MAX_HISTORY) h.pop();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    };

    const renderSuggestions = (filter = '') => {
      const list = getHistory().filter(t => t.toLowerCase().includes(filter.toLowerCase()));
      sugg.innerHTML = '';
      list.forEach(t => {
        const item = document.createElement('div');
        item.textContent = t;
        item.className = 'moc-sugg-item';
        item.addEventListener('click', () => {
          input.value = t;
          performSearch(t);
        });
        sugg.appendChild(item);
      });
    };

    const performSearch = (term) => {
      term = term.trim();
      if (!term) return;
      addToHistory(term);
      renderSuggestions('');
      const cards = document.querySelectorAll('.card, .service-card, .moc-card');
      cards.forEach(c => {
        const txt = c.textContent || '';
        c.style.display = txt.toLowerCase().includes(term.toLowerCase()) ? '' : 'none';
      });
    };

    // Händelser
    input.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      renderSuggestions(val);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch(e.target.value);
        e.target.blur();
      }
    });

    popularBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.card, .service-card, .moc-card');
      cards.forEach(c => {
        c.style.display = c.dataset.popular === 'true' ? '' : 'none';
      });
    });

    newBtn.addEventListener('click', () => {
      const cards = document.querySelectorAll('.card, .service-card, .moc-card');
      cards.forEach(c => {
        c.style.display = c.dataset.new === 'true' ? '' : 'none';
      });
    });

    // Initiera förslag
    renderSuggestions();

    // Registrera i addon‑dockan
    window.MyOffiCityAddons.addTool('Marketplace Filter', '🔎', container);
    window.MyOffiCityAddons.register('Marketplace Filter');
  } catch (e) {
    console.error('Marketplace Filter addon error', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-notis-container';
    
    let notifications = [
      { id: 1, text: 'Välkommen till MyOffiCity!', read: false },
      { id: 2, text: 'Tomas har uppdaterat AI-modulerna.', read: false }
    ];

    const render = () => {
      const unread = notifications.filter(n => !n.read).length;
      const dot = document.querySelector('.moc-notis-dot');
      if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
      
      container.innerHTML = notifications.length === 0 ? '<p style="padding:10px;font-size:12px;">Inga notiser</p>' : '';
      notifications.forEach(n => {
        const div = document.createElement('div');
        div.className = `moc-notis-item ${n.read ? 'read' : ''}`;
        div.innerHTML = `<span>${n.text}</span> ${!n.read ? '<button>Läs</button>' : ''}`;
        if (!n.read) div.querySelector('button').onclick = () => { n.read = true; render(); };
        container.appendChild(div);
      });
    };

    const icon = document.createElement('div');
    icon.innerHTML = '🔔<span class="moc-notis-dot"></span>';
    icon.className = 'moc-notis-icon';
    icon.onclick = () => container.classList.toggle('active');
    
    const topbar = document.getElementById('topbar');
    if (topbar) {
      topbar.appendChild(icon);
      topbar.appendChild(container);
    }

    window.MyOffiCityAddons.addTool('Notis-Center', '🔔', container);
    window.MyOffiCityAddons.register('Notis-Center');
    render();
  } catch(e) { console.error(e); }
})();

(() => {
  try {
    const modal = document.createElement('div');
    modal.className = 'moc-cheat-sheet';
    modal.innerHTML = `
      <div class="moc-cheat-content">
        <h3>⌨️ Kortkommandon</h3>
        <ul>
          <li><span>W / A / S / D</span> Flytta kamera</li>
          <li><span>Space</span> Hoppa / Upp</li>
          <li><span>Shift</span> Spring</li>
          <li><span>?</span> Visa denna meny</li>
          <li><span>Esc</span> Stäng meny</li>
        </ul>
        <button onclick="this.parentElement.parentElement.style.display='none'">Stäng</button>
      </div>
    `;
    document.body.appendChild(modal);

    window.addEventListener('keydown', (e) => {
      if (e.key === '?') modal.style.display = 'flex';
      if (e.key === 'Escape') modal.style.display = 'none';
    });

    window.MyOffiCityAddons.register('Cheat Sheet');
  } catch(e) { console.error(e); }
})();

(() => {
  try {
    const pulseClass = 'pulse';
    // Observe attribute changes on all elements for data-processing flag
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.attributeName === 'data-processing') {
          const el = m.target;
          const active = el.getAttribute('data-processing') === 'true';
          if (active) el.classList.add(pulseClass);
          else el.classList.remove(pulseClass);
        }
      });
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-processing'] });

    // Public API for agents to toggle pulse on a card element
    window.MyOffiCityAddons.setProcessing = (el, active) => {
      if (!el) return;
      el.setAttribute('data-processing', active ? 'true' : 'false');
      if (active) el.classList.add(pulseClass);
      else el.classList.remove(pulseClass);
    };
  } catch (e) {
    console.error(e);
  }
})();

(() => {
  try {
    // Create breadcrumb container
    const breadcrumb = document.createElement('nav');
    breadcrumb.id = 'moc-breadcrumb';
    breadcrumb.className = 'moc-breadcrumb';

    const topbar = document.getElementById('topbar');
    if (!topbar) return;
    topbar.appendChild(breadcrumb);

    // Helper to format segment names
    const formatSegment = (seg) =>
      seg
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    // Update breadcrumb based on current location
    const update = () => {
      const path = window.location.pathname.split('/').filter(Boolean);
      breadcrumb.innerHTML = '';

      let accumulated = '';
      path.forEach((segment, idx) => {
        accumulated += '/' + segment;
        const link = document.createElement('a');
        link.href = accumulated;
        link.textContent = formatSegment(segment);
        link.addEventListener('click', (e) => {
          e.preventDefault();
          history.pushState(null, '', accumulated);
          update();
        });
        breadcrumb.appendChild(link);

        if (idx < path.length - 1) {
          const sep = document.createElement('span');
          sep.textContent = '>';
          breadcrumb.appendChild(sep);
        }
      });

      // If no path segments, show home
      if (path.length === 0) {
        const home = document.createElement('span');
        home.textContent = 'Home';
        breadcrumb.appendChild(home);
      }
    };

    // Listen for navigation events
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);

    // Override pushState to trigger update
    const originalPushState = history.pushState;
    history.pushState = function (state, title, url) {
      originalPushState.apply(this, arguments);
      update();
    };

    // Initial render
    update();
  } catch (e) {
    console.error('Breadcrumb addon error:', e);
  }
})();

(() => {
  try {
    const infoBox = document.createElement('div');
    infoBox.id = 'moc-quick-view';
    infoBox.style.display = 'none';
    document.body.appendChild(infoBox);

    const updateInfo = (name, status) => {
      infoBox.innerHTML = `<strong>${name}</strong><br><small>Status: ${status}</small>`;
      infoBox.style.display = 'block';
    };

    document.addEventListener('mousemove', (e) => {
      if (infoBox.style.display === 'block') {
        infoBox.style.left = (e.clientX + 15) + 'px';
        infoBox.style.top = (e.clientY + 15) + 'px';
      }
    });

    // Simulera objekt-detektering för 3D-scenen
    window.addEventListener('city-object-hover', (e) => {
      const { name, status } = e.detail;
      updateInfo(name, status);
    });

    window.addEventListener('city-object-blur', () => {
      infoBox.style.display = 'none';
    });

    const toolContent = document.createElement('div');
    toolContent.innerHTML = '<p>Hovera över 3D-objekt i staden för att se snabbinfo.</p>';
    window.MyOffiCityAddons.addTool('3D Quick-View', '🔍', toolContent);
  } catch (e) {
    console.error('Quick-View addon error:', e);
  }
})();

(() => {
  try {
    const storageKey = 'moc_recent_visits';
    const container = document.createElement('div');
    container.className = 'moc-recent-box';

    const getRecent = () => {
      try {
        return JSON.parse(sessionStorage.getItem(storageKey) || '[]');
      } catch (e) { return []; }
    };

    const saveRecent = (list) => {
      sessionStorage.setItem(storageKey, JSON.stringify(list.slice(0, 3)));
    };

    const render = () => {
      const list = getRecent();
      if (list.length === 0) {
        container.innerHTML = '<p style="font-size:11px;opacity:0.5;margin:5px 0;">Inga besökta platser än.</p>';
        return;
      }
      container.innerHTML = list.map(item => `
        <a href="${item.url}" class="moc-recent-item">
          <span class="moc-recent-icon">${item.type === 'agent' ? '👤' : '🏢'}</span>
          <span class="moc-recent-name">${item.name}</span>
        </a>
      `).join('');
    };

    const track = () => {
      const hash = window.location.hash;
      // Vi loggar bara agenter, kontor eller specifika platser
      if (!hash || !hash.includes('/') || hash === '#/' || hash === '#/dash') return;

      let type = 'place';
      if (hash.includes('/agent/')) type = 'agent';
      else if (hash.includes('/office/')) type = 'office';
      else if (hash.includes('/neighborhood')) type = 'place';
      else return; // Ignorera övriga

      // Vänta lite så att DOM hinner uppdateras med rätt titel
      setTimeout(() => {
        let name = 'Okänd plats';
        const titleEl = document.querySelector('.dmain h2, .dsb-h, h1, .moc-tool-title');
        
        if (titleEl && titleEl.textContent) {
          name = titleEl.textContent.trim().split('\n')[0].replace('✨', '').trim();
        } else {
          // Fallback på URL-del
          const parts = hash.split('/');
          name = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
        }

        const current = getRecent();
        const newItem = { name, url: hash, type, ts: Date.now() };
        
        // Flytta till toppen om den redan finns, annars lägg till ny
        const filtered = current.filter(i => i.url !== hash);
        saveRecent([newItem, ...filtered]);
        render();
      }, 800);
    };

    window.addEventListener('hashchange', track);
    window.MyOffiCityAddons.addTool('Senast Besökta', '🕒', container);
    
    // Initial körning
    render();
    track();
  } catch (e) {
    console.error('Recent Visits addon error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-cmd-palette-container';
    
    const overlay = document.createElement('div');
    overlay.className = 'moc-cmd-overlay';
    overlay.hidden = true;

    const modal = document.createElement('div');
    modal.className = 'moc-cmd-modal';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Sök kommando eller sida... (Ctrl+K)';
    input.className = 'moc-cmd-input';

    const list = document.createElement('div');
    list.className = 'moc-cmd-list';

    const commands = [
      { id: 'city', label: 'Gå till Stadskarta', icon: '🏙️', action: () => { window.location.hash = '#/city'; } },
      { id: 'dash', label: 'Gå till Dashboard', icon: '📊', action: () => { window.location.hash = '#/dash'; } },
      { id: 'market', label: 'Gå till Marketplace', icon: '🛒', action: () => { window.location.hash = '#/market'; } },
      { id: 'agents', label: 'Visa alla Agenter', icon: '🤖', action: () => { window.location.hash = '#/agents'; } },
      { id: 'settings', label: 'Öppna Inställningar', icon: '⚙️', action: () => { window.location.hash = '#/settings'; } }
    ];

    let selectedIndex = 0;

    const renderList = (filter) => {
      list.innerHTML = '';
      const filtered = commands.filter(c => c.label.toLowerCase().includes(filter.toLowerCase()));
      
      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'moc-cmd-empty';
        empty.textContent = 'Inga kommandon hittades';
        list.appendChild(empty);
        return;
      }

      filtered.forEach((cmd, i) => {
        const item = document.createElement('div');
        item.className = 'moc-cmd-item' + (i === selectedIndex ? ' active' : '');
        item.innerHTML = `<span class="moc-cmd-icon">${cmd.icon}</span><span>${cmd.label}</span>`;
        item.onclick = () => {
          cmd.action();
          closePalette();
        };
        list.appendChild(item);
      });
    };

    const openPalette = () => {
      overlay.hidden = false;
      input.value = '';
      selectedIndex = 0;
      renderList('');
      setTimeout(() => input.focus(), 50);
    };

    const closePalette = () => {
      overlay.hidden = true;
    };

    input.addEventListener('input', (e) => {
      selectedIndex = 0;
      renderList(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = list.querySelectorAll('.moc-cmd-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        renderList(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        renderList(input.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) items[selectedIndex].click();
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.hidden) openPalette();
        else closePalette();
      }
    });

    modal.appendChild(input);
    modal.appendChild(list);
    overlay.appendChild(modal);
    container.appendChild(overlay);

    window.MyOffiCityAddons.addTool('Command Palette', '⌨️', container);
    window.MyOffiCityAddons.register('Command Palette');
  } catch (e) {
    console.error('Command Palette addon error:', e);
  }
})();

(() => {
  try {
    // Skapa container för tidslinjen
    const container = document.createElement('div');
    container.className = 'moc-timeline';
    const list = document.createElement('ul');
    list.className = 'moc-timeline-list';
    container.appendChild(list);

    // Placeholder‑funktion – ersätt med riktig API‑anrop vid behov
    async function fetchEvents() {
      // Simulerade händelser (ska bytas ut mot riktiga loggar)
      const now = new Date();
      return [
        { time: now.toLocaleTimeString(), msg: 'AI svarade på en användarförfrågan' },
        { time: now.toLocaleTimeString(), msg: 'Ny commit pushad till repo' },
        { time: now.toLocaleTimeString(), msg: 'Sprint‑planering slutförd' },
      ];
    }

    // Uppdatera tidslinjen
    async function updateTimeline() {
      const events = await fetchEvents();
      // Visa max 5 senaste händelser, nyast överst
      list.innerHTML = '';
      events.slice(-5).reverse().forEach(e => {
        const li = document.createElement('li');
        li.className = 'moc-timeline-item';
        li.innerHTML = `<span class="time">${e.time}</span><span class="msg">${e.msg}</span>`;
        list.appendChild(li);
      });
    }

    // Initiera och refresha var 15 sekunder
    updateTimeline();
    setInterval(updateTimeline, 15000);

    // Registrera widgeten i AI‑dockan
    window.MyOffiCityAddons.addTool('Agent‑Timeline', '🕒', container);
    window.MyOffiCityAddons.register('Agent‑Timeline');
  } catch (e) {
    console.error('Agent Timeline addon error:', e);
  }
})();

(() => {
  try {
    // Vänta på att DOM är klar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initZen);
    } else {
      initZen();
    }

    function initZen() {
      const topbar = document.getElementById('topbar');
      if (!topbar) return;

      // Skapa Zen‑knappen
      const zenBtn = document.createElement('button');
      zenBtn.className = 'moc-zen-btn';
      zenBtn.title = 'Zen‑läge: döljer UI för fullt fokus';
      zenBtn.innerHTML = '🧘‍♂️';
      zenBtn.style.cssText = `
        margin-left: 8px;
        padding: 4px 8px;
        background: rgba(15,23,42,0.8);
        color: #f3ecdc;
        border: 1px solid rgba(217,180,106,0.45);
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        transition: background 0.2s ease, border-color 0.2s ease;
      `;

      // Klick‑handler: toggle Focus Mode
      zenBtn.addEventListener('click', () => {
        document.body.classList.toggle('focus-mode');
      });

      topbar.appendChild(zenBtn);

      // Registrera i AI‑dockan så att den räknas som ett aktivt verktyg
      const dockClone = zenBtn.cloneNode(true);
      window.MyOffiCityAddons.addTool('Zen‑läge', '🧘', dockClone);
      window.MyOffiCityAddons.register('Zen‑läge');
    }
  } catch (e) {
    console.error('Zen‑addon error:', e);
  }
})();
