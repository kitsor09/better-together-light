import { useState, useEffect } from 'react';
import { storageService, JournalEntry } from '../../src/utils/storage';
import VoiceRecorder from '../../src/components/VoiceRecorder';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [audioUrls, setAudioUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const loadedEntries = await storageService.getJournalEntries();
      setEntries(loadedEntries);
      
      // Load audio URLs for entries with voice recordings
      const urls = new Map<string, string>();
      for (const entry of loadedEntries) {
        if (entry.voiceRecordingUrl) {
          const audioBlob = await storageService.getVoiceRecording(entry.id);
          if (audioBlob) {
            urls.set(entry.id, URL.createObjectURL(audioBlob));
          }
        }
      }
      setAudioUrls(urls);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (currentEntry.trim()) {
      const newEntry: JournalEntry = {
        id: `${Date.now()}-${Math.random()}`,
        content: currentEntry,
        timestamp: new Date()
      };
      
      try {
        await storageService.addJournalEntry(newEntry);
        setEntries([newEntry, ...entries]);
        setCurrentEntry('');
      } catch (error) {
        console.error('Error adding journal entry:', error);
        alert('Failed to save entry. Please try again.');
      }
    }
  };

  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    const newEntry: JournalEntry = {
      id: `${Date.now()}-${Math.random()}`,
      content: '', // Voice-only entry
      timestamp: new Date(),
      voiceRecording: audioBlob
    };
    
    try {
      await storageService.addJournalEntry(newEntry);
      
      // Create audio URL for immediate playback
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrls(prev => new Map(prev).set(newEntry.id, audioUrl));
      
      setEntries([newEntry, ...entries]);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Error adding voice entry:', error);
      alert('Failed to save voice recording. Please try again.');
    }
  };

  const handleVoiceRecordingClear = () => {
    setShowVoiceRecorder(false);
  };

  if (isLoading) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>📓 Journal</h1>
        <p>Loading your entries...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📓 Journal</h1>
      <p>Write your thoughts, voice notes, or reflections here.</p>
      
      <div className="journal-input-section">
        <textarea
          value={currentEntry}
          onChange={e => setCurrentEntry(e.target.value)}
          placeholder="Write something..."
          style={{ width: '100%', minHeight: '100px', marginBottom: '1rem' }}
        />
        
        <div className="journal-buttons">
          <button onClick={handleAddEntry} disabled={!currentEntry.trim()}>
            ✍️ Add Text Entry
          </button>
          
          <button 
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={showVoiceRecorder ? 'active' : ''}
          >
            🎤 {showVoiceRecorder ? 'Cancel Voice' : 'Add Voice Note'}
          </button>
        </div>
        
        {showVoiceRecorder && (
          <div className="voice-recorder-section">
            <VoiceRecorder 
              onRecordingComplete={handleVoiceRecordingComplete}
              onRecordingClear={handleVoiceRecordingClear}
            />
          </div>
        )}
      </div>

      <div className="entries-section">
        <h3>Your Entries ({entries.length})</h3>
        
        {entries.length === 0 ? (
          <p className="empty-state">
            No entries yet. Start by writing something or recording a voice note! 💝
          </p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id} className="journal-entry">
                <div className="entry-timestamp">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
                
                {entry.content && (
                  <div className="entry-content">
                    {entry.content}
                  </div>
                )}
                
                {entry.voiceRecordingUrl && audioUrls.has(entry.id) && (
                  <div className="entry-audio">
                    <span className="audio-label">🎤 Voice Note:</span>
                    <audio controls src={audioUrls.get(entry.id)} preload="metadata">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {entry.voiceRecordingUrl && entry.content && (
                  <div className="entry-type">📝🎤 Text + Voice</div>
                )}
                {entry.voiceRecordingUrl && !entry.content && (
                  <div className="entry-type">🎤 Voice Only</div>
                )}
                {!entry.voiceRecordingUrl && entry.content && (
                  <div className="entry-type">📝 Text Only</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
