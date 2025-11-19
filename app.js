// Google Sheets URLs
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuDfel6sZhxVaHJUCk5PEsp5c9pYTg3wo2-E7R6E2720CJD7WMJYTfDqpRruEZ4m2QSszaoOW2inqJ/pub?gid=0&single=true&output=csv';
const SHEET_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1XMbc1rDc8Bt2Wl1OlD7PEBzTNkC-BknEbVMAOEptEew/edit?usp=sharing';

// Google Places API
const PLACES_API_KEY = 'AIzaSyClwWstOrlxQPR73myHPVE1tGT9MvTOjRw';

// Gradient color schemes (food-friendly warm tones)
const GRADIENTS = [
    ['#FF6B6B', '#FFE66D'],  // Red to Yellow
    ['#FF8C42', '#FFC837'],  // Orange to Golden
    ['#E94B3C', '#FFAB73'],  // Red-Orange to Peach
    ['#43A047', '#8BC34A'],  // Green to Light Green
    ['#FFB347', '#FFCC33'],  // Tangerine to Yellow
    ['#D84315', '#FF8A65'],  // Deep Orange to Light Orange
    ['#689F38', '#AED581'],  // Olive to Lime
    ['#F4511E', '#FFB74D'],  // Flame to Orange
    ['#C62828', '#FF6F00'],  // Deep Red to Amber
    ['#FFA726', '#FFEB3B'],  // Orange to Yellow
];

// State
let places = [];
let currentSuggestion = null;
let suggestedToday = new Set();
let skippedToday = new Set();
let isLoading = false;

// localStorage keys
const STORAGE_KEY_SKIPPED = 'lunchPicker_skippedToday';
const STORAGE_KEY_DATE = 'lunchPicker_lastDate';
const STORAGE_KEY_PLACES_CACHE = 'lunchPicker_placesCache';

// DOM Elements
const suggestionCard = document.getElementById('suggestion-card');
const emptyState = document.getElementById('empty-state');
const placeName = document.getElementById('place-name');
const pickPlaceBtn = document.getElementById('pick-place-btn');
const notTodayBtn = document.getElementById('not-today-btn');
const neverAgainBtn = document.getElementById('never-again-btn');

// Get today's date string
function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Load skipped places from localStorage
function loadSkippedPlaces() {
    const lastDate = localStorage.getItem(STORAGE_KEY_DATE);
    const todayString = getTodayString();

    // If it's a new day, clear the skipped list
    if (lastDate !== todayString) {
        localStorage.removeItem(STORAGE_KEY_SKIPPED);
        localStorage.setItem(STORAGE_KEY_DATE, todayString);
        skippedToday.clear();
    } else {
        // Load skipped places from today
        const stored = localStorage.getItem(STORAGE_KEY_SKIPPED);
        if (stored) {
            skippedToday = new Set(JSON.parse(stored));
        }
    }
}

// Save skipped places to localStorage
function saveSkippedPlaces() {
    localStorage.setItem(STORAGE_KEY_SKIPPED, JSON.stringify([...skippedToday]));
}

// Initialize app
async function init() {
    loadSkippedPlaces();
    attachEventListeners();
    await loadPlacesFromSheet();
    updateUI();

    // Show initial suggestion if places are available
    if (places.length > 0) {
        showSuggestion();
    }
}

// Parse CSV row handling quoted fields
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current); // Add last field
    return result;
}

// Load places from Google Sheet
async function loadPlacesFromSheet() {
    isLoading = true;
    updateLoadingState();

    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch places from Google Sheet');
        }

        const csvText = await response.text();
        const rows = csvText.trim().split('\n');

        // Parse CSV: now expecting two columns (Name, URL)
        places = rows
            .map((row, index) => {
                // Skip first row if it looks like a header
                if (index === 0 && (row.toLowerCase().includes('place') || row.toLowerCase().includes('name'))) {
                    return null;
                }

                const columns = parseCSVRow(row);
                if (columns.length === 0 || !columns[0].trim()) {
                    return null;
                }

                // Format: { name: "Display Name", url: "URL or empty" }
                return {
                    name: columns[0].trim(),
                    url: columns[1]?.trim() || ''
                };
            })
            .filter(place => place !== null);

        isLoading = false;
        updateLoadingState();
    } catch (error) {
        console.error('Error loading places:', error);
        isLoading = false;
        showError('Unable to load lunch places. Please check your connection and try again.');
    }
}

// Show error message
function showError(message) {
    emptyState.innerHTML = `<p style="color: #ff4757;">${message}</p><button id="retry-btn" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>`;
    document.getElementById('retry-btn')?.addEventListener('click', async () => {
        await loadPlacesFromSheet();
        updateUI();
    });
}

