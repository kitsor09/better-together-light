import { useState } from 'react'
import FantasyPage from '../app/fantasy/page'
import JournalPage from '../app/journal/page'
import QuizPage from '../app/quiz/page'
import './App.css'

type Page = 'home' | 'fantasy' | 'journal' | 'quiz'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')

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
        marginBottom: '1rem'
      }}>
        <button 
          onClick={() => setCurrentPage('home')}
          style={{ marginRight: '1rem' }}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentPage('fantasy')}
          style={{ marginRight: '1rem' }}
        >
          🔥 Fantasy
        </button>
        <button 
          onClick={() => setCurrentPage('journal')}
          style={{ marginRight: '1rem' }}
        >
          📓 Journal
        </button>
        <button 
          onClick={() => setCurrentPage('quiz')}
          style={{ marginRight: '1rem' }}
        >
          💬 Quiz
        </button>
      </nav>
      {renderPage()}
    </div>
  )
}

export default App