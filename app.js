// Storage Keys
const STORAGE_KEYS = {
    WORDS: 'recalla_words',
    STATS: 'recalla_stats',
    USER_DATA: 'recalla_user_data'
};

// Game State
let gameState = {
    words: [],
    selectedCards: [],
    matchedPairs: [],
    currentRound: 1,
    score: 0,
    combo: 0,
    roundWords: []
};

// User Data
let userData = {
    points: 0,
    coins: 0,
    level: 1,
    totalGames: 0,
    correctMatches: 0,
    wrongMatches: 0
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    registerServiceWorker();
});

// Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.log('Service Worker registration failed', err));
    }
}

// Data Management
function loadData() {
    // Load words
    const storedWords = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (storedWords) {
        gameState.words = JSON.parse(storedWords);
    }
    
    // Load user data
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (storedUserData) {
        userData = JSON.parse(storedUserData);
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(gameState.words));
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
}

// UI Updates
function updateUI() {
    document.getElementById('points').textContent = userData.points;
    document.getElementById('coins').textContent = userData.coins;
    document.getElementById('level').textContent = userData.level;
    document.getElementById('word-count').textContent = gameState.words.length;
    
    // Enable/disable play button
    const playBtn = document.getElementById('play-btn');
    if (gameState.words.length < 4) {
        playBtn.disabled = true;
        playBtn.style.opacity = '0.5';
        playBtn.style.cursor = 'not-allowed';
    } else {
        playBtn.disabled = false;
        playBtn.style.opacity = '1';
        playBtn.style.cursor = 'pointer';
    }
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'words-list-screen') {
        displayWordsList();
    } else if (screenId === 'stats-screen') {
        displayStats();
    }
}

// Add Word Functionality
function addWord() {
    const wordInput = document.getElementById('new-word');
    const meaningInput = document.getElementById('new-meaning');
    const message = document.getElementById('added-message');
    
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();
    
    if (!word || !meaning) {
        showMessage(message, 'Please fill in both fields!', 'error');
        return;
    }
    
    // Check if word already exists
    if (gameState.words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
        showMessage(message, 'This word already exists!', 'error');
        return;
    }
    
    const newWord = {
        id: Date.now(),
        word: word,
        meaning: meaning,
        correct: 0,
        wrong: 0,
        lastPracticed: null
    };
    
    gameState.words.push(newWord);
    saveData();
    updateUI();
    
    // Clear inputs
    wordInput.value = '';
    meaningInput.value = '';
    
    // Show success message
    showMessage(message, `✅ "${word}" added successfully! (+10 points)`, 'success');
    
    // Award points for adding words
    userData.points += 10;
    userData.coins += 5;
    saveData();
    updateUI();
    
    // Celebration animation
    createParticles('⭐', 5);
    
    // Check level up
    checkLevelUp();
}

function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

// Display Words List
function displayWordsList() {
    const wordsList = document.getElementById('words-list');
    
    if (gameState.words.length === 0) {
        wordsList.innerHTML = '<div style="text-align: center; padding: 40px; color: white;">No words yet. Add some words to get started!</div>';
        return;
    }
    
    wordsList.innerHTML = gameState.words.map(word => `
        <div class="word-card">
            <div class="word-info">
                <div class="word-text">${word.word}</div>
                <div class="word-meaning">${word.meaning}</div>
                <div class="word-stats">✅ ${word.correct} | ❌ ${word.wrong}</div>
            </div>
            <button class="delete-btn" onclick="deleteWord(${word.id})">🗑️</button>
        </div>
    `).join('');
}

function deleteWord(id) {
    if (confirm('Are you sure you want to delete this word?')) {
        gameState.words = gameState.words.filter(w => w.id !== id);
        saveData();
        updateUI();
        displayWordsList();
        createParticles('💔', 3);
    }
}

// Game Logic
function startGame() {
    if (gameState.words.length < 4) {
        alert('You need at least 4 words to play! Add more words first.');
        return;
    }
    
    showScreen('game-screen');
    resetGame();
    startNewRound();
}

function resetGame() {
    gameState.selectedCards = [];
    gameState.matchedPairs = [];
    gameState.currentRound = 1;
    gameState.score = 0;
    gameState.combo = 0;
    userData.totalGames++;
    saveData();
}

function startNewRound() {
    gameState.selectedCards = [];
    gameState.matchedPairs = [];
    
    // Select words for this round, prioritizing words with more errors
    const wordsForRound = selectWordsForRound(4);
    gameState.roundWords = wordsForRound;
    
    // Create cards (words and meanings)
    const cards = [];
    wordsForRound.forEach((word, index) => {
        cards.push({ type: 'word', value: word.word, id: word.id, pairId: index });
        cards.push({ type: 'meaning', value: word.meaning, id: word.id, pairId: index });
    });
    
    // Shuffle cards
    shuffleArray(cards);
    
    // Display cards
    displayGameBoard(cards);
    updateGameUI();
}

function selectWordsForRound(count) {
    // Sort words by wrong answers (descending) to prioritize words needing practice
    const sortedWords = [...gameState.words].sort((a, b) => {
        const scoreA = a.wrong - a.correct;
        const scoreB = b.wrong - b.correct;
        return scoreB - scoreA;
    });
    
    // Take requested count
    return sortedWords.slice(0, Math.min(count, gameState.words.length));
}

function displayGameBoard(cards) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = cards.map((card, index) => `
        <div class="game-card" data-index="${index}" data-pair-id="${card.pairId}" data-id="${card.id}" onclick="selectCard(${index})">
            ${card.value}
        </div>
    `).join('');
}

