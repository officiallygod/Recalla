import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const WordsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { words, topics, deleteWord, getWordsByTopic } = useGame();
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);

  useEffect(() => {
    if (location.state?.topicId) {
      setSelectedTopic(location.state.topicId);
    }
  }, [location.state?.topicId]);

  const displayWords = selectedTopic 
    ? getWordsByTopic(selectedTopic)
    : words;

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
              {displayWords.length} {displayWords.length === 1 ? 'word' : 'words'} 
              {currentTopic ? ' in this topic' : ' in your collection'}
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

      {/* Words List */}
      {displayWords.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No words yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Start adding words to build your vocabulary
          </p>
          <Button onClick={() => navigate('/add-word')} icon="➕">
            Add Your First Word
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {displayWords.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hoverable className="group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-1 truncate">
                        {word.word}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        {word.meaning}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          ✅ <span className="font-semibold">{word.correct}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          ❌ <span className="font-semibold">{word.wrong}</span>
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
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default WordsList;
