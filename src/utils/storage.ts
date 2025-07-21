import localforage from 'localforage';

// Configure localforage for better offline support
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: 'BetterTogether',
  version: 1.0,
  storeName: 'app_data',
  description: 'Better Together app offline storage'
});

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: Date;
  voiceRecording?: Blob;
  voiceRecordingUrl?: string;
  photos?: string[]; // Array of photo URLs/keys
  location?: string;
  mood?: string;
  tags?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string;
  type: 'reminder' | 'anniversary' | 'date' | 'cycle' | 'custom';
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderMinutes?: number;
}

export interface CycleData {
  id: string;
  startDate: Date;
  endDate?: Date;
  flow: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string[];
  notes?: string;
}

export interface CycleSettings {
  averageCycleLength: number; // Default 28 days
  averagePeriodLength: number; // Default 5 days
  lastPeriodStart?: Date;
  notifications: {
    periodReminder: boolean;
    ovulationReminder: boolean;
    pmsReminder: boolean;
  };
}

export interface MoonPhase {
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';
  date: Date;
  illumination: number;
}

export interface FantasyTemplate {
  id: string;
  title: string;
  category: 'romantic' | 'adventurous' | 'intimate' | 'playful' | 'sensual';
  setting: string;
  characters: string[];
  scenarios: string[];
  customElements?: string[];
}

export interface GeneratedStory {
  id: string;
  title: string;
  content: string;
  template: FantasyTemplate;
  timestamp: Date;
  rating: number;
  isFavorite: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'text' | 'choice';
  choices?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  category: 'shared' | 'for-him' | 'for-her' | 'fantasy';
  description: string;
  questions: QuizQuestion[];
  isCustom?: boolean;
}

export interface QuizResponse {
  id: string;
  quizId: string;
  questionId: string;
  answer: string;
  timestamp: Date;
  respondent?: 'him' | 'her';
}

export interface QuizSession {
  id: string;
  quizId: string;
  startedAt: Date;
  completedAt?: Date;
  responses: QuizResponse[];
  participants: ('him' | 'her')[];
}

export interface AppSettings {
  pinHash?: string;
  isLocked: boolean;
  theme?: 'light' | 'dark';
  partnerName?: string;
  cycleLength?: number; // Average cycle length in days
  notifications: {
    reminders: boolean;
    cycleTracking: boolean;
    moonPhases: boolean;
  };
}

class StorageService {
  private journalKey = 'journal_entries';
  private settingsKey = 'app_settings';
  private audioKey = 'audio_';
  private photoKey = 'photo_';
  private eventsKey = 'calendar_events';
  private cycleDataKey = 'cycle_data';
  private storiesKey = 'generated_stories';
  private templatesKey = 'fantasy_templates';
  private quizzesKey = 'custom_quizzes';
  private quizSessionsKey = 'quiz_sessions';
  private cycleSettingsKey = 'cycle_settings';

