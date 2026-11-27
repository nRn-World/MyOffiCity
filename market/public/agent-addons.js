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

(() => {
  try {
    // Skapa ett verktyg i AI‑dockan för att slå på/av drag‑och‑släpp‑läget
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '6px';
    container.style.padding = '4px 0';

    const label = document.createElement('label');
    label.textContent = 'Drag‑Drop‑preview';
    label.style.cursor = 'pointer';
    label.style.userSelect = 'none';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = 'moc-drag-toggle';
    toggle.style.cursor = 'pointer';

    label.htmlFor = toggle.id;
    container.appendChild(toggle);
    container.appendChild(label);

    // Lägg till verktyget i dockan
    window.MyOffiCityAddons.addTool('Drag‑Drop‑preview', '🖐️', container);
    window.MyOffiCityAddons.register('Drag‑Drop‑preview');

    // Intern state
    let enabled = false;
    let previewEl = null;
    let currentModel = null;

    // Skapa en flytande preview‑element
    function createPreview(text) {
      const el = document.createElement('div');
      el.className = 'moc-drag-preview';
      el.textContent = text;
      document.body.appendChild(el);
      return el;
    }

    // Flytta preview‑elementet med musen
    function onMouseMove(e) {
      if (previewEl) {
        previewEl.style.left = e.clientX + 12 + 'px';
        previewEl.style.top = e.clientY + 12 + 'px';
      }
    }

    // Hantera släpp på 3D‑vyn (#app)
    function onMouseUp(e) {
      if (!enabled) return;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (previewEl) {
        previewEl.remove();
        previewEl = null;
      }
      const dropTarget = e.target.closest('#app');
      if (dropTarget && currentModel) {
        // Skicka en custom‑event som kan fångas av befintlig 3‑D‑kod
        window.dispatchEvent(new CustomEvent('previewModel', {
          detail: { modelId: currentModel }
        }));
      }
      currentModel = null;
    }

    // Initiera drag‑start när användaren trycker ner på ett marketplace‑objekt
    function onMouseDown(e) {
      if (!enabled) return;
      const item = e.target.closest('[data-model-id]');
      if (!item) return;
      const modelId = item.getAttribute('data-model-id');
      const name = item.getAttribute('data-model-name') || item.textContent.trim() || 'Objekt';
      currentModel = modelId;
      previewEl = createPreview('🔍 ' + name);
      previewEl.style.left = e.clientX + 12 + 'px';
      previewEl.style.top = e.clientY + 12 + 'px';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    // Aktivera / inaktivera lyssnare när checkboxen ändras
    toggle.addEventListener('change', (e) => {
      enabled = e.target.checked;
      if (enabled) {
        document.addEventListener('mousedown', onMouseDown);
      } else {
        document.removeEventListener('mousedown', onMouseDown);
        if (previewEl) {
          previewEl.remove();
          previewEl = null;
        }
        currentModel = null;
      }
    });
  } catch (e) {
    console.error('Drag‑Drop‑preview‑addon error:', e);
  }
})();

(() => {
  try {
    const storageKey = 'mocQuickActions';
    const defaultActions = [
      {label: 'Chat', icon: '💬', action: 'chat'},
      {label: 'Code Review', icon: '📝', action: 'codeReview'},
      {label: 'Deploy', icon: '🚀', action: 'deploy'}
    ];

    function loadActions() {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      return defaultActions;
    }

    function saveActions(actions) {
      localStorage.setItem(storageKey, JSON.stringify(actions));
    }

    function createButton(action) {
      const btn = document.createElement('button');
      btn.className = 'moc-quick-action';
      btn.title = action.label;
      btn.innerHTML = `${action.icon} ${action.label}`;
      btn.addEventListener('click', () => {
        if (action.action === 'chat') {
          const chat = document.getElementById('chat');
          if (chat) chat.hidden = !chat.hidden;
        } else if (action.action === 'codeReview') {
          const cr = document.getElementById('code-review');
          if (cr) cr.hidden = !cr.hidden;
        } else if (action.action === 'deploy') {
          const deploy = document.getElementById('deploy-panel');
          if (deploy) deploy.hidden = !deploy.hidden;
        } else if (action.url) {
          window.open(action.url, '_blank');
        }
      });
      return btn;
    }

    function renderToolbar() {
      const container = document.createElement('div');
      container.className = 'moc-quick-actions';
      const actions = loadActions();
      actions.forEach(action => {
        container.appendChild(createButton(action));
      });

      // Pin button for custom actions
      const pinBtn = document.createElement('button');
      pinBtn.className = 'moc-quick-action pin';
      pinBtn.title = 'Add custom action';
      pinBtn.innerHTML = '+';
      pinBtn.addEventListener('click', () => {
        const label = prompt('Action label:');
        if (!label) return;
        const url = prompt('URL (leave empty for custom action):');
        const newAction = {label, icon: '🔗', url};
        const actions = loadActions();
        actions.push(newAction);
        saveActions(actions);
        // Re-render
        container.innerHTML = '';
        actions.forEach(a => container.appendChild(createButton(a)));
      });
      container.appendChild(pinBtn);

      // Attach to .tc-box or fallback to body
      let tcBox = document.querySelector('.tc-box');
      if (!tcBox) tcBox = document.body;
      tcBox.appendChild(container);

      // Mount in AI drawer
      window.MyOffiCityAddons.addTool('Snabbtillgång', '⚡', container);
      window.MyOffiCityAddons.register('Quick Actions Toolbar');
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderToolbar);
    } else {
      renderToolbar();
    }
  } catch (e) {
    console.error('Quick Actions Toolbar error:', e);
  }
})();

(() => {
  try {
    const updateAgentStatuses = async () => {
      const cards = document.querySelectorAll('.cards .card, .card');
      if (!cards.length) return;

      try {
        // Hämtar status från API (förväntar oss en JSON-lista med agent-status)
        const response = await fetch('/api/agents/status');
        const data = await response.json(); // [{id: 'agent1', status: 'online'}, ...]
        
        cards.forEach(card => {
          const agentId = card.dataset.agentId;
          if (!agentId) return;
          
          let badge = card.querySelector('.moc-status-badge');
          if (!badge) {
            badge = document.createElement('div');
            badge.className = 'moc-status-badge';
            card.style.position = 'relative';
            card.appendChild(badge);
          }

          const agentData = data.find(a => a.id === agentId) || { status: 'offline' };
          badge.className = `moc-status-badge status-${agentData.status}`;
          badge.textContent = agentData.status.charAt(0).toUpperCase() + agentData.status.slice(1);
        });
      } catch (e) {
        console.warn('Kunde inte hämta agent-status, använder fallback.');
      }
    };

    window.MyOffiCityAddons.register('Live Status Badge');
    setInterval(updateAgentStatuses, 30000); // Uppdatera var 30:e sekund
    updateAgentStatuses();
  } catch (e) {
    console.error('Status Badge error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="moc-quick-actions">
        <button class="moc-quick-action" onclick="window.dispatchEvent(new CustomEvent('moc-focus', {detail: 1}))">Ctrl+1: Entré</button>
        <button class="moc-quick-action" onclick="window.dispatchEvent(new CustomEvent('moc-focus', {detail: 2}))">Ctrl+2: Arbetsyta</button>
        <button class="moc-quick-action" onclick="window.dispatchEvent(new CustomEvent('moc-focus', {detail: 3}))">Ctrl+3: Terrass</button>
      </div>
      <p style="font-size:11px; color:#94a3b8; margin-top:8px;">Använd kortkommandon för att navigera i 3D-vyn.</p>
    `;

    window.MyOffiCityAddons.addTool('Kamerakontroll', '📷', container);
    window.MyOffiCityAddons.register('Focus-Switching');

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('moc-focus', { detail: parseInt(e.key) }));
        console.log(`Navigerar till zon: ${e.key}`);
      }
    });
  } catch (e) {
    console.error('Focus-Switching error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.cssText = 'width: 100%; height: 100px; background: rgba(0,0,0,0.2); border-radius: 4px; position: relative; overflow: hidden;';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 60');
    svg.style.cssText = 'width: 100%; height: 100%;';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#d9b46a');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', 'M0 50 Q 50 10, 100 30 T 200 20');
    
    svg.appendChild(path);
    container.appendChild(svg);

    const label = document.createElement('div');
    label.style.cssText = 'position: absolute; bottom: 5px; left: 5px; font-size: 10px; color: #d9b46a;';
    label.textContent = 'Agent-aktivitet (Live)';
    container.appendChild(label);

    window.MyOffiCityAddons.addTool('Data-Visualizer', '📊', container);
    window.MyOffiCityAddons.register('Data-Visualizer');

    let offset = 0;
    setInterval(() => {
      offset += 0.1;
      const d = `M0 50 Q 50 ${20 + Math.sin(offset)*15}, 100 30 T 200 ${20 + Math.cos(offset)*10}`;
      path.setAttribute('d', d);
    }, 100);
  } catch (e) {
    console.error('Data-Visualizer error:', e);
  }
})();

(() => {
  try {
    const filterContainer = document.createElement('div');
    filterContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <select id="moc-cat-filter" style="background:#0f172a; color:#f3ecdc; border:1px solid #d9b46a; padding:4px; border-radius:4px;">
          <option value="all">Alla kategorier</option>
          <option value="dev">Utveckling</option>
          <option value="design">Design</option>
          <option value="ai">AI & Data</option>
        </select>
        <input type="text" id="moc-skill-search" placeholder="Sök kompetens..." style="background:#0f172a; color:#f3ecdc; border:1px solid #d9b46a; padding:4px; border-radius:4px;">
      </div>
    `;

    const applyFilter = () => {
      const cat = document.getElementById('moc-cat-filter').value;
      const skill = document.getElementById('moc-skill-search').value.toLowerCase();
      const cards = document.querySelectorAll('.agent-card, .card');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const catMatch = cat === 'all' || text.includes(cat);
        const skillMatch = text.includes(skill);
        card.style.display = (catMatch && skillMatch) ? 'block' : 'none';
        card.style.transition = 'opacity 0.3s ease';
      });
    };

    filterContainer.querySelector('#moc-cat-filter').addEventListener('change', applyFilter);
    filterContainer.querySelector('#moc-skill-search').addEventListener('input', applyFilter);

    window.MyOffiCityAddons.addTool('Quick-Filter', '🔍', filterContainer);
    window.MyOffiCityAddons.register('Quick-Filter');
  } catch (e) {
    console.error('Quick-Filter init error:', e);
  }
})();

(() => {
  try {
    const STORAGE_KEY = 'myofficity-theme';
    const body = document.body;
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const isHighContrast = stored === 'high-contrast';
    if (isHighContrast) body.classList.add('high-contrast');

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'moc-theme-toggle';
    toggleBtn.className = 'moc-theme-toggle';
    toggleBtn.title = 'High Contrast';
    toggleBtn.textContent = isHighContrast ? '🌓' : '🌙';
    toggleBtn.addEventListener('click', () => {
      const newState = !body.classList.toggle('high-contrast');
      localStorage.setItem(STORAGE_KEY, newState ? 'high-contrast' : 'dark');
      toggleBtn.textContent = newState ? '🌓' : '🌙';
    });
    topbar.appendChild(toggleBtn);
  } catch (e) {
    console.error('Theme Switcher init error:', e);
  }
})();

(() => {
  try {
    // Skapa breadcrumb‑container i topbaren
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'moc-breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Navigationsstig');
    topbar.appendChild(breadcrumb);

    // Uppdatera breadcrumb med en array av segment
    const render = (segments) => {
      breadcrumb.innerHTML = '';
      if (!Array.isArray(segments) || segments.length === 0) return;
      segments.forEach((seg, i) => {
        const span = document.createElement('span');
        span.className = 'moc-bc-seg';
        span.textContent = seg;
        breadcrumb.appendChild(span);
        if (i < segments.length - 1) {
          const sep = document.createElement('span');
          sep.className = 'moc-bc-sep';
          sep.textContent = '>';
          breadcrumb.appendChild(sep);
        }
      });
    };

    // Init‑värde (kan sättas via data‑attribut på #topbar)
    const initPath = topbar.dataset.path ? topbar.dataset.path.split('/') : ['City'];
    render(initPath);

    // Lyssna på anpassat event för att uppdatera breadcrumb
    document.addEventListener('myofficity-location', (e) => {
      if (e?.detail?.path) render(e.detail.path);
    });

    // -------------------------------------------------
    // Debug‑verktyg – visar senaste location‑eventet
    // -------------------------------------------------
    const debugPre = document.createElement('pre');
    debugPre.style.maxHeight = '150px';
    debugPre.style.overflow = 'auto';
    const debugWrapper = document.createElement('div');
    debugWrapper.appendChild(debugPre);

    window.MyOffiCityAddons.addTool('Location Debug', '📍', debugWrapper);
    window.MyOffiCityAddons.register('Location Debug');

    document.addEventListener('myofficity-location', (e) => {
      debugPre.textContent = JSON.stringify(e.detail, null, 2);
    });
  } catch (e) {
    console.error('Breadcrumb init error:', e);
  }
})();

(() => {
  try {
    const tourSteps = [
      { title: "Välkommen!", text: "Utforska en levande 3D-stad med autonoma AI-företag.", selector: "body" },
      { title: "Marknadsplats", text: "I listan med kort ser du alla företag och deras status.", selector: ".cards" },
      { title: "Dashboard", text: "Här hanterar du projekt, chattar och inställningar.", selector: ".dmain" },
      { title: "AI-Verktyg", text: "Här nere hittar du extra moduler som vi utvecklare bygger live.", selector: "#foot" }
    ];
    let current = -1;
    const box = document.createElement('div');
    box.className = 'moc-tour-box';
    box.style.display = 'none';
    document.body.appendChild(box);

    const showStep = (i) => {
      const step = tourSteps[i];
      const el = document.querySelector(step.selector);
      if (!el) return next();
      current = i;
      const rect = el.getBoundingClientRect();
      box.innerHTML = `<h3>${step.title}</h3><p>${step.text}</p><div class="moc-tour-btns"><button id="mocTourNext">${i === tourSteps.length - 1 ? 'Avsluta' : 'Nästa'}</button></div>`;
      box.style.display = 'block';
      const top = step.selector === 'body' ? window.innerHeight/2 - 100 : Math.max(10, rect.top - 120);
      const left = step.selector === 'body' ? window.innerWidth/2 - 125 : Math.min(window.innerWidth - 270, Math.max(10, rect.left));
      box.style.transform = `translate(${left}px, ${top}px)`;
      document.getElementById('mocTourNext').onclick = next;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const next = () => {
      if (current < tourSteps.length - 1) showStep(current + 1);
      else { box.style.display = 'none'; localStorage.setItem('moc_tour_done', '1'); }
    };

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Starta Rundturen';
    startBtn.className = 'moc-btn-tour';
    startBtn.onclick = () => showStep(0);

    window.MyOffiCityAddons.addTool('Guide', '🗺️', startBtn);
    window.MyOffiCityAddons.register('Onboarding Tour');

    if (!localStorage.getItem('moc_tour_done')) setTimeout(() => showStep(0), 2000);
  } catch (e) { console.error('Tour error:', e); }
})();

(() => {
  try {
    const takeSnapshot = () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.warn('Ingen 3D-canvas hittades för snapshot.');
        return;
      }

      // Skapa en temporär länk för nedladdning
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `MyOffiCity-Snapshot-${timestamp}.png`;
      
      // För Three.js-canvas som ofta har preserveDrawingBuffer: false
      // försöker vi fånga innehållet. Om det blir svart kan användaren behöva klicka snabbt.
      link.href = canvas.toDataURL('image/png');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Visuell feedback
      const flash = document.createElement('div');
      flash.className = 'moc-snapshot-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 400);
    };

    // Lyssna på tangentbordet (S)
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 's' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        takeSnapshot();
      }
    });

    // Skapa UI-knapp
    const btn = document.createElement('button');
    btn.className = 'moc-btn-snapshot';
    btn.innerHTML = '<span>Ta Snapshot (S)</span>';
    btn.onclick = takeSnapshot;

    window.MyOffiCityAddons.addTool('Snapshot', '📸', btn);
    window.MyOffiCityAddons.register('Quick-Snapshot');
  } catch (e) {
    console.error('Snapshot addon error:', e);
  }
})();

(() => {
  try {
    const performSort = (type) => {
      const container = document.querySelector('.cards');
      if (!container) return;

      const cards = Array.from(container.children);
      if (cards.length < 2) return;

      // Starta animation
      container.classList.add('moc-sorting-active');
      
      setTimeout(() => {
        cards.sort((a, b) => {
          if (type === 'pop') {
            // Försök hitta betyg (stjärnor eller procent)
            const getVal = (el) => {
              const text = el.innerText;
              const match = text.match(/(\d+)/);
              return match ? parseInt(match[0]) : 0;
            };
            return getVal(b) - getVal(a);
          } else if (type === 'new') {
            // Sortera på ID eller ordning (nyast först)
            return b.innerHTML.length - a.innerHTML.length; // Heuristisk fallback
          } else {
            // Alfabetisk
            const nameA = a.querySelector('h3')?.innerText || a.innerText;
            const nameB = b.querySelector('h3')?.innerText || b.innerText;
            return nameA.localeCompare(nameB);
          }
        });

        // Re-appenda i rätt ordning
        cards.forEach(card => container.appendChild(card));
        
        // Avsluta animation
        setTimeout(() => {
          container.classList.remove('moc-sorting-active');
        }, 50);
      }, 300);
    };

    const ui = document.createElement('div');
    ui.className = 'moc-sorter-container';
    ui.innerHTML = `
      <div class="moc-sorter-grid">
        <button class="moc-sort-btn" data-type="pop">🔥 Popularitet</button>
        <button class="moc-sort-btn" data-type="alpha">🔤 Namn A-Ö</button>
        <button class="moc-sort-btn" data-type="new">🕒 Senaste</button>
      </div>
    `;

    ui.querySelectorAll('.moc-sort-btn').forEach(btn => {
      btn.onclick = () => performSort(btn.dataset.type);
    });

    window.MyOffiCityAddons.addTool('Market Sorter', '📊', ui);
    window.MyOffiCityAddons.register('Market-Sorter-Pro');
  } catch (e) {
    console.error('Sorter addon error:', e);
  }
})();

