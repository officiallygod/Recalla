import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const WordsList = () => {
  const navigate = useNavigate();
  const { words, deleteWord } = useGame();

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
        <h2 className="text-3xl font-bold text-slate-900">My Words</h2>
        <p className="text-slate-600 mt-2">
          {words.length} {words.length === 1 ? 'word' : 'words'} in your collection
        </p>
      </Card>

      {/* Words List */}
      {words.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No words yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start adding words to build your vocabulary
          </p>
          <Button onClick={() => navigate('/add-word')} icon="➕">
            Add Your First Word
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {words.map((word, index) => (
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
                      <h3 className="text-xl font-bold text-primary-600 mb-1 truncate">
                        {word.word}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {word.meaning}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
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
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors font-semibold opacity-0 group-hover:opacity-100"
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
