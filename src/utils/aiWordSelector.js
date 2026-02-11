/**
 * AI-Powered Word Selection System
 * 
 * This module implements intelligent word selection algorithms inspired by
 * cognitive science and spaced repetition research. All processing is done
 * locally to keep the application lightweight.
 * 
 * Key algorithms:
 * 1. Spaced Repetition (SM-2 inspired)
 * 2. Forgetting Curve (Ebbinghaus model)
 * 3. Difficulty Estimation
 * 4. Learning Velocity Tracking
 */

/**
 * Calculate the forgetting curve value for a word
 * Based on Ebbinghaus forgetting curve: R = e^(-t/S)
 * where R = retention, t = time since last review, S = stability (based on mastery)
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {number} - Retention probability (0-1)
 */
export const calculateRetention = (word) => {
  if (!word.lastPracticed) {
    return 0; // Never practiced = needs review
  }

  const hoursSinceLastPractice = (Date.now() - word.lastPracticed) / (1000 * 60 * 60);
  const masteryScore = word.masteryScore || 0;
  
  // Stability increases with mastery (hours until 50% retention)
  // Low mastery: review after 1-2 hours, High mastery: review after 24-48 hours
  const stability = 1 + (masteryScore / 100) * 47; // 1-48 hours
  
  // Forgetting curve: R = e^(-t/S)
  const retention = Math.exp(-hoursSinceLastPractice / stability);
  
  return Math.max(0, Math.min(1, retention));
};

/**
 * Calculate the optimal next review time based on spaced repetition
 * Inspired by SuperMemo SM-2 algorithm
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {number} - Hours until next optimal review
 */
export const calculateNextReviewInterval = (word) => {
  const consecutiveCorrect = word.consecutiveCorrect || 0;
  const masteryScore = word.masteryScore || 0;
  
  // Base intervals (in hours) for each repetition
  const intervals = [0.1, 0.5, 1, 3, 8, 24, 48, 96]; // Up to 4 days
  
  // Get interval based on consecutive correct answers
  let interval = intervals[Math.min(consecutiveCorrect, intervals.length - 1)];
  
  // Adjust based on mastery score
  const masteryFactor = 0.5 + (masteryScore / 100) * 1.5; // 0.5 to 2.0
  interval *= masteryFactor;
  
  return interval;
};

/**
 * Estimate the difficulty of a word based on user performance
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {number} - Difficulty score (0-100, higher = more difficult)
 */
export const estimateDifficulty = (word) => {
  const totalAttempts = (word.correct || 0) + (word.wrong || 0);
  
  if (totalAttempts === 0) {
    return 50; // Unknown difficulty
  }
  
  const errorRate = (word.wrong || 0) / totalAttempts;
  
  // Check for recent failures (if currently on a wrong streak)
  const recentFailureBoost = (word.consecutiveCorrect === 0 && (word.wrong || 0) > 0) ? 30 : 0;
  
  // Difficulty factors:
  // 1. Error rate (70% weight)
  // 2. Recent failures (30% boost)
  const difficulty = (errorRate * 70) + recentFailureBoost;
  
  return Math.round(Math.max(0, Math.min(100, difficulty)));
};

/**
 * Calculate learning velocity - how quickly the user is mastering this word
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {number} - Velocity score (-100 to 100, positive = improving)
 */
export const calculateLearningVelocity = (word) => {
  const totalAttempts = (word.correct || 0) + (word.wrong || 0);
  
  if (totalAttempts < 3) {
    return 0; // Not enough data
  }
  
  const masteryScore = word.masteryScore || 0;
  const consecutiveCorrect = word.consecutiveCorrect || 0;
  
  // Positive indicators
  let velocity = consecutiveCorrect * 20; // Each consecutive correct adds 20
  velocity += (masteryScore - 50); // Above 50% mastery adds positive velocity
  
  // Negative indicators
  if (word.wrong > word.correct) {
    velocity -= 30; // More wrongs than rights is negative
  }
  
  return Math.max(-100, Math.min(100, velocity));
};

