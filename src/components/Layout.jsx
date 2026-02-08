import React from 'react';
import { Gamepad2, Star, Coins, Trophy, Sun, Moon } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { userData } = useGame();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen-mobile flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-x">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Recalla
              </h1>
            </div>

            {/* Stats and Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              <StatItem icon={<Star className="w-4 h-4" />} value={userData.points} label="Points" />
              <StatItem icon={<Coins className="w-4 h-4" />} value={userData.coins} label="Coins" />
              <StatItem icon={<Trophy className="w-4 h-4" />} value={userData.level} label="Level" />
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 safe-area-x safe-area-bottom">
        {children}
      </main>
    </div>
  );
};

const StatItem = ({ icon, value, label }) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
      <span className="text-primary-600 dark:text-primary-400">
        {icon}
      </span>
      <div className="hidden sm:flex flex-col">
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className="sm:hidden text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
};

export default Layout;
