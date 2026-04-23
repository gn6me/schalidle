let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
let guessHistory = [];
let daySeed = 0;

const guessesDiv = document.getElementById("guesses");
const resultDiv = document.getElementById("result");
const searchInput = document.getElementById("searchInput");
const suggestionsDiv = document.getElementById("suggestions");
let selectedSuggestionIndex = -1;
resultDiv.style.display = "none";

// Utility function to get eastern time
function getEasternTime() {
  const now = new Date();
  return new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
}

// Utility function to generate date seed
function generateDateSeed(date) {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

function preloadImages(characters) {
  setTimeout(() => {
    Object.values(characters).forEach((character) => {
      const img = new Image();
      img.src = character.img;
    });
  }, 500);
}

function generateEmojiResults(guesses, targetCharacter) {
  const correctEmoji = "🟩";
  const incorrectEmoji = "⬜";
  const spacer = '';
  let emojiResults = "";

  guesses.forEach((guess) => {
    const attributes = [
      guess.school,
      guess.combatClass,
      guess.role,
      guess.damageType,
      guess.armorType,
      guess.skill,
      guess.height,
    ];

    const targetAttributes = [
      targetCharacter.school,
      targetCharacter.combatClass,
      targetCharacter.role,
      targetCharacter.damageType,
      targetCharacter.armorType,
      targetCharacter.skill,
      targetCharacter.height,
    ];

    let emojiRow = "";
    attributes.forEach((attr, index) => {
      if (attr === targetAttributes[index]) {
        emojiRow += correctEmoji + spacer;
      } else {
        emojiRow += incorrectEmoji + spacer;
      }
    });

    emojiResults += emojiRow + "\n";
  });

  return emojiResults;
}

function copyEmojiResultsToClipboard(emojiResults) {
  navigator.clipboard.writeText(emojiResults).then(() => {
    console.log("Results copied!");
  }).catch(() => {
    alert("Failed to copy results.");
  });
}

function getDailyCharacter() {
  const charactersArray = Object.values(characters);
  const seed = 69;
  const easternTime = getEasternTime();

  const sevenPM = new Date(easternTime);
  sevenPM.setHours(19, 0, 0, 0);

  const dayStart = new Date(easternTime);
  dayStart.setHours(0, 0, 0, 0);
  if (easternTime < sevenPM) {
    dayStart.setDate(dayStart.getDate() - 1);
  }

  daySeed = generateDateSeed(dayStart);
  const dailyIndex = Math.abs((seed + daySeed) % charactersArray.length);

  return charactersArray[dailyIndex];
}

function getPreviousDayCharacter() {
  const charactersArray = Object.values(characters);
  const seed = 69;
  const easternTime = getEasternTime();
  const sevenPM = new Date(easternTime);
  sevenPM.setHours(19, 0, 0, 0);
  const previousDayStart = new Date(easternTime);
  previousDayStart.setHours(0, 0, 0, 0);

  if (easternTime < sevenPM) {
    previousDayStart.setDate(previousDayStart.getDate() - 2);
  } else {
    previousDayStart.setDate(previousDayStart.getDate() - 1);
  }

  const previousDaySeed = generateDateSeed(previousDayStart);
  const previousDayIndex = Math.abs((seed + previousDaySeed) % charactersArray.length);

  return charactersArray[previousDayIndex];
}

function updateCountdown() {
  const easternTime = getEasternTime();
  const nextSelectionTime = new Date(easternTime);
  nextSelectionTime.setHours(19, 0, 0, 0);
  if (easternTime >= nextSelectionTime) {
    nextSelectionTime.setDate(nextSelectionTime.getDate() + 1);
  }

  const timeDiff = nextSelectionTime - easternTime;
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const countdownElement = document.getElementById("countdown");
  if (timeDiff <= 0) {
    countdownElement.textContent = `Refresh the page!`;
  } else {
    countdownElement.textContent = `Next character in: ${hours}h ${minutes}m ${seconds}s`;
  }
}

function displayPreviousDayCharacter() {
  const previousDayCharacter = getPreviousDayCharacter();
  const previousDayElement = document.getElementById("previous-day-character");
  if (previousDayElement) {
    previousDayElement.innerHTML = `
            <p>Yesterday's Character Was:</p>
            <p>${previousDayCharacter.name}</p>
            <img src="${previousDayCharacter.img}" alt="${previousDayCharacter.name}" width="100">
        `;
  }
}

function displayResult(message, guesses = null) {
  resultDiv.style.display = "block";
  resultDiv.textContent = message;

  if (guesses) {
    const emojiResults = generateEmojiResults(guesses, targetCharacter);
    resultDiv.innerHTML += `<pre>${emojiResults}</pre>`;
    resultDiv.innerHTML += `<button onclick="copyEmojiResultsToClipboard('${emojiResults.replace(/\n/g, "\\n")}')">
            <ion-icon name="copy"></ion-icon>
        </button>`;
  }
}

function getAvailableCharacters() {
  const allCharacters = Object.keys(characters);
  const guessedCharactersSet = new Set(guessHistory.map((guess) => guess.name));
  return allCharacters
    .filter((name) => !guessedCharactersSet.has(name))
    .sort((a, b) => a.localeCompare(b));
}

function showAllSuggestions() {
  const fragment = document.createDocumentFragment();
  suggestionsDiv.innerHTML = "";
  const availableCharacters = getAvailableCharacters();

  availableCharacters.forEach((name) => {
    const suggestion = document.createElement("div");
    suggestion.dataset.characterName = name;
    suggestion.innerHTML = `
            <img class="searchImg" src="${characters[name].img}" alt="${name}">
            <span>${name}</span>
        `;
    fragment.appendChild(suggestion);
  });

  suggestionsDiv.appendChild(fragment);
  suggestionsDiv.style.display = "block";
  selectedSuggestionIndex = -1;
}

function filterSuggestions(query) {
  const fragment = document.createDocumentFragment();
  suggestionsDiv.innerHTML = "";

  if (query) {
    const availableCharacters = getAvailableCharacters();
    const filteredCharacters = availableCharacters.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase()),
    );

    if (filteredCharacters.length > 0) {
      filteredCharacters.forEach((name) => {
        const suggestion = document.createElement("div");
        suggestion.dataset.characterName = name;
        suggestion.innerHTML = `
                    <img class="searchImg" src="${characters[name].img}" alt="${name}">
                    <span>${name}</span>
                `;
        fragment.appendChild(suggestion);
      });

      suggestionsDiv.appendChild(fragment);
      suggestionsDiv.style.display = "block";
    } else {
      suggestionsDiv.style.display = "none";
    }
  } else {
    showAllSuggestions();
  }
  selectedSuggestionIndex = -1;
}

