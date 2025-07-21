import { useState, useEffect } from 'react';
import { storageService, Quiz, QuizSession, QuizResponse } from '../../src/utils/storage';

// Import quiz data
import sharedQuiz from '../../src/data/quizzes/shared.json';
import forHimQuiz from '../../src/data/quizzes/for-him.json';
import forHerQuiz from '../../src/data/quizzes/for-her.json';
import fantasySharedQuiz from '../../src/data/quizzes/fantasy-shared.json';
import fantasyHerQuiz from '../../src/data/quizzes/fantasy-her.json';
import fantasyHimQuiz from '../../src/data/quizzes/fantasy-him.json';

const prebuiltQuizzes: Quiz[] = [
  sharedQuiz as Quiz,
  forHimQuiz as Quiz,
  forHerQuiz as Quiz,
  fantasySharedQuiz as Quiz,
  fantasyHerQuiz as Quiz,
  fantasyHimQuiz as Quiz
];

export default function QuizPage() {
  const [currentView, setCurrentView] = useState<'home' | 'quiz' | 'create' | 'results'>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [customQuizzes, setCustomQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Custom quiz creation form
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    category: 'shared' as Quiz['category'],
    description: '',
    questions: [{ text: '', id: '1' }]
  });

  useEffect(() => {
    loadCustomQuizzes();
  }, []);

  const loadCustomQuizzes = async () => {
    try {
      const quizzes = await storageService.getCustomQuizzes();
      setCustomQuizzes(quizzes);
    } catch (error) {
      console.error('Error loading custom quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (quiz: Quiz) => {
    const session: QuizSession = {
      id: `${Date.now()}-${Math.random()}`,
      quizId: quiz.id,
      startedAt: new Date(),
      responses: [],
      participants: ['him', 'her']
    };

    setSelectedQuiz(quiz);
    setCurrentSession(session);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setCurrentView('quiz');
  };

  const submitAnswer = async () => {
    if (!currentSession || !selectedQuiz || !currentAnswer.trim()) return;

    const response: QuizResponse = {
      id: `${Date.now()}-${Math.random()}`,
      quizId: selectedQuiz.id,
      questionId: selectedQuiz.questions[currentQuestionIndex].id,
      answer: currentAnswer,
      timestamp: new Date()
    };

    const updatedSession = {
      ...currentSession,
      responses: [...currentSession.responses, response]
    };

    setCurrentSession(updatedSession);
    setCurrentAnswer('');

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      updatedSession.completedAt = new Date();
      await storageService.saveQuizSession(updatedSession);
      setCurrentView('results');
    }
  };

  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { text: '', id: `${newQuiz.questions.length + 1}` }]
    });
  };

  const updateQuestion = (index: number, text: string) => {
    const updatedQuestions = newQuiz.questions.map((q, i) => 
      i === index ? { ...q, text } : q
    );
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const removeQuestion = (index: number) => {
    if (newQuiz.questions.length > 1) {
      setNewQuiz({
        ...newQuiz,
        questions: newQuiz.questions.filter((_, i) => i !== index)
      });
    }
  };

  const saveCustomQuiz = async () => {
    if (!newQuiz.title || newQuiz.questions.some(q => !q.text.trim())) {
      alert('Please fill in the quiz title and all questions');
      return;
    }

    const quiz: Quiz = {
      id: `custom-${Date.now()}`,
      title: newQuiz.title,
      category: newQuiz.category,
      description: newQuiz.description,
      questions: newQuiz.questions.map((q, index) => ({
        id: `custom-${Date.now()}-${index}`,
        text: q.text,
        type: 'text'
      })),
      isCustom: true
    };

    try {
      await storageService.addCustomQuiz(quiz);
      setCustomQuizzes([quiz, ...customQuizzes]);
      setNewQuiz({
        title: '',
        category: 'shared',
        description: '',
        questions: [{ text: '', id: '1' }]
      });
      setShowCreateForm(false);
      alert('Quiz created successfully!');
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    }
  };

  const getCategoryIcon = (category: Quiz['category']) => {
    switch (category) {
      case 'shared': return '💑';
      case 'for-him': return '👨‍🦱';
      case 'for-her': return '👩‍🦰';
      case 'fantasy': return '🔥';
      default: return '💬';
    }
  };

  const getCategoryColor = (category: Quiz['category']) => {
    switch (category) {
      case 'shared': return 'rgba(255, 182, 193, 0.8)';
      case 'for-him': return 'rgba(173, 216, 230, 0.8)';
      case 'for-her': return 'rgba(255, 192, 203, 0.8)';
      case 'fantasy': return 'rgba(255, 99, 71, 0.8)';
      default: return 'rgba(255, 248, 220, 0.8)';
    }
  };

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>💬 Couples Quiz</h1>
        <p>Loading quizzes...</p>
      </main>
    );
  }

  if (currentView === 'quiz' && selectedQuiz && currentSession) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <main className="quiz-container">
        <div className="quiz-header">
          <button onClick={() => setCurrentView('home')} className="back-button">
            ← Back to Quizzes
          </button>
          <h1>{selectedQuiz.title}</h1>
          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
          </div>
        </div>

        <div className="question-card">
          <h2 className="question-text">{currentQuestion.text}</h2>
          
          <div className="answer-section">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="answer-input"
            />
            
            <div className="quiz-actions">
              <button 
                onClick={submitAnswer}
                disabled={!currentAnswer.trim()}
                className="primary-button"
              >
                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (currentView === 'results' && currentSession && selectedQuiz) {
    return (
      <main className="quiz-container">
        <div className="quiz-header">
          <button onClick={() => setCurrentView('home')} className="back-button">
            ← Back to Quizzes
          </button>
          <h1>Quiz Complete! 🎉</h1>
        </div>

        <div className="results-section">
          <h2>{selectedQuiz.title}</h2>
          <p>You've completed this quiz together. Here are your responses:</p>
          
          {selectedQuiz.questions.map((question, index) => {
            const response = currentSession.responses.find(r => r.questionId === question.id);
            return (
              <div key={question.id} className="result-item">
                <h3>Q{index + 1}: {question.text}</h3>
                <div className="response-content">
                  {response ? response.answer : 'No response'}
                </div>
              </div>
            );
          })}

          <div className="results-actions">
            <button 
              onClick={() => startQuiz(selectedQuiz)} 
              className="secondary-button"
            >
              Take Again
            </button>
            <button 
              onClick={() => setCurrentView('home')} 
              className="primary-button"
            >
              Explore More Quizzes
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (currentView === 'create' || showCreateForm) {
    return (
      <main className="quiz-container">
        <div className="quiz-header">
          <button onClick={() => { setCurrentView('home'); setShowCreateForm(false); }} className="back-button">
            ← Back to Quizzes
          </button>
          <h1>✨ Create Your Own Quiz</h1>
        </div>

        <div className="create-quiz-form">
          <div className="form-section">
            <label>Quiz Title</label>
            <input
              type="text"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              placeholder="Enter quiz title..."
              className="quiz-title-input"
            />
          </div>

          <div className="form-section">
            <label>Category</label>
            <select
              value={newQuiz.category}
              onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value as Quiz['category'] })}
              className="category-select"
            >
              <option value="shared">💑 Shared</option>
              <option value="for-him">👨‍🦱 For Him</option>
              <option value="for-her">👩‍🦰 For Her</option>
              <option value="fantasy">🔥 Fantasy</option>
            </select>
          </div>

          <div className="form-section">
            <label>Description (optional)</label>
            <input
              type="text"
              value={newQuiz.description}
              onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
              placeholder="Brief description of your quiz..."
              className="quiz-description-input"
            />
          </div>

          <div className="form-section">
            <label>Questions</label>
            {newQuiz.questions.map((question, index) => (
              <div key={index} className="question-input-group">
                <div className="question-header">
                  <span>Question {index + 1}</span>
                  {newQuiz.questions.length > 1 && (
                    <button 
                      onClick={() => removeQuestion(index)}
                      className="remove-question-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder="Enter your question..."
                  className="question-textarea"
                />
              </div>
            ))}
            
            <button onClick={addQuestion} className="add-question-btn">
              + Add Another Question
            </button>
          </div>

          <div className="create-quiz-actions">
            <button 
              onClick={() => { setCurrentView('home'); setShowCreateForm(false); }}
              className="secondary-button"
            >
              Cancel
            </button>
            <button onClick={saveCustomQuiz} className="primary-button">
              Save Quiz
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Main quiz selection view
  return (
    <main className="quiz-container">
      <div className="quiz-header">
        <h1>💬 Couples Quiz</h1>
        <p>Deep questions to explore together and grow closer</p>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-quiz-button"
        >
          ✨ Create Your Own Quiz
        </button>
      </div>

      <div className="quiz-sections">
        <section className="quiz-category">
          <h2>Pre-built Quizzes</h2>
          <div className="quiz-grid">
            {prebuiltQuizzes.map((quiz) => (
              <div 
                key={quiz.id}
                className="quiz-card"
                style={{ backgroundColor: getCategoryColor(quiz.category) }}
                onClick={() => startQuiz(quiz)}
              >
                <div className="quiz-icon">{getCategoryIcon(quiz.category)}</div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <div className="quiz-meta">
                  {quiz.questions.length} questions
                </div>
              </div>
            ))}
          </div>
        </section>

        {customQuizzes.length > 0 && (
          <section className="quiz-category">
            <h2>Your Custom Quizzes</h2>
            <div className="quiz-grid">
              {customQuizzes.map((quiz) => (
                <div 
                  key={quiz.id}
                  className="quiz-card custom"
                  style={{ backgroundColor: getCategoryColor(quiz.category) }}
                  onClick={() => startQuiz(quiz)}
                >
                  <div className="quiz-icon">{getCategoryIcon(quiz.category)}</div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description || 'Custom quiz'}</p>
                  <div className="quiz-meta">
                    {quiz.questions.length} questions • Custom
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
