# Auto Scroller Plus

A customizable Firefox extension that enables automatic scrolling with speed controls and various hotkeys.

## Default Hotkeys

### Primary Controls
- `Ctrl+Shift+V`: Toggle auto-scrolling on/off
- `Alt+Up`: Increase scroll speed
- `Alt+Down`: Decrease scroll speed

> **Note**: These keybinds were specifically chosen to avoid conflicts with Firefox's native shortcuts:
> - `Ctrl+Shift+V` is unused by Firefox natively
> - `Alt+Up/Down` are unused when not in specific contexts

### Known Firefox Shortcuts to Avoid
- `Ctrl+Shift+S` (Save All Tabs)
- `Ctrl+Shift+T` (Restore Closed Tab)
- `Ctrl+Shift+N` (New Private Window)
- `Ctrl+Shift+P` (Private Window)
- `Ctrl+Shift+B` (Bookmarks Sidebar)
- `Ctrl+Shift+H` (History Sidebar)
- `Ctrl+Shift+D` (Bookmark All Tabs)
- `Ctrl+Shift+A` (Add-ons Manager)

## Default Values
- Initial scroll speed: 50 pixels/second
- Default speed increment: 10 pixels/second
- Minimum speed: 1 pixel/second
- Maximum configurable speed: 1000 pixels/second
- Maximum configurable increment: 100 pixels/second

## Technical Details
- Scroll animation runs at 60fps using requestAnimationFrame
- Settings are stored in browser.storage.local
- Extension works on all websites (`<all_urls>` permission)
- Requires "storage" and "activeTab" permissions

## Known Limitations
- Extension must be reloaded after installation to activate hotkeys
- Auto-scrolling stops when switching tabs
- Settings can only be changed through the popup interface

## Controls

### UI Controls
- Toggle Button in extension popup
- Speed adjustment input in extension popup
- Speed increment adjustment in extension popup

### Hotkeys
- `Ctrl+Shift+V`: Toggle auto-scrolling on/off
- `Alt+Up`: Increase scroll speed
- `Alt+Down`: Decrease scroll speed

### Visual Indicators
- Green button: Scrolling is inactive
- Red button: Scrolling is active
- Current speed display in popup
- Current increment display in popup