function handleSuggestionNavigation(event) {
  const suggestions = Array.from(suggestionsDiv.children);
  if (suggestionsDiv.style.display === "block" && suggestions.length > 0) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
      highlightSuggestion();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedSuggestionIndex = selectedSuggestionIndex <= 0 ? suggestions.length - 1 : selectedSuggestionIndex - 1;
      highlightSuggestion();
    } else if (event.key === "Enter" && selectedSuggestionIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[selectedSuggestionIndex];
      searchInput.value = selected.dataset.characterName;
      suggestionsDiv.style.display = "none";
    }
  }
}

function highlightSuggestion() {
  const suggestions = Array.from(suggestionsDiv.children);
  suggestions.forEach((suggestion, index) => {
    suggestion.classList.toggle("selected", index === selectedSuggestionIndex);
  });
  if (selectedSuggestionIndex >= 0) {
    suggestions[selectedSuggestionIndex].scrollIntoView({ block: "nearest" });
  }
}

function saveGameState() {
  const gameState = {
    date: daySeed,
    guesses: guessHistory.map(c => c.name)
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem('gameState');
  if (saved) {
    try {
      const gameState = JSON.parse(saved);
      if (gameState.date === daySeed) {
        gameState.guesses.forEach(name => {
          const char = characters[name];
          if (char) {
            guessesRemaining--;
            guessHistory.push(char);
            displayGuess(char);
            if (name === targetCharacter.name) {
              displayResult("Correct! You guessed the character!", guessHistory);
              guessesRemaining = 0;
            }
          }
        });
        if (guessesRemaining === 0 && guessHistory.length > 0 && guessHistory[guessHistory.length - 1].name !== targetCharacter.name) {
          displayResult(`No guesses remaining! The character was ${targetCharacter.name}.`, guessHistory);
        }
      } else {
        localStorage.removeItem('gameState');
      }
    } catch (e) {
      console.error("Error loading state", e);
    }
  }
}

function makeGuess() {
  if (guessesRemaining === 0) return;

  const guessInput = searchInput.value.trim();
  if (!guessInput) return;

  const guessedCharacter = characters[guessInput];
  if (!guessedCharacter) {
    displayResult("Character not found.");
    return;
  }

  if (guessHistory.some((guess) => guess.name === guessedCharacter.name)) {
    displayResult("You've already guessed this character!");
    return;
  }

  guessesRemaining--;
  guessHistory.push(guessedCharacter);
  displayGuess(guessedCharacter);
  saveGameState();

  if (guessedCharacter.name === targetCharacter.name) {
    displayResult("Correct! You guessed the character!", guessHistory);
    guessesRemaining = 0;
  } else if (guessesRemaining === 0) {
    displayResult(`No guesses remaining! The character was ${targetCharacter.name}.`, guessHistory);
  }

  searchInput.value = "";
}

function displayGuess(character) {
  const guessRow = document.createElement("div");
  guessRow.className = "guess-row";

  const fragment = document.createDocumentFragment();

  // Mapping attributes to columns consistently
  const attributes = [
    { key: 'img', type: 'portrait' },
    { key: 'school', type: 'school' },
    { key: 'combatClass', type: 'class' },
    { key: 'role', type: 'info' },
    { key: 'damageType', type: 'info' },
    { key: 'armorType', type: 'info' },
    { key: 'skill', type: 'skill' },
    { key: 'height', type: 'height' }
  ];

  attributes.forEach((attrConfig, index) => {
    const i = index + 1; // Class names sq1 to sq8
    const square = document.createElement("div");
    square.className = "guess-square sq" + i;
    const value = character[attrConfig.key];
    const targetValue = targetCharacter[attrConfig.key];

    if (attrConfig.type === 'portrait') {
      const img = document.createElement("img");
      img.src = value;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      square.appendChild(img);
    } else if (attrConfig.type === 'info') {
      const img = document.createElement("img");
      img.src = "imgs/info/" + value + ".webp";
      img.className = "dmgIcon";
      square.appendChild(img);
    } else if (attrConfig.type === 'school') {
      const img = document.createElement("img");
      img.src = "imgs/schools/" + value + "_Icon.webp";
      img.className = "schoolImg";
      square.appendChild(img);
    } else if (attrConfig.type === 'class') {
      const img = document.createElement("img");
      img.src = "imgs/info/" + value + "_role.webp";
      img.className = "roleImg";
      square.appendChild(img);
    } else if (attrConfig.type === 'skill') {
      square.textContent = value;
      const gv = parseInt(value, 10);
      const tv = parseInt(targetValue, 10);
      if (gv > tv) square.innerHTML += '<ion-icon class="icon" name="arrow-down"></ion-icon>';
      else if (gv < tv) square.innerHTML += '<ion-icon class="icon" name="arrow-up"></ion-icon>';
    } else if (attrConfig.type === 'height') {
      square.textContent = value;
      const gv = parseInt(value, 10);
      const tv = parseInt(targetValue, 10);
      if (gv > tv) square.innerHTML += '<ion-icon class="icon" name="arrow-down"></ion-icon>';
      else if (gv < tv) square.innerHTML += '<ion-icon class="icon" name="arrow-up"></ion-icon>';
    }

    if (String(value).trim() === String(targetValue).trim()) {
      square.classList.add("correct");
    }
    fragment.appendChild(square);
  });

  guessRow.appendChild(fragment);
  guessesDiv.appendChild(guessRow);
}

function initializeEventListeners() {
  suggestionsDiv.addEventListener("click", (event) => {
    const suggestion = event.target.closest("div");
    if (suggestion && suggestion.dataset.characterName) {
      searchInput.value = suggestion.dataset.characterName;
      makeGuess();
      suggestionsDiv.style.display = "none";
    }
  });

  searchInput.addEventListener("focus", showAllSuggestions);
  searchInput.addEventListener("input", () => filterSuggestions(searchInput.value.trim()));
  searchInput.addEventListener("keydown", handleSuggestionNavigation);
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter" && !event.defaultPrevented) {
      makeGuess();
      suggestionsDiv.style.display = "none";
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
      suggestionsDiv.style.display = "none";
    }
  });
}

