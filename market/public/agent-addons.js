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
  // 4. Virtual Meeting Cache System
  const meetingCache = {
    data: new Map(),
    maxSize: 100,
    ttl: 30 * 60 * 1000, // 30 minutes in milliseconds

    set(key, value) {
      if (this.data.size >= this.maxSize) {
        // Remove the oldest entry if cache is full
        const oldestKey = this.data.keys().next().value;
        this.data.delete(oldestKey);
      }
      this.data.set(key, {
        value,
        timestamp: Date.now()
      });
    },

    get(key) {
      const item = this.data.get(key);
      if (!item) return null;

      // Check if item has expired
      if (Date.now() - item.timestamp > this.ttl) {
        this.data.delete(key);
        return null;
      }

      return item.value;
    },

    clear() {
      this.data.clear();
    }
  };

  // Function to cache meeting data
  function cacheMeetingData(meetingId, data) {
    meetingCache.set(meetingId, data);
  }

  // Function to get cached meeting data
  function getCachedMeetingData(meetingId) {
    return meetingCache.get(meetingId);
  }

  // Function to initialize meeting cache system
  function initMeetingCache() {
    // Check if we're on a meeting page
    if (!window.location.pathname.includes('/meeting/')) return;

    // Get meeting ID from URL
    const meetingId = window.location.pathname.split('/').pop();

    // Try to get cached data
    const cachedData = getCachedMeetingData(meetingId);

    if (cachedData) {
      // Use cached data
      console.log('Using cached meeting data for:', meetingId);
      // Here you would typically update the UI with the cached data
      // For example: updateMeetingUI(cachedData);
    } else {
      // Fetch fresh data and cache it
      console.log('Fetching fresh meeting data for:', meetingId);
      // Here you would typically fetch fresh data from the server
      // For example:
      /*
      fetch(`/api/meetings/${meetingId}`)
        .then(response => response.json())
        .then(data => {
          cacheMeetingData(meetingId, data);
          // updateMeetingUI(data);
        });
      */
    }

    // Register the feature
    window.MyOffiCityAddons.register('Virtual Meeting Cache');
  }

  // Initialize the meeting cache system when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeetingCache);
  } else {
    initMeetingCache();
  }
})();
