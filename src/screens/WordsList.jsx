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
    if (window.confirm('Are you sure you want to delete this word?')) {
      deleteWord(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-6"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {currentTopic ? `${currentTopic.emoji} ${currentTopic.name}` : 'My Words'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {filteredWords.length} {filteredWords.length === 1 ? 'word' : 'words'} 
              {searchQuery ? ' found' : (currentTopic ? ' in this topic' : ' in your collection')}
            </p>
          </div>
          {topics.length > 0 && (
            <select
              value={selectedTopic || ''}
              onChange={(e) => setSelectedTopic(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
      </Card>

      {/* Search Bar */}
      {displayWords.length > 0 && (
        <Card glassEffect>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words or meanings..."
              className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Words List */}
      {displayWords.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No words yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Start adding words through topics to build your vocabulary
          </p>
          <Button onClick={() => navigate('/welcome')} icon="🎯">
            Go to Topics
          </Button>
        </Card>
      ) : filteredWords.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No words found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Try a different search term
          </p>
          <Button onClick={() => setSearchQuery('')} icon="✖️">
            Clear Search
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredWords.map((word, index) => {
              const insights = getWordInsights(word);
              return (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: 100,
                    scale: 0.8,
                    transition: { duration: 0.4, ease: "easeInOut" }
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hoverable className="group">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{insights.emoji}</span>
                          <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
                            {word.word}
                          </h3>
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {insights.status}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">
                          {word.meaning}
                        </p>
                        <div className="flex gap-4 items-center text-xs">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <span>Mastery:</span>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                                style={{ width: `${word.masteryScore || 0}%` }}
                              />
                            </div>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {word.masteryScore || 0}%
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            ✅ <span className="font-semibold text-emerald-600 dark:text-emerald-400">{word.correct}</span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            ❌ <span className="font-semibold text-rose-600 dark:text-rose-400">{word.wrong}</span>
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(word.id)}
                        className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-colors font-semibold opacity-0 group-hover:opacity-100"
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
