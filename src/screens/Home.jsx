import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Gamepad2, BookOpen, BarChart3, GraduationCap, Lightbulb, Clock } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useGame } from '../contexts/GameContext';

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
      variant: 'primary'
    },
    {
      title: 'Play Match Game',
      icon: Gamepad2,
      description: 'Match words with their meanings',
      path: '/game',
      variant: 'success',
      disabled: words.length < 8, // Need 8 words for 4 per column in 4-col layout
      state: { timerDuration, difficulty }
    },
    {
      title: 'My Words',
      icon: BookOpen,
      description: `${words.length} words in your collection`,
      path: '/words',
      variant: 'secondary'
    },
    {
      title: 'Statistics',
      icon: BarChart3,
      description: 'View your progress and stats',
      path: '/stats',
      variant: 'secondary'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Welcome Card */}
      <Card className="text-center p-4 sm:p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Welcome to Recalla!
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          AI-Powered Learning: Smart word selection, adaptive difficulty, and personalized insights
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">🤖 AI Mode Active</span>
        </div>
      </Card>

      {/* Game Settings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Difficulty Selection Card */}
        <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Difficulty:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDifficulty('easy')}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${difficulty === 'easy'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                Easy
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`
                  flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${difficulty === 'hard'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                Hard
              </button>
            </div>
          </div>
        </Card>

        {/* Timer Selection Card */}
        <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Game Timer:</span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((duration) => (
                <button
                  key={duration}
                  onClick={() => setTimerDuration(duration)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${timerDuration === duration
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {duration}s
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card
              key={item.path}
              onClick={!item.disabled ? () => navigate(item.path, { state: item.state }) : undefined}
              className={`
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
                ${!item.disabled ? 'hover:border-indigo-300 dark:hover:border-indigo-600' : ''}
                transition-all duration-200
              `}
            >
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex-shrink-0">
                  <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-0.5 truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {words.length < 8 && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2 p-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Add at least 8 words to unlock the Match Game!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Home;
