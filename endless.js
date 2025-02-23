let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
let streak = 0;
const guessesDiv = document.getElementById('guesses');
const resultDiv = document.getElementById('result');
const streakElement = document.getElementById('streak');
const continueButton = document.getElementById('continueButton');

// Function to preload all images
function preloadImages(characters) {
    Object.values(characters).forEach(character => {
        const img = new Image();
        img.src = character.img;
    });
}

// Function to select a new random character
function selectNewCharacter() {
    const charactersArray = Object.values(characters);
    const randomIndex = Math.floor(Math.random() * charactersArray.length);
    targetCharacter = charactersArray[randomIndex];
    console.log("Target Character:", targetCharacter); // For debugging
}

// Function to reset the game for a new round
function startNewRound() {
    guessesRemaining = 6;
    guessesDiv.innerHTML = '';
    resultDiv.innerHTML = '';
    searchInput.value = '';
    continueButton.style.display = 'none';
    selectNewCharacter();
}

// Function to update the streak counter
function updateStreak() {
    streakElement.textContent = `Streak: ${streak}`;
}

// Fetch characters from JSON file
fetch('characters.json')
    .then(response => response.json())
    .then(data => {
        characters = data;
        selectNewCharacter(); // Select a random character when the page loads
        preloadImages(characters); // Preload all images
        updateStreak(); // Initialize streak counter
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
                suggestion.innerHTML = `
                    <img src="${characters[name].img}" alt="${name}">
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
        streak = 0; // Reset streak
        updateStreak();
        continueButton.style.display = 'none';
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
        streak++; // Increase streak
        updateStreak();
        continueButton.style.display = 'block'; // Show continue button
    } else if (guessesRemaining === 0) {
        resultDiv.textContent = "No guesses remaining! The character was " + targetCharacter.name + ".";
        streak = 0; // Reset streak
        updateStreak();
        continueButton.style.display = 'none';
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
        } else if (index === 7) { // Skill cost attribute
            const guessedSkillCost = parseInt(attr, 10);
            const targetSkillCost = parseInt(targetCharacter.skill, 10);

            // Display skill cost with arrow
            square.textContent = attr;
            if (guessedSkillCost > targetSkillCost) {
                square.innerHTML += ' ↓'; // Down arrow for higher skill cost
            } else if (guessedSkillCost < targetSkillCost) {
                square.innerHTML += ' ↑'; // Up arrow for lower skill cost
            } else {
                square.innerHTML += ' ✓'; // Checkmark for correct skill cost
            }
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
