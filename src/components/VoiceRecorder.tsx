import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRecordingClear: () => void;
}

export default function VoiceRecorder({ onRecordingComplete, onRecordingClear }: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useVoiceRecording();

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleClearRecording = () => {
    clearRecording();
    onRecordingClear();
  };

  const handleSaveRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      clearRecording();
    }
  };

  if (error) {
    return (
      <div className="voice-recorder error">
        <p className="error-message">🎤 {error}</p>
        <p className="error-help">
          Please make sure your browser has microphone permission and try again.
        </p>
        <button onClick={clearRecording} className="secondary-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      <div className="recording-controls">
        {!isRecording && !audioBlob && (
          <button onClick={startRecording} className="record-button">
            <span className="record-icon">🎤</span>
            Start Recording
          </button>
        )}

        {isRecording && (
          <div className="recording-active">
            <div className="recording-status">
              <div className={`recording-indicator ${isPaused ? 'paused' : 'active'}`}>
                <span className="pulse-dot"></span>
                {isPaused ? 'Paused' : 'Recording'}
              </div>
              <div className="duration">{formatDuration(duration)}</div>
            </div>
            
            <div className="recording-buttons">
              {!isPaused ? (
                <button onClick={pauseRecording} className="pause-button">
                  ⏸️ Pause
                </button>
              ) : (
                <button onClick={resumeRecording} className="resume-button">
                  ▶️ Resume
                </button>
              )}
              
              <button onClick={handleStopRecording} className="stop-button">
                ⏹️ Stop
              </button>
            </div>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="recording-complete">
            <div className="recording-info">
              <span className="checkmark">✅</span>
              <span>Recording complete ({formatDuration(duration)})</span>
            </div>
            
            <audio controls src={URL.createObjectURL(audioBlob)} className="audio-preview">
              Your browser does not support the audio element.
            </audio>
            
            <div className="recording-actions">
              <button onClick={handleSaveRecording} className="primary-button">
                💾 Add to Journal
              </button>
              
              <button onClick={handleClearRecording} className="secondary-button">
                🗑️ Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}