/**
 * Calculate priority score for word selection
 * Higher score = higher priority for review
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {number} - Priority score (0-1000)
 */
export const calculatePriority = (word) => {
  // Get various factors
  const retention = calculateRetention(word);
  const difficulty = estimateDifficulty(word);
  const masteryScore = word.masteryScore || 0;
  const hoursSinceLastPractice = word.lastPracticed 
    ? (Date.now() - word.lastPracticed) / (1000 * 60 * 60)
    : 1000;
  
  // Priority calculation weights:
  // 1. Low retention = high priority (40%)
  // 2. High difficulty = high priority (30%)
  // 3. Low mastery = high priority (20%)
  // 4. Overdue for review = high priority (10%)
  
  const retentionPriority = (1 - retention) * 400; // 0-400 points
  const difficultyPriority = (difficulty / 100) * 300; // 0-300 points
  const masteryPriority = (1 - masteryScore / 100) * 200; // 0-200 points
  
  // Check if word is overdue for review based on spaced repetition intervals
  const nextReviewInterval = calculateNextReviewInterval(word);
  const isOverdue = hoursSinceLastPractice > nextReviewInterval;
  const overduePriority = isOverdue ? 100 : 0; // 0-100 points
  
  const totalPriority = retentionPriority + difficultyPriority + masteryPriority + overduePriority;
  
  return Math.round(totalPriority);
};

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Weighted random sampling across the entire word pool.
 * Each word's selection probability is proportional to its weight,
 * ensuring words from beginning, middle, and end of the pool all get a chance.
 * 
 * @param {Array} items - Array of items with a 'weight' property
 * @param {number} count - Number of items to select
 * @returns {Array} - Selected items
 */
const weightedRandomSample = (items, count) => {
  if (items.length <= count) return [...items];
  
  const selected = [];
  const remaining = [...items];
  let totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
  
  for (let i = 0; i < count && remaining.length > 0; i++) {
    let random = Math.random() * totalWeight;
    
    let chosenIndex = 0;
    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        chosenIndex = j;
        break;
      }
    }
    
    totalWeight -= remaining[chosenIndex].weight;
    selected.push(remaining[chosenIndex]);
    remaining.splice(chosenIndex, 1);
  }
  
  return selected;
};

/**
 * Select words intelligently for the next game session
 * Uses weighted random sampling across the entire word pool to ensure
 * words from throughout the topic (beginning, middle, end) are shown,
 * while still giving higher probability to words that need review.
 * 
 * @param {Array} allWords - Array of all available word objects
 * @param {number} count - Number of words to select
 * @param {Object} options - Additional options
 * @returns {Array} - Selected words shuffled for display
 */
export const selectWordsForSession = (allWords, count, options = {}) => {
  const {
    includeNew = true, // Include never-practiced words
    balanceChallenge = true, // Mix difficult and easier words
    maxDifficulty = 100, // Maximum difficulty to include
  } = options;
  
  if (allWords.length === 0) {
    return [];
  }
  
  // Calculate priority for each word
  const wordsWithPriority = allWords.map(word => ({
    word,
    priority: calculatePriority(word),
    difficulty: estimateDifficulty(word),
    retention: calculateRetention(word),
    masteryScore: word.masteryScore || 0,
  }));
  
  // Filter by difficulty if needed
  const filtered = wordsWithPriority.filter(w => w.difficulty <= maxDifficulty);
  
  if (filtered.length === 0) {
    return [];
  }
  
  const selectedCount = Math.min(count, filtered.length);
  
  // Weighted random sampling across the entire word pool:
  // Priority acts as weight so higher-priority words are more likely to be picked,
  // but words from anywhere in the pool can be selected (beginning, middle, end).
  // A base weight ensures even low-priority words have a chance to appear.
  const maxPriority = Math.max(...filtered.map(w => w.priority), 1);
  const baseWeight = maxPriority * 0.15; // Minimum 15% of max priority as base chance
  const weighted = filtered.map(w => ({
    ...w,
    weight: w.priority + baseWeight,
  }));
  
  const selected = weightedRandomSample(weighted, selectedCount);
  
  // Shuffle using Fisher-Yates to avoid predictable patterns
  const shuffled = shuffleArray(selected);
  
  return shuffled.map(w => w.word);
};

