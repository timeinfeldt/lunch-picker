# Lunch Picker

A simple, mobile-friendly web app to help you decide where to eat lunch. Never struggle with lunch decisions again!

## Features

- **Random Selection**: Get a random lunch place suggestion from your shared list
- **Not Today**: Skip a suggestion if you're not feeling it
- **Google Sheets Integration**: Shared list powered by a public Google Sheet
- **Mobile-Friendly**: Optimized for use on your phone
- **Always Fresh**: Latest places loaded automatically when you open the app

## How to Use

1. Open the app in your browser
2. Click "Pick a Place" to get a random suggestion from the Google Sheet
3. Choose "Not Today" to skip to another suggestion
4. Use "View List" to see all available lunch places
5. Refresh the page to load the latest changes from the Google Sheet

## Live Demo

Visit the app at: https://timeinfeldt.github.io/lunch-picker/

## Initial Setup

1. **Create your configuration file**:
   - Copy `config.example.js` to `config.js`
   - Fill in your Google Places API key (see below)
   - Add your Google Sheet URLs (see below)
   - Update the default location coordinates if needed

2. **Get a Google Places API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Enable the "Places API (New)"
   - Create an API key
   - Add the key to your `config.js`

3. **Set up your Google Sheet** (see next section)

**Note**: `config.js` is gitignored and will not be committed to the repository. This keeps your API keys and sheet URLs secure.

## Setting Up Your Own Google Sheet

1. Create a new Google Sheet
2. Add three columns: **Name**, **URL**, **Place ID**
   - **Name**: Display name for the restaurant
   - **URL** (optional): Google Maps URL for the place
   - **Place ID** (optional): Google Place ID (most reliable)
3. Add a header row: `Name`, `URL`, `Place ID`
4. Go to **File** → **Share** → **Publish to web**
5. Select your sheet and choose **CSV** format
6. Click **Publish** and copy the published CSV URL
7. For the edit URL, use the regular sharing link (File → Share → Copy link)
8. Add both URLs to your `config.js`

## Managing Lunch Places

To add or remove places:
1. Open your Google Sheet
2. Add new places by typing them in new rows
3. Delete places by removing rows
4. Changes will appear in the app after refreshing the page

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
- The app fetches fresh data each time you open or refresh the page
- To permanently remove a place, delete it from the Google Sheet
- You can share the Google Sheet with friends so they can also edit it

Enjoy your lunch decisions! 🍽️
