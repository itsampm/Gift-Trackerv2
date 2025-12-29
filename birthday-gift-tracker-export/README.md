# Birthday Gift Tracker - Standalone Web App

A playful, colorful birthday and Christmas gift tracking app that runs entirely in your browser!

## Features

- 📝 Track kids with names, birthdays, photos, and interests
- 🎁 Record birthday and Christmas gifts for any year (2000-2200)
- 🎄 Christmas checklist with progress tracking
- 📅 Birthday reminders for upcoming birthdays
- 🌙 Dark mode toggle
- 📱 Mobile-friendly responsive design
- 💾 All data stored locally in your browser (no server needed!)

## Quick Start

### Option 1: Open Directly
1. Download/clone this repository
2. Open `index.html` in your web browser
3. Start tracking gifts!

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to GitHub Pages

1. Create a new GitHub repository
2. Upload all files from this folder
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save
7. Your app will be live at `https://yourusername.github.io/repository-name/`

## Browser Compatibility

Works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Storage

All data is stored in your browser's localStorage:
- **Kids data**: Names, birthdays, photos (base64), interests
- **Gifts data**: Gift records for each kid by year and occasion
- **Settings**: Dark mode preference

**Note**: Data is specific to each browser/device. Export your data periodically using the browser's developer tools if needed.

## Privacy

- ✅ 100% client-side - no data sent to any server
- ✅ No tracking or analytics
- ✅ No external dependencies after initial load
- ✅ Works offline after first visit

## File Structure

```
birthday-gift-tracker/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── app.js              # Main application logic
├── README.md           # This file
└── LICENSE             # MIT License
```

## Troubleshooting

**Data not saving?**
- Check if localStorage is enabled in your browser
- Check browser console for errors
- Try clearing browser cache and reload

**Photos not showing?**
- Photos are stored as base64 in localStorage
- Large photos may hit storage limits (usually 5-10MB)
- Compress images before uploading

**Dark mode not persisting?**
- Check if cookies/localStorage are enabled
- Some browsers in private mode don't persist localStorage

## Development

To modify the app:
1. Edit `index.html`, `styles.css`, or `app.js`
2. Refresh your browser to see changes
3. No build process required!

## License

MIT License - Feel free to use, modify, and distribute!

## Credits

Built with:
- Vanilla JavaScript
- CSS3 with custom animations
- Local Storage API
- Love for gift-giving! 🎁
