// Storage key
const STORAGE_KEY = 'lunchPlaces';

// State
let places = [];
let currentSuggestion = null;
let suggestedToday = new Set();

// DOM Elements
const pickerView = document.getElementById('picker-view');
const addView = document.getElementById('add-view');
const listView = document.getElementById('list-view');
const suggestionCard = document.getElementById('suggestion-card');
const emptyState = document.getElementById('empty-state');
const placeName = document.getElementById('place-name');
const pickPlaceBtn = document.getElementById('pick-place-btn');
const notTodayBtn = document.getElementById('not-today-btn');
const neverAgainBtn = document.getElementById('never-again-btn');
const addPlaceForm = document.getElementById('add-place-form');
const placeInput = document.getElementById('place-input');
const navAddBtn = document.getElementById('nav-add-btn');
const navListBtn = document.getElementById('nav-list-btn');
const cancelAddBtn = document.getElementById('cancel-add-btn');
const closeListBtn = document.getElementById('close-list-btn');
const placesList = document.getElementById('places-list');

// Initialize app
function init() {
    loadPlaces();
    updateUI();
    attachEventListeners();
}

// Load places from localStorage
function loadPlaces() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        places = JSON.parse(stored);
    }
}

// Save places to localStorage
function savePlaces() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

// Update UI based on state
function updateUI() {
    if (places.length === 0) {
        emptyState.classList.remove('hidden');
        pickPlaceBtn.classList.add('hidden');
        suggestionCard.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        pickPlaceBtn.classList.remove('hidden');
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

// Display suggestion
function showSuggestion() {
    if (places.length === 0) return;

    currentSuggestion = pickRandomPlace();
    suggestedToday.add(currentSuggestion);
    placeName.textContent = currentSuggestion;
    suggestionCard.classList.remove('hidden');
    pickPlaceBtn.classList.add('hidden');
}

// Hide suggestion
function hideSuggestion() {
    suggestionCard.classList.add('hidden');
    pickPlaceBtn.classList.remove('hidden');
    currentSuggestion = null;
}

// Handle "Not Today" action
function handleNotToday() {
    hideSuggestion();
}

// Handle "Never Again" action
function handleNeverAgain() {
    if (currentSuggestion && confirm(`Remove "${currentSuggestion}" permanently?`)) {
        places = places.filter(place => place !== currentSuggestion);
        suggestedToday.delete(currentSuggestion);
        savePlaces();
        hideSuggestion();
        updateUI();
    }
}

// Add a new place
function addPlace(placeName) {
    const trimmedName = placeName.trim();
    if (trimmedName && !places.includes(trimmedName)) {
        places.push(trimmedName);
        savePlaces();
        updateUI();
        return true;
    }
    return false;
}

// Remove a place from the list
function removePlace(placeName) {
    if (confirm(`Remove "${placeName}" from your list?`)) {
        places = places.filter(place => place !== placeName);
        suggestedToday.delete(placeName);
        savePlaces();
        renderPlacesList();
        updateUI();
    }
}

// Render places list
function renderPlacesList() {
    if (places.length === 0) {
        placesList.innerHTML = '<p class="empty-list">No places added yet.</p>';
        return;
    }

    const listHTML = places.map(place => `
        <div class="place-item">
            <span>${place}</span>
            <button class="btn-remove" data-place="${place}">×</button>
        </div>
    `).join('');

    placesList.innerHTML = listHTML;

    // Attach remove handlers
    placesList.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const placeName = e.target.getAttribute('data-place');
            removePlace(placeName);
        });
    });
}

// Event Listeners
function attachEventListeners() {
    // Pick place
    pickPlaceBtn.addEventListener('click', showSuggestion);

    // Not today / Never again
    notTodayBtn.addEventListener('click', handleNotToday);
    neverAgainBtn.addEventListener('click', handleNeverAgain);

    // Navigation
    navAddBtn.addEventListener('click', () => {
        showView(addView);
        placeInput.focus();
    });

    navListBtn.addEventListener('click', () => {
        renderPlacesList();
        showView(listView);
    });

    // Add place form
    addPlaceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (addPlace(placeInput.value)) {
            placeInput.value = '';
            showView(pickerView);
        } else {
            alert('Please enter a valid place name or avoid duplicates.');
        }
    });

    cancelAddBtn.addEventListener('click', () => {
        placeInput.value = '';
        showView(pickerView);
    });

    closeListBtn.addEventListener('click', () => {
        showView(pickerView);
    });
}

// Start the app
init();
