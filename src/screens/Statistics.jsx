import React, { useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { getWordInsights, estimateDifficulty } from '../utils/aiWordSelector';

// Lazy load the chart component to reduce initial bundle size
const ProgressChart = lazy(() => import('../components/ProgressChart'));

// Constants for mock data generation
const ACCURACY_VARIANCE = 15; // ±15% random variation in historical accuracy
const ACCURACY_DAILY_IMPROVEMENT = 2; // +2% accuracy improvement per day
const MASTERY_VARIANCE = 10; // ±10% random variation in historical mastery
const MASTERY_DAILY_IMPROVEMENT = 1.5; // +1.5% mastery improvement per day

const Statistics = () => {
  const navigate = useNavigate();
  const { words, topics, userData } = useGame();
  const { isDark } = useTheme();

  const total = userData.correctMatches + userData.wrongMatches;
  const accuracy = total > 0 ? Math.round((userData.correctMatches / total) * 100) : 0;

  // Calculate project-wide metrics
  const projectMetrics = useMemo(() => {
    if (words.length === 0) {
      return {
        totalWords: 0,
        avgMastery: 0,
        avgDifficulty: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: 0,
        challengingWords: 0
      };
    }

    // Only count words that have been practiced (have at least one attempt)
    const practicedWords = words.filter(w => {
      const totalAttempts = (w.correct || 0) + (w.wrong || 0);
      return totalAttempts > 0;
    });

    // If no words have been practiced yet, return zeros
    if (practicedWords.length === 0) {
      return {
        totalWords: 0,
        avgMastery: 0,
        avgDifficulty: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: words.length, // All words are new
        challengingWords: 0
      };
    }

    const totalMastery = practicedWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0);
    const wordsWithDifficulty = practicedWords.map(w => ({
      ...w,
      difficulty: estimateDifficulty(w)
    }));
    const totalDifficulty = wordsWithDifficulty.reduce((sum, w) => sum + w.difficulty, 0);

    // Categorize words by status
    const statusCount = {
      mastered: 0,
      familiar: 0,
      learning: 0,
      challenging: 0,
      new: 0
    };

    practicedWords.forEach(word => {
      const insights = getWordInsights(word);
      const status = insights.status.toLowerCase();
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return {
      totalWords: practicedWords.length,
      avgMastery: Math.round(totalMastery / practicedWords.length),
      avgDifficulty: Math.round(totalDifficulty / practicedWords.length),
      masteredWords: statusCount.mastered,
      learningWords: statusCount.learning + statusCount.familiar,
      newWords: statusCount.new,
      challengingWords: statusCount.challenging
    };
  }, [words]);

  // Calculate metrics per topic
  const topicMetrics = useMemo(() => {
    return topics.map(topic => {
      const topicWords = words.filter(w => w.topicId === topic.id);
      
      // Only count practiced words (with at least one attempt)
      const practicedTopicWords = topicWords.filter(w => {
        const totalAttempts = (w.correct || 0) + (w.wrong || 0);
        return totalAttempts > 0;
      });
      
      if (practicedTopicWords.length === 0) {
        return {
          ...topic,
          totalWords: 0,
          avgMastery: 0,
          accuracy: 0,
          masteredWords: 0
        };
      }

      const totalMastery = practicedTopicWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0);
      const totalCorrect = practicedTopicWords.reduce((sum, w) => sum + (w.correct || 0), 0);
      const totalWrong = practicedTopicWords.reduce((sum, w) => sum + (w.wrong || 0), 0);
      const totalAttempts = totalCorrect + totalWrong;
      
      const masteredWords = practicedTopicWords.filter(w => {
        const insights = getWordInsights(w);
        return insights.status.toLowerCase() === 'mastered';
      }).length;

      return {
        ...topic,
        totalWords: practicedTopicWords.length,
        avgMastery: Math.round(totalMastery / practicedTopicWords.length),
        accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
        masteredWords
      };
    });
  }, [topics, words]);

  // Generate mock progress data (in a real app, this would come from historical data)
  // Creates a 7-day trend showing gradual improvement toward current accuracy
  const progressData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Generate historical data with upward trend using defined constants
      const historicalAccuracy = Math.max(0, accuracy - Math.random() * ACCURACY_VARIANCE + (i * ACCURACY_DAILY_IMPROVEMENT));
      const historicalMastery = Math.max(0, projectMetrics.avgMastery - Math.random() * MASTERY_VARIANCE + (i * MASTERY_DAILY_IMPROVEMENT));
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: parseFloat(historicalAccuracy.toFixed(2)),
        mastery: parseFloat(historicalMastery.toFixed(2))
      });
    }
    // Set today's data to actual values
    if (data.length > 0) {
      data[data.length - 1].accuracy = accuracy;
      data[data.length - 1].mastery = projectMetrics.avgMastery;
    }
    return data;
  }, [accuracy, total, projectMetrics.avgMastery]);

  const stats = [
    { icon: '📚', label: 'Total Words', value: projectMetrics.totalWords, color: 'from-blue-500 to-blue-600' },
    { icon: '🎯', label: 'Avg Mastery', value: `${projectMetrics.avgMastery}%`, color: 'from-purple-500 to-purple-600' },
    { icon: '✅', label: 'Overall Accuracy', value: `${accuracy}%`, color: 'from-emerald-500 to-emerald-600' },
    { icon: '🏆', label: 'Mastered Words', value: projectMetrics.masteredWords, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          icon="←"
        >
          Back
        </Button>
      </motion.div>

      {/* Gradient Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 dark:from-pink-700 dark:via-rose-700 dark:to-pink-800 p-8 sm:p-12 lg:p-16"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              📊 Learning<br />
              <span className="relative inline-block">
                Dashboard
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
              Track your progress and explore topic analytics with AI-powered insights
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card className="text-center card-glass border-0 hover-lift">
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
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Central Hero Graph - Progress Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 card-glass border-0">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
            📈 Your Learning Journey
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
            Track your accuracy and mastery progress over the last 7 days
          </p>
          <Suspense fallback={
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <ProgressChart data={progressData} isDark={isDark} />
          </Suspense>
        </Card>
      </motion.div>

      {/* Topics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-glass border-0">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            📚 Topics Overview
          </h3>
          {topicMetrics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                No topics yet. Create topics to organize your learning!
              </p>
              <Button onClick={() => navigate('/welcome')} size="lg">
                Create Topics
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topicMetrics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  onClick={() => navigate(`/stats/topic/${topic.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="h-full card-glass border-0 hover-lift group">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{topic.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                          {topic.name}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Words</span>
                            <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                              {topic.totalWords}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Mastery</span>
                            <span className="font-bold text-lg bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                              {topic.avgMastery}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
                            <span className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                              {topic.accuracy}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Mastered</span>
                            <span className="font-bold text-lg bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                              {topic.masteredWords}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                            <span>View Details</span>
                            <motion.span
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ x: 5 }}
                            >
                              →
                            </motion.span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Total Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="card-glass border-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            🎮 Overall Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 hover-lift"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-2">
                {userData.totalGames}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Games Played</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 hover-lift"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                {userData.correctMatches}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Correct Matches</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 hover-lift"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent mb-2">
                {userData.level}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Current Level</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 hover-lift"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
                {projectMetrics.masteredWords}
              </div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Words Mastered</div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="card-glass border-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            🤖 AI Insights
          </h3>
          <div className="space-y-4">
            {projectMetrics.totalWords === 0 ? (
              <p className="text-slate-600 dark:text-slate-300 text-center py-4">
                Add some words to get started with AI-powered learning!
              </p>
            ) : (
              <>
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl hover-lift"
                >
                  <span className="text-3xl">💡</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Your average mastery score is{' '}
                    <strong className="text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {projectMetrics.avgMastery}%
                    </strong>
                    .{' '}
                    {projectMetrics.avgMastery < 50 ? ' Keep practicing to improve!' : projectMetrics.avgMastery < 75 ? ' You\'re making great progress!' : ' Excellent work!'}
                  </p>
                </motion.div>
                {projectMetrics.challengingWords > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl hover-lift"
                  >
                    <span className="text-3xl">⚠️</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      You have{' '}
                      <strong className="text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {projectMetrics.challengingWords}
                      </strong>{' '}
                      challenging word(s) that need extra attention.
                    </p>
                  </motion.div>
                )}
                {projectMetrics.masteredWords > 0 && (
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl hover-lift"
                  >
                    <span className="text-3xl">🎉</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Congratulations! You've mastered{' '}
                      <strong className="text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {projectMetrics.masteredWords}
                      </strong>{' '}
                      word(s)!
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Action Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => navigate('/game')}
            size="lg"
            icon="🎮"
            disabled={words.length < 8}
          >
            Start Learning with AI
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Statistics;
