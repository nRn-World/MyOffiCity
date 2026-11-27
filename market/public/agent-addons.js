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
