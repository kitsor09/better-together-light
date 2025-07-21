import { useState, useEffect } from 'react';

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
    energy: "Magnetic, radiant, outward",
    herFocus: [
      "Connection, intimacy, collaboration",
      "Creative or bold expression"
    ],
    supportTips: [
      "Tell her how radiant she is",
      "Be physically affectionate and expressive",
      "Celebrate her achievements"
    ],
    affirmations: [
      "I am magnetic and powerful.",
      "I shine my light and connect deeply."
    ]
  },
  {
    phase: "Luteal",
    moon: "Waning Moon",
    energy: "Turning inward, analytical",
    herFocus: [
      "Wrap up tasks, detail focus, self-care",
      "Clear boundaries, nesting"
    ],
    supportTips: [
      "Help with tasks she's finishing",
      "Be patient if moods shift",
      "Offer grounding presence and no pressure"
    ],
    affirmations: [
      "I ground myself in clarity and calm.",
      "I honor the sacred pause before renewal."
    ]
  }
];

export default function MoonCyclePage() {
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<string>('');

  useEffect(() => {
    // Calculate current moon phase based on date
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
  }, []);

  const getMoonIcon = (moon: string) => {
    switch (moon) {
      case 'New Moon': return '🌑';
      case 'Waxing Moon': return '🌒';
      case 'Full Moon': return '🌕';
      case 'Waning Moon': return '🌘';
      default: return '🌙';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Menstruation': return 'rgba(139, 69, 19, 0.8)'; // Deep brown
      case 'Follicular': return 'rgba(144, 238, 144, 0.8)'; // Light green
      case 'Ovulation': return 'rgba(255, 215, 0, 0.8)'; // Gold
      case 'Luteal': return 'rgba(216, 191, 216, 0.8)'; // Thistle
      default: return 'rgba(255, 248, 220, 0.8)';
    }
  };

  return (
    <main className="moon-cycle-container">
      <div className="moon-cycle-header">
        <h1>🌙 Moon Cycle Support</h1>
        <p>Sacred guidance aligned with lunar wisdom and her natural rhythm</p>
        
        <div className="current-moon">
          <h3>Current Moon Phase</h3>
          <div className="moon-display">{currentMoonPhase}</div>
        </div>
      </div>

      <div className="moon-cycle-description">
        <div className="description-card">
          <h2>💫 Understanding the Sacred Cycle</h2>
          <p>
            Based on the Southern Hemisphere lunar calendar, this guide helps you both understand 
            and honor the natural rhythms of her body and the moon. Each phase brings unique 
            energy and opportunities for connection, support, and growth together.
          </p>
          <p>
            Use this as a gentle guide to deepen your understanding and create more harmony 
            in your relationship by aligning with these natural cycles.
          </p>
        </div>
      </div>

      <div className="phase-navigation">
        <h3>Choose a Phase to Explore</h3>
        <div className="phase-tabs">
          {moonPhases.map((phase, index) => (
            <button
              key={phase.phase}
              onClick={() => setCurrentPhase(index)}
              className={`phase-tab ${currentPhase === index ? 'active' : ''}`}
              style={{ backgroundColor: getPhaseColor(phase.phase) }}
            >
              {getMoonIcon(phase.moon)} {phase.phase}
            </button>
          ))}
        </div>
      </div>

      <div className="phase-details">
        {moonPhases.map((phase, index) => (
          <div
            key={phase.phase}
            className={`phase-card ${currentPhase === index ? 'active' : 'hidden'}`}
            style={{ borderLeftColor: getPhaseColor(phase.phase) }}
          >
            <div className="phase-header">
              <h2>
                {getMoonIcon(phase.moon)} {phase.phase} → {phase.moon}
              </h2>
              <div className="energy-badge" style={{ backgroundColor: getPhaseColor(phase.phase) }}>
                Energy: {phase.energy}
              </div>
            </div>

            <div className="phase-content">
              <div className="focus-section">
                <h3>🌸 What She Can Focus On</h3>
                <ul className="focus-list">
                  {phase.herFocus.map((focus, i) => (
                    <li key={i}>{focus}</li>
                  ))}
                </ul>
              </div>

              <div className="support-section">
                <h3>💝 How You Can Support Her</h3>
                <ul className="support-list">
                  {phase.supportTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div className="affirmations-section">
                <h3>✨ Sacred Affirmations</h3>
                <div className="affirmations-grid">
                  {phase.affirmations.map((affirmation, i) => (
                    <div key={i} className="affirmation-card">
                      <span className="quote-mark">"</span>
                      {affirmation}
                      <span className="quote-mark">"</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="moon-cycle-footer">
        <div className="wisdom-note">
          <h3>🌙 Lunar Wisdom</h3>
          <p>
            Remember, every woman's cycle is unique and sacred. These are gentle suggestions 
            to support your connection and understanding. Always communicate openly about what 
            feels right and supportive for your unique journey together.
          </p>
          <p>
            The moon has guided women's cycles for millennia. By honoring these natural rhythms, 
            you're participating in an ancient dance of love, respect, and cosmic alignment.
          </p>
        </div>
      </div>
    </main>
  );
}