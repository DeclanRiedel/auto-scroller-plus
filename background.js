browser.commands.onCommand.addListener((command) => {
  if (command === "toggle-scroll") {
    browser.tabs.query({active: true, currentWindow: true})
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {command: "toggle"});
      });
  }
});

// Listen for keyboard shortcuts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "keypress") {
    browser.tabs.query({active: true, currentWindow: true})
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {command: message.command});
      });
  }
}); 