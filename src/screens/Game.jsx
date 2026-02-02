import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const Game = () => {
  const navigate = useNavigate();
  const { words, updateWordStats, awardPoints, recordMatch, incrementGamesPlayed } = useGame();
  
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (words.length < 4) {
      navigate('/');
      return;
    }
    incrementGamesPlayed();
    startNewRound();
  }, []);

  const startNewRound = () => {
    // Select 4 words, prioritizing those with more errors
    const sortedWords = [...words].sort((a, b) => {
      return (b.wrong - b.correct) - (a.wrong - a.correct);
    });
    const roundWords = sortedWords.slice(0, Math.min(4, words.length));

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
    setMessage('Match words with their meanings!');
  };

  const handleCardClick = (index) => {
    if (isChecking || selectedCards.length >= 2 || selectedCards.includes(index) || matchedPairs.includes(gameCards[index].pairId)) {
      return;
    }

    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setTimeout(() => checkMatch(newSelected), 500);
    }
  };

  const checkMatch = (selected) => {
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
      
      setMessage(`🎉 Perfect Match! +${points} points! 🔥${newCombo}`);
      
      updateWordStats(card1.id, true);
      recordMatch(true);

      // Check if round complete
      if (matchedPairs.length + 1 === gameCards.length / 2) {
        setTimeout(() => {
          const bonus = newCombo * 100;
          awardPoints(bonus, 50);
          setMessage(`🏆 Round ${round} Complete! Bonus: +${bonus} points!`);
          setRound(prev => prev + 1);
          setTimeout(() => startNewRound(), 2000);
        }, 1000);
      }
    } else {
      // Wrong match
      setCombo(0);
      setMessage('❌ Try again!');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          icon="←"
        >
          End Game
        </Button>

        {/* Game Stats */}
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-xs text-slate-500">Round</div>
              <div className="text-lg font-bold text-primary-600">{round}</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-xs text-slate-500">Score</div>
              <div className="text-lg font-bold text-primary-600">{score}</div>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-center">
              <div className="text-xs text-slate-500">Combo</div>
              <div className="text-lg font-bold text-orange-600">{combo}🔥</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Card glassEffect className="text-center">
            <p className="text-lg font-semibold text-slate-800">{message}</p>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Game Board */}
      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {gameCards.map((card, index) => {
            const selected = isCardSelected(index);
            const matched = isCardMatched(card);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: matched ? 0 : 1, 
                  scale: matched ? 0.5 : 1,
                  rotateY: matched ? 180 : 0
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  onClick={() => handleCardClick(index)}
                  className={`
                    min-h-[120px] flex items-center justify-center text-center
                    ${selected ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl scale-105' : ''}
                    ${matched ? 'pointer-events-none' : 'cursor-pointer'}
                  `}
                  pressable={!matched}
                  hoverable={!matched}
                >
                  <p className={`font-semibold text-lg px-4 ${selected ? 'text-white' : 'text-slate-800'}`}>
                    {card.value}
                  </p>
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
