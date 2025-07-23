import { useState } from 'react';
import { fantasyScenarios, scenarioSettings, scenarioRoles, scenarioRules, FantasyScenario } from '../../src/data/scenarios';

export default function FantasyPage() {
  const [currentView, setCurrentView] = useState<'home' | 'scenario' | 'builder'>('home');
  const [selectedScenario, setSelectedScenario] = useState<FantasyScenario | null>(null);
  const [customScenario, setCustomScenario] = useState({
    title: '',
    setting: '',
    roles: [] as string[],
    rules: [] as string[],
    description: ''
  });

  const getCategoryColor = (category: FantasyScenario['category']) => {
    switch (category) {
      case 'romantic': return 'rgba(255, 182, 193, 0.8)';
      case 'bold': return 'rgba(255, 99, 71, 0.8)';
      case 'creative': return 'rgba(221, 160, 221, 0.8)';
      default: return 'rgba(255, 248, 220, 0.8)';
    }
  };

  const getCategoryIcon = (category: FantasyScenario['category']) => {
    switch (category) {
      case 'romantic': return '🌹';
      case 'bold': return '🔥';
      case 'creative': return '🎭';
      default: return '✨';
    }
  };

  const toggleCustomItem = (list: string[], item: string, setter: (items: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  if (currentView === 'scenario' && selectedScenario) {
    return (
      <main className="fantasy-container">
        <div className="fantasy-header">
          <button onClick={() => setCurrentView('home')} className="back-button">
            ← Back to Scenarios
          </button>
          <h1>{selectedScenario.title}</h1>
          <div className="scenario-meta">
            <span className="scenario-category" style={{ backgroundColor: getCategoryColor(selectedScenario.category) }}>
              {getCategoryIcon(selectedScenario.category)} {selectedScenario.category}
            </span>
          </div>
        </div>

        <div className="scenario-content">
          <div className="scenario-description">
            <h2>The Scenario</h2>
            <p>{selectedScenario.description}</p>
          </div>

          <div className="scenario-details">
            <div className="detail-card">
              <h3>🏡 Setting</h3>
              <p>{selectedScenario.setting}</p>
            </div>

            <div className="detail-card">
              <h3>💫 Mood</h3>
              <p>{selectedScenario.mood}</p>
            </div>
          </div>

          <div className="scenario-instructions">
            <h3>📝 How to Play</h3>
            <ol className="instruction-list">
              {selectedScenario.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {selectedScenario.rules && selectedScenario.rules.length > 0 && (
            <div className="scenario-rules">
              <h3>⚖️ Rules</h3>
              <ul className="rules-list">
                {selectedScenario.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedScenario.variations && selectedScenario.variations.length > 0 && (
            <div className="scenario-variations">
              <h3>🎲 Variations</h3>
              <ul className="variations-list">
                {selectedScenario.variations.map((variation, index) => (
                  <li key={index}>{variation}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="scenario-actions">
            <button onClick={() => setCurrentView('home')} className="secondary-button">
              Explore More
            </button>
            <button onClick={() => setCurrentView('builder')} className="primary-button">
              Customize This Scenario
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (currentView === 'builder') {
    return (
      <main className="fantasy-container">
        <div className="fantasy-header">
          <button onClick={() => setCurrentView('home')} className="back-button">
            ← Back to Scenarios
          </button>
          <h1>✨ Build Your Fantasy</h1>
          <p>Mix and match elements to create your perfect scenario</p>
        </div>

        <div className="builder-content">
          <div className="builder-section">
            <label>Scenario Title</label>
            <input
              type="text"
              value={customScenario.title}
              onChange={(e) => setCustomScenario({ ...customScenario, title: e.target.value })}
              placeholder="Give your scenario a name..."
              className="builder-input"
            />
          </div>

          <div className="builder-section">
            <label>Description</label>
            <textarea
              value={customScenario.description}
              onChange={(e) => setCustomScenario({ ...customScenario, description: e.target.value })}
              placeholder="Describe your fantasy scenario..."
              className="builder-textarea"
            />
          </div>

          <div className="builder-section">
            <label>Setting</label>
            <div className="options-grid">
              {scenarioSettings.map((setting) => (
                <button
                  key={setting}
                  onClick={() => setCustomScenario({ ...customScenario, setting })}
                  className={`option-button ${customScenario.setting === setting ? 'selected' : ''}`}
                >
                  {setting}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customScenario.setting}
              onChange={(e) => setCustomScenario({ ...customScenario, setting: e.target.value })}
              placeholder="Or create your own setting..."
              className="builder-input"
            />
          </div>

          <div className="builder-section">
            <label>Roles (select multiple)</label>
            <div className="options-grid">
              {scenarioRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => toggleCustomItem(customScenario.roles, role, (roles) => setCustomScenario({ ...customScenario, roles }))}
                  className={`option-button ${customScenario.roles.includes(role) ? 'selected' : ''}`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="selected-items">
              {customScenario.roles.length > 0 && (
                <div>
                  <strong>Selected:</strong> {customScenario.roles.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="builder-section">
            <label>Rules (select multiple)</label>
            <div className="options-grid">
              {scenarioRules.map((rule) => (
                <button
                  key={rule}
                  onClick={() => toggleCustomItem(customScenario.rules, rule, (rules) => setCustomScenario({ ...customScenario, rules }))}
                  className={`option-button ${customScenario.rules.includes(rule) ? 'selected' : ''}`}
                >
                  {rule}
                </button>
              ))}
            </div>
            <div className="selected-items">
              {customScenario.rules.length > 0 && (
                <div>
                  <strong>Selected:</strong> {customScenario.rules.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="builder-preview">
            <h3>Your Custom Scenario</h3>
            <div className="preview-card">
              <h4>{customScenario.title || 'Untitled Scenario'}</h4>
              <p>{customScenario.description || 'No description yet...'}</p>
              
              {customScenario.setting && (
                <div><strong>Setting:</strong> {customScenario.setting}</div>
              )}
              
              {customScenario.roles.length > 0 && (
                <div><strong>Roles:</strong> {customScenario.roles.join(', ')}</div>
              )}
              
              {customScenario.rules.length > 0 && (
                <div><strong>Rules:</strong> {customScenario.rules.join(', ')}</div>
              )}
            </div>
          </div>

          <div className="builder-actions">
            <button onClick={() => setCurrentView('home')} className="secondary-button">
              Back to Scenarios
            </button>
            <button 
              onClick={() => {
                // Here you could save the custom scenario
                alert('Custom scenario created! 🎉\nYou can now enjoy this unique experience together.');
                setCurrentView('home');
              }}
              className="primary-button"
              disabled={!customScenario.title || !customScenario.description}
            >
              Create Scenario
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Main scenarios view
  const categorizedScenarios = {
    romantic: fantasyScenarios.filter(s => s.category === 'romantic'),
    bold: fantasyScenarios.filter(s => s.category === 'bold'),
    creative: fantasyScenarios.filter(s => s.category === 'creative')
  };

  return (
    <main className="fantasy-container">
      <div className="fantasy-header">
        <h1>🔥 Desire & Fantasy</h1>
        <p>Explore intimate scenarios and build your own experiences together</p>
        <button 
          onClick={() => setCurrentView('builder')}
          className="create-fantasy-button"
        >
          ✨ Build Your Fantasy
        </button>
      </div>

      <div className="fantasy-sections">
        <section className="scenario-category">
          <h2>🌹 Romantic & Sensual</h2>
          <p>Sweet, intimate moments that build emotional connection</p>
          <div className="scenarios-grid">
            {categorizedScenarios.romantic.map((scenario) => (
              <div 
                key={scenario.id}
                className="scenario-card"
                style={{ backgroundColor: getCategoryColor(scenario.category) }}
                onClick={() => { setSelectedScenario(scenario); setCurrentView('scenario'); }}
              >
                <div className="scenario-icon">{getCategoryIcon(scenario.category)}</div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="scenario-mood">
                  <strong>Mood:</strong> {scenario.mood}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="scenario-category">
          <h2>🔥 Bold & Erotic</h2>
          <p>Adventurous experiences for deeper intimacy</p>
          <div className="scenarios-grid">
            {categorizedScenarios.bold.map((scenario) => (
              <div 
                key={scenario.id}
                className="scenario-card"
                style={{ backgroundColor: getCategoryColor(scenario.category) }}
                onClick={() => { setSelectedScenario(scenario); setCurrentView('scenario'); }}
              >
                <div className="scenario-icon">{getCategoryIcon(scenario.category)}</div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="scenario-mood">
                  <strong>Mood:</strong> {scenario.mood}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="scenario-category">
          <h2>🎭 Creative & Fantasy</h2>
          <p>Roleplay and imaginative scenarios to explore together</p>
          <div className="scenarios-grid">
            {categorizedScenarios.creative.map((scenario) => (
              <div 
                key={scenario.id}
                className="scenario-card"
                style={{ backgroundColor: getCategoryColor(scenario.category) }}
                onClick={() => { setSelectedScenario(scenario); setCurrentView('scenario'); }}
              >
                <div className="scenario-icon">{getCategoryIcon(scenario.category)}</div>
                <h3>{scenario.title}</h3>
                <p>{scenario.description}</p>
                <div className="scenario-mood">
                  <strong>Mood:</strong> {scenario.mood}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="fantasy-footer">
        <div className="safety-note">
          <h3>💝 Remember</h3>
          <p>All scenarios are meant to be consensual, safe, and enjoyable for both partners. 
             Always communicate openly about boundaries and comfort levels. 
             These are suggestions to inspire your own unique experiences together.</p>
        </div>
      </div>
    </main>
  );
}
