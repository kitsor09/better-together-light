import { useState, useRef, useCallback } from 'react';

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface VoiceRecordingControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
}

export function useVoiceRecording(): VoiceRecordingState & VoiceRecordingControls {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const updateDuration = useCallback(() => {
    if (state.isRecording && !state.isPaused) {
      const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
      setState(prev => ({ ...prev, duration: Math.floor(elapsed / 1000) }));
    }
  }, [state.isRecording, state.isPaused]);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        setState(prev => ({ 
          ...prev, 
          audioBlob, 
          isRecording: false, 
          isPaused: false 
        }));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false, 
        duration: 0,
        audioBlob: null 
      }));

      // Start timer
      timerRef.current = setInterval(updateDuration, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start recording'
      }));
    }
  }, [updateDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      pausedTimeRef.current += Date.now() - startTimeRef.current;
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      startTimeRef.current = Date.now();
    }
  }, [state.isRecording, state.isPaused]);

  const clearRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    }
    
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      error: null,
    });
    
    audioChunksRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [state.isRecording, stopRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  };
}