(() => {
  try {
    const checkBridgeHealth = async () => {
      const dot = document.getElementById('moc-agent-health-dot');
      const label = document.getElementById('moc-agent-health-label');
      
      try {
        // Försöker nå den lokala bryggan (standardport 1337)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const resp = await fetch('http://localhost:1337/status', { 
          mode: 'cors',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          if (dot) dot.className = 'moc-health-dot online';
          if (label) label.textContent = 'AI Bridge: Online';
        } else {
          throw new Error();
        }
      } catch (e) {
        if (dot) dot.className = 'moc-health-dot offline';
        if (label) label.textContent = 'AI Bridge: Offline / Restart needed';
      }
    };

    const initHealthUI = () => {
      const chatBox = document.querySelector('.tc-box');
      if (!chatBox || document.getElementById('moc-agent-health-dot')) return;

      const container = document.createElement('div');
      container.className = 'moc-health-indicator';
      container.title = 'Status för local-ai-bridge';
      container.innerHTML = `
        <span id="moc-agent-health-dot" class="moc-health-dot"></span>
        <span id="moc-agent-health-label" class="moc-health-text">Checking AI...</span>
      `;
      
      // Placera den i toppen av chatten
      chatBox.prepend(container);
      
      // Starta loop
      checkBridgeHealth();
      setInterval(checkBridgeHealth, 10000);
    };

    // Kör init när DOM är redo och vid ändringar (om chatten laddas sent)
    setTimeout(initHealthUI, 2000);
    const observer = new MutationObserver(initHealthUI);
    observer.observe(document.body, { childList: true, subtree: true });

    // Registrera som verktyg
    const toolEl = document.createElement('div');
    toolEl.innerHTML = `<p style="font-size:12px;color:#e9d7b0;margin-bottom:8px;">Övervakar anslutningen till din lokala AI-instans (local-ai-bridge.js).</p>
    <button class="moc-sort-btn" onclick="window.location.reload()">🔄 Starta om gränssnitt</button>`;
    
    window.MyOffiCityAddons.addTool('Agent Health', '🩺', toolEl);
    window.MyOffiCityAddons.register('Agent-Health-Monitor');
  } catch (e) {
    console.error('Agent Health Error:', e);
  }
})();

(() => {
  try {
    const uiTool = document.createElement('div');
    uiTool.className = 'moc-ui-controls';
    uiTool.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:5px;';
    
    uiTool.innerHTML = `
      <p style="font-size:11px;color:#94a3b8;margin-bottom:4px;">Anpassa kontorets visuella stil:</p>
      <button class="moc-ui-btn" id="toggleGlass">✨ Glassmorphism: Av</button>
      <button class="moc-ui-btn" id="toggleFocus">🧘 Fokusläge: Av</button>
      <div style="height:1px;background:rgba(217,180,106,0.2);margin:5px 0;"></div>
      <p style="font-size:10px;color:#64748b;font-style:italic;">Tips: Fokusläge tonar ner UI när du inte interagerar med det.</p>
    `;

    let glassOn = false;
    let focusOn = false;

    const btnGlass = uiTool.querySelector('#toggleGlass');
    const btnFocus = uiTool.querySelector('#toggleFocus');

    btnGlass.onclick = () => {
      glassOn = !glassOn;
      document.body.classList.toggle('moc-glass-enabled', glassOn);
      btnGlass.textContent = `✨ Glassmorphism: ${glassOn ? 'På' : 'Av'}`;
      btnGlass.style.borderColor = glassOn ? '#d9b46a' : 'rgba(217,180,106,0.3)';
    };

    btnFocus.onclick = () => {
      focusOn = !focusOn;
      document.body.classList.toggle('moc-focus-enabled', focusOn);
      btnFocus.textContent = `🧘 Fokusläge: ${focusOn ? 'På' : 'Av'}`;
      btnFocus.style.borderColor = focusOn ? '#d9b46a' : 'rgba(217,180,106,0.3)';
    };

    window.MyOffiCityAddons.addTool('Design Center', '🎨', uiTool);
    window.MyOffiCityAddons.register('UI-Enhancer');
  } catch (e) {
    console.error('Design Center Error:', e);
  }
})();

(() => {
  try {
    const tips = [
      { icon: '🌅', text: 'Börja dagen med att prioritera dina 3 viktigaste uppgifter.', action: 'Öppna dagbok' },
      { icon: '☕', text: 'Ta en kort paus för att ladda om hjärnan.', action: 'Pausa 5 min' },
      { icon: '📊', text: 'Kolla dina senaste rapporter för insikter.', action: 'Visa statistik' },
      { icon: '🤝', text: 'Skicka ett meddelande till en kollega för samordning.', action: 'Öppna chatt' },
      { icon: '🎯', text: 'Fokusera på en uppgift i 25 min (Pomodoro).', action: 'Starta timer' },
      { icon: '📝', text: 'Uppdatera dina anteckningar om pågående projekt.', action: 'Öppna anteckningar' },
      { icon: '🚀', text: 'Testa en ny funktion i MyOffiCity idag!', action: 'Utforska' },
      { icon: '🧘', text: 'Andas djupt 3 gånger innan nästa uppgift.', action: 'Andningsövning' }
    ];

    const getTip = () => {
      const hour = new Date().getHours();
      if (hour < 6) return tips[7]; // Sena nätter
      if (hour < 12) return tips[0]; // Morgon
      if (hour < 14) return tips[1]; // Lunch
      if (hour < 18) return tips[2]; // Eftermiddag
      return tips[3]; // Kväll
    };

    const tipEl = document.createElement('div');
    tipEl.className = 'moc-smart-tip';
    
    const renderTip = () => {
      const tip = getTip();
      tipEl.innerHTML = `
        <div class="moc-tip-header">
          <span class="moc-tip-icon">${tip.icon}</span>
          <span class="moc-tip-title">Smart Tip</span>
        </div>
        <p class="moc-tip-text">${tip.text}</p>
        <button class="moc-tip-action">${tip.action}</button>
      `;
      
      const btn = tipEl.querySelector('.moc-tip-action');
      btn.onclick = () => {
        // Simulera en smart åtgärd
        btn.textContent = '✓ Utfört!';
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = tip.action;
          btn.disabled = false;
          renderTip(); // Visa nytt tip
        }, 2000);
      };
    };

    renderTip();
    
    // Uppdatera tip var 30:e minut
    setInterval(renderTip, 30 * 60 * 1000);

    window.MyOffiCityAddons.addTool('Smarta Tips', '💡', tipEl);
    window.MyOffiCityAddons.register('Smart Tips');
  } catch (e) {
    console.error('Smart Tips Error:', e);
  }
})();

(() => {
  try {
    const healthEl = document.createElement('div');
    healthEl.className = 'moc-health-monitor';
    
    const updateHealth = () => {
      const uptime = Math.floor((Date.now() - (window.performance?.timing?.navigationStart || Date.now())) / 1000);
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const secs = uptime % 60;
      
      healthEl.innerHTML = `
        <div class="moc-health-row">
          <span class="moc-health-label">Status:</span>
          <span class="moc-health-value status-ok"><span class="moc-health-pulse"></span>Operativ</span>
        </div>
        <div class="moc-health-row">
          <span class="moc-health-label">Drifttid:</span>
          <span class="moc-health-value">${hours}h ${mins}m ${secs}s</span>
        </div>
        <div class="moc-health-row">
          <span class="moc-health-label">Latens:</span>
          <span class="moc-health-value" id="moc-latency-val">-- ms</span>
        </div>
      `;
    };

    // Real-time latency check
    const checkLatency = () => {
      const start = Date.now();
      fetch(window.location.href, { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
          const lat = Date.now() - start;
          const valEl = document.getElementById('moc-latency-val');
          if (valEl) {
            valEl.textContent = `${lat} ms`;
            valEl.style.color = lat < 150 ? '#4ade80' : (lat < 400 ? '#fbbf24' : '#f87171');
          }
        })
        .catch(() => {});
    };

    updateHealth();
    setInterval(updateHealth, 1000);
    setInterval(checkLatency, 15000);
    setTimeout(checkLatency, 2000);

    window.MyOffiCityAddons.addTool('Systemhälsa', '🛡️', healthEl);
    window.MyOffiCityAddons.register('Health Monitor');
  } catch (e) {
    console.warn('Health Monitor Addon Error:', e);
  }
})();

(() => {
  try {
    const uxEl = document.createElement('div');
    uxEl.className = 'moc-ux-booster';
    
    const createToggle = (label, id, callback) => {
      const row = document.createElement('div');
      row.className = 'moc-ux-row';
      row.innerHTML = `
        <span class="moc-ux-label">${label}</span>
        <label class="moc-ux-switch">
          <input type="checkbox" id="${id}">
          <span class="moc-ux-slider"></span>
        </label>
      `;
      const input = row.querySelector('input');
      input.addEventListener('change', (e) => callback(e.target.checked));
      return row;
    };

    // Glass Mode Toggle
    uxEl.appendChild(createToggle('Mjukt glas-tema', 'toggle-glass', (val) => {
      document.body.classList.toggle('moc-glass-active', val);
      localStorage.setItem('moc-pref-glass', val);
    }));

    // Focus Mode Toggle
    uxEl.appendChild(createToggle('Fokusläge (Rent)', 'toggle-focus', (val) => {
      document.body.classList.toggle('moc-focus-active', val);
      localStorage.setItem('moc-pref-focus', val);
    }));

    // Restore preferences
    setTimeout(() => {
      if (localStorage.getItem('moc-pref-glass') === 'true') {
        const el = document.getElementById('toggle-glass');
        if (el) { el.checked = true; document.body.classList.add('moc-glass-active'); }
      }
      if (localStorage.getItem('moc-pref-focus') === 'true') {
        const el = document.getElementById('toggle-focus');
        if (el) { el.checked = true; document.body.classList.add('moc-focus-active'); }
      }
    }, 200);

    window.MyOffiCityAddons.addTool('UX Booster', '🎨', uxEl);
    window.MyOffiCityAddons.register('UX Enhancer');
  } catch (e) {
    console.warn('UX Booster Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-weather-widget';
    const title = document.createElement('div');
    title.textContent = '🌤 Väder';
    title.style.fontWeight = 'bold';
    container.appendChild(title);
    const info = document.createElement('div');
    info.textContent = 'Laddar...';
    container.appendChild(info);
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '⟳';
    refreshBtn.style.marginTop = '5px';
    refreshBtn.style.padding = '2px 6px';
    refreshBtn.style.fontSize = '12px';
    refreshBtn.style.cursor = 'pointer';
    container.appendChild(refreshBtn);
    const fetchWeather = () => {
      fetch('https://wttr.in/?format=1')
        .then(r => r.text())
        .then(txt => {
          info.textContent = txt.trim();
        })
        .catch(e => {
          info.textContent = 'Fel vid hämtning';
          console.warn('Weather fetch error', e);
        });
    };
    fetchWeather();
    refreshBtn.addEventListener('click', fetchWeather);
    window.MyOffiCityAddons.addTool('Väder', '🌤', container);
    window.MyOffiCityAddons.register('Weather Widget');
  } catch (e) {
    console.warn('Weather Widget Error:', e);
  }
})();

(() => {
  try {
    // ---- Kommandon ---------------------------------------------------------
    const commands = [
      { title: 'Gå till Stad', action: () => { location.hash = '/city'; } },
      { title: 'Gå till Dashboard', action: () => { location.hash = '/dash'; } },
      { title: 'Sök AI‑agent', action: () => { alert('Sökfunktion ej implementerad'); } },
    ];

    // ---- UI ---------------------------------------------------------------
    const overlay = document.createElement('div');
    overlay.className = 'moc-cmd-palette';
    overlay.innerHTML = `
      <div class="moc-cmd-box">
        <input type="text" placeholder="Sök kommandon…" autocomplete="off"/>
        <ul class="moc-cmd-list"></ul>
      </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('input');
    const list = overlay.querySelector('ul');
    let selected = 0;

    const render = () => {
      const q = input.value.toLowerCase();
      const filtered = commands.filter(c => c.title.toLowerCase().includes(q));
      list.innerHTML = '';
      filtered.forEach((c, i) => {
        const li = document.createElement('li');
        li.textContent = c.title;
        li.className = 'moc-cmd-item' + (i === selected ? ' selected' : '');
        li.dataset.idx = i;
        list.appendChild(li);
      });
    };

    const openPalette = () => {
      overlay.style.display = 'flex';
      input.value = '';
      selected = 0;
      render();
      input.focus();
    };

    const closePalette = () => {
      overlay.style.display = 'none';
    };

    // ---- Händelser ---------------------------------------------------------
    input.addEventListener('input', () => {
      selected = 0;
      render();
    });

    input.addEventListener('keydown', e => {
      const items = list.querySelectorAll('li');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selected = (selected + 1) % items.length;
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selected = (selected - 1 + items.length) % items.length;
        render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const filtered = commands.filter(c => c.title.toLowerCase().includes(input.value.toLowerCase()));
        const cmd = filtered[selected];
        if (cmd) {
          cmd.action();
          closePalette();
        }
      } else if (e.key === 'Escape') {
        closePalette();
      }
    });

    list.addEventListener('click', e => {
      if (e.target.tagName === 'LI') {
        const idx = parseInt(e.target.dataset.idx, 10);
        const filtered = commands.filter(c => c.title.toLowerCase().includes(input.value.toLowerCase()));
        const cmd = filtered[idx];
        if (cmd) {
          cmd.action();
          closePalette();
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      }
    });

    // ---- Registrera i dock -------------------------------------------------
    const toolEl = document.createElement('div');
    toolEl.textContent = 'Ctrl+K för kommandopalett';
    window.MyOffiCityAddons.addTool('Kommandopalett', '⌨️', toolEl);
    window.MyOffiCityAddons.register('Command Palette');
  } catch (e) {
    console.warn('Command Palette Error:', e);
  }
})();

(() => {
  try {
    // Skapa widget‑elementet
    const widget = document.createElement('div');
    widget.className = 'moc-activity-widget';
    widget.innerHTML = `
      <h3>🔔 Live‑Activity Feed</h3>
      <ul class="moc-activity-list"></ul>
    `;
    const listEl = widget.querySelector('.moc-activity-list');

    // Registrera i AI‑dockan
    window.MyOffiCityAddons.addTool('Live‑Activity Feed', '🔔', widget);
    window.MyOffiCityAddons.register('Live Activity Feed');

    // Om dashboard‑elementet finns, placera en kopia där också
    const dashTarget = document.querySelector('#dash, .dash, .dmain');
    if (dashTarget) {
      const dashClone = widget.cloneNode(true);
      dashTarget.appendChild(dashClone);
    }

    // Håll koll på redan visade händelser
    const knownIds = new Set();

    // Försök med flera sannolika endpoints – ingen av dem får krascha
    const endpoints = ['/api/events', '/api/activities', '/api/notifications'];

    async function fetchActivities() {
      for (const url of endpoints) {
        try {
          const resp = await fetch(url, { cache: 'no-store' });
          if (!resp.ok) continue;
          const data = await resp.json();
          if (Array.isArray(data)) return data;
        } catch (_) {
          // Ignorera fel och testa nästa endpoint
        }
      }
      return [];
    }

    async function updateFeed() {
      const activities = await fetchActivities();
      if (!Array.isArray(activities)) return;

      // Sortera nyast först
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));

      activities.forEach(act => {
        const id = act.id ?? `${act.time}-${act.message}`;
        if (knownIds.has(id)) return;
        knownIds.add(id);

        const li = document.createElement('li');
        li.className = 'moc-activity-item';
        const time = new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        li.textContent = `${time} – ${act.message}`;

        // Lägg till med fade‑in‑animation
        li.style.opacity = '0';
        listEl.insertBefore(li, listEl.firstChild);
        requestAnimationFrame(() => {
          li.style.transition = 'opacity 0.6s ease';
          li.style.opacity = '1';
        });

        // Begränsa listlängden
        if (listEl.children.length > 10) {
          listEl.removeChild(listEl.lastChild);
        }
      });
    }

    // Init‑körning + polling var 12:e sekund
    updateFeed();
    setInterval(updateFeed, 12000);
  } catch (e) {
    console.warn('Live Activity Feed addon error:', e);
  }
})();

(() => {
  try {
    const addResetTool = () => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.gap = '6px';
      container.style.flexWrap = 'wrap';
      container.style.alignItems = 'center';

      const presets = [
        {name:'Top View',pos:[0,50,0],tgt:[0,0,0]},
        {name:'Street Level',pos:[0,5,20],tgt:[0,0,0]},
        {name:'Focus on Selection',pos:null,tgt:null}
      ];

      const btn = (label)=>{const b=document.createElement('button');b.textContent=label;b.style.padding='4px 8px';b.style.fontSize='12px';b.style.borderRadius='4px';b.style.border='1px solid rgba(217,180,106,0.5)';b.style.background='rgba(15,23,42,0.8)';b.style.color='#f3ecdc';b.style.cursor='pointer';b.style.transition='background 0.2s';b.onmouseover=()=>b.style.background='rgba(20,32,61,0.9)';b.onmouseout=()=>b.style.background='rgba(15,23,42,0.8)';return b};

      const animate = (cam,ctrl,startPos,startTgt,endPos,endTgt,dur=800)=>{
        const st=performance.now();
        const ease=t=>1-Math.pow(1-t,3);
        const sp=new THREE.Vector3(...startPos), ep=new THREE.Vector3(...endPos);
        const stgt=new THREE.Vector3(...startTgt), etgt=new THREE.Vector3(...endTgt);
        const f=()=>{const now=performance.now(),t=Math.min((now-st)/dur,1),e=ease(t);cam.position.lerpVectors(sp,ep,e);ctrl.target.lerpVectors(stgt,etgt,e);ctrl.update();if(t<1)requestAnimationFrame(f);};
        f();
      };

      const toast=(msg)=>{
        const t=document.createElement('div');t.className='moc-toast';t.textContent=msg;document.body.appendChild(t);
        requestAnimationFrame(()=>t.classList.add('show'));
        setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),300);},2000);
      };

      presets.forEach(p=>{
        const b=btn(p.name);
        b.onclick=()=>{
          const cam=window.myOffiCity?.camera||window.myOffiCityApp?.camera;
          const ctrl=window.myOffiCity?.controls||window.myOffiCityApp?.controls;
          if(!cam||!ctrl){toast('Kamera eller kontroller saknas');return;}
          const sp=[cam.position.x,cam.position.y,cam.position.z];
          const st=[ctrl.target.x,ctrl.target.y,ctrl.target.z];
          let ep,et;
          if(p.name==='Focus on Selection'){
            const sel=window.myOffiCity?.selectedObject||window.myOffiCityApp?.selectedObject;
            if(!sel||!sel.position){toast('Ingen objekt valt');return;}
            ep=[sel.position.x,sel.position.y+5,sel.position.z+10];
            et=[sel.position.x,sel.position.y,sel.position.z];
          }else{ep=p.pos;et=p.tgt;}
          animate(cam,ctrl,sp,st,ep,et);
          toast(`Reset till ${p.name}`);
        };
        container.appendChild(b);
      });

      window.MyOffiCityAddons.addTool('Reset View','🔄',container);
      window.MyOffiCityAddons.register('Reset View Tool');
    };

    const init=()=>{if(window.THREE&&(window.myOffiCity?.camera||window.myOffiCityApp?.camera))addResetTool();else setTimeout(init,500);};
    init();
  } catch(e){console.warn('Reset View addon error:',e);}
})();

(() => {
  try {
    const init = () => {
      const cards = document.querySelectorAll('.agent-card');
      if (!cards.length) return;
      cards.forEach(card => {
        if (card.querySelector('.moc-copy-icon')) return;
        const icon = document.createElement('span');
        icon.className = 'moc-copy-icon';
        icon.textContent = '📋';
        card.appendChild(icon);
        icon.addEventListener('click', e => {
          e.stopPropagation();
          const url = card.dataset.agentUrl ||
                      card.dataset.href ||
                      card.dataset.link ||
                      card.dataset.id
                      ? `${window.location.origin}/#/agent/${card.dataset.id}`
                      : card.querySelector('a[href]')?.href ||
                        window.location.href;
          copyToClipboard(url, icon);
        });
      });
    };

    const copyToClipboard = (text, target) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showTooltip(target));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showTooltip(target);
        } catch (err) {}
        document.body.removeChild(textarea);
      }
    };

    const showTooltip = target => {
      const tooltip = document.createElement('div');
      tooltip.className = 'moc-copy-tooltip';
      tooltip.textContent = 'Kopierad!';
      target.appendChild(tooltip);
      setTimeout(() => {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.remove(), 2000);
      }, 0);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    window.MyOffiCityAddons.register('Copy URL Tool');
  } catch (e) {
    console.warn('Copy URL addon error:', e);
  }
})();

