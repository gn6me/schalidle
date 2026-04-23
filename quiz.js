let characters = {};
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let currentCorrectName = "";
const TIME_LIMIT = 3000; // 3 seconds
const CATEGORIES = ['weapon', 'birthday', 'voice', 'height'];

const quizContainer = document.getElementById('quiz-container');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('startButton');
const questionText = document.getElementById('question-text');
const questionContent = document.getElementById('question-content');
const optionsContainer = document.getElementById('options-container');
const timerProgress = document.getElementById('timer-progress');
const currentQSpan = document.getElementById('current-q');
const quizResult = document.getElementById('quiz-result');

quizContainer.style.display = 'none';

// Seeding function
function getDailySeed() {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    return easternTime.getFullYear() * 10000 + (easternTime.getMonth() + 1) * 100 + easternTime.getDate();
}

// Simple LCG random generator
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

async function loadData() {
    try {
        const response = await fetch('student-list.json');
        characters = await response.json();
        console.log("Loaded " + Object.keys(characters).length + " characters.");
        checkPreviousPlay();
    } catch (e) {
        console.error("Failed to load student data", e);
        questionText.textContent = "Error loading data. Please refresh.";
    }
}

function checkPreviousPlay() {
    const today = getDailySeed();
    const lastPlay = localStorage.getItem('lastQuizDate');
    if (lastPlay == today) {
        const lastScore = localStorage.getItem('lastQuizScore');
        showFinalResult(true, lastScore);
    }
}

function startQuiz() {
    const today = getDailySeed();
    if (localStorage.getItem('lastQuizDate') == today) {
        return;
    }
    if (Object.keys(characters).length === 0) {
        alert("Data still loading, please wait a moment...");
        return;
    }
    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex >= 5) {
        showFinalResult();
        return;
    }

    currentQSpan.textContent = currentQuestionIndex + 1;
    const seed = getDailySeed() + currentQuestionIndex;
    // Pick one of the 4 categories for each of the 5 questions
    const catIdx = Math.floor(seededRandom(seed + 50) * CATEGORIES.length);
    const category = CATEGORIES[catIdx];
    
    // Filter characters that HAVE the required data
    const charactersArray = Object.values(characters).filter(c => {
        if (category === 'weapon') return c.weaponImg;
        if (category === 'birthday') return c.birthday;
        if (category === 'voice') return c.voiceUrl;
        if (category === 'height') return c.height;
        return false;
    });

    if (charactersArray.length < 5) {
        console.warn("Not enough characters for category: " + category);
        // Fallback to birthday or just skip
        currentQuestionIndex++;
        nextQuestion();
        return;
    }

    // Select 5 random students for options
    const options = [];
    const tempChars = [...charactersArray];
    for (let i = 0; i < 5; i++) {
        const idx = Math.floor(seededRandom(seed + i) * tempChars.length);
        options.push(tempChars.splice(idx, 1)[0]);
    }

    // Target is one of the options
    const targetIdx = Math.floor(seededRandom(seed + 10) * 5);
    const target = options[targetIdx];
    currentCorrectName = target.name;

    displayQuestion(category, target, options);
    startTimer();
}

function displayQuestion(category, target, options) {
    questionContent.innerHTML = '';
    optionsContainer.innerHTML = '';
    quizResult.textContent = '';

    let text = "Match the student to this ";
    switch (category) {
        case 'weapon':
            text += "Weapon:";
            questionContent.innerHTML = `<img src="${target.weaponImg}" alt="Weapon" style="max-height: 150px; width: auto;" onerror="handleImageError()">`;
            break;
        case 'birthday':
            text += "Birthday:";
            questionContent.innerHTML = `<div style="font-size: 2.5rem; font-weight: bold; margin: 20px; color: #2d4c72;">${target.birthday}</div>`;
            break;
        case 'voice':
            text += "Voice Line:";
            questionContent.innerHTML = `
                <button id="playBtn" class="unskew" style="padding: 15px; margin: 20px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 8px;">
                    <ion-icon name="volume-high-outline" style="font-size: 2.5rem; vertical-align: middle;"></ion-icon>
                    <span style="font-size: 1.2rem; margin-left: 10px; font-weight: bold;">Play Audio</span>
                </button>`;
            const playBtn = document.getElementById('playBtn');
            playBtn.onclick = () => playVoice(target.voiceUrl);
            // Attempt auto-play
            playVoice(target.voiceUrl);
            break;
        case 'height':
            text += "Height:";
            questionContent.innerHTML = `<div style="font-size: 3rem; font-weight: bold; margin: 20px; color: #2d4c72;">${target.height}</div>`;
            break;
    }
    questionText.textContent = text;

    options.forEach(student => {
        const btn = document.createElement('button');
        btn.className = 'option-button';
        // Use placeholder if student.img is missing (though scraper should have it now)
        const imgSrc = student.img || 'imgs/A.R.O.N.A_Icon.webp';
        btn.innerHTML = `
            <img src="${imgSrc}" alt="${student.name}" onerror="this.src='imgs/A.R.O.N.A_Icon.webp'">
            <span>${student.name}</span>
        `;
        btn.onclick = () => checkAnswer(student.name, target.name, btn);
        optionsContainer.appendChild(btn);
    });
}

