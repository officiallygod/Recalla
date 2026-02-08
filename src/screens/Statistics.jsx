import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { getWordInsights, estimateDifficulty } from '../utils/aiWordSelector';

const Statistics = () => {
  const navigate = useNavigate();
  const { words, topics, userData } = useGame();

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

    const totalMastery = words.reduce((sum, w) => sum + (w.masteryScore || 0), 0);
    const wordsWithDifficulty = words.map(w => ({
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

    words.forEach(word => {
      const insights = getWordInsights(word);
      const status = insights.status.toLowerCase();
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return {
      totalWords: words.length,
      avgMastery: Math.round(totalMastery / words.length),
      avgDifficulty: Math.round(totalDifficulty / words.length),
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
      
      if (topicWords.length === 0) {
        return {
          ...topic,
          totalWords: 0,
          avgMastery: 0,
          accuracy: 0,
          masteredWords: 0
        };
      }

      const totalMastery = topicWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0);
      const totalCorrect = topicWords.reduce((sum, w) => sum + (w.correct || 0), 0);
      const totalWrong = topicWords.reduce((sum, w) => sum + (w.wrong || 0), 0);
      const totalAttempts = totalCorrect + totalWrong;
      
      const masteredWords = topicWords.filter(w => {
        const insights = getWordInsights(w);
        return insights.status.toLowerCase() === 'mastered';
      }).length;

      return {
        ...topic,
        totalWords: topicWords.length,
        avgMastery: Math.round(totalMastery / topicWords.length),
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
      // Generate historical accuracy with upward trend:
      // Start lower than current accuracy and gradually improve
      // Random variation (±15%) with progressive improvement (+2% per day)
      const historicalAccuracy = Math.max(0, accuracy - Math.random() * 15 + (i * 2));
      const historicalMastery = Math.max(0, projectMetrics.avgMastery - Math.random() * 10 + (i * 1.5));
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: historicalAccuracy,
        mastery: historicalMastery
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
      className="max-w-7xl mx-auto space-y-6"
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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">📊 Learning Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Track your progress and explore topic analytics</p>
      </Card>

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Central Hero Graph - Progress Over Time */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
          📈 Your Learning Journey
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
          Track your accuracy and mastery progress over the last 7 days
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={progressData}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '14px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '14px' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Area 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorAccuracy)"
              name="Accuracy %"
            />
            <Area 
              type="monotone" 
              dataKey="mastery" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorMastery)"
              name="Mastery %"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Topics Overview */}
      <Card>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicMetrics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/stats/topic/${topic.id}`)}
                className="cursor-pointer"
              >
                <Card hoverable className="h-full">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{topic.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                        {topic.name}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Words</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{topic.totalWords}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Mastery</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">{topic.avgMastery}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{topic.accuracy}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400">Mastered</span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{topic.masteredWords}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <span>View Details</span>
                          <span>→</span>
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

      {/* Total Progress Summary */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          🎮 Overall Progress
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userData.totalGames}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Games Played</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userData.correctMatches}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Correct Matches</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userData.level}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Current Level</div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{projectMetrics.masteredWords}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Words Mastered</div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          🤖 AI Insights
        </h3>
        <div className="space-y-3">
          {projectMetrics.totalWords === 0 ? (
            <p className="text-slate-600 dark:text-slate-300 text-center py-4">
              Add some words to get started with AI-powered learning!
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <span className="text-2xl">💡</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Your average mastery score is <strong>{projectMetrics.avgMastery}%</strong>. 
                  {projectMetrics.avgMastery < 50 ? ' Keep practicing to improve!' : projectMetrics.avgMastery < 75 ? ' You\'re making great progress!' : ' Excellent work!'}
                </p>
              </div>
              {projectMetrics.challengingWords > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    You have <strong>{projectMetrics.challengingWords}</strong> challenging word(s) that need extra attention.
                  </p>
                </div>
              )}
              {projectMetrics.masteredWords > 0 && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Congratulations! You've mastered <strong>{projectMetrics.masteredWords}</strong> word(s)!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={() => navigate('/game')}
          size="lg"
          icon="🎮"
          disabled={words.length < 8}
        >
          Start Learning with AI
        </Button>
      </div>
    </motion.div>
  );
};

export default Statistics;
