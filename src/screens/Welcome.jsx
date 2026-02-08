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
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <Card glassEffect className="text-center">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
        >
          Welcome to Your Learning Hub! 🎓
        </motion.h2>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
          Organize your learning with topics and track your progress
        </p>
      </Card>

      {/* German Library Suggestion */}
      <AnimatePresence>
        {showGermanSuggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-600">
              <div className="flex items-start gap-4">
                <motion.div
                  className="text-5xl"
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
                  🇩🇪
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                    Suggested: German Essential 1000 📚
                  </h3>
                  <p className="text-indigo-700 dark:text-indigo-300 mb-4">
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
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddTopic(true)}
            icon="➕"
          >
            Add Topic
          </Button>
          
          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTopic}
              className="hidden"
            />
            <Button
              as="span"
              variant="secondary"
              size="md"
              icon="📥"
            >
              Import Topic
            </Button>
          </label>

          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/')}
            icon="🏠"
          >
            Home
          </Button>
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
            <Card>
              <form onSubmit={handleAddTopic} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Create New Topic
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g., Spanish Vocabulary"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Select Emoji/Flag
                  </label>
                  <EmojiPicker
                    selectedEmoji={newTopicEmoji}
                    onSelect={setNewTopicEmoji}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 rounded-xl">
                    <p className="text-rose-700 dark:text-rose-300 text-sm">❌ {error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon="✅"
                  >
                    Create Topic
                  </Button>
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
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No topics yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Create your first topic to start organizing your learning
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
                <Card hoverable className="h-full">
                  <div className="space-y-5">
                    {/* Topic Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <motion.div
                          className="text-4xl flex-shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {topic.emoji}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                            {topic.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {stats.count} {stats.count === 1 ? 'word' : 'words'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                        ✅ {stats.practiced} practiced
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate('/add-word', { state: { topicId: topic.id } })}
                        icon="➕"
                        fullWidth
                      >
                        Add Words
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/words', { state: { topicId: topic.id } })}
                        icon="📝"
                        fullWidth
                      >
                        View
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {stats.count >= 4 && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => navigate('/game', { state: { topicId: topic.id } })}
                          icon="🎮"
                          fullWidth
                        >
                          Play
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleExportTopic(topic.id)}
                        icon="📤"
                        fullWidth
                      >
                        Export
                      </Button>
                      {stats.count < 4 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteTopic(topic.id)}
                          icon="🗑️"
                          fullWidth
                        >
                          Delete
                        </Button>
                      )}
                    </div>

                    {stats.count >= 4 && (
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteTopic(topic.id)}
                          icon="🗑️"
                          fullWidth
                        >
                          Delete
                        </Button>
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
        <Card glassEffect className="text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {topics.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Topics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {words.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Words</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {words.filter(w => w.lastPracticed).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Practiced</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((words.filter(w => w.lastPracticed).length / Math.max(words.length, 1)) * 100)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Progress</p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default Welcome;
