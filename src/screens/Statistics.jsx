import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { getWordInsights, estimateDifficulty } from '../utils/aiWordSelector';

const Statistics = () => {
  const navigate = useNavigate();
  const { words, userData } = useGame();

  // Threshold constants for word filtering
  const MASTERY_THRESHOLD = 60; // Words below this mastery score need practice
  const DIFFICULTY_THRESHOLD = 40; // Words above this difficulty need practice

  const total = userData.correctMatches + userData.wrongMatches;
  const accuracy = total > 0 ? Math.round((userData.correctMatches / total) * 100) : 0;

  // Use AI to identify words that need practice
  const wordsWithInsights = words.map(word => ({
    ...word,
    insights: getWordInsights(word),
    difficulty: estimateDifficulty(word)
  }));

  // Sort by priority (highest difficulty and lowest mastery first)
  const needPractice = wordsWithInsights
    .filter(w => w.masteryScore < MASTERY_THRESHOLD || w.difficulty > DIFFICULTY_THRESHOLD)
    .sort((a, b) => {
      // Prioritize by difficulty first, then by mastery
      const diffDiff = b.difficulty - a.difficulty;
      if (diffDiff !== 0) return diffDiff;
      return a.masteryScore - b.masteryScore;
    })
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
          🎯 AI-Recommended Practice Words
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Our AI algorithm identifies words that need more attention based on difficulty, mastery level, and review timing.
        </p>
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
                className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/30 dark:to-orange-900/30 rounded-xl border border-rose-100 dark:border-rose-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{word.insights.emoji}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{word.word}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {word.insights.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">{word.meaning}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {word.insights.recommendation}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Mastery</div>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all"
                            style={{ width: `${word.masteryScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {word.masteryScore || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Difficulty</div>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-rose-500 to-orange-600 rounded-full transition-all"
                            style={{ width: `${word.difficulty || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {word.difficulty || 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✅ {word.correct}
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        ❌ {word.wrong}
                      </span>
                    </div>
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
            disabled={words.length < 8}
          >
            Practice Now
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default Statistics;
