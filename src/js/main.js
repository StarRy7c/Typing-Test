import { setupUIListeners, updateTheme, showTypingArea, showStatsAndChart, hideStatsAndChart, showResultScreen, hideResultScreen, populatePastResults, updateCountdownDisplay, animateResultScreenIn, animateResultScreenOut } from './ui.js';
import { loadWords, getWordsForDifficulty, resetTypingState, startTest, stopTest, handleKeyInput, getTypingStats, getWpmProgression, getAccuracyProgression } from './typingLogic.js';
import { initializeChart, updateChart, clearChart, initializePastResultsChart, updatePastResultsChart } from './chartHandler.js';
import { saveResult, getPastResults } from './localStorage.js';

// Global state
window.state = {
    difficulty: 'easy',
    duration: 60, // seconds
    words: [],
    typedChars: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    correctChars: 0,
    incorrectChars: 0,
    startTime: null,
    timerInterval: null,
    chartInterval: null,
    isRunning: false,
    wpmHistory: [],
    accuracyHistory: [],
    chart: null,
    pastResultsChart: null,
    countdownValue: 3,
    countdownInterval: null
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initial UI setup
    setupUIListeners();
    updateTheme(); // Apply saved theme or default
    await loadNewTest(); // Load initial words

    // Initialize charts (they will be hidden initially)
    state.chart = initializeChart(document.getElementById('liveChart').getContext('2d'));
    state.pastResultsChart = initializePastResultsChart(document.getElementById('pastResultsChart').getContext('2d'));
    populatePastResults(); // Load and display past results

    document.getElementById('text-input').addEventListener('keydown', handleInitialKeystroke);
    document.getElementById('restart-button').addEventListener('click', restartTest);
});

async function loadNewTest() {
    hideStatsAndChart();
    hideResultScreen();
    resetTypingState();
    await loadWords(state.difficulty); // Load words based on current difficulty
    showTypingArea(); // Ensure typing area is visible
}

async function handleInitialKeystroke(event) {
    // Start countdown on first valid keystroke (not a modifier key)
    if (state.isRunning || event.altKey || event.ctrlKey || event.metaKey || event.key === 'Shift') {
        return;
    }

    // Prevent input from being processed by the typing logic yet
    event.preventDefault();

    document.getElementById('text-input').removeEventListener('keydown', handleInitialKeystroke);
    document.getElementById('text-input').addEventListener('input', handleTypingInput);
    document.getElementById('text-input').addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            handleKeyInput(e); // Allow backspace during test
        }
    });


    startCountdown();
}

function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    countdownEl.classList.remove('opacity-0', 'pointer-events-none');
    countdownEl.classList.add('opacity-100');
    countdownEl.textContent = state.countdownValue;

    state.countdownInterval = setInterval(() => {
        state.countdownValue--;
        countdownEl.textContent = state.countdownValue;
        if (state.countdownValue <= 0) {
            clearInterval(state.countdownInterval);
            countdownEl.classList.add('opacity-0', 'pointer-events-none');
            countdownEl.classList.remove('opacity-100');
            startTestSession();
        }
    }, 1000);
}


function startTestSession() {
    state.isRunning = true;
    state.startTime = Date.now();
    document.getElementById('text-input').focus();
    showStatsAndChart(); // Show WPM, Accuracy, and Chart
    clearChart(state.chart); // Clear previous chart data

    // Start real-time stats updates
    state.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const timeLeft = state.duration - elapsed;

        if (timeLeft <= 0) {
            endTest();
        } else {
            document.getElementById('timer-display').textContent = `${timeLeft}s`;
            updateLiveStats();
        }
    }, 1000); // Update every second

    // Start chart updates every second
    state.chartInterval = setInterval(() => {
        updateChart(state.chart, state.wpmHistory, state.accuracyHistory);
    }, 1000);
}

function handleTypingInput(event) {
    if (!state.isRunning) return;
    handleKeyInput(event);
    updateLiveStats();
}

function updateLiveStats() {
    const { wpm, accuracy } = getTypingStats();
    document.getElementById('wpm-display').textContent = wpm;
    document.getElementById('accuracy-display').textContent = `${accuracy}%`;

    // Store history for chart
    state.wpmHistory.push(wpm);
    state.accuracyHistory.push(accuracy);
}

function endTest() {
    stopTest();
    clearInterval(state.timerInterval);
    clearInterval(state.chartInterval);
    state.isRunning = false;

    // Calculate final stats
    const { wpm, accuracy, totalKeystrokes, mistypedWordsCount } = getTypingStats(true); // true for final calculation

    // Display final stats on result screen
    document.getElementById('final-wpm').textContent = wpm;
    document.getElementById('final-accuracy').textContent = `${accuracy}%`;
    document.getElementById('final-keystrokes').textContent = totalKeystrokes;
    document.getElementById('final-mistakes').textContent = mistypedWordsCount; // Assuming this is calculated in getTypingStats

    saveResult({
        wpm: wpm,
        accuracy: accuracy,
        difficulty: state.difficulty,
        duration: state.duration,
        timestamp: Date.now()
    });

    populatePastResults(); // Update past results list
    updatePastResultsChart(state.pastResultsChart, getPastResults()); // Update past results chart

    showResultScreen();
    animateResultScreenIn(); // Trigger result screen animation
}

async function restartTest() {
    animateResultScreenOut(); // Trigger result screen hide animation
    await new Promise(resolve => setTimeout(resolve, 600)); // Wait for animation to finish
    hideResultScreen();
    state.countdownValue = 3; // Reset countdown
    document.getElementById('timer-display').textContent = `${state.duration}s`; // Reset timer display
    document.getElementById('text-input').removeEventListener('input', handleTypingInput);
    document.getElementById('text-input').addEventListener('keydown', handleInitialKeystroke);
    await loadNewTest();
}

// Expose functions for UI to interact with main state
window.setDifficulty = async (level) => {
    state.difficulty = level;
    document.getElementById('current-difficulty').textContent = level.charAt(0).toUpperCase() + level.slice(1);
    await loadNewTest();
};

window.setDuration = async (duration) => {
    state.duration = parseInt(duration);
    document.getElementById('current-time').textContent = `${duration}s`;
    document.getElementById('timer-display').textContent = `${duration}s`; // Update initial timer display
    await loadNewTest();
};
