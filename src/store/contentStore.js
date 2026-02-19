import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useUserStore from './userStore';

let idCounter = 0;
export const generateUniqueId = () => {
  return Date.now() + idCounter++;
};

const useContentStore = create(
  persist(
    (set, get) => ({
      words: [],
      topics: [],

      setWords: (words) => set({ words }),
      setTopics: (topics) => set({ topics }),

      addWord: (word, meaning, topicId = null) => {
        const newWord = {
          id: generateUniqueId(),
          word,
          meaning,
          topicId,
          correct: 0,
          wrong: 0,
          lastPracticed: null,
          masteryScore: 0,
          consecutiveCorrect: 0
        };

        set((state) => ({ words: [...state.words, newWord] }));

        // Award points in user store
        useUserStore.getState().addPoints(5);

        return newWord;
      },

      deleteWord: (id) =>
        set((state) => ({ words: state.words.filter((w) => w.id !== id) })),

      updateWordStats: (id, isCorrect) =>
        set((state) => ({
          words: state.words.map((w) => {
            if (w.id === id) {
                const newConsecutiveCorrect = isCorrect ? (w.consecutiveCorrect || 0) + 1 : 0;
                const totalAttempts = (w.correct || 0) + (w.wrong || 0) + 1;
                const correctCount = isCorrect ? (w.correct || 0) + 1 : (w.correct || 0);

                const MASTERY_CONSECUTIVE_THRESHOLD = 5;
                const MASTERY_PRACTICE_THRESHOLD = 20;
                const MASTERY_MIN_PRACTICE_THRESHOLD = 5;

                const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) : 0;
                const consecutiveBonus = Math.min(newConsecutiveCorrect / MASTERY_CONSECUTIVE_THRESHOLD, 1);
                const practiceBonus = Math.min(totalAttempts / MASTERY_PRACTICE_THRESHOLD, 1);

                const practicePenalty = totalAttempts < MASTERY_MIN_PRACTICE_THRESHOLD ? (totalAttempts / MASTERY_MIN_PRACTICE_THRESHOLD) : 1;

                const masteryScore = Math.round(
                  (accuracy * 60 + consecutiveBonus * 30 + practiceBonus * 10) * practicePenalty
                );

                return {
                  ...w,
                  correct: isCorrect ? (w.correct || 0) + 1 : (w.correct || 0),
                  wrong: !isCorrect ? (w.wrong || 0) + 1 : (w.wrong || 0),
                  lastPracticed: Date.now(),
                  consecutiveCorrect: newConsecutiveCorrect,
                  masteryScore: masteryScore
                };
            }
            return w;
          })
        })),

      addTopic: (name, emoji = '📚') => {
        const newTopic = {
          id: generateUniqueId(),
          name,
          emoji,
          createdAt: Date.now()
        };
        set((state) => ({ topics: [...state.topics, newTopic] }));
        return newTopic;
      },

      updateTopic: (id, updates) =>
        set((state) => ({
          topics: state.topics.map((t) => (t.id === id ? { ...t, ...updates } : t))
        })),

      deleteTopic: (id) =>
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
          words: state.words.filter((w) => w.topicId !== id)
        })),

      importTopic: (data) => {
        try {
          if (!data.topic || !data.words || !Array.isArray(data.words)) {
            throw new Error('Invalid topic data format');
          }
          const newTopicId = generateUniqueId();
          const newTopic = { ...data.topic, id: newTopicId, createdAt: Date.now() };
          const newWords = data.words.map((word) => ({
            ...word,
            id: generateUniqueId(),
            topicId: newTopicId
          }));

          set((state) => ({
            topics: [...state.topics, newTopic],
            words: [...state.words, ...newWords]
          }));

          return { success: true, topic: newTopic };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      exportTopic: (topicId) => {
        const state = get();
        const topic = state.topics.find(t => t.id === topicId);
        const topicWords = state.words.filter(w => w.topicId === topicId);

        if (!topic) return null;

        return {
          topic,
          words: topicWords,
          exportedAt: Date.now(),
          version: '1.0'
        };
      },

      getWordsByTopic: (topicId) => {
          return get().words.filter(w => w.topicId === topicId);
      }
    }),
    {
      name: 'recalla-content-storage',
      // Default is localStorage
    }
  )
);

export default useContentStore;
