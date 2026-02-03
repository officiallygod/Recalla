import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

const Home = () => {
  const navigate = useNavigate();
  const { words } = useGame();

  const menuItems = [
    {
      title: 'Topics',
      icon: '🎯',
      description: 'Manage your learning topics',
      path: '/welcome',
      variant: 'primary'
    },
    {
      title: 'Add Words',
      icon: '➕',
      description: 'Add new words to your vocabulary',
      path: '/add-word',
      variant: 'primary'
    },
    {
      title: 'Play Match Game',
      icon: '🎮',
      description: 'Match words with their meanings',
      path: '/game',
      variant: 'success',
      disabled: words.length < 4
    },
    {
      title: 'My Words',
      icon: '📚',
      description: `${words.length} words in your collection`,
      path: '/words',
      variant: 'secondary'
    },
    {
      title: 'Statistics',
      icon: '📊',
      description: 'View your progress and stats',
      path: '/stats',
      variant: 'secondary'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 sm:space-y-8 pb-4"
    >
      {/* Welcome Card */}
      <Card glassEffect className="text-center p-6 sm:p-8">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Welcome to Recalla! 🎓
          </motion.h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Learn and remember words through fun interactive games
          </p>
        </motion.div>
      </Card>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-5 gap-3 sm:gap-4">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            whileHover={{ scale: item.disabled ? 1 : 1.02 }}
          >
            <Card
              onClick={!item.disabled ? () => navigate(item.path) : undefined}
              className={`
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                hover:shadow-xl transition-shadow min-h-[100px]
              `}
              pressable={!item.disabled}
              hoverable={!item.disabled}
            >
              <div className="flex items-center gap-3 sm:gap-4 p-2">
                <motion.div 
                  className="text-4xl sm:text-5xl flex-shrink-0"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  {item.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {words.length < 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700">
            <p className="text-amber-800 dark:text-amber-200">
              💡 Add at least 4 words to unlock the Match Game!
            </p>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
