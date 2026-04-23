let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
let streak = 0;
let guessHistory = [];

const guessesDiv = document.getElementById('guesses');
const resultDiv = document.getElementById('result');
const streakDiv = document.getElementById('streak');
const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const continueButton = document.getElementById('continueButton');
const retryButton = document.getElementById('retryButton');

let selectedSuggestionIndex = -1;

function getAvailableCharacters() {
    const allCharacters = Object.keys(characters);
    const guessedCharactersSet = new Set(guessHistory.map(guess => guess.name));
    return allCharacters
        .filter(name => !guessedCharactersSet.has(name))
        .sort();
}

function showAllSuggestions() {
    const availableCharacters = getAvailableCharacters();
    renderSuggestions(availableCharacters);
}

function renderSuggestions(characterNames) {
    suggestionsDiv.innerHTML = '';
    if (characterNames.length > 0) {
        characterNames.forEach(name => {
            const suggestion = document.createElement('div');
            suggestion.dataset.characterName = name;
            suggestion.innerHTML = `
                <img class="searchImg" src="${characters[name].img}" alt="${name}">
                <span>${name}</span>
            `;
            suggestionsDiv.appendChild(suggestion);
        });
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
    selectedSuggestionIndex = -1;
}

function filterSuggestions(query) {
    if (query) {
        const availableCharacters = getAvailableCharacters();
        const filteredCharacters = availableCharacters.filter(name =>
            name.toLowerCase().includes(query.toLowerCase())
        );
        renderSuggestions(filteredCharacters);
    } else {
        showAllSuggestions();
    }
}

function handleSuggestionNavigation(event) {
    const suggestions = Array.from(suggestionsDiv.children);
    if (suggestionsDiv.style.display === 'block' && suggestions.length > 0) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
            highlightSuggestion();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedSuggestionIndex = selectedSuggestionIndex <= 0 ? suggestions.length - 1 : selectedSuggestionIndex - 1;
            highlightSuggestion();
        } else if (event.key === 'Enter' && selectedSuggestionIndex >= 0) {
            event.preventDefault();
            const selected = suggestions[selectedSuggestionIndex];
            searchInput.value = selected.dataset.characterName;
            suggestionsDiv.style.display = 'none';
        }
    }
}

function highlightSuggestion() {
    const suggestions = Array.from(suggestionsDiv.children);
    suggestions.forEach((suggestion, index) => {
        suggestion.classList.toggle('selected', index === selectedSuggestionIndex);
    });
    if (selectedSuggestionIndex >= 0) {
        suggestions[selectedSuggestionIndex].scrollIntoView({ block: 'nearest' });
    }
}

fetch('student-list.json')
    .then(response => response.json())
    .then(data => {
        characters = data;
        startNewRound();
    });

function startNewRound() {
    const charactersArray = Object.values(characters);
    targetCharacter = charactersArray[Math.floor(Math.random() * charactersArray.length)];
    guessesRemaining = 6;
    guessHistory = [];
    guessesDiv.innerHTML = '';
    resultDiv.textContent = '';
    searchInput.value = '';
    continueButton.style.display = 'none';
    retryButton.style.display = 'none';
    searchInput.disabled = false;
    document.getElementById('searchButton').disabled = false;
}

function makeGuess() {
    const guessInput = searchInput.value.trim();
    const guessedCharacter = characters[guessInput];

    if (!guessedCharacter || guessHistory.some(g => g.name === guessedCharacter.name)) {
        return;
    }

    guessesRemaining--;
    guessHistory.push(guessedCharacter);
    displayGuess(guessedCharacter);

    if (guessedCharacter.name === targetCharacter.name) {
        streak++;
        streakDiv.textContent = `Streak: ${streak}`;
        resultDiv.textContent = "Correct! You guessed the character!";
        continueButton.style.display = 'block';
        searchInput.disabled = true;
        document.getElementById('searchButton').disabled = true;
    } else if (guessesRemaining === 0) {
        streak = 0;
        streakDiv.textContent = `Streak: ${streak}`;
        resultDiv.textContent = `No guesses remaining! The character was ${targetCharacter.name}.`;
        retryButton.style.display = 'block';
        searchInput.disabled = true;
        document.getElementById('searchButton').disabled = true;
    }
    searchInput.value = '';
    suggestionsDiv.style.display = 'none';
}

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
        character.skill,
        character.height
    ];

    const targetAttributes = [
        targetCharacter.name,
        targetCharacter.img,
        targetCharacter.school,
        targetCharacter.combatClass,
        targetCharacter.role,
        targetCharacter.damageType,
        targetCharacter.armorType,
        targetCharacter.skill,
        targetCharacter.height
    ];

    attributes.forEach((attr, index) => {
        if (index === 0) return; // Skip name

        const square = document.createElement('div');
        square.className = 'guess-square sq' + index;

        if (index === 1) { // Img
            const img = document.createElement('img');
            img.src = attr;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            square.appendChild(img);
        } else if (index === 4 || index === 5 || index === 6) { // Role, Damage, Armor
            const dmgImg = document.createElement('img');
            dmgImg.src = 'imgs/info/' + attr + '.webp';
            dmgImg.className = 'dmgIcon';
            square.appendChild(dmgImg);
        } else if (index === 2) { // School
            const schoolImg = document.createElement('img');
            schoolImg.src = 'imgs/schools/' + attr + '_Icon.webp';
            schoolImg.className = 'schoolImg';
            square.appendChild(schoolImg);
        } else if (index === 3) { // Class
            const roleImg = document.createElement('img');
            roleImg.src = 'imgs/info/' + attr + '_role.webp';
            roleImg.className = 'roleImg';
            square.appendChild(roleImg);
        } else if (index === 7) { // Skill
            const guessedSkillCost = parseInt(attr, 10);
            const targetSkillCost = parseInt(targetCharacter.skill, 10);
            square.textContent = attr;
            if (guessedSkillCost > targetSkillCost) {
                square.innerHTML += ' <ion-icon class="icon" name="arrow-down"></ion-icon>';
            } else if (guessedSkillCost < targetSkillCost) {
                square.innerHTML += ' <ion-icon class="icon" name="arrow-up"></ion-icon>';
            }
        } else if (index === 8) { // Height
            const guessedHeight = parseInt(attr, 10);
            const targetHeight = parseInt(targetCharacter.height, 10);
            square.textContent = attr;
            if (guessedHeight > targetHeight) {
                square.innerHTML += ' <ion-icon class="icon" name="arrow-down"></ion-icon>';
            } else if (guessedHeight < targetHeight) {
                square.innerHTML += ' <ion-icon class="icon" name="arrow-up"></ion-icon>';
            }
        } else {
            square.textContent = attr;
        }

        if (attr === targetAttributes[index]) {
            square.classList.add('correct');
        }

        guessRow.appendChild(square);
    });

    guessesDiv.appendChild(guessRow);
}

suggestionsDiv.addEventListener('click', (event) => {
    const suggestion = event.target.closest('div');
    if (suggestion && suggestion.dataset.characterName) {
        searchInput.value = suggestion.dataset.characterName;
        makeGuess();
    }
});

searchInput.addEventListener('focus', showAllSuggestions);
searchInput.addEventListener('input', () => filterSuggestions(searchInput.value.trim()));
searchInput.addEventListener('keydown', handleSuggestionNavigation);
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter' && !event.defaultPrevented) {
        makeGuess();
    }
});

document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.style.display = 'none';
    }
});
