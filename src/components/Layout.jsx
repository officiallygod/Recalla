import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';

const Layout = ({ children }) => {
  const { userData } = useGame();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-dark sticky top-0 z-50 border-b border-slate-200/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🎮</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Recalla
              </h1>
            </motion.div>

            {/* Stats */}
            <div className="flex items-center gap-4 sm:gap-6">
              <StatItem icon="⭐" value={userData.points} label="Points" />
              <StatItem icon="🪙" value={userData.coins} label="Coins" />
              <StatItem icon="🏆" value={userData.level} label="Level" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl glass transition-all cursor-default"
    >
      <span className="text-2xl">{icon}</span>
      <div className="hidden sm:flex flex-col">
        <span className="text-sm font-bold text-primary-600">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="sm:hidden text-sm font-bold text-primary-600">{value}</span>
    </motion.div>
  );
};

export default Layout;
