'use client'

import { useState, useEffect } from 'react';
import { storageService, CycleData, CycleSettings } from '../../src/utils/storage';

interface MoonPhase {
  phase: string;
  moon: string;
  energy: string;
  herFocus: string[];
  supportTips: string[];
  affirmations: string[];
}

const moonPhases: MoonPhase[] = [
  {
    phase: "Menstruation",
    moon: "New Moon",
    energy: "Low, inward-focused",
    herFocus: [
      "Rest, reflect, release",
      "Journaling, light stretching, alone time"
    ],
    supportTips: [
      "Offer comfort, warmth, space",
      "Run a bath, bring her favorite snack or tea",
      "Be extra gentle with emotional tone"
    ],
    affirmations: [
      "I honor rest as a sacred part of creation.",
      "My body is wise and I listen."
    ]
  },
  {
    phase: "Follicular",
    moon: "Waxing Moon",
    energy: "Rising, creative, playful",
    herFocus: [
      "New ideas, learning, socializing",
      "Goal-setting, light movement"
    ],
    supportTips: [
      "Encourage her dreams",
      "Be playful, go on a date night",
      "Do something spontaneous together"
    ],
    affirmations: [
      "I welcome new beginnings with curiosity.",
      "My energy is rising and full of light."
    ]
  },
  {
    phase: "Ovulation",
    moon: "Full Moon",
    energy: "High, magnetic, confident",
    herFocus: [
      "Connection, communication, decision-making",
      "High-energy activities, networking"
    ],
    supportTips: [
      "Plan romantic evenings",
      "Listen deeply to her ideas",
      "Celebrate her radiance"
    ],
    affirmations: [
      "I shine my light fully and boldly.",
      "I am powerful in my feminine energy."
    ]
  },
  {
    phase: "Luteal",
    moon: "Waning Moon",
    energy: "Focused, practical, nesting",
    herFocus: [
      "Completing projects, organizing, preparing",
      "Self-care rituals, healthy boundaries"
    ],
    supportTips: [
      "Help her organize and prepare",
      "Respect her need for routine",
      "Support her self-care choices"
    ],
    affirmations: [
      "I trust my intuition to guide my choices.",
      "I create sacred space for my needs."
    ]
  }
];

