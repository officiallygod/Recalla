import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedWords = localStorage.getItem(STORAGE_KEYS.WORDS);
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);

    if (storedWords) {
      setWords(JSON.parse(storedWords));
    }
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    if (storedTopics) {
      setTopics(JSON.parse(storedTopics));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }, [topics]);

  // Add a word to the vocabulary, optionally associated with a topic
  // topicId: The ID of the topic to associate this word with, or null for general words
  const addWord = (word, meaning, topicId = null) => {
    const newWord = {
      id: Date.now(),
      word,
      meaning,
      topicId,
      correct: 0,
      wrong: 0,
      lastPracticed: null
    };
    
    setWords(prev => [...prev, newWord]);
    
    // Award points
    setUserData(prev => ({
      ...prev,
      points: prev.points + 10,
      coins: prev.coins + 5
    }));

    return newWord;
  };

  const deleteWord = (id) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const updateWordStats = (id, isCorrect) => {
    setWords(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          correct: isCorrect ? w.correct + 1 : w.correct,
          wrong: !isCorrect ? w.wrong + 1 : w.wrong,
          lastPracticed: Date.now()
        };
      }
      return w;
    }));
  };

  const awardPoints = (points, coins) => {
    setUserData(prev => ({
      ...prev,
      points: prev.points + points,
      coins: prev.coins + coins
    }));
    
    // Check level up
    checkLevelUp();
  };

  const checkLevelUp = () => {
    const pointsPerLevel = 1000;
    const newLevel = Math.floor(userData.points / pointsPerLevel) + 1;
    
    if (newLevel > userData.level) {
      setUserData(prev => ({
        ...prev,
        level: newLevel
      }));
      return true;
    }
    return false;
  };

  const recordMatch = (isCorrect) => {
    setUserData(prev => ({
      ...prev,
      correctMatches: isCorrect ? prev.correctMatches + 1 : prev.correctMatches,
      wrongMatches: !isCorrect ? prev.wrongMatches + 1 : prev.wrongMatches
    }));
  };

  const incrementGamesPlayed = () => {
    setUserData(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1
    }));
  };

  // Topic management functions
  const addTopic = (name, emoji = '📚') => {
    const newTopic = {
      id: Date.now(),
      name,
      emoji,
      createdAt: Date.now()
    };
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  };

  const updateTopic = (id, updates) => {
    setTopics(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTopic = (id) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    // Also delete all words in this topic
    setWords(prev => prev.filter(w => w.topicId !== id));
  };

  const exportTopic = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    const topicWords = words.filter(w => w.topicId === topicId);
    
    if (!topic) return null;
    
    return {
      topic,
      words: topicWords,
      exportedAt: Date.now(),
      version: '1.0'
    };
  };

  const importTopic = (data) => {
    try {
      if (!data.topic || !data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid topic data format');
      }

      // Create new IDs to avoid conflicts
      const newTopicId = Date.now();
      const newTopic = {
        ...data.topic,
        id: newTopicId,
        createdAt: Date.now()
      };

      // Import words with new IDs and updated topicId
      const newWords = data.words.map((word, index) => ({
        ...word,
        id: Date.now() + index + 1,
        topicId: newTopicId
      }));

      setTopics(prev => [...prev, newTopic]);
      setWords(prev => [...prev, ...newWords]);

      return { success: true, topic: newTopic };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getWordsByTopic = (topicId) => {
    return words.filter(w => w.topicId === topicId);
  };

  const value = {
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
