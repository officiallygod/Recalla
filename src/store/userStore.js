import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

const cookieStorage = {
  getItem: (name) => {
    return Cookies.get(name) || null;
  },
  setItem: (name, value) => {
    // Store cookie for 365 days
    Cookies.set(name, value, { expires: 365 });
  },
  removeItem: (name) => {
    Cookies.remove(name);
  },
};

const useUserStore = create(
  persist(
    (set, get) => ({
      userData: {
        points: 0,
        coins: 0,
        level: 1,
        totalGames: 0,
        correctMatches: 0,
        wrongMatches: 0,
        firstUsedDate: null,
      },
      isDark: false, // Default theme

      setUserData: (data) => set({ userData: data }),
      setIsDark: (isDark) => set({ isDark }),
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),

      addPoints: (points) =>
        set((state) => {
          const newPoints = state.userData.points + points;

          // Check level up logic
          const pointsPerLevel = 2500;
          let requiredPoints = 0;
          let level = 1;

          while (requiredPoints <= newPoints) {
            requiredPoints += pointsPerLevel * level;
            level++;
          }

          const newLevel = level - 1;

          return {
            userData: {
              ...state.userData,
              points: newPoints,
              level: Math.max(state.userData.level, newLevel),
              firstUsedDate: state.userData.firstUsedDate || Date.now()
            }
          };
        }),

      awardPoints: (points, coins, roundNumber = 0) =>
        set((state) => {
          const shouldAwardCoins = roundNumber >= 50;
          const newPoints = state.userData.points + points;
          const newCoins = state.userData.coins + (shouldAwardCoins ? coins : 0);

          const pointsPerLevel = 2500;
          let requiredPoints = 0;
          let level = 1;

          while (requiredPoints <= newPoints) {
            requiredPoints += pointsPerLevel * level;
            level++;
          }

          const newLevel = level - 1;

          return {
            userData: {
              ...state.userData,
              points: newPoints,
              coins: newCoins,
              level: Math.max(state.userData.level, newLevel),
              firstUsedDate: state.userData.firstUsedDate || Date.now()
            }
          };
        }),

      recordMatch: (isCorrect) =>
        set((state) => ({
          userData: {
            ...state.userData,
            correctMatches: isCorrect ? state.userData.correctMatches + 1 : state.userData.correctMatches,
            wrongMatches: !isCorrect ? state.userData.wrongMatches + 1 : state.userData.wrongMatches,
            firstUsedDate: state.userData.firstUsedDate || Date.now()
          }
        })),

      incrementGamesPlayed: () =>
        set((state) => ({
          userData: {
            ...state.userData,
            totalGames: state.userData.totalGames + 1,
            firstUsedDate: state.userData.firstUsedDate || Date.now()
          }
        })),

      checkLevelUp: () => {
        set((state) => {
            const pointsPerLevel = 2500;
            let requiredPoints = 0;
            let level = 1;
            while (requiredPoints <= state.userData.points) {
                requiredPoints += pointsPerLevel * level;
                level++;
            }
            const newLevel = level - 1;
            if (newLevel > state.userData.level) {
                return { userData: { ...state.userData, level: newLevel } };
            }
            return {};
        });
      }
    }),
    {
      name: 'recalla-user-storage',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);

export default useUserStore;
