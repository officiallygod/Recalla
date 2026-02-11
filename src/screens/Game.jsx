import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { selectWordsForSession, estimateDifficulty } from '../utils/aiWordSelector';
import { hapticSuccess, hapticError } from '../utils/haptic';
import gameOverCelebration from '../assets/gameOverCelebration.json';

// Lazy load Confetti component as it's only used on match success
const Confetti = lazy(() => import('../components/Confetti'));

// Coin reward constants - kept very small (< 10) as per requirements
const COIN_REWARDS = {
  MATCH: {
    BASE: 1,           // Base coins per match
    COMBO_DIVISOR: 3,  // Combo count divided by this for bonus
    MAX: 5             // Maximum coins per match
  },
  ROUND: {
    BASE: 5,           // Base coins for completing a round
    COMBO_DIVISOR: 2,  // Combo count divided by this for bonus
    MAX: 9             // Maximum coins per round
  }
};

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { words, topics, updateWordStats, awardPoints, recordMatch, incrementGamesPlayed, getWordsByTopic } = useGame();
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);
  
  // Get timer duration and difficulty from location state
  const initialTimerDuration = location.state?.timerDuration || 30;
  const difficulty = location.state?.difficulty || 'easy'; // 'easy' or 'hard'
  const isInfiniteMode = location.state?.isInfiniteMode || false;
  
  // Calculate cards per round based on difficulty
  // Easy: 2 rows × 4 columns = 8 cards (4 pairs)
  // Hard: 4 rows × 4 columns = 16 cards (8 pairs)
  const CARDS_PER_ROUND = difficulty === 'easy' ? 4 : 8;
  
  // Get words for the game - if a topic is selected, use only that topic's words
  // If no topic is selected, use words that have a topicId (ensuring words are grouped by topic)
  const gameWords = useMemo(() => 
    selectedTopic 
      ? getWordsByTopic(selectedTopic) 
      : words.filter(w => w.topicId != null),
    [selectedTopic, getWordsByTopic, words]
  );
  
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState([]);
  const [availableWords, setAvailableWords] = useState([]); // Pool of words not currently shown
  const [activeWordIds, setActiveWordIds] = useState([]); // Words currently on screen
  const [shownWordIds, setShownWordIds] = useState([]); // Track all words shown in this session
  const [timer, setTimer] = useState(initialTimerDuration);
  const [timerDuration, setTimerDuration] = useState(initialTimerDuration); // Store the timer duration for resets
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalRound, setFinalRound] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [sessionStart, setSessionStart] = useState(() => Date.now());
  const [bestCombo, setBestCombo] = useState(0);

  // Fisher-Yates shuffle for proper randomization
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  useEffect(() => {
    if (gameWords.length < CARDS_PER_ROUND * 2) {
      navigate('/');
      return;
    }
    incrementGamesPlayed();
    startNewRound();
    
    // Start the timer only if not in infinite mode
    if (!isInfiniteMode) {
      setIsTimerActive(true);
    }
  }, [selectedTopic, gameWords.length]);

  // Timer effect - count down from timerDuration seconds, stop game when timer expires
  // Skip timer logic completely in infinite mode
  useEffect(() => {
    if (isInfiniteMode || !isTimerActive || gameOver) return;
    
    if (timer <= 0) {
      // Timer expired - end the game
      setGameOver(true);
      setIsTimerActive(false);
      setFinalScore(score);
      setFinalRound(round);
      setElapsedTime(Math.round((Date.now() - sessionStart) / 1000));
      return;
    }
    
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, isTimerActive, gameOver, score, round, isInfiniteMode, sessionStart]);

  const createParticles = (x, y, isCorrect) => {
    const colors = isCorrect 
      ? ['#10b981', '#34d399', '#6ee7b7'] 
      : ['#ef4444', '#f87171', '#fca5a5'];
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (Math.PI * 2 * i) / 12,
      velocity: 2 + Math.random() * 2,
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const resetForNewSession = () => {
    incrementGamesPlayed();
    setGameOver(false);
    setSessionCoins(0);
    setSessionStart(Date.now());
    setElapsedTime(0);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setRound(1);
    setTimer(timerDuration);
    setMatchedPairs([]);
    setSelectedCards([]);
    setMessage('Match words with their meanings! ✨');
    setShowConfetti(false);
    setParticles([]);
    startNewRound();
    if (!isInfiniteMode) {
      setIsTimerActive(true);
    }
  };

  // Replace matched cards with new words from the pool
  const replaceMatchedCards = (matchedPairId) => {
    if (availableWords.length === 0) {
      return; // No more words to add
    }
    
    // Get current shown words and filter for unseen words
    setShownWordIds(currentShownIds => {
      // Filter out words that have already been shown in this session
      const shownSet = new Set(currentShownIds);
      const unseenWords = availableWords.filter(w => !shownSet.has(w.id));
      
      if (unseenWords.length === 0) {
        return currentShownIds; // All available words have been shown
      }
      
      // Use AI selector to choose the next word with highest priority
      const selectedWords = selectWordsForSession(unseenWords, 1, {
        balanceChallenge: false, // Just get the highest priority word
        includeNew: true,
      });
      
      if (selectedWords.length === 0) {
        return currentShownIds;
      }
      
      const selectedWord = selectedWords[0];
      
      // Add minimal delay (200-600ms) for snappy feel
      const MIN_DELAY_MS = 200;
      const MAX_DELAY_MS = 600;
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      
      setTimeout(() => {
        setGameCards(prev => {
          // Find indices of matched cards - validate they still exist
          const matchedIndices = [];
          prev.forEach((card, idx) => {
            if (card.pairId === matchedPairId) {
              matchedIndices.push(idx);
            }
          });
          
          // If the matched pair no longer exists or has been replaced, abort
          if (matchedIndices.length !== 2) return prev;
          
          // Create new cards for the selected word
          const newPairId = Math.max(...prev.map(c => c.pairId)) + 1;
          const timestamp = Date.now();
          const newCards = [
            { type: 'word', value: selectedWord.word, id: selectedWord.id, pairId: newPairId, cardId: `${timestamp}-${newPairId}-word` },
            { type: 'meaning', value: selectedWord.meaning, id: selectedWord.id, pairId: newPairId, cardId: `${timestamp}-${newPairId}-meaning` }
          ];
          
          // Shuffle new cards using Fisher-Yates
          const shuffledNewCards = shuffleArray(newCards);
          
          // Replace matched cards with new ones
          const updated = [...prev];
          updated[matchedIndices[0]] = shuffledNewCards[0];
          updated[matchedIndices[1]] = shuffledNewCards[1];
          
          // Shuffle the entire board to randomize positions
          // This prevents the new words from appearing at predictable positions
          const shuffledBoard = shuffleArray(updated);
          
          return shuffledBoard;
        });
        
        // Update available words and active words
        setAvailableWords(prev => prev.filter(w => w.id !== selectedWord.id));
        setActiveWordIds(prev => [...prev, selectedWord.id]);
      }, delay);
      
      // Immediately mark word as shown to prevent duplicate selection in rapid matches
      return [...currentShownIds, selectedWord.id];
    });
  };

  const startNewRound = () => {
    // Use AI-powered word selection
    const selectedWords = selectWordsForSession(gameWords, CARDS_PER_ROUND, {
      includeNew: true,
      balanceChallenge: true, // Mix difficult and easier words for better learning
      maxDifficulty: 100,
    });
    
    if (selectedWords.length === 0) {
      navigate('/');
      return;
    }
    
    // Store available words (those not currently shown)
    const currentWordIds = selectedWords.map(w => w.id);
    setActiveWordIds(currentWordIds);
    setShownWordIds(currentWordIds); // Initialize shown words for the session
    setAvailableWords(gameWords.filter(w => !currentWordIds.includes(w.id)));

    // Create cards
    const cards = [];
    selectedWords.forEach((word, index) => {
      cards.push({ type: 'word', value: word.word, id: word.id, pairId: index, cardId: `${Date.now()}-${index}-word` });
      cards.push({ type: 'meaning', value: word.meaning, id: word.id, pairId: index, cardId: `${Date.now()}-${index}-meaning` });
    });

    // Shuffle cards using Fisher-Yates
    const shuffled = shuffleArray(cards);
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMessage('Match words with their meanings! ✨');
  };

  const handleCardClick = (index, event) => {
    // Don't allow any interactions if game is over
    if (gameOver) return;
    
    // Allow deselection - if card is already selected, deselect it
    if (selectedCards.includes(index)) {
      setSelectedCards(prev => prev.filter(i => i !== index));
      return;
    }
    
    // Don't allow selection of matched cards
    if (matchedPairs.includes(gameCards[index].pairId)) {
      return;
    }
    
    // Allow selection during checking animations - players can keep playing
    // If checking and there are already 2 cards selected, clear them first
    if (isChecking && selectedCards.length >= 2) {
      setSelectedCards([index]);
      setIsChecking(false);
      return;
    }
    
    // Only block if we already have 2 cards selected and not checking
    if (selectedCards.length >= 2) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setTimeout(() => checkMatch(newSelected, x, y), 300); // Faster check (was 500ms)
    }
  };

  const checkMatch = (selected, x, y) => {
    const [first, second] = selected;
    const card1 = gameCards[first];
    const card2 = gameCards[second];

    if (card1.pairId === card2.pairId) {
      // Trigger success haptic feedback
      hapticSuccess();
      
      // Correct match - both cards share the same word ID, update once
      setMatchedPairs(prev => [...prev, card1.pairId]);
      const newCombo = combo + 1;
      setCombo(newCombo);
      setBestCombo(prev => Math.max(prev, newCombo));
      
      // In infinite mode, don't award points or coins
      if (!isInfiniteMode) {
        // Harder rewards: Reduced points and coins significantly
        // Keep coin rewards very small (< 10) as per requirements
        const points = 50 + (newCombo * 25);
        const coinReward = Math.min(
          COIN_REWARDS.MATCH.BASE + Math.floor(newCombo / COIN_REWARDS.MATCH.COMBO_DIVISOR),
          COIN_REWARDS.MATCH.MAX
        );
        setSessionCoins(prev => prev + coinReward);
        setScore(prev => prev + points);
        awardPoints(points, coinReward, round);
        
        setMessage(`🎉 Perfect Match!${newCombo > 1 ? ` 🔥x${newCombo}` : ''}`);
      } else {
        // Infinite mode - just show the match message without points
        setMessage(`🎉 Perfect Match!${newCombo > 1 ? ` 🔥x${newCombo}` : ''}`);
      }
      
      createParticles(x, y, true);
      
      // Update stats once for the matched word
      updateWordStats(card1.id, true);
      recordMatch(true);

      // Check if round complete (all current pairs matched)
      const totalPairs = gameCards.length / 2;
      if (matchedPairs.length + 1 === totalPairs) {
        // If there are more words available, replace cards instead of ending round
        if (availableWords.length > 0) {
          setMessage('🎯 Keep going! New words incoming...');
          // Replace the matched pair with a new word
          replaceMatchedCards(card1.pairId);
        } else {
          // No more words, complete the round
          setShowConfetti(true);
          setIsTimerActive(false); // Pause timer during celebration
          const currentRound = round; // Capture current round before async operations
          setTimeout(() => {
            if (!isInfiniteMode) {
              // Harder round completion bonus
              // Keep coin bonus very small (< 10) as per requirements
              const bonus = newCombo * 50;
              const coinBonus = Math.min(
                COIN_REWARDS.ROUND.BASE + Math.floor(newCombo / COIN_REWARDS.ROUND.COMBO_DIVISOR),
                COIN_REWARDS.ROUND.MAX
              );
              setSessionCoins(prev => prev + coinBonus);
              awardPoints(bonus, coinBonus, currentRound);
              setMessage(`🏆 Round ${currentRound} Complete! Bonus: +${bonus} points!`);
            } else {
              setMessage(`🏆 Round ${currentRound} Complete!${newCombo > 1 ? ` 🔥x${newCombo}` : ''}`);
            }
            setRound(prev => prev + 1);
            if (!isInfiniteMode) {
              setTimer(timerDuration); // Reset timer for next round only in timed mode
            }
            setTimeout(() => {
              setShowConfetti(false);
              if (!isInfiniteMode) {
                setIsTimerActive(true); // Resume timer for next round only if not infinite mode
              }
              startNewRound();
            }, 1000); // Faster transition (was 2000ms)
          }, 500); // Faster confetti (was 1000ms)
        }
      } else {
        // Not all pairs matched yet, replace this pair if words available
        if (availableWords.length > 0) {
          replaceMatchedCards(card1.pairId);
        }
      }
    } else {
      // Trigger error haptic feedback
      hapticError();
      
      // Wrong match - Update both words' wrong counts since both were attempted
      // This ensures accurate mastery metrics
      setCombo(0);
      setMessage('❌ Try again! Keep matching!');
      createParticles(x, y, false);
      recordMatch(false);
      
      // Update stats for both words involved in the wrong match
      updateWordStats(card1.id, false);
      updateWordStats(card2.id, false);
    }

    // Faster reset for snappy gameplay and combo scoring
    setTimeout(() => {
      setSelectedCards([]);
      setIsChecking(false);
    }, 600); // Faster reset (was 1000ms)
  };

  const isCardSelected = useCallback((index) => selectedCards.includes(index), [selectedCards]);
  const isCardMatched = useCallback((card) => matchedPairs.includes(card.pairId), [matchedPairs]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getDisplayTime = () => {
    if (elapsedTime) return formatTime(elapsedTime);
    if (isInfiniteMode) return '∞';
    return `${timerDuration}s`;
  };

  // Game Over Component - Enhanced overlay
  const GameOverScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-indigo-900/70 backdrop-blur-md px-4"
    >
      <Card className="w-full max-w-3xl overflow-hidden border border-white/10 bg-white/80 dark:bg-slate-900/90 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-10">
          <div className="space-y-4 flex flex-col justify-center items-center text-center">
            <div className="w-48 h-48 md:w-56 md:h-56">
              <Lottie
                animationData={gameOverCelebration}
                loop
                autoplay
                className="w-full h-full"
                rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 font-semibold">Great run!</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">Game Over</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Here are your final stats.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Points</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{finalScore}</p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Round</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{finalRound}</p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Time</p>
                <p className="text-2xl font-bold text-orange-500 dark:text-orange-300">
                  {getDisplayTime()}
                </p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Best Combo</p>
                <p className="text-2xl font-bold text-fuchsia-500 dark:text-fuchsia-300">
                  {bestCombo}
                  <span aria-hidden="true">🔥</span>
                  <span className="sr-only"> best combo streak</span>
                </p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Coins</p>
                <p className="text-2xl font-bold text-amber-500 dark:text-amber-300">{sessionCoins}</p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Difficulty</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 capitalize">{difficulty}</p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetForNewSession}
                variant="primary"
                size="md"
                fullWidth
              >
                Play Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="secondary"
                size="md"
                fullWidth
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // If game is over, show game over screen
  if (gameOver) {
    return <GameOverScreen />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <Suspense fallback={null}>
        <Confetti trigger={showConfetti} />
      </Suspense>
      
      {/* Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: particle.x + Math.cos(particle.angle) * particle.velocity * 100,
              y: particle.y + Math.sin(particle.angle) * particle.velocity * 100,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="fixed w-3 h-3 rounded-full pointer-events-none z-40"
            style={{ backgroundColor: particle.color }}
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            icon="←"
          >
            End Game
          </Button>
          {topics.length > 0 && (
            <select
              value={selectedTopic || ''}
              onChange={(e) => {
                setSelectedTopic(e.target.value ? parseInt(e.target.value) : null);
                setRound(1);
                setScore(0);
                setCombo(0);
                setTimeout(() => startNewRound(), 0);
              }}
              className="px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.emoji} {topic.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Game Stats */}
        <div className="flex gap-2 sm:gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            key="round-stat"
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Round</div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{round}</div>
              </div>
            </Card>
          </motion.div>
          {!isInfiniteMode && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              key="score-stat"
            >
              <Card className="px-4 py-2">
                <div className="text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Score</div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{score}</div>
                </div>
              </Card>
            </motion.div>
          )}
          <motion.div
            animate={{ 
              scale: combo > 0 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            key="combo-stat"
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Combo</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{combo}🔥</div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            animate={{ 
              scale: timer <= 5 && !isInfiniteMode ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: timer <= 5 && !isInfiniteMode ? Infinity : 0 }}
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Timer</div>
                <div className={`text-lg font-bold ${!isInfiniteMode && timer <= 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isInfiniteMode ? '∞' : `${timer}s`}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Message - Fixed height to prevent layout shifts */}
      <div className="relative h-[68px]">
        <AnimatePresence>
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute inset-0"
          >
            <Card glassEffect className="text-center h-full flex items-center justify-center">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{message}</p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Game Board - Responsive column layout based on difficulty */}
      {/* Easy: 2 rows × 4 columns = 8 cards, Hard: 4 rows × 4 columns = 16 cards */}
      <div className={`grid ${difficulty === 'easy' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-4 sm:gap-6`}>
        {gameCards.map((card, index) => {
          const selected = isCardSelected(index);
          const matched = isCardMatched(card);

          return (
            <div
              key={card.cardId}
              className={`
                min-h-[120px] sm:min-h-[140px]
                border-shine-reserved ${selected ? 'border-shine-active' : ''}
                ${matched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                transition-opacity duration-200
              `}
              style={{ 
                // Reserve space even when invisible to prevent layout shifts
                visibility: matched ? 'hidden' : 'visible'
              }}
            >
              <Card
                onClick={(e) => handleCardClick(index, e)}
                className={`
                  h-full flex items-center justify-center text-center p-4
                  transition-all duration-200
                  ${selected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl scale-105' : ''}
                  ${matched ? '' : 'cursor-pointer hover:shadow-2xl'}
                `}
                pressable={!matched}
                hoverable={!matched}
              >
                <p 
                  className={`font-semibold text-base sm:text-lg px-4 ${selected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}
                >
                  {card.value}
                </p>
              </Card>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Game;