export default function CycleMoonPage() {
  const [cycleData, setCycleData] = useState<CycleData[]>([]);
  const [cycleSettings, setCycleSettings] = useState<CycleSettings | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'tracker' | 'moon' | 'settings' | 'add'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<string>('');
  
  // Form states
  const [newCycleStart, setNewCycleStart] = useState('');
  const [newCycleEnd, setNewCycleEnd] = useState('');
  const [newFlow, setNewFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [newMood, setNewMood] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    loadData();
    calculateCurrentMoonPhase();
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

  const calculateCurrentMoonPhase = () => {
    const now = new Date();
    const lunarCycle = 29.5305902; // Average lunar cycle in days
    const knownNewMoon = new Date('2024-01-11'); // A known new moon date
    const daysSinceKnownNewMoon = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const currentCycleDay = daysSinceKnownNewMoon % lunarCycle;

    let moonPhase = '';
    if (currentCycleDay < 1) moonPhase = '🌑 New Moon';
    else if (currentCycleDay < 7.4) moonPhase = '🌒 Waxing Crescent';
    else if (currentCycleDay < 8.4) moonPhase = '🌓 First Quarter';
    else if (currentCycleDay < 14.8) moonPhase = '🌔 Waxing Gibbous';
    else if (currentCycleDay < 15.8) moonPhase = '🌕 Full Moon';
    else if (currentCycleDay < 22.1) moonPhase = '🌖 Waning Gibbous';
    else if (currentCycleDay < 23.1) moonPhase = '🌗 Last Quarter';
    else moonPhase = '🌘 Waning Crescent';

    setCurrentMoonPhase(moonPhase);
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

  const getCurrentCyclePhase = () => {
    if (!cycleSettings?.lastPeriodStart) return 0;
    
    const today = new Date();
    const lastPeriod = new Date(cycleSettings.lastPeriodStart);
    const daysSincePeriod = Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePeriod <= cycleSettings.averagePeriodLength) return 0; // Menstruation
    if (daysSincePeriod <= 13) return 1; // Follicular
    if (daysSincePeriod <= 16) return 2; // Ovulation
    return 3; // Luteal
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

  const getMoonIcon = (moon: string) => {
    switch (moon) {
      case 'New Moon': return '🌑';
      case 'Waxing Moon': return '🌒';
      case 'Full Moon': return '🌕';
      case 'Waning Moon': return '🌖';
      default: return '🌙';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Menstruation': return 'rgba(220, 53, 69, 0.8)';
      case 'Follicular': return 'rgba(40, 167, 69, 0.8)';
      case 'Ovulation': return 'rgba(255, 193, 7, 0.8)';
      case 'Luteal': return 'rgba(138, 43, 226, 0.8)';
      default: return 'rgba(108, 117, 125, 0.8)';
    }
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
      <div className="cycle-moon-container">
        <div className="loading-content">
          <p>Loading cycle & moon data...</p>
        </div>
      </div>
    );
  }

  const predictions = calculatePredictedDates();
  const currentCyclePhase = getCurrentCyclePhase();
  const currentPhaseData = moonPhases[currentCyclePhase];

  return (
    <div className="cycle-moon-container">
      <header className="cycle-moon-header">
        <h1>🌸 Cycle & Moon</h1>
        <div className="view-tabs">
          <button 
            onClick={() => setCurrentView('overview')} 
            className={`tab-button ${currentView === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setCurrentView('tracker')} 
            className={`tab-button ${currentView === 'tracker' ? 'active' : ''}`}
          >
            Cycle Tracker
          </button>
          <button 
            onClick={() => setCurrentView('moon')} 
            className={`tab-button ${currentView === 'moon' ? 'active' : ''}`}
          >
            Moon Guidance
          </button>
          <button 
            onClick={() => setCurrentView('settings')} 
            className={`tab-button ${currentView === 'settings' ? 'active' : ''}`}
          >
            Settings
          </button>
        </div>
      </header>

      {currentView === 'overview' && (
        <main className="overview-content">
          <div className="overview-grid">
            <div className="current-status-card">
              <h2>Current Status</h2>
              <div className="status-info">
                <div className="moon-status">
                  <h3>🌙 Moon Phase</h3>
                  <p className="current-moon">{currentMoonPhase}</p>
                </div>
                {currentPhaseData && (
                  <div className="cycle-status">
                    <h3>🌸 Cycle Phase</h3>
                    <p className="current-phase" style={{ color: getPhaseColor(currentPhaseData.phase) }}>
                      {currentPhaseData.phase}
                    </p>
                    <p className="phase-energy">{currentPhaseData.energy}</p>
                  </div>
                )}
              </div>
            </div>

            {predictions && (
              <div className="predictions-card">
                <h2>Predictions</h2>
                <div className="mini-prediction-grid">
                  <div className="mini-prediction">
                    <span className="label">Next Period</span>
                    <span className="date">{formatDate(predictions.nextPeriod)}</span>
                    <span className="countdown">
                      {getDaysUntil(predictions.nextPeriod) > 0 
                        ? `in ${getDaysUntil(predictions.nextPeriod)} days`
                        : 'Today or overdue'
                      }
                    </span>
                  </div>
                  <div className="mini-prediction">
                    <span className="label">Ovulation</span>
                    <span className="date">{formatDate(predictions.ovulation)}</span>
                    <span className="countdown">
                      {getDaysUntil(predictions.ovulation) > 0 
                        ? `in ${getDaysUntil(predictions.ovulation)} days`
                        : getDaysUntil(predictions.ovulation) === 0 
                          ? 'Today'
                          : `${Math.abs(getDaysUntil(predictions.ovulation))} days ago`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentPhaseData && (
              <div className="guidance-card">
                <h2>Today's Guidance</h2>
                <div className="guidance-content">
                  <div className="focus-section">
                    <h4>Focus For Her</h4>
                    <ul>
                      {currentPhaseData.herFocus.map((focus, index) => (
                        <li key={index}>{focus}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="support-section">
                    <h4>Support Tips</h4>
                    <ul>
                      {currentPhaseData.supportTips.slice(0, 2).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="quick-actions-card">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button 
                  onClick={() => setCurrentView('add')} 
                  className="quick-action-btn log-period"
                >
                  📅 Log Period
                </button>
                <button 
                  onClick={() => setCurrentView('moon')} 
                  className="quick-action-btn moon-guidance"
                >
                  🌙 Moon Guidance
                </button>
                <button 
                  onClick={() => setCurrentView('tracker')} 
                  className="quick-action-btn view-history"
                >
                  📊 View History
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {currentView === 'tracker' && (
        <main className="tracker-content">
          <div className="tracker-header">
            <h2>Cycle Tracker</h2>
            <button 
              onClick={() => setCurrentView('add')} 
              className="add-cycle-btn"
            >
              + Log Period
            </button>
          </div>

          {predictions && (
            <div className="predictions-section">
              <h3>Predictions</h3>
              <div className="prediction-cards">
                <div className="prediction-card next-period">
                  <h4>🔴 Next Period</h4>
                  <p className="date">{formatDate(predictions.nextPeriod)}</p>
                  <p className="countdown">
                    {getDaysUntil(predictions.nextPeriod) > 0 
                      ? `in ${getDaysUntil(predictions.nextPeriod)} days`
                      : 'Today or overdue'
                    }
                  </p>
                </div>
                
                <div className="prediction-card ovulation">
                  <h4>🥚 Ovulation</h4>
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
                  <h4>💚 Fertile Window</h4>
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
            <h3>Recent Cycles</h3>
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
                      <h4>{formatDate(cycle.startDate)}</h4>
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

      {currentView === 'moon' && (
        <main className="moon-content">
          <div className="moon-header">
            <h2>🌙 Moon Cycle Guidance</h2>
            <div className="current-moon-display">
              <span className="moon-phase">{currentMoonPhase}</span>
            </div>
          </div>

          <div className="phase-navigation">
            <div className="phase-tabs">
              {moonPhases.map((phase, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhase(index)}
                  className={`phase-tab ${currentPhase === index ? 'active' : ''}`}
                  style={{ borderBottomColor: getPhaseColor(phase.phase) }}
                >
                  {getMoonIcon(phase.moon)} {phase.phase}
                </button>
              ))}
            </div>
          </div>

          <div className="phase-details">
            {moonPhases[currentPhase] && (
              <div className="phase-card">
                <div className="phase-header">
                  <h3 style={{ color: getPhaseColor(moonPhases[currentPhase].phase) }}>
                    {getMoonIcon(moonPhases[currentPhase].moon)} {moonPhases[currentPhase].phase}
                  </h3>
                  <span className="energy-badge" style={{ backgroundColor: getPhaseColor(moonPhases[currentPhase].phase) }}>
                    {moonPhases[currentPhase].energy}
                  </span>
                </div>

                <div className="phase-content">
                  <div className="focus-section">
                    <h4>🎯 Focus For Her</h4>
                    <ul className="focus-list">
                      {moonPhases[currentPhase].herFocus.map((focus, index) => (
                        <li key={index}>{focus}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="support-section">
                    <h4>💝 Support Tips</h4>
                    <ul className="support-list">
                      {moonPhases[currentPhase].supportTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="affirmations-section">
                    <h4>✨ Affirmations</h4>
                    <div className="affirmations-grid">
                      {moonPhases[currentPhase].affirmations.map((affirmation, index) => (
                        <div key={index} className="affirmation-card">
                          <span className="quote-mark">"</span>
                          <p>{affirmation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Settings and Add Period views would be similar to the original cycle tracker */}
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
              onClick={() => setCurrentView('overview')}
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