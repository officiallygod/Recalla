import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import useContentStore from '../store/contentStore';

// Character limits
const MAX_WORD_LENGTH = 50;
const MAX_MEANING_LENGTH = 60;

const AddWord = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const addWord = useContentStore(state => state.addWord);
  const words = useContentStore(state => state.words);
  const topics = useContentStore(state => state.topics);

  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(location.state?.topicId || null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redirect to topics page if no topic is selected
  const topicIdFromState = location.state?.topicId;
  useEffect(() => {
    if (!topicIdFromState) {
      // If we allow adding words without a pre-selected topic, we might need to show a topic selector.
      // But based on current code, it seems to expect a topicId.
      // However, if the user navigated from Home (Add Word button?), they might not have a topic.
      // Let's check Home.jsx navigation.
      // Home.jsx doesn't have a direct "Add Word" button visible in the snippet I saw earlier, except maybe in "My Words" -> "Add"?
      // Welcome.jsx has "Add" button on topic card which passes state.
      // If no topic is passed, it redirects to welcome.
      // I'll keep this behavior.
      navigate('/welcome', { replace: true });
    }
  }, [topicIdFromState, navigate]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setError('');

    if (!word.trim() || !meaning.trim()) {
      setError('Please fill in both fields');
      return;
    }

    // Check character limits
    if (word.trim().length > MAX_WORD_LENGTH) {
      setError(`Word must be ${MAX_WORD_LENGTH} characters or less`);
      return;
    }

    if (meaning.trim().length > MAX_MEANING_LENGTH) {
      setError(`Meaning must be ${MAX_MEANING_LENGTH} characters or less`);
      return;
    }

    // Check if word already exists
    if (words.some(w => w.word.toLowerCase() === word.trim().toLowerCase())) {
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
  }, [word, meaning, words, addWord, selectedTopic]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Back Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/welcome')}
          icon="←"
        >
          Back to Topics
        </Button>
      </motion.div>

      {/* Title */}
      <Card className="card-glass border-0">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Add New Words</h2>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Build your vocabulary collection</p>
      </Card>

      {/* Form */}
      <Card className="card-glass border-0">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Topic Display */}
          {selectedTopic && topics.length > 0 && (() => {
            const currentTopic = topics.find(t => t.id === selectedTopic);
            return currentTopic ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Topic
                </label>
                <div className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {currentTopic.emoji} {currentTopic.name}
                </div>
              </div>
            ) : null;
          })()}

          {/* Word Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Word
              </label>
              <span className={`text-xs font-medium ${
                word.length >= MAX_WORD_LENGTH 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {word.length}/{MAX_WORD_LENGTH}
              </span>
            </div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              maxLength={MAX_WORD_LENGTH}
              placeholder="Enter word..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Meaning Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Meaning
              </label>
              <span className={`text-xs font-medium ${
                meaning.length >= MAX_MEANING_LENGTH 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {meaning.length}/{MAX_MEANING_LENGTH}
              </span>
            </div>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              maxLength={MAX_MEANING_LENGTH}
              placeholder="Enter meaning..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-700 rounded-xl"
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
                className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl"
              >
                <p className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  ✅ Word added successfully! +5 points
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              icon="✅"
            >
              Add Word
            </Button>
          </motion.div>
        </form>
      </Card>

      {/* Stats */}
      <Card className="card-glass border-0 text-center p-6">
        <p className="text-slate-600 dark:text-slate-300">
          You have <span className="font-bold text-indigo-600 dark:text-indigo-400">{words.length}</span> words in your collection
        </p>
      </Card>
    </motion.div>
  );
};

export default AddWord;
