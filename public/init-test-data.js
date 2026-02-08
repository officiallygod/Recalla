// Initialize test data for the game
// This script should be loaded before React app initializes
(function() {
  // Only load test data if running in dev mode and no words exist
  const existingWords = localStorage.getItem('recalla_words');
  const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (isDevMode && (!existingWords || existingWords === '[]')) {
    const germanWords = [
      { word: "bereits", meaning: "already" },
      { word: "besonders", meaning: "especially" },
      { word: "bestimmt", meaning: "certainly" },
      { word: "Bewegung", meaning: "movement" },
      { word: "Blick", meaning: "glance/view" },
      { word: "Chance", meaning: "chance" },
      { word: "eigentlich", meaning: "actually" },
      { word: "einzeln", meaning: "individual" },
      { word: "entscheiden", meaning: "to decide" },
      { word: "Erfahrung", meaning: "experience" }
    ];
    
    const topicId = 1739006000000;
    const newWords = germanWords.map((w, i) => ({
      id: topicId + i + 1,
      word: w.word,
      meaning: w.meaning,
      topicId: topicId,
      correct: 0,
      wrong: 0,
      lastPracticed: null,
      masteryScore: 0,
      consecutiveCorrect: 0
    }));
    
    localStorage.setItem('recalla_words', JSON.stringify(newWords));
    
    const topics = [{
      id: topicId,
      name: "German Words",
      emoji: "🇩🇪",
      createdAt: topicId
    }];
    localStorage.setItem('recalla_topics', JSON.stringify(topics));
    
    console.log('[TEST DATA] Loaded', newWords.length, 'test words');
  }
})();
