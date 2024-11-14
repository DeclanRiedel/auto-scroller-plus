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
    window.scrollBy(0, scrollSpeed / 60);
    requestAnimationFrame(scroll);
  }
}

// Update storage when scroll state changes
function updateScrollState(newState) {
  isScrolling = newState;
  browser.storage.local.set({ isScrolling: newState });
}

// Listen for commands from background script
browser.runtime.onMessage.addListener((message) => {
  switch (message.command) {
    case 'toggle':
      updateScrollState(!isScrolling);
      if (isScrolling) scroll();
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

// Add event listener for the Alt+Up/Down controls
document.addEventListener('keydown', (e) => {
  if (e.altKey && !e.ctrlKey && !e.shiftKey) {
    if (e.key === 'ArrowUp') {
      browser.runtime.sendMessage({type: "keypress", command: "speedUp"});
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      browser.runtime.sendMessage({type: "keypress", command: "speedDown"});
      e.preventDefault();
    }
  }
}); 