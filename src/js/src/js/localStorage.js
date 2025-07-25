const STORAGE_KEY = 'typingTestResults';

export function saveResult(result) {
    const results = getPastResults();
    results.push(result);
    // Keep only the last 10-20 results to prevent excessive storage
    if (results.length > 20) {
        results.shift(); // Remove the oldest result
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

export function getPastResults() {
    const results = localStorage.getItem(STORAGE_KEY);
    return results ? JSON.parse(results) : [];
}
