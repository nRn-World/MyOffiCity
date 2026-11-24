// Mobilanpassad navigering för MyOffiCity
document.addEventListener('DOMContentLoaded', function() {
  // Skapa mobilheader
  const mobileHeader = document.createElement('div');
  mobileHeader.className = 'mobile-header';
  mobileHeader.innerHTML = `
    <div class="logo">
      <svg viewBox="0 0 64 60" width="30" height="30" aria-hidden="true">
        <polyline points="4,56 32,5 60,56" fill="none" stroke="#d9b46a" stroke-width="3.6" stroke-linejoin="miter" />
        <g transform="translate(20 26) scale(.5)">
          <g fill="#f3ecdc">
            <rect x="6" y="20" width="10" height="19" />
            <rect x="18" y="9" width="12" height="30" />
            <rect x="32" y="26" width="10" height="13" />
            <rect x="4" y="39" width="40" height="2.5" />
          </g>
          <rect x="19.5" y="5.5" width="9" height="4" fill="#f0a14d" />
          <g fill="#14203d">
            <rect x="8.2" y="23" width="2.4" height="2.4" />
            <rect x="11.8" y="23" width="2.4" height="2.4" />
            <rect x="8.2" y="28" width="2.4" height="2.4" />
            <rect x="11.8" y="28" width="2.4" height="2.4" />
            <rect x="20.3" y="13" width="2.4" height="2.4" />
            <rect x="25.3" y="13" width="2.4" height="2.4" />
            <rect x="20.3" y="18.5" width="2.4" height="2.4" />
            <rect x="25.3" y="18.5" width="2.4" height="2.4" />
            <rect x="20.3" y="24" width="2.4" height="2.4" />
            <rect x="25.3" y="24" width="2.4" height="2.4" />
            <rect x="34.2" y="29.5" width="2.4" height="2.4" />
            <rect x="38" y="29.5" width="2.4" height="2.4" />
          </g>
        </g>
      </svg>
      <span class="title">MyOffiCity</span>
    </div>
  `;
  document.body.insertBefore(mobileHeader, document.getElementById('app'));

  // Skapa mobilnavigering
  const mobileNav = document.createElement('nav');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `
    <button data-v="office" class="on" aria-keyshortcuts="1" aria-current="page">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1.6" />
      </svg>
      <span>Office</span>
    </button>
    <button data-v="chat" aria-keyshortcuts="2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.4-.6L4 21l1.4-4.2a8 8 0 0 1-.9-3.8A8.4 8.4 0 0 1 13 4.7a8.4 8.4 0 0 1 8 6.8Z" />
      </svg>
      <span>Chat</span>
    </button>
    <button data-v="team" aria-keyshortcuts="3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
        <circle cx="9.5" cy="8" r="3.5" />
        <path d="M21 20v-1.6a3.4 3
