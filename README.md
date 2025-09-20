# Cookie Logger - Chrome Extension & Frontend Dashboard

A comprehensive cookie monitoring solution consisting of a Chrome extension that captures cookies and a beautiful web dashboard for viewing, searching, and analyzing the collected data.

## 🚀 Features

### Chrome Extension
- 🍪 **Real-time Cookie Monitoring**: Automatically captures cookies as you browse
- 📊 **Live Statistics**: Shows the number of cookies collected in real-time
- 👁️ **View Cookies**: Opens collected cookies in a beautiful browser tab
- 🎨 **Modern UI**: Clean, intuitive interface with gradient design
- 🔒 **Privacy Focused**: All data stays on your local machine

### Frontend Dashboard
- 🔍 **Advanced Search & Filtering**: Search by cookie name, domain, or value
- 📊 **Real-time Statistics**: View total cookies, unique domains, secure cookies
- 🎨 **Modern UI**: Beautiful gradient design with responsive layout
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔄 **Live Updates**: Automatically syncs with Chrome extension data
- 📤 **Export Options**: Download data as JSON or CSV
- 👁️ **Detailed View**: Click any cookie to see comprehensive details
- 🗂️ **Multiple Views**: Switch between grid and list layouts

## 📁 Project Structure

```
losers_bracket/
├── chrome_extension/          # Chrome extension files
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── content.js            # Content script for cookie detection
│   ├── popup.html            # Extension popup interface
│   ├── popup.js              # Popup functionality
│   └── create_icons.html     # Icon generator
├── frontend/                  # Web dashboard
│   ├── index.html            # Main dashboard page
│   ├── styles.css            # Dashboard styling
│   ├── script.js             # Dashboard functionality
│   ├── extension-connector.js # Extension communication
│   └── README.md             # Frontend documentation
├── LICENSE                    # License file
└── README.md                 # This file
```

## 🛠️ Installation

### 1. Chrome Extension

1. **Navigate to Extension Folder**
   - Go to the `chrome_extension/` directory
   - Follow the instructions in the extension's README

2. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `chrome_extension/` folder
   - The Cookie Logger extension should now appear in your extensions list

3. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Cookie Logger" and click the pin icon to keep it visible

### 2. Frontend Dashboard

1. **Open the Dashboard**
   - Navigate to the `frontend/` directory
   - Open `index.html` in your web browser
   - Or serve it from a local web server for better functionality

2. **Connect to Extension**
   - The frontend will automatically detect the Chrome extension
   - Look for the connection status indicator in the header
   - Green dot = Connected and ready

## 🎯 Usage

### Chrome Extension

1. **Start Logging**
   - Click the Cookie Logger icon in your browser toolbar
   - Click "Start Logging" to begin capturing cookies
   - The status will change to "Logging Active" and show a green indicator

2. **Browse the Internet**
   - Visit any websites you want to monitor
   - Cookies will be automatically captured and stored
   - The counter will update in real-time

3. **View Cookies**
   - Click "View Cookies" to open collected cookies in a new browser tab
   - See all cookies in a beautiful, formatted interface

4. **Stop Logging**
   - Click "Stop Logging" to pause cookie collection
   - You can restart logging at any time

### Frontend Dashboard

1. **View All Cookies**
   - All collected cookies are automatically displayed
   - Real-time updates as new cookies are collected

2. **Search & Filter**
   - Use the search bar to filter by name, domain, or value
   - Select specific domains from the dropdown filter
   - Sort by date, name, or domain

3. **Detailed Analysis**
   - Click any cookie to see detailed information
   - View security flags, expiration dates, and metadata
   - Copy cookie values to clipboard

4. **Export Data**
   - Export as JSON for developers
   - Export as CSV for spreadsheets
   - Clear all data when needed

## 🔧 Technical Details

### Data Flow
1. **Chrome Extension** captures cookies from websites
2. **Background Script** processes and stores cookie data
3. **Chrome Storage API** persists data locally
4. **Frontend Dashboard** reads and displays the data
5. **Real-time Sync** keeps both systems updated

### Storage Methods
- **Chrome Storage API**: Primary storage for extension data
- **Local Storage**: Fallback storage for offline access
- **Real-time Communication**: Secure messaging between components

### Browser Compatibility
- ✅ Chrome 80+ (Extension)
- ✅ Chrome 80+ (Frontend)
- ✅ Firefox 75+ (Frontend)
- ✅ Safari 13+ (Frontend)
- ✅ Edge 80+ (Frontend)

## 🔒 Privacy & Security

- **Local Storage Only**: All data stays on your device
- **No External Servers**: No data is sent to external services
- **Extension Communication**: Secure messaging with Chrome extension
- **User Control**: You decide when to start/stop logging and export data
- **Transparent**: All collected data is clearly visible and manageable

## 📚 Documentation

- **Chrome Extension**: See `chrome_extension/` directory for extension-specific documentation
- **Frontend Dashboard**: See `frontend/README.md` for detailed dashboard documentation
- **Installation Guide**: See `INSTALLATION.md` for step-by-step setup instructions

## 🐛 Troubleshooting

### Extension Issues
1. Check that the extension is loaded and enabled
2. Verify permissions are granted
3. Check browser console for error messages
4. Try reloading the extension

### Frontend Issues
1. Ensure the Chrome extension is installed and running
2. Check browser console for error messages
3. Try refreshing the page
4. Verify extension communication is working

### Data Issues
1. Start logging cookies with the extension
2. Visit websites to generate cookie data
3. Check if data is being saved to Chrome storage
4. Try the refresh button in the dashboard

## 📄 License

This project is open source and available under the MIT License.

## Cookie Data Format

The exported JSON file contains an array of cookie objects with the following structure:

```json
[
  {
    "name": "session_id",
    "value": "abc123xyz",
    "domain": "example.com",
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "sameSite": "lax",
    "expirationDate": 1640995200,
    "storeId": "0",
    "changeType": "page_load",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "url": "https://example.com/page"
  }
]
```

## Privacy & Security

- **Local Storage Only**: All cookie data is stored locally in your browser
- **No External Servers**: The extension doesn't send data to any external servers
- **User Control**: You decide when to start/stop logging and when to download data
- **Transparent**: All collected data is clearly visible in the exported JSON file

## Permissions

The extension requires the following permissions:
- `cookies`: To read cookie data from websites
- `storage`: To store extension settings
- `activeTab`: To access the current tab's information
- `downloads`: To save the JSON file to your computer
- `<all_urls>`: To work on all websites

## Troubleshooting

**Extension not loading?**
- Make sure all files are in the same folder
- Check that Developer mode is enabled in Chrome
- Try refreshing the extensions page

**No cookies being captured?**
- Make sure logging is started (green status indicator)
- Some cookies might be HttpOnly and not accessible via JavaScript
- Try visiting different websites to test

**Download not working?**
- Check that you have permission to save files to your Downloads folder
- Try clicking the download button again
- Make sure you have collected some cookies first

## Development

To modify or extend this extension:

1. Make your changes to the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Cookie Logger extension
4. Test your changes

## License

This project is open source and available under the MIT License.