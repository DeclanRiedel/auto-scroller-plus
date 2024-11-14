document.addEventListener('DOMContentLoaded', () => {
  const speedInput = document.getElementById('scrollSpeed');
  const incrementInput = document.getElementById('speedIncrement');
  const toggleButton = document.getElementById('toggleButton');
  const toggleHotkey = document.getElementById('toggleHotkey');
  const speedUpHotkey = document.getElementById('speedUpHotkey');
  const speedDownHotkey = document.getElementById('speedDownHotkey');
  const themeToggle = document.getElementById('themeToggle');
  
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

  // Load theme preference
  browser.storage.local.get('darkTheme').then((result) => {
    if (result.darkTheme) {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    }
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

  // Theme toggle handler
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌓' : '☀️';
    browser.storage.local.set({ darkTheme: !isDark });
  });
}); 