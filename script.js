let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
const guessesDiv = document.getElementById('guesses');
const resultDiv = document.getElementById('result');

// Get daily character
function getDailyCharacter() {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('dailyCharacterDate');
    const storedCharacter = localStorage.getItem('dailyCharacter');

    if (storedDate === today && storedCharacter) {
        return JSON.parse(storedCharacter);
    } else {
        const characterNames = Object.keys(characters);
        const randomCharacter = characters[characterNames[Math.floor(Math.random() * characterNames.length)]];
        localStorage.setItem('dailyCharacterDate', today);
        localStorage.setItem('dailyCharacter', JSON.stringify(randomCharacter));

        return randomCharacter;
    }
}

// Fetch characters from JSON file
fetch('student-list.json')
    .then(response => response.json())
    .then(data => {
        characters = data;
        targetCharacter = getDailyCharacter();
        console.log("Target Character:", targetCharacter); // debug
    });

// Live search functionality
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');

searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    suggestionsDiv.innerHTML = '';

    if (query) {
        const filteredCharacters = Object.keys(characters).filter(name =>
            name.toLowerCase().includes(query)
        );

        if (filteredCharacters.length > 0) {
            filteredCharacters.forEach(name => {
                const suggestion = document.createElement('div');
                suggestions.innerHTML = `
                    <!--<img src="${characters[name].img}" alt="${name}">-->
                    <span>${characters[name].img}</span>
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
        suggestionsDiv.style.display = 'none';
    }
});

// Make a guess
function makeGuess() {
    if (guessesRemaining === 0) {
        resultDiv.textContent = "No guesses remaining! The character was " + targetCharacter.name + ".";
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
    displayGuess(guessedCharacter);

    if (guessedCharacter.name === targetCharacter.name) {
        resultDiv.textContent = "Correct! You guessed the character!";
        guessesRemaining = 0; // End the game
    } else if (guessesRemaining === 0) {
        resultDiv.textContent = "No guesses remaining! The character was " + targetCharacter.name + ".";
    }
}

// Display a guess in the grid
function displayGuess(character) {
    const guessRow = document.createElement('div');
    guessRow.className = 'guess-row';

    const attributes = [
        character.img,
        character.name,
        character.school,
        character.combatClass,
        character.role,
        character.damageType,
        character.armorType,
        character.skill
    ];

    attributes.forEach((attr, index) => {
        const square = document.createElement('div');
        square.className = 'guess-square';
        if (typeof attr === 'string' && attr.startsWith('http')) {
            // Display image
            const img = document.createElement('img');
            img.src = attr;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            square.appendChild(img);
        } else {
            // Display text
            square.textContent = attr;
        }

        // Check if the attribute matches the target character
        const targetAttr = Object.values(targetCharacter)[index];
        if (attr === targetAttr) {
            square.classList.add('correct');
        }

        guessRow.appendChild(square);
    });

    guessesDiv.appendChild(guessRow);
}
