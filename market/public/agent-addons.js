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
    /* --- Micro-Interaction Engine --- */
    const applyMagneticEffect = (btn) => {
      btn.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        const moveX = (x / rect.width) * 10;
        const moveY = (y / rect.height) * 10;
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    };

    const setShimmer = (el, isLoading) => {
      if (isLoading) {
        el.classList.add('shimmer-loading');
      } else {
        el.classList.remove('shimmer-loading');
      }
    };

    // Apply to all primary buttons in the dock/tools
    const initInteractions = () => {
      const buttons = document.querySelectorAll('.btn-primary, .moc-dock-panel .btn');
      buttons.forEach(btn => {
        applyMagneticEffect(btn);
      });
    };

    // Run once on load and after tool rendering
    window.addEventListener('DOMContentLoaded', initInteractions);
    
    // Expose to global for manual triggers
    window.MyOffiCityAddons.applyMagneticEffect = applyMagneticEffect;
    window.MyOffiCityAddons.setShimmer = setShimmer;

  } catch (e) {
    console.error('Micro-Interaction Engine Error:', e);
  }
})();

(() => {
  try {
    const el = document.createElement('div');
    el.className = 'moc-fp-container';
    el.innerHTML = `
      <div class="moc-fp-controls">
        <select id="moc-fp-select" class="moc-fp-select">
          <option value="">Välj företag...</option>
        </select>
      </div>
      <div class="moc-fp-content" id="moc-fp-content">
        <div class="moc-fp-empty">
          <span class="moc-fp-empty-icon">🏢</span>
          <p>Välj ett företag ovan för att se dess profil.</p>
        </div>
      </div>
    `;

    const select = el.querySelector('#moc-fp-select');
    const content = el.querySelector('#moc-fp-content');

    const fetchCompanies = async () => {
      try {
        const res = await fetch('/MyOffiCity/api/companies');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const companies = Array.isArray(data) ? data : (data.companies || []);
        
        if (companies.length === 0) {
          select.innerHTML = '<option value="">Inga företag hittades</option>';
          return;
        }

        companies.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.name;
          select.appendChild(opt);
        });
      } catch (e) {
        select.innerHTML = '<option value="">Fel vid hämtning</option>';
      }
    };

    const renderProfile = (c) => {
      if (!c) return;
      const logo = c.logo || c.logoUrl || '';
      const logoHtml = logo 
        ? `<img src="${logo}" alt="${c.name}" class="moc-fp-logo" onerror="this.style.display='none'">`
        : `<div class="moc-fp-logo-placeholder">🏢</div>`;

      content.innerHTML = `
        <div class="moc-fp-header">
          ${logoHtml}
          <div class="moc-fp-title-group">
            <h3 class="moc-fp-name">${c.name}</h3>
            <span class="moc-fp-tag">${c.tagline || c.description || 'Företag i MyOffiCity'}</span>
          </div>
        </div>
        <div class="moc-fp-stats">
          <div class="moc-fp-stat">
            <span class="moc-fp-stat-val">${c.employees || c.teamSize || '–'}</span>
            <span class="moc-fp-stat-label">Medarbetare</span>
          </div>
          <div class="moc-fp-stat">
            <span class="moc-fp-stat-val">${c.rating || c.score || '–'}</span>
            <span class="moc-fp-stat-label">Betyg</span>
          </div>
          <div class="moc-fp-stat">
            <span class="moc-fp-stat-val">${c.projects || c.orders || '–'}</span>
            <span class="moc-fp-stat-label">Projekt</span>
          </div>
        </div>
        <div class="moc-fp-desc">
          <p>${c.description || c.about || 'Ingen beskrivning tillgänglig.'}</p>
        </div>
      `;
    };

    select.addEventListener('change', async (e) => {
      const id = e.target.value;
      if (!id) {
        content.innerHTML = `<div class="moc-fp-empty"><span class="moc-fp-empty-icon">🏢</span><p>Välj ett företag ovan för att se dess profil.</p></div>`;
        return;
      }
      content.innerHTML = `<div class="moc-fp-loading">Laddar profil...</div>`;
      try {
        const res = await fetch(`/MyOffiCity/api/companies/${id}`);
        if (!res.ok) throw new Error('Not found');
        const c = await res.json();
        renderProfile(c);
      } catch (err) {
        content.innerHTML = `<div class="moc-fp-empty"><span class="moc-fp-empty-icon">⚠️</span><p>Kunde inte ladda profilen.</p></div>`;
      }
    });

    fetchCompanies();
    window.MyOffiCityAddons.addTool('Företagsprofil', '🏢', el);
  } catch (e) {
    console.error('Företagsprofil widget error:', e);
  }
})();