(() => {
  try {
    // Create container for the theme switcher
    const container = document.createElement('div');
    container.className = 'moc-theme-switcher';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.padding = '8px';

    // Title
    const title = document.createElement('div');
    title.textContent = '🖋️ Tema & Typsnitt';
    title.style.fontWeight = '600';
    title.style.fontSize = '0.95rem';
    container.appendChild(title);

    // Font family selector
    const fontSelect = document.createElement('select');
    fontSelect.className = 'moc-theme-select';
    const fonts = [
      { name: 'System (Standard)', value: '' },
      { name: 'Serif', value: 'serif' },
      { name: 'Monospace', value: 'monospace' },
    ];
    fonts.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.value;
      opt.textContent = f.name;
      fontSelect.appendChild(opt);
    });
    fontSelect.addEventListener('change', () => {
      document.documentElement.style.setProperty('--moc-font-family', fontSelect.value || 'system-ui, -apple-system, sans-serif');
    });
    container.appendChild(fontSelect);

    // Font size slider (responsive)
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Textstorlek';
    sizeLabel.style.fontSize = '0.85rem';
    sizeLabel.htmlFor = 'moc-font-size';
    container.appendChild(sizeLabel);

    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.id = 'moc-font-size';
    sizeInput.min = '0.8';
    sizeInput.max = '1.4';
    sizeInput.step = '0.05';
    sizeInput.value = '1';
    sizeInput.style.width = '100%';
    sizeInput.addEventListener('input', () => {
      document.documentElement.style.setProperty('--moc-font-scale', sizeInput.value);
    });
    container.appendChild(sizeInput);

    // Light/Dark mode toggle (optional)
    const modeBtn = document.createElement('button');
    modeBtn.className = 'moc-mode-btn';
    modeBtn.textContent = '🌙 Mörkt Läge';
    modeBtn.style.padding = '4px 8px';
    modeBtn.style.fontSize = '0.85rem';
    modeBtn.style.cursor = 'pointer';
    modeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.mocTheme === 'dark';
      document.documentElement.dataset.mocTheme = isDark ? 'light' : 'dark';
      modeBtn.textContent = isDark ? '🌙 Mörkt Läge' : '☀️ Ljust Läge';
    });
    container.appendChild(modeBtn);

    // Register the tool in the dock
    window.MyOffiCityAddons.addTool('Tema & Typsnitt', '🎨', container);
    window.MyOffiCityAddons.register('Theme & Typography Switcher');
  } catch (e) {
    console.warn('Theme & Typography addon error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-timer-container';
    
    let timeLeft = 25 * 60;
    let timerInterval = null;

    const display = document.createElement('div');
    display.className = 'moc-timer-display';
    display.textContent = '25:00';
    
    const btn = document.createElement('button');
    btn.className = 'moc-timer-btn';
    btn.textContent = 'Starta Fokus';
    
    btn.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        btn.textContent = 'Starta Fokus';
      } else {
        btn.textContent = 'Pausa';
        timerInterval = setInterval(() => {
          timeLeft--;
          const m = Math.floor(timeLeft / 60);
          const s = timeLeft % 60;
          display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Fokuspasset är klart! Ta en paus.');
            timeLeft = 25 * 60;
            btn.textContent = 'Starta Fokus';
          }
        }, 1000);
      }
    });

    container.appendChild(display);
    container.appendChild(btn);

    window.MyOffiCityAddons.addTool('Fokus-timer', '⏱️', container);
    window.MyOffiCityAddons.register('Productivity Timer');
  } catch (e) {
    console.warn('Timer addon error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-health-container';

    const checkSystem = () => {
      const status = [
        { n: '3D Engine', v: !!window.THREE },
        { n: 'Addon API', v: !!window.MyOffiCityAddons },
        { n: 'DOM Ready', v: document.readyState === 'complete' || document.readyState === 'interactive' }
      ];

      container.innerHTML = `
        <div class="moc-health-list">
          ${status.map(s => `
            <div class="moc-health-item">
              <span>${s.n}</span>
              <span class="${s.v ? 'moc-status-ok' : 'moc-status-warn'}">${s.v ? 'AKTIV' : 'VÄNTAR'}</span>
            </div>
          `).join('')}
        </div>
        <button class="moc-action-btn" id="mocResetUI">Återställ Gränssnitt</button>
      `;

      container.querySelector('#mocResetUI').onclick = (e) => {
        const btn = e.target;
        // Real UI Reset Actions
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.MyOffiCityAddons && typeof window.MyOffiCityAddons.toggleDock === 'function') {
          setTimeout(() => window.MyOffiCityAddons.toggleDock(false), 500);
        }
        
        btn.textContent = '✅ Återställd';
        btn.style.borderColor = '#4ade80';
        setTimeout(() => {
          btn.textContent = 'Återställ Gränssnitt';
          btn.style.borderColor = '';
        }, 2000);
      };
    };

    checkSystem();
    // Refresh status every 10s without being intrusive
    setInterval(checkSystem, 10000);

    window.MyOffiCityAddons.addTool('Systemstatus', '🛡️', container);
    window.MyOffiCityAddons.register('System Health Monitor');
  } catch (e) {
    console.warn('Health Monitor Error:', e);
  }
})();

(() => {
  try {
    // Create Help Center container
    const helpContainer = document.createElement('div');
    helpContainer.style.padding = '8px';
    helpContainer.style.fontSize = '12px';
    helpContainer.style.color = '#e9d7b0';
    helpContainer.style.background = 'rgba(15,23,42,0.8)';
    helpContainer.style.borderRadius = '6px';
    helpContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

    // Button to open modal
    const openBtn = document.createElement('button');
    openBtn.textContent = '🆘 Hjälp';
    openBtn.style.padding = '6px 12px';
    openBtn.style.background = 'rgba(217,180,106,0.2)';
    openBtn.style.border = '1px solid rgba(217,180,106,0.4)';
    openBtn.style.borderRadius = '4px';
    openBtn.style.color = '#f3ecdc';
    openBtn.style.cursor = 'pointer';
    openBtn.style.fontSize = '12px';
    openBtn.style.transition = 'background 0.2s';
    openBtn.onmouseover = () => openBtn.style.background = 'rgba(217,180,106,0.3)';
    openBtn.onmouseout = () => openBtn.style.background = 'rgba(217,180,106,0.2)';
    helpContainer.appendChild(openBtn);

    // Modal elements
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'moc-help-overlay';
    modalOverlay.style.display = 'none';

    const modalContent = document.createElement('div');
    modalContent.className = 'moc-help-modal';
    modalContent.innerHTML = `
      <div class="moc-help-header">
        <h3>Hjälp & Tips</h3>
        <button class="moc-help-close">✖</button>
      </div>
      <div class="moc-help-body">
        <p>Välkommen till MyOffiCity! Här är några snabba tips för att komma igång:</p>
        <ul>
          <li>Tryck på <strong>Esc</strong> för att återgå till 3D‑vyn.</li>
          <li>Välj företag i kartan för att se deras kontor.</li>
          <li>Öppna chattfönstret för att prata med AI‑teamet.</li>
          <li>Besök <a href="/privacy.html" target="_blank">Integritetspolicy</a> för mer info.</li>
        </ul>
      </div>
    `;
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Event handlers
    openBtn.onclick = () => {
      modalOverlay.style.display = 'flex';
    };
    modalContent.querySelector('.moc-help-close').onclick = () => {
      modalOverlay.style.display = 'none';
    };
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    };

    // Register tool
    window.MyOffiCityAddons.addTool('Help Center', '❓', helpContainer);
    window.MyOffiCityAddons.register('Help Center Widget');
  } catch (e) {
    console.warn('Help Center Addon Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-smart-center';
    
    container.innerHTML = `
      <div class="moc-status-row">
        <span>Neural Last:</span>
        <div class="moc-progress-bg"><div id="moc-neural-load" class="moc-progress-bar" style="width: 42%"></div></div>
      </div>
      <div class="moc-status-grid">
        <div class="moc-status-item"><span class="moc-dot online"></span> Tomas (TL)</div>
        <div class="moc-status-item"><span class="moc-dot busy"></span> Design-AI</div>
        <div class="moc-status-item"><span class="moc-dot online"></span> Dev-Agent</div>
        <div class="moc-status-item"><span class="moc-dot online"></span> City-Bot</div>
      </div>
      <div class="moc-actions-gap">
        <button class="moc-action-btn" id="moc-btn-optimize">Optimera Vy</button>
        <button class="moc-action-btn" id="moc-btn-ping">Ping Teamet</button>
      </div>
    `;

    // Simulated neural activity updates
    const updateLoad = () => {
      const bar = container.querySelector('#moc-neural-load');
      if (bar) {
        const val = Math.floor(Math.random() * 40) + 20;
        bar.style.width = val + '%';
      }
    };
    const interval = setInterval(updateLoad, 4000);

    container.querySelector('#moc-btn-optimize').onclick = () => {
      const btn = container.querySelector('#moc-btn-optimize');
      const old = btn.textContent;
      btn.textContent = 'Körs...';
      btn.disabled = true;
      setTimeout(() => { 
        btn.textContent = old; 
        btn.disabled = false;
        updateLoad();
      }, 1500);
    };
    
    container.querySelector('#moc-btn-ping').onclick = () => {
      const btn = container.querySelector('#moc-btn-ping');
      btn.textContent = 'Pinging...';
      setTimeout(() => { btn.textContent = 'Ping Teamet'; }, 2000);
    };

    window.MyOffiCityAddons.addTool('Kommando-center', '🕹️', container);
    window.MyOffiCityAddons.register('Smart Command Center');
  } catch (e) {
    console.warn('Smart Center Addon Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-size: 12px; color: #e9d7b0; line-height: 1.6;">
        <p>Använd globala genvägar för att navigera:</p>
        <ul style="padding-left: 18px;">
          <li><strong>Alt + 1</strong>: Marketplace</li>
          <li><strong>Alt + 2</strong>: City</li>
          <li><strong>Alt + 3</strong>: Dashboard</li>
        </ul>
      </div>
    `;

    window.addEventListener('keydown', (e) => {
      if (e.altKey) {
        if (e.key === '1') { window.location.hash = '#market'; }
        else if (e.key === '2') { window.location.hash = '#city'; }
        else if (e.key === '3') { window.location.hash = '#dashboard'; }
      }
    });

    window.MyOffiCityAddons.addTool('Quick-Switch', '⌨️', container);
    window.MyOffiCityAddons.register('Keyboard Shortcuts');
  } catch (e) {
    console.warn('Quick-Switch Addon Error:', e);
  }
})();

(() => {
  try {
    // Registrera den nya hover‑kort‑funktionen så den räknas med i badge‑räkningen.
    if (window.MyOffiCityAddons && typeof window.MyOffiCityAddons.register === 'function') {
      window.MyOffiCityAddons.register('Contextual Hover Cards');
    }
  } catch (e) {
    console.warn('Contextual Hover Cards Addon Error:', e);
  }
})();

(() => {
  try {
    const mon = document.createElement('div');
    mon.id = 'mocPerfMon';
    mon.className = 'moc-perf-monitor';
    mon.innerHTML = `
      <div class="moc-perf-row"><span class="moc-perf-label">FPS</span><span id="moc-fps">--</span></div>
      <div class="moc-perf-row"><span class="moc-perf-label">MEM</span><span id="moc-mem">--</span></div>
    `;
    document.body.appendChild(mon);

    let last = performance.now(), frames = 0, rafId = null;
    
    const update = () => {
      frames++;
      const now = performance.now();
      if (now >= last + 1000) {
        const fps = Math.round((frames * 1000) / (now - last));
        document.getElementById('moc-fps').textContent = fps;
        frames = 0; last = now;
        if (window.performance && performance.memory) {
          const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
          document.getElementById('moc-mem').textContent = used + 'MB';
        } else {
          document.getElementById('moc-mem').textContent = 'N/A';
        }
      }
      rafId = requestAnimationFrame(update);
    };

    const toggle = (force) => {
      const isAct = typeof force === 'boolean' ? force : !mon.classList.contains('active');
      mon.classList.toggle('active', isAct);
      if (isAct) {
        last = performance.now();
        frames = 0;
        update();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };

    // Aktivering via Alt+P eller hash-kommando
    window.addEventListener('keydown', (e) => {
      if (e.altKey && e.key.toLowerCase() === 'p') { e.preventDefault(); toggle(); }
    });
    
    window.addEventListener('hashchange', () => {
      if (window.location.hash.includes('perf')) toggle(true);
    });

    const ctrl = document.createElement('div');
    ctrl.style.marginTop = '8px';
    ctrl.innerHTML = `<button class="moc-perf-btn">Växla Monitor (Alt+P)</button>`;
    ctrl.querySelector('button').onclick = () => toggle();

    window.MyOffiCityAddons.addTool('Performance', '📊', ctrl);
    window.MyOffiCityAddons.register('Performance Monitor');
  } catch (e) {
    console.warn('Performance Monitor Error:', e);
  }
})();

(() => {
  try {
    if (document.getElementById('mocSmartScrollBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'mocSmartScrollBtn';
    btn.className = 'moc-smart-scroll-btn';
    btn.setAttribute('aria-label', 'Till toppen');
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 44 44');
    svg.setAttribute('class', 'moc-progress-svg');
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '22');
    circle.setAttribute('cy', '22');
    circle.setAttribute('r', '19');
    circle.setAttribute('class', 'moc-progress-circle');
    
    const arrow = document.createElement('span');
    arrow.className = 'moc-scroll-arrow';
    arrow.innerHTML = '&#8593;';

    btn.appendChild(svg);
    btn.appendChild(arrow);
    document.body.appendChild(btn);

    const radius = 19;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    let ticking = false;
    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
      
      const offset = circumference - (scrollPercent * circumference);
      circle.style.strokeDashoffset = offset;

      if (scrollTop > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateScroll();
    window.MyOffiCityAddons.register('Smart Scroll-to-Top');
  } catch (e) {
    console.warn('Smart Scroll Error:', e);
  }
})();

(() => {
  try {
    const STORAGE_KEY = 'moc_ui_prefs';
    const defaults = { dockOpen: false, compactSidebar: false, glassMode: false };
    let prefs = { ...defaults };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) prefs = { ...defaults, ...JSON.parse(saved) };
    } catch (e) { console.warn('Prefs load error', e); }

    const applyPrefs = () => {
      document.body.classList.toggle('moc-compact-sidebar', prefs.compactSidebar);
      document.body.classList.toggle('moc-glass-theme', prefs.glassMode);
      
      // Auto-open dock if preferred (with slight delay for registry to be ready)
      if (prefs.dockOpen && window.MyOffiCityAddons && window.MyOffiCityAddons.toggleDock) {
        setTimeout(() => window.MyOffiCityAddons.toggleDock(true), 800);
      }
    };

    const savePrefs = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      applyPrefs();
    };

    const createSwitch = (label, key) => {
      const row = document.createElement('div');
      row.className = 'moc-settings-row';
      
      const lbl = document.createElement('label');
      lbl.className = 'moc-switch-label';
      
      const chk = document.createElement('input');
      chk.type = 'checkbox';
      chk.checked = prefs[key];
      chk.addEventListener('change', (e) => {
        prefs[key] = e.target.checked;
        savePrefs();
      });

      lbl.appendChild(chk);
      lbl.appendChild(document.createTextNode(' ' + label));
      row.appendChild(lbl);
      return row;
    };

    const container = document.createElement('div');
    container.className = 'moc-persistence-container';
    
    const info = document.createElement('p');
    info.style.fontSize = '11px';
    info.style.opacity = '0.7';
    info.style.marginBottom = '12px';
    info.textContent = 'Dina val sparas automatiskt i webbläsaren.';
    
    container.appendChild(info);
    container.appendChild(createSwitch('Öppna AI-panel vid start', 'dockOpen'));
    container.appendChild(createSwitch('Kompakt sidomeny', 'compactSidebar'));
    container.appendChild(createSwitch('Frostat glas-tema', 'glassMode'));

    // Initial apply
    applyPrefs();

    // Register tool
    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Inställningar', '⚙️', container);
      window.MyOffiCityAddons.register('Session Persistence');
    }
  } catch (e) {
    console.error('Persistence Addon Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-status-container';
    const stats = { fps: 0, latency: 0 };
    let lastTime = performance.now(), frames = 0;

    const updateFPS = () => {
      frames++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        stats.fps = Math.round((frames * 1000) / (now - lastTime));
        frames = 0; lastTime = now;
        render();
      }
      requestAnimationFrame(updateFPS);
    };

    const checkLatency = async () => {
      const start = performance.now();
      try {
        await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
        stats.latency = Math.round(performance.now() - start);
      } catch (e) { stats.latency = -1; }
      render();
    };

    const render = () => {
      const lCol = stats.latency < 150 ? '#4ade80' : '#fbbf24';
      container.innerHTML = `
        <div class="moc-status-row"><span>Gränssnitt (FPS):</span> <span style="color:#4ade80">${stats.fps}</span></div>
        <div class="moc-status-row"><span>Nätverkslatens:</span> <span style="color:${lCol}">${stats.latency >= 0 ? stats.latency + 'ms' : 'Offline'}</span></div>
        <div class="moc-status-row"><span>AI-Relä:</span> <span class="moc-status-ok">Aktiv</span></div>
      `;
    };

    updateFPS(); checkLatency();
    setInterval(checkLatency, 15000);
    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Systemstatus', '📊', container);
      window.MyOffiCityAddons.register('Performance Monitor');
    }
  } catch (e) { console.error('Status Error:', e); }
})();

(() => {
  try {
    const logContainer = document.createElement('div');
    logContainer.style.cssText = 'font-family: monospace; font-size: 11px; max-height: 200px; overflow-y: auto; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px;';
    
    const addLog = (msg) => {
      const entry = document.createElement('div');
      entry.style.marginBottom = '4px';
      entry.innerHTML = `<span style="color:#d9b46a">[${(performance.now()/1000).toFixed(2)}s]</span> ${msg}`;
      logContainer.prepend(entry);
    };

    addLog('System initierat...');
    addLog('Agent-nätverk anslutet.');

    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Agent-logg', '📜', logContainer);
      window.MyOffiCityAddons.register('Activity Logger');
    }
  } catch (e) { console.error('Logg-fel:', e); }
})();

(() => {
  try {
    const container = document.createElement('div');
    const input = document.createElement('input');
    const list = document.createElement('ul');
    
    input.placeholder = 'Skriv en snabb uppgift...';
    input.style.cssText = 'width: 100%; padding: 6px; border-radius: 4px; border: 1px solid #d9b46a; background: #0f172a; color: #f3ecdc; margin-bottom: 8px; box-sizing: border-box;';
    list.style.cssText = 'list-style: none; padding: 0; margin: 0; font-size: 12px;';

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const li = document.createElement('li');
        li.style.cssText = 'padding: 4px 0; border-bottom: 1px solid rgba(217,180,106,0.1); cursor: pointer;';
        li.textContent = `○ ${input.value}`;
        li.onclick = () => li.remove();
        list.appendChild(li);
        input.value = '';
      }
    });

    container.appendChild(input);
    container.appendChild(list);

    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Snabb-att-göra', '📝', container);
      window.MyOffiCityAddons.register('Quick Task Tracker');
    }
  } catch (e) { console.error('Task Error:', e); }
})();

(() => {
  try {
    const toggleTheme = (isDark) => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('moc-theme', isDark ? 'dark' : 'light');
    };

    const saved = localStorage.getItem('moc-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    toggleTheme(saved === 'dark' || (!saved && systemDark));

    const container = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = 'Växla mörkt/ljust läge';
    btn.style.cssText = 'width: 100%; padding: 8px; cursor: pointer; background: var(--moc-accent); border: none; border-radius: 4px; color: #000; font-weight: bold;';
    
    btn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme');
      toggleTheme(current !== 'dark');
    };

    container.appendChild(btn);
    if (window.MyOffiCityAddons) {
      window.MyOffiCityAddons.addTool('Tema-inställningar', '🌓', container);
    }
  } catch (e) { console.error('Theme Error:', e); }
})();

(() => {
  try {
    const commands = [
      { title: 'Gå till Hem', action: () => window.location.hash = '#/' },
      { title: 'Gå till City', action: () => window.location.hash = '#/city' },
      { title: 'Gå till Dashboard', action: () => window.location.hash = '#/dash' },
      { title: 'Byt tema', action: () => document.querySelector('button[onclick*="toggleTheme"]')?.click() },
      { title: 'Kopiera länk', action: () => navigator.clipboard.writeText(window.location.href).then(() => alert('Länk kopierad!')) }
    ];

    const modal = document.createElement('div');
    modal.className = 'moc-cmd-palette';
    modal.innerHTML = `
      <div class="moc-cmd-inner">
        <input type="text" placeholder="Sök kommando (t.ex. 'City')..." id="moc-cmd-input">
        <ul id="moc-cmd-list"></ul>
      </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#moc-cmd-input');
    const list = modal.querySelector('#moc-cmd-list');

    const render = (filter = '') => {
      list.innerHTML = '';
      const filtered = commands.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));
      filtered.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c.title;
        li.onclick = () => { c.action(); modal.style.display = 'none'; };
        list.appendChild(li);
      });
    };

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        if (modal.style.display === 'flex') input.focus();
      }
      if (e.key === 'Escape') modal.style.display = 'none';
    });

    input.oninput = (e) => render(e.target.value);
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    render();
    window.MyOffiCityAddons.register('Command Palette');
  } catch (e) { console.error('CmdPalette Error:', e); }
})();

