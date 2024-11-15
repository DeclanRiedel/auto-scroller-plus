browser.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);
  if (command === "toggle-scroll") {
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0]) {
      browser.tabs.sendMessage(tabs[0].id, {command: "toggle"})
        .catch(err => console.error('Error sending toggle message:', err));
    }
  }
});

// Listen for keyboard shortcuts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  if (message.type === "keypress") {
    browser.tabs.query({active: true, currentWindow: true})
      .then((tabs) => {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {command: message.command})
            .catch(err => console.error('Error sending command message:', err));
        }
      });
  }
});

// Add tab focus handling
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  if (tab) {
    browser.tabs.sendMessage(tab.id, {command: "checkScroll"})
      .catch(err => console.error('Error checking scroll state:', err));
  }
}); 