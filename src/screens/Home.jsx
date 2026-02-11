import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Gamepad2, BookOpen, BarChart3, GraduationCap, Lightbulb, Clock, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';
import { hapticLight } from '../utils/haptic';

const Home = () => {
  const navigate = useNavigate();
  const { words } = useGame();
  const [timerDuration, setTimerDuration] = useState(30);
  const [difficulty, setDifficulty] = useState('easy'); // 'easy' or 'hard'

  const menuItems = [
    {
      title: 'Topics',
      icon: Target,
      description: 'Manage your learning topics',
      path: '/welcome',
      variant: 'primary',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Play Match Game',
      icon: Gamepad2,
      description: 'Match words with their meanings',
      path: '/game',
      variant: 'success',
      gradient: 'from-emerald-500 to-teal-600',
      disabled: words.length < 8,
      state: { timerDuration, difficulty }
    },
    {
      title: 'My Words',
      icon: BookOpen,
      description: `${words.length} words in your collection`,
      path: '/words',
      variant: 'secondary',
      gradient: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Statistics',
      icon: BarChart3,
      description: 'View your progress and stats',
      path: '/stats',
      variant: 'secondary',
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  return (
    <div className="space-y-8 sm:space-y-12 pb-8">
      {/* Hero Section with Nike-style Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-8 sm:p-12 lg:p-16"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">🤖 AI Mode Active</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              <span className="block">Welcome to</span>
              <span className="relative inline-block">
                Recalla!
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
              AI-Powered Learning: Smart word selection, adaptive difficulty, and personalized insights to supercharge your vocabulary
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Game Settings Cards with Modern Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Difficulty Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 card-glass hover-lift border-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">Difficulty</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Choose your challenge level</span>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticLight();
                    setDifficulty('easy');
                  }}
                  className={`
                    flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                    ${difficulty === 'easy'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {difficulty === 'easy' && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">Easy</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    hapticLight();
                    setDifficulty('hard');
                  }}
                  className={`
                    flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                    ${difficulty === 'hard'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {difficulty === 'hard' && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className="relative z-10">Hard</span>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timer Selection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6 card-glass hover-lift border-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 block">Game Timer</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Set your time limit</span>
                </div>
              </div>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((duration) => (
                  <motion.button
                    key={duration}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      hapticLight();
                      setTimerDuration(duration);
                    }}
                    className={`
                      flex-1 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                      ${timerDuration === duration
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    {timerDuration === duration && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <span className="relative z-10">{duration}s</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Menu Grid with Nike-style Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <Card
                onClick={!item.disabled ? () => navigate(item.path, { state: item.state }) : undefined}
                className={`
                  group relative overflow-hidden p-6 sm:p-8 card-glass border-0
                  ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover-lift'}
                `}
              >
                {/* Gradient Background on Hover */}
                {!item.disabled && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                )}

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.gradient} mb-4 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {!item.disabled && (
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <ArrowRight className="w-6 h-6 text-slate-400" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Notice Card */}
      {words.length < 8 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Card className="card-glass border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-4 p-6">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Getting Started
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Add at least 8 words to unlock the Match Game and start learning!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
