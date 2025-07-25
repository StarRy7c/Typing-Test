// UI Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const difficultyToggle = document.getElementById('difficulty-toggle');
const difficultyMenu = document.getElementById('difficulty-menu');
const timeToggle = document.getElementById('time-toggle');
const timeMenu = document.getElementById('time-menu');
const typingArea = document.getElementById('typing-area');
const textInput = document.getElementById('text-input');
const statsDisplay = document.getElementById('stats-display');
const chartContainer = document.getElementById('chart-container');
const resultScreen = document.getElementById('result-screen');
const pastResultsList = document.getElementById('past-results-list');
const countdownDisplay = document.getElementById('countdown');

export function setupUIListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Difficulty menu toggle
    difficultyToggle.addEventListener('click', () => {
        difficultyMenu.classList.toggle('hidden');
    });
    difficultyMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const level = e.target.dataset.level;
            window.setDifficulty(level); // Call global state function
            difficultyMenu.classList.add('hidden');
            // Remove 'selected' from all, add to clicked
            difficultyMenu.querySelectorAll('a').forEach(link => link.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    // Time menu toggle
    timeToggle.addEventListener('click', () => {
        timeMenu.classList.toggle('hidden');
    });
    timeMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const duration = e.target.dataset.duration;
            window.setDuration(duration); // Call global state function
            timeMenu.classList.add('hidden');
            // Remove 'selected' from all, add to clicked
            timeMenu.querySelectorAll('a').forEach(link => link.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    // Close menus if clicked outside
    document.addEventListener('click', (e) => {
        if (!difficultyToggle.contains(e.target) && !difficultyMenu.contains(e.target)) {
            difficultyMenu.classList.add('hidden');
        }
        if (!timeToggle.contains(e.target) && !timeMenu.contains(e.target)) {
            timeMenu.classList.add('hidden');
        }
    });

    // Focus input when typing area is clicked
    typingArea.addEventListener('click', () => {
        textInput.focus();
    });
}

export function updateTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
}

function toggleTheme() {
    if (body.classList.contains('dark')) {
        body.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        body.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

export function displayWords(words) {
    typingArea.innerHTML = ''; // Clear previous words
    words.forEach((word, wordIndex) => {
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('word', 'inline-block', 'mr-2', 'mb-2', 'relative');
        word.split('').forEach((char, charIndex) => {
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.classList.add('char', 'transition-colors', 'duration-100');
            wordSpan.appendChild(charSpan);
        });
        typingArea.appendChild(wordSpan);
    });
    highlightCurrentChar(0, 0); // Highlight the first character
}

export function highlightCurrentChar(wordIndex, charIndex) {
    const allWords = typingArea.querySelectorAll('.word');
    if (wordIndex < allWords.length) {
        const currentWord = allWords[wordIndex];
        const allCharsInWord = currentWord.querySelectorAll('.char');

        // Remove highlight from previous current char
        document.querySelector('.char.current')?.classList.remove('current');

        if (charIndex < allCharsInWord.length) {
            allCharsInWord[charIndex].classList.add('current');
        } else if (wordIndex + 1 < allWords.length) { // Highlight first char of next word if current word is complete
             allWords[wordIndex + 1].querySelector('.char').classList.add('current');
        } else {
            // No more characters to highlight (end of test or last char typed)
        }
    }
}

export function updateCharColor(wordIndex, charIndex, isCorrect) {
    const allWords = typingArea.querySelectorAll('.word');
    if (wordIndex < allWords.length) {
        const currentWord = allWords[wordIndex];
        const charSpan = currentWord.querySelectorAll('.char')[charIndex];
        if (charSpan) {
            charSpan.classList.remove('correct', 'incorrect');
            if (isCorrect) {
                charSpan.classList.add('correct');
            } else {
                charSpan.classList.add('incorrect');
            }
        }
    }
}

export function markWordAsMistyped(wordIndex) {
    const allWords = typingArea.querySelectorAll('.word');
    if (wordIndex < allWords.length) {
        allWords[wordIndex].classList.add('bg-red-100', 'dark:bg-red-950', 'rounded-md', 'px-1');
    }
}

export function showTypingArea() {
    typingArea.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    typingArea.classList.add('opacity-100', 'scale-100');
    textInput.focus();
}

export function hideTypingArea() {
    typingArea.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    typingArea.classList.remove('opacity-100', 'scale-100');
}

export function showStatsAndChart() {
    statsDisplay.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    statsDisplay.classList.add('opacity-100', 'scale-100');
    chartContainer.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    chartContainer.classList.add('opacity-100', 'scale-100');
}

export function hideStatsAndChart() {
    statsDisplay.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    statsDisplay.classList.remove('opacity-100', 'scale-100');
    chartContainer.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    chartContainer.classList.remove('opacity-100', 'scale-100');
}

export function showResultScreen() {
    resultScreen.classList.remove('opacity-0', 'pointer-events-none');
    resultScreen.classList.add('opacity-100');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling behind overlay
}

export function hideResultScreen() {
    resultScreen.classList.add('opacity-0', 'pointer-events-none');
    resultScreen.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');
}

export function animateResultScreenIn() {
    const resultContent = resultScreen.querySelector('div > div'); // Targeting the inner div that contains stats
    resultContent.classList.remove('scale-90', 'opacity-0');
    resultContent.classList.add('scale-100', 'opacity-100');
}

export function animateResultScreenOut() {
    const resultContent = resultScreen.querySelector('div > div');
    resultContent.classList.add('scale-90', 'opacity-0');
    resultContent.classList.remove('scale-100', 'opacity-100');
}


export function populatePastResults() {
    const pastResults = window.getPastResults();
    pastResultsList.innerHTML = ''; // Clear previous list

    if (pastResults.length === 0) {
        pastResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">No past results yet. Start typing!</p>';
        return;
    }

    // Sort by timestamp descending (most recent first)
    pastResults.sort((a, b) => b.timestamp - a.timestamp);

    pastResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('bg-gray-100', 'dark:bg-gray-800', 'p-3', 'rounded-md', 'mb-2', 'flex', 'justify-between', 'items-center', 'text-sm', 'border', 'border-gray-200', 'dark:border-gray-600', 'transition-all', 'duration-300', 'ease-in-out');
        resultItem.innerHTML = `
            <span class="font-semibold text-indigo-700 dark:text-indigo-300">WPM: ${result.wpm}</span>
            <span class="text-green-600 dark:text-green-400">Acc: ${result.accuracy}%</span>
            <span class="text-gray-500 dark:text-gray-400">${result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}</span>
            <span class="text-gray-500 dark:text-gray-400">${result.duration}s</span>
            <span class="text-gray-500 dark:text-gray-400">${dayjs(result.timestamp).format('MMM D, YY h:mm A')}</span>
        `;
        pastResultsList.appendChild(resultItem);
    });
}

export function updateCountdownDisplay(value) {
    countdownDisplay.textContent = value;
    countdownDisplay.classList.remove('opacity-0', 'pointer-events-none');
    countdownDisplay.classList.add('opacity-100');
}

export function hideCountdownDisplay() {
    countdownDisplay.classList.add('opacity-0', 'pointer-events-none');
    countdownDisplay.classList.remove('opacity-100');
}
