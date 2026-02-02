import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const Statistics = () => {
  const navigate = useNavigate();
  const { words, userData } = useGame();

  const total = userData.correctMatches + userData.wrongMatches;
  const accuracy = total > 0 ? Math.round((userData.correctMatches / total) * 100) : 0;

  const needPractice = words
    .filter(w => w.wrong > w.correct)
    .sort((a, b) => (b.wrong - b.correct) - (a.wrong - a.correct))
    .slice(0, 10);

  const stats = [
    { icon: '🎮', label: 'Games Played', value: userData.totalGames, color: 'from-blue-500 to-blue-600' },
    { icon: '✅', label: 'Correct Matches', value: userData.correctMatches, color: 'from-emerald-500 to-emerald-600' },
    { icon: '❌', label: 'Wrong Matches', value: userData.wrongMatches, color: 'from-rose-500 to-rose-600' },
    { icon: '🎯', label: 'Accuracy', value: `${accuracy}%`, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/')}
        icon="←"
      >
        Back
      </Button>

      <Card glassEffect>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Your Statistics</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Track your learning progress</p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hoverable className="text-center">
              <motion.div 
                className="text-4xl mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {stat.icon}
              </motion.div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Words Needing Practice */}
      <Card>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Words Needing Practice
        </h3>
        {needPractice.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-slate-600 dark:text-slate-300">
              Great job! No words need extra practice!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {needPractice.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-rose-50 dark:bg-rose-900/30 rounded-xl border border-rose-100 dark:border-rose-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{word.word}</span>
                    <span className="text-slate-500 dark:text-slate-400"> - {word.meaning}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      ❌ {word.wrong}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✅ {word.correct}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Button */}
      {needPractice.length > 0 && (
        <div className="text-center">
          <Button
            onClick={() => navigate('/game')}
            size="lg"
            icon="🎮"
            disabled={words.length < 4}
          >
            Practice Now
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Statistics;
