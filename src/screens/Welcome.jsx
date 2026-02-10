import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import EmojiPicker from '../components/EmojiPicker';
import { useGame } from '../contexts/GameContext';
import germanVocabulary from '../data/germanVocabulary';

const Welcome = () => {
  const navigate = useNavigate();
  const {
    topics,
    words,
    addWord,
    addTopic,
    updateTopic,
    deleteTopic,
    exportTopic,
    importTopic,
    getWordsByTopic
  } = useGame();

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicEmoji, setNewTopicEmoji] = useState('📚');
  const [editingTopic, setEditingTopic] = useState(null);
  const [error, setError] = useState('');
  const [showGermanSuggestion, setShowGermanSuggestion] = useState(false);
  const [isImportingGerman, setIsImportingGerman] = useState(false);

  // Check if user has German-related topics or words
  useEffect(() => {
    // Only check if suggestion is not already shown or dismissed
    const germanTopicExists = topics.some(t => 
      t.name === germanVocabulary.topic.name
    );
    
    // Skip if library already imported
    if (germanTopicExists) {
      setShowGermanSuggestion(false);
      return;
    }
    
    const hasGermanTopic = topics.some(t => 
      t.name.toLowerCase().includes('german') || 
      t.name.toLowerCase().includes('deutsch') ||
      t.emoji === '🇩🇪'
    );
    
    const hasGermanWords = words.some(w => 
      w.word && /[äöüßÄÖÜ]/.test(w.word)
    );
    
    // Show suggestion if user has German content but hasn't imported the pre-built library
    if ((hasGermanTopic || hasGermanWords) && !showGermanSuggestion) {
      setShowGermanSuggestion(true);
    }
  }, [topics, words, showGermanSuggestion]);

  const handleImportGermanLibrary = async () => {
    setIsImportingGerman(true);
    setError('');
    
    try {
      // Create the German topic
      const newTopic = addTopic(
        germanVocabulary.topic.name,
        germanVocabulary.topic.emoji
      );
      
      // Import all words into the new topic
      let successCount = 0;
      let skipCount = 0;
      
      for (const wordData of germanVocabulary.words) {
        // Check if word already exists
        const wordExists = words.some(w => 
          w.word.toLowerCase() === wordData.word.toLowerCase()
        );
        
        if (!wordExists) {
          addWord(wordData.word, wordData.meaning, newTopic.id);
          successCount++;
        } else {
          skipCount++;
        }
      }
      
      alert(`✅ Successfully imported ${successCount} German words!${skipCount > 0 ? `\n(Skipped ${skipCount} duplicate words)` : ''}`);
      setShowGermanSuggestion(false);
    } catch (err) {
      setError('Failed to import German library. Please try again.');
      console.error(err);
    } finally {
      setIsImportingGerman(false);
    }
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    setError('');

    if (!newTopicName.trim()) {
      setError('Please enter a topic name');
      return;
    }

    if (topics.some(t => t.name.toLowerCase() === newTopicName.toLowerCase())) {
      setError('Topic already exists!');
      return;
    }

    addTopic(newTopicName.trim(), newTopicEmoji);
    setNewTopicName('');
    setNewTopicEmoji('📚');
    setShowAddTopic(false);
    setError('');
  };

  const handleUpdateTopic = (topicId, name, emoji) => {
    updateTopic(topicId, { name, emoji });
    setEditingTopic(null);
  };

  const handleExportTopic = (topicId) => {
    const data = exportTopic(topicId);
    if (!data) {
      alert('Failed to export topic');
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.topic.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTopic = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const result = importTopic(data);
        
        if (result.success) {
          alert(`Successfully imported topic: ${result.topic.name}`);
        } else {
          alert(`Failed to import: ${result.error}`);
        }
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleDeleteTopic = (topicId) => {
    const topic = topics.find(t => t.id === topicId);
    const wordCount = getWordsByTopic(topicId).length;
    
    if (window.confirm(
      `Are you sure you want to delete "${topic.name}"? This will also delete ${wordCount} word(s).`
    )) {
      deleteTopic(topicId);
    }
  };

  const getTopicStats = (topicId) => {
    const topicWords = getWordsByTopic(topicId);
    return {
      count: topicWords.length,
      practiced: topicWords.filter(w => w.lastPracticed).length
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto pb-8"
    >
      {/* Header with Modern Design */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-8 sm:p-12"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
          >
            Your Learning Hub 🎓
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Organize your learning with topics and track your progress
          </motion.p>
        </div>
      </motion.div>

      {/* German Library Suggestion with Enhanced Design */}
      <AnimatePresence>
        {showGermanSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card-glass border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <motion.div
                  className="flex-shrink-0"
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <div className="text-6xl w-20 h-20 flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
                    🇩🇪
                  </div>
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                    German Essential 1000 📚
                  </h3>
                  <p className="text-indigo-700 dark:text-indigo-300 mb-4 leading-relaxed">
                    We noticed you're learning German! Get instant access to 1000 carefully curated German words (A2-C2 level) from internet usage patterns. Perfect for building a strong vocabulary foundation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleImportGermanLibrary}
                      disabled={isImportingGerman}
                      icon={isImportingGerman ? "⏳" : "📥"}
                    >
                      {isImportingGerman ? 'Importing...' : 'Import German Library'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setShowGermanSuggestion(false)}
                      icon="✕"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAddTopic(true)}
              icon="➕"
            >
              Add Topic
            </Button>
          </motion.div>
          
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTopic}
              className="hidden"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                as="span"
                variant="secondary"
                size="md"
                icon="📥"
              >
                Import Topic
              </Button>
            </motion.div>
          </label>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/')}
              icon="🏠"
            >
              Home
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Add Topic Form */}
      <AnimatePresence>
        {showAddTopic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="card-glass border-0">
              <form onSubmit={handleAddTopic} className="space-y-6 p-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Create New Topic
                </h3>
                
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g., Spanish Vocabulary"
                    className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-base font-medium placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Select Emoji/Flag
                  </label>
                  <EmojiPicker
                    selectedEmoji={newTopicEmoji}
                    onSelect={setNewTopicEmoji}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-700 rounded-xl"
                  >
                    <p className="text-rose-700 dark:text-rose-300 text-sm font-semibold">❌ {error}</p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                    <Button
                      type="submit"
                      variant="primary"
                      icon="✅"
                      fullWidth
                    >
                      Create Topic
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAddTopic(false);
                        setError('');
                        setNewTopicName('');
                        setNewTopicEmoji('📚');
                      }}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="card-glass border-0 text-center py-16">
            <motion.div 
              className="text-7xl mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              📚
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">
              No topics yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create your first topic to start organizing your learning journey
            </p>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topics.map((topic, index) => {
            const stats = getTopicStats(topic.id);
            const isEditing = editingTopic === topic.id;

            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full card-glass border-0 hover-lift group">
                  <div className="space-y-5 p-6">
                    {/* Topic Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <motion.div
                          className="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {topic.emoji}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {topic.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {stats.count} {stats.count === 1 ? 'word' : 'words'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Badge */}
                    <div className="flex gap-2 text-xs">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-semibold border border-emerald-200 dark:border-emerald-800">
                        ✅ {stats.practiced} practiced
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => navigate('/add-word', { state: { topicId: topic.id } })}
                          icon="➕"
                          fullWidth
                        >
                          Add Words
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/words', { state: { topicId: topic.id } })}
                          icon="📝"
                          fullWidth
                        >
                          View
                        </Button>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {stats.count >= 4 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => navigate('/game', { state: { topicId: topic.id } })}
                            icon="🎮"
                            fullWidth
                          >
                            Play
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleExportTopic(topic.id)}
                          icon="📤"
                          fullWidth
                        >
                          Export
                        </Button>
                      </motion.div>
                      {stats.count < 4 && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDeleteTopic(topic.id)}
                            icon="🗑️"
                            fullWidth
                          >
                            Delete
                          </Button>
                        </motion.div>
                      )}
                    </div>

                    {stats.count >= 4 && (
                      <div className="grid grid-cols-1 gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDeleteTopic(topic.id)}
                            icon="🗑️"
                            fullWidth
                          >
                            Delete
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {topics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: topics.length * 0.05 + 0.2 }}
        >
          <Card className="card-glass border-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
              <div className="text-center">
                <motion.p 
                  className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {topics.length}
                </motion.p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">Topics</p>
              </div>
              <div className="text-center">
                <motion.p 
                  className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {words.length}
                </motion.p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">Total Words</p>
              </div>
              <div className="text-center">
                <motion.p 
                  className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {words.filter(w => w.lastPracticed).length}
                </motion.p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">Practiced</p>
              </div>
              <div className="text-center">
                <motion.p 
                  className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.1 }}
                >
                  {Math.round((words.filter(w => w.lastPracticed).length / Math.max(words.length, 1)) * 100)}%
                </motion.p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mt-1">Progress</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Welcome;
