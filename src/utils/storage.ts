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
}

export interface AppSettings {
  pinHash?: string;
  isLocked: boolean;
  theme?: 'light' | 'dark';
}

class StorageService {
  private journalKey = 'journal_entries';
  private settingsKey = 'app_settings';
  private audioKey = 'audio_';

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
      return settings || { isLocked: false };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { isLocked: false };
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