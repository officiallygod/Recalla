import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  WORDS: 'recalla_words',
  USER_DATA: 'recalla_user_data',
  TOPICS: 'recalla_topics'
};

// Counter to ensure unique IDs even when Date.now() returns the same value
let idCounter = 0;

const generateUniqueId = () => {
  // Simple approach: timestamp plus incrementing counter
  // This guarantees uniqueness even when Date.now() returns the same value
  // Note: Counter resets when page reloads, which is acceptable since
  // Date.now() will have advanced, ensuring no collisions with existing IDs
  return Date.now() + idCounter++;
};

export const GameProvider = ({ children }) => {
  const [words, setWords] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userData, setUserData] = useState({
    points: 0,
    coins: 0,
    level: 1,
    totalGames: 0,
    correctMatches: 0,
    wrongMatches: 0
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedWords = localStorage.getItem(STORAGE_KEYS.WORDS);
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);

    if (storedWords) {
      const parsedWords = JSON.parse(storedWords);
      // Migrate existing words to include new fields
      const migratedWords = parsedWords.map(word => ({
        ...word,
        masteryScore: word.masteryScore ?? 0,
        consecutiveCorrect: word.consecutiveCorrect ?? 0
      }));
      setWords(migratedWords);
    }
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    if (storedTopics) {
      setTopics(JSON.parse(storedTopics));
    }
    setIsInitialized(true);
  }, []);

  // Save data to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
    }
  }, [words, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    }
  }, [userData, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
    }
  }, [topics, isInitialized]);

  // Add a word to the vocabulary, optionally associated with a topic
  // topicId: The ID of the topic to associate this word with, or null for general words
  const addWord = useCallback((word, meaning, topicId = null) => {
    const newWord = {
      id: generateUniqueId(),
      word,
      meaning,
      topicId,
      correct: 0,
      wrong: 0,
      lastPracticed: null,
      masteryScore: 0, // 0-100, higher = better mastery
      consecutiveCorrect: 0 // Track consecutive correct answers
    };
    
    setWords(prev => [...prev, newWord]);
    
    // Award minimal points - No coins for adding words
    setUserData(prev => ({
      ...prev,
      points: prev.points + 5,
      coins: prev.coins + 0
    }));

    return newWord;
  }, []);

  const deleteWord = useCallback((id) => {
    // Safety check: ensure id is provided
    if (id === undefined || id === null) {
      console.error('deleteWord called with invalid id:', id);
      return;
    }
    setWords(prev => prev.filter(w => w.id !== id));
  }, []);

  const updateWordStats = useCallback((id, isCorrect) => {
    setWords(prev => prev.map(w => {
      if (w.id === id) {
        const newConsecutiveCorrect = isCorrect ? (w.consecutiveCorrect || 0) + 1 : 0;
        const totalAttempts = (w.correct || 0) + (w.wrong || 0) + 1;
        const correctCount = isCorrect ? (w.correct || 0) + 1 : (w.correct || 0);
        
        // Calculate mastery score (0-100)
        // Based on: accuracy (60%), consecutive correct (30%), total practice (10%)
        const MASTERY_CONSECUTIVE_THRESHOLD = 5; // Max consecutive correct for full bonus
        const MASTERY_PRACTICE_THRESHOLD = 20; // Total attempts needed for full practice bonus
        const MASTERY_MIN_PRACTICE_THRESHOLD = 5; // Minimum attempts before removing practice penalty
        
        // Calculate accuracy with better precision
        const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) : 0;
        const consecutiveBonus = Math.min(newConsecutiveCorrect / MASTERY_CONSECUTIVE_THRESHOLD, 1);
        const practiceBonus = Math.min(totalAttempts / MASTERY_PRACTICE_THRESHOLD, 1);
        
        // Apply a penalty for low practice count to prevent inflated scores
        // Words with <5 attempts get penalized to encourage more practice
        const practicePenalty = totalAttempts < MASTERY_MIN_PRACTICE_THRESHOLD ? (totalAttempts / MASTERY_MIN_PRACTICE_THRESHOLD) : 1;
        
        const masteryScore = Math.round(
          (accuracy * 60 + consecutiveBonus * 30 + practiceBonus * 10) * practicePenalty
        );
        
        return {
          ...w,
          correct: isCorrect ? w.correct + 1 : w.correct,
          wrong: !isCorrect ? w.wrong + 1 : w.wrong,
          lastPracticed: Date.now(),
          consecutiveCorrect: newConsecutiveCorrect,
          masteryScore: masteryScore
        };
      }
      return w;
    }));
  }, []);

  const checkLevelUp = useCallback(() => {
    // Make leveling more gradual with progressive difficulty
    // Level 1->2: 2500 points, Level 2->3: 5000 additional points, Level 3->4: 7500 additional points, etc.
    const pointsPerLevel = 2500;
    
    setUserData(prev => {
      let requiredPoints = 0;
      let level = 1;
      
      // Calculate level based on cumulative points requirement
      while (requiredPoints <= prev.points) {
        requiredPoints += pointsPerLevel * level;
        level++;
      }
      
      const newLevel = level - 1; // Subtract 1 because we went one level too far
      
      if (newLevel > prev.level) {
        return {
          ...prev,
          level: newLevel
        };
      }
      return prev;
    });
  }, []);

  const awardPoints = useCallback((points, coins, roundNumber = 0) => {
    // Only give coins starting at round 50 and beyond
    const shouldAwardCoins = roundNumber >= 50;
    
    setUserData(prev => ({
      ...prev,
      points: prev.points + points,
      coins: prev.coins + (shouldAwardCoins ? coins : 0)
    }));
    
    // Check level up
    checkLevelUp();
  }, [checkLevelUp]);

  const recordMatch = useCallback((isCorrect) => {
    setUserData(prev => ({
      ...prev,
      correctMatches: isCorrect ? prev.correctMatches + 1 : prev.correctMatches,
      wrongMatches: !isCorrect ? prev.wrongMatches + 1 : prev.wrongMatches
    }));
  }, []);

  const incrementGamesPlayed = useCallback(() => {
    setUserData(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1
    }));
  }, []);

  // Topic management functions
  const addTopic = useCallback((name, emoji = '📚') => {
    const newTopic = {
      id: generateUniqueId(),
      name,
      emoji,
      createdAt: Date.now()
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  }, []);

  const updateTopic = useCallback((id, updates) => {
    setTopics(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const deleteTopic = useCallback((id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    // Also delete all words in this topic
    setWords(prev => prev.filter(w => w.topicId !== id));
  }, []);

  const exportTopic = useCallback((topicId) => {
    const topic = topics.find(t => t.id === topicId);
    const topicWords = words.filter(w => w.topicId === topicId);
    
    if (!topic) return null;
    
    return {
      topic,
      words: topicWords,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }, [topics, words]);

  const importTopic = useCallback((data) => {
    try {
      if (!data.topic || !data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid topic data format');
      }

      // Create new IDs to avoid conflicts
      const newTopicId = generateUniqueId();
      const newTopic = {
        ...data.topic,
        id: newTopicId,
        createdAt: Date.now()
      };

      // Import words with new IDs and updated topicId
      const newWords = data.words.map((word) => ({
        ...word,
        id: generateUniqueId(),
        topicId: newTopicId
      }));

      setTopics(prev => [...prev, newTopic]);
      setWords(prev => [...prev, ...newWords]);

      return { success: true, topic: newTopic };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const getWordsByTopic = useCallback((topicId) => {
    return words.filter(w => w.topicId === topicId);
  }, [words]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    words,
    topics,
    userData,
    addWord,
    deleteWord,
    updateWordStats,
    awardPoints,
    recordMatch,
    incrementGamesPlayed,
    checkLevelUp,
    addTopic,
    updateTopic,
    deleteTopic,
    exportTopic,
    importTopic,
    getWordsByTopic
  }), [words, topics, userData, addWord, deleteWord, updateWordStats, awardPoints, 
       recordMatch, incrementGamesPlayed, checkLevelUp, addTopic, updateTopic, 
       deleteTopic, exportTopic, importTopic, getWordsByTopic]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
