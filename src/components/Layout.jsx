import React from 'react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { userData } = useGame();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen-mobile flex flex-col">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-x">
          <div className="flex items-center justify-between h-16 min-h-[64px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">
                🎮
              </span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-500 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                Recalla
              </h1>
            </div>

            {/* Stats and Theme Toggle */}
            <div className="flex items-center gap-4 sm:gap-6">
              <StatItem icon="⭐" value={userData.points} label="Points" />
              <StatItem icon="🪙" value={userData.coins} label="Coins" />
              <StatItem icon="🏆" value={userData.level} label="Level" />
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl glass transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                <span className="text-2xl block">
                  {isDark ? '🌙' : '☀️'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 safe-area-x safe-area-bottom">
        {children}
      </main>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass cursor-default">
      <span className="text-xl">
        {icon}
      </span>
      <div className="hidden sm:flex flex-col">
        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{value}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className="sm:hidden text-sm font-bold text-primary-600 dark:text-primary-400">{value}</span>
    </div>
  );
};

export default Layout;
