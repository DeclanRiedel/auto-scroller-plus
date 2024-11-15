console.log('Auto Scroller content script loaded');

let isScrolling = false;
let scrollSpeed = 60;
let speedIncrement = 10;
let hotkeyBindings = {
  toggle: 'Ctrl+Shift+V',
  speedUp: 'Alt+Up',
  speedDown: 'Alt+Down'
};
let progressBar = null;
let scrollPattern = 'smooth';
let savedPositions = {};
let stepSize = 100;
let pauseDuration = 500;
let lastStepTime = 0;
let lastScrollTime = performance.now();
const FRAME_TIME = 1000 / 60; // Target 60fps

// Load settings and hotkeys
browser.storage.local.get([
  'scrollSpeed', 
  'speedIncrement',
  'toggleHotkey',
  'speedUpHotkey',
  'speedDownHotkey',
  'progressBarEnabled',
  'savePositionEnabled',
  'scrollPattern',
  'savedPositions'
]).then((result) => {
  scrollSpeed = result.scrollSpeed || 60;
  speedIncrement = result.speedIncrement || 10;
  hotkeyBindings.toggle = result.toggleHotkey || 'Ctrl+Shift+V';
  hotkeyBindings.speedUp = result.speedUpHotkey || 'Alt+Up';
  hotkeyBindings.speedDown = result.speedDownHotkey || 'Alt+Down';
  if (result.progressBarEnabled) createProgressBar();
  if (result.savePositionEnabled) {
    savedPositions = result.savedPositions || {};
    loadPosition();
  }
  scrollPattern = result.scrollPattern || 'smooth';
});

// Listen for hotkey changes
browser.storage.onChanged.addListener((changes) => {
  if (changes.toggleHotkey) hotkeyBindings.toggle = changes.toggleHotkey.newValue;
  if (changes.speedUpHotkey) hotkeyBindings.speedUp = changes.speedUpHotkey.newValue;
  if (changes.speedDownHotkey) hotkeyBindings.speedDown = changes.speedDownHotkey.newValue;
  if (changes.scrollSpeed) scrollSpeed = changes.scrollSpeed.newValue;
  if (changes.speedIncrement) speedIncrement = changes.speedIncrement.newValue;
  if (changes.progressBarEnabled) createProgressBar();
  if (changes.savePositionEnabled) {
    savedPositions = changes.savedPositions.newValue || {};
    loadPosition();
  }
  if (changes.scrollPattern) scrollPattern = changes.scrollPattern.newValue;
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
    e.preventDefault();
    updateScrollState(!isScrolling);
    if (isScrolling) scroll();
  } else if (matchHotkey(e, hotkeyBindings.speedUp)) {
    e.preventDefault();
    scrollSpeed += speedIncrement;
    browser.storage.local.set({ scrollSpeed });
  } else if (matchHotkey(e, hotkeyBindings.speedDown)) {
    e.preventDefault();
    scrollSpeed = Math.max(1, scrollSpeed - speedIncrement);
    browser.storage.local.set({ scrollSpeed });
  }
});

function scroll() {
  if (!isScrolling) return;
  
  requestAnimationFrame(() => {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastScrollTime;
    
    try {
      if (scrollPattern === 'stepped') {
        if (currentTime - lastStepTime >= pauseDuration) {
          window.scrollBy(0, stepSize);
          lastStepTime = currentTime;
        }
      } else {
        // Continuous smooth scroll
        const pixelsToScroll = (scrollSpeed / 60);
        window.scrollBy(0, pixelsToScroll);
      }
      
      updateProgress();
      lastScrollTime = currentTime;
    } catch (e) {
      console.error('Scroll error:', e);
      isScrolling = false;
    }
    
    scroll();
  });
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

// Add progress bar creation
function createProgressBar() {
  if (!document.querySelector('.reading-progress')) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress-bar';
    progressContainer.appendChild(progressBar);
    document.body.appendChild(progressContainer);
  }
}

// Update progress calculation
function updateProgress() {
  const progressBar = document.querySelector('.reading-progress-bar');
  if (progressBar) {
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const scrolled = window.pageYOffset;
    const maxScroll = documentHeight - windowHeight;
    const progress = (scrolled / maxScroll) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}

// Save position
function savePosition() {
  const url = window.location.href;
  savedPositions[url] = window.scrollY;
  browser.storage.local.set({ savedPositions });
}

// Load position
function loadPosition() {
  const url = window.location.href;
  if (savedPositions[url]) {
    window.scrollTo(0, savedPositions[url]);
  }
}

// Ensure smooth resumption when tab becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isScrolling) {
    lastScrollTime = performance.now();
    requestAnimationFrame(scroll);
  }
});
 