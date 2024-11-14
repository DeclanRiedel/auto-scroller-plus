console.log('Auto Scroller content script loaded');

let isScrolling = false;
let scrollSpeed = 60;
let speedIncrement = 10;
let hotkeyBindings = {
  toggle: 'Ctrl+Shift+V',
  speedUp: 'Alt+Up',
  speedDown: 'Alt+Down'
};

// Load settings and hotkeys
browser.storage.local.get([
  'scrollSpeed', 
  'speedIncrement',
  'toggleHotkey',
  'speedUpHotkey',
  'speedDownHotkey'
]).then((result) => {
  scrollSpeed = result.scrollSpeed || 60;
  speedIncrement = result.speedIncrement || 10;
  hotkeyBindings.toggle = result.toggleHotkey || 'Ctrl+Shift+V';
  hotkeyBindings.speedUp = result.speedUpHotkey || 'Alt+Up';
  hotkeyBindings.speedDown = result.speedDownHotkey || 'Alt+Down';
});

// Listen for hotkey changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.toggleHotkey) hotkeyBindings.toggle = changes.toggleHotkey.newValue;
  if (changes.speedUpHotkey) hotkeyBindings.speedUp = changes.speedUpHotkey.newValue;
  if (changes.speedDownHotkey) hotkeyBindings.speedDown = changes.speedDownHotkey.newValue;
  if (changes.scrollSpeed) scrollSpeed = changes.scrollSpeed.newValue;
  if (changes.speedIncrement) speedIncrement = changes.speedIncrement.newValue;
});

// Convert hotkey string to key event match
function matchHotkey(event, hotkeyStr) {
  const keys = hotkeyStr.split('+');
  const modifiers = {
    'Ctrl': event.ctrlKey,
    'Shift': event.shiftKey,
    'Alt': event.altKey
  };
  
  const mainKey = keys[keys.length - 1];
  return keys.every(key => modifiers[key] === true || key === event.key);
}

// Keyboard event listener
document.addEventListener('keydown', (e) => {
  if (matchHotkey(e, hotkeyBindings.toggle)) {
    updateScrollState(!isScrolling);
    if (isScrolling) scroll();
    e.preventDefault();
  } else if (matchHotkey(e, hotkeyBindings.speedUp)) {
    scrollSpeed += speedIncrement;
    e.preventDefault();
  } else if (matchHotkey(e, hotkeyBindings.speedDown)) {
    scrollSpeed = Math.max(1, scrollSpeed - speedIncrement);
    e.preventDefault();
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
 