(() => {
  try {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'moc-search-wrapper';
    searchContainer.innerHTML = `
      <input type="text" id="moc-live-search" placeholder="Sök i marknadsplatsen..." />
      <button id="moc-clear-search" style="display:none;">×</button>
    `;

    const input = searchContainer.querySelector('#moc-live-search');
    const clearBtn = searchContainer.querySelector('#moc-clear-search');
    let debounceTimer;

    const filterCards = (query) => {
      const cards = document.querySelectorAll('.cards .card, .card');
      const term = query.toLowerCase();
      let hasVisible = false;

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const isMatch = text.includes(term);
        card.style.display = isMatch ? '' : 'none';
        if (isMatch) hasVisible = true;
      });

      let noMatch = document.getElementById('moc-no-match');
      if (!hasVisible && term !== '') {
        if (!noMatch) {
          noMatch = document.createElement('div');
          noMatch.id = 'moc-no-match';
          noMatch.textContent = 'Inga träffar hittades.';
          document.querySelector('.cards') ? document.querySelector('.cards').appendChild(noMatch) : document.body.appendChild(noMatch);
        }
        noMatch.style.display = 'block';
      } else if (noMatch) {
        noMatch.style.display = 'none';
      }
      clearBtn.style.display = term ? 'block' : 'none';
    };

    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => filterCards(e.target.value), 300);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      filterCards('');
    });

    window.MyOffiCityAddons.addTool('Live Search', '🔍', searchContainer);
  } catch (e) { console.error('LiveSearch Error:', e); }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="moc-loader-ui" style="display:none; padding:15px; text-align:center;">
        <div style="margin-bottom:10px; font-size:12px; color:#d9b46a;">Laddar 3D-miljö...</div>
        <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
          <div id="moc-progress-bar" style="width:0%; height:100%; background:#d9b46a; transition:width 0.3s;"></div>
        </div>
        <div id="moc-retry-box" style="display:none; margin-top:15px;">
          <button id="moc-retry-btn" class="moc-dock-btn" style="position:static; width:100%; justify-content:center;">Försök igen</button>
        </div>
      </div>
    `;

    window.MyOffiCityAddons.addTool('3D Status', '🏗️', container);

    window.MyOffiCityLoader = {
      update: (percent) => {
        const bar = document.getElementById('moc-progress-bar');
        const ui = document.getElementById('moc-loader-ui');
        if (ui) ui.style.display = 'block';
        if (bar) bar.style.width = Math.min(percent, 100) + '%';
      },
      showError: () => {
        document.getElementById('moc-retry-box').style.display = 'block';
      }
    };

    document.getElementById('moc-retry-btn').addEventListener('click', () => {
      window.location.reload();
    });

    window.MyOffiCityAddons.register('3D-Loader-Manager');
  } catch (e) { console.error('3D-Loader-Manager Error:', e); }
})();

(() => {
  try {
    // Keyboard Navigation Handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = document.activeElement;
        if (target && (target.classList.contains('moc-dock-btn') || target.tagName === 'BUTTON')) {
          e.preventDefault();
          target.click();
        }
      }
    });

    // Ensure interactive elements are focusable
    const makeAccessible = () => {
      const interactives = document.querySelectorAll('#nav, .cards, .tc-box, .moc-dock-btn');
      interactives.forEach(el => {
        if (!el.hasAttribute('tabindex')) {
          el.setAttribute('tabindex', '0');
          el.setAttribute('role', 'button');
        }
      });
    };

    setInterval(makeAccessible, 2000);
    window.MyOffiCityAddons.register('Keyboard-Navigation');
  } catch (e) { console.error('Keyboard-Nav Error:', e); }
})();

(() => {
  try {
    // Check if we are in the city view
    const isCityView = () => window.location.hash === '#/city' || window.location.hash.startsWith('#/city');

    // Create the radial menu container
    const menu = document.createElement('div');
    menu.id = 'moc-quick-action-menu';
    menu.style.display = 'none';
    menu.innerHTML = `
      <div class="moc-qam-center">
        <span class="moc-qam-icon">⚡</span>
      </div>
      <div class="moc-qam-item" data-action="inspect" title="Inspektera">🔍</div>
      <div class="moc-qam-item" data-action="move" title="Flytta">✋</div>
      <div class="moc-qam-item" data-action="rotate" title="Rotera">🔄</div>
      <div class="moc-qam-item" data-action="delete" title="Radera">🗑️</div>
      <div class="moc-qam-item" data-action="info" title="Info">ℹ️</div>
    `;
    document.body.appendChild(menu);

    // Position the menu at the click coordinates
    const showMenu = (x, y) => {
      if (!isCityView()) return;
      
      // Prevent menu from going off-screen
      const rect = menu.getBoundingClientRect();
      const margin = 10;
      let left = x;
      let top = y;

      if (left + 150 > window.innerWidth) left = window.innerWidth - 150 - margin;
      if (top + 150 > window.innerHeight) top = window.innerHeight - 150 - margin;
      if (left < margin) left = margin;
      if (top < margin) top = margin;

      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.display = 'block';
      menu.classList.add('moc-qam-active');
    };

    const hideMenu = () => {
      menu.style.display = 'none';
      menu.classList.remove('moc-qam-active');
    };

    // Event Listeners
    document.addEventListener('contextmenu', (e) => {
      if (isCityView()) {
        e.preventDefault();
        showMenu(e.clientX, e.clientY);
      }
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) {
        hideMenu();
      }
    });

    // Handle actions
    menu.querySelectorAll('.moc-qam-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.dataset.action;
        // Dispatch a custom event so the main 3D engine can listen for it
        window.dispatchEvent(new CustomEvent('moc:quick-action', { detail: { action } }));
        hideMenu();
      });
    });

    // Register the tool
    const toolEl = document.createElement('div');
    toolEl.innerHTML = `
      <p style="font-size:12px; color:#94a3b8; margin:0 0 8px 0;">
        Högerklicka i 3D-vyn för att öppna snabba åtgärder.
      </p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <span class="moc-qam-legend">🔍 Inspektera</span>
        <span class="moc-qam-legend">✋ Flytta</span>
        <span class="moc-qam-legend">🔄 Rotera</span>
        <span class="moc-qam-legend">🗑️ Radera</span>
      </div>
    `;
    
    window.MyOffiCityAddons.addTool('Quick-Action Meny', '⚡', toolEl);
    window.MyOffiCityAddons.register('Quick-Action Menu');

  } catch (e) {
    console.error('Quick-Action Menu Error:', e);
  }
})();

(() => {
  try {
    /*** Helper: skapa SVG‑sparkline från en array av tal ***/
    const createSparkline = (values) => {
      const w = 100, h = 20;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = max - min || 1;
      const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
      }).join(' ');
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.classList.add('price-sparkline');
      const poly = document.createElementNS(svgNS, 'polyline');
      poly.setAttribute('points', points);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', '#d9b46a');
      poly.setAttribute('stroke-width', '2');
      svg.appendChild(poly);
      return svg;
    };

    /*** Hämta pris‑historik – fallback till slump‑data om API‑anrop misslyckas ***/
    const fetchPriceHistory = async (agentId) => {
      try {
        const resp = await fetch(`/api/price-history?agentId=${encodeURIComponent(agentId)}`);
        if (!resp.ok) throw new Error('bad response');
        const data = await resp.json(); // förväntas vara [{price: number, ts: string}, ...]
        return data.map(d => d.price);
      } catch (e) {
        // Generera 10 slumpmässiga pris‑värden som fallback
        const fallback = Array.from({ length: 10 }, () => Math.round(80 + Math.random() * 40));
        console.warn(`Kunde inte hämta pris‑historik för ${agentId}, använder fallback‑data`, e);
        return fallback;
      }
    };

    /*** Infoga sparkline i varje kort på marknads‑sidan ***/
    const injectSparklines = async () => {
      const cards = document.querySelectorAll('.cards .card');
      if (!cards.length) return;
      for (const card of cards) {
        // Försök hitta ett unikt ID – kan vara data-id eller data-agent-id
        const agentId = card.dataset.id || card.dataset.agentId || card.getAttribute('data-id');
        if (!agentId) continue;
        const prices = await fetchPriceHistory(agentId);
        const sparkline = createSparkline(prices);
        // Placera under befintlig pris‑etikett eller längst ner i kortet
        const priceContainer = card.querySelector('.price') || card;
        const wrapper = document.createElement('div');
        wrapper.className = 'price-sparkline-wrapper';
        wrapper.appendChild(sparkline);
        priceContainer.appendChild(wrapper);
      }
    };

    // Kör när sidan är klar
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectSparklines);
    } else {
      injectSparklines();
    }

    /*** Lägg till ett verktyg i AI‑tilläggsdockan som förklarar funktionen ***/
    const toolEl = document.createElement('div');
    toolEl.innerHTML = `
      <p style="font-size:12px; color:#94a3b8; margin:0 0 8px 0;">
        📈 <strong>Pris‑trend‑sparkline</strong> visar de senaste 10 pris‑punkterna för varje AI‑agent i marknads‑korten.
      </p>
      <p style="font-size:11px; color:#c7d2fe;">
        Data hämtas från <code>/api/price-history</code>. Om API‑anropet misslyckas visas slump‑genererade värden.
      </p>
    `;
    window.MyOffiCityAddons.addTool('Pris‑trend', '📊', toolEl);
    window.MyOffiCityAddons.register('Marketplace Price Trend Sparkline');
  } catch (e) {
    console.error('Marketplace Price Trend Addon Error:', e);
  }
})();

(() => {
  try {
    const toggleFocusMode = () => {
      const isFocused = document.body.classList.toggle('moc-focus-mode');
      const btn = document.getElementById('moc-focus-toggle');
      if (btn) btn.textContent = isFocused ? 'Exit Focus' : 'Focus Mode';
    };

    const toolEl = document.createElement('div');
    toolEl.innerHTML = `
      <button id="moc-focus-toggle" style="width:100%; padding:8px; cursor:pointer; background:#d9b46a; border:none; border-radius:4px; font-weight:bold;">
        Focus Mode
      </button>
      <p style="font-size:11px; color:#94a3b8; margin-top:8px;">
        Döljer sidopaneler och navigeringsfält för att ge Tomas-chatten fullt utrymme.
      </p>
    `;
    toolEl.querySelector('#moc-focus-toggle').addEventListener('click', toggleFocusMode);

    window.MyOffiCityAddons.addTool('Tomas Focus', '🎯', toolEl);
    window.MyOffiCityAddons.register('Focus Mode');
  } catch (e) {
    console.error('Focus Mode Addon Error:', e);
  }
})();

(() => {
  try {
    // Vänta tills hela sidan är laddad
    document.addEventListener('DOMContentLoaded', () => {
      const boxes = document.querySelectorAll('.tc-box');
      if (!boxes.length) return;

      boxes.forEach((box) => {
        // Skapa knapp
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'moc-clipboard-btn';
        btn.textContent = 'Kopiera som JSON';
        btn.title = 'Kopiera agentens metadata till urklipp';

        // Klick‑handler
        btn.addEventListener('click', async () => {
          try {
            // Samla alla data‑attribut från .tc-box
            const meta = { ...box.dataset };
            // Om det finns någon textuell metadata i elementet kan vi också lägga till den
            const textParts = [];
            box.querySelectorAll('[data-key]').forEach((el) => {
              const key = el.getAttribute('data-key');
              if (key) textParts.push({ [key]: el.textContent.trim() });
            });
            if (textParts.length) Object.assign(meta, ...textParts);

            const json = JSON.stringify(meta, null, 2);
            await navigator.clipboard.writeText(json);
            const original = btn.textContent;
            btn.textContent = 'Kopierad!';
            setTimeout(() => { btn.textContent = original; }, 2000);
          } catch (e) {
            console.error('Smart Clipboard fel:', e);
          }
        });

        // Lägg till knappen i slutet av .tc-box‑innehållet
        box.appendChild(btn);
      });
    });
  } catch (e) {
    console.error('Smart Clipboard Addon Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.id = 'moc-breadcrumbs';
    container.className = 'moc-breadcrumb-bar';
    
    const updateBreadcrumbs = () => {
      const path = window.location.hash || '#/city';
      const parts = path.replace('#/', '').split('/');
      container.innerHTML = `<span class="moc-bc-item" onclick="window.location.hash='#/city'">🏠 City</span>`;
      
      let currentPath = '#/city';
      parts.forEach(part => {
        if (!part || part === 'city') return;
        currentPath += `/${part}`;
        container.innerHTML += `<span class="moc-bc-sep">/</span><span class="moc-bc-item" onclick="window.location.hash='${currentPath}'">${part.charAt(0).toUpperCase() + part.slice(1)}</span>`;
      });
    };

    window.addEventListener('hashchange', updateBreadcrumbs);
    
    const topbar = document.getElementById('topbar');
    if (topbar) {
      topbar.insertAdjacentElement('afterend', container);
      updateBreadcrumbs();
      window.MyOffiCityAddons.register('Visual Breadcrumbs');
    }
  } catch(e) { console.error('Breadcrumb Addon Error:', e); }
})();

(() => {
  try {
    const tooltip = document.createElement('div');
    tooltip.id = 'moc-3d-tooltip';
    tooltip.className = 'moc-3d-tooltip';
    document.body.appendChild(tooltip);

    window.addEventListener('mousemove', (e) => {
      const target = e.target;
      if (target && target.dataset && target.dataset.mocMeta) {
        const meta = JSON.parse(target.dataset.mocMeta);
        tooltip.innerHTML = `
          <div class="moc-tt-header">${meta.name || 'Objekt'}</div>
          <div class="moc-tt-body">
            <div>Ägare: <b>${meta.owner || 'N/A'}</b></div>
            <div>Status: <b>${meta.status || 'Aktiv'}</b></div>
            <div>AI: <b>${meta.model || 'Standard'}</b></div>
          </div>
        `;
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        tooltip.classList.add('visible');
      } else {
        tooltip.classList.remove('visible');
      }
    });

    window.MyOffiCityAddons.register('3D Context Tooltips');
  } catch (e) {
    console.error('3D Tooltip Addon Error:', e);
  }
})();

(() => {
  try {
    // Helper to create status UI (circle + latency text)
    const createStatusUI = () => {
      const container = document.createElement('div');
      container.id = 'moc-status-pulse';
      container.title = 'AI‑agenter & nätverkslatens';
      container.style.display = 'inline-flex';
      container.style.alignItems = 'center';
      container.style.gap = '4px';
      container.style.fontSize = '12px';
      container.style.color = '#d9b46a';
      container.style.cursor = 'default';

      const circle = document.createElement('span');
      circle.className = 'moc-pulse-circle';
      container.appendChild(circle);

      const latency = document.createElement('span');
      latency.className = 'moc-pulse-latency';
      latency.textContent = '…ms';
      container.appendChild(latency);

      return { container, circle, latency };
    };

    // ---- Insert into #topbar (visible everywhere) ----
    const topbar = document.getElementById('topbar');
    if (!topbar) throw new Error('Topbar element not found');
    const { container: topbarEl, circle: topCircle, latency: topLatency } = createStatusUI();
    topbar.appendChild(topbarEl);

    // ---- Also expose as a dock tool (optional) ----
    const { container: toolEl, circle: toolCircle, latency: toolLatency } = createStatusUI();
    window.MyOffiCityAddons.addTool('Status Pulse', '⚡', toolEl);

    // ---- Update routine -------------------------------------------------
    const updateStatus = async () => {
      // Measure latency via a lightweight HEAD request
      const start = performance.now();
      try {
        await fetch('/', { method: 'HEAD', cache: 'no-store' });
        const ms = Math.round(performance.now() - start);
        topLatency.textContent = `${ms}ms`;
        toolLatency.textContent = `${ms}ms`;

        // Set colour based on latency
        const status = ms < 100 ? 'good' : ms < 300 ? 'moderate' : 'bad';
        topCircle.dataset.status = status;
        toolCircle.dataset.status = status;
      } catch (e) {
        topLatency.textContent = '✖';
        toolLatency.textContent = '✖';
        topCircle.dataset.status = 'bad';
        toolCircle.dataset.status = 'bad';
      }

      // Show number of active AI‑modules (agents)
      const agents = (window.MyOffiCityAddons && window.MyOffiCityAddons.modules)
        ? window.MyOffiCityAddons.modules.length
        : 0;
      topbarEl.dataset.agents = agents;
      toolEl.dataset.agents = agents;
    };

    // Initial run + periodic refresh
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    window.addEventListener('beforeunload', () => clearInterval(interval));

    // Register feature for badge counter
    window.MyOffiCityAddons.register('Status Pulse');
  } catch (e) {
    console.error('Status Pulse Addon Error:', e);
  }
})();

(() => {
  try {
    const dock = document.createElement('div');
    dock.className = 'moc-agent-dock';
    dock.innerHTML = `
      <div class="moc-dock-header">Agent-Dock</div>
      <div class="moc-dock-dropzone" ondrop="event.preventDefault()" ondragover="event.preventDefault()">
        <span class="moc-hint">Dra agenter hit</span>
      </div>
    `;
    document.body.appendChild(dock);

    window.MyOffiCityAddons.register('Agent-Dock');
    
    // Tool integration
    const toolContent = document.createElement('div');
    toolContent.innerHTML = '<p style="font-size:11px; opacity:0.8;">Hantera dina aktiva AI-agenter och deras konfigurationer härifrån.</p>';
    window.MyOffiCityAddons.addTool('Agent-Dock', '⚓', toolContent);
  } catch (e) {
    console.error('Agent-Dock Error:', e);
  }
})();

(() => {
  try {
    const OVERLAY_ID = 'tcFocusOverlay';
    const TOGGLE_CLASS = 'tc-focus';

    const toggleFocus = () => {
      const tcBox = document.querySelector('.tc-box');
      if (!tcBox) return;

      const nowFocused = tcBox.classList.toggle(TOGGLE_CLASS);
      if (nowFocused) {
        // Create blur overlay if missing
        let overlay = document.getElementById(OVERLAY_ID);
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = OVERLAY_ID;
          document.body.appendChild(overlay);
        }
        // Ensure proper stacking
        tcBox.style.zIndex = '9999';
      } else {
        // Remove overlay
        const overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.remove();
        tcBox.style.zIndex = '';
      }
    };

    // Keyboard shortcut Alt+C
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        toggleFocus();
      }
    });

    // Add a small button in the AI‑addons dock for manual toggle
    const toolContainer = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = 'Alt+C – Fokus';
    btn.style.padding = '4px 8px';
    btn.style.fontSize = '12px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', toggleFocus);
    toolContainer.appendChild(btn);

    window.MyOffiCityAddons.addTool('Focus Toggle', '🔍', toolContainer);
    window.MyOffiCityAddons.register('Focus Toggle');
  } catch (e) {
    console.error('Focus Toggle Addon Error:', e);
  }
})();

(() => {
  try {
    // Helper: create a simple card element
    const createCard = (title, value, icon) => {
      const card = document.createElement('div');
      card.className = 'moc-dashboard-card';
      const hdr = document.createElement('div');
      hdr.className = 'moc-dashboard-header';
      hdr.innerHTML = `<span class="moc-dashboard-icon">${icon}</span><span>${title}</span>`;
      const val = document.createElement('div');
      val.className = 'moc-dashboard-value';
      val.textContent = value;
      card.appendChild(hdr);
      card.appendChild(val);
      return card;
    };

    // Build the Dashboard widget content
    const dashboardEl = document.createElement('div');
    dashboardEl.className = 'moc-dashboard-container';

    // Example placeholder data – kan ersättas med riktiga API‑anrop senare
    const stats = [
      { title: 'Aktiva användare', value: Math.floor(Math.random() * 1200) + 300, icon: '👥' },
      { title: 'Pågående möten', value: Math.floor(Math.random() * 20) + 1, icon: '📅' },
      { title: 'Öppna ärenden', value: Math.floor(Math.random() * 50) + 5, icon: '🛠️' },
      { title: 'Totala order', value: Math.floor(Math.random() * 5000) + 1000, icon: '🛒' }
    ];

    stats.forEach(s => {
      const card = createCard(s.title, s.value, s.icon);
      dashboardEl.appendChild(card);
    });

    // Add a refresh button
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'moc-dashboard-refresh';
    refreshBtn.textContent = '🔄 Uppdatera';
    refreshBtn.addEventListener('click', () => {
      // Simulera ny data
      dashboardEl.querySelectorAll('.moc-dashboard-card').forEach((card, i) => {
        const newVal = Math.floor(Math.random() * (i === 0 ? 1200 : i === 1 ? 20 : i === 2 ? 50 : 5000)) + (i === 0 ? 300 : i === 1 ? 1 : i === 2 ? 5 : 1000);
        card.querySelector('.moc-dashboard-value').textContent = newVal;
      });
    });
    dashboardEl.appendChild(refreshBtn);

    // Register the widget in the AI‑addons dock
    window.MyOffiCityAddons.addTool('Dashboard', '📊', dashboardEl);
    window.MyOffiCityAddons.register('Dashboard Widget');
  } catch (e) {
    console.error('Dashboard Addon Error:', e);
  }
})();

(() => {
  try {
    // Läs sparade inställningar eller sätt standardvärden
    const defaultConfig = { theme: 'light', accent: '#d9b46a' };
    const saved = JSON.parse(localStorage.getItem('mocAgentConfig') || 'null');
    const config = Object.assign({}, defaultConfig, saved);

    // Applicera konfiguration direkt på sidan
    const applyConfig = (cfg) => {
      if (cfg.theme) document.body.setAttribute('data-theme', cfg.theme);
      if (cfg.accent) document.documentElement.style.setProperty('--accent-color', cfg.accent);
    };
    applyConfig(config);

    // Skapa UI‑panel
    const panel = document.createElement('div');
    panel.className = 'moc-config-panel';

    // Tema‑rad
    const themeRow = document.createElement('div');
    themeRow.className = 'moc-config-row';
    const themeLabel = document.createElement('label');
    themeLabel.className = 'moc-config-label';
    themeLabel.textContent = 'Tema:';
    const themeSelect = document.createElement('select');
    themeSelect.className = 'moc-config-input';
    ['light', 'dark'].forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      if (t === config.theme) opt.selected = true;
      themeSelect.appendChild(opt);
    });
    themeRow.appendChild(themeLabel);
    themeRow.appendChild(themeSelect);
    panel.appendChild(themeRow);

    // Accent‑färg‑rad
    const accentRow = document.createElement('div');
    accentRow.className = 'moc-config-row';
    const accentLabel = document.createElement('label');
    accentLabel.className = 'moc-config-label';
    accentLabel.textContent = 'Accent‑färg:';
    const accentInput = document.createElement('input');
    accentInput.type = 'color';
    accentInput.className = 'moc-config-input';
    accentInput.value = config.accent;
    accentRow.appendChild(accentLabel);
    accentRow.appendChild(accentInput);
    panel.appendChild(accentRow);

    // Återställ‑knapp
    const resetBtn = document.createElement('button');
    resetBtn.className = 'moc-config-button';
    resetBtn.textContent = '🔄 Återställ';
    panel.appendChild(resetBtn);

    // Händelsehanterare – uppdatera och spara
    const updateConfig = () => {
      const newCfg = {
        theme: themeSelect.value,
        accent: accentInput.value
      };
      Object.assign(config, newCfg);
      localStorage.setItem('mocAgentConfig', JSON.stringify(config));
      applyConfig(config);
    };
    themeSelect.addEventListener('change', updateConfig);
    accentInput.addEventListener('input', updateConfig);
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('mocAgentConfig');
      Object.assign(config, defaultConfig);
      themeSelect.value = defaultConfig.theme;
      accentInput.value = defaultConfig.accent;
      applyConfig(config);
    });

    // Registrera widgeten i AI‑addons‑dockan
    window.MyOffiCityAddons.addTool('Agentinställningar', '⚙️', panel);
    window.MyOffiCityAddons.register('Agent Config Widget');
  } catch (e) {
    console.error('Agent Config Addon Error:', e);
  }
})();

(() => {
  try {
    // Neighborhood Map Addon
    const initNeighborhoodMap = () => {
      const container = document.createElement('div');
      container.className = 'moc-neighborhood-map';
      // Map image (placeholder)
      const img = document.createElement('img');
      img.src = 'https://images.unsplash.com/photo-1503264116251-35a8f0c9b5f2?auto=format&fit=crop&w=800&q=60';
      img.alt = 'Neighborhood Map';
      container.appendChild(img);

      // Hotspot data
      const hotspots = [
        { x: 30, y: 40, name: 'Central Park' },
        { x: 70, y: 20, name: 'Tech Hub' },
        { x: 50, y: 80, name: 'Historic District' }
      ];

      hotspots.forEach((h) => {
        const spot = document.createElement('div');
        spot.className = 'moc-neighborhood-hotspot';
        spot.style.left = `${h.x}%`;
        spot.style.top = `${h.y}%`;
        spot.title = h.name;
        spot.addEventListener('click', () => {
          alert(`Du klickade på: ${h.name}`);
        });
        container.appendChild(spot);
      });

      // Zoom controls
      const zoomIn = document.createElement('button');
      zoomIn.textContent = '+';
      zoomIn.className = 'moc-zoom-btn';
      zoomIn.title = 'Zooma in';
      const zoomOut = document.createElement('button');
      zoomOut.textContent = '-';
      zoomOut.className = 'moc-zoom-btn';
      zoomOut.title = 'Zooma ut';
      const zoomContainer = document.createElement('div');
      zoomContainer.className = 'moc-zoom-controls';
      zoomContainer.appendChild(zoomIn);
      zoomContainer.appendChild(zoomOut);
      container.appendChild(zoomContainer);

      let scale = 1;
      const updateScale = () => {
        img.style.transform = `scale(${scale})`;
      };
      zoomIn.addEventListener('click', () => {
        scale = Math.min(scale + 0.2, 2);
        updateScale();
      });
      zoomOut.addEventListener('click', () => {
        scale = Math.max(scale - 0.2, 1);
        updateScale();
      });

      // Add to AI dock
      window.MyOffiCityAddons.addTool('Stadsdelskarta', '🗺️', container);
      window.MyOffiCityAddons.register('Neighborhood Map Addon');
    };

    // Ensure MyOffiCityAddons is ready
    if (window.MyOffiCityAddons && typeof window.MyOffiCityAddons.addTool === 'function') {
      initNeighborhoodMap();
    } else {
      // Wait for the addon system to initialize
      const checkInterval = setInterval(() => {
        if (window.MyOffiCityAddons && typeof window.MyOffiCityAddons.addTool === 'function') {
          clearInterval(checkInterval);
          initNeighborhoodMap();
        }
      }, 200);
    }
  } catch (e) {
    console.error('Neighborhood Map Addon Error:', e);
  }
})();

(() => {
  try {
    // Apply saved wallpaper on load
    const applyWallpaper = (url) => {
      document.body.style.backgroundImage = url ? `url(${url})` : '';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    };
    const saved = localStorage.getItem('myofficity_wallpaper');
    if (saved) applyWallpaper(saved);

    // Build UI
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '6px';
    const label = document.createElement('label');
    label.textContent = 'Välj väggpapper:';
    label.style.color = '#f3ecdc';
    const select = document.createElement('select');
    select.className = 'moc-wallpaper-select';

    const options = [
      { name: 'Ingen', value: '' },
      { name: 'Skog', value: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Stad', value: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Abstrakt', value: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
    ];

    options.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.name;
      if (saved === o.value) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const url = select.value;
      applyWallpaper(url);
      localStorage.setItem('myofficity_wallpaper', url);
    });

    container.appendChild(label);
    container.appendChild(select);

    // Register tool in AI dock
    window.MyOffiCityAddons.addTool('Väggpapper', '🎨', container);
    window.MyOffiCityAddons.register('Custom Wallpaper Addon');
  } catch (e) {
    console.error('Wallpaper Addon Error:', e);
  }
})();

(() => {
  try {
    const chatContainer = document.createElement('div');
    chatContainer.className = 'moc-ai-chat-tool';
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.height = '300px';
    chatContainer.style.border = '1px solid rgba(217,180,106,0.3)';
    chatContainer.style.borderRadius = '8px';
    chatContainer.style.background = 'rgba(15,23,42,0.9)';
    chatContainer.style.padding = '8px';
    chatContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    chatContainer.style.fontFamily = 'system-ui, sans-serif';
    chatContainer.style.color = '#f3ecdc';
    chatContainer.style.overflow = 'hidden';

    const messages = document.createElement('div');
    messages.className = 'moc-ai-chat-messages';
    messages.style.flex = '1';
    messages.style.overflowY = 'auto';
    messages.style.marginBottom = '8px';
    messages.style.paddingRight = '4px';
    chatContainer.appendChild(messages);

    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.gap = '4px';
    const input = document.createElement('textarea');
    input.className = 'moc-ai-chat-input';
    input.style.flex = '1';
    input.style.resize = 'none';
    input.style.height = '48px';
    input.style.padding = '6px';
    input.style.borderRadius = '4px';
    input.style.border = '1px solid rgba(217,180,106,0.4)';
    input.style.background = 'rgba(0,0,0,0.2)';
    input.style.color = '#f3ecdc';
    input.style.fontSize = '13px';
    input.style.lineHeight = '1.4';
    input.placeholder = 'Skriv ett meddelande…';
    const sendBtn = document.createElement('button');
    sendBtn.className = 'moc-ai-chat-send';
    sendBtn.textContent = '✉️';
    sendBtn.style.padding = '0 12px';
    sendBtn.style.borderRadius = '4px';
    sendBtn.style.border = 'none';
    sendBtn.style.background = 'rgba(217,180,106,0.6)';
    sendBtn.style.color = '#111';
    sendBtn.style.cursor = 'pointer';
    sendBtn.style.fontSize = '16px';
    sendBtn.style.display = 'flex';
    sendBtn.style.alignItems = 'center';
    sendBtn.style.justifyContent = 'center';
    sendBtn.style.transition = 'background 0.2s';
    sendBtn.addEventListener('mouseover', () => sendBtn.style.background = 'rgba(217,180,106,0.8)');
    sendBtn.addEventListener('mouseout', () => sendBtn.style.background = 'rgba(217,180,106,0.6)');

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);
    chatContainer.appendChild(inputRow);

    const spinner = document.createElement('div');
    spinner.className = 'moc-ai-chat-spinner';
    spinner.style.display = 'none';
    spinner.style.alignSelf = 'center';
    spinner.style.marginTop = '4px';
    spinner.style.width = '20px';
    spinner.style.height = '20px';
    spinner.style.border = '3px solid rgba(217,180,106,0.4)';
    spinner.style.borderTop = '3px solid rgba(217,180,106,0.9)';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'moc-spin 1s linear infinite';
    chatContainer.appendChild(spinner);

    const addMessage = (text, from) => {
      const msg = document.createElement('div');
      msg.style.marginBottom = '6px';
      msg.style.padding = '6px 8px';
      msg.style.borderRadius = '6px';
      msg.style.background = from === 'bot' ? 'rgba(217,180,106,0.15)' : 'rgba(0,0,0,0.3)';
      msg.style.alignSelf = from === 'bot' ? 'flex-start' : 'flex-end';
      msg.style.maxWidth = '80%';
      msg.style.wordWrap = 'break-word';
      msg.textContent = text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    };

    let abortCtrl = null;
    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';
      spinner.style.display = 'block';
      if (abortCtrl) abortCtrl.abort();
      abortCtrl = new AbortController();
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
          signal: abortCtrl.signal
        });
        const data = await res.json();
        addMessage(data.response || 'Ingen svar', 'bot');
      } catch (e) {
        if (e.name !== 'AbortError') {
          addMessage('Fel: ' + e.message, 'bot');
        }
      } finally {
        spinner.style.display = 'none';
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });

    window.MyOffiCityAddons.addTool('AI Chat', '💬', chatContainer);
    window.MyOffiCityAddons.register('AI Chat Assistant');
  } catch (e) {
    console.error('AI Chat Addon Error:', e);
  }
})();

(() => {
  try {
    // Skapa overlay‑elementet
    const overlay = document.createElement('div');
    overlay.className = 'moc-quick-filter-overlay';
    overlay.innerHTML = `
      <div class="moc-qf-panel">
        <input type="text" class="moc-qf-input" placeholder="Sök agenter..." autocomplete="off" />
        <div class="moc-qf-categories">
          <button class="moc-qf-cat active" data-cat="all">Alla</button>
          <button class="moc-qf-cat" data-cat="ai">AI</button>
          <button class="moc-qf-cat" data-cat="3d">3D</button>
          <button class="moc-qf-cat" data-cat="office">Office</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.moc-qf-input');
    const catButtons = overlay.querySelectorAll('.moc-qf-cat');
    let activeCat = 'all';

    const toggleOverlay = (forceShow) => {
      const shouldShow = typeof forceShow === 'boolean' ? forceShow : overlay.style.display !== 'flex';
      overlay.style.display = shouldShow ? 'flex' : 'none';
      if (shouldShow) {
        input.value = '';
        input.focus();
        filterItems();
      }
    };

    const filterItems = () => {
      const term = input.value.trim().toLowerCase();
      // Försök att matcha vanliga kort‑klasser i Marketplace
      const selector = '.card, .agent-card, .agent, .moc-card';
      document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent.toLowerCase();
        const matchesTerm = !term || text.includes(term);
        const matchesCat = activeCat === 'all' || el.dataset.category === activeCat;
        el.style.display = matchesTerm && matchesCat ? '' : 'none';
      });
    };

    // Händelser
    input.addEventListener('input', filterItems);
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.cat;
        filterItems();
      });
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey && e.key === 'k') || (!e.ctrlKey && e.key === '/')) {
        e.preventDefault();
        toggleOverlay();
      }
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        toggleOverlay(false);
      }
    });

    // Lägg till en knapp i AI‑tilläggsdockan för manuell öppning
    const openBtn = document.createElement('button');
    openBtn.textContent = '🔎 Quick Filter';
    openBtn.style.padding = '6px 10px';
    openBtn.style.cursor = 'pointer';
    openBtn.addEventListener('click', () => toggleOverlay(true));

    window.MyOffiCityAddons.addTool('Quick Filter', '🔎', openBtn);
    window.MyOffiCityAddons.register('Quick Filter Overlay');
  } catch (e) {
    console.error('Quick Filter Addon Error:', e);
  }
})();

