import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const AddWord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addWord, words, topics } = useGame();
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect to topics page if no topic is selected
  useEffect(() => {
    if (!location.state?.topicId) {
      navigate('/welcome', { replace: true });
    }
  }, [location.state, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!word.trim() || !meaning.trim()) {
      setError('Please fill in both fields');
      return;
    }

    // Check if word already exists
    if (words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
      setError('This word already exists!');
      return;
    }

    // Add word
    addWord(word.trim(), meaning.trim(), selectedTopic);

    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Clear form
    setWord('');
    setMeaning('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Back Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/welcome')}
        icon="←"
      >
        Back to Topics
      </Button>

      {/* Title */}
      <Card glassEffect>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Add New Words</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Build your vocabulary collection</p>
      </Card>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Display */}
          {selectedTopic && topics.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Topic
              </label>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                {topics.find(t => t.id === selectedTopic)?.emoji} {topics.find(t => t.id === selectedTopic)?.name}
              </div>
            </div>
          )}

          {/* Word Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Word
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter word..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Meaning Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Meaning
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="Enter meaning..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors resize-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 rounded-xl"
              >
                <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">❌ {error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl"
              >
                <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  ✅ Word added successfully! +10 points
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            icon="✅"
          >
            Add Word
          </Button>
        </form>
      </Card>

      {/* Stats */}
      <Card glassEffect className="text-center">
        <p className="text-slate-600 dark:text-slate-300">
          You have <span className="font-bold text-primary-600 dark:text-primary-400">{words.length}</span> words in your collection
        </p>
      </Card>
    </motion.div>
  );
};

export default AddWord;
