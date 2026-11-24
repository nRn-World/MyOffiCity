// Mobilanpassade interaktioner för MyOffiCity
document.addEventListener('DOMContentLoaded', function() {
  // Kontrollera om användaren är på en mobilenhet
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Lägg till mobilanpassade element om det är en mobilenhet
  if (isMobile()) {
    // Lägg till mobilanpassad header
    const header = document.createElement('div');
    header.className = 'mobile-header';
    header.innerHTML = `
      <button class="mobile-btn" id="menu-btn" aria-label="Meny">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <h1>MyOffiCity</h1>
      <button class="mobile-btn" id="user-btn" aria-label="Användare">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </button>
    `;
    document.body.insertBefore(header, document.body.firstChild);

    // Lägg till mobilanpassad footer
    const footer = document.createElement('div');
    footer.className = 'mobile-footer';
    footer.innerHTML = `
      <button class="mobile-btn" id="office-btn" aria-label="Kontor">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.6" />
          <rect x="14" y="3" width="7" height="7" rx="1.6" />
          <rect x="3" y="14" width="7" height="7" rx="1.6" />
          <rect x="14" y="14" width="7" height="7" rx="1.6" />
        </svg>
      </button>
      <button class="mobile-btn" id="chat-btn" aria-label="Chatt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.4-.6L4 21l1.4-4.2a8 8 0 0 1-.9-3.8A8.4 8.4 0 0 1 13 4.7a8.4 8.4 0 0 1 8 6.8Z" />
        </svg>
      </button>
      <button class="mobile-btn" id="team-btn" aria-label="Team">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
          <circle cx="9.5" cy="8" r="3.5" />
          <path d="M21 20v-1.6a3.4 3.4 0 0 0-2.6-3.3M16.5 4.6a3.4 3.4 0 0 1 0 6.6" />
        </svg>
      </button>
    `;
    document.body.appendChild(footer);

    // Lägg till mobilanpassad CSS
    const mobileCSS = document.createElement('link');
    mobileCSS.rel = 'stylesheet';
    mobileCSS.href = 'mobile.css';
    document.head.appendChild(mobileCSS);

    // Hantera knapptryckningar
    document.getElementById('menu-btn').addEventListener('click', function() {
      document.querySelector('.side').classList.toggle('open');
    });

    document.getElementById('office-btn').addEventListener('click', function() {
      document.querySelector('[data-v="office"]').click();
    });

    document.getElementById('chat-btn').addEventListener('click', function() {
      document.querySelector('[data-v="chat"]').click();
    });
