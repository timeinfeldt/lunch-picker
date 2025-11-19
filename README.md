# Lunch Picker

A simple, mobile-friendly web app to help you decide where to eat lunch. Never struggle with lunch decisions again!

## Features

- **Random Selection**: Get a random lunch place suggestion from your shared list
- **Not Today**: Skip a suggestion if you're not feeling it
- **Google Sheets Integration**: Shared list powered by a public Google Sheet
- **Mobile-Friendly**: Optimized for use on your phone
- **Real-time Updates**: Refresh to get the latest places from the sheet

## How to Use

1. Open the app in your browser
2. Click "Pick a Place" to get a random suggestion from the Google Sheet
3. Choose "Not Today" to skip to another suggestion
4. Use "Refresh" to reload the latest places from the Google Sheet
5. Use "View List" to see all available lunch places

## Live Demo

Visit the app at: https://timeinfeldt.github.io/lunch-picker/

## Setting Up Your Own Google Sheet

1. Create a new Google Sheet
2. Add lunch place names in a single column (one place per row)
3. Optionally add a header row (e.g., "Place Name")
4. Go to **File** → **Share** → **Publish to web**
5. Select your sheet and choose **CSV** format
6. Click **Publish** and copy the URL
7. Update the `SHEET_URL` in [app.js](app.js:2) with your published CSV URL

## Managing Lunch Places

To add or remove places:
1. Open your Google Sheet
2. Add new places by typing them in new rows
3. Delete places by removing rows
4. Changes will appear in the app after clicking "Refresh"

## Technology

- Pure HTML, CSS, and JavaScript
- No dependencies or frameworks
- Fetches data from Google Sheets public CSV export

## Adding to Your Phone's Home Screen

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"

## Notes

- Everyone using the app sees the same Google Sheet
- The app fetches fresh data each time you refresh
- To permanently remove a place, delete it from the Google Sheet
- You can share the Google Sheet with friends so they can also edit it

Enjoy your lunch decisions! 🍽️
