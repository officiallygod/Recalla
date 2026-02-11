import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Star, Coins, Trophy, Sun, Moon } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useTheme } from '../contexts/ThemeContext';
import { formatNumber } from '../utils/numberFormatter';
import { motion } from 'framer-motion';
import { hapticLight } from '../utils/haptic';

const Layout = React.memo(({ children }) => {
  const navigate = useNavigate();
  const { userData } = useGame();
  const { isDark, toggleTheme } = useTheme();

  const handleThemeToggle = useCallback(() => {
    hapticLight();
    toggleTheme();
  }, [toggleTheme]);

  const navigateToStats = useCallback(() => navigate('/stats'), [navigate]);

  const formattedPoints = useMemo(() => formatNumber(userData.points), [userData.points]);
  const formattedCoins = useMemo(() => formatNumber(userData.coins), [userData.coins]);

  return (
    <div className="min-h-screen-mobile flex flex-col">
      {/* Modern Header with Glass Effect */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 safe-area-top backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 overflow-x-hidden"
        style={{
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 safe-area-x overflow-x-hidden">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo with Animation */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl blur-lg opacity-30 dark:opacity-40"></div>
                <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400 relative z-10" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Recalla
                </span>
              </h1>
            </motion.div>

            {/* Stats and Theme Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <StatItem icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />} value={formattedPoints} label="Points" color="indigo" onClick={navigateToStats} />
              <StatItem icon={<Coins className="w-4 h-4 sm:w-5 sm:h-5" />} value={formattedCoins} label="Coins" color="amber" onClick={navigateToStats} />
              <StatItem icon={<Trophy className="w-4 h-4 sm:w-5 sm:h-5" />} value={userData.level} label="Level" color="purple" onClick={navigateToStats} />
              
              {/* Theme Toggle with Modern Design */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleThemeToggle}
                className="relative p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-300 dark:border-slate-600 transition-all duration-300 hover:shadow-lg"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {isDark ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-600" />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 safe-area-x safe-area-bottom">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

const StatItem = React.memo(({ icon, value, label, color = 'primary', onClick }) => {
  const iconColorClasses = {
    indigo: 'text-indigo-500 dark:text-indigo-400',
    amber: 'text-amber-500 dark:text-amber-400',
    purple: 'text-purple-500 dark:text-purple-400',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >

      <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg whitespace-nowrap">
        <span className={iconColorClasses[color]}>
          {icon}
        </span>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        </div>
        <span className="sm:hidden text-xs font-bold text-slate-900 dark:text-slate-100">{value}</span>
      </div>
    </motion.div>
  );
});

StatItem.displayName = 'StatItem';

export default Layout;
