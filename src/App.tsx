import { useState, useEffect } from 'react'
import FantasyPage from '../app/fantasy/page'
import JournalPage from '../app/journal/page'
import QuizPage from '../app/quiz/page'
import PinLock from './components/PinLock'
import { storageService } from './utils/storage'
import './App.css'

type Page = 'home' | 'fantasy' | 'journal' | 'quiz'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const settings = await storageService.getSettings();
      // If no PIN is set, consider it unlocked
      if (!settings.pinHash) {
        setIsUnlocked(true);
      } else {
        // If PIN is set but app is not locked, keep unlocked
        setIsUnlocked(!settings.isLocked);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsUnlocked(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const handleLock = async () => {
    try {
      const settings = await storageService.getSettings();
      if (settings.pinHash) {
        await storageService.saveSettings({ ...settings, isLocked: true });
        setIsUnlocked(false);
      }
    } catch (error) {
      console.error('Error locking app:', error);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="app loading">
        <div className="loading-content">
          <h2>🔒 Better Together</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return <PinLock onUnlock={handleUnlock} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'fantasy':
        return <FantasyPage />
      case 'journal':
        return <JournalPage />
      case 'quiz':
        return <QuizPage />
      default:
        return (
          <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Welcome to Better Together</h1>
            <p>Let's explore love, connection, and desire privately.</p>
            <p>Built with love by Kitso.</p>
          </main>
        )
    }
  }

  return (
    <div className="app">
      <nav style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #eee',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="nav-pages">
          <button 
            onClick={() => setCurrentPage('home')}
            className={currentPage === 'home' ? 'active' : ''}
            style={{ marginRight: '1rem' }}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentPage('fantasy')}
            className={currentPage === 'fantasy' ? 'active' : ''}
            style={{ marginRight: '1rem' }}
          >
            🔥 Fantasy
          </button>
          <button 
            onClick={() => setCurrentPage('journal')}
            className={currentPage === 'journal' ? 'active' : ''}
            style={{ marginRight: '1rem' }}
          >
            📓 Journal
          </button>
          <button 
            onClick={() => setCurrentPage('quiz')}
            className={currentPage === 'quiz' ? 'active' : ''}
            style={{ marginRight: '1rem' }}
          >
            💬 Quiz
          </button>
        </div>
        
        <div className="nav-actions">
          <button 
            onClick={handleLock}
            className="lock-button"
            title="Lock App"
          >
            🔒 Lock
          </button>
        </div>
      </nav>
      {renderPage()}
    </div>
  )
}

export default App