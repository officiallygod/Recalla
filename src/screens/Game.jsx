import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import Confetti from '../components/Confetti';
import { useGame } from '../contexts/GameContext';

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

  useEffect(() => {
    if (gameWords.length < 4) {
      navigate('/');
      return;
    }
    incrementGamesPlayed();
    startNewRound();
  }, [selectedTopic, gameWords.length]);

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

  const startNewRound = () => {
    // Select 4 words, prioritizing those with more errors
    const sortedWords = [...gameWords].sort((a, b) => {
      return (b.wrong - b.correct) - (a.wrong - a.correct);
    });
    const roundWords = sortedWords.slice(0, Math.min(4, gameWords.length));

    // Create cards
    const cards = [];
    roundWords.forEach((word, index) => {
      cards.push({ type: 'word', value: word.word, id: word.id, pairId: index });
      cards.push({ type: 'meaning', value: word.meaning, id: word.id, pairId: index });
    });

    // Shuffle cards
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMessage('Match words with their meanings! ✨');
  };

  const handleCardClick = (index, event) => {
    if (isChecking || selectedCards.length >= 2 || selectedCards.includes(index) || matchedPairs.includes(gameCards[index].pairId)) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setTimeout(() => checkMatch(newSelected, x, y), 500);
    }
  };

  const checkMatch = (selected, x, y) => {
    const [first, second] = selected;
    const card1 = gameCards[first];
    const card2 = gameCards[second];

    if (card1.pairId === card2.pairId) {
      // Correct match
      setMatchedPairs(prev => [...prev, card1.pairId]);
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      const points = 100 + (newCombo * 50);
      setScore(prev => prev + points);
      awardPoints(points, 10 + (newCombo * 5));
      
      setMessage(`🎉 Perfect Match! +${points} points! ${newCombo > 1 ? `🔥x${newCombo}` : ''}`);
      createParticles(x, y, true);
      
      updateWordStats(card1.id, true);
      recordMatch(true);

      // Check if round complete
      if (matchedPairs.length + 1 === gameCards.length / 2) {
        setShowConfetti(true);
        setTimeout(() => {
          const bonus = newCombo * 100;
          awardPoints(bonus, 50);
          setMessage(`🏆 Round ${round} Complete! Bonus: +${bonus} points!`);
          setRound(prev => prev + 1);
          setTimeout(() => {
            setShowConfetti(false);
            startNewRound();
          }, 2000);
        }, 1000);
      }
    } else {
      // Wrong match
      setCombo(0);
      setMessage('❌ Try again! Keep matching!');
      createParticles(x, y, false);
      updateWordStats(card1.id, false);
      updateWordStats(card2.id, false);
      recordMatch(false);
    }

    setTimeout(() => {
      setSelectedCards([]);
      setIsChecking(false);
    }, 1000);
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
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
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
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
              scale: combo > 0 ? [1, 1.2, 1] : 1,
              rotate: combo > 0 ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            key={combo}
          >
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Combo</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{combo}🔥</div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card glassEffect className="text-center">
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{message}</p>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Game Board */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {gameCards.map((card, index) => {
            const selected = isCardSelected(index);
            const matched = isCardMatched(card);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
                animate={{ 
                  opacity: matched ? 0 : 1, 
                  scale: matched ? 0.5 : 1,
                  rotateY: 0
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  onClick={(e) => handleCardClick(index, e)}
                  className={`
                    min-h-[120px] sm:min-h-[140px] flex items-center justify-center text-center p-4
                    transition-all duration-300
                    ${selected ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-2xl scale-105 ring-4 ring-primary-300 dark:ring-primary-600' : ''}
                    ${matched ? 'pointer-events-none' : 'cursor-pointer hover:shadow-2xl'}
                  `}
                  pressable={!matched}
                  hoverable={!matched}
                >
                  <motion.p 
                    className={`font-semibold text-base sm:text-lg px-4 ${selected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}
                    animate={selected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
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