function showLoadingIndicator() {
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "loading-indicator";
  loadingIndicator.textContent = "Loading character data...";
  loadingIndicator.style.position = "fixed";
  loadingIndicator.style.top = "50%";
  loadingIndicator.style.left = "50%";
  loadingIndicator.style.transform = "translate(-50%, -50%)";
  loadingIndicator.style.padding = "10px";
  loadingIndicator.style.background = "rgba(0, 0, 0, 0.7)";
  loadingIndicator.style.color = "white";
  loadingIndicator.style.borderRadius = "5px";
  loadingIndicator.style.zIndex = "1000";
  document.body.appendChild(loadingIndicator);
  return loadingIndicator;
}

function hideLoadingIndicator(indicator) {
  if (indicator && indicator.parentNode) indicator.parentNode.removeChild(indicator);
}

function initializeGame() {
  const loadingIndicator = showLoadingIndicator();

  fetch("student-list.json")
    .then((response) => response.json())
    .then((data) => {
      characters = data;
      targetCharacter = getDailyCharacter(); // Sets daySeed
      preloadImages(characters);
      loadGameState(); // Now correctly follows daySeed set
      displayPreviousDayCharacter();
      setInterval(updateCountdown, 1000);
      updateCountdown();
      initializeEventListeners();
      hideLoadingIndicator(loadingIndicator);
    })
    .catch((error) => {
      console.error("Error loading character data:", error);
      hideLoadingIndicator(loadingIndicator);
    });
}

initializeGame();
