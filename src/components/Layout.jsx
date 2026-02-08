import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { Star, Coins, Trophy, Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { userData } = useGame();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen-mobile flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 safe-area-top shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-x">
          <div className="flex items-center justify-between h-16 min-h-[64px]">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              >
                🎮
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                Recalla
              </h1>
            </motion.div>

            {/* Stats and Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <StatItem 
                icon={<Star className="w-5 h-5 text-yellow-500" fill="currentColor" />} 
                value={userData.points} 
                label="Points" 
              />
              <StatItem 
                icon={<Coins className="w-5 h-5 text-amber-500" />} 
                value={userData.coins} 
                label="Coins" 
              />
              <StatItem 
                icon={<Trophy className="w-5 h-5 text-amber-600" />} 
                value={userData.level} 
                label="Level" 
              />
              
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all hover:shadow-md text-amber-500"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 safe-area-x safe-area-bottom">
        {children}
      </main>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 transition-all"
    >
      {icon}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block">{label}</span>
      </div>
    </motion.div>
  );
};

export default Layout;