// Update loading state
function updateLoadingState() {
    if (isLoading) {
        emptyState.innerHTML = '<p>Loading lunch places...</p>';
        emptyState.classList.remove('hidden');
        pickPlaceBtn.classList.add('hidden');
    }
}

// Update UI based on state
function updateUI() {
    if (isLoading) {
        return;
    }

    if (places.length === 0) {
        emptyState.innerHTML = '<p>No lunch places found in the Google Sheet.</p><p>Add some places to get started!</p>';
        emptyState.classList.remove('hidden');
        pickPlaceBtn.classList.add('hidden');
        suggestionCard.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        // Keep pick button hidden since we show suggestions automatically
        pickPlaceBtn.classList.add('hidden');
    }
}


// Pick a random place
function pickRandomPlace() {
    // Filter out: places already suggested, skipped today, AND the current suggestion
    let availablePlaces = places.filter(place =>
        !suggestedToday.has(place.name) &&
        !skippedToday.has(place.name) &&
        place.name !== currentSuggestion?.name
    );

    // If no places available, reset suggested (but keep skipped and current)
    if (availablePlaces.length === 0) {
        suggestedToday.clear();
        availablePlaces = places.filter(place =>
            !skippedToday.has(place.name) &&
            place.name !== currentSuggestion?.name
        );

        // If still no places (all skipped), allow skipped places but not current
        if (availablePlaces.length === 0) {
            availablePlaces = places.filter(place => place.name !== currentSuggestion?.name);

            // If we only have one place total, just return it
            if (availablePlaces.length === 0) {
                return currentSuggestion;
            }
        }
    }

    const randomIndex = Math.floor(Math.random() * availablePlaces.length);
    return availablePlaces[randomIndex];
}

