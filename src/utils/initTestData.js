// Initialize test data for the game
// This script should be loaded before React app initializes
(function() {
  // Only load test data if running in dev mode
  const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isDevMode) return;

  const STORAGE_KEY = 'recalla-content-storage';
  const existingStorage = localStorage.getItem(STORAGE_KEY);

  let hasWords = false;
  if (existingStorage) {
    try {
      const parsed = JSON.parse(existingStorage);
      if (parsed.state && parsed.state.words && parsed.state.words.length > 0) {
        hasWords = true;
      }
    } catch (e) {
      console.error('Error parsing storage for test data check', e);
    }
  }

  if (!hasWords) {
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
      { word: "Erfahrung", meaning: "experience" },
      { word: "Erfolg", meaning: "success" },
      { word: "erreichen", meaning: "to reach" },
      { word: "Gedanke", meaning: "thought" },
      { word: "Gefühl", meaning: "feeling" },
      { word: "Gelegenheit", meaning: "opportunity" },
      { word: "Geschichte", meaning: "story/history" },
      { word: "Gewalt", meaning: "violence/force" },
      { word: "Grund", meaning: "reason" }
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
    
    const topics = [{
      id: topicId,
      name: "German Words",
      emoji: "🇩🇪",
      createdAt: topicId
    }];
    
    const newState = {
      state: {
        words: newWords,
        topics: topics
      },
      version: 0
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

    console.log('[TEST DATA] Loaded', newWords.length, 'test words into Zustand storage');
  }
})();
