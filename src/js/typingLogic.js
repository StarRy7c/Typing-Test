import { displayWords, highlightCurrentChar, updateCharColor, markWordAsMistyped } from './ui.js';

let allWords = [];
let currentTypedWord = '';
let currentMistypedWords = new Set(); // Stores indices of words with errors
let totalKeystrokes = 0;

export async function loadWords(difficulty) {
    let filePath = `./words/${difficulty}.json`;
    if (difficulty === 'hard') {
        filePath = `./words/hard.json`; // Ensure hard includes punctuation
    }

    try {
        const response = await fetch(filePath);
        const data = await response.json();
        const wordList = data.words;

        // Shuffle and select words based on difficulty and mode (paragraph vs single word - currently paragraph)
        const shuffledWords = wordList.sort(() => 0.5 - Math.random());
        allWords = shuffledWords.slice(0, 100); // Limit to 100 words for the test

        displayWords(allWords);
    } catch (error) {
        console.error('Error loading words:', error);
        allWords = ["error", "loading", "words", "please", "check", "console"];
        displayWords(allWords);
    }
}

export function resetTypingState() {
    window.state.currentWordIndex = 0;
    window.state.currentCharIndex = 0;
    window.state.correctChars = 0;
    window.state.incorrectChars = 0;
    window.state.startTime = null;
    window.state.isRunning = false;
    window.state.wpmHistory = [];
    window.state.accuracyHistory = [];
    currentTypedWord = '';
    currentMistypedWords = new Set();
    totalKeystrokes = 0;

    document.getElementById('text-input').value = '';
    document.getElementById('text-input').focus();
    // Clear all previous highlight/colorings
    document.querySelectorAll('.char').forEach(charSpan => {
        charSpan.classList.remove('correct', 'incorrect', 'current');
    });
    document.querySelectorAll('.word').forEach(wordSpan => {
        wordSpan.classList.remove('bg-red-100', 'dark:bg-red-950', 'rounded-md', 'px-1');
    });

    highlightCurrentChar(0, 0); // Highlight the first char of the first word
}

export function startTest() {
    window.state.isRunning = true;
    window.state.startTime = Date.now();
    document.getElementById('text-input').value = '';
    document.getElementById('text-input').focus();
}

export function stopTest() {
    window.state.isRunning = false;
    document.getElementById('text-input').blur(); // Remove focus from input
}

