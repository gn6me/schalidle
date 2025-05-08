let characters = {};
let targetCharacter = null;
let guessesRemaining = 6;
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
    date.getFullYear() * 1000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

function preloadImages(characters) {
  // Using a small delay to not block initial rendering
  setTimeout(() => {
    Object.values(characters).forEach((character) => {
      const img = new Image();
      img.src = character.img;
    });
  }, 500);
}

function generateEmojiResults(guesses, targetCharacter) {
  const correctEmoji = "🟩"; // Green square for correct
  const incorrectEmoji = "⬜"; // White square for incorrect

  // To help with alignment
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

    // Add spacer to help with Discord formatting
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

// Function to copy emoji results to clipboard
function copyEmojiResultsToClipboard(emojiResults) {
  navigator.clipboard
    .writeText(emojiResults)
    .then(() => {
      console.log("Results copied to clipboard as emojis!");
    })
    .catch(() => {
      alert("Failed to copy results. Please copy them manually.");
    });
}

// Get daily character
function getDailyCharacter() {
  const charactersArray = Object.values(characters);
  const seed = 69; // fixed value for consistency
  const easternTime = getEasternTime();

  // Reference for 7pm
  const sevenPM = new Date(easternTime);
  sevenPM.setHours(19, 0, 0, 0);

  // Set start time and check for new day
  const dayStart = new Date(easternTime);
  dayStart.setHours(0, 0, 0, 0);
  if (easternTime < sevenPM) {
    dayStart.setDate(dayStart.getDate() - 1);
  }

  // Consistent seed generation and calculate target character
  const daySeed = generateDateSeed(dayStart);
  const dailyIndex = Math.abs((seed + daySeed) % charactersArray.length);

  return charactersArray[dailyIndex];
}

function getPreviousDayCharacter() {
  const charactersArray = Object.values(characters);
  const seed = 69; // Fixed seed for consistency
  const easternTime = getEasternTime();

  // Set target time
  const sevenPM = new Date(easternTime);
  sevenPM.setHours(19, 0, 0, 0);

  // Determine day for previous character
  const previousDayStart = new Date(easternTime);
  previousDayStart.setHours(0, 0, 0, 0); // Day start

  // Before 7pm, character from 2 days ago will be shown
  // After 7pm, character from the previous day is shown
  if (easternTime < sevenPM) {
    previousDayStart.setDate(previousDayStart.getDate() - 2);
  } else {
    previousDayStart.setDate(previousDayStart.getDate() - 1);
  }

  // Consistent seed format
  const previousDaySeed = generateDateSeed(previousDayStart);
  const previousDayIndex = Math.abs(
    (seed + previousDaySeed) % charactersArray.length,
  );

  return charactersArray[previousDayIndex];
}

function updateCountdown() {
  const easternTime = getEasternTime();

  // Calculate the next selection at 7pm EST
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

// Display a consistent status message
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

// Get available character names (not yet guessed) in alphabetical order
function getAvailableCharacters() {
  // Get all character names
  const allCharacters = Object.keys(characters);

  // Create a set of guessed character names for faster lookups
  const guessedCharactersSet = new Set(guessHistory.map((guess) => guess.name));

  // Filter out guessed characters and sort alphabetically
  return allCharacters
    .filter((name) => !guessedCharactersSet.has(name))
    .sort((a, b) => a.localeCompare(b));
}

// Show all suggestions for character selection
function showAllSuggestions() {
  const fragment = document.createDocumentFragment();
  suggestionsDiv.innerHTML = "";

  // Get available characters (sorted alphabetically, excluding guessed ones)
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

// Function to filter suggestions based on user input
function filterSuggestions(query) {
  const fragment = document.createDocumentFragment();
  suggestionsDiv.innerHTML = "";

  if (query) {
    // Get available characters (sorted alphabetically, excluding guessed ones)
    const availableCharacters = getAvailableCharacters();

    // Filter by query
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

// Handle keyboard navigation in suggestions
function handleSuggestionNavigation(event) {
  const suggestions = Array.from(suggestionsDiv.children);

  if (suggestionsDiv.style.display === "block" && suggestions.length > 0) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedSuggestionIndex =
        (selectedSuggestionIndex + 1) % suggestions.length;
      highlightSuggestion();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedSuggestionIndex =
        selectedSuggestionIndex <= 0
          ? suggestions.length - 1
          : selectedSuggestionIndex - 1;
      highlightSuggestion();
    } else if (event.key === "Enter" && selectedSuggestionIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[selectedSuggestionIndex];
      searchInput.value = selected.dataset.characterName;
      suggestionsDiv.style.display = "none";
    }
  }
}

// Highlight the currently selected suggestion
function highlightSuggestion() {
  const suggestions = Array.from(suggestionsDiv.children);

  suggestions.forEach((suggestion, index) => {
    suggestion.classList.toggle("selected", index === selectedSuggestionIndex);
  });

  if (selectedSuggestionIndex >= 0) {
    suggestions[selectedSuggestionIndex].scrollIntoView({ block: "nearest" });
  }
}

let guessHistory = [];

// Make a guess
function makeGuess() {
  if (guessesRemaining === 0) {
    displayResult(
      `No guesses remaining! The character was ${targetCharacter.name}.`,
      guessHistory,
    );
    return;
  }

  const guessInput = searchInput.value.trim();
  if (!guessInput) {
    displayResult("Please enter a character name.");
    return;
  }

  const guessedCharacter = characters[guessInput];
  if (!guessedCharacter) {
    displayResult("Character not found.");
    return;
  }

  // Check if character was already guessed
  if (guessHistory.some((guess) => guess.name === guessedCharacter.name)) {
    displayResult("You've already guessed this character!");
    return;
  }

  guessesRemaining--;
  guessHistory.push(guessedCharacter);
  displayGuess(guessedCharacter);

  if (guessedCharacter.name === targetCharacter.name) {
    displayResult("Correct! You guessed the character!", guessHistory);
    guessesRemaining = 0; // End the game
  } else if (guessesRemaining === 0) {
    displayResult(
      `No guesses remaining! The character was ${targetCharacter.name}.`,
      guessHistory,
    );
  }

  // Clear the input field after a guess
  searchInput.value = "";
}

// Display a guess in the grid
function displayGuess(character) {
  const guessRow = document.createElement("div");
  guessRow.className = "guess-row";

  const fragment = document.createDocumentFragment();

  const attributes = [
    character.name,
    character.img,
    character.school,
    character.combatClass,
    character.role,
    character.damageType,
    character.armorType,
    character.skill,
    character.height,
  ];

  // Start from index 1 to skip the name in display
  for (let index = 1; index < attributes.length; index++) {
    const attr = attributes[index];
    const square = document.createElement("div");
    square.className = "guess-square sq" + index;

    // Create profile image for character
    if (typeof attr === "string" && attr.startsWith("http")) {
      // Display image
      const img = document.createElement("img");
      img.src = attr;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      square.appendChild(img);
    }
    // Create icons for Role, Damage, and Armor boxes
    else if (index === 4 || index === 5 || index === 6) {
      const dmgImg = document.createElement("img");
      dmgImg.src = "https://schalidle.vercel.app/imgs/info/" + attr + ".webp";
      dmgImg.className = "dmgIcon";
      square.appendChild(dmgImg);
    }
    // Create icons for School
    else if (index === 2) {
      const schoolImg = document.createElement("img");
      schoolImg.src =
        "https://schalidle.vercel.app/imgs/schools/" + attr + "_Icon.webp";
      schoolImg.className = "schoolImg";
      square.appendChild(schoolImg);
    }
    // Create icons for Class - Fixed the condition from attr === 3 to index === 3
    else if (index === 3) {
      const roleImg = document.createElement("img");
      roleImg.src =
        "https://schalidle.vercel.app/imgs/info/" + attr + "_role.webp";
      roleImg.className = "roleImg";
      square.appendChild(roleImg);
    }
    // Handle skill cost with up/down arrows
    else if (index === 7) {
      const guessedSkillCost = parseInt(attr, 10);
      const targetSkillCost = parseInt(targetCharacter.skill, 10);

      square.textContent = attr;

      // Show arrows indicating target skill cost
      if (guessedSkillCost > targetSkillCost) {
        square.innerHTML +=
          '<ion-icon class="icon" name="arrow-down"></ion-icon>';
      } else if (guessedSkillCost < targetSkillCost) {
        square.innerHTML +=
          '<ion-icon class="icon" name="arrow-up"></ion-icon>';
      }
    }
    // Handle skill cost with up/down arrows
    else if (index === 8) {
      const guessedHeight = parseInt(attr, 10);
      const targetHeight = parseInt(targetCharacter.height, 10);

      square.textContent = attr;

      // Show arrows indicating target skill cost
      if (guessedHeight > targetHeight) {
        square.innerHTML +=
          '<ion-icon class="icon" name="arrow-down"></ion-icon>';
      } else if (guessedHeight < targetHeight) {
        square.innerHTML +=
          '<ion-icon class="icon" name="arrow-up"></ion-icon>';
      }
    } else {
      // Display text
      square.textContent = attr;
    }

    // Check if the attribute matches the target character
    const targetAttr = Object.values(targetCharacter)[index];
    if (attr === targetAttr) {
      square.classList.add("correct");
    }

    fragment.appendChild(square);
  }

  guessRow.appendChild(fragment);
  guessesDiv.appendChild(guessRow);
}

// Initialize event listeners
function initializeEventListeners() {
  // Handle suggestion selection
  suggestionsDiv.addEventListener("click", (event) => {
    const suggestion = event.target.closest("div");
    if (suggestion && suggestion.dataset.characterName) {
      searchInput.value = suggestion.dataset.characterName;
      makeGuess();
      suggestionsDiv.style.display = "none";
    }
  });

  // Handle search input focus
  searchInput.addEventListener("focus", showAllSuggestions);

  // Handle search input typing
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    filterSuggestions(query);
  });

  // Handle keyboard events
  searchInput.addEventListener("keydown", handleSuggestionNavigation);

  // Handle Enter key to submit guess
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter" && !event.defaultPrevented) {
      makeGuess();
      suggestionsDiv.style.display = "none";
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !searchInput.contains(event.target) &&
      !suggestionsDiv.contains(event.target)
    ) {
      suggestionsDiv.style.display = "none";
    }
  });
}

// Loading indicator
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
  if (indicator && indicator.parentNode) {
    indicator.parentNode.removeChild(indicator);
  }
}

// Initialize the game
function initializeGame() {
  const loadingIndicator = showLoadingIndicator();

  fetch("student-list.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch characters: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      characters = data;
      targetCharacter = getDailyCharacter();

      // Start preloading images
      preloadImages(characters);

      // Initialize display and timers
      displayPreviousDayCharacter();
      setInterval(updateCountdown, 1000);
      updateCountdown();

      // Initialize event listeners
      initializeEventListeners();

      // Hide loading indicator
      hideLoadingIndicator(loadingIndicator);
    })
    .catch((error) => {
      console.error("Error loading character data:", error);
      displayResult("Failed to load character data. Please refresh the page.");
      hideLoadingIndicator(loadingIndicator);
    });
}

// Start the game
initializeGame();