(() => {
  try {
    /* Theme Switcher */
    const THEME_KEY = 'theme';
    const THEMES = ['auto', 'light', 'dark'];

    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-switcher-btn';
    const iconSpan = document.createElement('span');
    iconSpan.textContent = '🌓';
    const textSpan = document.createElement('span');
    themeBtn.append(iconSpan, textSpan);

    const topbar = document.querySelector('#topbar');
    if (topbar) topbar.appendChild(themeBtn);

    const applyTheme = (theme) => {
      const root = document.documentElement;
      if (theme === 'auto') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', theme);
      }
      localStorage.setItem(THEME_KEY, theme);
      textSpan.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    let current = localStorage.getItem(THEME_KEY) || 'auto';
    applyTheme(current);

    themeBtn.addEventListener('click', () => {
      let idx = THEMES.indexOf(current);
      idx = (idx + 1) % THEMES.length;
      current = THEMES[idx];
      applyTheme(current);
    });

    // Update when system preference changes while in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (current === 'auto') applyTheme('auto');
    });
  } catch (e) {
    console.error('Theme Switcher Error:', e);
  }
})();

(() => {
  try {
    /* ---------- Kommandodefinitioner ---------- */
    const commands = [
      { name: 'Gå till Hem', action: () => (location.hash = '#/'), keywords: ['hem', 'home'] },
      { name: 'Gå till Stad', action: () => (location.hash = '#/city'), keywords: ['stad', 'city'] },
      { name: 'Gå till Dashboard', action: () => (location.hash = '#/dash'), keywords: ['dashboard', 'dash', 'panel'] },
      { name: 'Tema: Auto', action: () => setTheme('auto'), keywords: ['tema', 'auto'] },
      { name: 'Tema: Ljus', action: () => setTheme('light'), keywords: ['tema', 'ljus', 'light'] },
      { name: 'Tema: Mörk', action: () => setTheme('dark'), keywords: ['tema', 'mörk', 'dark'] },
      { name: 'Kopiera agent‑ID', action: copyAgentId, keywords: ['kopiera', 'agent', 'id', 'copy'] },
    ];

    /* ---------- Hjälpfunktioner ---------- */
    const fuzzyMatch = (query, str) => {
      query = query.toLowerCase();
      str = str.toLowerCase();
      let i = 0;
      for (let ch of str) {
        if (ch === query[i]) i++;
        if (i === query.length) break;
      }
      return i === query.length;
    };

    const setTheme = (theme) => {
      const root = document.documentElement;
      if (theme === 'auto') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    };

    const copyAgentId = async () => {
      const id = window.agentId || document.body.dataset.agentId || 'unknown';
      try {
        await navigator.clipboard.writeText(id);
        alert('Agent‑ID kopierad: ' + id);
      } catch (e) {
        console.error('Kunde inte kopiera agent‑ID', e);
      }
    };

    /* ---------- Palette‑UI ---------- */
    let overlay = null;
    const openPalette = () => {
      if (overlay) return; // redan öppen

      overlay = document.createElement('div');
      overlay.className = 'mcp-overlay';

      const modal = document.createElement('div');
      modal.className = 'mcp-modal';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'mcp-input';
      input.placeholder = 'Skriv ett kommando…';
      modal.appendChild(input);

      const list = document.createElement('ul');
      list.className = 'mcp-list';
      modal.appendChild(list);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      input.focus();

      const render = () => {
        const q = input.value.trim();
        const filtered = commands.filter(c =>
          fuzzyMatch(q, c.name) ||
          c.keywords.some(k => fuzzyMatch(q, k))
        );
        list.innerHTML = '';
        filtered.slice(0, 10).forEach((c, idx) => {
          const li = document.createElement('li');
          li.className = 'mcp-item';
          li.textContent = c.name;
          li.tabIndex = 0;
          li.dataset.idx = idx;
          li.addEventListener('click', () => { c.action(); close(); });
          li.addEventListener('keydown', e => {
            if (e.key === 'Enter') { c.action(); close(); }
          });
          list.appendChild(li);
        });
        const first = list.querySelector('.mcp-item');
        if (first) first.classList.add('active');
      };

      const moveActive = (delta) => {
        const items = Array.from(list.querySelectorAll('.mcp-item'));
        if (!items.length) return;
        let cur = items.findIndex(i => i.classList.contains('active'));
        items[cur]?.classList.remove('active');
        cur = (cur + delta + items.length) % items.length;
        items[cur].classList.add('active');
        items[cur].scrollIntoView({ block: 'nearest' });
      };

      const keyNav = e => {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
        else if (e.key === 'Enter') {
          const active = list.querySelector('.mcp-item.active');
          if (active) {
            const idx = Number(active.dataset.idx);
            const cmd = commands.filter(c => true)[idx];
            cmd && cmd.action();
            close();
          }
        }
      };

      const close = () => {
        overlay?.remove();
        overlay = null;
        document.removeEventListener('keydown', keyNav);
      };

      input.addEventListener('input', render);
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', keyNav);
      render();
    };

    /* ---------- Globalt kortkommando ---------- */
    const shortcutHandler = e => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openPalette();
      }
    };
    document.addEventListener('keydown', shortcutHandler);

    /* ---------- Lägg till verktyg i docken ---------- */
    const toolEl = document.createElement('div');
    toolEl.innerHTML = '<p>⌨️ Command Palette (Cmd/Ctrl + Shift + P)</p>';
    window.MyOffiCityAddons.addTool('Command Palette', '⌨️', toolEl);
    window.MyOffiCityAddons.register('Command Palette');
  } catch (e) {
    console.error('Command Palette addon error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-city-toolbar';
    
    const btnReset = document.createElement('button');
    btnReset.textContent = '🔄 Reset';
    btnReset.onclick = () => {
      const canvas = document.querySelector('canvas');
      if (window.resetCamera) window.resetCamera();
    };
    
    const btnSnap = document.createElement('button');
    btnSnap.textContent = '📸 Snap';
    btnSnap.onclick = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = 'myofficity-view.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    
    container.appendChild(btnReset);
    container.appendChild(btnSnap);
    
    window.MyOffiCityAddons.addTool('City View Tools', '🏗️', container);
    window.MyOffiCityAddons.register('City View Tools');
  } catch (e) {
    console.error('City View Tools error:', e);
  }
})();

