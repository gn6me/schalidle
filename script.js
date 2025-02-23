let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
const guessesDiv = document.getElementById('guesses');
const resultDiv = document.getElementById('result');

function generateEmojiResults(guesses, targetCharacter) {
    const correctEmoji = '🟩'; // Green square for correct
    const incorrectEmoji = '⬜'; // White square for incorrect

    let emojiResults = '';

    guesses.forEach(guess => {
        const attributes = [
            guess.name,
            guess.school,
            guess.combatClass,
            guess.role,
            guess.damageType,
            guess.armorType,
            guess.skill
        ];

        const targetAttributes = [
            targetCharacter.name,
            targetCharacter.school,
            targetCharacter.combatClass,
            targetCharacter.role,
            targetCharacter.damageType,
            targetCharacter.armorType,
            targetCharacter.skill
        ];

        let emojiRow = '';
        attributes.forEach((attr, index) => {
            if (attr === targetAttributes[index]) {
                emojiRow += correctEmoji;
            } else {
                emojiRow += incorrectEmoji;
            }
        });

        emojiResults += emojiRow + '\n';
    });

    return emojiResults;
}

// Function to copy emoji results to clipboard
function copyEmojiResultsToClipboard(emojiResults) {
    navigator.clipboard.writeText(emojiResults).then(() => {
        console.log("Results copied to clipboard as emojis!");
    }).catch(() => {
        alert("Failed to copy results. Please copy them manually.");
    });
}
// Get daily character
function getDailyCharacter() {
    const charactersArray = Object.values(characters);
    const seed = 12345; // fixed value for consistency
    const now = new Date();

    // Convert time to EST
    const offset = -5;
    const easternTime = new Date(now.getTime() + offset * 60 * 60 * 1000);

    const dayStart = new Date(easternTime);
    dayStart.setHours(19, 0, 0, 0);
    if(easternTime < dayStart) {
        dayStart.setDate(dayStart.getDate() - 1);
    }

    const daySeed = dayStart.getFullYear() * 1000 + (dayStart.getMonth() + 1) * 100 + dayStart.getDate();
    const dailyIndex = (seed + daySeed) % charactersArray.length;

    return charactersArray[dailyIndex];
}

function getPreviousDayCharacter() {
    const charactersArray = Object.values(characters);
    const seed = 12345; // Fixed seed for consistency
    const now = new Date();

    const offset = -5; // Eastern Time is UTC-5
    const easternTime = new Date(now.getTime() + offset * 60 * 60 * 1000);

    const previousDayStart = new Date(easternTime);
    previousDayStart.setHours(19, 0, 0, 0); // 7 PM Eastern Time
    previousDayStart.setDate(previousDayStart.getDate() - 1); // Previous day

    const previousDaySeed = previousDayStart.getFullYear() * 10000 + (previousDayStart.getMonth() + 1) * 100 + previousDayStart.getDate();
    const previousDayIndex = (seed + previousDaySeed) % charactersArray.length;
    return charactersArray[previousDayIndex];
}

function updateCountdown() {
    const now = new Date();
    const offset = -5; // Eastern Time is UTC-5
    const easternTime = new Date(now.getTime() + offset * 60 * 60 * 1000);

    // Calculate the next 7 PM Eastern Time
    const nextSelectionTime = new Date(easternTime);
    nextSelectionTime.setHours(19, 0, 0, 0); // 7 PM Eastern Time
    if (easternTime >= nextSelectionTime) {
        nextSelectionTime.setDate(nextSelectionTime.getDate() + 1); // Next day
    }

    // Calculate the time difference
    const timeDiff = nextSelectionTime - easternTime;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    countdownElement.textContent = `Next character in: ${hours}h ${minutes}m ${seconds}s`;
}

function displayPreviousDayCharacter() {
    const previousDayCharacter = getPreviousDayCharacter();
    const previousDayElement = document.getElementById('previous-day-character');
    previousDayElement.innerHTML = `
        <p>Yesterday's Character Was:</p>
        <img src="${previousDayCharacter.img}" alt="${previousDayCharacter.name}" width="100">
    `;
}

// Fetch characters from JSON file
fetch('student-list.json')
    .then(response => response.json())
    .then(data => {
        characters = data;
        targetCharacter = getDailyCharacter();
        console.log("Target Character:", targetCharacter); // debug

        displayPreviousDayCharacter();

        setInterval(updateCountdown, 1000);
        updateCountdown();

    });
// Live search functionality
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');

function showAllSuggestions() {
    suggestionsDiv.innerHTML = '';
    Object.keys(characters).forEach(name => {
        const suggestion = document.createElement('div');
        suggestion.innerHTML = `
            <img class="searchImg" src="${characters[name].img}" alt="${name}">
            <span>${name}</span>
        `;
        suggestion.addEventListener('click', () => {
            searchInput.value = name;
            suggestionsDiv.style.display = 'none';
        });
        suggestionsDiv.appendChild(suggestion);
    });
    suggestionsDiv.style.display = 'block';
}
// Function to filter suggestions based on user input
function filterSuggestions(query) {
    suggestionsDiv.innerHTML = '';
    if (query) {
        const filteredCharacters = Object.keys(characters).filter(name =>
            name.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredCharacters.length > 0) {
            filteredCharacters.forEach(name => {
                const suggestion = document.createElement('div');
                suggestion.innerHTML = `
                    <img class="searchImg" src="${characters[name].img}" alt="${name}">
                    <span>${name}</span>
                `;
                suggestion.addEventListener('click', () => {
                    searchInput.value = name;
                    suggestionsDiv.style.display = 'none';
                });
                suggestionsDiv.appendChild(suggestion);
            });
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    } else {
        showAllSuggestions();
    }
}

// Event listener for search input focus
searchInput.addEventListener('focus', () => {
    showAllSuggestions();
});

// Event listener for search input typing
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    filterSuggestions(query);
});

