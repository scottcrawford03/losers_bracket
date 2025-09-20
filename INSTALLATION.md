# Installation Guide - Cookie Logger Chrome Extension

## Quick Start

### Step 1: Create Icons
1. Open `create_icons.html` in your web browser
2. Right-click on each icon and save them as:
   - `icon16.png` (16x16 icon)
   - `icon48.png` (48x48 icon) 
   - `icon128.png` (128x128 icon)
3. Make sure all icon files are in the same folder as the other extension files

### Step 2: Load Extension in Chrome
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the folder containing all the extension files
6. The Cookie Logger extension should now appear in your extensions list

### Step 3: Start Using
1. Click the Cookie Logger icon in Chrome's toolbar (you may need to pin it first)
2. Click "Start Logging" to begin capturing cookies
3. Browse websites - cookies will be automatically collected
4. Click "Download Cookies" to save all collected data as a JSON file

## File Checklist

Make sure you have all these files in your extension folder:
- ✅ `manifest.json`
- ✅ `background.js`
- ✅ `content.js`
- ✅ `popup.html`
- ✅ `popup.js`
- ✅ `icon16.png` (created from create_icons.html)
- ✅ `icon48.png` (created from create_icons.html)
- ✅ `icon128.png` (created from create_icons.html)

## Troubleshooting

**"Invalid manifest" error?**
- Check that `manifest.json` is valid JSON
- Make sure all required files are present

**Extension loads but doesn't work?**
- Check the browser console for errors (F12 → Console)
- Make sure all file paths in manifest.json are correct

**Icons not showing?**
- Make sure you created the icon files from `create_icons.html`
- Check that icon files are in the same folder as other files

**No cookies being captured?**
- Make sure you clicked "Start Logging"
- Some cookies are HttpOnly and can't be accessed by extensions
- Try visiting different websites

## Security Note

This extension requires broad permissions to access cookies from all websites. Only install it if you trust the source and understand what it does. The extension only stores data locally on your computer.