function handleImageError() {
    console.warn("Broken asset detected. Skipping question.");
    clearInterval(timerInterval);
    currentQuestionIndex++;
    nextQuestion();
}

function playVoice(url) {
    const audio = new Audio(url);
    audio.play().catch(e => {
        console.log("Audio play blocked by browser. User must click button.", e);
    });
}

function checkAnswer(selectedName, correctName, btn) {
    clearInterval(timerInterval);
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(b => b.disabled = true);

    if (selectedName === correctName) {
        score++;
        btn.classList.add('correct');
        quizResult.textContent = "Correct!";
        quizResult.style.color = "#48bb78";
    } else {
        btn.classList.add('incorrect');
        allButtons.forEach(b => {
            if (b.querySelector('span').textContent === correctName) {
                b.classList.add('correct');
            }
        });
        quizResult.textContent = "Wrong! It was " + correctName;
        quizResult.style.color = "#f56565";
    }

    setTimeout(() => {
        currentQuestionIndex++;
        nextQuestion();
    }, 2000);
}

function startTimer() {
    timerProgress.style.width = '100%';
    const start = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, TIME_LIMIT - elapsed);
        const percentage = (remaining / TIME_LIMIT) * 100;
        timerProgress.style.width = percentage + '%';

        if (remaining <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 50);
}

function timeUp() {
    quizResult.textContent = "Time's up! It was " + currentCorrectName;
    quizResult.style.color = "#f56565";
    const allButtons = document.querySelectorAll('.option-button');
    allButtons.forEach(b => {
        b.disabled = true;
        if (b.querySelector('span').textContent === currentCorrectName) {
            b.classList.add('correct');
        }
    });
    
    setTimeout(() => {
        currentQuestionIndex++;
        nextQuestion();
    }, 2000);
}

function showFinalResult(alreadyPlayed = false, savedScore = null) {
    const finalScore = savedScore !== null ? savedScore : score;
    const today = getDailySeed();
    
    if (!alreadyPlayed) {
        localStorage.setItem('lastQuizDate', today);
        localStorage.setItem('lastQuizScore', score);
    }

    startScreen.style.display = 'none';
    quizContainer.style.display = 'block';
    
    quizContainer.innerHTML = `
        <h2 style="color: #2d4c72;">${alreadyPlayed ? "Today's Result" : "Quiz Complete!"}</h2>
        <div style="font-size: 4rem; margin: 20px; color: #667eea; font-weight: 800;">${finalScore}/5</div>
        <p style="font-size: 1.2rem; margin-bottom: 30px;">${finalScore == 5 ? "Perfect score, Sensei!" : "Excellent work, Sensei!"}</p>
        <div id="countdown-quiz" style="margin-bottom: 20px; font-weight: bold; color: #718096;"></div>
        <button onclick="location.href='index.html'" class="unskew" style="padding: 15px 30px; margin: 10px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: bold;">Back Home</button>
    `;

    const countdownElement = document.getElementById('countdown-quiz');
    function updateCountdown() {
        const now = new Date();
        const nextDay = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        nextDay.setHours(24, 0, 0, 0);
        
        const diff = nextDay - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `Next quiz in ${hours}h ${mins}m ${secs}s`;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

startButton.onclick = startQuiz;
loadData();
