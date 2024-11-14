console.log('Auto Scroller content script loaded');

let isScrolling = false;
let scrollSpeed = 50;
let speedIncrement = 10;

// Load settings
browser.storage.local.get(['scrollSpeed', 'speedIncrement']).then((result) => {
  scrollSpeed = result.scrollSpeed || 50;
  speedIncrement = result.speedIncrement || 10;
});

// Listen for storage changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.scrollSpeed) {
    scrollSpeed = changes.scrollSpeed.newValue;
  }
  if (changes.speedIncrement) {
    speedIncrement = changes.speedIncrement.newValue;
  }
});

function scroll() {
  if (isScrolling) {
    try {
      // Try multiple scroll methods
      const scrollAmount = scrollSpeed / 60;
      
      if (document.documentElement.scrollTop !== undefined) {
        document.documentElement.scrollTop += scrollAmount;
      } else if (document.body.scrollTop !== undefined) {
        document.body.scrollTop += scrollAmount;
      } else {
        window.scrollBy(0, scrollAmount);
      }
      
      console.log('Scroll attempted, amount:', scrollAmount);
      requestAnimationFrame(scroll);
    } catch (e) {
      console.error('Scroll error:', e);
      isScrolling = false;
    }
  }
}

// Update storage when scroll state changes
function updateScrollState(newState) {
  isScrolling = newState;
  browser.storage.local.set({ isScrolling: newState });
}

// Listen for commands from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  switch (message.command) {
    case 'toggle':
      console.log('Toggle command received, current state:', isScrolling);
      updateScrollState(!isScrolling);
      if (isScrolling) {
        console.log('Starting scroll');
        scroll();
      }
      break;
    case 'speedUp':
      scrollSpeed += speedIncrement;
      break;
    case 'speedDown':
      scrollSpeed = Math.max(1, scrollSpeed - speedIncrement);
      break;
  }
});

// Add state query handler
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.query === 'getState') {
    sendResponse({ isScrolling });
  }
});

// Add keyboard event listener
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, 'Alt:', e.altKey, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
  
  // Handle Alt+Up/Down
  if (e.altKey && !e.ctrlKey && !e.shiftKey) {
    if (e.key === 'ArrowUp') {
      scrollSpeed += speedIncrement;
      console.log('Speed increased to:', scrollSpeed);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      scrollSpeed = Math.max(1, scrollSpeed - speedIncrement);
      console.log('Speed decreased to:', scrollSpeed);
      e.preventDefault();
    }
  }
  
  // Handle Ctrl+Shift+V
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
    console.log('Toggle hotkey pressed');
    updateScrollState(!isScrolling);
    if (isScrolling) scroll();
    e.preventDefault();
  }
}); 