/**
 * Get learning insights for a word
 * Provides human-readable insights about word learning status
 * 
 * @param {Object} word - The word object with learning stats
 * @returns {Object} - Insights object with recommendations
 */
export const getWordInsights = (word) => {
  const retention = calculateRetention(word);
  const difficulty = estimateDifficulty(word);
  const velocity = calculateLearningVelocity(word);
  const nextReview = calculateNextReviewInterval(word);
  const masteryScore = word.masteryScore || 0;
  
  // Determine status
  let status = 'learning';
  let recommendation = 'Keep practicing!';
  let emoji = '📚';
  
  if (masteryScore >= 80) {
    status = 'mastered';
    recommendation = 'Great job! Review occasionally.';
    emoji = '⭐';
  } else if (masteryScore >= 60) {
    status = 'familiar';
    recommendation = 'Almost there! Keep going.';
    emoji = '📈';
  } else if (difficulty >= 70) {
    status = 'challenging';
    recommendation = 'This word needs extra attention.';
    emoji = '🎯';
  } else if (!word.lastPracticed) {
    status = 'new';
    recommendation = 'Time to learn this word!';
    emoji = '✨';
  }
  
  return {
    status,
    recommendation,
    emoji,
    retention: Math.round(retention * 100),
    difficulty: Math.round(difficulty),
    velocity: Math.round(velocity),
    nextReviewHours: Math.round(nextReview),
    masteryScore,
  };
};

/**
 * Analyze session performance and provide feedback
 * 
 * @param {Array} sessionWords - Words practiced in the session
 * @param {Object} sessionStats - Session statistics (correct, wrong, etc.)
 * @returns {Object} - Session analysis with recommendations
 */
export const analyzeSession = (sessionWords, sessionStats) => {
  if (sessionWords.length === 0) {
    return {
      feedback: 'No words practiced yet',
      nextSteps: ['Start practicing to see insights'],
      avgDifficulty: 0,
      avgMastery: 0,
      accuracy: 0,
    };
  }
  
  const totalWords = sessionWords.length;
  const avgDifficulty = sessionWords.reduce((sum, w) => sum + estimateDifficulty(w), 0) / totalWords;
  const avgMastery = sessionWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0) / totalWords;
  
  const totalAttempts = (sessionStats.correct || 0) + (sessionStats.wrong || 0);
  
  // Handle case where no attempts were made
  if (totalAttempts === 0) {
    return {
      feedback: 'No matches attempted yet',
      nextSteps: ['Start matching words'],
      avgDifficulty: Math.round(avgDifficulty),
      avgMastery: Math.round(avgMastery),
      accuracy: 0,
    };
  }
  
  const accuracy = sessionStats.correct / totalAttempts;
  
  let feedback = '';
  let nextSteps = [];
  
  if (accuracy >= 0.9) {
    feedback = 'Excellent work! 🌟';
    nextSteps.push('Ready for more challenging words');
  } else if (accuracy >= 0.7) {
    feedback = 'Good progress! 👍';
    nextSteps.push('Keep practicing these words');
  } else {
    feedback = 'Keep trying! 💪';
    nextSteps.push('Focus on difficult words');
    nextSteps.push('Review word meanings before playing');
  }
  
  return {
    feedback,
    nextSteps,
    avgDifficulty: Math.round(avgDifficulty),
    avgMastery: Math.round(avgMastery),
    accuracy: Math.round(accuracy * 100),
  };
};

export default {
  calculateRetention,
  calculateNextReviewInterval,
  estimateDifficulty,
  calculateLearningVelocity,
  calculatePriority,
  selectWordsForSession,
  getWordInsights,
  analyzeSession,
};
