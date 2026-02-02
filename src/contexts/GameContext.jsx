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
  USER_DATA: 'recalla_user_data'
};

export const GameProvider = ({ children }) => {
  const [words, setWords] = useState([]);
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

    if (storedWords) {
      setWords(JSON.parse(storedWords));
    }
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, [userData]);

  const addWord = (word, meaning) => {
    const newWord = {
      id: Date.now(),
      word,
      meaning,
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

  const value = {
    words,
    userData,
    addWord,
    deleteWord,
    updateWordStats,
    awardPoints,
    recordMatch,
    incrementGamesPlayed,
    checkLevelUp
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
