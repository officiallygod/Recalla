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
  const consecutiveFails = word.consecutiveCorrect === 0 && word.wrong > 0 ? 1 : 0;
  
  // Difficulty factors:
  // 1. Error rate (70% weight)
  // 2. Recent failures (30% weight)
  const difficulty = (errorRate * 70) + (consecutiveFails * 30);
  
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
  const nextReviewInterval = calculateNextReviewInterval(word);
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
  
  // Check if word is overdue for review
  const isOverdue = hoursSinceLastPractice > nextReviewInterval;
  const overduePriority = isOverdue ? 100 : 0; // 0-100 points
  
  const totalPriority = retentionPriority + difficultyPriority + masteryPriority + overduePriority;
  
  return Math.round(totalPriority);
};

/**
 * Select words intelligently for the next game session
 * Uses AI-inspired algorithms to optimize learning
 * 
 * @param {Array} allWords - Array of all available word objects
 * @param {number} count - Number of words to select
 * @param {Object} options - Additional options
 * @returns {Array} - Selected words sorted by priority
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
  
  // Sort by priority (highest first)
  const sorted = filtered.sort((a, b) => b.priority - a.priority);
  
  if (!balanceChallenge) {
    // Just return top priority words
    return sorted.slice(0, count).map(w => w.word);
  }
  
  // Balance selection: mix high-priority (difficult) with some easier words
  const selectedCount = Math.min(count, sorted.length);
  const highPriorityCount = Math.ceil(selectedCount * 0.7); // 70% difficult
  const easierCount = selectedCount - highPriorityCount; // 30% easier
  
  const highPriority = sorted.slice(0, highPriorityCount);
  const easier = sorted.slice(-easierCount).reverse(); // Take from end (lower priority)
  
  // Combine and shuffle to avoid predictable patterns
  const selected = [...highPriority, ...easier];
  const shuffled = selected.sort(() => Math.random() - 0.5);
  
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
  const totalWords = sessionWords.length;
  const avgDifficulty = sessionWords.reduce((sum, w) => sum + estimateDifficulty(w), 0) / totalWords;
  const avgMastery = sessionWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0) / totalWords;
  
  const accuracy = sessionStats.correct / (sessionStats.correct + sessionStats.wrong);
  
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
