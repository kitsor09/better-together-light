'use client'

import { useState, useEffect } from 'react';
import { storageService, CycleData, CycleSettings } from '../../src/utils/storage';

export default function CycleTrackerPage() {
  const [cycleData, setCycleData] = useState<CycleData[]>([]);
  const [cycleSettings, setCycleSettings] = useState<CycleSettings | null>(null);
  const [currentView, setCurrentView] = useState<'tracker' | 'settings' | 'add'>('tracker');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newCycleStart, setNewCycleStart] = useState('');
  const [newCycleEnd, setNewCycleEnd] = useState('');
  const [newFlow, setNewFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [newMood, setNewMood] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cycles, settings] = await Promise.all([
        storageService.getCycleData(),
        storageService.getCycleSettings()
      ]);
      setCycleData(cycles);
      setCycleSettings(settings);
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<CycleSettings>) => {
    if (!cycleSettings) return;
    
    const updatedSettings = { ...cycleSettings, ...newSettings };
    try {
      await storageService.saveCycleSettings(updatedSettings);
      setCycleSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving cycle settings:', error);
    }
  };

  const addCycleEntry = async () => {
    if (!newCycleStart) return;

    const newEntry: CycleData = {
      id: `cycle_${Date.now()}`,
      startDate: new Date(newCycleStart),
      endDate: newCycleEnd ? new Date(newCycleEnd) : undefined,
      flow: newFlow,
      symptoms: newSymptoms,
      mood: newMood,
      notes: newNotes
    };

    try {
      await storageService.addCycleEntry(newEntry);
      
      // Update last period start in settings
      if (cycleSettings) {
        await updateSettings({ lastPeriodStart: new Date(newCycleStart) });
      }
      
      await loadData();
      setCurrentView('tracker');
      resetForm();
    } catch (error) {
      console.error('Error adding cycle entry:', error);
    }
  };

  const resetForm = () => {
    setNewCycleStart('');
    setNewCycleEnd('');
    setNewFlow('medium');
    setNewSymptoms([]);
    setNewMood([]);
    setNewNotes('');
  };

  const toggleSymptom = (symptom: string) => {
    setNewSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleMood = (mood: string) => {
    setNewMood(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const calculatePredictedDates = () => {
    if (!cycleSettings?.lastPeriodStart) return null;

    const lastStart = new Date(cycleSettings.lastPeriodStart);
    const nextPeriod = new Date(lastStart);
    nextPeriod.setDate(lastStart.getDate() + cycleSettings.averageCycleLength);
    
    const ovulation = new Date(lastStart);
    ovulation.setDate(lastStart.getDate() + (cycleSettings.averageCycleLength - 14));
    
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);

    return {
      nextPeriod,
      ovulation,
      fertileStart,
      fertileEnd
    };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const symptoms = [
    'Cramps', 'Bloating', 'Headache', 'Fatigue', 'Breast tenderness', 
    'Nausea', 'Back pain', 'Acne', 'Food cravings', 'Mood swings'
  ];

  const moods = [
    'Happy', 'Sad', 'Anxious', 'Energetic', 'Tired', 'Irritable', 
    'Calm', 'Emotional', 'Confident', 'Stressed'
  ];

  if (isLoading) {
    return (
      <div className="cycle-tracker-container">
        <div className="loading-content">
          <p>Loading cycle data...</p>
        </div>
      </div>
    );
  }

  const predictions = calculatePredictedDates();

  return (
    <div className="cycle-tracker-container">
      <header className="cycle-tracker-header">
        <h1>🌸 Cycle Tracker</h1>
        <div className="header-actions">
          <button 
            onClick={() => setCurrentView('add')} 
            className="add-cycle-btn"
          >
            + Log Period
          </button>
          <button 
            onClick={() => setCurrentView('settings')} 
            className="settings-btn"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {currentView === 'tracker' && (
        <main className="tracker-content">
          {predictions && (
            <div className="predictions-section">
              <h2>Predictions</h2>
              <div className="prediction-cards">
                <div className="prediction-card next-period">
                  <h3>🔴 Next Period</h3>
                  <p className="date">{formatDate(predictions.nextPeriod)}</p>
                  <p className="countdown">
                    {getDaysUntil(predictions.nextPeriod) > 0 
                      ? `in ${getDaysUntil(predictions.nextPeriod)} days`
                      : 'Today or overdue'
                    }
                  </p>
                </div>
                
                <div className="prediction-card ovulation">
                  <h3>🥚 Ovulation</h3>
                  <p className="date">{formatDate(predictions.ovulation)}</p>
                  <p className="countdown">
                    {getDaysUntil(predictions.ovulation) > 0 
                      ? `in ${getDaysUntil(predictions.ovulation)} days`
                      : getDaysUntil(predictions.ovulation) === 0 
                        ? 'Today'
                        : `${Math.abs(getDaysUntil(predictions.ovulation))} days ago`
                    }
                  </p>
                </div>
                
                <div className="prediction-card fertile">
                  <h3>💚 Fertile Window</h3>
                  <p className="date">
                    {formatDate(predictions.fertileStart)} - {formatDate(predictions.fertileEnd)}
                  </p>
                  <p className="countdown">
                    {getDaysUntil(predictions.fertileStart) > 0 
                      ? `starts in ${getDaysUntil(predictions.fertileStart)} days`
                      : getDaysUntil(predictions.fertileEnd) >= 0
                        ? 'Active now'
                        : 'Ended'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="cycle-history">
            <h2>Recent Cycles</h2>
            {cycleData.length === 0 ? (
              <div className="no-cycles">
                <p>No cycle data yet. Start by logging your period!</p>
                <button 
                  onClick={() => setCurrentView('add')}
                  className="primary-button"
                >
                  Log First Period
                </button>
              </div>
            ) : (
              <div className="cycle-list">
                {cycleData.slice(0, 5).map((cycle) => (
                  <div key={cycle.id} className="cycle-entry">
                    <div className="cycle-dates">
                      <h3>{formatDate(cycle.startDate)}</h3>
                      {cycle.endDate && (
                        <span>- {formatDate(cycle.endDate)}</span>
                      )}
                    </div>
                    <div className="cycle-details">
                      <span className={`flow-indicator ${cycle.flow}`}>
                        {cycle.flow} flow
                      </span>
                      {cycle.symptoms.length > 0 && (
                        <div className="symptoms">
                          <strong>Symptoms:</strong> {cycle.symptoms.join(', ')}
                        </div>
                      )}
                      {cycle.mood.length > 0 && (
                        <div className="moods">
                          <strong>Mood:</strong> {cycle.mood.join(', ')}
                        </div>
                      )}
                      {cycle.notes && (
                        <div className="notes">
                          <strong>Notes:</strong> {cycle.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {currentView === 'add' && (
        <main className="add-cycle-content">
          <div className="form-header">
            <h2>Log Period</h2>
            <button 
              onClick={() => setCurrentView('tracker')}
              className="back-button"
            >
              ← Back
            </button>
          </div>
          
          <form className="add-cycle-form" onSubmit={(e) => { e.preventDefault(); addCycleEntry(); }}>
            <div className="form-section">
              <label>Period Start Date *</label>
              <input
                type="date"
                value={newCycleStart}
                onChange={(e) => setNewCycleStart(e.target.value)}
                required
              />
            </div>

            <div className="form-section">
              <label>Period End Date (optional)</label>
              <input
                type="date"
                value={newCycleEnd}
                onChange={(e) => setNewCycleEnd(e.target.value)}
                min={newCycleStart}
              />
            </div>

            <div className="form-section">
              <label>Flow Intensity</label>
              <div className="flow-options">
                {(['light', 'medium', 'heavy'] as const).map((flow) => (
                  <button
                    key={flow}
                    type="button"
                    className={`flow-option ${newFlow === flow ? 'selected' : ''}`}
                    onClick={() => setNewFlow(flow)}
                  >
                    <span className={`flow-dot ${flow}`}></span>
                    {flow}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Symptoms</label>
              <div className="option-grid">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    className={`option-tag ${newSymptoms.includes(symptom) ? 'selected' : ''}`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Mood</label>
              <div className="option-grid">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    className={`option-tag ${newMood.includes(mood) ? 'selected' : ''}`}
                    onClick={() => toggleMood(mood)}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Notes (optional)</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Any additional notes about this cycle..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setCurrentView('tracker')} className="secondary-button">
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Save Period
              </button>
            </div>
          </form>
        </main>
      )}

      {currentView === 'settings' && cycleSettings && (
        <main className="settings-content">
          <div className="form-header">
            <h2>Cycle Settings</h2>
            <button 
              onClick={() => setCurrentView('tracker')}
              className="back-button"
            >
              ← Back
            </button>
          </div>

          <div className="settings-form">
            <div className="form-section">
              <label>Average Cycle Length</label>
              <input
                type="number"
                min="21"
                max="35"
                value={cycleSettings.averageCycleLength}
                onChange={(e) => updateSettings({ averageCycleLength: parseInt(e.target.value) })}
              />
              <small>Typical range: 21-35 days</small>
            </div>

            <div className="form-section">
              <label>Average Period Length</label>
              <input
                type="number"
                min="3"
                max="8"
                value={cycleSettings.averagePeriodLength}
                onChange={(e) => updateSettings({ averagePeriodLength: parseInt(e.target.value) })}
              />
              <small>Typical range: 3-8 days</small>
            </div>

            {cycleSettings.lastPeriodStart && (
              <div className="form-section">
                <label>Last Period Start</label>
                <input
                  type="date"
                  value={cycleSettings.lastPeriodStart.toISOString().split('T')[0]}
                  onChange={(e) => updateSettings({ lastPeriodStart: new Date(e.target.value) })}
                />
                <small>Used for predictions</small>
              </div>
            )}

            <div className="form-section">
              <label>Notifications</label>
              <div className="notification-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cycleSettings.notifications.periodReminder}
                    onChange={(e) => updateSettings({
                      notifications: {
                        ...cycleSettings.notifications,
                        periodReminder: e.target.checked
                      }
                    })}
                  />
                  <span>Period reminders</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cycleSettings.notifications.ovulationReminder}
                    onChange={(e) => updateSettings({
                      notifications: {
                        ...cycleSettings.notifications,
                        ovulationReminder: e.target.checked
                      }
                    })}
                  />
                  <span>Ovulation reminders</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cycleSettings.notifications.pmsReminder}
                    onChange={(e) => updateSettings({
                      notifications: {
                        ...cycleSettings.notifications,
                        pmsReminder: e.target.checked
                      }
                    })}
                  />
                  <span>PMS reminders</span>
                </label>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}