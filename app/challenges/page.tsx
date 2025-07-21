'use client'

import { useState, useEffect } from 'react';
import { storageService, Challenge } from '../../src/utils/storage';
import VoiceRecorder from '../../src/components/VoiceRecorder';

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'view'>('list');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'week' | 'sender' | 'dueDate'>('dueDate');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Create form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    from: 'him' as 'him' | 'her',
    to: 'her' as 'him' | 'her',
    dueDate: '',
    voiceNote: null as Blob | null
  });

  // Completion form state
  const [reflection, setReflection] = useState('');
  const [reflectionVoiceNote, setReflectionVoiceNote] = useState<Blob | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const challengeData = await storageService.getChallenges();
      setChallenges(challengeData);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!newChallenge.title || !newChallenge.dueDate) {
      alert('Please fill in the title and due date');
      return;
    }

    const challenge: Challenge = {
      id: `challenge_${Date.now()}`,
      title: newChallenge.title,
      description: newChallenge.description,
      from: newChallenge.from,
      to: newChallenge.to,
      dueDate: new Date(newChallenge.dueDate),
      createdAt: new Date(),
      isCompleted: false,
      voiceNote: newChallenge.voiceNote || undefined
    };

    try {
      await storageService.addChallenge(challenge);
      await loadChallenges();
      setCurrentView('list');
      resetCreateForm();
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      await storageService.updateChallenge(challengeId, {
        isCompleted: true,
        completedAt: new Date(),
        reflection: reflection || undefined,
        reflectionVoiceNote: reflectionVoiceNote || undefined
      });
      await loadChallenges();
      setCurrentView('list');
      setSelectedChallenge(null);
      setReflection('');
      setReflectionVoiceNote(null);
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Failed to complete challenge. Please try again.');
    }
  };

  const resetCreateForm = () => {
    setNewChallenge({
      title: '',
      description: '',
      from: 'him',
      to: 'her',
      dueDate: '',
      voiceNote: null
    });
  };

  const filteredAndSortedChallenges = () => {
    let filtered = challenges;

    // Filter by status
    if (filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.isCompleted);
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(c => c.isCompleted);
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'week':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'sender':
          return a.from.localeCompare(b.from);
        default:
          return 0;
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (challenge: Challenge) => {
    if (challenge.isCompleted) return 'rgba(40, 167, 69, 0.8)';
    
    const daysUntil = getDaysUntilDue(challenge.dueDate);
    if (daysUntil < 0) return 'rgba(220, 53, 69, 0.8)'; // Overdue
    if (daysUntil <= 1) return 'rgba(255, 193, 7, 0.8)'; // Due soon
    return 'rgba(173, 216, 230, 0.8)'; // Normal
  };

  const getStatusText = (challenge: Challenge) => {
    if (challenge.isCompleted) return 'Completed';
    
    const daysUntil = getDaysUntilDue(challenge.dueDate);
    if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} day(s)`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} day(s)`;
  };

  if (isLoading) {
    return (
      <div className="challenges-container">
        <div className="loading-content">
          <p>Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="challenges-container">
      <header className="challenges-header">
        <h1>📝 Weekly Challenges</h1>
        <div className="header-actions">
          {currentView === 'list' && (
            <button 
              onClick={() => setCurrentView('create')} 
              className="create-challenge-btn"
            >
              + Create Challenge
            </button>
          )}
          {currentView !== 'list' && (
            <button 
              onClick={() => setCurrentView('list')} 
              className="back-button"
            >
              ← Back to List
            </button>
          )}
        </div>
      </header>

      {currentView === 'list' && (
        <main className="challenges-list-content">
          <div className="list-controls">
            <div className="filter-controls">
              <label>Filter:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Challenges</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="sort-controls">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="dueDate">Due Date</option>
                <option value="week">Created Date</option>
                <option value="sender">Sender</option>
              </select>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="no-challenges">
              <p>No challenges yet! Create your first challenge to get started.</p>
              <button 
                onClick={() => setCurrentView('create')}
                className="primary-button"
              >
                Create First Challenge
              </button>
            </div>
          ) : (
            <div className="challenges-grid">
              {filteredAndSortedChallenges().map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="challenge-card"
                  style={{ borderLeftColor: getStatusColor(challenge) }}
                >
                  <div className="challenge-header">
                    <h3>{challenge.title}</h3>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(challenge) }}
                    >
                      {getStatusText(challenge)}
                    </span>
                  </div>
                  
                  <div className="challenge-meta">
                    <div className="challenge-participants">
                      <span className="from">From: {challenge.from === 'him' ? '👨‍🦱 Him' : '👩‍🦰 Her'}</span>
                      <span className="to">To: {challenge.to === 'him' ? '👨‍🦱 Him' : '👩‍🦰 Her'}</span>
                    </div>
                    <div className="challenge-dates">
                      <span className="due-date">Due: {formatDate(challenge.dueDate)}</span>
                      <span className="created-date">Created: {formatDate(challenge.createdAt)}</span>
                    </div>
                  </div>

                  {challenge.description && (
                    <p className="challenge-description">{challenge.description}</p>
                  )}

                  {challenge.voiceNoteUrl && (
                    <div className="voice-note">
                      <span>🎵 Voice note attached</span>
                    </div>
                  )}

                  <div className="challenge-actions">
                    <button 
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setCurrentView('view');
                      }}
                      className="view-button"
                    >
                      View Details
                    </button>
                    
                    {!challenge.isCompleted && (
                      <button 
                        onClick={() => {
                          setSelectedChallenge(challenge);
                          setCurrentView('view');
                        }}
                        className="complete-button"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {currentView === 'create' && (
        <main className="create-challenge-content">
          <div className="form-header">
            <h2>Create New Challenge</h2>
          </div>
          
          <form className="create-challenge-form" onSubmit={(e) => { e.preventDefault(); createChallenge(); }}>
            <div className="form-row">
              <div className="form-section">
                <label>From</label>
                <select
                  value={newChallenge.from}
                  onChange={(e) => setNewChallenge({ ...newChallenge, from: e.target.value as 'him' | 'her' })}
                >
                  <option value="him">👨‍🦱 Him</option>
                  <option value="her">👩‍🦰 Her</option>
                </select>
              </div>

              <div className="form-section">
                <label>To</label>
                <select
                  value={newChallenge.to}
                  onChange={(e) => setNewChallenge({ ...newChallenge, to: e.target.value as 'him' | 'her' })}
                >
                  <option value="him">👨‍🦱 Him</option>
                  <option value="her">👩‍🦰 Her</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <label>Challenge Title *</label>
              <input
                type="text"
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="e.g., Write a sexy haiku or Plan a surprise breakfast"
                required
              />
            </div>

            <div className="form-section">
              <label>Description (optional)</label>
              <textarea
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="Add more details about the challenge..."
                rows={3}
              />
            </div>

            <div className="form-section">
              <label>Due Date *</label>
              <input
                type="date"
                value={newChallenge.dueDate}
                onChange={(e) => setNewChallenge({ ...newChallenge, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-section">
              <label>Optional Voice Note</label>
              <VoiceRecorder
                onRecordingComplete={(blob) => setNewChallenge({ ...newChallenge, voiceNote: blob })}
                onRecordingClear={() => setNewChallenge({ ...newChallenge, voiceNote: null })}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setCurrentView('list')} className="secondary-button">
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Create Challenge
              </button>
            </div>
          </form>
        </main>
      )}

      {currentView === 'view' && selectedChallenge && (
        <main className="view-challenge-content">
          <div className="challenge-detail-header">
            <h2>{selectedChallenge.title}</h2>
            <span 
              className="status-badge large"
              style={{ backgroundColor: getStatusColor(selectedChallenge) }}
            >
              {getStatusText(selectedChallenge)}
            </span>
          </div>

          <div className="challenge-details">
            <div className="detail-grid">
              <div className="detail-item">
                <label>From:</label>
                <span>{selectedChallenge.from === 'him' ? '👨‍🦱 Him' : '👩‍🦰 Her'}</span>
              </div>
              
              <div className="detail-item">
                <label>To:</label>
                <span>{selectedChallenge.to === 'him' ? '👨‍🦱 Him' : '👩‍🦰 Her'}</span>
              </div>
              
              <div className="detail-item">
                <label>Due Date:</label>
                <span>{formatDate(selectedChallenge.dueDate)}</span>
              </div>
              
              <div className="detail-item">
                <label>Created:</label>
                <span>{formatDate(selectedChallenge.createdAt)}</span>
              </div>
            </div>

            {selectedChallenge.description && (
              <div className="challenge-full-description">
                <label>Description:</label>
                <p>{selectedChallenge.description}</p>
              </div>
            )}

            {selectedChallenge.voiceNoteUrl && (
              <div className="voice-note-section">
                <label>Voice Note:</label>
                <div className="voice-player">
                  <span>🎵 Challenge voice note</span>
                  {/* Voice player would go here */}
                </div>
              </div>
            )}
          </div>

          {!selectedChallenge.isCompleted ? (
            <div className="completion-section">
              <h3>Mark as Completed</h3>
              
              <div className="form-section">
                <label>Reflection (optional)</label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How did this challenge go? What did you learn or enjoy?"
                  rows={4}
                />
              </div>

              <div className="form-section">
                <label>Optional Reflection Voice Note</label>
                <VoiceRecorder
                  onRecordingComplete={setReflectionVoiceNote}
                  onRecordingClear={() => setReflectionVoiceNote(null)}
                />
              </div>

              <div className="completion-actions">
                <button 
                  onClick={() => completeChallenge(selectedChallenge.id)}
                  className="complete-challenge-btn"
                >
                  ✓ Mark as Completed
                </button>
              </div>
            </div>
          ) : (
            <div className="completed-section">
              <h3>✓ Challenge Completed</h3>
              
              {selectedChallenge.completedAt && (
                <p className="completion-date">
                  Completed on {formatDate(selectedChallenge.completedAt)}
                </p>
              )}

              {selectedChallenge.reflection && (
                <div className="reflection-content">
                  <label>Reflection:</label>
                  <p>{selectedChallenge.reflection}</p>
                </div>
              )}

              {selectedChallenge.reflectionVoiceNoteUrl && (
                <div className="reflection-voice-note">
                  <label>Reflection Voice Note:</label>
                  <div className="voice-player">
                    <span>🎵 Reflection voice note</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}