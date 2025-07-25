import Chart from 'chart.js/auto'; // Import Chart.js
import 'chartjs-adapter-date-fns'; // Import the date adapter

export function initializeChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time labels will go here
            datasets: [
                {
                    label: 'WPM',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'Accuracy',
                    data: [],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 500 // Smooth animation for updates
            },
            scales: {
                x: {
                    type: 'linear', // Use linear scale for time in seconds
                    title: {
                        display: true,
                        text: 'Time (seconds)',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-primary')
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'WPM',
                        color: 'rgb(75, 192, 192)'
                    },
                     ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false, // Only draw grid lines for the first axis
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    },
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        color: 'rgb(255, 99, 132)'
                    },
                     ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-primary')
                    }
                }
            }
        }
    });
}

export function updateChart(chart, wpmHistory, accuracyHistory) {
    if (!chart) return;

    const timeLabels = Array.from({ length: wpmHistory.length }, (_, i) => i + 1);

    chart.data.labels = timeLabels;
    chart.data.datasets[0].data = wpmHistory;
    chart.data.datasets[1].data = accuracyHistory;

    chart.update();
}

export function clearChart(chart) {
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[1].data = [];
        chart.update();
    }
}

export function initializePastResultsChart(ctx) {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Timestamps
            datasets: [
                {
                    label: 'WPM',
                    data: [],
                    borderColor: 'rgb(100, 100, 255)',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'wpmAxis'
                },
                 {
                    label: 'Accuracy',
                    data: [],
                    borderColor: 'rgb(255, 150, 0)',
                    tension: 0.3,
                    fill: false,
                    yAxisID: 'accAxis'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MMM D, YYYY h:mm A',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-primary')
                    },
                     ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                wpmAxis: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'WPM',
                        color: 'rgb(100, 100, 255)'
                    },
                     ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                accAxis: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)',
                        color: 'rgb(255, 150, 0)'
                    },
                    grid: {
                        drawOnChartArea: false, // Only draw grid lines for the first axis
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    },
                     ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-primary')
                    }
                }
            }
        }
    });
}

export function updatePastResultsChart(chart, results) {
    if (!chart) return;

    // Sort results by timestamp for chronological display
    results.sort((a, b) => a.timestamp - b.timestamp);

    const labels = results.map(r => r.timestamp);
    const wpmData = results.map(r => r.wpm);
    const accuracyData = results.map(r => r.accuracy);

    chart.data.labels = labels;
    chart.data.datasets[0].data = wpmData;
    chart.data.datasets[1].data = accuracyData;

    chart.update();
}

// Helper to get CSS variables for chart colors
function getComputedStyle(element) {
    const style = window.getComputedStyle(element);
    return {
        getPropertyValue: (prop) => {
            if (prop === '--text-color-primary') {
                return style.getPropertyValue('--tw-text-gray-900').trim() || (element.classList.contains('dark') ? 'rgb(243 244 246)' : 'rgb(17 24 39)'); // Tailwind default text-gray-900 / dark:text-gray-100
            }
            if (prop === '--text-color-secondary') {
                return style.getPropertyValue('--tw-text-gray-600').trim() || (element.classList.contains('dark') ? 'rgb(156 163 175)' : 'rgb(75 85 99)'); // Tailwind default text-gray-600 / dark:text-gray-300
            }
            if (prop === '--border-color') {
                return style.getPropertyValue('--tw-border-gray-200').trim() || (element.classList.contains('dark') ? 'rgb(75 85 99)' : 'rgb(229 231 235)'); // Tailwind default border-gray-200 / dark:border-gray-600
            }
            return style.getPropertyValue(prop);
        }
    };
}
