// Google Sheets CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSuDfel6sZhxVaHJUCk5PEsp5c9pYTg3wo2-E7R6E2720CJD7WMJYTfDqpRruEZ4m2QSszaoOW2inqJ/pub?gid=0&single=true&output=csv';

// Gradient color schemes
const GRADIENTS = [
    ['#FF6B6B', '#FFE66D'],  // Red to Yellow
    ['#4ECDC4', '#44A08D'],  // Teal to Green
    ['#F093FB', '#F5576C'],  // Pink to Red
    ['#4facfe', '#00f2fe'],  // Blue to Cyan
    ['#43e97b', '#38f9d7'],  // Green to Turquoise
    ['#fa709a', '#fee140'],  // Pink to Yellow
    ['#30cfd0', '#330867'],  // Cyan to Purple
    ['#a8edea', '#fed6e3'],  // Mint to Pink
    ['#ff9a56', '#ff6a88'],  // Orange to Pink
    ['#ffecd2', '#fcb69f'],  // Cream to Peach
];

// State
let places = [];
let currentSuggestion = null;
let suggestedToday = new Set();
let isLoading = false;

// DOM Elements
const pickerView = document.getElementById('picker-view');
const listView = document.getElementById('list-view');
const suggestionCard = document.getElementById('suggestion-card');
const emptyState = document.getElementById('empty-state');
const placeName = document.getElementById('place-name');
const pickPlaceBtn = document.getElementById('pick-place-btn');
const notTodayBtn = document.getElementById('not-today-btn');
const neverAgainBtn = document.getElementById('never-again-btn');
const navListBtn = document.getElementById('nav-list-btn');
const closeListBtn = document.getElementById('close-list-btn');
const placesList = document.getElementById('places-list');

// Initialize app
async function init() {
    attachEventListeners();
    await loadPlacesFromSheet();
    updateUI();

    // Show initial suggestion if places are available
    if (places.length > 0) {
        showSuggestion();
    }
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

        // Parse CSV and filter out empty rows and header if present
        places = rows
            .map(row => row.trim())
            .filter(row => row.length > 0)
            .filter((row, index) => {
                // Skip first row if it looks like a header
                if (index === 0 && (row.toLowerCase().includes('place') || row.toLowerCase().includes('name'))) {
                    return false;
                }
                return true;
            });

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

// Show a view
function showView(view) {
    pickerView.classList.add('hidden');
    addView.classList.add('hidden');
    listView.classList.add('hidden');
    view.classList.remove('hidden');
}

// Pick a random place
function pickRandomPlace() {
    // Filter out places already suggested today
    const availablePlaces = places.filter(place => !suggestedToday.has(place));

    if (availablePlaces.length === 0) {
        // All places have been suggested, reset
        suggestedToday.clear();
        return pickRandomPlace();
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

// Display suggestion with animation
function showSuggestion() {
    if (places.length === 0) return;

    currentSuggestion = pickRandomPlace();
    suggestedToday.add(currentSuggestion);
    placeName.textContent = currentSuggestion;

    // Apply gradient background
    const gradient = getGradientForPlace(currentSuggestion);
    suggestionCard.style.background = `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;

    // Show card with animation
    suggestionCard.classList.remove('hidden');
    suggestionCard.classList.add('bounce-in');

    // Remove animation class after animation completes
    setTimeout(() => {
        suggestionCard.classList.remove('bounce-in');
    }, 600);
}

// Hide suggestion
function hideSuggestion() {
    suggestionCard.classList.add('hidden');
    pickPlaceBtn.classList.remove('hidden');
    currentSuggestion = null;
}

// Handle "Not Today" action
function handleNotToday() {
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
        alert(`To remove "${currentSuggestion}" permanently, please delete it from the Google Sheet.`);
        hideSuggestion();
    }
}

// Render places list
function renderPlacesList() {
    if (places.length === 0) {
        placesList.innerHTML = '<p class="empty-list">No places found.</p>';
        return;
    }

    const listHTML = places.map(place => `
        <div class="place-item">
            <span>${place}</span>
        </div>
    `).join('');

    placesList.innerHTML = listHTML;
    placesList.innerHTML += '<p class="list-note">Edit the Google Sheet to add or remove places.</p>';
}

// Event Listeners
function attachEventListeners() {
    // Not today / Never again
    notTodayBtn.addEventListener('click', handleNotToday);
    neverAgainBtn.addEventListener('click', handleNeverAgain);

    // Navigation
    navListBtn.addEventListener('click', () => {
        renderPlacesList();
        showView(listView);
    });

    closeListBtn.addEventListener('click', () => {
        showView(pickerView);
    });
}

// Start the app
init();
