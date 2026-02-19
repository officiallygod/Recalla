import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/Button';
import Card from '../components/Card';
import useContentStore from '../store/contentStore';
import useUserStore from '../store/userStore';
import { getWordInsights, estimateDifficulty } from '../utils/aiWordSelector';

// Custom tooltip to format percentages to 2 decimal places
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '14px',
          padding: '12px'
        }}
      >
        <p className="text-sm font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${entry.value.toFixed(2)}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Constants for mock data generation and game requirements
const ACCURACY_VARIANCE = 15; // ±15% random variation in historical accuracy
const ACCURACY_DAILY_IMPROVEMENT = 2; // +2% accuracy improvement per day
const MASTERY_VARIANCE = 10; // ±10% random variation in historical mastery
const MASTERY_DAILY_IMPROVEMENT = 1.5; // +1.5% mastery improvement per day
const MINIMUM_PRACTICE_WORDS = 8; // Minimum words required to practice a topic

const TopicDetails = () => {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const words = useContentStore(state => state.words);
  const topics = useContentStore(state => state.topics);
  const userData = useUserStore(state => state.userData);

  // Find the topic
  const topic = topics.find(t => t.id === parseInt(topicId));
  
  // Get words for this topic
  const topicWords = useMemo(() => {
    return words.filter(w => w.topicId === parseInt(topicId));
  }, [words, topicId]);

  // Calculate topic-specific metrics
  const topicMetrics = useMemo(() => {
    if (topicWords.length === 0) {
      return {
        totalWords: 0,
        avgMastery: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: 0,
        challengingWords: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0
      };
    }

    // Only count practiced words (with at least one attempt)
    const practicedTopicWords = topicWords.filter(w => {
      const totalAttempts = (w.correct || 0) + (w.wrong || 0);
      return totalAttempts > 0;
    });

    // If no words have been practiced yet, return zeros
    if (practicedTopicWords.length === 0) {
      return {
        totalWords: 0,
        avgMastery: 0,
        masteredWords: 0,
        learningWords: 0,
        newWords: topicWords.length, // All words are new
        challengingWords: 0,
        totalCorrect: 0,
        totalWrong: 0,
        accuracy: 0
      };
    }

    const totalMastery = practicedTopicWords.reduce((sum, w) => sum + (w.masteryScore || 0), 0);
    const totalCorrect = practicedTopicWords.reduce((sum, w) => sum + (w.correct || 0), 0);
    const totalWrong = practicedTopicWords.reduce((sum, w) => sum + (w.wrong || 0), 0);
    const totalAttempts = totalCorrect + totalWrong;

    // Categorize words by status
    const statusCount = {
      mastered: 0,
      familiar: 0,
      learning: 0,
      challenging: 0,
      new: 0
    };

    practicedTopicWords.forEach(word => {
      const insights = getWordInsights(word);
      const status = insights.status.toLowerCase();
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status]++;
      }
    });

    return {
      totalWords: practicedTopicWords.length,
      avgMastery: Math.round(totalMastery / practicedTopicWords.length),
      masteredWords: statusCount.mastered,
      learningWords: statusCount.learning + statusCount.familiar,
      newWords: statusCount.new,
      challengingWords: statusCount.challenging,
      totalCorrect,
      totalWrong,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
    };
  }, [topicWords]);

  // Mastery distribution for this topic
  const masteryDistribution = useMemo(() => {
    const ranges = [
      { name: '0-20%', min: 0, max: 20, count: 0 },
      { name: '21-40%', min: 21, max: 40, count: 0 },
      { name: '41-60%', min: 41, max: 60, count: 0 },
      { name: '61-80%', min: 61, max: 80, count: 0 },
      { name: '81-100%', min: 81, max: 100, count: 0 }
    ];

    topicWords.forEach(word => {
      const mastery = word.masteryScore || 0;
      const range = ranges.find(r => mastery >= r.min && mastery <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [topicWords]);

  // Mock progress data for this topic
  const progressData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const historicalAccuracy = Math.max(0, topicMetrics.accuracy - Math.random() * ACCURACY_VARIANCE + (i * ACCURACY_DAILY_IMPROVEMENT));
      const historicalMastery = Math.max(0, topicMetrics.avgMastery - Math.random() * MASTERY_VARIANCE + (i * MASTERY_DAILY_IMPROVEMENT));
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        accuracy: Math.round(historicalAccuracy * 100) / 100,
        mastery: Math.round(historicalMastery * 100) / 100
      });
    }
    // Set today's data to actual values
    if (data.length > 0) {
      data[data.length - 1].accuracy = topicMetrics.accuracy;
      data[data.length - 1].mastery = topicMetrics.avgMastery;
    }
    return data;
  }, [topicMetrics]);

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Topic not found</h2>
        <Button onClick={() => navigate('/stats')}>Back to Dashboard</Button>
      </div>
    );
  }

  const stats = [
    { icon: '📚', label: 'Total Words', value: topicMetrics.totalWords, color: 'from-blue-500 to-blue-600' },
    { icon: '🎯', label: 'Avg Mastery', value: `${topicMetrics.avgMastery}%`, color: 'from-purple-500 to-purple-600' },
    { icon: '✅', label: 'Accuracy', value: `${topicMetrics.accuracy}%`, color: 'from-emerald-500 to-emerald-600' },
    { icon: '🏆', label: 'Mastered', value: topicMetrics.masteredWords, color: 'from-amber-500 to-amber-600' },
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
        onClick={() => navigate('/stats')}
        icon="←"
      >
        Back to Dashboard
      </Button>

      <Card className="card-glass border-0">
        <div className="flex items-center gap-3 p-6">
          <span className="text-4xl">{topic.emoji}</span>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{topic.name}</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Topic Analytics</p>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
              <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Chart */}
      <Card className="card-glass border-0 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          📈 Progress Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
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
            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
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

      {/* Mastery Distribution */}
      <Card className="card-glass border-0 p-6">
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

      {/* Topic Stats */}
      <Card className="card-glass border-0 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          📊 Detailed Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{topicMetrics.totalCorrect}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Correct Matches</div>
          </div>
          <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{topicMetrics.totalWrong}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Wrong Matches</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{topicMetrics.learningWords}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Learning</div>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{topicMetrics.challengingWords}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Challenging</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{topicMetrics.newWords}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">New Words</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{topicMetrics.masteredWords}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Mastered</div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => navigate('/game', { state: { topicId: parseInt(topicId) } })}
          size="lg"
          icon="🎮"
          disabled={topicWords.length < MINIMUM_PRACTICE_WORDS}
        >
          Practice This Topic
        </Button>
        <Button
          onClick={() => navigate('/words')}
          size="lg"
          variant="secondary"
          icon="📝"
        >
          View Words
        </Button>
      </div>
    </motion.div>
  );
};

export default TopicDetails;
