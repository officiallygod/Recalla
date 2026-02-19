import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import Button from '../components/Button';
import Card from '../components/Card';
import useContentStore from '../store/contentStore';
import useUserStore from '../store/userStore';
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

// Memoized Card Component for performance
const GameCard = React.memo(({ card, index, isSelected, isMatched, onClick }) => {
  const handleClick = useCallback((e) => {
    onClick(index, e);
  }, [onClick, index]);

  return (
    <div
      className={`
        min-h-[120px] sm:min-h-[140px]
        border-shine-reserved ${isSelected ? 'border-shine-active' : ''}
        ${isMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        transition-opacity duration-200
      `}
      style={{
        // Reserve space even when invisible to prevent layout shifts
        visibility: isMatched ? 'hidden' : 'visible'
      }}
    >
      <Card
        onClick={handleClick}
        className={`
          h-full flex items-center justify-center text-center p-4
          transition-all duration-200
          ${isMatched ? '' : 'cursor-pointer'}
        `}
        pressable={!isMatched}
        hoverable={!isMatched}
      >
        <p
          className={`font-semibold text-base sm:text-lg px-4 text-slate-800 dark:text-slate-200`}
        >
          {card.value}
        </p>
      </Card>
    </div>
  );
});

GameCard.displayName = 'GameCard';

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const words = useContentStore(state => state.words);
  const topics = useContentStore(state => state.topics);
  const updateWordStats = useContentStore(state => state.updateWordStats);
  const awardPoints = useUserStore(state => state.awardPoints);
  const recordMatch = useUserStore(state => state.recordMatch);
  const incrementGamesPlayed = useUserStore(state => state.incrementGamesPlayed);

  const getWordsByTopic = useCallback((topicId) => {
    return words.filter(w => w.topicId === topicId);
  }, [words]);

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

  // Ref to track combo synchronously for scoring
  const comboRef = React.useRef(0);

  // Reset combo ref when game resets
  useEffect(() => {
    if (!gameOver) {
      comboRef.current = 0;
    }
  }, [gameOver, round]);

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

  // Timer effect
  useEffect(() => {
    if (isInfiniteMode || !isTimerActive || gameOver) return;
    
    if (timer <= 0) {
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

  const restartGame = () => {
    setGameOver(false);
    setSessionCoins(0);
    setSessionStart(Date.now());
    setElapsedTime(0);
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
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

  const replaceMatchedCards = useCallback((matchedPairId) => {
    if (availableWords.length === 0) return;

    setShownWordIds(currentShownIds => {
      const shownSet = new Set(currentShownIds);
      const unseenWords = availableWords.filter(w => !shownSet.has(w.id));

      if (unseenWords.length === 0) return currentShownIds;

      const selectedWords = selectWordsForSession(unseenWords, 1, {
        balanceChallenge: false,
        includeNew: true,
      });

      if (selectedWords.length === 0) return currentShownIds;

      const selectedWord = selectedWords[0];

      const delay = 800;

      setTimeout(() => {
        setGameCards(prev => {
          const matchedIndices = [];
          prev.forEach((card, idx) => {
            if (card.pairId === matchedPairId) matchedIndices.push(idx);
          });

          if (matchedIndices.length !== 2) return prev;

          const maxPairId = prev.length > 0 ? Math.max(...prev.map(c => c.pairId)) : 0;
          const newPairId = maxPairId + 1;
          const timestamp = Date.now();
          const newCards = [
            { type: 'word', value: selectedWord.word, id: selectedWord.id, pairId: newPairId, cardId: `${timestamp}-${newPairId}-word` },
            { type: 'meaning', value: selectedWord.meaning, id: selectedWord.id, pairId: newPairId, cardId: `${timestamp}-${newPairId}-meaning` }
          ];

          const shuffledNewCards = shuffleArray(newCards);
          const updated = [...prev];
          updated[matchedIndices[0]] = shuffledNewCards[0];
          updated[matchedIndices[1]] = shuffledNewCards[1];
          return updated;
        });

        setAvailableWords(prev => prev.filter(w => w.id !== selectedWord.id));
        setActiveWordIds(prev => [...prev, selectedWord.id]);
      }, delay);

      return [...currentShownIds, selectedWord.id];
    });
  }, [availableWords, shuffleArray]);

  const startNewRound = () => {
    const selectedWords = selectWordsForSession(gameWords, CARDS_PER_ROUND, {
      includeNew: true,
      balanceChallenge: true,
      maxDifficulty: 100,
    });
    
    if (selectedWords.length === 0) {
      navigate('/');
      return;
    }
    
    const currentWordIds = selectedWords.map(w => w.id);
    setActiveWordIds(currentWordIds);
    setShownWordIds(currentWordIds);
    setAvailableWords(gameWords.filter(w => !currentWordIds.includes(w.id)));

    const cards = [];
    selectedWords.forEach((word, index) => {
      cards.push({ type: 'word', value: word.word, id: word.id, pairId: index, cardId: `${Date.now()}-${index}-word` });
      cards.push({ type: 'meaning', value: word.meaning, id: word.id, pairId: index, cardId: `${Date.now()}-${index}-meaning` });
    });

    const shuffled = shuffleArray(cards);
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMessage('Match words with their meanings! ✨');
  };

  const handleCardClick = useCallback((index, event) => {
    const isSelected = selectedCards.includes(index);
    if (isSelected) {
      setSelectedCards(prev => prev.filter(i => i !== index));
      return;
    }
    
    const card = gameCards[index];
    if (matchedPairs.includes(card.pairId)) return;
    
    if (isChecking && selectedCards.length >= 2) {
      setSelectedCards([index]);
      setIsChecking(false);
      return;
    }
    
    if (selectedCards.length >= 2) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      
      setTimeout(() => {
          const [first, second] = newSelected;
          const c1 = gameCards[first];
          const c2 = gameCards[second];

          if (c1.pairId === c2.pairId) {
             hapticSuccess();
             setMatchedPairs(prev => {
                 const newPairs = [...prev, c1.pairId];
                 return newPairs;
             });

             comboRef.current += 1;
             const newCombo = comboRef.current;
             setCombo(newCombo);
             setBestCombo(prev => Math.max(prev, newCombo));

             if (!isInfiniteMode) {
                 const points = 50 + (newCombo * 10);
                 setScore(s => s + points);
                 setSessionCoins(c => c + 1);
                 awardPoints(points, 1, round);
             }

             setMessage('🎉 Perfect Match!');
             createParticles(x, y, true);
             updateWordStats(c1.id, true);
             recordMatch(true);

             if (matchedPairs.length + 1 === gameCards.length / 2) {
                 if (availableWords.length > 0) {
                     setMessage('🎯 Keep going! New words incoming...');
                     replaceMatchedCards(c1.pairId);
                 } else {
                     setShowConfetti(true);
                     setIsTimerActive(false);
                     setTimeout(() => {
                         setRound(r => r + 1);
                         setTimer(timerDuration);
                         setTimeout(() => {
                             setShowConfetti(false);
                             if (!isInfiniteMode) setIsTimerActive(true);
                             startNewRound();
                         }, 500);
                     }, 300);
                 }
             } else {
                 if (availableWords.length > 0) replaceMatchedCards(c1.pairId);
             }

          } else {
             hapticError();
             comboRef.current = 0;
             setCombo(0);
             setMessage('❌ Try again!');
             createParticles(x, y, false);
             recordMatch(false);
             updateWordStats(c1.id, false);
             updateWordStats(c2.id, false);
          }

          setTimeout(() => {
              setSelectedCards([]);
              setIsChecking(false);
          }, 300);

      }, 150);
    }
  }, [gameCards, selectedCards, matchedPairs, isChecking, isInfiniteMode, round, availableWords.length,
      timerDuration, updateWordStats, recordMatch, awardPoints, replaceMatchedCards,
      startNewRound, shuffleArray]);

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

  const gameGrid = useMemo(() => (
    <div className={`grid ${difficulty === 'easy' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-4 sm:gap-6`}>
      {gameCards.map((card, index) => (
        <GameCard
          key={card.cardId}
          card={card}
          index={index}
          isSelected={selectedCards.includes(index)}
          isMatched={matchedPairs.includes(card.pairId)}
          onClick={handleCardClick}
        />
      ))}
    </div>
  ), [gameCards, selectedCards, matchedPairs, handleCardClick, difficulty]);

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
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 font-semibold">Great Run!</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">Game Over</h2>
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
                <p
                  className="text-2xl font-bold text-orange-500 dark:text-orange-300"
                  aria-label={`Time ${getDisplayTime()}`}
                >
                  {getDisplayTime()}
                </p>
              </Card>
              <Card className="glass p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Best Combo</p>
                <p
                  className="text-2xl font-bold text-fuchsia-500 dark:text-fuchsia-300"
                  aria-label={`Best combo ${bestCombo}`}
                >
                  {bestCombo}
                  <span aria-hidden="true">🔥</span>
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
                onClick={restartGame}
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

      {gameGrid}
    </motion.div>
  );
};

export default Game;
