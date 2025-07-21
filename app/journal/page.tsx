import { useState, useEffect } from 'react';
import { storageService, JournalEntry } from '../../src/utils/storage';
import VoiceRecorder from '../../src/components/VoiceRecorder';
import PhotoUpload from '../../src/components/PhotoUpload';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [audioUrls, setAudioUrls] = useState<Map<string, string>>(new Map());
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const loadedEntries = await storageService.getJournalEntries();
      setEntries(loadedEntries);
      
      // Load audio URLs for entries with voice recordings
      const audioUrlsMap = new Map<string, string>();
      const photoUrlsMap = new Map<string, string>();
      
      for (const entry of loadedEntries) {
        if (entry.voiceRecordingUrl) {
          const audioBlob = await storageService.getVoiceRecording(entry.id);
          if (audioBlob) {
            audioUrlsMap.set(entry.id, URL.createObjectURL(audioBlob));
          }
        }
        
        if (entry.photos && entry.photos.length > 0) {
          const entryPhotoUrls: string[] = [];
          for (const photoKey of entry.photos) {
            const photoBlob = await storageService.getPhoto(photoKey);
            if (photoBlob) {
              const photoUrl = URL.createObjectURL(photoBlob);
              entryPhotoUrls.push(photoUrl);
            }
          }
          if (entryPhotoUrls.length > 0) {
            photoUrlsMap.set(entry.id, entryPhotoUrls.join(','));
          }
        }
      }
      
      setAudioUrls(audioUrlsMap);
      setPhotoUrls(photoUrlsMap);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (currentEntry.trim() || selectedPhotos.length > 0) {
      const entryId = `${Date.now()}-${Math.random()}`;
      const newEntry: JournalEntry = {
        id: entryId,
        content: currentEntry,
        timestamp: new Date()
      };
      
      try {
        // Save photos if any
        if (selectedPhotos.length > 0) {
          const photoKeys: string[] = [];
          for (const photo of selectedPhotos) {
            const photoKey = await storageService.savePhoto(photo, entryId);
            photoKeys.push(photoKey);
          }
          newEntry.photos = photoKeys;
          
          // Create photo URLs for immediate display
          const photoUrls = selectedPhotos.map(photo => URL.createObjectURL(photo));
          setPhotoUrls(prev => new Map(prev).set(entryId, photoUrls.join(',')));
        }
        
        await storageService.addJournalEntry(newEntry);
        setEntries([newEntry, ...entries]);
        setCurrentEntry('');
        setSelectedPhotos([]);
        setShowPhotoUpload(false);
      } catch (error) {
        console.error('Error adding journal entry:', error);
        alert('Failed to save entry. Please try again.');
      }
    }
  };

  const handlePhotosSelected = (photos: File[]) => {
    setSelectedPhotos(photos);
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
          <button 
            onClick={handleAddEntry} 
            disabled={!currentEntry.trim() && selectedPhotos.length === 0}
          >
            ✍️ Add Entry
          </button>
          
          <button 
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={showVoiceRecorder ? 'active' : ''}
          >
            🎤 {showVoiceRecorder ? 'Cancel Voice' : 'Voice Note'}
          </button>
          
          <button 
            onClick={() => setShowPhotoUpload(!showPhotoUpload)}
            className={showPhotoUpload ? 'active' : ''}
          >
            📷 {showPhotoUpload ? 'Cancel Photos' : 'Add Photos'}
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
        
        {showPhotoUpload && (
          <div className="photo-upload-section">
            <PhotoUpload 
              onPhotosSelected={handlePhotosSelected}
              maxPhotos={5}
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
                
                {entry.photos && entry.photos.length > 0 && photoUrls.has(entry.id) && (
                  <div className="entry-photos">
                    <span className="photos-label">📷 Photos:</span>
                    <div className="photo-gallery">
                      {photoUrls.get(entry.id)?.split(',').map((photoUrl, index) => (
                        <img 
                          key={index}
                          src={photoUrl} 
                          alt={`Photo ${index + 1}`}
                          className="entry-photo"
                          onClick={() => window.open(photoUrl, '_blank')}
                        />
                      ))}
                    </div>
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
                
                <div className="entry-type">
                  {entry.content && '📝'}
                  {entry.photos && entry.photos.length > 0 && '📷'}
                  {entry.voiceRecordingUrl && '🎤'}
                  {' '}
                  {[
                    entry.content && 'Text',
                    entry.photos && entry.photos.length > 0 && `${entry.photos.length} Photo${entry.photos.length > 1 ? 's' : ''}`,
                    entry.voiceRecordingUrl && 'Voice'
                  ].filter(Boolean).join(' + ')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