function selectCard(index) {
    const cards = document.querySelectorAll('.game-card');
    const card = cards[index];
    
    // Ignore if already selected, matched, or checking
    if (card.classList.contains('selected') || 
        card.classList.contains('matched') || 
        gameState.selectedCards.length >= 2) {
        return;
    }
    
    // Select card
    card.classList.add('selected');
    gameState.selectedCards.push({
        index: index,
        pairId: parseInt(card.dataset.pairId),
        id: parseInt(card.dataset.id),
        element: card
    });
    
    // Check for match when 2 cards selected
    if (gameState.selectedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    const [card1, card2] = gameState.selectedCards;
    
    if (card1.pairId === card2.pairId) {
        // Correct match!
        handleCorrectMatch(card1, card2);
    } else {
        // Wrong match
        handleWrongMatch(card1, card2);
    }
    
    gameState.selectedCards = [];
}

function handleCorrectMatch(card1, card2) {
    // Mark as matched
    card1.element.classList.remove('selected');
    card2.element.classList.remove('selected');
    card1.element.classList.add('correct');
    card2.element.classList.add('correct');
    
    setTimeout(() => {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
    }, 500);
    
    gameState.matchedPairs.push(card1.pairId);
    
    // Update word stats
    const word = gameState.words.find(w => w.id === card1.id);
    if (word) {
        word.correct++;
        word.lastPracticed = Date.now();
    }
    
    // Update score and combo
    gameState.combo++;
    const points = 100 + (gameState.combo * 50);
    gameState.score += points;
    userData.points += points;
    userData.coins += 10 + (gameState.combo * 5);
    userData.correctMatches++;
    
    // Show message
    showGameMessage(`🎉 Perfect Match! +${points} points! 🔥${gameState.combo}`);
    
    // Particles
    createParticles('⭐🎉💫', 10);
    
    saveData();
    updateGameUI();
    
    // Check if round complete
    if (gameState.matchedPairs.length === gameState.roundWords.length) {
        setTimeout(() => {
            completeRound();
        }, 1500);
    }
}

function handleWrongMatch(card1, card2) {
    // Mark as wrong
    card1.element.classList.remove('selected');
    card2.element.classList.remove('selected');
    card1.element.classList.add('wrong');
    card2.element.classList.add('wrong');
    
    setTimeout(() => {
        card1.element.classList.remove('wrong');
        card2.element.classList.remove('wrong');
    }, 500);
    
    // Update word stats (both words involved get marked as wrong)
    [card1.id, card2.id].forEach(id => {
        const word = gameState.words.find(w => w.id === id);
        if (word) {
            word.wrong++;
            word.lastPracticed = Date.now();
        }
    });
    
    // Reset combo
    gameState.combo = 0;
    userData.wrongMatches++;
    
    // Show message
    showGameMessage('❌ Try again!');
    
    saveData();
    updateGameUI();
}

function showGameMessage(message) {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = message;
    messageEl.style.animation = 'none';
    setTimeout(() => {
        messageEl.style.animation = 'fadeIn 0.3s ease';
    }, 10);
}

function completeRound() {
    const bonus = gameState.combo * 100;
    gameState.score += bonus;
    userData.points += bonus;
    
    showGameMessage(`🏆 Round ${gameState.currentRound} Complete! Bonus: +${bonus} points!`);
    createParticles('🏆🎊✨', 15);
    
    checkLevelUp();
    saveData();
    updateGameUI();
    
    gameState.currentRound++;
    
    setTimeout(() => {
        startNewRound();
    }, 2500);
}

function endGame() {
    saveData();
    showScreen('menu-screen');
    showGameMessage('');
}

function updateGameUI() {
    document.getElementById('round-number').textContent = gameState.currentRound;
    document.getElementById('game-score').textContent = gameState.score;
    document.getElementById('combo').textContent = gameState.combo;
    updateUI();
}

// Statistics
function displayStats() {
    document.getElementById('total-games').textContent = userData.totalGames;
    document.getElementById('correct-matches').textContent = userData.correctMatches;
    document.getElementById('wrong-matches').textContent = userData.wrongMatches;
    
    const total = userData.correctMatches + userData.wrongMatches;
    const accuracy = total > 0 ? Math.round((userData.correctMatches / total) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    
    // Display words needing practice
    const practiceWords = document.getElementById('practice-words');
    const needPractice = gameState.words
        .filter(w => w.wrong > w.correct)
        .sort((a, b) => (b.wrong - b.correct) - (a.wrong - a.correct))
        .slice(0, 10);
    
    if (needPractice.length === 0) {
        practiceWords.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Great job! No words need extra practice! 🎉</p>';
    } else {
        practiceWords.innerHTML = needPractice.map(word => `
            <div class="practice-word-item">
                <span><strong>${word.word}</strong> - ${word.meaning}</span>
                <span style="color: #f44336;">❌ ${word.wrong} | ✅ ${word.correct}</span>
            </div>
        `).join('');
    }
}

// Level System
function checkLevelUp() {
    const pointsPerLevel = 1000;
    const newLevel = Math.floor(userData.points / pointsPerLevel) + 1;
    
    if (newLevel > userData.level) {
        userData.level = newLevel;
        showGameMessage(`🎊 LEVEL UP! You're now Level ${userData.level}!`);
        createParticles('🎊🌟💎', 20);
        saveData();
        updateUI();
    }
}

// Animations
function createParticles(emojis, count) {
    const container = document.getElementById('particle-container');
    // Split emojis properly (they may be multi-character)
    const emojiArray = Array.from(emojis);
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojiArray[Math.floor(Math.random() * emojiArray.length)];
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
}

// Utility Functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
