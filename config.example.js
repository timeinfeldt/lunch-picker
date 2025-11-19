// Copy this file to config.js and fill in your actual values
// config.js is gitignored and will not be committed to the repository

const CONFIG = {
    // Your Google Places API Key
    // Get one at: https://console.cloud.google.com/apis/credentials
    PLACES_API_KEY: 'YOUR_GOOGLE_PLACES_API_KEY_HERE',

    // Published CSV URL from your Google Sheet
    // File -> Share -> Publish to web -> Select sheet -> CSV format
    SHEET_URL: 'YOUR_PUBLISHED_SHEET_CSV_URL_HERE',

    // Edit URL for your Google Sheet
    // The regular sharing link that allows editing
    SHEET_EDIT_URL: 'YOUR_SHEET_EDIT_URL_HERE',

    // Default location for place searches (latitude, longitude)
    DEFAULT_LOCATION: {
        lat: 52.5200,
        lng: 13.4050
    }
};