(() => {
  try {
    if (!window.MyOffiCityAddons || typeof window.MyOffiCityAddons.addTool !== 'function') return;

    const el = document.createElement('div');
    el.className = 'moc-quicksearch';
    el.innerHTML = `
      <div class="moc-qs-input-wrap">
        <span class="moc-qs-input-icon">🔍</span>
        <input type="search" class="moc-qs-input" placeholder="Sök företag eller kategori…" autocomplete="off" />
      </div>
      <div class="moc-qs-pills" role="tablist"></div>
      <div class="moc-qs-results" aria-live="polite"></div>
    `;

    const input = el.querySelector('.moc-qs-input');
    const pillsWrap = el.querySelector('.moc-qs-pills');
    const results = el.querySelector('.moc-qs-results');

    let all = [];
    let activeCat = 'Alla';
    let debounce = null;

    const norm = (s) => (s || '').toString().toLowerCase().trim();

    const uniqueCats = (list) => {
      const set = new Set();
      list.forEach((c) => {
        const cat = (c.category || c.sector || c.industry || 'Övrigt').toString().trim() || 'Övrigt';
        set.add(cat);
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'sv'));
    };

    const renderPills = (cats) => {
      pillsWrap.innerHTML = '';
      const catsList = ['Alla', ...cats];
      catsList.forEach((cat) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'moc-qs-pill' + (cat === activeCat ? ' is-active' : '');
        b.textContent = cat;
        b.addEventListener('click', () => {
          activeCat = cat;
          pillsWrap.querySelectorAll('.moc-qs-pill').forEach((p) => p.classList.remove('is-active'));
          b.classList.add('is-active');
          renderResults();
        });
        pillsWrap.appendChild(b);
      });
    };

    const renderResults = () => {
      const q = norm(input.value);
      const filtered = all.filter((c) => {
        const cat = (c.category || c.sector || c.industry || 'Övrigt').toString().trim() || 'Övrigt';
        if (activeCat !== 'Alla' && cat !== activeCat) return false;
        if (!q) return true;
        const hay = norm([c.name, c.title, cat, c.description, c.about].join(' '));
        return hay.includes(q);
      });

      if (!filtered.length) {
        results.innerHTML = `<div class="moc-qs-empty"><span>🔎</span><p>Inga träffar. Prova ett annat sökord eller kategori.</p></div>`;
        return;
      }

      results.innerHTML = '';
      filtered.slice(0, 30).forEach((c) => {
        const cat = (c.category || c.sector || c.industry || 'Övrigt').toString().trim() || 'Övrigt';
        const row = document.createElement('a');
        row.className = 'moc-qs-row';
        row.href = c.url || c.link || `#company-${c.id || c.slug || ''}`;
        row.innerHTML = `
          <span class="moc-qs-row-name">${c.name || c.title || 'Företag'}</span>
          <span class="moc-qs-row-cat">${cat}</span>
        `;
        results.appendChild(row);
      });
      if (filtered.length > 30) {
        const more = document.createElement('div');
        more.className = 'moc-qs-more';
        more.textContent = `+ ${filtered.length - 30} till…`;
        results.appendChild(more);
      }
    };

    const load = async () => {
      try {
        const res = await fetch('/MyOffiCity/api/companies');
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        all = Array.isArray(data) ? data : (data && Array.isArray(data.companies) ? data.companies : []);
        renderPills(uniqueCats(all));
        renderResults();
      } catch (e) {
        results.innerHTML = `<div class="moc-qs-empty"><span>⚠️</span><p>Kunde inte ladda företagslistan.</p></div>`;
      }
    };

    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(renderResults, 140);
    });

    load();
    window.MyOffiCityAddons.addTool('Snabbsök & Filtrera', '🔍', el);
  } catch (e) {}
})();