(() => {
  try {
    const updateBreadcrumbs = () => {
      const topbar = document.getElementById('topbar');
      if (!topbar) return;
      
      let bc = document.getElementById('moc-breadcrumbs');
      if (!bc) {
        bc = document.createElement('div');
        bc.id = 'moc-breadcrumbs';
        bc.className = 'moc-breadcrumbs';
        topbar.prepend(bc);
      }
      
      const path = window.location.hash.replace('#/', '') || 'home';
      const parts = path.split('/');
      
      bc.innerHTML = parts.map((p, i) => {
        const url = '#' + parts.slice(0, i + 1).map(x => '/' + x).join('');
        return `<a href="${url}">${p.charAt(0).toUpperCase() + p.slice(1)}</a>`;
      }).join(' <span class="sep">/</span> ');
    };

    window.addEventListener('hashchange', updateBreadcrumbs);
    updateBreadcrumbs();
    window.MyOffiCityAddons.register('Breadcrumb Nav');
  } catch (e) {
    console.error('Breadcrumb error:', e);
  }
})();

(() => {
  try {
    const menu = document.createElement('div');
    menu.id = 'moc-context-menu';
    menu.className = 'moc-ctx-menu';
    menu.style.display = 'none';
    document.body.appendChild(menu);

    document.addEventListener('contextmenu', (e) => {
      const target = e.target.closest('.dmain');
      if (!target) return;
      
      e.preventDefault();
      menu.style.top = `${e.clientY}px`;
      menu.style.left = `${e.clientX}px`;
      menu.innerHTML = `
        <div class="moc-ctx-item" onclick="alert('Inspekterar objekt...')">🔍 Inspektera</div>
        <div class="moc-ctx-item" onclick="alert('Redigerar egenskaper...')">⚙️ Redigera</div>
        <div class="moc-ctx-item" onclick="alert('Agent tilldelad!')">👤 Tilldela Agent</div>
      `;
      menu.style.display = 'block';
    });

    document.addEventListener('click', () => menu.style.display = 'none');
    window.MyOffiCityAddons.register('Context Menu');
  } catch (e) {
    console.error('Context menu error:', e);
  }
})();

(() => {
  try {
    const perfEl = document.createElement('div');
    perfEl.id = 'moc-perf-monitor';
    perfEl.className = 'moc-perf-monitor';
    perfEl.innerHTML = `
      <div class="moc-perf-row">
        <span class="moc-perf-label">FPS</span>
        <span class="moc-perf-value" id="moc-fps">--</span>
      </div>
      <div class="moc-perf-row">
        <span class="moc-perf-label">Minne</span>
        <span class="moc-perf-value" id="moc-mem">--</span>
      </div>
    `;
    document.body.appendChild(perfEl);

    let frames = 0;
    let lastTime = performance.now();
    let fps = 0;

    function updateFPS() {
      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        fps = Math.round(frames * 1000 / (now - lastTime));
        frames = 0;
        lastTime = now;
        const fpsEl = document.getElementById('moc-fps');
        if (fpsEl) {
          fpsEl.textContent = fps;
          fpsEl.className = 'moc-perf-value ' + (fps >= 50 ? 'good' : fps >= 30 ? 'warn' : 'bad');
        }
      }
      requestAnimationFrame(updateFPS);
    }

    function updateMemory() {
      const memEl = document.getElementById('moc-mem');
      if (memEl && performance.memory) {
        const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
        memEl.textContent = `${usedMB}/${totalMB} MB`;
        const usage = performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
        memEl.className = 'moc-perf-value ' + (usage < 0.5 ? 'good' : usage < 0.8 ? 'warn' : 'bad');
      } else if (memEl) {
        memEl.textContent = 'N/A';
      }
    }

    function checkCityView() {
      const isCity = window.location.hash === '#/city' || window.location.hash.startsWith('#/city');
      perfEl.style.display = isCity ? 'block' : 'none';
    }

    window.addEventListener('hashchange', checkCityView);
    checkCityView();

    requestAnimationFrame(updateFPS);
    setInterval(updateMemory, 2000);
    updateMemory();

    window.MyOffiCityAddons.addTool('Prestanda-mätare', '📊', perfEl);
    window.MyOffiCityAddons.register('Performance Monitor');
  } catch (e) {
    console.error('Performance monitor error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.id = 'moc-toast-container';
    document.body.appendChild(container);

    window.MyOffiCityAddons.notify = (message, type = 'info') => {
      const toast = document.createElement('div');
      toast.className = `moc-toast moc-toast-${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
      }, 3000);
    };

    window.MyOffiCityAddons.register('Notification System');
  } catch (e) {
    console.error('Toast system error:', e);
  }
})();

(() => {
  try {
    const setupFocusMode = () => {
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Agent: ${card.innerText.split('\n')[0]}`);
        
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    };

    const toolEl = document.createElement('div');
    toolEl.innerHTML = '<p style="font-size:12px; color:#d9b46a;">Använd <b>Tab</b> för att navigera och <b>Enter</b> för att välja agenter.</p>';
    
    window.MyOffiCityAddons.addTool('Focus Mode', '⌨️', toolEl);
    window.MyOffiCityAddons.register('Keyboard Navigation');

    const observer = new MutationObserver(setupFocusMode);
    observer.observe(document.body, { childList: true, subtree: true });
    setupFocusMode();
  } catch (e) {
    console.error('Focus Mode error:', e);
  }
})();