// Get random gradient for a place
function getGradientForPlace(place) {
    // Use the place name to generate a consistent index
    let hash = 0;
    for (let i = 0; i < place.length; i++) {
        hash = place.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
}

// Load places cache from localStorage
function loadPlacesCache() {
    try {
        const cached = localStorage.getItem(STORAGE_KEY_PLACES_CACHE);
        return cached ? JSON.parse(cached) : {};
    } catch (error) {
        console.error('Error loading places cache:', error);
        return {};
    }
}

// Save places cache to localStorage
function savePlacesCache(cache) {
    try {
        localStorage.setItem(STORAGE_KEY_PLACES_CACHE, JSON.stringify(cache));
    } catch (error) {
        console.error('Error saving places cache:', error);
    }
}

// Extract Place ID from input (URL or direct Place ID)
function extractPlaceId(input) {
    if (!input) return null;

    // Check if input is already a Place ID (starts with ChIJ, typically 27+ chars)
    if (input.startsWith('ChIJ') && input.length >= 20) {
        return input;
    }

    // Only try to extract from URL if input looks like a URL
    if (!input.includes('http') && !input.includes('google.com/maps')) {
        return null;
    }

    // Look for Place ID in the !1s parameter or !8m2!3d
    // Valid Place IDs start with ChIJ or similar patterns
    const placeIdMatch = input.match(/!1s(ChIJ[A-Za-z0-9_-]+)(?:!|$|&)/);
    if (placeIdMatch) {
        return placeIdMatch[1];
    }

    // Try alternative pattern in newer Google Maps URLs
    const altMatch = input.match(/data=!4m[^!]*!3m[^!]*!1s(ChIJ[A-Za-z0-9_-]+)/);
    if (altMatch) {
        return altMatch[1];
    }

    return null;
}

// Fetch place details from Google Places API
async function fetchPlaceDetails(placeInput) {
    const cache = loadPlacesCache();

    // Return cached data if available
    if (cache[placeInput]) {
        return cache[placeInput];
    }

    try {
        const placeId = extractPlaceId(placeInput);
        let place;

        if (placeId) {
            // Use Place Details API with Place ID (cheaper - no search needed)
            const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
            const detailsResponse = await fetch(detailsUrl, {
                method: 'GET',
                headers: {
                    'X-Goog-Api-Key': PLACES_API_KEY,
                    'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,photos,currentOpeningHours'
                }
            });

            if (!detailsResponse.ok) {
                throw new Error('Failed to fetch place details');
            }

            place = await detailsResponse.json();
        } else {
            // Fall back to Text Search for plain text names
            const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
            const searchResponse = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': PLACES_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.reviews,places.photos,places.currentOpeningHours'
                },
                body: JSON.stringify({
                    textQuery: placeInput,
                    locationBias: {
                        circle: {
                            center: {
                                latitude: 52.5200,
                                longitude: 13.4050
                            },
                            radius: 10000.0
                        }
                    }
                })
            });

            if (!searchResponse.ok) {
                throw new Error('Failed to search for place');
            }

            const searchData = await searchResponse.json();

            if (!searchData.places || searchData.places.length === 0) {
                return null;
            }

            place = searchData.places[0];
        }

        // Check if place is currently closed
        const isClosed = place.currentOpeningHours &&
                        place.currentOpeningHours.openNow === false;

        // Get photo URL if available
        let photoUrl = null;
        if (place.photos && place.photos.length > 0) {
            const photoName = place.photos[0].name;
            photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${PLACES_API_KEY}`;
        }

        // Get a random review if available
        let review = null;
        if (place.reviews && place.reviews.length > 0) {
            const randomReview = place.reviews[Math.floor(Math.random() * place.reviews.length)];
            review = {
                text: randomReview.text?.text || randomReview.text,
                rating: randomReview.rating,
                authorName: randomReview.authorAttribution?.displayName
            };
        }

        const placeData = {
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            photoUrl,
            review,
            isClosed,
            cachedAt: Date.now()
        };

        // Cache the result
        cache[placeInput] = placeData;
        savePlacesCache(cache);

        return placeData;
    } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
    }
}

// Display suggestion with animation
async function showSuggestion() {
    if (places.length === 0) return;

    currentSuggestion = pickRandomPlace();
    suggestedToday.add(currentSuggestion.name);
    placeName.textContent = currentSuggestion.name;

    // Apply gradient background
    const gradient = getGradientForPlace(currentSuggestion.name);
    suggestionCard.style.background = `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;

    // Hide place details while loading
    const placePhoto = document.getElementById('place-photo');
    const placeRating = document.getElementById('place-rating');
    const placeReview = document.getElementById('place-review');
    const closedBadge = document.getElementById('closed-badge');

    placePhoto.classList.add('hidden');
    placeRating.classList.add('hidden');
    placeReview.classList.add('hidden');
    closedBadge.classList.add('hidden');

    // Show card with animation
    suggestionCard.classList.remove('hidden');
    suggestionCard.classList.add('bounce-in');

    // Remove animation class after animation completes
    setTimeout(() => {
        suggestionCard.classList.remove('bounce-in');
    }, 600);

    // Fetch place details from Google Places API
    // Use URL if available, otherwise fall back to name
    const searchInput = currentSuggestion.url || currentSuggestion.name;
    const placeDetails = await fetchPlaceDetails(searchInput);

    if (placeDetails) {
        // Show photo if available
        if (placeDetails.photoUrl) {
            placePhoto.style.backgroundImage = `url(${placeDetails.photoUrl})`;
            placePhoto.classList.remove('hidden');
        }

        // Show rating if available
        if (placeDetails.rating) {
            const stars = '⭐'.repeat(Math.round(placeDetails.rating));
            const ratingCount = placeDetails.userRatingCount ? ` (${placeDetails.userRatingCount})` : '';
            placeRating.innerHTML = `<span class="stars">${stars}</span> <span class="rating-number">${placeDetails.rating}${ratingCount}</span>`;
            placeRating.classList.remove('hidden');
        }

        // Show review if available
        if (placeDetails.review) {
            const reviewText = placeDetails.review.text.length > 150
                ? placeDetails.review.text.substring(0, 150) + '...'
                : placeDetails.review.text;
            placeReview.innerHTML = `<div class="review-text">"${reviewText}"</div><div class="review-author">— ${placeDetails.review.authorName}</div>`;
            placeReview.classList.remove('hidden');
        }

        // Show closed badge if place is closed
        if (placeDetails.isClosed) {
            closedBadge.classList.remove('hidden');
        }
    }
}

// Hide suggestion
function hideSuggestion() {
    suggestionCard.classList.add('hidden');
    pickPlaceBtn.classList.remove('hidden');
    currentSuggestion = null;
}

// Handle "Not Today" action
function handleNotToday() {
    // Add current suggestion to skipped list
    if (currentSuggestion) {
        skippedToday.add(currentSuggestion.name);
        saveSkippedPlaces();
    }

    // Add fade out animation
    suggestionCard.style.opacity = '0';
    suggestionCard.style.transform = 'scale(0.95)';

    // Show next suggestion after brief transition
    setTimeout(() => {
        suggestionCard.style.opacity = '1';
        suggestionCard.style.transform = 'scale(1)';
        showSuggestion();
    }, 300);
}

// Handle "Never Again" action
function handleNeverAgain() {
    if (currentSuggestion) {
        if (confirm(`Remove "${currentSuggestion.name}" from the list?\n\nThis will open the Google Sheet where you can delete it.`)) {
            window.open(SHEET_EDIT_URL, '_blank');
        }
        // Continue to next suggestion
        handleNotToday();
    }
}

// Event Listeners
function attachEventListeners() {
    // Not today / Never again
    notTodayBtn.addEventListener('click', handleNotToday);
    neverAgainBtn.addEventListener('click', handleNeverAgain);
}

// Start the app
init();