// Event listener to hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.style.display = 'none';
    }
});

// Live search functionality
//const searchInput = document.getElementById('searchInput');
//const suggestionsDiv = document.getElementById('suggestions');
//
//searchInput.addEventListener('input', function () {
//    const query = searchInput.value.toLowerCase();
//    suggestionsDiv.innerHTML = '';
//
//    if (query) {
//        const filteredCharacters = Object.keys(characters).filter(name =>
//            name.toLowerCase().includes(query)
//        );
//
//        if (filteredCharacters.length > 0) {
//            filteredCharacters.forEach(name => {
//                const suggestion = document.createElement('div');
//                    suggestion.innerHTML = `
//                    <img class="searchimg" src="${characters[name].img}" alt="${name}">
//                    <span>${name}</span>
//                `;
//                suggestion.addEventListener('click', () => {
//                    searchInput.value = name;
//                    suggestionsDiv.style.display = 'none';
//                });
//                suggestionsDiv.appendChild(suggestion);
//            });
//            suggestionsDiv.style.display = 'block';
//        } else {
//            suggestionsDiv.style.display = 'none';
//        }
//    } else {
//        suggestionsDiv.style.display = 'none';
//    }
//});

let guessHistory = [];

// Make a guess
function makeGuess() {
    if (guessesRemaining === 0) {
        resultDiv.textContent = "No guesses remaining! The character was " + targetCharacter.name + ".";
        const emojiResults = generateEmojiResults(guessHistory, targetCharacter);
        resultDiv.innerHTML += `<pre>${emojiResults}</pre>`;
        resultDiv.innerHTML += `<button onclick="copyEmojiResultsToClipboard('${emojiResults.replace(/\n/g, '\\n')}')"><i class="fa-solid fa-copy"></i></button>`;
        return;
    }

    const guessInput = searchInput.value.trim();
    if (!guessInput) {
        resultDiv.textContent = "Please enter a character name.";
        return;
    }

    const guessedCharacter = characters[guessInput];
    if (!guessedCharacter) {
        resultDiv.textContent = "Character not found.";
        return;
    }

    guessesRemaining--;
    guessHistory.push(guessedCharacter);
    displayGuess(guessedCharacter);

    if (guessedCharacter.name === targetCharacter.name) {
        resultDiv.textContent = "Correct! You guessed the character!";
        const emojiResults = generateEmojiResults(guessHistory, targetCharacter);
        resultDiv.innerHTML += `<pre>${emojiResults}</pre>`;
        resultDiv.innerHTML += `<button onclick="copyEmojiResultsToClipboard('${emojiResults.replace(/\n/g, '\\n')}')"><i class="fa-solid fa-copy"></i></button>`;
        guessesRemaining = 0; // End the game
    } else if (guessesRemaining === 0) {
        resultDiv.textContent = "No guesses remaining! The character was " + targetCharacter.name + ".";
        const emojiResults = generateEmojiResults(guessHistory, targetCharacter);
        resultDiv.innerHTML += `<pre>${emojiResults}</pre>`;
        resultDiv.innerHTML += `<button onclick="copyEmojiResultsToClipboard('${emojiResults.replace(/\n/g, '\\n')}')"><i class="fa-solid fa-copy"></i></button>`;
    }
}

// Display a guess in the grid
function displayGuess(character) {
    const guessRow = document.createElement('div');
    guessRow.className = 'guess-row';

    const attributes = [
        character.name,
        character.img,
        character.school,
        character.combatClass,
        character.role,
        character.damageType,
        character.armorType,
        character.skill
    ];
    sID = 1;
    attributes.forEach((attr, index) => {
        const square = document.createElement('div');
        square.className = 'guess-square ' + 'sq' + String(sID);
        if (typeof attr === 'string' && attr.startsWith('http')) {
            // Display image
            const img = document.createElement('img');
            img.src = attr;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            square.appendChild(img);
        } else if (attr === character.damageType || attr === character.armorType || attr === character.role) {
            const dmgImg = document.createElement('img');
            dmgImg.src ='https://schalidle.vercel.app/imgs/info/' + attr + '.webp';
            dmgImg.className = 'dmgIcon';
            square.appendChild(dmgImg);
        } else if (attr === character.school) {
            const schoolImg = document.createElement('img');
            schoolImg.src = 'https://schalidle.vercel.app/imgs/schools/' + attr + '_Icon.webp';
            schoolImg.className = 'schoolImg';
            square.appendChild(schoolImg);
        } else if (attr === character.combatClass) {
            const roleImg = document.createElement('img');
            roleImg.src ='https://schalidle.vercel.app/imgs/info/' + attr + '_role.webp';
            roleImg.className = 'roleImg';
            square.appendChild(roleImg);
        } else {
            // Display text
            square.textContent = attr;
        }

        // Check if the attribute matches the target character
        const targetAttr = Object.values(targetCharacter)[index];
        if (attr === targetAttr) {
            square.classList.add('correct');
        }
        if (attr === character.name) {

        } else {
            guessRow.appendChild(square);
        }
        sID++;
    });

    guessesDiv.appendChild(guessRow);
}
