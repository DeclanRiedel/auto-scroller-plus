document.addEventListener('DOMContentLoaded', () => {
  const speedInput = document.getElementById('scrollSpeed');
  const incrementInput = document.getElementById('speedIncrement');
  const toggleButton = document.getElementById('toggleButton');
  
  // Load saved settings
  browser.storage.local.get(['scrollSpeed', 'speedIncrement', 'isScrolling']).then((result) => {
    speedInput.value = result.scrollSpeed || 50;
    incrementInput.value = result.speedIncrement || 10;
    updateButtonState(result.isScrolling || false);
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
}); 