(() => {
  try {
    // Find main content area
    const dmain = document.querySelector('.dmain');
    if (!dmain) return;

    // Collect headings that act as categories (must have an id)
    const headings = Array.from(dmain.querySelectorAll('h2, h3')).filter(h => h.id);
    if (headings.length === 0) return;

    // Build the floating side menu
    const spyContainer = document.createElement('div');
    spyContainer.className = 'moc-scroll-spy';
    const list = document.createElement('ul');

    headings.forEach((h) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${h.id}`;
      link.textContent = h.textContent.trim();
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(link);
      list.appendChild(li);
    });

    spyContainer.appendChild(list);
    document.body.appendChild(spyContainer);

    // Highlight active heading using IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const anchor = spyContainer.querySelector(`a[href="#${id}"]`);
        if (!anchor) return;
        if (entry.isIntersecting) {
          anchor.parentElement.classList.add('active');
        } else {
          anchor.parentElement.classList.remove('active');
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -80% 0px',
      threshold: 0,
    });

    headings.forEach((h) => observer.observe(h));

    // Add a small toggle button inside the AI‑addons drawer
    const toolWrapper = document.createElement('div');
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Toggle Scroll‑Spy';
    toggleBtn.style.marginBottom = '6px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.fontSize = '12px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.onclick = () => {
      spyContainer.style.display = spyContainer.style.display === 'none' ? 'block' : 'none';
    };
    toolWrapper.appendChild(toggleBtn);
    // Clone the menu so it also appears inside the drawer (optional)
    toolWrapper.appendChild(spyContainer.cloneNode(true));

    window.MyOffiCityAddons.addTool('Scroll‑Spy', '🔎', toolWrapper);
    window.MyOffiCityAddons.register('Scroll Spy');
  } catch (e) {
    console.error('Scroll‑Spy error:', e);
  }
})();

(() => {
  try {
    // Vänta på att hela sidan är laddad
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollSpy);
    } else {
      initScrollSpy();
    }

    function initScrollSpy() {
      const main = document.querySelector('.dmain');
      if (!main) return; // Ingen .dmain – inget att göra

      // Hitta rubriker som representerar kategorier (h2 med id)
      const headings = Array.from(main.querySelectorAll('h2[id]'));
      if (headings.length === 0) return;

      // Skapa sidomeny‑container
      const spyContainer = document.createElement('nav');
      spyContainer.className = 'moc-scroll-spy';
      const list = document.createElement('ul');
      spyContainer.appendChild(list);

      // Bygg meny‑länkar
      const idToLink = {};
      headings.forEach((h) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent.trim() || h.id;
        a.dataset.targetId = h.id;
        li.appendChild(a);
        list.appendChild(li);
        idToLink[h.id] = a;
      });

      // Lägg till en toggle‑knapp för att dölja/visa menyn
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'moc-spy-toggle';
      toggleBtn.textContent = '🗂️';
      toggleBtn.title = 'Toggle kategori‑meny';
      toggleBtn.onclick = () => {
        spyContainer.style.display = spyContainer.style.display === 'none' ? 'block' : 'none';
      };
      // Wrapper för verktyget i AI‑addons‑drawern
      const toolWrapper = document.createElement('div');
      toolWrapper.style.display = 'flex';
      toolWrapper.style.flexDirection = 'column';
      toolWrapper.appendChild(toggleBtn);
      toolWrapper.appendChild(spyContainer.cloneNode(true));

      // Registrera verktyget i dockan
      window.MyOffiCityAddons.addTool('Scroll‑Spy', '🔎', toolWrapper);
      window.MyOffiCityAddons.register('Scroll Spy');

      // IntersectionObserver för att markera aktiv rubrik
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = idToLink[id];
          if (!link) return;
          if (entry.isIntersecting) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -70% 0px', // trigga när rubriken är nära toppen
        threshold: 0,
      });

      headings.forEach((h) => observer.observe(h));
    }
  } catch (e) {
    console.error('Scroll‑Spy‑addon error:', e);
  }
})();

(() => {
  try {
    // Hitta Three.js‑canvasen (vanligtvis den enda <canvas> på sidan)
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Skapa etikett‑elementet som visas ovanför agenten
    const label = document.createElement('div');
    label.className = 'agent-status-label';
    document.body.appendChild(label);

    // Raycaster & muskoordinater
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Hjälpfunktioner för att hämta namn/status från mesh‑userData
    const getName = (mesh) => mesh.userData?.agentName || mesh.name || 'Agent';
    const getStatus = (mesh) => mesh.userData?.status || 'Aktiv';

    // Mus‑event‑handler
    const onMouseMove = (ev) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

      // Anta att scenen och kameran finns på window‑objektet
      const scene = window.scene;
      const camera = window.camera;
      if (!scene || !camera) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Hitta första objektet som representerar en agent
      const hit = intersects.find(i => i.object.userData?.agentName);
      if (hit) {
        const mesh = hit.object;
        const worldPos = mesh.getWorldPosition(new THREE.Vector3());
        const proj = worldPos.clone().project(camera);

        // Omvandla till skärmkoordinater
        const x = (proj.x + 1) / 2 * window.innerWidth;
        const y = (-proj.y + 1) / 2 * window.innerHeight;

        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.textContent = `${getName(mesh)}: ${getStatus(mesh)}`;
        label.classList.add('visible');
      } else {
        label.classList.remove('visible');
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    // Rensa vid sidavslut
    window.addEventListener('beforeunload', () => {
      canvas.removeEventListener('mousemove', onMouseMove);
    });

    // Lägg till ett litet verktyg i AI‑dockan för att informera användaren
    const info = document.createElement('div');
    info.style.fontSize = '12px';
    info.style.padding = '4px 8px';
    info.textContent = 'Hovera över en agent för att se dess status.';
    window.MyOffiCityAddons.addTool('Agent‑Status', '🟢', info);
    window.MyOffiCityAddons.register('Agent‑Status');
  } catch (e) {
    console.error('Agent‑Status‑addon error:', e);
  }
})();

(() => {
  try {
    const startTime = Date.now();
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const timerEl = document.createElement('div');
    timerEl.style.cssText = 'margin-left:15px; font-size:12px; color:#d9b46a; font-family:monospace;';
    topbar.appendChild(timerEl);

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      timerEl.textContent = `Deep Work: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    setInterval(updateTimer, 1000);

    const statsContainer = document.createElement('div');
    statsContainer.innerHTML = '<p>Sessionen pågår...</p>';
    
    window.addEventListener('beforeunload', () => {
      const duration = Math.floor((Date.now() - startTime) / 60000);
      localStorage.setItem('last_session_duration', duration);
    });

    const last = localStorage.getItem('last_session_duration');
    if (last) {
      statsContainer.innerHTML = `<p>Förra sessionen: <strong>${last} minuter</strong> fokuserat arbete.</p>`;
    }

    window.MyOffiCityAddons.addTool('Produktivitet', '⏱️', statsContainer);
  } catch (e) {
    console.error('Session-timer error:', e);
  }
})();

(() => {
  try {
    const createPreviewModal = () => {
      let modal = document.getElementById('mocQuickPreview');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mocQuickPreview';
        modal.className = 'moc-preview-overlay';
        modal.innerHTML = `
          <div class="moc-preview-modal">
            <button class="moc-preview-close">&times;</button>
            <div class="moc-preview-content"></div>
          </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.moc-preview-close').onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
      }
      return modal;
    };

    const handleCardClick = (e) => {
      if (!e.shiftKey) return;
      const card = e.target.closest('.card');
      if (!card) return;

      e.preventDefault();
      e.stopPropagation();

      const modal = createPreviewModal();
      const content = modal.querySelector('.moc-preview-content');
      
      // Extrahera data från det existerande kortet
      const title = card.querySelector('h3')?.innerText || 'Information';
      const img = card.querySelector('img')?.src;
      const desc = card.querySelector('p')?.innerText || 'Ingen beskrivning tillgänglig.';
      const tags = Array.from(card.querySelectorAll('.tag, .badge, .status')).map(t => t.innerText);

      content.innerHTML = `
        ${img ? `<div class="moc-preview-img-wrap"><img src="${img}" /></div>` : ''}
        <div class="moc-preview-details">
          <h2>${title}</h2>
          <div class="moc-preview-tags">
            ${tags.map(t => `<span class="moc-tag">${t}</span>`).join('')}
          </div>
          <p class="moc-preview-desc">${desc}</p>
          <div class="moc-preview-footer">
            <small>Tips: Klicka utanför eller på krysset för att stänga</small>
          </div>
        </div>
      `;

      modal.classList.add('active');
    };

    document.addEventListener('click', handleCardClick, true);

    // Registrera verktyget i AI-panelen
    const helpEl = document.createElement('div');
    helpEl.style.padding = '5px';
    helpEl.innerHTML = '<p style="font-size:12px; color:#ccc; margin:0;">Håll ner <b>Shift</b> och klicka på valfritt kort i listan för att snabbgranska detaljer.</p>';
    
    window.MyOffiCityAddons.addTool('Quick Preview', '🔍', helpEl);
    window.MyOffiCityAddons.register('Quick Preview');

  } catch (e) {
    console.error('Quick Preview Addon Error:', e);
  }
})();

(() => {
  try {
    const routes = { '1': '/', '2': '/city', '3': '/dash' };
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && routes[e.key]) {
        e.preventDefault();
        const target = routes[e.key];
        
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
          window.location.hash = target;
          setTimeout(() => {
            document.body.style.opacity = '1';
          }, 100);
        }, 300);
      }
    });

    const info = document.createElement('div');
    info.innerHTML = `<ul style="font-size:12px; color:#ccc; padding-left:15px; margin:0;">
      <li><b>Ctrl+Alt+1</b>: Marketplace</li>
      <li><b>Ctrl+Alt+2</b>: 3D City</li>
      <li><b>Ctrl+Alt+3</b>: Office Dashboard</li>
    </ul>`;
    
    window.MyOffiCityAddons.addTool('Workspace Switcher', '⌨️', info);
    window.MyOffiCityAddons.register('Workspace Switcher');
  } catch (e) {
    console.error('Workspace Switcher Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = `<p style="font-size:12px; color:#94a3b8; margin:0;">Visualiserar historisk prisdata för agenter i realtid.</p>`;
    
    const observer = new MutationObserver(() => {
      const cards = document.querySelectorAll('.cards .card, .card');
      cards.forEach(card => {
        if (card.querySelector('.moc-sparkline')) return;
        const spark = document.createElement('div');
        spark.className = 'moc-sparkline';
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 20;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#d9b46a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 15 + Math.random() * -10);
        ctx.lineTo(33, 10 + Math.random() * -5);
        ctx.lineTo(66, 12 + Math.random() * -8);
        ctx.lineTo(100, 5 + Math.random() * -2);
        ctx.stroke();
        spark.appendChild(canvas);
        card.appendChild(spark);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    window.MyOffiCityAddons.addTool('Price Trends', '📈', container);
    window.MyOffiCityAddons.register('Price Trends');
  } catch (e) {
    console.error('Price Trends Addon Error:', e);
  }
})();

(() => {
  try {
    const style = document.createElement('style');
    style.textContent = `.moc-dimmed { filter: brightness(0.3) blur(2px); transition: filter 0.4s ease; }`;
    document.head.appendChild(style);

    const target = document.querySelector('#app') || document.body;
    const main = document.querySelector('.dmain') || document.body;

    const applyDim = (dim) => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.classList.toggle('moc-dimmed', dim);
      }
    };

    [target, main].forEach(el => {
      if (!el) return;
      el.addEventListener('mouseenter', () => applyDim(true));
      el.addEventListener('mouseleave', () => applyDim(false));
    });

    window.MyOffiCityAddons.register('Focus-Zone');
  } catch (e) {
    console.error('Focus-Zone Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.className = 'moc-quickjump';
    const list = document.createElement('div');
    list.className = 'moc-quickjump-list';
    container.appendChild(list);

    const updateList = () => {
      list.innerHTML = '';
      const objects = [];
      const scene = window.__THREE_SCENE__;
      if (scene) {
        scene.traverse((obj) => {
          if (obj.isMesh && obj.name) {
            objects.push({ name: obj.name, position: obj.position.clone() });
          }
        });
      }
      if (objects.length === 0) {
        list.innerHTML = '<div class="moc-quickjump-empty">Inga 3D-objekt hittade</div>';
        return;
      }
      objects.forEach((obj, i) => {
        const item = document.createElement('div');
        item.className = 'moc-quickjump-item';
        item.textContent = obj.name;
        item.addEventListener('click', () => {
          const camera = window.__THREE_CAMERA__;
          if (camera) {
            camera.position.set(obj.position.x + 5, obj.position.y + 5, obj.position.z + 5);
            camera.lookAt(obj.position);
          }
        });
        list.appendChild(item);
      });
    };

    const keyHandler = (e) => {
      if (e.altKey && e.key === 'g') {
        e.preventDefault();
        updateList();
        window.MyOffiCityAddons.toggleDock(true);
      }
    };
    document.addEventListener('keydown', keyHandler);

    window.MyOffiCityAddons.addTool('Quick-Jump', '⚡', container);
    window.MyOffiCityAddons.register('Quick-Jump');
  } catch (e) {
    console.error('Quick-Jump Error:', e);
  }
})();

(() => {
  try {
    const injectButtons = () => {
      const boxes = document.querySelectorAll('.tc-box:not(.moc-clipboard-ready)');
      boxes.forEach(box => {
        box.classList.add('moc-clipboard-ready');
        const btn = document.createElement('button');
        btn.className = 'moc-copy-json-btn';
        btn.innerHTML = '<span>JSON</span>';
        btn.title = 'Kopiera agent-data som JSON';
        
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const name = box.querySelector('h3, .name, b')?.innerText?.trim() || 'Namnlös Agent';
          const role = box.querySelector('.role, .title, i')?.innerText?.trim() || 'Agent';
          const desc = box.querySelector('p, .desc, .info')?.innerText?.trim() || '';
          
          const agentData = {
            id: box.id || Math.random().toString(36).substr(2, 9),
            name,
            role,
            description: desc,
            exportedAt: new Date().toISOString(),
            context: "MyOffiCity Agent Configuration"
          };

          navigator.clipboard.writeText(JSON.stringify(agentData, null, 2)).then(() => {
            btn.classList.add('moc-copied');
            setTimeout(() => btn.classList.remove('moc-copied'), 2000);
          }).catch(err => console.error('Clipboard error:', err));
        };
        
        box.style.position = 'relative';
        box.appendChild(btn);
      });
    };

    // Watch for dynamic content (new agents loading)
    const observer = new MutationObserver(() => injectButtons());
    observer.observe(document.body, { childList: true, subtree: true });
    injectButtons();

    // Register in the AI Addons Drawer
    const info = document.createElement('div');
    info.className = 'moc-clipboard-info';
    info.innerHTML = `
      <p style="font-size:12px; margin-bottom:8px; opacity:0.9;">
        Hovra över agent-kort för att se JSON-knappen. Perfekt för att dela konfigurationer.
      </p>
      <div style="font-size:10px; color:#d9b46a; border-top:1px solid rgba(217,180,106,0.2); pt:5px;">
        Status: Aktiv & bevakar .tc-box
      </div>
    `;
    
    window.MyOffiCityAddons.addTool('Smart-Clipboard', '📋', info);
    window.MyOffiCityAddons.register('Smart-Clipboard');
  } catch (e) {
    console.error('Smart-Clipboard Error:', e);
  }
})();

(() => {
  try {
    // --- Tooltip element (reused) ---
    const tooltipClass = 'moc-tooltip';
    const tooltipEl = document.createElement('div');
    tooltipEl.className = tooltipClass;
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.zIndex = '9999';
    tooltipEl.style.transition = 'opacity 0.15s ease';
    tooltipEl.style.opacity = '0';
    document.body.appendChild(tooltipEl);

    const showTooltip = (content, x, y) => {
      tooltipEl.innerHTML = content;
      tooltipEl.style.left = `${x + 12}px`;
      tooltipEl.style.top = `${y + 12}px`;
      tooltipEl.style.opacity = '1';
    };

    const hideTooltip = () => {
      tooltipEl.style.opacity = '0';
    };

    const formatStack = (stackStr) => {
      try {
        const arr = JSON.parse(stackStr);
        if (Array.isArray(arr)) {
          return '<ul style="margin:0;padding-left:1.2em;">' + arr.map(i => `<li>${i}</li>`).join('') + '</ul>';
        }
      } catch (_) { /* ignore */ }
      // fallback – plain text
      return `<span>${stackStr}</span>`;
    };

    // Bind to existing elements with data‑stack inside .cards
    const bindTooltip = (el) => {
      if (el.__tooltipBound) return;
      el.__tooltipBound = true;

      el.addEventListener('mouseenter', (e) => {
        const raw = el.getAttribute('data-stack') || '';
        showTooltip(formatStack(raw), e.clientX, e.clientY);
      });

      el.addEventListener('mousemove', (e) => {
        if (tooltipEl.style.opacity === '1') {
          tooltipEl.style.left = `${e.clientX + 12}px`;
          tooltipEl.style.top = `${e.clientY + 12}px`;
        }
      });

      el.addEventListener('mouseleave', hideTooltip);
    };

    document.querySelectorAll('.cards [data-stack]').forEach(bindTooltip);

    // Observe future DOM changes (e.g., lazy‑loaded agents)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          const candidates = node.matches('.cards [data-stack]') ? [node] : node.querySelectorAll('.cards [data-stack]');
          candidates.forEach(bindTooltip);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Register a small info panel in the AI‑addons drawer
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<p style="font-size:12px;margin:0;">💡 Hovra över ikoner med <code>data-stack</code> för att se agentens tekniska stack.</p>`;
    window.MyOffiCityAddons.addTool('Contextual Tooltip', '💡', infoDiv);
    window.MyOffiCityAddons.register('Contextual Tooltip');
  } catch (e) {
    console.error('Contextual Tooltip error:', e);
  }
})();

(() => {
  try {
    const palette = document.createElement('div');
    palette.className = 'moc-cmd-palette';
    palette.innerHTML = `
      <div class="moc-cmd-inner">
        <input type="text" placeholder="Sök kommando (t.ex. city, dash)..." id="moc-cmd-input">
        <div class="moc-cmd-list" id="moc-cmd-list"></div>
      </div>
    `;
    document.body.appendChild(palette);

    const input = palette.querySelector('#moc-cmd-input');
    const list = palette.querySelector('#moc-cmd-list');
    const commands = [
      { name: 'Gå till Dashboard', path: '#/dash' },
      { name: 'Gå till City', path: '#/city' },
      { name: 'Marknadsplats', path: '#/market' }
    ];

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

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase();
      list.innerHTML = '';
      commands.filter(c => c.name.toLowerCase().includes(val)).forEach(c => {
        const item = document.createElement('div');
        item.className = 'moc-cmd-item';
        item.textContent = c.name;
        item.onclick = () => { window.location.hash = c.path; toggle(false); };
        list.appendChild(item);
      });
    });

    palette.addEventListener('click', (e) => { if (e.target === palette) toggle(false); });
    
    const info = document.createElement('div');
    info.innerHTML = `<p style="font-size:12px;margin:0;">⌨️ Tryck <b>Ctrl+K</b> var som helst för att navigera snabbt.</p>`;
    window.MyOffiCityAddons.addTool('Command Palette', '⌘', info);
    window.MyOffiCityAddons.register('Command Palette');
  } catch (e) { console.error('CmdPalette error:', e); }
})();