  // Journal operations
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const entries = await localforage.getItem<JournalEntry[]>(this.journalKey);
      return entries || [];
    } catch (error) {
      console.error('Error loading journal entries:', error);
      return [];
    }
  }

  async saveJournalEntries(entries: JournalEntry[]): Promise<void> {
    try {
      await localforage.setItem(this.journalKey, entries);
    } catch (error) {
      console.error('Error saving journal entries:', error);
      throw error;
    }
  }

  async addJournalEntry(entry: JournalEntry): Promise<void> {
    try {
      const entries = await this.getJournalEntries();
      
      // Save voice recording separately if it exists
      if (entry.voiceRecording) {
        const audioKey = `${this.audioKey}${entry.id}`;
        await localforage.setItem(audioKey, entry.voiceRecording);
        // Store reference but not the blob itself in the entry
        entry.voiceRecordingUrl = audioKey;
        delete entry.voiceRecording;
      }
      
      entries.unshift(entry);
      await this.saveJournalEntries(entries);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  }

  async getVoiceRecording(entryId: string): Promise<Blob | null> {
    try {
      const audioKey = `${this.audioKey}${entryId}`;
      return await localforage.getItem<Blob>(audioKey);
    } catch (error) {
      console.error('Error loading voice recording:', error);
      return null;
    }
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await localforage.getItem<AppSettings>(this.settingsKey);
      return settings || { 
        isLocked: false,
        notifications: {
          reminders: true,
          cycleTracking: true,
          moonPhases: true
        }
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { 
        isLocked: false,
        notifications: {
          reminders: true,
          cycleTracking: true,
          moonPhases: true
        }
      };
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await localforage.setItem(this.settingsKey, settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Photo operations
  async savePhoto(photo: Blob, entryId: string): Promise<string> {
    try {
      const photoKey = `${this.photoKey}${entryId}_${Date.now()}`;
      await localforage.setItem(photoKey, photo);
      return photoKey;
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  async getPhoto(photoKey: string): Promise<Blob | null> {
    try {
      return await localforage.getItem<Blob>(photoKey);
    } catch (error) {
      console.error('Error loading photo:', error);
      return null;
    }
  }

  // Calendar operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const events = await localforage.getItem<CalendarEvent[]>(this.eventsKey);
      return events || [];
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return [];
    }
  }

  async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    try {
      await localforage.setItem(this.eventsKey, events);
    } catch (error) {
      console.error('Error saving calendar events:', error);
      throw error;
    }
  }

  async addCalendarEvent(event: CalendarEvent): Promise<void> {
    try {
      const events = await this.getCalendarEvents();
      events.push(event);
      await this.saveCalendarEvents(events);
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  }

  // Cycle tracking operations
  async getCycleData(): Promise<CycleData[]> {
    try {
      const cycles = await localforage.getItem<CycleData[]>(this.cycleDataKey);
      return cycles || [];
    } catch (error) {
      console.error('Error loading cycle data:', error);
      return [];
    }
  }

  async saveCycleData(cycles: CycleData[]): Promise<void> {
    try {
      await localforage.setItem(this.cycleDataKey, cycles);
    } catch (error) {
      console.error('Error saving cycle data:', error);
      throw error;
    }
  }

  async addCycleEntry(cycle: CycleData): Promise<void> {
    try {
      const cycles = await this.getCycleData();
      cycles.unshift(cycle);
      await this.saveCycleData(cycles);
    } catch (error) {
      console.error('Error adding cycle entry:', error);
      throw error;
    }
  }

  // Cycle settings operations
  async getCycleSettings(): Promise<CycleSettings> {
    try {
      const settings = await localforage.getItem<CycleSettings>(this.cycleSettingsKey);
      return settings || {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        notifications: {
          periodReminder: true,
          ovulationReminder: true,
          pmsReminder: true
        }
      };
    } catch (error) {
      console.error('Error loading cycle settings:', error);
      return {
        averageCycleLength: 28,
        averagePeriodLength: 5,
        notifications: {
          periodReminder: true,
          ovulationReminder: true,
          pmsReminder: true
        }
      };
    }
  }

  async saveCycleSettings(settings: CycleSettings): Promise<void> {
    try {
      await localforage.setItem(this.cycleSettingsKey, settings);
    } catch (error) {
      console.error('Error saving cycle settings:', error);
      throw error;
    }
  }

  // Fantasy story operations
  async getGeneratedStories(): Promise<GeneratedStory[]> {
    try {
      const stories = await localforage.getItem<GeneratedStory[]>(this.storiesKey);
      return stories || [];
    } catch (error) {
      console.error('Error loading generated stories:', error);
      return [];
    }
  }

  async saveGeneratedStories(stories: GeneratedStory[]): Promise<void> {
    try {
      await localforage.setItem(this.storiesKey, stories);
    } catch (error) {
      console.error('Error saving generated stories:', error);
      throw error;
    }
  }

  async addGeneratedStory(story: GeneratedStory): Promise<void> {
    try {
      const stories = await this.getGeneratedStories();
      stories.unshift(story);
      await this.saveGeneratedStories(stories);
    } catch (error) {
      console.error('Error adding generated story:', error);
      throw error;
    }
  }

  async getFantasyTemplates(): Promise<FantasyTemplate[]> {
    try {
      const templates = await localforage.getItem<FantasyTemplate[]>(this.templatesKey);
      return templates || this.getDefaultTemplates();
    } catch (error) {
      console.error('Error loading fantasy templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): FantasyTemplate[] {
    return [
      {
        id: 'romantic-evening',
        title: 'Romantic Evening',
        category: 'romantic',
        setting: 'Candlelit dinner at home',
        characters: ['You', 'Your partner'],
        scenarios: ['Cooking together', 'Dancing in the kitchen', 'Sharing memories', 'Planning dreams']
      },
      {
        id: 'adventure-getaway',
        title: 'Adventure Getaway',
        category: 'adventurous',
        setting: 'Mountain cabin retreat',
        characters: ['You', 'Your partner'],
        scenarios: ['Hiking together', 'Stargazing', 'Hot tub under stars', 'Cozy fireplace']
      },
      {
        id: 'intimate-massage',
        title: 'Intimate Massage',
        category: 'intimate',
        setting: 'Bedroom with soft lighting',
        characters: ['You', 'Your partner'],
        scenarios: ['Preparing oils', 'Gentle massage', 'Relaxation', 'Connection']
      }
    ];
  }

  // Quiz operations
  async getCustomQuizzes(): Promise<Quiz[]> {
    try {
      const quizzes = await localforage.getItem<Quiz[]>(this.quizzesKey);
      return quizzes || [];
    } catch (error) {
      console.error('Error loading custom quizzes:', error);
      return [];
    }
  }

  async saveCustomQuizzes(quizzes: Quiz[]): Promise<void> {
    try {
      await localforage.setItem(this.quizzesKey, quizzes);
    } catch (error) {
      console.error('Error saving custom quizzes:', error);
      throw error;
    }
  }

  async addCustomQuiz(quiz: Quiz): Promise<void> {
    try {
      const quizzes = await this.getCustomQuizzes();
      quizzes.unshift(quiz);
      await this.saveCustomQuizzes(quizzes);
    } catch (error) {
      console.error('Error adding custom quiz:', error);
      throw error;
    }
  }

  async getQuizSessions(): Promise<QuizSession[]> {
    try {
      const sessions = await localforage.getItem<QuizSession[]>(this.quizSessionsKey);
      return sessions || [];
    } catch (error) {
      console.error('Error loading quiz sessions:', error);
      return [];
    }
  }

  async saveQuizSession(session: QuizSession): Promise<void> {
    try {
      const sessions = await this.getQuizSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }
      
      await localforage.setItem(this.quizSessionsKey, sessions);
    } catch (error) {
      console.error('Error saving quiz session:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();