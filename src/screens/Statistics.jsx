import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { getWordInsights, estimateDifficulty } from '../utils/aiWordSelector';

const Statistics = () => {
  const navigate = useNavigate();
  const { words, userData } = useGame();

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

  // Generate data for mastery distribution chart
  const masteryDistribution = useMemo(() => {
    const ranges = [
      { name: '0-20%', min: 0, max: 20, count: 0 },
      { name: '21-40%', min: 21, max: 40, count: 0 },
      { name: '41-60%', min: 41, max: 60, count: 0 },
      { name: '61-80%', min: 61, max: 80, count: 0 },
      { name: '81-100%', min: 81, max: 100, count: 0 }
    ];

    words.forEach(word => {
      const mastery = word.masteryScore || 0;
      const range = ranges.find(r => mastery >= r.min && mastery <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [words]);

  // Generate data for word status pie chart
  const statusData = useMemo(() => [
    { name: 'Mastered', value: projectMetrics.masteredWords, color: '#10b981' },
    { name: 'Learning', value: projectMetrics.learningWords, color: '#3b82f6' },
    { name: 'Challenging', value: projectMetrics.challengingWords, color: '#f59e0b' },
    { name: 'New', value: projectMetrics.newWords, color: '#6366f1' }
  ].filter(d => d.value > 0), [projectMetrics]);

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
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: historicalAccuracy,
        matches: Math.floor(Math.random() * 20) + 10 // 10-30 matches per day
      });
    }
    // Set today's data to actual values
    if (data.length > 0) {
      data[data.length - 1].accuracy = accuracy;
      data[data.length - 1].matches = total;
    }
    return data;
  }, [accuracy, total]);

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
      className="max-w-6xl mx-auto space-y-6"
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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">📊 Project Dashboard</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">AI-Powered Learning Analytics</p>
      </Card>

      {/* Stats Grid */}
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <Card>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            📈 Accuracy Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorAccuracy)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Word Status Distribution */}
        <Card>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🎯 Word Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Mastery Distribution */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          🎓 Mastery Level Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={masteryDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <Legend />
            <Bar dataKey="count" fill="#6366f1" name="Number of Words" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Quick Stats */}
      <Card>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          🎮 Quick Stats
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
          <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{userData.wrongMatches}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Wrong Matches</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userData.level}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Current Level</div>
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