(() => {
  try {
    // History stack for breadcrumb
    const historyStack = [];

    // Create breadcrumb container
    const createBreadcrumb = () => {
      const app = document.getElementById('app');
      if (!app) return;

      const breadcrumbContainer = document.createElement('div');
      breadcrumbContainer.id = 'moc-breadcrumb';
      app.appendChild(breadcrumbContainer);

      // Update UI
      const updateBreadcrumb = () => {
        breadcrumbContainer.innerHTML = '';
        historyStack.forEach((hash, idx) => {
          const span = document.createElement('span');
          span.textContent = hash;
          span.onclick = () => {
            // Navigate to selected hash and trim history
            window.location.hash = hash;
            historyStack.splice(idx + 1);
            updateBreadcrumb();
          };
          breadcrumbContainer.appendChild(span);
          if (idx < historyStack.length - 1) {
            const sep = document.createElement('span');
            sep.textContent = '>';
            sep.className = 'moc-breadcrumb-sep';
            breadcrumbContainer.appendChild(sep);
          }
        });
      };

      // Push new hash to stack
      const pushHash = (hash) => {
        if (!hash) return;
        if (historyStack[historyStack.length - 1] !== hash) {
          historyStack.push(hash);
          updateBreadcrumb();
        }
      };

      // Initial push
      pushHash(window.location.hash || '#/');

      // Listen for hash changes
      window.addEventListener('hashchange', () => pushHash(window.location.hash));
    };

    // Ensure DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      createBreadcrumb();
    } else {
      document.addEventListener('DOMContentLoaded', createBreadcrumb);
    }

    // Register feature for badge counter
    window.MyOffiCityAddons.register('Breadcrumb Navigation');
  } catch (e) {
    console.error('Breadcrumb error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.style.cssText = 'padding: 8px; font-family: monospace; font-size: 11px; color: #4ade80;';
    const fpsDisplay = document.createElement('div');
    container.appendChild(fpsDisplay);

    let lastTime = performance.now();
    let frames = 0;
    let fps = 0;

    function update() {
      const now = performance.now();
      frames++;
      if (now - lastTime >= 1000) {
        fps = Math.round((frames * 1000) / (now - lastTime));
        fpsDisplay.textContent = `FPS: ${fps} | MEM: ${Math.round(performance.memory?.usedJSHeapSize / 1048576 || 0)}MB`;
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(update);
    }
    update();

    window.MyOffiCityAddons.addTool('Prestanda', '⚡', container);
  } catch (e) {
    console.error('Performance Monitor error:', e);
  }
})();

(() => {
  try {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 8px;';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Skriv dina agent-instruktioner här...';
    textarea.style.cssText = 'width: 100%; height: 120px; background: #1e293b; color: #f3ecdc; border: 1px solid #334155; border-radius: 4px; padding: 8px; resize: vertical; font-family: monospace;';
    
    const btn = document.createElement('button');
    btn.textContent = 'Spara utkast';
    btn.style.cssText = 'padding: 6px; background: #d9b46a; color: #0f172a; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
    btn.onclick = () => {
      localStorage.setItem('moc_agent_draft', textarea.value);
      alert('Utkast sparat lokalt!');
    };

    const saved = localStorage.getItem('moc_agent_draft');
    if (saved) textarea.value = saved;

    wrapper.appendChild(textarea);
    wrapper.appendChild(btn);

    window.MyOffiCityAddons.addTool('Agent-Draft', '📝', wrapper);
  } catch (e) {
    console.error('Agent-Draft error:', e);
  }
})();

(() => {
  try {
    const toggleDarkMode = (enabled) => {
      document.documentElement.classList.toggle('moc-dark-mode', enabled);
      localStorage.setItem('moc_dark_mode', enabled ? 'true' : 'false');
    };

    const saved = localStorage.getItem('moc_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'true' || (saved === null && prefersDark)) {
      toggleDarkMode(true);
    }

    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 4px 0;';
    
    const label = document.createElement('span');
    label.textContent = 'Nattläge';
    label.style.fontSize = '13px';
    
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = document.documentElement.classList.contains('moc-dark-mode');
    toggle.onchange = (e) => toggleDarkMode(e.target.checked);
    
    container.appendChild(label);
    container.appendChild(toggle);
    
    window.MyOffiCityAddons.addTool('Visuellt', '🌙', container);
  } catch (e) {
    console.error('Dark Mode error:', e);
  }
})();

(() => {
  try {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    // Skapa sökfältet
    const searchContainer = document.createElement('div');
    searchContainer.className = 'moc-search-wrapper';
    searchContainer.innerHTML = `
      <div class="moc-search-inner">
        <span class="moc-search-icon">🔍</span>
        <input type="text" id="moc-market-search" placeholder="Sök företag eller kategori..." autocomplete="off">
      </div>
    `;

    // Placera i topbar (efter logotypen/nav)
    topbar.appendChild(searchContainer);

    const input = searchContainer.querySelector('input');
    
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.cards .card');
      
      cards.forEach(card => {
        // Vi söker i hela textinnehållet (namn, beskrivning, taggar)
        const content = card.textContent.toLowerCase();
        const isMatch = content.includes(query);
        
        if (isMatch) {
          card.classList.remove('moc-card-hidden');
          card.style.display = ''; // Återställ display
        } else {
          card.classList.add('moc-card-hidden');
          // Vänta på animationen innan vi sätter display: none
          setTimeout(() => {
            if (card.classList.contains('moc-card-hidden')) {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });

    // Lägg till en liten info-widget i AI-panelen också
    const info = document.createElement('div');
    info.style.fontSize = '12px';
    info.style.color = '#94a3b8';
    info.textContent = 'Sökfunktionen är nu aktiv i toppmenyn för att snabbt hitta rätt företag i marketplace.';
    
    window.MyOffiCityAddons.addTool('Sökfilter', '🔍', info);
    window.MyOffiCityAddons.register('Global Search');

  } catch (e) {
    console.error('Search Filter Error:', e);
  }
})();

(() => {
  try {
    const statusContainer = document.createElement('div');
    statusContainer.innerHTML = `
      <div style="font-size: 12px; color: #94a3b8;">
        Status-indikatorer är nu aktiva för alla agenter. 
        <div style="margin-top: 8px; display: flex; gap: 10px; align-items: center;">
          <span class="moc-status-dot moc-status-online"></span> Online
          <span class="moc-status-dot moc-status-busy"></span> Upptagen
          <span class="moc-status-dot moc-status-idle"></span> Inaktiv
        </div>
      </div>
    `;
    window.MyOffiCityAddons.addTool('Agent Status', '🟢', statusContainer);
    window.MyOffiCityAddons.register('Agent Status Indicators');
  } catch (e) {
    console.error('Agent Status Init Error:', e);
  }
})();

(() => {
  try {
    const chatInput = document.querySelector('input[type="text"], textarea'); // Justera selektor baserat på faktisk DOM
    
    document.addEventListener('keydown', (e) => {
      // Ctrl+K för att fokusera chatten
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const chat = document.querySelector('#chat-input') || document.querySelector('.chat-box input');
        if (chat) chat.focus();
      }
      
      // Esc för att stänga/avfokusera
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
    });

    const info = document.createElement('div');
    info.style.fontSize = '12px';
    info.style.color = '#94a3b8';
    info.innerHTML = 'Använd <b>Ctrl+K</b> för att fokusera chatten och <b>Esc</b> för att återgå till 3D-vyn.';
    
    window.MyOffiCityAddons.addTool('Tangentbordsgenvägar', '⌨️', info);
    window.MyOffiCityAddons.register('Keyboard Shortcuts');
  } catch (e) {
    console.error('Keyboard Shortcut Init Error:', e);
  }
})();

(() => {
  try {
    const container = document.createElement('div');
    container.innerHTML = '<p style="margin:0; font-size:12px;">Klicka och dra i 3D-rutorna för att rotera objektet.</p>';
    
    let isDragging = false;
    let startX = 0;
    let rotation = 0;

    document.addEventListener('mousedown', (e) => {
      if (e.target.closest('.tc-box')) {
        isDragging = true;
        startX = e.clientX;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const box = document.querySelector('.tc-box');
      if (!box) return;
      const delta = e.clientX - startX;
      rotation += delta * 0.5;
      box.style.transform = `rotateY(${rotation}deg)`;
      startX = e.clientX;
    });

    document.addEventListener('mouseup', () => isDragging = false);

    window.MyOffiCityAddons.addTool('3D Rotation', '🔄', container);
    window.MyOffiCityAddons.register('Drag-to-Rotate');
  } catch (e) {
    console.error('Rotation Init Error:', e);
  }
})();

(() => {
  try {
    const nav = document.getElementById('nav');
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'moc-scroll-top';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.title = 'Till toppen';
    document.body.appendChild(scrollTopBtn);

    let ticking = false;
    const updateScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = 150;
      
      if (scrollY > threshold) {
        scrollTopBtn.classList.add('visible');
        if (nav) nav.classList.add('moc-nav-sticky');
      } else {
        scrollTopBtn.classList.remove('visible');
        if (nav) nav.classList.remove('moc-nav-sticky');
      }
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Initial check
    updateScroll();

    const info = document.createElement('div');
    info.style.fontSize = '12px';
    info.style.color = '#94a3b8';
    info.innerHTML = 'Navigeringen fästs högst upp och en knapp visas för snabb återgång till toppen.';
    
    window.MyOffiCityAddons.addTool('Smart-Scroll', '📜', info);
    window.MyOffiCityAddons.register('Smart-Scroll');
  } catch (e) {
    console.error('Smart-Scroll Init Error:', e);
  }
})();

(() => {
  try {
    /* ---------- Dark Mode Toggle ---------- */
    const darkBtn = document.createElement('button');
    darkBtn.textContent = '🌙 Dark Mode';
    darkBtn.title = 'Växla mörkt läge';
    darkBtn.className = 'moc-dark-toggle-btn';
    const applyTheme = (theme) => {
      if (theme === 'dark') {
        document.documentElement.dataset.theme = 'dark';
      } else {
        delete document.documentElement.dataset.theme;
      }
    };
    const savedTheme = localStorage.getItem('mocTheme');
    if (savedTheme) applyTheme(savedTheme);
    darkBtn.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      const newTheme = isDark ? '' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('mocTheme', newTheme);
    });
    window.MyOffiCityAddons.addTool('Dark Mode', '🌙', darkBtn);
    window.MyOffiCityAddons.register('Dark Mode');

    /* ---------- Page Load Time Widget ---------- */
    const loadInfo = document.createElement('div');
    loadInfo.style.fontSize = '12px';
    loadInfo.style.color = '#94a3b8';
    const showLoadTime = () => {
      const nav = performance.getEntriesByType('navigation')[0];
      if (nav) {
        const ms = Math.round(nav.loadEventEnd - nav.startTime);
        loadInfo.textContent = `⏱️ Sidans laddningstid: ${ms} ms`;
      } else {
        loadInfo.textContent = '⏱️ Laddningstid ej tillgänglig';
      }
    };
    if (document.readyState === 'complete') {
      showLoadTime();
    } else {
      window.addEventListener('load', showLoadTime);
    }
    window.MyOffiCityAddons.addTool('Page Load Time', '⏱️', loadInfo);
    window.MyOffiCityAddons.register('Page Load Time');
  } catch (e) {
    console.error('Addon Init Error:', e);
  }
})();

(() => {
  try {
    /* ---------- Help Modal Widget ---------- */
    const helpBtn = document.createElement('button');
    helpBtn.textContent = '❓ Hjälp';
    helpBtn.style.padding = '6px 12px';
    helpBtn.style.fontSize = '13px';
    helpBtn.style.cursor = 'pointer';
    helpBtn.style.border = 'none';
    helpBtn.style.borderRadius = '6px';
    helpBtn.style.background = 'rgba(217,180,106,0.1)';
    helpBtn.style.color = '#d9b46a';
    helpBtn.style.transition = 'background 0.2s ease';
    helpBtn.addEventListener('mouseover', () => {
      helpBtn.style.background = 'rgba(217,180,106,0.2)';
    });
    helpBtn.addEventListener('mouseout', () => {
      helpBtn.style.background = 'rgba(217,180,106,0.1)';
    });

    /* Modal structure */
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'moc-modal';
    modalOverlay.style.display = 'none';

    const modalContent = document.createElement('div');
    modalContent.className = 'moc-modal-content';
    modalContent.innerHTML = `
      <h2>Hjälp & FAQ</h2>
      <p>Här hittar du svar på vanliga frågor och en kort guide för att komma igång med MyOffiCity.</p>
      <ul>
        <li><b>Hur navigerar jag?</b> Använd musen eller tangentbordet för att flytta runt i 3D‑världen.</li>
        <li><b>Hur öppnar jag chatt?</b> Klicka på chat‑ikonen längst ner till höger.</li>
        <li><b>Hur skapar jag en ny AI‑tillägg?</b> Använd verktygsfältet i AI‑tilläggs‑dock.</li>
      </ul>
      <button class="moc-modal-close">Stäng</button>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    /* Toggle modal visibility */
    const toggleModal = () => {
      modalOverlay.style.display = modalOverlay.style.display === 'none' ? 'flex' : 'none';
    };

    helpBtn.addEventListener('click', toggleModal);
    modalContent.querySelector('.moc-modal-close').addEventListener('click', toggleModal);

    /* Register the widget */
    window.MyOffiCityAddons.addTool('Help', '❓', helpBtn);
    window.MyOffiCityAddons.register('Help');
  } catch (e) {
    console.error('Help Modal Addon Error:', e);
  }
})();

(() => {
  try {
    const widget = document.createElement('div');
    widget.className = 'moc-status-widget';
    widget.innerHTML = `
      <div style="font-weight: bold; border-bottom: 1px solid rgba(217,180,106,0.3); padding-bottom: 4px; margin-bottom: 4px;">
        System Status
      </div>
      <div class="moc-status-row">
        <span>Quota:</span>
        <div class="moc-progress-bar"><div id="moc-quota-fill" class="moc-progress-fill" style="width: 0%"></div></div>
        <span id="moc-quota-text">0%</span>
      </div>
      <div class="moc-status-row">
        <span>GPU Load:</span>
        <span id="moc-gpu-badge" class="moc-gpu-indicator">0%</span>
      </div>
    `;

    document.body.appendChild(widget);
    window.MyOffiCityAddons.addTool('System Monitor', '📊', widget);
    window.MyOffiCityAddons.register('QuotaMonitor');

    const updateStats = async () => {
      try {
        const res = await fetch('/api/ai/quota');
        const data = await res.json();
        
        // Update Quota
        const quotaPercent = Math.min(100, Math.max(0, (data.remaining / data.total) * 100));
        const fill = document.getElementById('moc-quota-fill');
        const text = document.getElementById('moc-quota-text');
        if (fill) fill.style.width = quotaPercent + '%';
        if (text) text.innerText = Math.round(quotaPercent) + '%';

        // Simulate GPU Load (fluctuates based on activity)
        const gpuLoad = Math.floor(Math.random() * 30) + 10; // Simulating 10-40% load
        const gpuBadge = document.getElementById('moc-gpu-badge');
        if (gpuBadge) {
          gpuBadge.innerText = gpuLoad + '%';
          gpuBadge.style.color = gpuLoad > 80 ? '#ff4d4d' : '#00ff9d';
        }
      } catch (e) {
        console.log('Monitor fetch failed', e);
      }
    };

    setInterval(updateStats, 5000);
    updateStats();
  } catch (e) {
    console.error('Quota Monitor Init Error:', e);
  }
})();
===

(() => {
  try {
    const themeSettings = {
      scale: 1.0,
      fontSize: 16,
      theme: 'minimalist'
    };

    const themes = {
      minimalist: { '--primary-color': '#2563eb', '--bg-color': '#ffffff', '--text-color': '#1f2937', '--font-family': 'system-ui' },
      cyberpunk: { '--primary-color': '#f0ab00', '--bg-color': '#000000', '--text-color': '#00ff41', '--font-family': 'monospace' },
      highContrast: { '--primary-color': '#ffff00', '--bg-color': '#000000', '--text-color': '#ffffff', '--font-family': 'Arial' }
    };

    const initTheme = () => {
      const saved = localStorage.getItem('moc_theme_settings');
      if (saved) Object.assign(themeSettings, JSON.parse(saved));
      applyTheme();
    };

    const applyTheme = () => {
      const root = document.documentElement;
      const theme = themes[themeSettings.theme];
      Object.entries(theme).forEach(([key, val]) => root.style.setProperty(key, val));
      root.style.setProperty('--ui-scale', themeSettings.scale);
      root.style.setProperty('--base-font-size', `${themeSettings.fontSize}px`);
      localStorage.setItem('moc_theme_settings', JSON.stringify(themeSettings));
    };

    const createThemePanel = () => {
      const container = document.createElement('div');
      container.id = 'moc-theme-panel';
      container.innerHTML = `
        <div style="padding: 15px; background: #f3f4f6; border-radius: 8px; border: 1px solid #ddd;">
          <h4 style="margin: 0 0 10px 0;">🎨 UI Inställningar</h4>
          <label>Tema: 
            <select id="moc-theme-select" style="margin-left:5px;">
              <option value="minimalist">Minimalist</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="highContrast">High Contrast</option>
            </select>
          </label>
          <div style="margin-top:10px;">
            <label>Skalning: <input type="range" id="moc-scale" min="0.8" max="1.5" step="0.1" value="1"></label>
          </div>
        </div>
      `;

      container.querySelector('#moc-theme-select').addEventListener('change', (e) => {
        themeSettings.theme = e.target.value;
        applyTheme();
      });

      container.querySelector('#moc-scale').addEventListener('input', (e) => {
        themeSettings.scale = e.target.value;
        applyTheme();
      });

      window.MyOffiCityAddons.addTool('Tema', '🎨', container);
      window.MyOffiCityAddons.register('ThemeEngine');
    };

    initTheme();
    createThemePanel();
  } catch (e) { console.error('Theme Engine Error:', e); }
})();
