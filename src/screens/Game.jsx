import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Confetti from '../components/Confetti';
import { useGame } from '../contexts/GameContext';
import { selectWordsForSession, estimateDifficulty } from '../utils/aiWordSelector';

const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { words, topics, updateWordStats, awardPoints, recordMatch, incrementGamesPlayed, getWordsByTopic } = useGame();
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);
  
  // Get words for the game - if a topic is selected, use only that topic's words
  // If no topic is selected, use words that have a topicId (ensuring words are grouped by topic)
  const gameWords = selectedTopic 
    ? getWordsByTopic(selectedTopic) 
    : words.filter(w => w.topicId != null);
  
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
  const [timer, setTimer] = useState(30); // 30-second timer
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Fisher-Yates shuffle for proper randomization
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (gameWords.length < 4) {
      navigate('/');
      return;
    }
    incrementGamesPlayed();
    startNewRound();
    
    // Start the 30-second timer
    setIsTimerActive(true);
  }, [selectedTopic, gameWords.length]);

  // Timer effect - count down from 30 seconds, auto-resets
  useEffect(() => {
    if (!isTimerActive) return;
    
    if (timer <= 0) {
      // Timer expired - reset to 30 and continue (never stop the user)
      setTimer(30);
      return;
    }
    
    const interval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, isTimerActive]);


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
          const newCards = [
            { type: 'word', value: selectedWord.word, id: selectedWord.id, pairId: newPairId },
            { type: 'meaning', value: selectedWord.meaning, id: selectedWord.id, pairId: newPairId }
          ];
          
          // Shuffle new cards using Fisher-Yates
          const shuffledNewCards = shuffleArray(newCards);
          
          // Replace matched cards with new ones
          const updated = [...prev];
          updated[matchedIndices[0]] = shuffledNewCards[0];
          updated[matchedIndices[1]] = shuffledNewCards[1];
          
          return updated;
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
    // Constants for word selection algorithm
    const CARDS_PER_ROUND = 4; // Number of word pairs to show
    
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
      cards.push({ type: 'word', value: word.word, id: word.id, pairId: index });
      cards.push({ type: 'meaning', value: word.meaning, id: word.id, pairId: index });
    });

    // Shuffle cards using Fisher-Yates
    const shuffled = shuffleArray(cards);
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMessage('Match words with their meanings! ✨');
  };

  const handleCardClick = (index, event) => {
    // Allow deselection - if card is already selected, deselect it
    if (selectedCards.includes(index)) {
      setSelectedCards(prev => prev.filter(i => i !== index));
      return;
    }
    
    // Don't allow selection of matched cards
    if (matchedPairs.includes(gameCards[index].pairId)) {
      return;
    }
    
    // Allow selection even during checking (celebration animations)
    // Only block if we already have 2 cards selected and this isn't a deselection
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
      // Correct match - both cards share the same word ID, update once
      setMatchedPairs(prev => [...prev, card1.pairId]);
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Harder rewards: Reduced points and coins significantly
      const points = 50 + (newCombo * 25);
      setScore(prev => prev + points);
      awardPoints(points, 3 + (newCombo * 2));
      
      setMessage(`🎉 Perfect Match! +${points} points! ${newCombo > 1 ? `🔥x${newCombo}` : ''}`);
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
          setTimeout(() => {
            // Harder round completion bonus
            const bonus = newCombo * 50;
            awardPoints(bonus, 20, round);
            setMessage(`🏆 Round ${round} Complete! Bonus: +${bonus} points!`);
            setRound(prev => prev + 1);
            setTimer(30); // Reset timer for next round
            setTimeout(() => {
              setShowConfetti(false);
              setIsTimerActive(true); // Resume timer for next round
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
      // Wrong match - In a matching game format, we cannot determine which word
      // the user was attempting to match, so updating stats for either word would
      // produce inaccurate metrics. Only correct matches update word stats.
      setCombo(0);
      setMessage('❌ Try again! Keep matching!');
      createParticles(x, y, false);
      recordMatch(false);
    }

    setTimeout(() => {
      setSelectedCards([]);
      setIsChecking(false);
    }, 600); // Faster reset (was 1000ms)
  };

  const isCardSelected = (index) => selectedCards.includes(index);
  const isCardMatched = (card) => matchedPairs.includes(card.pairId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <Confetti trigger={showConfetti} />
      
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
            key={round}
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Round</div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{round}</div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            key={score}
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Score</div>
                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">{score}</div>
              </div>
            </Card>
          </motion.div>
          <motion.div
            animate={{ 
              scale: combo > 0 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            key={combo}
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
              scale: timer <= 5 ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: timer <= 5 ? Infinity : 0 }}
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Timer</div>
                <div className={`text-lg font-bold ${timer <= 5 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {timer}s
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Card glassEffect className="text-center">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{message}</p>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Game Board */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {gameCards.map((card, index) => {
            const selected = isCardSelected(index);
            const matched = isCardMatched(card);

            return (
              <motion.div
                key={`${card.id}-${card.type}-${card.pairId}`}
                layout
                initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                animate={{ 
                  opacity: matched ? 0 : 1, 
                  scale: matched ? 0.8 : 1,
                  rotateY: 0
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={selected ? 'border-shine' : ''}
              >
                <Card
                  onClick={(e) => handleCardClick(index, e)}
                  className={`
                    min-h-[120px] sm:min-h-[140px] flex items-center justify-center text-center p-4
                    transition-all duration-200
                    ${selected ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-105' : ''}
                    ${matched ? 'pointer-events-none' : 'cursor-pointer hover:scale-102'}
                  `}
                  pressable={!matched}
                  hoverable={!matched}
                >
                  <motion.p 
                    className={`font-semibold text-base sm:text-lg px-4 ${selected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}
                    animate={selected ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {card.value}
                  </motion.p>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Game;
