// Mobile-specific JavaScript for MyOffiCity
document.addEventListener('DOMContentLoaded', function() {
  // Check if the device is mobile
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Apply mobile-specific styles and behaviors
  function applyMobileStyles() {
    if (isMobile()) {
      // Add mobile class to body
      document.body.classList.add('mobile');

      // Adjust navigation for mobile
      const navButtons = document.querySelectorAll('#nav button');
      navButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Close other open panels when a new one is opened
          if (!this.classList.contains('on')) {
            navButtons.forEach(btn => btn.classList.remove('on'));
            this.classList.add('on');
          }
        });
      });

      // Adjust office view for mobile
      const officeView = document.querySelector('.office-view');
      if (officeView) {
        // Add touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        officeView.addEventListener('touchstart', function(e) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }, false);

        officeView.addEventListener('touchmove', function(e) {
          if (!touchStartX || !touchStartY) return;

          const touchEndX = e.touches[0].clientX;
          const touchEndY = e.touches[0].clientY;

          const diffX = touchStartX - touchEndX;
          const diffY = touchStartY - touchEndY;

          // Horizontal swipe for rotation
          if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
              // Swipe left - rotate right
              rotateOffice('right');
            } else {
              // Swipe right - rotate left
              rotateOffice('left');
            }
          }

          // Vertical swipe for zoom
          if (Math.abs(diffY) > Math.abs(diffX)) {
            if (diffY > 0) {
              // Swipe up - zoom in
              zoomOffice('in');
            } else {
              // Swipe down - zoom out
              zoomOffice('out');
            }
          }

          touchStartX = touchEndX;
          touchStartY = touchEndY;
        }, false);
      }

      // Adjust chat view for mobile
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        // Auto-scroll to bottom when new messages arrive
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
          });
        });

        observer.observe(chatMessages, { childList: true });
      }
    }
  }

  // Initial application of mobile styles
  applyMobileStyles();

  // Reapply mobile styles on window resize
  window.addEventListener('resize', applyMobileStyles);

  // Helper function to rotate the office view
  function rotateOffice(direction) {
    // Implementation depends on your 3D engine
    console.log(`Rotating office ${direction}`);
  }

  // Helper function to zoom the office view
  function zoomOffice(direction) {
    // Implementation depends on your 3D engine
    console.log(`Zooming office ${direction}`);
  }
});