(() => {
  try {
    const el = document.createElement('div');
    el.className = 'moc-theme-studio';

    const presets = {
      midnight: { name: 'Midnight Premium', bg: '#0a0e1a', surface: '#131a2e', accent: '#d9b46a', text: '#f3ecdc', font: 'system-ui, -apple-system, sans-serif', radius: '12px', spacing: '1' },
      corporate: { name: 'Clean Corporate', bg: '#f8fafc', surface: '#ffffff', accent: '#2563eb', text: '#1e293b', font: 'Inter, system-ui, sans-serif', radius: '8px', spacing: '1.1' },
      vibrant: { name: 'Vibrant Start', bg: '#1a0b2e', surface: '#2d1b4e', accent: '#ec4899', text: '#fdf2f8', font: 'Segoe UI, system-ui, sans-serif', radius: '16px', spacing: '0.9' }
    };

    const applyTheme = (t) => {
      const r = document.documentElement.style;
      r.setProperty('--moc-bg', t.bg);
      r.setProperty('--moc-surface', t.surface);
      r.setProperty('--moc-accent', t.accent);
      r.setProperty('--moc-text', t.text);
      r.setProperty('--moc-font', t.font);
      r.setProperty('--moc-radius', t.radius);
      r.setProperty('--moc-spacing', t.spacing);
    };

    const save = (key) => {
      try { localStorage.setItem('moc-theme', JSON.stringify(presets[key])); } catch(e) {}
    };

    const load = () => {
      try {
        const s = localStorage.getItem('moc-theme');
        if (s) {
          const t = JSON.parse(s);
          applyTheme(t);
          const btn = document.querySelector(`.moc-ts-preset[data-key="${Object.keys(presets).find(k => presets[k].name === t.name)}"]`);
          if (btn) btn.classList.add('active');
        }
      } catch(e) {}
    };

    el.innerHTML = `
      <div class="moc-ts-header">
        <span class="moc-ts-title">🎨 Tema-Studio</span>
        <span class="moc-ts-sub">Live-förhandsvisning</span>
      </div>
      <div class="moc-ts-presets">
        ${Object.entries(presets).map(([k, v]) => `<button class="moc-ts-preset" data-key="${k}">${v.name}</button>`).join('')}
      </div>
      <div class="moc-ts-controls">
        <label class="moc-ts-label">Accentfärg</label>
        <input type="color" class="moc-ts-color" id="mocTsAccent" value="#d9b46a">
        <label class="moc-ts-label">Avstånd (0.8 - 1.2)</label>
        <input type="range" class="moc-ts-range" id="mocTsSpacing" min="0.8" max="1.2" step="0.05" value="1">
        <label class="moc-ts-label">Avrundning (4px - 20px)</label>
        <input type="range" class="moc-ts-range" id="mocTsRadius" min="4" max="20" step="1" value="12">
      </div>
      <div class="moc-ts-preview">
        <div class="moc-ts-preview-card">
          <div class="moc-ts-preview-title">Förhandsvisning</div>
          <div class="moc-ts-preview-text">Din skräddarsydda upplevelse.</div>
          <button class="moc-ts-preview-btn">Klicka här</button>
        </div>
      </div>
    `;

    const accentInput = el.querySelector('#mocTsAccent');
    const spacingInput = el.querySelector('#mocTsSpacing');
    const radiusInput = el.querySelector('#mocTsRadius');

    el.querySelectorAll('.moc-ts-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const t = presets[key];
        applyTheme(t);
        accentInput.value = t.accent;
        spacingInput.value = t.spacing;
        radiusInput.value = parseInt(t.radius);
        el.querySelectorAll('.moc-ts-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        save(key);
      });
    });

    accentInput.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--moc-accent', e.target.value);
    });

    spacingInput.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--moc-spacing', e.target.value);
    });

    radiusInput.addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--moc-radius', e.target.value + 'px');
    });

    load();
    window.MyOffiCityAddons.addTool('Tema-Studio', '🎨', el);
  } catch(e) {}
})();

(() => {
  try {
    const MAX_TILT = 6;
    const cards = document.querySelectorAll('.card, .cards > *, .dpane > .card, .dmain > .card');
    if (!cards.length) return;

    cards.forEach(card => {
      if (card.dataset.tiltInit) return;
      card.dataset.tiltInit = '1';
      card.style.position = 'relative';
      card.style.overflow = 'hidden';
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';

      const glare = document.createElement('div');
      glare.className = 'moc-card-glare';
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = (x / rect.width - 0.5) * 2;
        const py = (y / rect.height - 0.5) * 2;

        card.style.transform = `perspective(1000px) rotateX(${-py * MAX_TILT}deg) rotateY(${px * MAX_TILT}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(217, 180, 106, 0.15)';
        glare.style.opacity = '1';
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        glare.style.opacity = '0';
      });
    });

    window.MyOffiCityAddons.register('3D-tilt & Glans');
  } catch(e) {}
})();
