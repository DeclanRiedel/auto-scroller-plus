document.addEventListener('DOMContentLoaded', () => {
  const speedInput = document.getElementById('scrollSpeed');
  const incrementInput = document.getElementById('speedIncrement');
  const toggleButton = document.getElementById('toggleButton');
  const toggleHotkey = document.getElementById('toggleHotkey');
  const speedUpHotkey = document.getElementById('speedUpHotkey');
  const speedDownHotkey = document.getElementById('speedDownHotkey');
  const themeToggle = document.getElementById('themeToggle');
  const progressToggle = document.getElementById('progressBar');
  const positionToggle = document.getElementById('savePosition');
  const patternSelect = document.getElementById('scrollPattern');
  const steppedSettings = document.getElementById('steppedSettings');
  const stepSize = document.getElementById('stepSize');
  const pauseDuration = document.getElementById('pauseDuration');
  
  // Load saved settings
  browser.storage.local.get([
    'scrollSpeed', 
    'speedIncrement', 
    'isScrolling',
    'toggleHotkey',
    'speedUpHotkey',
    'speedDownHotkey'
  ]).then((result) => {
    speedInput.value = result.scrollSpeed || 1;
    incrementInput.value = result.speedIncrement || 10;
    updateButtonState(result.isScrolling || false);
    
    // Load saved hotkeys or set defaults
    toggleHotkey.value = result.toggleHotkey || 'Ctrl+Shift+V';
    speedUpHotkey.value = result.speedUpHotkey || 'Alt+Up';
    speedDownHotkey.value = result.speedDownHotkey || 'Alt+Down';
  });

  // Simplified theme toggle
  document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    browser.storage.local.set({ theme: newTheme });
  });

  // Load saved theme
  browser.storage.local.get('theme').then((result) => {
    const savedTheme = result.theme || 'light';
    document.body.setAttribute('data-theme', savedTheme);
  });

  // Load feature settings
  browser.storage.local.get([
    'progressBarEnabled',
    'savePositionEnabled',
    'scrollPattern'
  ]).then((result) => {
    progressToggle.checked = result.progressBarEnabled || false;
    positionToggle.checked = result.savePositionEnabled || false;
    patternSelect.value = result.scrollPattern || 'smooth';
  });

  // Load stepped scroll settings
  browser.storage.local.get(['stepSize', 'pauseDuration']).then((result) => {
    stepSize.value = result.stepSize || 100;
    pauseDuration.value = result.pauseDuration || 500;
  });

  // Hotkey recording function
  function recordHotkey(input) {
    let keys = [];
    
    input.addEventListener('keydown', (e) => {
      e.preventDefault();
      
      if (e.key === 'Escape') {
        input.blur();
        return;
      }
      
      keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');
      
      if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt') {
        keys.push(e.key);
        input.value = keys.join('+');
        
        // Save the new hotkey
        const setting = input.id;
        browser.storage.local.set({ [setting]: input.value });
        input.blur();
      }
    });
  }

  // Setup hotkey recording
  [toggleHotkey, speedUpHotkey, speedDownHotkey].forEach(input => {
    input.addEventListener('focus', () => {
      input.value = 'Press keys...';
      recordHotkey(input);
    });
  });

  // Toggle button handler
  toggleButton.addEventListener('click', async () => {
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    const isScrolling = toggleButton.classList.contains('inactive');
    
    browser.tabs.sendMessage(tabs[0].id, {command: "toggle"});
    browser.storage.local.set({ isScrolling: isScrolling });
    updateButtonState(isScrolling);
  });

  function updateButtonState(isScrolling) {
    toggleButton.textContent = isScrolling ? 'Stop Scrolling' : 'Start Scrolling';
    toggleButton.classList.remove(isScrolling ? 'inactive' : 'active');
    toggleButton.classList.add(isScrolling ? 'active' : 'inactive');
  }

  // Save settings when changed
  speedInput.addEventListener('change', () => {
    browser.storage.local.set({ scrollSpeed: parseInt(speedInput.value) });
  });

  incrementInput.addEventListener('change', () => {
    browser.storage.local.set({ speedIncrement: parseInt(incrementInput.value) });
  });

  // Feature toggle handlers
  progressToggle.addEventListener('change', () => {
    browser.storage.local.set({ progressBarEnabled: progressToggle.checked });
  });

  positionToggle.addEventListener('change', () => {
    browser.storage.local.set({ savePositionEnabled: positionToggle.checked });
  });

  patternSelect.addEventListener('change', () => {
    browser.storage.local.set({ scrollPattern: patternSelect.value });
  });

  // Show/hide stepped settings based on pattern selection
  scrollPattern.addEventListener('change', () => {
    steppedSettings.classList.toggle('visible', scrollPattern.value === 'stepped');
    browser.storage.local.set({ scrollPattern: scrollPattern.value });
  });

  // Save stepped settings when changed
  stepSize.addEventListener('change', () => {
    browser.storage.local.set({ stepSize: parseInt(stepSize.value) });
  });

  pauseDuration.addEventListener('change', () => {
    browser.storage.local.set({ pauseDuration: parseInt(pauseDuration.value) });
  });
}); 