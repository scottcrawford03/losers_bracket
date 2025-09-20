# Cookie Logger Frontend Dashboard

A beautiful, modern web interface for viewing and analyzing cookies collected by the Cookie Logger Chrome extension.

## Features

- 🔍 **Advanced Search & Filtering**: Search by cookie name, domain, or value
- 📊 **Real-time Statistics**: View total cookies, unique domains, secure cookies, and recent activity
- 🎨 **Modern UI**: Beautiful gradient design with responsive layout
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔄 **Live Updates**: Automatically syncs with Chrome extension data
- 📤 **Export Options**: Download data as JSON or CSV
- 👁️ **Detailed View**: Click any cookie to see comprehensive details
- 🗂️ **Multiple Views**: Switch between grid and list layouts

## Getting Started

### Prerequisites

1. **Chrome Extension**: Make sure the Cookie Logger Chrome extension is installed and running
2. **Modern Browser**: Chrome, Firefox, Safari, or Edge with JavaScript enabled

### Installation

1. **Open the Frontend**:
   - Simply open `index.html` in your web browser
   - Or serve it from a local web server for better functionality

2. **Connect to Extension**:
   - The frontend will automatically detect the Chrome extension
   - Look for the connection status indicator in the header
   - Green dot = Connected and ready
   - Yellow dot = Checking connection
   - Red dot = Extension not found

### Usage

#### 1. **View Cookies**
- All collected cookies are automatically displayed
- Use the search bar to filter by name, domain, or value
- Select specific domains from the dropdown filter
- Sort by date, name, or domain

#### 2. **Search & Filter**
- **Search Bar**: Type any part of cookie name, domain, or value
- **Domain Filter**: Select specific websites from the dropdown
- **Sort Options**: Choose how to order the results

#### 3. **View Details**
- Click any cookie card to see detailed information
- View security flags, expiration dates, and metadata
- Copy cookie values to clipboard

#### 4. **Export Data**
- **Export JSON**: Download raw cookie data as JSON file
- **Export CSV**: Download formatted data as CSV spreadsheet
- **Clear Data**: Remove all stored cookie data

#### 5. **Extension Controls**
- **Start Logging**: Begin collecting cookies from websites
- **Stop Logging**: Pause cookie collection
- **Status Indicator**: Shows current logging status

## File Structure

```
frontend/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── script.js               # Main JavaScript functionality
├── extension-connector.js  # Chrome extension communication
└── README.md              # This file
```

## Data Storage

The frontend reads cookie data from:
- **Chrome Storage API**: Primary storage method for extension data
- **Local Storage**: Fallback storage for offline access
- **Real-time Sync**: Automatically updates when extension collects new cookies

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Features in Detail

### Search Functionality
- **Real-time search** as you type
- **Multi-field search** across name, domain, and value
- **Case-insensitive** matching
- **Instant results** with no delay

### Statistics Dashboard
- **Total Cookies**: Count of all collected cookies
- **Unique Domains**: Number of different websites
- **Secure Cookies**: Count of HTTPS-only cookies
- **Recent Activity**: Cookies collected in last 24 hours

### Cookie Details Modal
- **Complete Information**: All cookie properties and metadata
- **Security Analysis**: Visual indicators for security flags
- **Copy Functionality**: One-click value copying
- **Responsive Design**: Works on all screen sizes

### Export Options
- **JSON Export**: Raw data for developers and analysis
- **CSV Export**: Formatted data for spreadsheets
- **Timestamped Files**: Automatic filename generation
- **One-click Download**: No additional setup required

## Troubleshooting

### Extension Not Detected
1. Make sure the Chrome extension is installed and enabled
2. Refresh the frontend page
3. Check browser console for error messages
4. Try reloading the extension in `chrome://extensions/`

### No Data Showing
1. Start logging cookies with the extension
2. Visit some websites to generate cookie data
3. Click the "Refresh Data" button
4. Check if cookies are being collected in the extension popup

### Search Not Working
1. Clear the search field and try again
2. Check for typos in search terms
3. Try different search criteria
4. Refresh the page if issues persist

### Export Issues
1. Make sure you have cookies to export
2. Check browser download settings
3. Try a different export format
4. Clear browser cache if needed

## Development

### Local Development
1. Open `index.html` in a web browser
2. Use browser developer tools for debugging
3. Check console for error messages
4. Test with different cookie data sets

### Customization
- **Styling**: Modify `styles.css` for visual changes
- **Functionality**: Update `script.js` for new features
- **Extension Integration**: Modify `extension-connector.js` for communication changes

## Security & Privacy

- **Local Storage Only**: All data stays on your device
- **No External Servers**: No data is sent to external services
- **Extension Communication**: Secure messaging with Chrome extension
- **User Control**: You decide when to start/stop logging and export data

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure Chrome extension is properly installed
4. Try refreshing both the extension and frontend

