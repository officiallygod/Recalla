import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { getWordInsights } from '../utils/aiWordSelector';

const WordsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { words, topics, deleteWord, getWordsByTopic } = useGame();
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (location.state?.topicId) {
      setSelectedTopic(location.state.topicId);
    }
  }, [location.state?.topicId]);

  const displayWords = selectedTopic 
    ? getWordsByTopic(selectedTopic)
    : words;

  // Filter words based on search query
  const filteredWords = displayWords.filter(word => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      word.word.toLowerCase().includes(query) ||
      word.meaning.toLowerCase().includes(query)
    );
  });

  const currentTopic = selectedTopic 
    ? topics.find(t => t.id === selectedTopic)
    : null;

  const handleDelete = (id) => {
    // Safety check: ensure id is valid
    if (!id || id === undefined || id === null) {
      console.error('Attempted to delete word with invalid id:', id);
      return;
    }
    if (window.confirm('Are you sure you want to delete this word?')) {
      deleteWord(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-8"
    >
      {/* Back Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate('/')}
          icon="←"
        >
          Back to Home
        </Button>
      </motion.div>

      {/* Gradient Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-700 dark:via-indigo-700 dark:to-cyan-700 p-8 sm:p-12"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
                {currentTopic ? `${currentTopic.emoji} ${currentTopic.name}` : '📚 My Words'}
              </h2>
              <p className="text-lg text-white/90">
                <span className="font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  {filteredWords.length} {filteredWords.length === 1 ? 'word' : 'words'}
                </span>
                <span className="ml-2">
                  {searchQuery ? 'found' : (currentTopic ? 'in this topic' : 'in your collection')}
                </span>
              </p>
            </div>
            {topics.length > 0 && (
              <motion.select
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                value={selectedTopic || ''}
                onChange={(e) => setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)}
                className="px-5 py-3 rounded-xl border-2 border-white/30 focus:border-white/60 focus:outline-none transition-all bg-white/10 backdrop-blur-md text-white font-bold text-base"
              >
                <option value="" className="text-slate-900">All Topics</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id} className="text-slate-900">
                    {topic.emoji} {topic.name}
                  </option>
                ))}
              </motion.select>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Bar with Glassmorphism */}
      {displayWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-glass border-0">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-indigo-500 dark:text-indigo-400" size={22} aria-hidden="true" />
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words or meanings..."
                className="w-full pl-14 pr-14 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base font-medium"
              />
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
                >
                  <X size={22} aria-hidden="true" />
                </motion.button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Words List */}
      {displayWords.length === 0 ? (
        <Card className="card-glass border-0 text-center py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3">
              No words yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Start adding words through topics to build your vocabulary
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate('/welcome')} icon="🎯" size="lg">
                Go to Topics
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      ) : filteredWords.length === 0 ? (
        <Card className="card-glass border-0 text-center py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3">
              No words found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
              Try a different search term
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setSearchQuery('')} icon="✖️" size="lg">
                Clear Search
              </Button>
            </motion.div>
          </motion.div>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="sync">
            {filteredWords.map((word, index) => {
              const insights = getWordInsights(word);
              return (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: 100,
                    scale: 0.8,
                    transition: { duration: 0.4, ease: "easeInOut" }
                  }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="card-glass border-0 group hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{insights.emoji}</span>
                          <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
                            {word.word}
                          </h3>
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1 text-xs font-black rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300"
                          >
                            {insights.status}
                          </motion.span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-base font-medium mb-4">
                          {word.meaning}
                        </p>
                        <div className="flex gap-6 items-center text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="font-bold">Mastery:</span>
                            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${word.masteryScore || 0}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                              />
                            </div>
                            <span className="font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                              {word.masteryScore || 0}%
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            ✅ <span className="font-black text-emerald-600 dark:text-emerald-400">{word.correct}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            ❌ <span className="font-black text-rose-600 dark:text-rose-400">{word.wrong}</span>
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(word.id)}
                        className="px-5 py-3 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-all font-black opacity-0 group-hover:opacity-100 text-lg"
                      >
                        🗑️
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default WordsList;
