import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { migrateToZustand } from './utils/migrateData';
import useUserStore from './store/userStore';

// Lazy load route components for code splitting
const Home = lazy(() => import('./screens/Home'));
const Welcome = lazy(() => import('./screens/Welcome'));
const AddWord = lazy(() => import('./screens/AddWord'));
const WordsList = lazy(() => import('./screens/WordsList'));
const Game = lazy(() => import('./screens/Game'));
const Statistics = lazy(() => import('./screens/Statistics'));
const TopicDetails = lazy(() => import('./screens/TopicDetails'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  const isDark = useUserStore(state => state.isDark);

  useEffect(() => {
    // Run migration on mount
    migrateToZustand();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router basename="/Recalla">
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/add-word" element={<AddWord />} />
            <Route path="/words" element={<WordsList />} />
            <Route path="/game" element={<Game />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/stats/topic/:topicId" element={<TopicDetails />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