export function handleKeyInput(event) {
    if (!window.state.isRunning) return;

    const key = event.key;
    const currentWord = allWords[window.state.currentWordIndex];

    // Handle Spacebar
    if (key === ' ' || key === 'Spacebar') {
        event.preventDefault(); // Prevent spacebar from typing a space

        // Only move to next word if something has been typed for the current word
        if (currentTypedWord.length > 0) {
            // Check if the word typed matches the actual word (up to typed length)
            const isWordCorrect = currentTypedWord === currentWord;
            if (!isWordCorrect) {
                currentMistypedWords.add(window.state.currentWordIndex);
                markWordAsMistyped(window.state.currentWordIndex);
            }

            // Reset for next word
            window.state.currentWordIndex++;
            window.state.currentCharIndex = 0;
            currentTypedWord = '';

            // If all words are typed, end the test
            if (window.state.currentWordIndex >= allWords.length) {
                // Ensure a delay to allow final UI updates
                setTimeout(() => {
                    if (window.state.isRunning) window.endTest();
                }, 50); // Small delay to prevent immediate re-render issues
                return;
            }
            highlightCurrentChar(window.state.currentWordIndex, window.state.currentCharIndex);
        }
        return;
    }

    // Handle Backspace
    if (key === 'Backspace') {
        event.preventDefault(); // Prevent default backspace behavior in input field
        if (currentTypedWord.length > 0) {
            currentTypedWord = currentTypedWord.slice(0, -1);
            window.state.currentCharIndex--;

            // Reset char color if it was marked incorrect
            updateCharColor(window.state.currentWordIndex, window.state.currentCharIndex, null); // Set to null to remove color
            highlightCurrentChar(window.state.currentWordIndex, window.state.currentCharIndex);

            // Re-evaluate if word is now correct (e.g., if a mistake was corrected)
            if (currentMistypedWords.has(window.state.currentWordIndex) && currentWord.startsWith(currentTypedWord)) {
                // Heuristic: If current typed matches current word up to this point, consider potential fix.
                // More robust would be to re-check all chars in the word. For now, simply remove the "mistyped" flag
                // if they backspace past the point of error.
                // For full correctness, we'd need to re-scan. For simplicity, remove the red background on the word.
                 const wordSpan = document.querySelectorAll('.word')[window.state.currentWordIndex];
                 wordSpan.classList.remove('bg-red-100', 'dark:bg-red-950', 'rounded-md', 'px-1');
                 currentMistypedWords.delete(window.state.currentWordIndex);
            }


        } else if (window.state.currentWordIndex > 0) {
            // If at the beginning of a word and backspace, go to the previous word
            window.state.currentWordIndex--;
            const prevWord = allWords[window.state.currentWordIndex];
            window.state.currentCharIndex = prevWord.length;
            currentTypedWord = prevWord; // Reset typed word to previous word for editing
            highlightCurrentChar(window.state.currentWordIndex, window.state.currentCharIndex);

            // Clear styling on characters of the previous word to allow re-typing feedback
            const prevWordChars = document.querySelectorAll('.word')[window.state.currentWordIndex].querySelectorAll('.char');
            prevWordChars.forEach(charSpan => charSpan.classList.remove('correct', 'incorrect'));
        }
        document.getElementById('text-input').value = currentTypedWord; // Update input field
        return;
    }

    // Handle actual character input
    if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        totalKeystrokes++;
        const expectedChar = currentWord[window.state.currentCharIndex];

        if (expectedChar === key) {
            window.state.correctChars++;
            updateCharColor(window.state.currentWordIndex, window.state.currentCharIndex, true);
        } else {
            window.state.incorrectChars++;
            updateCharColor(window.state.currentWordIndex, window.state.currentCharIndex, false);
            currentMistypedWords.add(window.state.currentWordIndex);
            markWordAsMistyped(window.state.currentWordIndex); // Mark the word background red
        }

        currentTypedWord += key;
        window.state.currentCharIndex++;

        // If current word is fully typed, mark for spacebar check
        if (window.state.currentCharIndex === currentWord.length) {
            // Automatically move to next word if word is complete and no space is needed (e.g., last word or single word mode)
            if (window.state.currentWordIndex === allWords.length - 1) {
                // End of the last word, automatically finish
                 if (window.state.isRunning) window.endTest();
                 return;
            }
             // Prepare for next word - highlight first char of next word implicitly
            highlightCurrentChar(window.state.currentWordIndex + 1, 0);
        } else {
            highlightCurrentChar(window.state.currentWordIndex, window.state.currentCharIndex);
        }
    }

    // Update the actual input field value to reflect currentTypedWord (important for backspace)
    document.getElementById('text-input').value = currentTypedWord;
}

export function getTypingStats(final = false) {
    const elapsedSeconds = final ? window.state.duration : Math.floor((Date.now() - window.state.startTime) / 1000);

    let wpm = 0;
    let accuracy = 0;

    if (elapsedSeconds > 0) {
        // WPM calculation: (Correct Chars / 5) / (Time in minutes)
        // A "word" is often considered 5 characters for WPM calculation
        wpm = Math.round((window.state.correctChars / 5) / (elapsedSeconds / 60));

        // Accuracy calculation: (Correct Chars / Total Keystrokes) * 100
        // Or (Correct Chars / (Correct Chars + Incorrect Chars)) * 100
        const totalTypedChars = window.state.correctChars + window.state.incorrectChars;
        if (totalTypedChars > 0) {
            accuracy = Math.round((window.state.correctChars / totalTypedChars) * 100);
        }
    }

    return {
        wpm: wpm,
        accuracy: accuracy,
        totalKeystrokes: totalKeystrokes,
        mistypedWordsCount: currentMistypedWords.size
    };
}
