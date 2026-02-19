import useUserStore from '../store/userStore';
import useContentStore from '../store/contentStore';

const STORAGE_KEYS = {
  WORDS: 'recalla_words',
  USER_DATA: 'recalla_user_data',
  TOPICS: 'recalla_topics',
  MIGRATION_FLAG: 'recalla_migrated_v3'
};

export const migrateToZustand = () => {
  try {
    const hasMigrated = localStorage.getItem(STORAGE_KEYS.MIGRATION_FLAG);
    if (hasMigrated) return;

    console.log('Migrating data to Zustand stores...');

    const storedWords = localStorage.getItem(STORAGE_KEYS.WORDS);
    const storedUserData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const storedTopics = localStorage.getItem(STORAGE_KEYS.TOPICS);

    // Migrate Words
    if (storedWords) {
      const parsedWords = JSON.parse(storedWords);
      // Ensure fields exist (same logic as GameContext)
      const migratedWords = parsedWords.map(word => ({
        ...word,
        masteryScore: word.masteryScore ?? 0,
        consecutiveCorrect: word.consecutiveCorrect ?? 0
      }));
      useContentStore.getState().setWords(migratedWords);
    }

    // Migrate User Data
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      // Ensure fields exist
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const DEFAULT_ACTIVE_USER_DAYS = 7;
      let defaultFirstUsedDate = Date.now();
      const hasActivity = parsedUserData.totalGames > 0 ||
                         parsedUserData.correctMatches > 0 ||
                         (storedWords && JSON.parse(storedWords).length > 0);

      if (hasActivity) {
        defaultFirstUsedDate = Date.now() - (DEFAULT_ACTIVE_USER_DAYS * MS_PER_DAY);
      }

      const migratedUserData = {
        ...parsedUserData,
        firstUsedDate: parsedUserData.firstUsedDate ?? defaultFirstUsedDate
      };

      useUserStore.getState().setUserData(migratedUserData);
    }

    // Migrate Topics
    if (storedTopics) {
      const parsedTopics = JSON.parse(storedTopics);
      useContentStore.getState().setTopics(parsedTopics);
    }

    // Mark as migrated
    localStorage.setItem(STORAGE_KEYS.MIGRATION_FLAG, 'true');
    console.log('Migration complete.');

  } catch (error) {
    console.error('Migration failed:', error);
  }
};
